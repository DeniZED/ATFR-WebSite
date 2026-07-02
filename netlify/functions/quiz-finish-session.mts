import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MODULE_SLUG = 'guide-bots';

interface ResultEntry {
  question_id: string;
  answer_id: string | null;
  is_correct: boolean;
  correct_answer_id: string | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Finalise une session quiz : compte les bonnes réponses serveur-vérifiées,
 * pousse le score dans module_scores, met à jour la ligne d'analytics
 * quiz_sessions et marque la session comme terminée. Idempotent : un retry
 * après succès renvoie {ok:true, already_finished:true} sans dupliquer le
 * score.
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
    console.error('[quiz-finish-session] Supabase service role not configured');
    return json({ error: 'Server configuration error' }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: session, error: sessionError } = await supabase
    .from('quiz_game_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error('[quiz-finish-session] session fetch error:', sessionError.message);
    return json({ error: 'Failed to load session' }, 500);
  }
  if (!session) return json({ error: 'Session not found' }, 404);

  // Idempotent: a retry of an already-finished session is a no-op success,
  // not an error — avoids duplicate module_scores rows on client retry.
  if (session.status === 'finished') {
    return json({ ok: true, already_finished: true });
  }

  if (session.current_index < session.question_target) {
    return json({ error: 'Session not complete' }, 409);
  }

  const results = (session.results ?? []) as ResultEntry[];
  const score = results.filter((r) => r.is_correct).length;

  const { error: scoreError } = await supabase.from('module_scores').insert({
    module_slug: MODULE_SLUG,
    submode: session.category_id ? `cat:${session.category_id}` : 'default',
    score,
    max_score: session.question_target,
    player_anon_id: session.player_anon_id,
    player_nickname: session.player_nickname,
    player_account_id: session.player_account_id,
    is_verified: session.player_account_id !== null,
    meta: { mode: session.mode },
  });

  // Best-effort, comme l'ancien flux client : un conflit d'insertion ne doit
  // pas empêcher de clôturer la session — la partie a bien été jouée.
  if (scoreError) {
    console.error('[quiz-finish-session] module_scores insert error:', scoreError.message);
  }

  // Analytics admin (best-effort).
  if (session.analytics_session_id) {
    const { error: analyticsError } = await supabase
      .from('quiz_sessions')
      .update({ score, finished_at: new Date().toISOString() })
      .eq('id', session.analytics_session_id);
    if (analyticsError) {
      console.error('[quiz-finish-session] analytics update error:', analyticsError.message);
    }
  }

  const { error: updateError } = await supabase
    .from('quiz_game_sessions')
    .update({ status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'in_progress');

  if (updateError) {
    console.error('[quiz-finish-session] update error:', updateError.message);
    return json({ error: 'Failed to finalize session' }, 500);
  }

  return json({ ok: true, already_finished: false, score, max_score: session.question_target });
};
