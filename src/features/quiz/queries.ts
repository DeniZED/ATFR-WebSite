import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database, QuizMode } from '@/types/database';

type CategoryRow = Database['public']['Tables']['quiz_categories']['Row'];
type CategoryInsert = Database['public']['Tables']['quiz_categories']['Insert'];
type QuestionRow = Database['public']['Tables']['quiz_questions']['Row'];
type QuestionInsert = Database['public']['Tables']['quiz_questions']['Insert'];
type AnswerRow = Database['public']['Tables']['quiz_answers']['Row'];
type AnswerInsert = Database['public']['Tables']['quiz_answers']['Insert'];

export interface QuestionWithAnswers extends QuestionRow {
  answers: AnswerRow[];
  category: CategoryRow | null;
}

// ----------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------
export function useQuizCategories() {
  return useQuery({
    queryKey: ['quiz_categories'],
    queryFn: async (): Promise<CategoryRow[]> => {
      const { data, error } = await supabase
        .from('quiz_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useUpsertQuizCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CategoryInsert) => {
      const { error } = await supabase
        .from('quiz_categories')
        .upsert(input, { onConflict: 'slug' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz_categories'] }),
  });
}

export function useDeleteQuizCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quiz_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quiz_categories'] });
      qc.invalidateQueries({ queryKey: ['quiz_questions'] });
    },
  });
}

// ----------------------------------------------------------------------
// Questions list (admin)
// ----------------------------------------------------------------------
export function useQuizQuestions(opts: { publishedOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['quiz_questions', opts],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      let q = supabase
        .from('quiz_questions')
        .select('*, answers:quiz_answers(*), category:quiz_categories(*)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (opts.publishedOnly) q = q.eq('is_published', true);
      const { data, error } = await q;
      if (error) throw error;
      // Sort answers by sort_order, then by id for stability.
      return (data ?? []).map((row) => ({
        ...row,
        answers: [...(row.answers ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      })) as QuestionWithAnswers[];
    },
    staleTime: 30_000,
  });
}

export function useQuizQuestion(id: string | null) {
  return useQuery({
    queryKey: ['quiz_questions', 'detail', id],
    enabled: !!id,
    queryFn: async (): Promise<QuestionWithAnswers | null> => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*, answers:quiz_answers(*), category:quiz_categories(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        answers: [...(data.answers ?? [])].sort(
          (a: AnswerRow, b: AnswerRow) => a.sort_order - b.sort_order,
        ),
      } as QuestionWithAnswers;
    },
  });
}

// ----------------------------------------------------------------------
// Save (insert/update + replace answers)
// ----------------------------------------------------------------------
export interface QuestionPayload {
  question: QuestionInsert;
  answers: Array<Pick<AnswerInsert, 'label' | 'is_correct' | 'sort_order'>>;
}

export function useSaveQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: QuestionPayload): Promise<string> => {
      const { question, answers } = payload;
      let questionId = question.id;

      if (questionId) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(question)
          .eq('id', questionId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quiz_questions')
          .insert(question)
          .select('id')
          .single();
        if (error) throw error;
        questionId = data.id;
      }

      // Replace the answer set wholesale: simpler than diffing.
      const { error: delErr } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('question_id', questionId);
      if (delErr) throw delErr;

      if (answers.length > 0) {
        const rows = answers.map((a, i) => ({
          question_id: questionId!,
          label: a.label,
          is_correct: a.is_correct,
          sort_order: a.sort_order ?? i,
        }));
        const { error: insErr } = await supabase
          .from('quiz_answers')
          .insert(rows);
        if (insErr) throw insErr;
      }

      return questionId!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz_questions'] }),
  });
}

export function useDeleteQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz_questions'] }),
  });
}

export function useDuplicateQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { data: src, error } = await supabase
        .from('quiz_questions')
        .select('*, answers:quiz_answers(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (!src) throw new Error('Question introuvable');

      const insert: QuestionInsert = {
        category_id: src.category_id,
        difficulty: src.difficulty,
        title: `${src.title} (copie)`,
        context: src.context,
        image_url: src.image_url,
        question: src.question,
        explanation: src.explanation,
        is_published: false,
        is_featured: false,
        sort_order: src.sort_order,
      };
      const { data: newRow, error: insErr } = await supabase
        .from('quiz_questions')
        .insert(insert)
        .select('id')
        .single();
      if (insErr) throw insErr;

      const answersToCopy = (src.answers as AnswerRow[]).map((a) => ({
        question_id: newRow.id,
        label: a.label,
        is_correct: a.is_correct,
        sort_order: a.sort_order,
      }));
      if (answersToCopy.length > 0) {
        const { error: ansErr } = await supabase
          .from('quiz_answers')
          .insert(answersToCopy);
        if (ansErr) throw ansErr;
      }

      return newRow.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz_questions'] }),
  });
}

// ----------------------------------------------------------------------
// Public quiz: published questions + session logging
// ----------------------------------------------------------------------
export function usePublicQuiz(opts: { categoryId?: string | null } = {}) {
  return useQuery({
    queryKey: ['quiz_questions', 'public', opts.categoryId ?? 'all'],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      let q = supabase
        .from('quiz_questions')
        .select('*, answers:quiz_answers(*), category:quiz_categories(*)')
        .eq('is_published', true);
      if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        answers: [...(row.answers ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      })) as QuestionWithAnswers[];
    },
    staleTime: 5 * 60_000,
  });
}

interface CreateSessionArgs {
  mode: QuizMode;
  categoryId: string | null;
  total: number;
}

export function useCreateQuizSession() {
  return useMutation({
    mutationFn: async (args: CreateSessionArgs): Promise<string> => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          mode: args.mode,
          category_id: args.categoryId,
          total: args.total,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    },
  });
}

export function useLogQuizAnswer() {
  return useMutation({
    mutationFn: async (args: {
      sessionId: string;
      questionId: string;
      answerId: string | null;
      isCorrect: boolean;
    }) => {
      const { error } = await supabase.from('quiz_session_answers').insert({
        session_id: args.sessionId,
        question_id: args.questionId,
        answer_id: args.answerId,
        is_correct: args.isCorrect,
      });
      if (error) throw error;
    },
  });
}

export function useFinishQuizSession() {
  return useMutation({
    mutationFn: async (args: { sessionId: string; score: number }) => {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          finished_at: new Date().toISOString(),
          score: args.score,
        })
        .eq('id', args.sessionId);
      if (error) throw error;
    },
  });
}

// ----------------------------------------------------------------------
// Admin analytics
// ----------------------------------------------------------------------
type SessionRow = Database['public']['Tables']['quiz_sessions']['Row'];

export function useQuizSessions(limit = 200) {
  return useQuery({
    queryKey: ['quiz_sessions', 'list', limit],
    queryFn: async (): Promise<SessionRow[]> => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}
