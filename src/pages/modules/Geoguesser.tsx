import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Map as MapIcon,
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
import { FloatingMapPicker } from '@/components/geoguesser/FloatingMapPicker';
import { RoundTimer } from '@/components/geoguesser/RoundTimer';
import { IdentityBar } from '@/components/quiz/IdentityBar';
import { LeaderboardPanel } from '@/components/quiz/LeaderboardPanel';
import {
  DEFAULT_GEO_SETTINGS,
  useGeoMaps,
  useGeoSettings,
  usePublicGeoShots,
  useRecordShotAttempt,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import { useSubmitScore } from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import {
  diagonalM,
  formatDistance,
  realDistanceM,
  roundScore,
  scoreTier,
  worstTotalFor,
  type RoundScoreResult,
  type RoundScoreSettings,
} from '@/features/geoguesser/scoring';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

const MODULE_SLUG = 'wot-geoguesser';
const ROUNDS_PER_GAME = 5;
const TUTORIAL_KEY = 'atfr.geoguesser.tutorial.seen.v1';
type DifficultyFilter = QuizDifficulty | 'all';

type Stage = 'intro' | 'playing' | 'reveal' | 'result';

interface RoundResult {
  shot: ShotWithMap;
  selectedMapId: string | null;
  selectedX: number | null;
  selectedY: number | null;
  correctMap: boolean;
  /** Distance pick ↔ shot en mètres (null si mauvaise map ou pas de pick). */
  distanceM: number | null;
  /** Score de la manche en mètres (lower-is-better). */
  score: number;
  kind: RoundScoreResult['kind'];
}

export default function Geoguesser() {
  const [stage, setStage] = useState<Stage>('intro');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');

  const maps = useGeoMaps({ activeOnly: true });
  const shots = usePublicGeoShots({ difficulty });
  const settings = useGeoSettings();
  const submitScore = useSubmitScore();
  const recordAttempt = useRecordShotAttempt();
  const identity = usePlayerIdentity();

  const cfg = settings.data ?? DEFAULT_GEO_SETTINGS;
  const roundTimeS = cfg.round_time_s;
  const malus: RoundScoreSettings = {
    wrongMapMalusM: cfg.wrong_map_malus_m,
    timeoutMalusM: cfg.timeout_malus_m,
  };

  const [pool, setPool] = useState<ShotWithMap[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [pickX, setPickX] = useState<number | null>(null);
  const [pickY, setPickY] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(roundTimeS);
  const [showTutorial, setShowTutorial] = useState(false);

  const current = pool[index];
  const total = pool.length;
  const totalScore = useMemo(
    () => results.reduce((acc, r) => acc + r.score, 0),
    [results],
  );

  // Reset per-round picks + timer when advancing.
  useEffect(() => {
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setSecondsLeft(roundTimeS);
  }, [index, stage, roundTimeS]);

  // 1Hz countdown only while playing.
  useEffect(() => {
    if (stage !== 'playing') return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [stage, index]);

  const selectedMap = useMemo(
    () => (maps.data ?? []).find((m) => m.id === selectedMapId) ?? null,
    [maps.data, selectedMapId],
  );

  function startGame() {
    if (!shots.data || shots.data.length === 0) return;
    const subset = pickPool(shots.data, ROUNDS_PER_GAME);
    if (subset.length === 0) return;
    setPool(subset);
    setIndex(0);
    setResults([]);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    if (typeof window !== 'undefined' && !localStorage.getItem(TUTORIAL_KEY)) {
      setShowTutorial(true);
    }
    setStage('playing');
  }

  function dismissTutorial() {
    setShowTutorial(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TUTORIAL_KEY, '1');
    }
  }

  function validate() {
    if (!current) return;
    const hasPick = pickX != null && pickY != null;
    const hasMap = !!selectedMapId;
    const correctMap = hasMap && selectedMapId === current.map_id;
    const widthM = current.map?.width_m ?? current.map?.size_m ?? 1000;
    const heightM = current.map?.height_m ?? current.map?.size_m ?? 1000;
    let d: number | null = null;
    if (correctMap && hasPick) {
      d = realDistanceM(
        { x: pickX!, y: pickY! },
        { x: current.x_pct, y: current.y_pct },
        widthM,
        heightM,
      );
    }
    const r = roundScore({
      correctMap,
      hasPick,
      distanceM: d ?? 0,
      settings: malus,
    });
    setResults((prev) => [
      ...prev,
      {
        shot: current,
        selectedMapId: hasMap ? selectedMapId : null,
        selectedX: hasPick ? pickX : null,
        selectedY: hasPick ? pickY : null,
        correctMap,
        distanceM: d,
        score: r.score,
        kind: r.kind,
      },
    ]);
    // Difficulté adaptative : on passe une "perf" 0..maxRound où plus
    // c'est élevé mieux c'est, pour que la RPC garde son comportement.
    const maxRound = diagonalM(widthM, heightM);
    const perf = Math.max(0, Math.round(maxRound - (d ?? maxRound)));
    recordAttempt.mutate(
      {
        shot_id: current.id,
        correct_map: correctMap,
        round_score: perf,
        max_round_score: Math.round(maxRound),
      },
      { onError: () => undefined },
    );
    setStage('reveal');
  }

  // Auto-validate when the timer expires.
  useEffect(() => {
    if (stage === 'playing' && secondsLeft === 0) {
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, secondsLeft]);

  async function nextRound() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setStage('playing');
      return;
    }
    // End of game: submit + show result.
    const finalScore = results.reduce((acc, r) => acc + r.score, 0);
    const worst = worstTotalFor(pool.length, malus);
    if (identity.nickname && pool.length > 0) {
      try {
        // Lower-is-better in-game ; pour que le leaderboard générique
        // (sort score DESC) classe correctement, on stocke
        // `score = worst - finalScore` (= "perf" : plus c'est haut, mieux
        // c'est). La distance réelle est conservée dans `meta.distance_m`
        // pour affichage / debug.
        await submitScore.mutateAsync({
          module_slug: MODULE_SLUG,
          submode: difficulty === 'all' ? 'default' : difficulty,
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_account_id: identity.accountId,
          is_verified: identity.isVerified,
          score: Math.max(0, worst - finalScore),
          max_score: worst,
          meta: {
            mode: 'distance',
            rounds: pool.length,
            difficulty,
            distance_m: finalScore,
          },
        });
      } catch {
        /* best-effort */
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
        description="Chaque manche : une capture in-game. Choisis la map dans le picker en bas-droite, puis clique sur la minimap pour pointer où le screen a été pris. Plus tu es proche, plus ton score est petit. Le but est d'avoir le score le plus bas possible."
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
                  <Stat label="Maps actives" value={maps.data?.length ?? 0} />
                  <Stat label="Screenshots dispo" value={shots.data.length} />
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
                    <strong className="text-atfr-bone">Score :</strong> distance
                    réelle entre ton pick et le shot, en mètres. Plus c'est
                    bas, mieux c'est.
                  </p>
                  <p>
                    <strong className="text-atfr-bone">Mauvaise map :</strong>{' '}
                    +{cfg.wrong_map_malus_m} m.{' '}
                    <strong className="text-atfr-bone">Time out :</strong>{' '}
                    +{cfg.timeout_malus_m} m.
                  </p>
                  <p>
                    <strong className="text-atfr-bone">Timer :</strong>{' '}
                    {roundTimeS} s par manche.
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
  // Stage: playing or reveal
  // -----------------------------------------------------------------
  if ((stage === 'playing' || stage === 'reveal') && current) {
    const lastResult = results[index];
    const showReveal = stage === 'reveal' && !!lastResult;
    const correctMap = showReveal ? lastResult.shot.map : null;
    const revealPlayer =
      showReveal &&
      lastResult.correctMap &&
      lastResult.selectedX != null &&
      lastResult.selectedY != null
        ? { x: lastResult.selectedX, y: lastResult.selectedY }
        : null;
    const revealCorrect = showReveal
      ? { x: lastResult.shot.x_pct, y: lastResult.shot.y_pct }
      : null;
    // Map shown in the picker overlay (placement or reveal).
    const overlayMap = showReveal && correctMap ? correctMap : selectedMap;

    return (
      <Section
        eyebrow={`Manche ${index + 1} / ${total}`}
        title="Où ce screenshot a-t-il été pris ?"
      >
        <div className="max-w-5xl mx-auto space-y-5">
          <ProgressBar total={total} currentIndex={index} results={results} />

          {/* Screenshot — overlays both timer (top-right) and floating
              picker (bottom-right) so the player never has to scroll. */}
          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <div className="relative aspect-video bg-atfr-graphite">
                <img
                  src={current.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {!showReveal && (
                  <div className="absolute top-3 right-3 z-20">
                    <RoundTimer
                      secondsLeft={secondsLeft}
                      total={roundTimeS}
                    />
                  </div>
                )}
                <FloatingMapPicker
                  maps={maps.data ?? []}
                  selectedMap={overlayMap}
                  onSelect={(id) => {
                    if (showReveal) return;
                    setSelectedMapId(id);
                    setPickX(null);
                    setPickY(null);
                  }}
                  onClearMap={() => {
                    if (showReveal) return;
                    setSelectedMapId(null);
                    setPickX(null);
                    setPickY(null);
                  }}
                  player={
                    showReveal
                      ? revealPlayer
                      : pickX != null && pickY != null
                        ? { x: pickX, y: pickY }
                        : null
                  }
                  correct={showReveal ? revealCorrect : null}
                  onPlace={
                    showReveal
                      ? undefined
                      : (x, y) => {
                          setPickX(x);
                          setPickY(y);
                        }
                  }
                  distanceLabel={
                    showReveal && lastResult.distanceM != null
                      ? formatDistance(lastResult.distanceM)
                      : null
                  }
                  disabled={!!showReveal && !revealCorrect}
                />

                {/* Tutorial overlay, first run only. */}
                <AnimatePresence>
                  {showTutorial && !showReveal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 bg-atfr-ink/85 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                      <TutorialCard
                        onClose={dismissTutorial}
                        roundTimeS={roundTimeS}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <RevealBanner result={lastResult} settings={malus} />
              </motion.div>
            )}
          </AnimatePresence>

          {showReveal && lastResult.selectedMapId !== lastResult.shot.map_id && (
            <Alert tone="danger">
              Mauvaise map :{' '}
              <strong>
                {(maps.data ?? []).find(
                  (m) => m.id === lastResult.selectedMapId,
                )?.name ?? '—'}
              </strong>{' '}
              · Bonne map : <strong>{correctMap?.name ?? '—'}</strong>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {showReveal ? (
              <Button
                onClick={nextRound}
                trailingIcon={<ArrowRight size={14} />}
              >
                {index < total - 1
                  ? 'Manche suivante'
                  : 'Voir le score final'}
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
  // Stage: result — lower is better, total = sum of distances.
  // -----------------------------------------------------------------
  const avg = pool.length > 0 ? totalScore / pool.length : 0;
  const tier = scoreTier(avg);
  const worst = worstTotalFor(pool.length, malus);
  // Clamp pct to 0..100 ; closer to 0 is better.
  const pct = worst > 0 ? Math.min(100, (totalScore / worst) * 100) : 0;

  return (
    <Section eyebrow="Résultat final" title={tier.title}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80">
              Score (plus bas = meilleur)
            </p>
            <p className="font-display text-6xl text-atfr-bone">
              {totalScore.toLocaleString('fr-FR')} m
            </p>
            <p className="text-sm text-atfr-fog">
              Moyenne par manche : {formatDistance(avg)}
            </p>
            <div className="h-2 w-full max-w-md mx-auto rounded-full bg-atfr-graphite overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${100 - pct}%` }}
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
                      {r.kind === 'distance' && (
                        <span className="inline-flex items-center gap-1 text-atfr-success">
                          <CheckCircle2 size={12} /> Bonne map
                        </span>
                      )}
                      {r.kind === 'wrong-map' && (
                        <span className="inline-flex items-center gap-1 text-atfr-danger">
                          <XCircle size={12} /> Mauvaise map
                        </span>
                      )}
                      {r.kind === 'timeout' && (
                        <span className="inline-flex items-center gap-1 text-atfr-warning">
                          <Clock size={12} /> Time out
                        </span>
                      )}
                      {r.distanceM != null && (
                        <span>· Distance {formatDistance(r.distanceM)}</span>
                      )}
                      <Badge variant="outline">
                        {DIFFICULTY_LABELS[r.shot.difficulty]}
                      </Badge>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl text-atfr-bone tabular-nums">
                      {r.score.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                      mètres
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
// Pool selection — Fisher-Yates + prefer one shot per map (variety),
// then dedup by id and image_url.
// ---------------------------------------------------------------------------
function pickPool(all: ShotWithMap[], n: number): ShotWithMap[] {
  if (all.length === 0) return [];
  // Group by map.
  const byMap = new Map<string, ShotWithMap[]>();
  for (const s of all) {
    const k = s.map_id ?? '_none';
    const arr = byMap.get(k) ?? [];
    arr.push(s);
    byMap.set(k, arr);
  }
  // Shuffle each bucket independently.
  for (const arr of byMap.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // Pick one shot per map first (random map order), then refill.
  const mapKeys = [...byMap.keys()];
  for (let i = mapKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mapKeys[i], mapKeys[j]] = [mapKeys[j], mapKeys[i]];
  }
  const out: ShotWithMap[] = [];
  const seenIds = new Set<string>();
  const seenImgs = new Set<string>();
  for (const k of mapKeys) {
    if (out.length >= n) break;
    const arr = byMap.get(k);
    if (!arr || arr.length === 0) continue;
    const s = arr.shift()!;
    if (seenIds.has(s.id) || seenImgs.has(s.image_url)) continue;
    seenIds.add(s.id);
    seenImgs.add(s.image_url);
    out.push(s);
  }
  // Refill from the remaining shots (still shuffled inside their bucket).
  if (out.length < n) {
    const rest: ShotWithMap[] = [];
    for (const arr of byMap.values()) rest.push(...arr);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    for (const s of rest) {
      if (out.length >= n) break;
      if (seenIds.has(s.id) || seenImgs.has(s.image_url)) continue;
      seenIds.add(s.id);
      seenImgs.add(s.image_url);
      out.push(s);
    }
  }
  return out;
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

function RevealBanner({
  result,
  settings,
}: {
  result: RoundResult;
  settings: RoundScoreSettings;
}) {
  const closeHit =
    result.kind === 'distance' &&
    result.distanceM != null &&
    result.distanceM < 80;
  const headline =
    result.kind === 'wrong-map'
      ? `Mauvaise map — +${settings.wrongMapMalusM} m de malus`
      : result.kind === 'timeout'
        ? `Time out — +${settings.timeoutMalusM} m de malus`
        : closeHit
          ? 'Pile au bon endroit !'
          : 'Bonne map';
  const tone =
    result.kind === 'distance'
      ? 'success'
      : result.kind === 'timeout'
        ? 'warning'
        : 'danger';
  const Icon =
    result.kind === 'distance'
      ? Target
      : result.kind === 'timeout'
        ? Clock
        : XCircle;
  const toneClass =
    tone === 'success'
      ? 'bg-atfr-success/15 border-atfr-success/40 text-atfr-success'
      : tone === 'warning'
        ? 'bg-atfr-warning/15 border-atfr-warning/40 text-atfr-warning'
        : 'bg-atfr-danger/15 border-atfr-danger/40 text-atfr-danger';
  return (
    <Card>
      <CardBody className="p-5 flex items-center gap-4 flex-wrap">
        <div
          className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-lg border',
            toneClass,
          )}
        >
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <p className="font-display text-lg text-atfr-bone">{headline}</p>
          <p className="text-xs text-atfr-fog mt-0.5 flex items-center gap-2 flex-wrap">
            {result.kind === 'distance' && result.distanceM != null && (
              <span>Distance : {formatDistance(result.distanceM)}</span>
            )}
            <span>
              <Camera size={12} className="inline mr-1" />
              {result.shot.map?.name}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-atfr-bone tabular-nums">
            {result.score.toLocaleString('fr-FR')}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
            mètres
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function TutorialCard({
  onClose,
  roundTimeS,
}: {
  onClose: () => void;
  roundTimeS: number;
}) {
  return (
    <Card className="max-w-md w-full">
      <CardBody className="p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Mini-tutoriel
          </p>
          <p className="font-display text-xl text-atfr-bone">
            Comment jouer ?
          </p>
        </div>
        <ol className="space-y-3 text-sm text-atfr-bone">
          <li className="flex gap-3">
            <Step n={1} />
            <span>
              <strong>Choisis la map</strong> dans la vignette en bas-droite —
              survole-la pour voir toutes les maps, ou clique pour ouvrir le
              choix.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>
              <strong>Clique sur la minimap</strong> qui s'affiche pour
              pointer où le screenshot a été pris. Bouton « ← Map » pour
              revenir au choix de la map.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>
              <strong>Valide avant la fin du timer</strong> ({roundTimeS}{' '}
              secondes). Plus ton pin est proche du shot, plus ton score est
              petit. Score le plus bas = meilleur joueur.
            </span>
          </li>
        </ol>
        <Button
          onClick={onClose}
          className="w-full"
          trailingIcon={<MapIcon size={14} />}
        >
          C'est parti
        </Button>
      </CardBody>
    </Card>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-atfr-gold/20 border border-atfr-gold/40 text-atfr-gold text-xs font-display">
      {n}
    </span>
  );
}
