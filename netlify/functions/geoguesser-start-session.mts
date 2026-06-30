import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { verifyPlayerToken } from './_player-token.js';
import {
  type DifficultyFilter,
  type GameMode,
  type GeoSettingsRow,
  createSeededRandom,
  getDailyChallengeKey,
  getMinMapRequirement,
  getModeSettings,
  getRoundTargetForMode,
  getRoundTimeLimit,
  pickPool,
  sortShotsStable,
} from './_geoguesser-scoring.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODES: GameMode[] = ['daily', 'random', 'sprint', 'blind'];
const DIFFICULTIES: DifficultyFilter[] = ['all', 'easy', 'medium', 'hard', 'expert'];

// Mirrors src/features/geoguesser/queries.ts DEFAULT_GEO_SETTINGS — used only
// if the geoguesser_settings row is somehow missing.
const DEFAULT_SETTINGS: GeoSettingsRow = {
  round_time_s: 45,
  wrong_map_malus_m: 2000,
  timeout_malus_m: 2000,
  daily_challenge_rounds: 5,
  random_rounds: 5,
  sprint_rounds: 10,
  sprint_round_time_s: 20,
  sprint_time_penalty_m: 12,
  blind_rounds: 5,
  blind_preview_seconds: 5,
  min_maps_daily: 5,
  min_maps_random: 5,
  min_maps_sprint: 10,
  min_maps_blind: 5,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Démarre une partie GeoGuesser côté serveur : tire le pool de manches,
 * fige les réglages, et crée une session. Ne renvoie jamais de coordonnées
 * (x_pct/y_pct) — celles-ci ne sont révélées qu'après soumission d'une
 * manche via geoguesser-submit-round.
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

  const mode = typeof b.mode === 'string' && (MODES as string[]).includes(b.mode) ? (b.mode as GameMode) : null;
  const difficulty =
    typeof b.difficulty === 'string' && (DIFFICULTIES as string[]).includes(b.difficulty)
      ? (b.difficulty as DifficultyFilter)
      : null;
  const trainingMode = b.training_mode === true;
  const playerAnonId =
    typeof b.player_anon_id === 'string' && UUID_RE.test(b.player_anon_id) ? b.player_anon_id : null;
  const playerNickname =
    typeof b.player_nickname === 'string' ? b.player_nickname.trim().slice(0, 32) : null;
  const playerToken =
    typeof b.player_token === 'string' && b.player_token.length < 512 ? b.player_token : null;

  if (!mode || !difficulty || !playerAnonId || !playerNickname) {
    return json({ error: 'Missing or invalid required fields' }, 400);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[geoguesser-start-session] Supabase service role not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  let verifiedAccountId: number | null = null;
  if (playerToken !== null) {
    verifiedAccountId = verifyPlayerToken(playerToken);
    if (verifiedAccountId === null) {
      return json({ error: 'Invalid or expired player token' }, 401);
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: settingsRow } = await supabase
    .from('geoguesser_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  const settings: GeoSettingsRow = settingsRow ?? DEFAULT_SETTINGS;
  const modeSettings = getModeSettings(settings);
  const roundTarget = getRoundTargetForMode(mode, modeSettings);
  const minMapRequirement = getMinMapRequirement(mode, modeSettings);
  const roundTimeLimitS = getRoundTimeLimit(mode, settings.round_time_s, modeSettings);
  const dailyKey = mode === 'daily' ? getDailyChallengeKey() : null;

  let shotsQuery = supabase
    .from('geoguesser_shots_public')
    .select('id, map_id, image_url, difficulty, caption, tags');
  if (difficulty !== 'all') shotsQuery = shotsQuery.eq('difficulty', difficulty);
  const { data: shots, error: shotsError } = await shotsQuery;
  if (shotsError) {
    console.error('[geoguesser-start-session] shots fetch error:', shotsError.message);
    return json({ error: 'Failed to load shots' }, 500);
  }

  const mapCount = new Set((shots ?? []).map((s) => s.map_id)).size;
  if (mapCount < minMapRequirement || !shots || shots.length === 0) {
    return json({ error: 'Not enough maps/shots available for this mode' }, 400);
  }

  const pool =
    mode === 'daily'
      ? pickPool(
          sortShotsStable(shots),
          roundTarget,
          createSeededRandom(`${dailyKey}:${difficulty}:${roundTarget}`),
        )
      : pickPool(shots, roundTarget);

  if (pool.length === 0) {
    return json({ error: 'No shots available' }, 400);
  }

  const sessionSettings = {
    round_time_s: settings.round_time_s,
    wrong_map_malus_m: settings.wrong_map_malus_m,
    timeout_malus_m: settings.timeout_malus_m,
    round_time_limit_s: roundTimeLimitS,
    sprint_time_penalty_m: settings.sprint_time_penalty_m,
    blind_preview_seconds: Math.min(settings.blind_preview_seconds, roundTimeLimitS),
    random_rounds: modeSettings.randomRounds,
    sprint_rounds: modeSettings.sprintRounds,
    blind_rounds: modeSettings.blindRounds,
    daily_rounds: modeSettings.dailyRounds,
  };

  const { data: session, error: insertError } = await supabase
    .from('geoguesser_sessions')
    .insert({
      mode,
      difficulty,
      training_mode: trainingMode,
      player_anon_id: playerAnonId,
      player_nickname: playerNickname,
      player_account_id: verifiedAccountId,
      daily_key: dailyKey,
      shot_ids: pool.map((s) => s.id),
      round_target: pool.length,
      settings: sessionSettings,
      results: [],
      current_round: 0,
    })
    .select('id, round_started_at')
    .single();

  if (insertError || !session) {
    console.error('[geoguesser-start-session] insert error:', insertError?.message);
    return json({ error: 'Failed to create session' }, 500);
  }

  return json({
    session_id: session.id,
    pool: pool.map((s) => ({
      id: s.id,
      map_id: s.map_id,
      image_url: s.image_url,
      difficulty: s.difficulty,
      caption: s.caption,
      tags: s.tags,
    })),
    round_target: pool.length,
    round_time_limit_s: roundTimeLimitS,
    blind_preview_seconds: sessionSettings.blind_preview_seconds,
    daily_key: dailyKey,
    round_started_at: session.round_started_at,
  });
};
