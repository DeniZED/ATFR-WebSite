import { useMemo, useState } from 'react';
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
  usePublicQuiz,
  useQuizCategories,
  type QuestionWithPublicAnswers,
} from '@/features/quiz/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { LeaderboardPanel } from '@/components/quiz/LeaderboardPanel';
import { DIFFICULTY_LABELS } from '@/types/database';

const MODULE_SLUG = 'guide-bots';

type Stage = 'intro' | 'playing' | 'result';
type Mode = 'random' | 'ordered';

interface AnsweredRecord {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
  /** Révélé par le serveur après soumission (quiz-submit-answer). */
  correctAnswerId: string | null;
}

export default function GuideBots() {
  const [stage, setStage] = useState<Stage>('intro');
  const [mode, setMode] = useState<Mode>('random');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const cats = useQuizCategories();
  const quiz = usePublicQuiz({ categoryId });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsForSession, setQuestionsForSession] = useState<
    QuestionWithPublicAnswers[]
  >([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const identity = usePlayerIdentity();

  const totalQuestions = questionsForSession.length;
  const current = questionsForSession[index];
  const score = useMemo(
    () => answered.filter((a) => a.isCorrect).length,
    [answered],
  );

  // Le score et la bonne réponse sont désormais serveur-autoritaires : la
  // partie est pilotée par quiz-start-session / quiz-submit-answer /
  // quiz-finish-session, et is_correct n'est jamais présent côté client
  // avant soumission.
  async function startQuiz() {
    if (!quiz.data || quiz.data.length === 0 || isStarting) return;
    setIsStarting(true);
    setStartError(null);
    try {
      const res = await fetch('/.netlify/functions/quiz-start-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode,
          category_id: categoryId,
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_token: identity.playerToken,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        session_id?: string;
        question_ids?: string[];
        error?: string;
      };
      if (!res.ok || !json.session_id || !json.question_ids) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const byId = new Map(quiz.data.map((q) => [q.id, q]));
      const list = json.question_ids
        .map((id) => byId.get(id))
        .filter((q): q is QuestionWithPublicAnswers => !!q);
      if (list.length !== json.question_ids.length) {
        // Le serveur a tiré des questions absentes du cache local (publication
        // récente) : on recharge plutôt que de jouer une partie incohérente.
        throw new Error(
          'La liste des questions a changé — recharge la page et réessaie.',
        );
      }
      setQuestionsForSession(list);
      setAnswered([]);
      setIndex(0);
      setAnswerError(null);
      setSessionId(json.session_id);
      setStage('playing');
    } catch (e) {
      setStartError(
        e instanceof Error ? e.message : 'Impossible de démarrer le quiz.',
      );
    } finally {
      setIsStarting(false);
    }
  }

  async function answerQuestion(answerId: string) {
    if (!current || !sessionId || isSubmitting) return;
    if (answered.some((a) => a.questionId === current.id)) return; // review only
    const questionId = current.id;
    setIsSubmitting(true);
    setAnswerError(null);
    try {
      const res = await fetch('/.netlify/functions/quiz-submit-answer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questionId,
          answer_id: answerId,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        is_correct?: boolean;
        correct_answer_id?: string | null;
        error?: string;
      };
      if (!res.ok || typeof json.is_correct !== 'boolean') {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setAnswered((prev) => [
        ...prev,
        {
          questionId,
          answerId,
          isCorrect: json.is_correct === true,
          correctAnswerId: json.correct_answer_id ?? null,
        },
      ]);
    } catch (e) {
      setAnswerError(
        e instanceof Error
          ? e.message
          : 'Erreur lors de la validation de la réponse.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function next() {
    if (index < totalQuestions - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // End of quiz — le serveur agrège les réponses vérifiées et pousse
    // lui-même le score dans le leaderboard (best-effort côté client).
    if (sessionId) {
      try {
        await fetch('/.netlify/functions/quiz-finish-session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        // Ignored — display the result regardless.
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
    setStartError(null);
    setAnswerError(null);
    setIsSubmitting(false);
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
                  disabled={isStarting || !identity.nickname}
                  trailingIcon={<ArrowRight size={16} />}
                >
                  {!identity.nickname
                    ? 'Choisis d’abord un pseudo'
                    : isStarting
                      ? 'Préparation…'
                      : 'Commencer le test'}
                </Button>

                {startError && (
                  <Alert tone="danger" title="Impossible de démarrer">
                    {startError}
                  </Alert>
                )}
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
    const record = answered.find((a) => a.questionId === current.id);
    const showFeedback = !!record;

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
                        const isSelected = record?.answerId === a.id;
                        const isCorrect = record?.correctAnswerId === a.id;
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
                            disabled={showFeedback || isSubmitting}
                          />
                        );
                      })}
                    </div>

                    {answerError && !showFeedback && (
                      <Alert tone="danger" title="Réponse non enregistrée">
                        {answerError}
                      </Alert>
                    )}

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
            .filter((record) => !record.isCorrect)
            .map((record) => ({
              record,
              q: questionsForSession.find((q) => q.id === record.questionId),
            }))
            .filter(
              (
                x,
              ): x is {
                record: AnsweredRecord;
                q: QuestionWithPublicAnswers;
              } => !!x.q,
            );
          if (failed.length === 0) return null;
          return (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
                À revoir
              </p>
              <div className="space-y-3">
                {failed.map(({ record, q }) => {
                  const right = record.correctAnswerId
                    ? q.answers.find((a) => a.id === record.correctAnswerId)
                    : undefined;
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
