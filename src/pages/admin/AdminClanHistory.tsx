import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  Textarea,
} from '@/components/ui';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { ReorderButtons } from '@/components/admin/ReorderButtons';
import {
  useClanHistory,
  useDeleteClanHistory,
  useUpsertClanHistory,
} from '@/features/history/queries';
import { planReorder, useReorderRows } from '@/features/reorder';
import { useConfirm } from '@/hooks/useConfirm';
import { FormActions } from '@/components/ui/FormActions';

const ICON_OPTIONS = [
  { value: 'shield', label: 'Bouclier' },
  { value: 'flag', label: 'Drapeau' },
  { value: 'trending-up', label: 'Progression' },
  { value: 'star', label: 'Étoile' },
  { value: 'trophy', label: 'Trophée' },
  { value: 'crown', label: 'Couronne' },
];

export default function AdminClanHistory() {
  const list = useClanHistory();
  const remove = useDeleteClanHistory();
  const reorder = useReorderRows('clan_history', ['clan_history']);
  const confirmDialog = useConfirm();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Site vitrine
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Notre Histoire</h1>
          <p className="text-sm text-atfr-fog mt-1 max-w-xl">
            Les jalons de la chronologie du clan, affichés sur la page d'accueil.
            L'ordre ci-dessous est l'ordre d'affichage (du plus ancien au plus récent).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouveau jalon
        </Button>
      </div>

      {open && (
        <HistoryForm
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
        <p className="text-center text-atfr-fog py-10">Aucun jalon.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((h, index) => (
            <Card key={h.id}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                <ReorderButtons
                  canUp={index > 0}
                  canDown={index < list.data!.length - 1}
                  disabled={reorder.isPending}
                  onMove={(direction) => {
                    const updates = planReorder(list.data!, index, direction);
                    if (updates) reorder.mutate(updates);
                  }}
                />
                {h.image_url && (
                  <img
                    src={h.image_url}
                    alt=""
                    className="h-16 w-28 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="gold">{h.year}</Badge>
                    <h3 className="font-display text-lg text-atfr-bone">
                      {h.title}
                    </h3>
                    {!h.is_visible && <Badge variant="neutral">Masqué</Badge>}
                  </div>
                  {h.description && (
                    <p className="text-sm text-atfr-fog">{h.description}</p>
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
                    onClick={async () => {
                      if (
                        await confirmDialog({
                          message: `Supprimer le jalon « ${h.title} » ?`,
                          tone: 'danger',
                          confirmLabel: 'Supprimer',
                        })
                      )
                        remove.mutate(h.id);
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

function HistoryForm({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const list = useClanHistory();
  const upsert = useUpsertClanHistory();
  const existing = id ? list.data?.find((x) => x.id === id) : null;

  const [year, setYear] = useState(existing?.year ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'shield');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [isVisible, setIsVisible] = useState(existing?.is_visible ?? true);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      year: year.trim(),
      title: title.trim(),
      description: description.trim() || null,
      icon: icon || null,
      image_url: imageUrl || null,
      is_visible: isVisible,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Année"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            required
          />
          <Select label="Icône" value={icon} onChange={(e) => setIcon(e.target.value)}>
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            label="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Création du clan"
            required
            className="md:col-span-2"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="md:col-span-2"
          />
          <div className="md:col-span-2">
            <MediaPicker
              label="Image (optionnel)"
              kind="image"
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-atfr-bone md:col-span-2">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="h-4 w-4 accent-atfr-gold"
            />
            Visible publiquement
          </label>
          <FormActions className="md:col-span-2" onCancel={onClose} pending={upsert.isPending} />
        </form>
      </CardBody>
    </Card>
  );
}
