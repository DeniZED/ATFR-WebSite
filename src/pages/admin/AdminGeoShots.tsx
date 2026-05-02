import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  RotateCcw,
  SlidersHorizontal,
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
  useDeleteShot,
  useDuplicateShot,
  useGeoMaps,
  useGeoShots,
  useResetShotStats,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

type StatusFilter = 'all' | 'published' | 'draft';
type DifficultyFilter = QuizDifficulty | 'all';
type StatsFilter = 'all' | 'unplayed' | 'learning' | 'aligned' | 'needs-review';
type SortMode = 'order' | 'attempts' | 'map-rate' | 'perf-rate' | 'difficulty';

const DIFFICULTY_RANK: Record<QuizDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export default function AdminGeoShots() {
  const [params] = useSearchParams();
  const initialMap = params.get('map') ?? 'all';
  const [mapFilter, setMapFilter] = useState<string>(initialMap);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [statsFilter, setStatsFilter] = useState<StatsFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('order');
  const [search, setSearch] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const maps = useGeoMaps();
  const shots = useGeoShots({
    mapId: mapFilter === 'all' ? undefined : mapFilter,
  });
  const remove = useDeleteShot();
  const dup = useDuplicateShot();
  const resetShotStats = useResetShotStats();

  const enriched = useMemo(() => {
    return (shots.data ?? []).map((shot) => ({
      shot,
      stats: getShotStats(shot),
    }));
  }, [shots.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched
      .filter(({ shot, stats }) => {
        if (status === 'published' && !shot.is_published) return false;
        if (status === 'draft' && shot.is_published) return false;
        if (difficulty !== 'all' && shot.difficulty !== difficulty) {
          return false;
        }
        if (statsFilter !== 'all' && stats.health !== statsFilter) {
          return false;
        }
        if (
          q &&
          !(shot.caption ?? '').toLowerCase().includes(q) &&
          !shot.tags.join(' ').toLowerCase().includes(q) &&
          !(shot.map?.name ?? '').toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => sortShotCards(a, b, sortMode));
  }, [enriched, search, status, difficulty, statsFilter, sortMode]);

  const overview = useMemo(
    () => summarizeShots(filtered.map(({ shot }) => shot)),
    [filtered],
  );

  async function resetStatsForShot(shot: ShotWithMap) {
    if (
      !confirm(
        `Réinitialiser les stats du screenshot "${shot.map?.name ?? shot.id}" ? ` +
          'Les compteurs repassent à 0 et la difficulté redevient Facile.',
      )
    ) {
      return;
    }
    const affected = await resetShotStats.mutateAsync(shot.id);
    setResetMessage(
      affected > 0
        ? 'Stats du screenshot réinitialisées. La difficulté est repassée en Facile.'
        : 'Aucun screenshot modifie.',
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/geoguesser"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
          >
            <ArrowLeft size={12} /> GeoGuesser
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Académie - GeoGuesser
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Screenshots</h1>
          <p className="text-sm text-atfr-fog mt-1">
            {shots.data ? `${shots.data.length} screenshot(s)` : '-'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/geoguesser/shots/bulk${
              mapFilter !== 'all' ? `?map=${encodeURIComponent(mapFilter)}` : ''
            }`}
          >
            <Button variant="outline" leadingIcon={<Layers size={14} />}>
              Ajout en lot
            </Button>
          </Link>
          <Link to="/admin/geoguesser/shots/new">
            <Button leadingIcon={<Plus size={14} />}>Nouveau screenshot</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardBody className="p-4 grid gap-3 md:grid-cols-5">
          <Input
            label="Recherche"
            placeholder="Map, caption ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Map"
            value={mapFilter}
            onChange={(e) => setMapFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            {(maps.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select
            label="Statut"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">Tous</option>
            <option value="published">Publiés</option>
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
            label="Stats"
            value={statsFilter}
            onChange={(e) => setStatsFilter(e.target.value as StatsFilter)}
          >
            <option value="all">Toutes</option>
            <option value="unplayed">Jamais joués</option>
            <option value="learning">En apprentissage</option>
            <option value="aligned">Difficulté alignée</option>
            <option value="needs-review">A revoir bientot</option>
          </Select>
          <Select
            label="Tri"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="md:col-span-2"
          >
            <option value="order">Ordre admin</option>
            <option value="attempts">Plus joués</option>
            <option value="map-rate">Bonne map %</option>
            <option value="perf-rate">Perf moyenne %</option>
            <option value="difficulty">Difficulté</option>
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-atfr-gold" />
            <p className="font-display text-lg text-atfr-bone">
              Lecture des stats filtrées
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <OverviewStat label="Screens" value={overview.total} />
            <OverviewStat label="Publiés" value={overview.published} />
            <OverviewStat label="Tentatives" value={overview.attempts} />
            <OverviewStat
              label="Bonne map"
              value={overview.mapRatePct != null ? `${overview.mapRatePct}%` : '-'}
            />
            <OverviewStat
              label="Perf moy."
              value={
                overview.perfRatePct != null ? `${overview.perfRatePct}%` : '-'
              }
            />
          </div>
        </CardBody>
      </Card>

      {resetMessage && <Alert tone="success">{resetMessage}</Alert>}

      {resetShotStats.isError && (
        <Alert tone="danger" title="Reset impossible">
          {(resetShotStats.error as Error).message}
        </Alert>
      )}

      {shots.isError && (
        <Alert tone="danger" title="Erreur">
          {(shots.error as Error).message}
        </Alert>
      )}

      {shots.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          {shots.data && shots.data.length > 0
            ? 'Aucun screenshot ne correspond aux filtres.'
            : 'Aucun screenshot. Cree le premier.'}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ shot, stats }) => (
            <Card key={shot.id} className="overflow-hidden">
              <CardBody className="p-0">
                <div className="aspect-video bg-atfr-graphite relative">
                  <img
                    src={shot.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {shot.map?.image_url && (
                    <div className="absolute bottom-2 right-2 h-16 w-16 rounded border border-atfr-gold/40 overflow-hidden bg-atfr-ink">
                      <div className="relative h-full w-full">
                        <img
                          src={shot.map.image_url}
                          alt={shot.map.name}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className="absolute -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-atfr-gold border border-atfr-ink"
                          style={{
                            left: `${shot.x_pct * 100}%`,
                            top: `${shot.y_pct * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {shot.is_published ? (
                      <Badge variant="success">
                        <Eye size={10} className="inline" /> Publie
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        <EyeOff size={10} className="inline" /> Brouillon
                      </Badge>
                    )}
                    {shot.map && <Badge variant="outline">{shot.map.name}</Badge>}
                    <Badge variant="outline">
                      {DIFFICULTY_LABELS[shot.difficulty]}
                    </Badge>
                    <Badge variant={stats.badgeTone}>{stats.label}</Badge>
                  </div>

                  {shot.caption && (
                    <p className="text-sm text-atfr-fog line-clamp-2">
                      {shot.caption}
                    </p>
                  )}

                  <ShotStatsPanel stats={stats} />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link to={`/admin/geoguesser/shots/${shot.id}`}>
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
                      onClick={() => dup.mutate(shot.id)}
                      disabled={dup.isPending}
                    >
                      Dupliquer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      leadingIcon={<RotateCcw size={14} />}
                      onClick={() => resetStatsForShot(shot)}
                      disabled={resetShotStats.isPending}
                    >
                      Reset stats
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (confirm('Supprimer ce screenshot ?')) {
                          remove.mutate(shot.id);
                        }
                      }}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface ShotStatsInfo {
  attempts: number;
  mapRatePct: number | null;
  perfRatePct: number | null;
  meanPerf: number;
  nextDifficulty: QuizDifficulty;
  nextReviewAt: number;
  health: StatsFilter;
  label: string;
  badgeTone: 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';
  helper: string;
}

interface ShotsOverview {
  total: number;
  published: number;
  attempts: number;
  mapRatePct: number | null;
  perfRatePct: number | null;
}

function getShotStats(shot: ShotWithMap): ShotStatsInfo {
  const attempts = shot.attempt_count;
  const diagonal = getShotDiagonalM(shot);
  const maxPerf = attempts * diagonal;
  const mapRatePct =
    attempts > 0 ? Math.round((shot.correct_map_count / attempts) * 100) : null;
  const perfRatePct =
    attempts > 0 && maxPerf > 0
      ? Math.round(clamp(shot.success_score_sum / maxPerf, 0, 1) * 100)
      : null;
  const meanPerf =
    attempts > 0 ? Math.round(shot.success_score_sum / attempts) : 0;
  const nextDifficulty = difficultyFromPerfRate(perfRatePct ?? 0);
  const nextReviewAt = attempts < 10 ? 10 : Math.floor(attempts / 10) * 10 + 10;

  if (attempts === 0) {
    return {
      attempts,
      mapRatePct,
      perfRatePct,
      meanPerf,
      nextDifficulty: 'easy',
      nextReviewAt: 10,
      health: 'unplayed',
      label: 'Jamais joue',
      badgeTone: 'neutral',
      helper: 'Difficulté de départ : Facile.',
    };
  }

  if (attempts < 10) {
    return {
      attempts,
      mapRatePct,
      perfRatePct,
      meanPerf,
      nextDifficulty,
      nextReviewAt,
      health: 'learning',
      label: 'Apprentissage',
      badgeTone: 'warning',
      helper: `${10 - attempts} tentative(s) avant la première réévaluation.`,
    };
  }

  if (nextDifficulty !== shot.difficulty) {
    return {
      attempts,
      mapRatePct,
      perfRatePct,
      meanPerf,
      nextDifficulty,
      nextReviewAt,
      health: 'needs-review',
      label: 'A revoir',
      badgeTone: 'gold',
      helper: `Tendance ${DIFFICULTY_LABELS[nextDifficulty]}, prochaine réévaluation à ${nextReviewAt}.`,
    };
  }

  return {
    attempts,
    mapRatePct,
    perfRatePct,
    meanPerf,
    nextDifficulty,
    nextReviewAt,
    health: 'aligned',
    label: 'Aligne',
    badgeTone: 'success',
    helper: `Prochaine réévaluation automatique à ${nextReviewAt} tentatives.`,
  };
}

function getShotDiagonalM(shot: ShotWithMap): number {
  const width = shot.map?.width_m ?? shot.map?.size_m ?? 1000;
  const height = shot.map?.height_m ?? shot.map?.size_m ?? 1000;
  return Math.max(1, Math.hypot(width, height));
}

function difficultyFromPerfRate(ratePct: number): QuizDifficulty {
  if (ratePct >= 80) return 'expert';
  if (ratePct >= 60) return 'hard';
  if (ratePct >= 40) return 'medium';
  return 'easy';
}

function sortShotCards(
  a: { shot: ShotWithMap; stats: ShotStatsInfo },
  b: { shot: ShotWithMap; stats: ShotStatsInfo },
  sortMode: SortMode,
): number {
  if (sortMode === 'attempts') {
    return b.stats.attempts - a.stats.attempts;
  }
  if (sortMode === 'map-rate') {
    return (b.stats.mapRatePct ?? -1) - (a.stats.mapRatePct ?? -1);
  }
  if (sortMode === 'perf-rate') {
    return (b.stats.perfRatePct ?? -1) - (a.stats.perfRatePct ?? -1);
  }
  if (sortMode === 'difficulty') {
    return (
      DIFFICULTY_RANK[b.shot.difficulty] - DIFFICULTY_RANK[a.shot.difficulty]
    );
  }
  return (
    a.shot.sort_order - b.shot.sort_order ||
    Date.parse(b.shot.created_at) - Date.parse(a.shot.created_at)
  );
}

function summarizeShots(shots: ShotWithMap[]): ShotsOverview {
  let attempts = 0;
  let correctMaps = 0;
  let perfSum = 0;
  let maxPerf = 0;
  for (const shot of shots) {
    attempts += shot.attempt_count;
    correctMaps += shot.correct_map_count;
    perfSum += shot.success_score_sum;
    maxPerf += shot.attempt_count * getShotDiagonalM(shot);
  }
  return {
    total: shots.length,
    published: shots.filter((s) => s.is_published).length,
    attempts,
    mapRatePct:
      attempts > 0 ? Math.round((correctMaps / attempts) * 100) : null,
    perfRatePct: maxPerf > 0 ? Math.round(clamp(perfSum / maxPerf, 0, 1) * 100) : null,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function OverviewStat({
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
      <p className="font-display text-xl text-atfr-bone mt-0.5">{value}</p>
    </div>
  );
}

function ShotStatsPanel({ stats }: { stats: ShotStatsInfo }) {
  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/35 p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs text-atfr-fog">
        <SlidersHorizontal size={13} className="text-atfr-gold" />
        <span>{stats.helper}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniMetric label="Essais" value={stats.attempts} />
        <MiniMetric
          label="Map"
          value={stats.mapRatePct != null ? `${stats.mapRatePct}%` : '-'}
        />
        <MiniMetric
          label="Perf"
          value={stats.perfRatePct != null ? `${stats.perfRatePct}%` : '-'}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-atfr-fog">
        <span>Perf moyenne : {stats.meanPerf.toLocaleString('fr-FR')}</span>
        <span>Auto : {DIFFICULTY_LABELS[stats.nextDifficulty]}</span>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded bg-atfr-ink/50 px-2 py-1.5 min-w-0">
      <p className="text-[9px] uppercase tracking-[0.14em] text-atfr-fog truncate">
        {label}
      </p>
      <p className="text-sm text-atfr-bone tabular-nums">{value}</p>
    </div>
  );
}
