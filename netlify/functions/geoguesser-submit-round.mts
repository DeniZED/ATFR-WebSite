import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import {
  diagonalM,
  getSprintTimePenalty,
  realDistanceM,
  roundScore,
  type GameMode,
} from './_geoguesser-scoring.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SessionSettings {
  round_time_s: number;
  wrong_map_malus_m: number;
  timeout_malus_m: number;
  round_time_limit_s: number;
  sprint_time_penalty_m: number;
  blind_preview_seconds: number;
  random_rounds: number;
  sprint_rounds: number;
  blind_rounds: number;
  daily_rounds: number;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function clamp01(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(1, value));
}

/**
 * Soumet une manche d'une session GeoGuesser en cours. Recalcule le score
 * côté serveur à partir des coordonnées réelles du shot (jamais envoyées au
 * client avant cet appel) et du temps réellement écoulé (horodatage
 * serveur), puis révèle la position correcte dans la réponse.
 */
export default async (req: Request, _ctx: Context): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const ct = req.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return json({ error: 'Content-Type must be application/json' }, 415);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const b = body as Record<string, unknown>;

  const sessionId = typeof b.session_id === 'string' && UUID_RE.test(b.session_id) ? b.session_id : null;
  const shotId = typeof b.shot_id === 'string' && UUID_RE.test(b.shot_id) ? b.shot_id : null;
  const selectedMapId =
    typeof b.selected_map_id === 'string' && b.selected_map_id.length > 0 && b.selected_map_id.length <= 128
      ? b.selected_map_id
      : null;
  const pickX = clamp01(b.pick_x);
  const pickY = clamp01(b.pick_y);

  if (!sessionId || !shotId) {
    return json({ error: 'Missing or invalid required fields' }, 400);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[geoguesser-submit-round] Supabase service role not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: session, error: sessionError } = await supabase
    .from('geoguesser_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error('[geoguesser-submit-round] session fetch error:', sessionError.message);
    return json({ error: 'Failed to load session' }, 500);
  }
  if (!session) return json({ error: 'Session not found' }, 404);
  if (session.status !== 'in_progress') return json({ error: 'Session already finished' }, 409);
  if (session.current_round >= session.shot_ids.length) {
    return json({ error: 'No more rounds in this session' }, 409);
  }
  if (session.shot_ids[session.current_round] !== shotId) {
    return json({ error: 'Round/shot mismatch' }, 409);
  }

  const settings = session.settings as SessionSettings;

  const { data: shot, error: shotError } = await supabase
    .from('geoguesser_shots')
    .select('id, map_id, x_pct, y_pct, map:wot_maps(width_m, height_m, size_m)')
    .eq('id', shotId)
    .single();

  if (shotError || !shot) {
    console.error('[geoguesser-submit-round] shot fetch error:', shotError?.message);
    return json({ error: 'Shot not found' }, 500);
  }

  const map = Array.isArray(shot.map) ? shot.map[0] : shot.map;
  const widthM = map?.width_m ?? map?.size_m ?? 1000;
  const heightM = map?.height_m ?? map?.size_m ?? 1000;

  const correctMap = selectedMapId !== null && selectedMapId === shot.map_id;
  const hasPick = pickX !== null && pickY !== null;

  let d: number | null = null;
  if (correctMap && hasPick) {
    d = realDistanceM({ x: pickX, y: pickY }, { x: shot.x_pct, y: shot.y_pct }, widthM, heightM);
  }

  const r = roundScore({
    correctMap,
    hasPick,
    distanceM: d ?? 0,
    settings: {
      wrongMapMalusM: settings.wrong_map_malus_m,
      timeoutMalusM: settings.timeout_malus_m,
    },
  });

  const roundStartedAtMs = new Date(session.round_started_at as string).getTime();
  const elapsedSeconds = Math.max(
    0,
    Math.min(settings.round_time_limit_s, (Date.now() - roundStartedAtMs) / 1000),
  );
  const timePenalty = getSprintTimePenalty(
    session.mode as GameMode,
    r.kind,
    elapsedSeconds,
    settings.sprint_time_penalty_m,
  );
  const totalScore = r.score + timePenalty;

  const resultEntry = {
    shot_id: shot.id,
    map_id: shot.map_id,
    selected_map_id: selectedMapId,
    correct_map: correctMap,
    distance_m: d !== null ? Math.round(d) : null,
    score: totalScore,
    base_score: r.score,
    time_penalty: timePenalty,
    elapsed_seconds: Math.round(elapsedSeconds),
    kind: r.kind,
  };

  const newResults = [...(session.results as unknown[]), resultEntry];
  const newCurrentRound = session.current_round + 1;
  const nowIso = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('geoguesser_sessions')
    .update({ results: newResults, current_round: newCurrentRound, round_started_at: nowIso })
    .eq('id', sessionId)
    .eq('current_round', session.current_round)
    .select('round_started_at')
    .maybeSingle();

  if (updateError) {
    console.error('[geoguesser-submit-round] update error:', updateError.message);
    return json({ error: 'Failed to save round' }, 500);
  }
  if (!updated) {
    // Another request already advanced this session's round (race/replay).
    return json({ error: 'Round already submitted' }, 409);
  }

  // Difficulté adaptative — mêmes modes que côté client (daily/random
  // uniquement) ; meilleur effort, n'affecte jamais le score du joueur.
  if (session.mode === 'daily' || session.mode === 'random') {
    const maxRound = diagonalM(widthM, heightM);
    const perf = Math.max(0, Math.round(maxRound - (d ?? maxRound)));
    const { error: rpcError } = await supabase.rpc('record_shot_attempt', {
      p_shot_id: shot.id,
      p_correct_map: correctMap,
      p_round_score: perf,
      p_max_round_score: Math.round(maxRound),
    });
    if (rpcError) {
      console.error('[geoguesser-submit-round] record_shot_attempt error:', rpcError.message);
    }
  }

  return json({
    shot_id: shot.id,
    map_id: shot.map_id,
    x_pct: shot.x_pct,
    y_pct: shot.y_pct,
    correct_map: correctMap,
    distance_m: resultEntry.distance_m,
    score: totalScore,
    base_score: r.score,
    time_penalty: timePenalty,
    elapsed_seconds: resultEntry.elapsed_seconds,
    kind: r.kind,
    current_round: newCurrentRound,
    round_target: session.round_target,
    round_started_at: updated.round_started_at,
  });
};
