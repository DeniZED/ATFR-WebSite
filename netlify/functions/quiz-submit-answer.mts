import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
 * Soumet la réponse à la question courante d'une session quiz. Vérifie
 * is_correct côté serveur (jamais exposé au client avant cet appel),
 * verrouillage optimiste anti-rejeu sur current_index, alimente les
 * analytics quiz_session_answers avec des données vérifiées, puis révèle
 * la bonne réponse dans la réponse HTTP.
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
  const questionId = typeof b.question_id === 'string' && UUID_RE.test(b.question_id) ? b.question_id : null;
  const answerId = typeof b.answer_id === 'string' && UUID_RE.test(b.answer_id) ? b.answer_id : null;

  if (!sessionId || !questionId) {
    return json({ error: 'Missing or invalid required fields' }, 400);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[quiz-submit-answer] Supabase service role not configured');
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
    console.error('[quiz-submit-answer] session fetch error:', sessionError.message);
    return json({ error: 'Failed to load session' }, 500);
  }
  if (!session) return json({ error: 'Session not found' }, 404);
  if (session.status !== 'in_progress') return json({ error: 'Session already finished' }, 409);
  if (session.current_index >= session.question_ids.length) {
    return json({ error: 'No more questions in this session' }, 409);
  }
  if (session.question_ids[session.current_index] !== questionId) {
    return json({ error: 'Question/index mismatch' }, 409);
  }

  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select('id, is_correct')
    .eq('question_id', questionId);

  if (answersError || !answers) {
    console.error('[quiz-submit-answer] answers fetch error:', answersError?.message);
    return json({ error: 'Failed to load answers' }, 500);
  }
  if (answerId !== null && !answers.some((a) => a.id === answerId)) {
    return json({ error: 'Answer does not belong to this question' }, 400);
  }

  const correctAnswerId = answers.find((a) => a.is_correct)?.id ?? null;
  const isCorrect = answerId !== null && answerId === correctAnswerId;

  const resultEntry: ResultEntry = {
    question_id: questionId,
    answer_id: answerId,
    is_correct: isCorrect,
    correct_answer_id: correctAnswerId,
  };

  const newResults = [...(session.results as unknown[]), resultEntry];
  const newCurrentIndex = session.current_index + 1;

  const { data: updated, error: updateError } = await supabase
    .from('quiz_game_sessions')
    .update({ results: newResults, current_index: newCurrentIndex })
    .eq('id', sessionId)
    .eq('current_index', session.current_index)
    .select('current_index')
    .maybeSingle();

  if (updateError) {
    console.error('[quiz-submit-answer] update error:', updateError.message);
    return json({ error: 'Failed to save answer' }, 500);
  }
  if (!updated) {
    // Another request already advanced this session's index (race/replay).
    return json({ error: 'Answer already submitted' }, 409);
  }

  // Analytics (best-effort) : alimente quiz_session_answers et le trigger
  // tally_quiz_answer avec un is_correct vérifié serveur.
  if (session.analytics_session_id) {
    const { error: logError } = await supabase.from('quiz_session_answers').insert({
      session_id: session.analytics_session_id,
      question_id: questionId,
      answer_id: answerId,
      is_correct: isCorrect,
    });
    if (logError) {
      console.error('[quiz-submit-answer] analytics insert error:', logError.message);
    }
  }

  return json({
    question_id: questionId,
    answer_id: answerId,
    is_correct: isCorrect,
    correct_answer_id: correctAnswerId,
    current_index: newCurrentIndex,
    question_target: session.question_target,
  });
};
