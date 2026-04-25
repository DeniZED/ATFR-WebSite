import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Textarea,
} from '@/components/ui';
import {
  useDeleteQuizCategory,
  useQuizCategories,
  useUpsertQuizCategory,
} from '@/features/quiz/queries';

export default function AdminQuizCategories() {
  const list = useQuizCategories();
  const remove = useDeleteQuizCategory();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/quiz"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
          >
            <ArrowLeft size={12} /> Retour aux questions
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Guide pour les bots
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Catégories</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouvelle catégorie
        </Button>
      </div>

      {open && (
        <CategoryForm
          id={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      )}

      {list.isError && (
        <Alert tone="danger" title="Erreur">
          {(list.error as Error).message}
        </Alert>
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucune catégorie.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((c) => (
            <Card key={c.id}>
              <CardBody className="p-5 flex items-center gap-4 flex-wrap">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg text-atfr-bone">
                    {c.name}
                  </h3>
                  <p className="text-xs text-atfr-fog mt-0.5">
                    slug · <code>{c.slug}</code>
                    {' · '}ordre {c.sort_order}
                  </p>
                  {c.description && (
                    <p className="text-sm text-atfr-fog mt-2">{c.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setEditing(c.id);
                      setOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    leadingIcon={<Trash2 size={14} />}
                    onClick={() => {
                      if (
                        confirm(
                          `Supprimer la catégorie "${c.name}" ? Les questions associées resteront mais seront décatégorisées.`,
                        )
                      ) {
                        remove.mutate(c.id);
                      }
                    }}
                    disabled={remove.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryForm({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const list = useQuizCategories();
  const upsert = useUpsertQuizCategory();
  const existing = id ? list.data?.find((c) => c.id === id) : null;

  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [color, setColor] = useState(existing?.color ?? '#E8B043');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      slug: slug.trim(),
      name: name.trim(),
      description: description || null,
      color,
      sort_order: sortOrder,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="positioning"
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
            rows={2}
          />
          <Input
            label="Couleur (hex)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <Input
            label="Ordre d'affichage"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
