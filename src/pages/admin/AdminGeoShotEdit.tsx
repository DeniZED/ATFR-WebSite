import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Save, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  Switch,
} from '@/components/ui';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { MinimapClickPlacer } from '@/components/admin/MinimapClickPlacer';
import {
  useDeleteShot,
  useDuplicateShot,
  useGeoMaps,
  useGeoShot,
  useUpsertShot,
} from '@/features/geoguesser/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

interface Draft {
  map_id: string;
  image_url: string;
  x_pct: number | null;
  y_pct: number | null;
  difficulty: QuizDifficulty;
  caption: string;
  tags: string;
  is_published: boolean;
  sort_order: number;
}

const empty: Draft = {
  map_id: '',
  image_url: '',
  x_pct: null,
  y_pct: null,
  difficulty: 'medium',
  caption: '',
  tags: '',
  is_published: false,
  sort_order: 0,
};

export default function AdminGeoShotEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const maps = useGeoMaps({ activeOnly: true });
  const existing = useGeoShot(isNew ? null : (id ?? null));
  const upsert = useUpsertShot();
  const remove = useDeleteShot();
  const dup = useDuplicateShot();

  const [draft, setDraft] = useState<Draft>(empty);

  useEffect(() => {
    if (isNew) {
      setDraft(empty);
      return;
    }
    if (existing.data) {
      setDraft({
        map_id: existing.data.map_id,
        image_url: existing.data.image_url,
        x_pct: existing.data.x_pct,
        y_pct: existing.data.y_pct,
        difficulty: existing.data.difficulty,
        caption: existing.data.caption ?? '',
        tags: (existing.data.tags ?? []).join(', '),
        is_published: existing.data.is_published,
        sort_order: existing.data.sort_order,
      });
    }
  }, [isNew, existing.data]);

  const selectedMap = useMemo(
    () => maps.data?.find((m) => m.id === draft.map_id) ?? null,
    [maps.data, draft.map_id],
  );

  const validation = useMemo(() => {
    const errs: string[] = [];
    if (!draft.map_id) errs.push('Choisir une map');
    if (!draft.image_url) errs.push('Uploader le screenshot');
    if (draft.x_pct == null || draft.y_pct == null)
      errs.push('Placer le point sur la minimap');
    return errs;
  }, [draft]);

  function setField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onSave() {
    if (validation.length > 0) return;
    const newId = await upsert.mutateAsync({
      id: isNew ? undefined : id!,
      map_id: draft.map_id,
      image_url: draft.image_url,
      x_pct: draft.x_pct!,
      y_pct: draft.y_pct!,
      difficulty: draft.difficulty,
      caption: draft.caption || null,
      tags: draft.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_published: draft.is_published,
      sort_order: draft.sort_order,
    });
    if (isNew) navigate(`/admin/geoguesser/shots/${newId}`, { replace: true });
  }

  async function onDelete() {
    if (isNew || !id) return;
    if (!confirm('Supprimer ce screenshot ?')) return;
    await remove.mutateAsync(id);
    navigate('/admin/geoguesser/shots');
  }

  async function onDuplicate() {
    if (isNew || !id) return;
    const newId = await dup.mutateAsync(id);
    navigate(`/admin/geoguesser/shots/${newId}`);
  }

  if (!isNew && existing.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!isNew && !existing.isLoading && !existing.data) {
    return <Navigate to="/admin/geoguesser/shots" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-atfr-ink/85 backdrop-blur border-b border-atfr-gold/10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/geoguesser/shots"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
          >
            <ArrowLeft size={12} /> Retour à la liste
          </Link>
          <h1 className="font-display text-3xl text-atfr-bone">
            {isNew ? 'Nouveau screenshot' : 'Modifier le screenshot'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
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
            disabled={validation.length > 0 || upsert.isPending}
            leadingIcon={<Save size={14} />}
          >
            {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {upsert.isError && (
        <Alert tone="danger" title="Erreur">
          {(upsert.error as Error).message}
        </Alert>
      )}

      {validation.length > 0 && (
        <Alert tone="warning" title="À compléter avant de publier">
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
              <Select
                label="Map"
                value={draft.map_id}
                onChange={(e) => setField('map_id', e.target.value)}
                required
                className="md:col-span-2"
              >
                <option value="">— Choisir une map —</option>
                {(maps.data ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
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
              <Input
                label="Ordre"
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setField('sort_order', Number(e.target.value))
                }
              />

              <div className="md:col-span-2">
                <MediaPicker
                  label="Screenshot in-game"
                  kind="image"
                  value={draft.image_url}
                  onChange={(v) => setField('image_url', v)}
                />
              </div>

              <Input
                label="Caption (optionnelle)"
                value={draft.caption}
                onChange={(e) => setField('caption', e.target.value)}
                className="md:col-span-2"
              />
              <Input
                label="Tags (séparés par virgules)"
                value={draft.tags}
                onChange={(e) => setField('tags', e.target.value)}
                placeholder="urban, brawl, bridge"
                className="md:col-span-2"
              />

              <div className="md:col-span-2">
                <Switch
                  checked={draft.is_published}
                  onChange={(v) => setField('is_published', v)}
                  label="Publier (visible côté joueur)"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Picker */}
        <div className="lg:sticky lg:top-32 self-start space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80">
            Position sur la minimap
          </p>
          <MinimapClickPlacer
            imageUrl={selectedMap?.image_url ?? ''}
            x={draft.x_pct}
            y={draft.y_pct}
            onPlace={(x, y) => {
              setField('x_pct', x);
              setField('y_pct', y);
            }}
          />
          {selectedMap && (
            <p className="text-xs text-atfr-fog">
              Map sélectionnée : <strong>{selectedMap.name}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
