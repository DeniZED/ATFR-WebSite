import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Copy,
  Eye,
  EyeOff,
  Folder,
  Pencil,
  Plus,
  Star,
  Trash2,
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
} from '@/components/ui';
import {
  useDeleteQuizQuestion,
  useDuplicateQuizQuestion,
  useQuizCategories,
  useQuizQuestions,
} from '@/features/quiz/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

type StatusFilter = 'all' | 'published' | 'draft';
type DifficultyFilter = QuizDifficulty | 'all';

export default function AdminQuizList() {
  const list = useQuizQuestions();
  const cats = useQuizCategories();
  const remove = useDeleteQuizQuestion();
  const dup = useDuplicateQuizQuestion();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [categoryId, setCategoryId] = useState<string>('all');

  const filtered = useMemo(() => {
    if (!list.data) return [];
    const q = search.trim().toLowerCase();
    return list.data.filter((row) => {
      if (status === 'published' && !row.is_published) return false;
      if (status === 'draft' && row.is_published) return false;
      if (difficulty !== 'all' && row.difficulty !== difficulty) return false;
      if (categoryId !== 'all' && row.category_id !== categoryId) return false;
      if (
        q &&
        !row.title.toLowerCase().includes(q) &&
        !row.question.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [list.data, search, status, difficulty, categoryId]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Académie · Guide pour les bots
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Questions</h1>
          <p className="text-sm text-atfr-fog mt-1">
            {list.data ? `${list.data.length} question(s) au total` : '—'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/quiz/stats">
            <Button variant="outline" leadingIcon={<BarChart3 size={14} />}>
              Statistiques
            </Button>
          </Link>
          <Link to="/admin/quiz/categories">
            <Button variant="outline" leadingIcon={<Folder size={14} />}>
              Catégories
            </Button>
          </Link>
          <Link to="/admin/quiz/new">
            <Button leadingIcon={<Plus size={14} />}>Nouvelle question</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardBody className="p-4 grid gap-3 md:grid-cols-4">
          <Input
            label="Recherche"
            placeholder="Titre ou intitulé…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Statut"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">Tous</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </Select>
          <Select
            label="Difficulté"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as DifficultyFilter)
            }
          >
            <option value="all">Toutes</option>
            {(Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]).map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </Select>
          <Select
            label="Catégorie"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="all">Toutes</option>
            {(cats.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {list.isError && (
        <Alert tone="danger" title="Erreur">
          {(list.error as Error).message}
        </Alert>
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          {list.data && list.data.length > 0
            ? 'Aucune question ne correspond aux filtres.'
            : 'Aucune question. Cliquez sur "Nouvelle question" pour commencer.'}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => {
            const successRate =
              row.attempt_count > 0
                ? Math.round((row.success_count / row.attempt_count) * 100)
                : null;
            return (
              <Card key={row.id}>
                <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md border border-atfr-gold/15 bg-atfr-graphite flex items-center justify-center text-atfr-fog">
                    {row.image_url ? (
                      <img
                        src={row.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs">Pas d'image</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display text-lg text-atfr-bone">
                        {row.title}
                      </h3>
                      {row.is_published ? (
                        <Badge variant="success">
                          <Eye size={10} className="inline" /> Publiée
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <EyeOff size={10} className="inline" /> Brouillon
                        </Badge>
                      )}
                      {row.is_featured && (
                        <Badge variant="gold">
                          <Star size={10} className="inline" /> À la une
                        </Badge>
                      )}
                      {row.category && (
                        <Badge variant="outline">{row.category.name}</Badge>
                      )}
                      <Badge variant="outline">
                        {DIFFICULTY_LABELS[row.difficulty]}
                      </Badge>
                    </div>
                    <p className="text-sm text-atfr-fog line-clamp-2">
                      {row.question}
                    </p>
                    <p className="text-xs text-atfr-fog/80 mt-2">
                      {row.answers.length} réponse(s) ·{' '}
                      {successRate != null
                        ? `${successRate}% de réussite (${row.attempt_count} essai${row.attempt_count > 1 ? 's' : ''})`
                        : 'Pas encore jouée'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/admin/quiz/${row.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        leadingIcon={<Pencil size={14} />}
                      >
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      leadingIcon={<Copy size={14} />}
                      onClick={() => dup.mutate(row.id)}
                      disabled={dup.isPending}
                    >
                      Dupliquer
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (confirm(`Supprimer "${row.title}" ?`)) {
                          remove.mutate(row.id);
                        }
                      }}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
