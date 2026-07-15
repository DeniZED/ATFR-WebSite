import { useMemo, useState, type FormEvent } from 'react';
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
  ACTIVITY_CATEGORIES,
  useClanActivities,
  useDeleteClanActivity,
  useUpsertClanActivity,
  type ActivityCategory,
} from '@/features/activities/queries';
import { planReorder, useReorderRows } from '@/features/reorder';
import { useConfirm } from '@/hooks/useConfirm';
import { FormActions } from '@/components/ui/FormActions';
import { cn } from '@/lib/cn';

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  regulieres: 'Régulières',
  bastion: 'Bastion',
  entrainements: 'Entraînements',
  fun: 'Fun',
};

export default function AdminActivities() {
  const list = useClanActivities();
  const remove = useDeleteClanActivity();
  const reorder = useReorderRows('clan_activities', ['clan_activities']);
  const confirmDialog = useConfirm();
  const [category, setCategory] = useState<ActivityCategory>('regulieres');
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => (list.data ?? []).filter((a) => a.category === category),
    [list.data, category],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Site vitrine
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Notre Activité</h1>
          <p className="text-sm text-atfr-fog mt-1 max-w-xl">
            Cartes des onglets d'activité de la page d'accueil. L'onglet
            <span className="text-atfr-bone"> Clan Wars</span> se gère depuis le
            <span className="text-atfr-bone"> Palmarès</span>.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouvelle activité
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIVITY_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition-colors',
              c === category
                ? 'border-atfr-gold bg-atfr-gold/15 text-atfr-gold'
                : 'border-atfr-gold/20 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/40',
            )}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {open && (
        <ActivityForm
          id={editing}
          defaultCategory={category}
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
      ) : rows.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucune activité dans « {CATEGORY_LABELS[category]} ».
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((a, index) => (
            <Card key={a.id}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                <ReorderButtons
                  canUp={index > 0}
                  canDown={index < rows.length - 1}
                  disabled={reorder.isPending}
                  onMove={(direction) => {
                    const updates = planReorder(rows, index, direction);
                    if (updates) reorder.mutate(updates);
                  }}
                />
                {a.image_url && (
                  <img
                    src={a.image_url}
                    alt=""
                    className="h-16 w-28 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-lg text-atfr-bone">{a.title}</h3>
                    {a.badge && <Badge variant="gold">{a.badge}</Badge>}
                    {!a.is_visible && <Badge variant="neutral">Masqué</Badge>}
                  </div>
                  {a.description && (
                    <p className="text-sm text-atfr-fog">{a.description}</p>
                  )}
                  {(a.schedule_time || a.schedule_frequency) && (
                    <p className="text-xs text-atfr-fog/80 mt-1">
                      {[a.schedule_time, a.schedule_frequency].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setEditing(a.id);
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
                          message: `Supprimer l'activité « ${a.title} » ?`,
                          tone: 'danger',
                          confirmLabel: 'Supprimer',
                        })
                      )
                        remove.mutate(a.id);
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

function ActivityForm({
  id,
  defaultCategory,
  onClose,
}: {
  id: string | null;
  defaultCategory: ActivityCategory;
  onClose: () => void;
}) {
  const list = useClanActivities();
  const upsert = useUpsertClanActivity();
  const existing = id ? list.data?.find((x) => x.id === id) : null;

  const [category, setCategory] = useState<ActivityCategory>(
    (existing?.category as ActivityCategory) ?? defaultCategory,
  );
  const [title, setTitle] = useState(existing?.title ?? '');
  const [badge, setBadge] = useState(existing?.badge ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [time, setTime] = useState(existing?.schedule_time ?? '');
  const [frequency, setFrequency] = useState(existing?.schedule_frequency ?? '');
  const [isVisible, setIsVisible] = useState(existing?.is_visible ?? true);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      category,
      title: title.trim(),
      badge: badge.trim() || null,
      description: description.trim() || null,
      image_url: imageUrl || null,
      schedule_time: time.trim() || null,
      schedule_frequency: frequency.trim() || null,
      is_visible: isVisible,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Select
            label="Onglet"
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
          >
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
          <Input
            label="Pastille (badge)"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Tous les jours !, Tier X…"
          />
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
            rows={2}
            className="md:col-span-2"
          />
          <Input
            label="Horaire"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="21h00 – 00h00, Variable…"
          />
          <Input
            label="Fréquence"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="Bi-hebdomadaire, Quotidien…"
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
