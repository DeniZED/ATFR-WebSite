import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Section,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  useCreateQuizSession,
  useFinishQuizSession,
  useLogQuizAnswer,
  usePublicQuiz,
  useQuizCategories,
  type QuestionWithAnswers,
} from '@/features/quiz/queries';
import { useSubmitScore } from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { IdentityBar } from '@/components/quiz/IdentityBar';
import { LeaderboardPanel } from '@/components/quiz/LeaderboardPanel';
import { DIFFICULTY_LABELS } from '@/types/database';

const MODULE_SLUG = 'guide-bots';

type Stage = 'intro' | 'playing' | 'result';
type Mode = 'random' | 'ordered';

interface AnsweredRecord {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
}

export default function GuideBots() {
  const [stage, setStage] = useState<Stage>('intro');
  const [mode, setMode] = useState<Mode>('random');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const cats = useQuizCategories();
  const quiz = usePublicQuiz({ categoryId });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsForSession, setQuestionsForSession] = useState<
    QuestionWithAnswers[]
  >([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const createSession = useCreateQuizSession();
  const logAnswer = useLogQuizAnswer();
  const finishSession = useFinishQuizSession();
  const submitScore = useSubmitScore();
  const identity = usePlayerIdentity();

  const totalQuestions = questionsForSession.length;
  const current = questionsForSession[index];
  const score = useMemo(
    () => answered.filter((a) => a.isCorrect).length,
    [answered],
  );

  // Reset selection when moving to a new question.
  useEffect(() => {
    setSelectedAnswerId(null);
  }, [index]);

  async function startQuiz() {
    if (!quiz.data || quiz.data.length === 0) return;
    const list =
      mode === 'random'
        ? shuffle([...quiz.data])
        : [...quiz.data].sort((a, b) => a.sort_order - b.sort_order);
    setQuestionsForSession(list);
    setAnswered([]);
    setIndex(0);

    let sid: string | null = null;
    try {
      sid = await createSession.mutateAsync({
        mode: categoryId ? 'category' : 'test',
        categoryId,
        total: list.length,
      });
    } catch {
      // Analytics failures must not block the quiz — fall back to local
      // play and skip server-side logging.
      sid = null;
    }
    setSessionId(sid);
    setStage('playing');
  }

  function answerQuestion(answerId: string) {
    if (!current) return;
    if (selectedAnswerId) return; // already answered for this question
    const correct = current.answers.find((a) => a.is_correct);
    const isCorrect = !!correct && correct.id === answerId;
    setSelectedAnswerId(answerId);
    setAnswered((prev) => [
      ...prev,
      { questionId: current.id, answerId, isCorrect },
    ]);
    if (sessionId) {
      logAnswer.mutate({
        sessionId,
        questionId: current.id,
        answerId,
        isCorrect,
      });
    }
  }

  async function next() {
    if (index < totalQuestions - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // End of quiz.
    const finalScore = answered.filter((a) => a.isCorrect).length;
    if (sessionId) {
      try {
        await finishSession.mutateAsync({ sessionId, score: finalScore });
      } catch {
        // Ignored — display the result regardless.
      }
    }
    // Push to the leaderboard if we have a nickname. Failures are
    // non-blocking — the result screen is shown either way.
    if (identity.nickname && totalQuestions > 0) {
      try {
        await submitScore.mutateAsync({
          module_slug: MODULE_SLUG,
          submode: categoryId ? `cat:${categoryId}` : 'default',
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_token: identity.playerToken,
          score: finalScore,
          max_score: totalQuestions,
          meta: { mode },
        });
      } catch {
        // Leaderboard best-effort.
      }
    }
    setStage('result');
  }

  function previous() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function restart() {
    setStage('intro');
    setSessionId(null);
    setQuestionsForSession([]);
    setAnswered([]);
    setIndex(0);
    setSelectedAnswerId(null);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (stage === 'intro') {
    return (
      <Section
        eyebrow="Guide pour les bots"
        title="Le code de la route WoT"
        description="Une situation de bataille, plusieurs réponses crédibles, une seule bonne. Pédagogique, parodique, utile."
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            to="/modules"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold"
          >
            <ArrowLeft size={12} /> Retour à l'académie
          </Link>

          <IdentityBar />

          {quiz.isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : quiz.isError ? (
            <Alert tone="danger" title="Erreur de chargement">
              {(quiz.error as Error).message}
            </Alert>
          ) : !quiz.data || quiz.data.length === 0 ? (
            <Alert tone="warning" title="Pas encore de question">
              L'éditeur travaille dessus. Reviens plus tard !
            </Alert>
          ) : (
            <Card>
              <CardBody className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  <Stat label="Questions disponibles" value={quiz.data.length} />
                  <Stat label="Catégories" value={cats.data?.length ?? '—'} />
                  <Stat label="Note finale" value="/ 20" />
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
                    Catégorie
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <CategoryChip
                      label="Toutes"
                      active={categoryId === null}
                      onClick={() => setCategoryId(null)}
                    />
                    {(cats.data ?? []).map((c) => (
                      <CategoryChip
                        key={c.id}
                        label={c.name}
                        active={categoryId === c.id}
                        onClick={() => setCategoryId(c.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
                    Ordre des questions
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ModeButton
                      icon={<Shuffle size={16} />}
                      title="Aléatoire"
                      desc="Une série différente à chaque tentative."
                      active={mode === 'random'}
                      onClick={() => setMode('random')}
                    />
                    <ModeButton
                      icon={<Play size={16} />}
                      title="Ordre défini"
                      desc="Suivre l'ordre éditorial."
                      active={mode === 'ordered'}
                      onClick={() => setMode('ordered')}
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={startQuiz}
                  disabled={
                    createSession.isPending || !identity.nickname
                  }
                  trailingIcon={<ArrowRight size={16} />}
                >
                  {!identity.nickname
                    ? 'Choisis d’abord un pseudo'
                    : createSession.isPending
                      ? 'Préparation…'
                      : 'Commencer le test'}
                </Button>
              </CardBody>
            </Card>
          )}

          <LeaderboardPanel
            moduleSlug={MODULE_SLUG}
            submode={categoryId ? `cat:${categoryId}` : 'default'}
          />
        </div>
      </Section>
    );
  }

  if (stage === 'playing' && current) {
    const correct = current.answers.find((a) => a.is_correct);
    const showFeedback = !!selectedAnswerId;

    return (
      <Section
        eyebrow={`Situation ${index + 1} / ${totalQuestions}`}
        title={current.title}
      >
        <div className="max-w-3xl mx-auto">
          <ProgressBar
            total={totalQuestions}
            currentIndex={index}
            answered={answered}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="overflow-hidden mt-6">
                <CardBody className="p-0">
                  {current.image_url ? (
                    <div className="aspect-video bg-atfr-graphite">
                      <img
                        src={current.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {current.category && (
                        <Badge variant="outline">{current.category.name}</Badge>
                      )}
                      <Badge variant="gold">
                        {DIFFICULTY_LABELS[current.difficulty]}
                      </Badge>
                    </div>
                    {current.context && (
                      <p className="text-sm text-atfr-fog leading-relaxed">
                        {current.context}
                      </p>
                    )}
                    <p className="font-display text-xl text-atfr-bone">
                      {current.question}
                    </p>

                    <div className="space-y-2">
                      {current.answers.map((a, i) => {
                        const isSelected = selectedAnswerId === a.id;
                        const isCorrect = correct?.id === a.id;
                        return (
                          <AnswerButton
                            key={a.id}
                            letter={String.fromCharCode(65 + i)}
                            label={a.label}
                            state={
                              !showFeedback
                                ? 'idle'
                                : isCorrect
                                  ? 'correct'
                                  : isSelected
                                    ? 'wrong'
                                    : 'idle'
                            }
                            onClick={() => answerQuestion(a.id)}
                            disabled={showFeedback}
                          />
                        );
                      })}
                    </div>

                    {showFeedback && current.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-md border border-atfr-gold/30 bg-atfr-gold/5 p-4 text-sm text-atfr-bone leading-relaxed"
                      >
                        <p className="text-xs uppercase tracking-wider text-atfr-gold mb-1">
                          Ce qu'il fallait faire
                        </p>
                        {current.explanation}
                      </motion.div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              leadingIcon={<ArrowLeft size={14} />}
              onClick={previous}
              disabled={index === 0}
            >
              Précédent
            </Button>
            <Button
              onClick={next}
              disabled={!showFeedback}
              trailingIcon={<ArrowRight size={14} />}
            >
              {index < totalQuestions - 1 ? 'Suivant' : 'Voir le score'}
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  // Result
  const total = questionsForSession.length;
  const pct = total > 0 ? (score / total) * 100 : 0;
  const tier = scoreTier(pct);

  return (
    <Section
      eyebrow="Résultat"
      title={tier.title}
      description={tier.subtitle}
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80">
              Score
            </p>
            <p className="font-display text-6xl text-atfr-bone">
              {score} <span className="text-atfr-fog text-3xl">/ {total}</span>
            </p>
            <div className="h-2 w-full max-w-md mx-auto rounded-full bg-atfr-graphite overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="h-full bg-gradient-gold"
              />
            </div>
            <p className="text-atfr-fog max-w-xl mx-auto leading-relaxed">
              {tier.message}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button
                onClick={restart}
                leadingIcon={<RotateCcw size={14} />}
                variant="outline"
              >
                Recommencer
              </Button>
              <Link to="/modules">
                <Button variant="ghost">Retour à l'académie</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="mt-8">
          <LeaderboardPanel
            moduleSlug={MODULE_SLUG}
            submode={categoryId ? `cat:${categoryId}` : 'default'}
            limit={10}
          />
        </div>

        {/* Récap des questions ratées */}
        {(() => {
          const failed = answered
            .map((a, i) => ({ record: a, q: questionsForSession[i] }))
            .filter(({ record }) => !record.isCorrect);
          if (failed.length === 0) return null;
          return (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
                À revoir
              </p>
              <div className="space-y-3">
                {failed.map(({ q }) => {
                  const right = q.answers.find((a) => a.is_correct);
                  return (
                    <Card key={q.id}>
                      <CardBody className="p-5">
                        <p className="font-display text-base text-atfr-bone">
                          {q.title}
                        </p>
                        <p className="text-sm text-atfr-fog mt-1">{q.question}</p>
                        {right && (
                          <p className="text-sm text-atfr-success mt-2 flex items-start gap-2">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                            <span>
                              <strong>Bonne réponse :</strong> {right.label}
                            </span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-atfr-fog mt-2 italic">
                            {q.explanation}
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Helpers & sub-components
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface ScoreTier {
  title: string;
  subtitle: string;
  message: string;
}

function scoreTier(pct: number): ScoreTier {
  if (pct < 30) {
    return {
      title: 'Bot dépisté',
      subtitle: 'Il y a du boulot, soldat.',
      message:
        'Reprends les bases : positionnement, lecture de carte, gestion du focus. Recommence après quelques batailles à observer les top players.',
    };
  }
  if (pct < 60) {
    return {
      title: 'Recrue prometteuse',
      subtitle: 'Le potentiel est là.',
      message:
        'Tu sais lire la situation mais quelques réflexes restent à automatiser. Continue à analyser tes replays.',
    };
  }
  if (pct < 85) {
    return {
      title: 'Officier compétent',
      subtitle: 'Solide. Très solide.',
      message:
        'Tu maîtrises l\'essentiel des fondamentaux. Vise les questions Expert et bosse les micro-décisions clutch.',
    };
  }
  return {
    title: 'Alerte XVM',
    subtitle: 'Maître du champ de bataille.',
    message:
      'Sans-faute ou presque. Tu peux désormais expliquer ce qu\'il fallait faire à tes coéquipiers (ils en ont besoin).',
  };
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-2xl text-atfr-bone mt-1">{value}</p>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors',
        active
          ? 'bg-atfr-gold text-atfr-ink border-atfr-gold'
          : 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60',
      )}
    >
      {label}
    </button>
  );
}

function ModeButton({
  icon,
  title,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border p-4 text-left transition-colors',
        active
          ? 'border-atfr-gold bg-atfr-gold/10'
          : 'border-atfr-gold/15 hover:border-atfr-gold/50',
      )}
    >
      <div className="flex items-center gap-2 text-atfr-gold mb-2">
        {icon}
        <span className="font-display text-base text-atfr-bone">{title}</span>
      </div>
      <p className="text-xs text-atfr-fog">{desc}</p>
    </button>
  );
}

function ProgressBar({
  total,
  currentIndex,
  answered,
}: {
  total: number;
  currentIndex: number;
  answered: AnsweredRecord[];
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const a = answered[i];
        const isCurrent = i === currentIndex;
        return (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              a
                ? a.isCorrect
                  ? 'bg-atfr-success'
                  : 'bg-atfr-danger'
                : isCurrent
                  ? 'bg-atfr-gold'
                  : 'bg-atfr-graphite',
            )}
          />
        );
      })}
    </div>
  );
}

function AnswerButton({
  letter,
  label,
  state,
  onClick,
  disabled,
}: {
  letter: string;
  label: string;
  state: 'idle' | 'correct' | 'wrong';
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border bg-atfr-carbon p-4 text-left transition-colors',
        state === 'idle' &&
          'border-atfr-gold/15 hover:border-atfr-gold/50 active:scale-[0.99]',
        state === 'correct' && 'border-atfr-success bg-atfr-success/10',
        state === 'wrong' && 'border-atfr-danger bg-atfr-danger/10',
        disabled && state === 'idle' && 'opacity-60 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm',
          state === 'idle' && 'bg-atfr-ink/60 text-atfr-gold',
          state === 'correct' && 'bg-atfr-success text-atfr-ink',
          state === 'wrong' && 'bg-atfr-danger text-atfr-ink',
        )}
      >
        {state === 'correct' ? (
          <CheckCircle2 size={16} />
        ) : state === 'wrong' ? (
          <XCircle size={16} />
        ) : (
          letter
        )}
      </span>
      <span className="text-atfr-bone flex-1">{label}</span>
    </button>
  );
}
