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
  useAchievements,
  useDeleteAchievement,
  useUpsertAchievement,
} from '@/features/content/queries';

export default function AdminAchievements() {
  const list = useAchievements();
  const remove = useDeleteAchievement();
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Palmarès
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Trophées & classements</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouveau trophée
        </Button>
      </div>

      {open && (
        <AchievementForm
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
        <p className="text-center text-atfr-fog py-10">Aucun trophée.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((a) => (
            <Card key={a.id}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                {a.image_url && (
                  <img
                    src={a.image_url}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-atfr-bone">
                      {a.title}
                    </h3>
                    {a.rank && <Badge variant="gold">{a.rank}</Badge>}
                    {!a.is_visible && <Badge variant="neutral">Masqué</Badge>}
                  </div>
                  {a.subtitle && (
                    <p className="text-sm text-atfr-fog">{a.subtitle}</p>
                  )}
                  {a.competition && (
                    <p className="text-xs text-atfr-fog/80 mt-1">
                      {a.competition}
                      {a.earned_on && ` — ${a.earned_on}`}
                    </p>
                  )}
                  {a.description && (
                    <p className="text-sm text-atfr-fog mt-2">{a.description}</p>
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
                    onClick={() => {
                      if (confirm('Supprimer ?')) remove.mutate(a.id);
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

function AchievementForm({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const list = useAchievements();
  const upsert = useUpsertAchievement();
  const existing = id ? list.data?.find((x) => x.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [rank, setRank] = useState(existing?.rank ?? '');
  const [competition, setCompetition] = useState(existing?.competition ?? '');
  const [earnedOn, setEarnedOn] = useState(existing?.earned_on ?? '');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);
  const [isVisible, setIsVisible] = useState(existing?.is_visible ?? true);

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      title,
      subtitle: subtitle || null,
      description: description || null,
      rank: rank || null,
      competition: competition || null,
      earned_on: earnedOn || null,
      image_url: imageUrl || null,
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
          />
          <Input
            label="Rang / position"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="1er, Top 8, Or…"
          />
          <Input
            label="Sous-titre"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            label="Compétition"
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={earnedOn}
            onChange={(e) => setEarnedOn(e.target.value)}
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
