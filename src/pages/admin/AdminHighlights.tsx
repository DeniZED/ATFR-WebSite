import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  useDeleteHighlight,
  useHighlights,
  useUpsertHighlight,
} from '@/features/content/queries';

export default function AdminHighlights() {
  const list = useHighlights();
  const remove = useDeleteHighlight();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Showcase
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Moments forts</h1>
          <p className="text-sm text-atfr-fog mt-1">
            Mis en avant sur la page d’accueil.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouveau moment
        </Button>
      </div>

      {open && (
        <HighlightForm
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
        <p className="text-center text-atfr-fog py-10">Aucun moment fort.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((h) => (
            <Card key={h.id}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                {h.image_url && (
                  <img
                    src={h.image_url}
                    alt=""
                    className="h-24 w-40 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-atfr-bone">
                      {h.title}
                    </h3>
                    {!h.is_visible && <Badge variant="neutral">Masqué</Badge>}
                  </div>
                  {h.occurred_on && (
                    <p className="text-xs text-atfr-gold/80">{h.occurred_on}</p>
                  )}
                  {h.description && (
                    <p className="text-sm text-atfr-fog mt-2">{h.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setEditing(h.id);
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
                      if (confirm('Supprimer ?')) remove.mutate(h.id);
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

function HighlightForm({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const list = useHighlights();
  const upsert = useUpsertHighlight();
  const existing = id ? list.data?.find((x) => x.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [occurredOn, setOccurredOn] = useState(existing?.occurred_on ?? '');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);
  const [isVisible, setIsVisible] = useState(existing?.is_visible ?? true);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      title,
      description: description || null,
      image_url: imageUrl || null,
      occurred_on: occurredOn || null,
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
            label="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="md:col-span-2"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />
          <div className="md:col-span-2">
            <MediaPicker
              label="Image"
              kind="image"
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>
          <Input
            label="Date"
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
          />
          <Input
            label="Ordre d'affichage"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm text-atfr-bone md:col-span-2">
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
