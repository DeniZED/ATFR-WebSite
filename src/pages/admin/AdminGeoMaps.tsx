import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Spinner,
  Switch,
} from '@/components/ui';
import {
  ArrowLeft,
  BarChart3,
  Camera,
  Download,
  Image as ImageIcon,
  Layers,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  fetchWgMaps,
  useBulkUpsertMaps,
  useDeleteMap,
  useGeoMaps,
  useGeoShots,
  useResetMapShotStats,
  useUpsertMap,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import { MediaPicker } from '@/components/admin/MediaPicker';
import {
  DIFFICULTY_LABELS,
  type Database,
  type QuizDifficulty,
} from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];

const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[];

export default function AdminGeoMaps() {
  const list = useGeoMaps();
  const shots = useGeoShots();
  const bulkUpsert = useBulkUpsertMaps();
  const upsert = useUpsertMap();
  const remove = useDeleteMap();
  const resetMapStats = useResetMapShotStats();

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const statsByMap = useMemo(() => {
    const grouped = new Map<string, ShotWithMap[]>();
    for (const shot of shots.data ?? []) {
      const arr = grouped.get(shot.map_id) ?? [];
      arr.push(shot);
      grouped.set(shot.map_id, arr);
    }
    return grouped;
  }, [shots.data]);

  async function syncFromWg() {
    setSyncMessage(null);
    try {
      const wg = await fetchWgMaps();
      if (wg.length === 0) {
        setSyncMessage(
          "L'API Wargaming ne renvoie actuellement aucune map (count: 0). " +
            'Pas de blocage : ajoute / édite tes maps à la main ci-dessous.',
        );
        return;
      }
      const rows = wg.map((m, i) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        image_url: m.image_url,
        size_m: m.size_m,
        width_m: m.size_m,
        height_m: m.size_m,
        source: 'wg' as const,
        is_active: true,
        sort_order: i,
      }));
      await bulkUpsert.mutateAsync(rows);
      setSyncMessage(`✅ ${wg.length} maps synchronisées depuis Wargaming.`);
    } catch (err) {
      setSyncMessage(`Erreur : ${(err as Error).message}`);
    }
  }

  async function resetStatsForMap(map: MapRow) {
    const mapShots = statsByMap.get(map.id) ?? [];
    if (
      !confirm(
        `Réinitialiser les stats des ${mapShots.length} screenshot(s) de "${map.name}" ? ` +
          'Les compteurs repassent à 0 et toutes les difficultés redeviennent Facile.',
      )
    ) {
      return;
    }
    const affected = await resetMapStats.mutateAsync(map.id);
    setResetMessage(
      affected > 0
        ? `${affected} screenshot(s) réinitialisé(s) pour ${map.name}.`
        : `Aucun screenshot modifie pour ${map.name}.`,
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/geoguesser"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> GeoGuesser
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie · GeoGuesser
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Maps</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Synchronise la liste depuis Wargaming, ou ajoute des maps custom à la
          main. Une map désactivée reste en base mais ses screenshots ne
          sont plus jouables.
        </p>
      </div>

      <Card>
        <CardBody className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-lg text-atfr-bone">
              Synchronisation Wargaming
            </p>
            <p className="text-xs text-atfr-fog">
              Pull <code>/wot/encyclopedia/arenas/</code> et upsert dans la
              base. Les overrides locaux (description, image) seront écrasés —
              à ne lancer que si tu veux remettre à jour.
            </p>
          </div>
          <Button
            onClick={syncFromWg}
            disabled={bulkUpsert.isPending}
            leadingIcon={<Download size={14} />}
          >
            {bulkUpsert.isPending ? 'Synchronisation…' : 'Synchroniser'}
          </Button>
        </CardBody>
      </Card>

      {syncMessage && (
        <Alert
          tone={
            syncMessage.startsWith('✅')
              ? 'success'
              : syncMessage.startsWith('Erreur')
                ? 'danger'
                : 'info'
          }
        >
          {syncMessage}
        </Alert>
      )}

      {resetMessage && <Alert tone="success">{resetMessage}</Alert>}

      {resetMapStats.isError && (
        <Alert tone="danger" title="Reset impossible">
          {(resetMapStats.error as Error).message}
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          leadingIcon={<Plus size={14} />}
          onClick={() => {
            setEditingId(null);
            setCreating(true);
          }}
        >
          Map manuelle
        </Button>
      </div>

      {creating && (
        <MapForm
          mapId={null}
          onClose={() => setCreating(false)}
        />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucune map. Lance la synchronisation Wargaming pour démarrer.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.data.map((m) => {
            const mapShots = statsByMap.get(m.id) ?? [];
            const summary = summarizeMapShots(mapShots);
            return (
            <Card key={m.id}>
              <CardBody className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-atfr-gold/20 bg-atfr-graphite flex items-center justify-center">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-atfr-fog" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-atfr-bone truncate">
                      {m.name}
                    </h3>
                    <Badge variant={m.source === 'wg' ? 'gold' : 'outline'}>
                      {m.source === 'wg' ? 'WG' : 'Manuel'}
                    </Badge>
                    {!m.is_active && <Badge variant="neutral">Inactive</Badge>}
                    <Badge variant={summary.badgeTone}>
                      {summary.badgeLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-atfr-fog mt-1">
                    id · <code>{m.id}</code>
                  </p>
                  <p className="text-xs text-atfr-fog mt-1">
                    {summary.helper}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCreating(false);
                        setEditingId(m.id);
                      }}
                    >
                      Modifier
                    </Button>
                    <Switch
                      checked={m.is_active}
                      onChange={(next) =>
                        upsert.mutate({ ...m, is_active: next })
                      }
                      label={m.is_active ? 'Active' : 'Désactivée'}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      leadingIcon={<RotateCcw size={14} />}
                      onClick={() => resetStatsForMap(m)}
                      disabled={resetMapStats.isPending || summary.total === 0}
                    >
                      Reset stats map
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer la map "${m.name}" ? Tous ses screenshots seront supprimés.`,
                          )
                        ) {
                          remove.mutate(m.id);
                        }
                      }}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                    <Link
                      to={`/admin/geoguesser/shots?map=${encodeURIComponent(m.id)}`}
                      className="inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline self-center"
                    >
                      <Camera size={12} /> screenshots
                    </Link>
                    <Link
                      to={`/admin/geoguesser/shots/bulk?map=${encodeURIComponent(m.id)}`}
                      className="inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline self-center"
                    >
                      <Layers size={12} /> ajout en lot
                    </Link>
                  </div>
                </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <MapStat
                    label="Screens"
                    value={`${summary.published}/${summary.total}`}
                  />
                  <MapStat label="Tentatives" value={summary.attempts} />
                  <MapStat
                    label="Bonne map"
                    value={
                      summary.mapRatePct != null
                        ? `${summary.mapRatePct}%`
                        : '-'
                    }
                  />
                  <MapStat
                    label="Perf moy."
                    value={
                      summary.perfRatePct != null
                        ? `${summary.perfRatePct}%`
                        : '-'
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTIES.map((d) => (
                    <DifficultyChip
                      key={d}
                      difficulty={d}
                      count={summary.difficultyCounts[d]}
                    />
                  ))}
                </div>
                <ScreenStrip shots={summary.previewShots} />
              </CardBody>
              {editingId === m.id && (
                <div className="border-t border-atfr-gold/10">
                  <MapForm
                    mapId={m.id}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              )}
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MapStatsSummary {
  total: number;
  published: number;
  attempts: number;
  mapRatePct: number | null;
  perfRatePct: number | null;
  unplayed: number;
  difficultyCounts: Record<QuizDifficulty, number>;
  previewShots: ShotWithMap[];
  badgeLabel: string;
  badgeTone: 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';
  helper: string;
}

function summarizeMapShots(shots: ShotWithMap[]): MapStatsSummary {
  const difficultyCounts: Record<QuizDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };
  let attempts = 0;
  let correctMaps = 0;
  let perfSum = 0;
  let maxPerf = 0;
  let unplayed = 0;

  for (const shot of shots) {
    difficultyCounts[shot.difficulty] += 1;
    attempts += shot.attempt_count;
    correctMaps += shot.correct_map_count;
    perfSum += shot.success_score_sum;
    maxPerf += shot.attempt_count * getShotDiagonalM(shot);
    if (shot.attempt_count === 0) unplayed += 1;
  }

  const published = shots.filter((s) => s.is_published).length;
  const mapRatePct =
    attempts > 0 ? Math.round((correctMaps / attempts) * 100) : null;
  const perfRatePct =
    maxPerf > 0 ? Math.round(clamp(perfSum / maxPerf, 0, 1) * 100) : null;

  if (shots.length === 0) {
    return {
      total: 0,
      published: 0,
      attempts,
      mapRatePct,
      perfRatePct,
      unplayed,
      difficultyCounts,
      previewShots: [],
      badgeLabel: 'Sans screen',
      badgeTone: 'neutral',
      helper: 'Ajoute quelques screenshots pour rendre cette map jouable.',
    };
  }

  if (published === 0) {
    return {
      total: shots.length,
      published,
      attempts,
      mapRatePct,
      perfRatePct,
      unplayed,
      difficultyCounts,
      previewShots: shots.slice(0, 6),
      badgeLabel: 'Brouillon',
      badgeTone: 'warning',
      helper: 'Aucun screen publie pour les joueurs.',
    };
  }

  if (attempts === 0) {
    return {
      total: shots.length,
      published,
      attempts,
      mapRatePct,
      perfRatePct,
      unplayed,
      difficultyCounts,
      previewShots: shots.slice(0, 6),
      badgeLabel: 'Pas joue',
      badgeTone: 'neutral',
      helper: 'Les screens démarreront en Facile, puis monteront automatiquement.',
    };
  }

  if (perfRatePct != null && attempts >= 10 && perfRatePct >= 80) {
    return {
      total: shots.length,
      published,
      attempts,
      mapRatePct,
      perfRatePct,
      unplayed,
      difficultyCounts,
      previewShots: shots.slice(0, 6),
      badgeLabel: 'Facile',
      badgeTone: 'gold',
      helper: 'Les joueurs performent bien sur cette map.',
    };
  }

  if (perfRatePct != null && attempts >= 10 && perfRatePct < 40) {
    return {
      total: shots.length,
      published,
      attempts,
      mapRatePct,
      perfRatePct,
      unplayed,
      difficultyCounts,
      previewShots: shots.slice(0, 6),
      badgeLabel: 'Difficile',
      badgeTone: 'danger',
      helper: 'La map ou les points semblent exigeants pour les joueurs.',
    };
  }

  return {
    total: shots.length,
    published,
    attempts,
    mapRatePct,
    perfRatePct,
    unplayed,
    difficultyCounts,
    previewShots: shots.slice(0, 6),
    badgeLabel: unplayed > 0 ? 'Stats partielles' : 'Stable',
    badgeTone: unplayed > 0 ? 'outline' : 'success',
    helper:
      unplayed > 0
        ? `${unplayed} screen(s) n'ont pas encore de stats.`
        : 'Stats suffisantes pour suivre la map.',
  };
}

function getShotDiagonalM(shot: ShotWithMap): number {
  const width = shot.map?.width_m ?? shot.map?.size_m ?? 1000;
  const height = shot.map?.height_m ?? shot.map?.size_m ?? 1000;
  return Math.max(1, Math.hypot(width, height));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function MapStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/35 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-lg text-atfr-bone mt-0.5">{value}</p>
    </div>
  );
}

function DifficultyChip({
  difficulty,
  count,
}: {
  difficulty: QuizDifficulty;
  count: number;
}) {
  return (
    <Badge variant={count > 0 ? 'outline' : 'neutral'}>
      {DIFFICULTY_LABELS[difficulty]} {count}
    </Badge>
  );
}

function ScreenStrip({ shots }: { shots: ShotWithMap[] }) {
  if (shots.length === 0) {
    return (
      <p className="text-xs text-atfr-fog flex items-center gap-2">
        <BarChart3 size={13} className="text-atfr-gold" />
        Aucun screenshot sur cette map.
      </p>
    );
  }
  return (
    <div className="flex items-center gap-1.5 overflow-hidden">
      {shots.map((shot) => (
        <Link
          key={shot.id}
          to={`/admin/geoguesser/shots/${shot.id}`}
          className="relative h-10 w-16 shrink-0 overflow-hidden rounded border border-atfr-gold/15 bg-atfr-graphite"
          title="Ouvrir le screenshot"
        >
          <img
            src={shot.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {shot.attempt_count === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-atfr-ink/80 text-[9px] text-atfr-fog text-center">
              0 stat
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

function MapForm({
  mapId,
  onClose,
}: {
  mapId: string | null;
  onClose: () => void;
}) {
  const list = useGeoMaps();
  const upsert = useUpsertMap();
  const existing = mapId ? list.data?.find((m) => m.id === mapId) : null;

  const [id, setId] = useState(existing?.id ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);
  const [widthM, setWidthM] = useState<number>(
    existing?.width_m ?? existing?.size_m ?? 1000,
  );
  const [heightM, setHeightM] = useState<number>(
    existing?.height_m ?? existing?.size_m ?? 1000,
  );
  const [kind, setKind] = useState<string>(existing?.kind ?? 'standard');
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !imageUrl) return;
    await upsert.mutateAsync({
      id: id.trim(),
      name: name.trim(),
      description: description || null,
      image_url: imageUrl,
      width_m: widthM,
      height_m: heightM,
      size_m: Math.max(widthM, heightM),
      kind,
      source: existing?.source ?? 'manual',
      sort_order: sortOrder,
      is_active: isActive,
    });
    onClose();
  }

  return (
    <CardBody className="p-5">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
        <input
          className="hidden"
          // hidden to preserve existing id; admins shouldn't rename slugs.
          readOnly
          value={id}
        />
        <div className="md:col-span-1">
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            ID (slug stable)
          </label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!existing}
            placeholder="ex. 12_himmelsdorf"
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone disabled:opacity-60"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Nom
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div className="md:col-span-2">
          <MediaPicker
            label="Minimap"
            kind="image"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Ordre
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Largeur (m)
          </label>
          <input
            type="number"
            min={100}
            max={5000}
            step={50}
            value={widthM}
            onChange={(e) => setWidthM(Number(e.target.value))}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Hauteur (m)
          </label>
          <input
            type="number"
            min={100}
            max={5000}
            step={50}
            value={heightM}
            onChange={(e) => setHeightM(Number(e.target.value))}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Type
          </label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          >
            <option value="standard">Standard</option>
            <option value="urban">Urbaine</option>
            <option value="open">Ouverte</option>
            <option value="winter">Enneigée</option>
            <option value="desert">Désertique</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] text-atfr-fog">
            Largeur × hauteur en mètres (1000 × 1000 par défaut) servent au
            calcul de la distance réelle entre le point joueur et le shot.
          </p>
        </div>
        <div className="flex items-center md:col-span-2">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            label={isActive ? 'Active' : 'Désactivée'}
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={upsert.isPending}>
            {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </CardBody>
  );
}
