import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { verifyPlayerToken } from './_player-token.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODES = ['random', 'ordered'] as const;
type QuizOrderMode = (typeof MODES)[number];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Démarre une partie du quiz "Guide pour les bots" côté serveur : tire
 * l'ordre des questions publiées, crée la session serveur-autoritaire et la
 * ligne d'analytics quiz_sessions. Ne renvoie jamais is_correct — la bonne
 * réponse n'est révélée qu'après soumission via quiz-submit-answer.
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

  const mode = typeof b.mode === 'string' && (MODES as readonly string[]).includes(b.mode) ? (b.mode as QuizOrderMode) : null;
  const categoryId =
    typeof b.category_id === 'string' && UUID_RE.test(b.category_id) ? b.category_id : null;
  const playerAnonId =
    typeof b.player_anon_id === 'string' && UUID_RE.test(b.player_anon_id) ? b.player_anon_id : null;
  const playerNickname =
    typeof b.player_nickname === 'string' ? b.player_nickname.trim().slice(0, 32) : null;
  const playerToken =
    typeof b.player_token === 'string' && b.player_token.length < 512 ? b.player_token : null;

  if (!mode || !playerAnonId || !playerNickname) {
    return json({ error: 'Missing or invalid required fields' }, 400);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[quiz-start-session] Supabase service role not configured');
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

  let questionsQuery = supabase
    .from('quiz_questions')
    .select('id, sort_order')
    .eq('is_published', true);
  if (categoryId) questionsQuery = questionsQuery.eq('category_id', categoryId);
  const { data: questions, error: questionsError } = await questionsQuery;

  if (questionsError) {
    console.error('[quiz-start-session] questions fetch error:', questionsError.message);
    return json({ error: 'Failed to load questions' }, 500);
  }
  if (!questions || questions.length === 0) {
    return json({ error: 'No questions available' }, 400);
  }

  // Même logique d'ordre que l'ancien client : shuffle pour 'random',
  // sort_order éditorial (id en départage stable) pour 'ordered'.
  const ordered = [...questions];
  if (mode === 'ordered') {
    ordered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id.localeCompare(b.id);
    });
  } else {
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }
  }
  const questionIds = ordered.map((q) => q.id);

  // Ligne d'analytics admin (best-effort) — mêmes valeurs que l'ancien flux
  // client : mode 'category' si une catégorie est filtrée, sinon 'test'.
  let analyticsSessionId: string | null = null;
  const { data: analyticsRow, error: analyticsError } = await supabase
    .from('quiz_sessions')
    .insert({
      mode: categoryId ? 'category' : 'test',
      category_id: categoryId,
      total: questionIds.length,
    })
    .select('id')
    .single();
  if (analyticsError) {
    console.error('[quiz-start-session] analytics insert error:', analyticsError.message);
  } else {
    analyticsSessionId = analyticsRow.id;
  }

  const { data: session, error: insertError } = await supabase
    .from('quiz_game_sessions')
    .insert({
      mode,
      category_id: categoryId,
      player_anon_id: playerAnonId,
      player_nickname: playerNickname,
      player_account_id: verifiedAccountId,
      question_ids: questionIds,
      question_target: questionIds.length,
      analytics_session_id: analyticsSessionId,
      results: [],
      current_index: 0,
    })
    .select('id')
    .single();

  if (insertError || !session) {
    console.error('[quiz-start-session] insert error:', insertError?.message);
    return json({ error: 'Failed to create session' }, 500);
  }

  return json({
    session_id: session.id,
    question_ids: questionIds,
    question_target: questionIds.length,
  });
};
