import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getLeaderboardSubmode, getWorstTotalForMode, type GameMode } from './_geoguesser-scoring.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODULE_SLUG = 'wot-geoguesser';

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

interface RoundResultEntry {
  shot_id: string;
  map_id: string;
  selected_map_id: string | null;
  correct_map: boolean;
  distance_m: number | null;
  score: number;
  base_score: number;
  time_penalty: number;
  elapsed_seconds: number;
  kind: 'distance' | 'wrong-map' | 'timeout';
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Finalise une session GeoGuesser : agrège les manches serveur-autoritaires,
 * pousse le score dans module_scores (sauf training_mode), marque la
 * session comme terminée. Idempotent : un retry après succès renvoie
 * {ok:true, already_finished:true} sans dupliquer le score.
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
  if (!sessionId) return json({ error: 'Missing or invalid session_id' }, 400);

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[geoguesser-finish-session] Supabase service role not configured');
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
    console.error('[geoguesser-finish-session] session fetch error:', sessionError.message);
    return json({ error: 'Failed to load session' }, 500);
  }
  if (!session) return json({ error: 'Session not found' }, 404);

  // Idempotent: a retry of an already-finished session is a no-op success,
  // not an error — avoids duplicate module_scores rows on client retry.
  if (session.status === 'finished') {
    return json({ ok: true, already_finished: true });
  }

  if (session.current_round < session.round_target) {
    return json({ error: 'Session not complete' }, 409);
  }

  const results = (session.results ?? []) as RoundResultEntry[];
  const settings = session.settings as SessionSettings;
  const mode = session.mode as GameMode;
  const rounds = results.length;

  let correctMaps = 0;
  let wrongMaps = 0;
  let timeouts = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let finalScore = 0;
  let finalBaseScore = 0;
  let finalTimePenalty = 0;
  let finalElapsedSeconds = 0;

  for (const r of results) {
    if (r.correct_map) {
      correctMaps += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    if (r.kind === 'wrong-map') wrongMaps += 1;
    if (r.kind === 'timeout') timeouts += 1;
    finalScore += r.score;
    finalBaseScore += r.base_score;
    finalTimePenalty += r.time_penalty;
    finalElapsedSeconds += r.elapsed_seconds;
  }

  const mapAccuracyPct = rounds > 0 ? Math.round((correctMaps / rounds) * 100) : 0;

  const worst = Math.max(
    1,
    getWorstTotalForMode(
      mode,
      rounds,
      { wrongMapMalusM: settings.wrong_map_malus_m, timeoutMalusM: settings.timeout_malus_m },
      settings.round_time_limit_s,
      settings.sprint_time_penalty_m,
    ),
  );

  if (!session.training_mode) {
    const submode = getLeaderboardSubmode(
      mode,
      session.difficulty,
      session.daily_key ?? '',
      settings.daily_rounds,
      {
        randomRounds: settings.random_rounds,
        sprintRounds: settings.sprint_rounds,
        blindRounds: settings.blind_rounds,
      },
    );

    const { error: scoreError } = await supabase.from('module_scores').insert({
      module_slug: MODULE_SLUG,
      submode,
      score: Math.max(0, worst - finalScore),
      max_score: worst,
      player_anon_id: session.player_anon_id,
      player_nickname: session.player_nickname,
      player_account_id: session.player_account_id,
      is_verified: session.player_account_id !== null,
      meta: {
        mode: mode === 'sprint' ? 'distance_time' : 'distance',
        game_mode: mode,
        daily_key: mode === 'daily' ? session.daily_key : null,
        daily_rounds: mode === 'daily' ? settings.daily_rounds : null,
        rounds,
        difficulty: session.difficulty,
        distance_m: finalScore,
        raw_distance_m: finalBaseScore,
        time_penalty_m: finalTimePenalty,
        elapsed_seconds: finalElapsedSeconds,
        avg_distance_m: rounds > 0 ? finalScore / rounds : 0,
        map_accuracy_pct: mapAccuracyPct,
        correct_maps: correctMaps,
        wrong_maps: wrongMaps,
        timeouts,
        best_streak: bestStreak,
      },
    });

    // Best-effort, comme l'ancien flux client : un conflit (score anon déjà
    // soumis aujourd'hui pour ce submode) ne doit pas empêcher de clôturer
    // la session — la partie a bien été jouée.
    if (scoreError) {
      console.error('[geoguesser-finish-session] module_scores insert error:', scoreError.message);
    }
  }

  const { error: updateError } = await supabase
    .from('geoguesser_sessions')
    .update({ status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'in_progress');

  if (updateError) {
    console.error('[geoguesser-finish-session] update error:', updateError.message);
    return json({ error: 'Failed to finalize session' }, 500);
  }

  return json({ ok: true, already_finished: false });
};
