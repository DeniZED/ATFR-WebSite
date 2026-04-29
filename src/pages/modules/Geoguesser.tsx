import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Section,
  Select,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { Minimap } from '@/components/geoguesser/Minimap';
import { MapCarousel } from '@/components/geoguesser/MapCarousel';
import { IdentityBar } from '@/components/quiz/IdentityBar';
import { LeaderboardPanel } from '@/components/quiz/LeaderboardPanel';
import {
  useGeoMaps,
  usePublicGeoShots,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import { useSubmitScore } from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import {
  distance,
  maxScoreFor,
  roundScore,
  scoreTier,
} from '@/features/geoguesser/scoring';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

const MODULE_SLUG = 'wot-geoguesser';
const ROUNDS_PER_GAME = 5;
type DifficultyFilter = QuizDifficulty | 'all';

type Stage = 'intro' | 'playing' | 'reveal' | 'result';

interface RoundResult {
  shot: ShotWithMap;
  selectedMapId: string | null;
  selectedX: number | null;
  selectedY: number | null;
  correctMap: boolean;
  /** Normalized 0..√2; null when wrong map. */
  distance: number | null;
  score: number;
}

export default function Geoguesser() {
  const [stage, setStage] = useState<Stage>('intro');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  const maps = useGeoMaps({ activeOnly: true });
  const shots = usePublicGeoShots({ difficulty });
  const submitScore = useSubmitScore();
  const identity = usePlayerIdentity();

  const [pool, setPool] = useState<ShotWithMap[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [pickX, setPickX] = useState<number | null>(null);
  const [pickY, setPickY] = useState<number | null>(null);

  const current = pool[index];
  const total = pool.length;
  const totalScore = useMemo(
    () => results.reduce((acc, r) => acc + r.score, 0),
    [results],
  );

  // When advancing, reset per-round picks.
  useEffect(() => {
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
  }, [index, stage]);

  const selectedMap = useMemo(
    () => (maps.data ?? []).find((m) => m.id === selectedMapId) ?? null,
    [maps.data, selectedMapId],
  );

  function startGame() {
    if (!shots.data || shots.data.length === 0) return;
    const shuffled = [...shots.data].sort(() => Math.random() - 0.5);
    const subset = shuffled.slice(0, Math.min(ROUNDS_PER_GAME, shuffled.length));
    setPool(subset);
    setIndex(0);
    setResults([]);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setStage('playing');
  }

  function validate() {
    if (!current) return;
    const hasPick = pickX != null && pickY != null;
    const hasMap = !!selectedMapId;
    const correctMap = selectedMapId === current.map_id;
    let d: number | null = null;
    if (correctMap && hasPick) {
      d = distance(
        { x: pickX!, y: pickY! },
        { x: current.x_pct, y: current.y_pct },
      );
    }
    const s = roundScore({
      correctMap,
      distance: d ?? 0,
      difficulty: current.difficulty,
    });
    setResults((prev) => [
      ...prev,
      {
        shot: current,
        selectedMapId: hasMap ? selectedMapId : null,
        selectedX: hasPick ? pickX : null,
        selectedY: hasPick ? pickY : null,
        correctMap,
        distance: d,
        score: s,
      },
    ]);
    setStage('reveal');
  }

  async function nextRound() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setStage('playing');
      return;
    }
    // End of game: submit + show result.
    const finalScore = results.reduce((acc, r) => acc + r.score, 0);
    const max = maxScoreFor(pool.map((s) => s.difficulty));
    if (identity.nickname && pool.length > 0) {
      try {
        await submitScore.mutateAsync({
          module_slug: MODULE_SLUG,
          submode: difficulty === 'all' ? 'default' : difficulty,
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_account_id: identity.accountId,
          is_verified: identity.isVerified,
          score: finalScore,
          max_score: max,
          meta: {
            mode: 'standard',
            rounds: pool.length,
            difficulty,
          },
        });
      } catch {
        // Best-effort: never block the UX.
      }
    }
    setStage('result');
  }

  function restart() {
    setStage('intro');
    setPool([]);
    setIndex(0);
    setResults([]);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
  }

  // -----------------------------------------------------------------
  // Stage: intro
  // -----------------------------------------------------------------
  if (stage === 'intro') {
    return (
      <Section
        eyebrow="WoT GeoGuesseur"
        title="Devine la map et l’endroit"
        description="Un screenshot in-game. À toi de retrouver d'abord la map dans le carrousel, puis de cliquer sur la minimap pour pointer où il a été pris."
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            to="/modules"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold"
          >
            <ArrowLeft size={12} /> Retour à l'académie
          </Link>

          <IdentityBar />

          {shots.isLoading || maps.isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : shots.isError ? (
            <Alert tone="danger">{(shots.error as Error).message}</Alert>
          ) : !shots.data || shots.data.length === 0 ? (
            <Alert tone="warning" title="Pas encore de screenshot">
              L'éditeur travaille dessus. Reviens bientôt.
            </Alert>
          ) : (
            <Card>
              <CardBody className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-3 gap-3 text-center">
                  <Stat
                    label="Maps actives"
                    value={maps.data?.length ?? 0}
                  />
                  <Stat
                    label="Screenshots dispo"
                    value={shots.data.length}
                  />
                  <Stat label="Manches / partie" value={ROUNDS_PER_GAME} />
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
                    Difficulté
                  </p>
                  <Select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as DifficultyFilter)
                    }
                  >
                    <option value="all">Mixte (toutes)</option>
                    {(Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]).map(
                      (d) => (
                        <option key={d} value={d}>
                          {DIFFICULTY_LABELS[d]}
                        </option>
                      ),
                    )}
                  </Select>
                </div>

                <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 p-4 text-sm text-atfr-fog leading-relaxed space-y-1">
                  <p>
                    <strong className="text-atfr-bone">Score :</strong> jusqu'à{' '}
                    5 000 points par manche selon la précision (× difficulté).
                  </p>
                  <p>
                    <strong className="text-atfr-bone">Mauvaise map :</strong> 200
                    points × difficulté seulement.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={startGame}
                  disabled={!identity.nickname}
                  trailingIcon={<ArrowRight size={16} />}
                >
                  {!identity.nickname
                    ? 'Choisis d’abord un pseudo'
                    : 'Lancer une partie'}
                </Button>
              </CardBody>
            </Card>
          )}

          <LeaderboardPanel
            moduleSlug={MODULE_SLUG}
            submode={difficulty === 'all' ? 'default' : difficulty}
          />
        </div>
      </Section>
    );
  }

  // -----------------------------------------------------------------
  // Stage: playing or reveal (same screen, different overlay)
  // -----------------------------------------------------------------
  if ((stage === 'playing' || stage === 'reveal') && current) {
    const lastResult = results[index];
    const showReveal = stage === 'reveal' && lastResult;
    const correctMap = showReveal ? lastResult.shot.map : null;

    return (
      <Section
        eyebrow={`Manche ${index + 1} / ${total}`}
        title="Où ce screenshot a-t-il été pris ?"
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <ProgressBar total={total} currentIndex={index} results={results} />

          {/* Screenshot */}
          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <div className="aspect-video bg-atfr-graphite">
                <img
                  src={current.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {current.caption && (
                <p className="px-4 py-2 text-xs text-atfr-fog border-t border-atfr-gold/10">
                  {current.caption}
                </p>
              )}
            </CardBody>
          </Card>

          {/* Reveal banner */}
          <AnimatePresence>
            {showReveal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RevealBanner result={lastResult} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map carousel */}
          <Card>
            <CardBody className="p-4">
              <MapCarousel
                maps={maps.data ?? []}
                selectedId={
                  showReveal ? lastResult.shot.map_id : selectedMapId
                }
                onSelect={(id) => {
                  if (showReveal) return;
                  setSelectedMapId(id);
                  setPickX(null);
                  setPickY(null);
                }}
                disabled={!!showReveal}
              />
              {showReveal && lastResult.selectedMapId !== lastResult.shot.map_id && (
                <p className="mt-2 text-xs text-atfr-danger">
                  Mauvaise map :{' '}
                  <strong>
                    {(maps.data ?? []).find(
                      (m) => m.id === lastResult.selectedMapId,
                    )?.name ?? '—'}
                  </strong>{' '}
                  · Bonne map : <strong>{correctMap?.name ?? '—'}</strong>
                </p>
              )}
            </CardBody>
          </Card>

          {/* Minimap */}
          {(selectedMap || (showReveal && correctMap)) && (
            <Card>
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
                    {showReveal ? 'Révélation' : `Place ton point sur ${selectedMap?.name}`}
                  </p>
                  {showReveal && lastResult.distance != null && (
                    <Badge variant="outline">
                      Distance : {(lastResult.distance * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <Minimap
                  imageUrl={
                    showReveal && correctMap
                      ? correctMap.image_url
                      : selectedMap?.image_url ?? ''
                  }
                  player={
                    showReveal
                      ? lastResult.selectedX != null && lastResult.selectedY != null
                        ? { x: lastResult.selectedX, y: lastResult.selectedY }
                        : null
                      : pickX != null && pickY != null
                        ? { x: pickX, y: pickY }
                        : null
                  }
                  correct={
                    showReveal
                      ? { x: lastResult.shot.x_pct, y: lastResult.shot.y_pct }
                      : null
                  }
                  onPlace={
                    showReveal
                      ? undefined
                      : (x, y) => {
                          setPickX(x);
                          setPickY(y);
                        }
                  }
                  size="lg"
                />
              </CardBody>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {showReveal ? (
              <Button
                onClick={nextRound}
                trailingIcon={<ArrowRight size={14} />}
              >
                {index < total - 1 ? 'Manche suivante' : 'Voir le score final'}
              </Button>
            ) : (
              <Button
                onClick={validate}
                disabled={!selectedMapId}
                trailingIcon={<ArrowRight size={14} />}
              >
                Valider
              </Button>
            )}
          </div>
        </div>
      </Section>
    );
  }

  // -----------------------------------------------------------------
  // Stage: result
  // -----------------------------------------------------------------
  const max = maxScoreFor(pool.map((s) => s.difficulty));
  const pct = max > 0 ? (totalScore / max) * 100 : 0;
  const tier = scoreTier(pct);

  return (
    <Section eyebrow="Résultat final" title={tier.title}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80">
              Score
            </p>
            <p className="font-display text-6xl text-atfr-bone">
              {totalScore.toLocaleString('fr-FR')}{' '}
              <span className="text-atfr-fog text-3xl">
                / {max.toLocaleString('fr-FR')}
              </span>
            </p>
            <div className="h-2 w-full max-w-md mx-auto rounded-full bg-atfr-graphite overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="h-full bg-gradient-gold"
              />
            </div>
            <p className="text-atfr-fog max-w-xl mx-auto leading-relaxed">
              {tier.message}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                onClick={restart}
                leadingIcon={<RotateCcw size={14} />}
                variant="outline"
              >
                Recommencer
              </Button>
              <Link to="/modules">
                <Button variant="ghost">Retour à l'académie</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Per-round recap */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
            Détail des manches
          </p>
          <div className="grid gap-3">
            {results.map((r, i) => (
              <Card key={i}>
                <CardBody className="p-4 flex items-start gap-3 flex-wrap">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-atfr-graphite">
                    <img
                      src={r.shot.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-atfr-bone">
                      Manche {i + 1} —{' '}
                      <strong>{r.shot.map?.name ?? '?'}</strong>
                    </p>
                    <p className="text-xs text-atfr-fog mt-1 flex items-center gap-2 flex-wrap">
                      {r.correctMap ? (
                        <span className="inline-flex items-center gap-1 text-atfr-success">
                          <CheckCircle2 size={12} /> Bonne map
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-atfr-danger">
                          <XCircle size={12} /> Mauvaise map
                        </span>
                      )}
                      {r.distance != null && (
                        <span>
                          · Distance {(r.distance * 100).toFixed(1)}%
                        </span>
                      )}
                      <Badge variant="outline">
                        {DIFFICULTY_LABELS[r.shot.difficulty]}
                      </Badge>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl text-atfr-bone">
                      {r.score.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                      points
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <LeaderboardPanel
          moduleSlug={MODULE_SLUG}
          submode={difficulty === 'all' ? 'default' : difficulty}
        />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-2xl text-atfr-bone mt-1">{value}</p>
    </div>
  );
}

function ProgressBar({
  total,
  currentIndex,
  results,
}: {
  total: number;
  currentIndex: number;
  results: RoundResult[];
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const r = results[i];
        const isCurrent = i === currentIndex && !r;
        return (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              r
                ? r.correctMap
                  ? 'bg-atfr-success'
                  : 'bg-atfr-danger'
                : isCurrent
                  ? 'bg-atfr-gold'
                  : 'bg-atfr-graphite',
            )}
          />
        );
      })}
    </div>
  );
}

function RevealBanner({ result }: { result: RoundResult }) {
  return (
    <Card>
      <CardBody className="p-5 flex items-center gap-4 flex-wrap">
        <div
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-lg',
            result.correctMap
              ? 'bg-atfr-success/15 border border-atfr-success/40 text-atfr-success'
              : 'bg-atfr-danger/15 border border-atfr-danger/40 text-atfr-danger',
          )}
        >
          {result.correctMap ? <Target size={22} /> : <XCircle size={22} />}
        </div>
        <div className="flex-1">
          <p className="font-display text-lg text-atfr-bone">
            {result.correctMap
              ? result.distance != null && result.distance < 0.05
                ? 'Pile au bon endroit !'
                : 'Bonne map'
              : 'Mauvaise map'}
          </p>
          <p className="text-xs text-atfr-fog mt-0.5 flex items-center gap-2 flex-wrap">
            {result.correctMap && result.distance != null && (
              <span>Distance : {(result.distance * 100).toFixed(1)}%</span>
            )}
            <span>
              <Camera size={12} className="inline mr-1" />
              {result.shot.map?.name}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-atfr-bone">
            +{result.score.toLocaleString('fr-FR')}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
            points
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
