import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
} from '@/components/ui';
import { MediaPicker } from '@/components/admin/MediaPicker';
import {
  useDeleteQuizQuestion,
  useDuplicateQuizQuestion,
  useQuizCategories,
  useQuizQuestion,
  useSaveQuizQuestion,
} from '@/features/quiz/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';
import { cn } from '@/lib/cn';

interface DraftAnswer {
  id?: string;
  label: string;
  is_correct: boolean;
}

interface Draft {
  category_id: string | null;
  difficulty: QuizDifficulty;
  title: string;
  context: string;
  image_url: string;
  question: string;
  explanation: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  answers: DraftAnswer[];
}

const empty: Draft = {
  category_id: null,
  difficulty: 'medium',
  title: '',
  context: '',
  image_url: '',
  question: '',
  explanation: '',
  is_published: false,
  is_featured: false,
  sort_order: 0,
  answers: [
    { label: '', is_correct: false },
    { label: '', is_correct: false },
    { label: '', is_correct: false },
    { label: '', is_correct: false },
  ],
};

export default function AdminQuizEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const cats = useQuizCategories();
  const existing = useQuizQuestion(isNew ? null : (id ?? null));
  const save = useSaveQuizQuestion();
  const remove = useDeleteQuizQuestion();
  const dup = useDuplicateQuizQuestion();

  const [draft, setDraft] = useState<Draft>(empty);

  useEffect(() => {
    if (isNew) {
      setDraft(empty);
      return;
    }
    if (existing.data) {
      setDraft({
        category_id: existing.data.category_id,
        difficulty: existing.data.difficulty,
        title: existing.data.title,
        context: existing.data.context ?? '',
        image_url: existing.data.image_url ?? '',
        question: existing.data.question,
        explanation: existing.data.explanation ?? '',
        is_published: existing.data.is_published,
        is_featured: existing.data.is_featured,
        sort_order: existing.data.sort_order,
        answers:
          existing.data.answers.length > 0
            ? existing.data.answers.map((a) => ({
                id: a.id,
                label: a.label,
                is_correct: a.is_correct,
              }))
            : empty.answers,
      });
    }
  }, [isNew, existing.data]);

  const correctIndex = useMemo(
    () => draft.answers.findIndex((a) => a.is_correct),
    [draft.answers],
  );

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!draft.title.trim()) errs.push('Titre requis');
    if (!draft.question.trim()) errs.push('Question requise');
    const filled = draft.answers.filter((a) => a.label.trim().length > 0);
    if (filled.length < 2) errs.push('Au moins 2 réponses');
    if (correctIndex < 0) errs.push('Sélectionner la bonne réponse');
    else if (!draft.answers[correctIndex].label.trim())
      errs.push('La bonne réponse ne peut pas être vide');
    return errs;
  }, [draft, correctIndex]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateAnswer(idx: number, patch: Partial<DraftAnswer>) {
    setDraft((d) => {
      const next = d.answers.map((a, i) => (i === idx ? { ...a, ...patch } : a));
      return { ...d, answers: next };
    });
  }

  function setCorrect(idx: number) {
    setDraft((d) => ({
      ...d,
      answers: d.answers.map((a, i) => ({ ...a, is_correct: i === idx })),
    }));
  }

  function addAnswer() {
    if (draft.answers.length >= 6) return;
    setDraft((d) => ({
      ...d,
      answers: [...d.answers, { label: '', is_correct: false }],
    }));
  }

  function removeAnswer(idx: number) {
    if (draft.answers.length <= 2) return;
    setDraft((d) => ({
      ...d,
      answers: d.answers.filter((_, i) => i !== idx),
    }));
  }

  async function onSave() {
    if (validation.length > 0) return;
    const filledAnswers = draft.answers
      .map((a, i) => ({ ...a, sort_order: i }))
      .filter((a) => a.label.trim().length > 0);
    const newId = await save.mutateAsync({
      question: {
        id: isNew ? undefined : id!,
        category_id: draft.category_id,
        difficulty: draft.difficulty,
        title: draft.title.trim(),
        context: draft.context.trim() || null,
        image_url: draft.image_url || null,
        question: draft.question.trim(),
        explanation: draft.explanation.trim() || null,
        is_published: draft.is_published,
        is_featured: draft.is_featured,
        sort_order: draft.sort_order,
      },
      answers: filledAnswers.map((a) => ({
        label: a.label.trim(),
        is_correct: a.is_correct,
        sort_order: a.sort_order,
      })),
    });
    if (isNew) navigate(`/admin/quiz/${newId}`, { replace: true });
  }

  async function onDelete() {
    if (isNew || !id) return;
    if (!confirm(`Supprimer "${draft.title}" ?`)) return;
    await remove.mutateAsync(id);
    navigate('/admin/quiz');
  }

  async function onDuplicate() {
    if (isNew || !id) return;
    const newId = await dup.mutateAsync(id);
    navigate(`/admin/quiz/${newId}`);
  }

  if (!isNew && existing.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!isNew && !existing.isLoading && !existing.data) {
    return <Navigate to="/admin/quiz" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-atfr-ink/85 backdrop-blur border-b border-atfr-gold/10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/quiz"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
          >
            <ArrowLeft size={12} /> Retour à la liste
          </Link>
          <h1 className="font-display text-3xl text-atfr-bone">
            {isNew ? 'Nouvelle question' : draft.title || 'Modifier la question'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <>
              <Button
                variant="ghost"
                onClick={onDuplicate}
                leadingIcon={<Copy size={14} />}
                disabled={dup.isPending}
              >
                Dupliquer
              </Button>
              <Button
                variant="danger"
                onClick={onDelete}
                leadingIcon={<Trash2 size={14} />}
                disabled={remove.isPending}
              >
                Supprimer
              </Button>
            </>
          )}
          <Button
            onClick={onSave}
            leadingIcon={<Save size={14} />}
            disabled={validation.length > 0 || save.isPending}
          >
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {save.isError && (
        <Alert tone="danger" title="Erreur">
          {(save.error as Error).message}
        </Alert>
      )}

      {validation.length > 0 && (
        <Alert tone="warning" title="À corriger avant publication">
          <ul className="list-disc pl-5">
            {validation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardBody className="p-5 grid gap-4 md:grid-cols-2">
              <Input
                label="Titre interne"
                value={draft.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="Prokhorovka — ligne sud"
                required
                className="md:col-span-2"
              />
              <Select
                label="Catégorie"
                value={draft.category_id ?? ''}
                onChange={(e) =>
                  setField('category_id', e.target.value || null)
                }
              >
                <option value="">Sans catégorie</option>
                {(cats.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Difficulté"
                value={draft.difficulty}
                onChange={(e) =>
                  setField('difficulty', e.target.value as QuizDifficulty)
                }
              >
                {(Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]).map(
                  (d) => (
                    <option key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </option>
                  ),
                )}
              </Select>

              <div className="md:col-span-2">
                <MediaPicker
                  label="Image de la situation"
                  kind="image"
                  value={draft.image_url}
                  onChange={(v) => setField('image_url', v)}
                />
              </div>

              <Textarea
                label="Contexte (optionnel)"
                value={draft.context}
                onChange={(e) => setField('context', e.target.value)}
                rows={3}
                placeholder="Début de bataille, vous êtes en Obj. 140. 3 alliés partent nord…"
                className="md:col-span-2"
              />
              <Textarea
                label="Question"
                value={draft.question}
                onChange={(e) => setField('question', e.target.value)}
                rows={2}
                placeholder="Que faites-vous ?"
                required
                className="md:col-span-2"
              />
              <Textarea
                label="Explication (affichée après réponse)"
                value={draft.explanation}
                onChange={(e) => setField('explanation', e.target.value)}
                rows={3}
                className="md:col-span-2"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-atfr-bone">
                  Réponses possibles
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  leadingIcon={<Plus size={14} />}
                  onClick={addAnswer}
                  disabled={draft.answers.length >= 6}
                >
                  Ajouter
                </Button>
              </div>
              <p className="text-xs text-atfr-fog">
                Coche la bonne réponse. Entre 2 et 6 réponses, exactement une
                marquée comme correcte.
              </p>

              <div className="space-y-2">
                {draft.answers.map((a, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                      a.is_correct
                        ? 'border-atfr-success/50 bg-atfr-success/5'
                        : 'border-atfr-gold/15',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrect(i)}
                      aria-label={
                        a.is_correct ? 'Bonne réponse' : 'Marquer comme bonne réponse'
                      }
                      className={cn(
                        'mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                        a.is_correct
                          ? 'border-atfr-success bg-atfr-success text-atfr-ink'
                          : 'border-atfr-gold/40 text-atfr-gold/60 hover:border-atfr-gold',
                      )}
                    >
                      {a.is_correct ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </button>
                    <Input
                      value={a.label}
                      onChange={(e) =>
                        updateAnswer(i, { label: e.target.value })
                      }
                      placeholder={`Réponse ${String.fromCharCode(65 + i)}`}
                      className="flex-1"
                    />
                    {draft.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(i)}
                        aria-label="Retirer cette réponse"
                        className="mt-2 text-atfr-fog hover:text-atfr-danger"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Switch
                  checked={draft.is_published}
                  onChange={(v) => setField('is_published', v)}
                  label="Publier la question"
                  hint={
                    draft.is_published
                      ? 'Visible dans le quiz public.'
                      : 'Brouillon — invisible côté public.'
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Switch
                  checked={draft.is_featured}
                  onChange={(v) => setField('is_featured', v)}
                  label="Question à la une"
                  hint="Mise en avant dans le hub des modules."
                />
              </div>
              <Input
                label="Ordre d'affichage"
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setField('sort_order', Number(e.target.value))
                }
              />
            </CardBody>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-32 self-start">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Aperçu
          </p>
          <PreviewCard draft={draft} correctIndex={correctIndex} />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  draft,
  correctIndex,
}: {
  draft: Draft;
  correctIndex: number;
}) {
  return (
    <Card>
      <CardBody className="p-0 overflow-hidden">
        {draft.image_url ? (
          <div className="aspect-video bg-atfr-graphite">
            <img
              src={draft.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-atfr-graphite flex items-center justify-center text-atfr-fog text-sm">
            Image de la situation
          </div>
        )}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="gold">SITUATION</Badge>
            <Badge variant="outline">{DIFFICULTY_LABELS[draft.difficulty]}</Badge>
          </div>
          <h3 className="font-display text-xl text-atfr-bone">
            {draft.title || 'Titre…'}
          </h3>
          {draft.context && (
            <p className="text-sm text-atfr-fog leading-relaxed">
              {draft.context}
            </p>
          )}
          <p className="text-atfr-bone font-medium">
            {draft.question || 'Que faites-vous ?'}
          </p>
          <div className="space-y-2">
            {draft.answers.map((a, i) => {
              const isCorrect = i === correctIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-md border px-3 py-2 text-sm',
                    isCorrect
                      ? 'border-atfr-success/50 bg-atfr-success/10 text-atfr-bone'
                      : 'border-atfr-gold/15 bg-atfr-graphite/40 text-atfr-fog',
                  )}
                >
                  <span
                    className={cn(
                      'h-6 w-6 inline-flex items-center justify-center rounded-full text-xs font-display',
                      isCorrect
                        ? 'bg-atfr-success text-atfr-ink'
                        : 'bg-atfr-ink/60 text-atfr-gold',
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{a.label || '—'}</span>
                </div>
              );
            })}
          </div>
          {draft.explanation && (
            <div className="rounded-md border border-atfr-gold/30 bg-atfr-gold/5 p-3 text-sm text-atfr-bone leading-relaxed">
              <p className="text-xs uppercase tracking-wider text-atfr-gold mb-1">
                Explication
              </p>
              {draft.explanation}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
