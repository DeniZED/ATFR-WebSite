import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Quote, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Textarea,
} from '@/components/ui';
import { MediaPicker } from '@/components/admin/MediaPicker';
import {
  useDeleteTestimonial,
  useTestimonials,
  useUpsertTestimonial,
} from '@/features/content/queries';

export default function AdminTestimonials() {
  const list = useTestimonials();
  const remove = useDeleteTestimonial();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Membres
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Témoignages</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouveau témoignage
        </Button>
      </div>

      {open && (
        <TestimonialForm
          id={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucun témoignage.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((t) => (
            <Card key={t.id}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-atfr-gold/30 bg-atfr-graphite flex items-center justify-center">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Quote size={18} className="text-atfr-gold" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-atfr-bone">
                      {t.author_name}
                    </h3>
                    {t.author_role && (
                      <span className="text-xs text-atfr-gold/80">
                        {t.author_role}
                      </span>
                    )}
                    {!t.is_visible && <Badge variant="neutral">Masqué</Badge>}
                  </div>
                  <p className="text-sm text-atfr-fog italic">« {t.quote} »</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setEditing(t.id);
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
                      if (confirm('Supprimer ?')) remove.mutate(t.id);
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

function TestimonialForm({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const list = useTestimonials();
  const upsert = useUpsertTestimonial();
  const existing = id ? list.data?.find((x) => x.id === id) : null;

  const [authorName, setAuthorName] = useState(existing?.author_name ?? '');
  const [authorRole, setAuthorRole] = useState(existing?.author_role ?? '');
  const [avatarUrl, setAvatarUrl] = useState(existing?.avatar_url ?? '');
  const [quote, setQuote] = useState(existing?.quote ?? '');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);
  const [isVisible, setIsVisible] = useState(existing?.is_visible ?? true);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      author_name: authorName,
      author_role: authorRole || null,
      avatar_url: avatarUrl || null,
      quote,
      sort_order: sortOrder,
      is_visible: isVisible,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nom"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <Input
            label="Rôle (optionnel)"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            placeholder="Commandant, Vétéran…"
          />
          <div className="md:col-span-2">
            <MediaPicker
              label="Avatar"
              kind="image"
              value={avatarUrl}
              onChange={setAvatarUrl}
            />
          </div>
          <Textarea
            label="Citation"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={4}
            required
            className="md:col-span-2"
          />
          <Input
            label="Ordre d'affichage"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm text-atfr-bone">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="h-4 w-4 accent-atfr-gold"
            />
            Visible publiquement
          </label>
          <div className="md:col-span-2 flex gap-2 justify-end">
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
