import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
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
} from '@/features/geoguesser/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

type StatusFilter = 'all' | 'published' | 'draft';
type DifficultyFilter = QuizDifficulty | 'all';

export default function AdminGeoShots() {
  const [params] = useSearchParams();
  const initialMap = params.get('map') ?? 'all';
  const [mapFilter, setMapFilter] = useState<string>(initialMap);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [search, setSearch] = useState('');

  const maps = useGeoMaps();
  const shots = useGeoShots({
    mapId: mapFilter === 'all' ? undefined : mapFilter,
  });
  const remove = useDeleteShot();
  const dup = useDuplicateShot();

  const filtered = useMemo(() => {
    if (!shots.data) return [];
    const q = search.trim().toLowerCase();
    return shots.data.filter((s) => {
      if (status === 'published' && !s.is_published) return false;
      if (status === 'draft' && s.is_published) return false;
      if (difficulty !== 'all' && s.difficulty !== difficulty) return false;
      if (
        q &&
        !(s.caption ?? '').toLowerCase().includes(q) &&
        !s.tags.join(' ').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [shots.data, search, status, difficulty]);

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
            Académie · GeoGuesser
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Screenshots</h1>
          <p className="text-sm text-atfr-fog mt-1">
            {shots.data ? `${shots.data.length} screenshot(s)` : '—'}
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
        <CardBody className="p-4 grid gap-3 md:grid-cols-4">
          <Input
            label="Recherche"
            placeholder="Caption ou tag…"
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
        </CardBody>
      </Card>

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
            : 'Aucun screenshot. Crée le premier.'}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardBody className="p-0">
                <div className="aspect-video bg-atfr-graphite relative">
                  <img
                    src={s.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {s.map?.image_url && (
                    <div className="absolute bottom-2 right-2 h-16 w-16 rounded border border-atfr-gold/40 overflow-hidden bg-atfr-ink">
                      <div className="relative h-full w-full">
                        <img
                          src={s.map.image_url}
                          alt={s.map.name}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className="absolute -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-atfr-gold border border-atfr-ink"
                          style={{
                            left: `${s.x_pct * 100}%`,
                            top: `${s.y_pct * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {s.is_published ? (
                      <Badge variant="success">
                        <Eye size={10} className="inline" /> Publié
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        <EyeOff size={10} className="inline" /> Brouillon
                      </Badge>
                    )}
                    {s.map && <Badge variant="outline">{s.map.name}</Badge>}
                    <Badge variant="outline">
                      {DIFFICULTY_LABELS[s.difficulty]}
                    </Badge>
                  </div>
                  {s.caption && (
                    <p className="text-sm text-atfr-fog line-clamp-2">
                      {s.caption}
                    </p>
                  )}
                  <ShotStats shot={s} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link to={`/admin/geoguesser/shots/${s.id}`}>
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
                      onClick={() => dup.mutate(s.id)}
                      disabled={dup.isPending}
                    >
                      Dupliquer
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (confirm('Supprimer ce screenshot ?'))
                          remove.mutate(s.id);
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

interface ShotLike {
  attempt_count: number;
  correct_map_count: number;
  success_score_sum: number;
}

function ShotStats({ shot }: { shot: ShotLike }) {
  if (shot.attempt_count <= 0) {
    return (
      <p className="text-[11px] text-atfr-fog/70">
        Pas encore joué (0 tentative).
      </p>
    );
  }
  const mapRate = Math.round((shot.correct_map_count / shot.attempt_count) * 100);
  // success_score_sum is the cumulative "perf" (max - distance) sent by
  // the client. The mean rate is just an indicator (0..1) — higher means
  // the screen is generally easy.
  const meanPerf =
    shot.attempt_count > 0
      ? shot.success_score_sum / shot.attempt_count
      : 0;
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-atfr-fog">
      <span>
        <strong className="text-atfr-bone">{shot.attempt_count}</strong>{' '}
        tentative(s)
      </span>
      <span>· bonne map {mapRate}%</span>
      <span>· perf moy {Math.round(meanPerf)}</span>
    </div>
  );
}
