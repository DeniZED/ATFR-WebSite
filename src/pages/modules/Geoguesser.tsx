import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Camera,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  EyeOff,
  Flame,
  Map as MapIcon,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Target,
  Trophy,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Section,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { FloatingMapPicker } from '@/components/geoguesser/FloatingMapPicker';
import { RoundTimer } from '@/components/geoguesser/RoundTimer';
import { IdentityBar } from '@/components/quiz/IdentityBar';
import {
  DEFAULT_GEO_SETTINGS,
  useGeoMaps,
  useGeoSettings,
  usePublicGeoShots,
  useRecordShotAttempt,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import {
  useLeaderboard,
  usePlayerModuleScores,
  useSubmitScore,
  type LeaderboardEntry,
} from '@/features/leaderboard/queries';
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
const TUTORIAL_KEY = 'atfr.geoguesser.tutorial.seen.v1';
type DifficultyFilter = QuizDifficulty | 'all';
type GameMode = 'daily' | 'random' | 'sprint' | 'blind';

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
  baseScore: number;
  timePenalty: number;
  elapsedSeconds: number;
  kind: RoundScoreResult['kind'];
}

interface DifficultyAvailability {
  mapCount: number;
  shotCount: number;
  requiredMapCount: number;
  requiredShotCount: number;
  disabled: boolean;
}

interface GeoguesserModeSettings {
  dailyRounds: number;
  randomRounds: number;
  sprintRounds: number;
  sprintRoundTimeS: number;
  sprintTimePenaltyM: number;
  blindRounds: number;
  blindPreviewSeconds: number;
  minMapsDaily: number;
  minMapsRandom: number;
  minMapsSprint: number;
  minMapsBlind: number;
}

export default function Geoguesser() {
  const [stage, setStage] = useState<Stage>('intro');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [gameMode, setGameMode] = useState<GameMode>('daily');

  const maps = useGeoMaps({ activeOnly: true });
  const allShots = usePublicGeoShots();
  const shots = usePublicGeoShots({ difficulty });
  const settings = useGeoSettings();
  const submitScore = useSubmitScore();
  const recordAttempt = useRecordShotAttempt();
  const identity = usePlayerIdentity();
  const playerScores = usePlayerModuleScores({
    moduleSlug: MODULE_SLUG,
    playerAnonId: identity.id,
    playerAccountId: identity.accountId,
  });

  const cfg = settings.data ?? DEFAULT_GEO_SETTINGS;
  const roundTimeS = cfg.round_time_s;
  const modeSettings = useMemo(() => getModeSettings(cfg), [cfg]);
  const roundTarget = getRoundTargetForMode(gameMode, modeSettings);
  const minMapRequirement = getMinMapRequirement(gameMode, modeSettings);
  const roundTimeLimitS = getRoundTimeLimit(gameMode, roundTimeS, modeSettings);
  const blindPreviewSeconds = getBlindPreviewSeconds(
    modeSettings,
    roundTimeLimitS,
  );
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
  const [secondsLeft, setSecondsLeft] = useState(roundTimeLimitS);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeChallengeKey, setActiveChallengeKey] = useState(
    getDailyChallengeKey(),
  );
  const [activeRoundTarget, setActiveRoundTarget] = useState(
    modeSettings.dailyRounds,
  );
  const [shareCopied, setShareCopied] = useState(false);

  const current = pool[index];
  const total = pool.length;
  const todayChallengeKey = getDailyChallengeKey();
  const displayChallengeKey =
    gameMode === 'daily' && stage !== 'intro'
      ? activeChallengeKey
      : todayChallengeKey;
  const displayRoundTarget =
    stage !== 'intro' ? activeRoundTarget : roundTarget;
  const leaderboardSubmode = getLeaderboardSubmode(
    gameMode,
    difficulty,
    displayChallengeKey,
    displayRoundTarget,
    modeSettings,
  );
  const totalScore = useMemo(
    () => results.reduce((acc, r) => acc + r.score, 0),
    [results],
  );
  const baseTotalScore = useMemo(
    () => results.reduce((acc, r) => acc + r.baseScore, 0),
    [results],
  );
  const totalTimePenalty = useMemo(
    () => results.reduce((acc, r) => acc + r.timePenalty, 0),
    [results],
  );
  const totalElapsedSeconds = useMemo(
    () => results.reduce((acc, r) => acc + r.elapsedSeconds, 0),
    [results],
  );
  const resultStats = useMemo(() => summarizeResults(results), [results]);
  const personalStats = useMemo(
    () => summarizePlayerScores(playerScores.data ?? []),
    [playerScores.data],
  );
  const difficultyAvailability = useMemo(
    () =>
      buildDifficultyAvailability(
        allShots.data ?? [],
        minMapRequirement,
        roundTarget,
      ),
    [allShots.data, minMapRequirement, roundTarget],
  );
  const selectedDifficultyAvailability = difficultyAvailability[difficulty];
  const canStartGame =
    !!identity.nickname &&
    !!selectedDifficultyAvailability &&
    !selectedDifficultyAvailability.disabled &&
    !shots.isLoading;
  const startDisabledReason = getStartDisabledReason(
    !!identity.nickname,
    selectedDifficultyAvailability,
  );

  // Reset per-round picks + timer when advancing.
  useEffect(() => {
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setSecondsLeft(roundTimeLimitS);
  }, [index, stage, roundTimeLimitS]);

  // 1Hz countdown only while playing.
  useEffect(() => {
    if (stage !== 'playing' || showTutorial) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [stage, index, showTutorial]);

  useEffect(() => {
    if (stage !== 'intro' || !allShots.data) return;
    if (!selectedDifficultyAvailability?.disabled) return;
    const fallback = getFirstAvailableDifficulty(difficultyAvailability);
    if (fallback && fallback !== difficulty) {
      setDifficulty(fallback);
    }
  }, [
    allShots.data,
    difficulty,
    difficultyAvailability,
    selectedDifficultyAvailability,
    stage,
  ]);

  const selectedMap = useMemo(
    () => (maps.data ?? []).find((m) => m.id === selectedMapId) ?? null,
    [maps.data, selectedMapId],
  );

  function startGame() {
    if (!canStartGame || !shots.data || shots.data.length === 0) return;
    const challengeKey = getDailyChallengeKey();
    const rounds = roundTarget;
    const subset =
      gameMode === 'daily'
        ? pickPool(
            sortShotsStable(shots.data),
            rounds,
            createSeededRandom(`${challengeKey}:${difficulty}:${rounds}`),
          )
        : pickPool(shots.data, rounds);
    if (subset.length === 0) return;
    setPool(subset);
    setIndex(0);
    setResults([]);
    setActiveChallengeKey(challengeKey);
    setActiveRoundTarget(rounds);
    setShareCopied(false);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setSecondsLeft(roundTimeLimitS);
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
    const elapsedSeconds = Math.max(0, roundTimeLimitS - secondsLeft);
    const timePenalty = getSprintTimePenalty(
      gameMode,
      r.kind,
      elapsedSeconds,
      modeSettings,
    );
    setResults((prev) => [
      ...prev,
      {
        shot: current,
        selectedMapId: hasMap ? selectedMapId : null,
        selectedX: hasPick ? pickX : null,
        selectedY: hasPick ? pickY : null,
        correctMap,
        distanceM: d,
        score: r.score + timePenalty,
        baseScore: r.score,
        timePenalty,
        elapsedSeconds,
        kind: r.kind,
      },
    ]);
    // Difficulté adaptative : on passe une "perf" 0..maxRound où plus
    // c'est élevé mieux c'est, pour que la RPC garde son comportement.
    const maxRound = diagonalM(widthM, heightM);
    const perf = Math.max(0, Math.round(maxRound - (d ?? maxRound)));
    // Les modes challenge ne recalibrent pas la difficulté des screenshots.
    if (gameMode === 'daily' || gameMode === 'random') {
      recordAttempt.mutate(
        {
          shot_id: current.id,
          correct_map: correctMap,
          round_score: perf,
          max_round_score: Math.round(maxRound),
        },
        { onError: () => undefined },
      );
    }
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
    const finalBaseScore = results.reduce((acc, r) => acc + r.baseScore, 0);
    const finalTimePenalty = results.reduce(
      (acc, r) => acc + r.timePenalty,
      0,
    );
    const finalElapsedSeconds = results.reduce(
      (acc, r) => acc + r.elapsedSeconds,
      0,
    );
    const worst = Math.max(
      1,
      getWorstTotalForMode(
        gameMode,
        pool.length,
        malus,
        roundTimeLimitS,
        modeSettings,
      ),
    );
    const finalStats = summarizeResults(results);
    if (identity.nickname && pool.length > 0) {
      try {
        // Lower-is-better in-game ; pour que le leaderboard générique
        // (sort score DESC) classe correctement, on stocke
        // `score = worst - finalScore` (= "perf" : plus c'est haut, mieux
        // c'est). La distance réelle est conservée dans `meta.distance_m`
        // pour affichage / debug.
        await submitScore.mutateAsync({
          module_slug: MODULE_SLUG,
          submode: getLeaderboardSubmode(
            gameMode,
            difficulty,
            activeChallengeKey,
            activeRoundTarget,
            modeSettings,
          ),
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_token: identity.playerToken,
          score: Math.max(0, worst - finalScore),
          max_score: worst,
          meta: {
            mode: gameMode === 'sprint' ? 'distance_time' : 'distance',
            game_mode: gameMode,
            daily_key: gameMode === 'daily' ? activeChallengeKey : null,
            daily_rounds: gameMode === 'daily' ? activeRoundTarget : null,
            rounds: pool.length,
            difficulty,
            distance_m: finalScore,
            raw_distance_m: finalBaseScore,
            time_penalty_m: finalTimePenalty,
            elapsed_seconds: finalElapsedSeconds,
            avg_distance_m: pool.length > 0 ? finalScore / pool.length : 0,
            map_accuracy_pct: finalStats.mapAccuracyPct,
            correct_maps: finalStats.correctMaps,
            wrong_maps: finalStats.wrongMaps,
            timeouts: finalStats.timeouts,
            best_streak: finalStats.bestStreak,
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
    setShareCopied(false);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
  }

  async function copyClanChallenge() {
    const modeLabel = formatModeLabel(gameMode, activeChallengeKey);
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/modules/wot-geoguesser`
        : '/modules/wot-geoguesser';
    const difficultyLabel =
      difficulty === 'all' ? 'mixte' : DIFFICULTY_LABELS[difficulty];
    const text = [
      `J'ai fait ${formatDistance(totalScore)} sur le GeoGuesseur ATFR (${modeLabel}, ${difficultyLabel}).`,
      `${resultStats.correctMaps}/${resultStats.rounds} maps trouvées, meilleure série ${resultStats.bestStreak}.`,
      `Qui me bat ? ${url}`,
    ].join(' ');
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
    } catch {
      setShareCopied(false);
    }
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
        <div className="mx-auto max-w-6xl space-y-6">
          <Link
            to="/modules"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold"
          >
            <ArrowLeft size={12} /> Retour à l'académie
          </Link>

          <IdentityBar />

          {shots.isLoading || allShots.isLoading || maps.isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : shots.isError || allShots.isError ? (
            <Alert tone="danger">
              {((shots.error ?? allShots.error) as Error).message}
            </Alert>
          ) : !shots.data || shots.data.length === 0 ? (
            <Alert tone="warning" title="Pas encore de screenshot">
              L'éditeur travaille dessus. Reviens bientôt.
            </Alert>
          ) : (
            <Card>
              <CardBody className="p-5 sm:p-7 space-y-6">
                <div className="grid gap-3 text-center sm:grid-cols-3">
                  <Stat label="Maps actives" value={maps.data?.length ?? 0} />
                  <Stat label="Screenshots dispo" value={shots.data.length} />
                  <Stat
                    label={gameMode === 'daily' ? 'Screens défi' : 'Manches'}
                    value={roundTarget}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
                  <div className="space-y-5">
                    <GameModeSelector
                      value={gameMode}
                      onChange={setGameMode}
                      challengeKey={displayChallengeKey}
                      modeSettings={modeSettings}
                    />

                    <DifficultyPicker
                      value={difficulty}
                      onChange={setDifficulty}
                      availability={difficultyAvailability}
                    />
                  </div>

                  <SetupSummaryPanel
                    gameMode={gameMode}
                    difficulty={difficulty}
                    roundTimeS={roundTimeLimitS}
                    roundTarget={roundTarget}
                    playableMapCount={
                      selectedDifficultyAvailability?.mapCount ?? 0
                    }
                    playableShotCount={
                      selectedDifficultyAvailability?.shotCount ?? 0
                    }
                    requiredMapCount={minMapRequirement}
                    wrongMapMalusM={cfg.wrong_map_malus_m}
                    timeoutMalusM={cfg.timeout_malus_m}
                    modeSettings={modeSettings}
                    hasNickname={!!identity.nickname}
                    canStart={canStartGame}
                    disabledReason={startDisabledReason}
                    onStart={startGame}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          <PersonalStatsPanel
            stats={personalStats}
            isLoading={playerScores.isLoading}
          />

          <GeoguesserLeaderboardPanel
            moduleSlug={MODULE_SLUG}
            submode={leaderboardSubmode}
            gameMode={gameMode}
            challengeKey={displayChallengeKey}
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
    const canValidate = !!selectedMapId && pickX != null && pickY != null;
    const roundElapsedSeconds = Math.max(0, roundTimeLimitS - secondsLeft);
    const blindPreviewLimitS = blindPreviewSeconds;
    const blindPreviewLeft = Math.ceil(
      Math.max(0, blindPreviewLimitS - roundElapsedSeconds),
    );
    const isBlindCurtainVisible =
      gameMode === 'blind' &&
      !showReveal &&
      !showTutorial &&
      roundElapsedSeconds >= blindPreviewLimitS;

    return (
      <Section
        eyebrow={`Manche ${index + 1} / ${total}`}
        title="Où ce screenshot a-t-il été pris ?"
      >
        <div className="max-w-[min(96vw,1440px)] mx-auto space-y-5">
          <ProgressBar total={total} currentIndex={index} results={results} />
          <RoundStatusBar
            stats={resultStats}
            totalScore={totalScore}
            gameMode={gameMode}
            challengeKey={activeChallengeKey}
            difficulty={difficulty}
          />

          {/* Screenshot — overlays both timer (top-right) and floating
              picker (bottom-right) so the player never has to scroll. */}
          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <div className="relative h-[min(72vh,760px)] min-h-[320px] bg-atfr-graphite">
                <img
                  src={current.image_url}
                  alt=""
                  className={cn(
                    'h-full w-full object-cover transition-opacity duration-300',
                    isBlindCurtainVisible && 'opacity-0',
                  )}
                />
                {gameMode === 'blind' && !showReveal && (
                  <div className="absolute left-3 top-3 z-20 rounded-md border border-atfr-gold/30 bg-atfr-ink/85 px-3 py-2 text-xs text-atfr-bone backdrop-blur">
                    <span className="inline-flex items-center gap-1">
                      <EyeOff size={13} className="text-atfr-gold" />
                      {isBlindCurtainVisible
                        ? 'Screen masqué'
                        : `Mémoire ${blindPreviewLeft}s`}
                    </span>
                  </div>
                )}
                <AnimatePresence>
                  {isBlindCurtainVisible && (
                    <BlindGuessCurtain previewSeconds={blindPreviewLimitS} />
                  )}
                </AnimatePresence>
                {!showReveal && (
                  <div className="absolute top-3 right-3 z-20">
                    <RoundTimer
                      secondsLeft={secondsLeft}
                      total={roundTimeLimitS}
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
                        roundTimeS={roundTimeLimitS}
                        gameMode={gameMode}
                        modeSettings={modeSettings}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {current.caption && (gameMode !== 'blind' || showReveal) && (
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

          <RoundActionDock
            showReveal={showReveal}
            canValidate={canValidate}
            selectedMapName={selectedMap?.name ?? null}
            hasPick={pickX != null && pickY != null}
            currentIndex={index}
            total={total}
            totalScore={totalScore}
            secondsLeft={secondsLeft}
            gameMode={gameMode}
            onValidate={validate}
            onNext={nextRound}
          />
        </div>
      </Section>
    );
  }

  // -----------------------------------------------------------------
  // Stage: result — lower is better, total = sum of distances.
  // -----------------------------------------------------------------
  const avg = pool.length > 0 ? totalScore / pool.length : 0;
  const tier = scoreTier(avg);
  const worst = Math.max(
    1,
    getWorstTotalForMode(
      gameMode,
      pool.length,
      malus,
      roundTimeLimitS,
      modeSettings,
    ),
  );
  // Clamp pct to 0..100 ; closer to 0 is better.
  const pct = worst > 0 ? Math.min(100, (totalScore / worst) * 100) : 0;

  return (
    <Section eyebrow="Résultat final" title={tier.title}>
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardBody className="p-8 text-center space-y-5">
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant={getModeBadgeVariant(gameMode)}>
                {formatModeLabel(gameMode, activeChallengeKey)}
              </Badge>
              <Badge variant="outline">
                {difficulty === 'all' ? 'Mixte' : DIFFICULTY_LABELS[difficulty]}
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80">
              {gameMode === 'sprint'
                ? 'Score sprint (distance + chrono)'
                : 'Score (plus bas = meilleur)'}
            </p>
            <p className="font-display text-5xl sm:text-6xl text-atfr-bone">
              {formatDistance(totalScore)}
            </p>
            <p className="text-sm text-atfr-fog">
              Moyenne par manche : {formatDistance(avg)}
            </p>
            {gameMode === 'sprint' && (
              <p className="text-xs text-atfr-fog">
                Distance brute {formatDistance(baseTotalScore)} · chrono{' '}
                {formatDuration(totalElapsedSeconds)} · pénalité{' '}
                {formatDistance(totalTimePenalty)}
              </p>
            )}
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
                onClick={startGame}
                leadingIcon={<RotateCcw size={14} />}
              >
                Rejouer même difficulté
              </Button>
              <Button
                onClick={copyClanChallenge}
                leadingIcon={<Copy size={14} />}
                variant="outline"
              >
                {shareCopied ? 'Défi copié' : 'Défier le clan'}
              </Button>
              <Button
                onClick={restart}
                leadingIcon={<RotateCcw size={14} />}
                variant="outline"
              >
                Changer de mode
              </Button>
              <Link to="/modules">
                <Button variant="ghost">Retour à l'académie</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <ResultInsights stats={resultStats} />

        <PersonalStatsPanel
          stats={personalStats}
          isLoading={playerScores.isLoading || playerScores.isFetching}
        />

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
                      {r.timePenalty > 0 && (
                        <span>
                          · Chrono +{formatDistance(r.timePenalty)} (
                          {formatDuration(r.elapsedSeconds)})
                        </span>
                      )}
                      <Badge variant="outline">
                        {DIFFICULTY_LABELS[r.shot.difficulty]}
                      </Badge>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl text-atfr-bone tabular-nums">
                      {formatDistance(r.score)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                      score
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <GeoguesserLeaderboardPanel
          moduleSlug={MODULE_SLUG}
          submode={leaderboardSubmode}
          gameMode={gameMode}
          challengeKey={activeChallengeKey}
        />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Game helpers
// ---------------------------------------------------------------------------

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function getDailyChallengeKey(date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (year && month && day) return `${year}-${month}-${day}`;
  } catch {
    /* fallback below */
  }
  return date.toISOString().slice(0, 10);
}

function formatChallengeDate(key: string): string {
  const [, month, day] = key.split('-');
  return month && day ? `${day}/${month}` : key;
}

function getModeSettings(
  settings: typeof DEFAULT_GEO_SETTINGS,
): GeoguesserModeSettings {
  return {
    dailyRounds: clampNumber(settings.daily_challenge_rounds, 1, 20),
    randomRounds: clampNumber(settings.random_rounds, 1, 20),
    sprintRounds: clampNumber(settings.sprint_rounds, 1, 30),
    sprintRoundTimeS: clampNumber(settings.sprint_round_time_s, 5, 120),
    sprintTimePenaltyM: clampNumber(settings.sprint_time_penalty_m, 0, 1000),
    blindRounds: clampNumber(settings.blind_rounds, 1, 20),
    blindPreviewSeconds: clampNumber(settings.blind_preview_seconds, 1, 60),
    minMapsDaily: clampNumber(settings.min_maps_daily, 1, 100),
    minMapsRandom: clampNumber(settings.min_maps_random, 1, 100),
    minMapsSprint: clampNumber(settings.min_maps_sprint, 1, 100),
    minMapsBlind: clampNumber(settings.min_maps_blind, 1, 100),
  };
}

function getRoundTargetForMode(
  mode: GameMode,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'daily') return settings.dailyRounds;
  if (mode === 'sprint') return settings.sprintRounds;
  if (mode === 'blind') return settings.blindRounds;
  return settings.randomRounds;
}

function getMinMapRequirement(
  mode: GameMode,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'daily') return settings.minMapsDaily;
  if (mode === 'sprint') return settings.minMapsSprint;
  if (mode === 'blind') return settings.minMapsBlind;
  return settings.minMapsRandom;
}

function getRoundTimeLimit(
  mode: GameMode,
  roundTimeS: number,
  settings: GeoguesserModeSettings,
): number {
  if (mode === 'sprint') {
    return settings.sprintRoundTimeS;
  }
  return roundTimeS;
}

function getBlindPreviewSeconds(
  settings: GeoguesserModeSettings,
  roundTimeS: number,
): number {
  return Math.min(settings.blindPreviewSeconds, roundTimeS);
}

function getSprintTimePenalty(
  mode: GameMode,
  kind: RoundScoreResult['kind'],
  elapsedSeconds: number,
  settings: GeoguesserModeSettings,
): number {
  if (mode !== 'sprint' || kind !== 'distance') return 0;
  return Math.round(Math.max(0, elapsedSeconds) * settings.sprintTimePenaltyM);
}

function getWorstTotalForMode(
  mode: GameMode,
  rounds: number,
  scoreSettings: RoundScoreSettings,
  roundTimeS: number,
  modeSettings: GeoguesserModeSettings,
): number {
  const baseWorst = worstTotalFor(rounds, scoreSettings);
  if (mode !== 'sprint') return baseWorst;
  const sprintWorst =
    rounds *
    (scoreSettings.timeoutMalusM +
      roundTimeS * modeSettings.sprintTimePenaltyM);
  return Math.max(baseWorst, sprintWorst);
}

function formatModeLabel(mode: GameMode, challengeKey: string): string {
  if (mode === 'daily') return `Défi ${formatChallengeDate(challengeKey)}`;
  if (mode === 'sprint') return 'Sprint';
  if (mode === 'blind') return 'Blind Guess';
  return 'Série libre';
}

function formatGenericModeLabel(mode: GameMode): string {
  if (mode === 'daily') return 'Challenge du jour';
  return formatModeLabel(mode, getDailyChallengeKey());
}

function formatScoreModeLabel(mode: GameMode, dailyKey?: string | null): string {
  if (mode === 'daily' && dailyKey) return formatModeLabel(mode, dailyKey);
  return formatGenericModeLabel(mode);
}

function getStartButtonLabel(mode: GameMode): string {
  if (mode === 'daily') return 'Lancer le challenge';
  if (mode === 'sprint') return 'Lancer le sprint';
  if (mode === 'blind') return 'Lancer Blind Guess';
  return 'Lancer une série';
}

function getDifficultyDetail(difficulty: QuizDifficulty): string {
  if (difficulty === 'easy') return 'Repères évidents';
  if (difficulty === 'medium') return 'Lecture de map';
  if (difficulty === 'hard') return 'Zones piégeuses';
  return 'Micro-repères';
}

function getDifficultyDotClass(difficulty: DifficultyFilter): string {
  if (difficulty === 'easy') return 'border-atfr-success bg-atfr-success';
  if (difficulty === 'medium') return 'border-atfr-gold bg-atfr-gold';
  if (difficulty === 'hard') return 'border-atfr-warning bg-atfr-warning';
  if (difficulty === 'expert') return 'border-atfr-danger bg-atfr-danger';
  return 'border-atfr-fog bg-atfr-fog';
}

function buildDifficultyAvailability(
  shots: ShotWithMap[],
  requiredMapCount: number,
  requiredShotCount: number,
): Record<DifficultyFilter, DifficultyAvailability> {
  const empty = (): DifficultyAvailability => ({
    mapCount: 0,
    shotCount: 0,
    requiredMapCount,
    requiredShotCount,
    disabled: requiredMapCount > 0,
  });
  const result: Record<DifficultyFilter, DifficultyAvailability> = {
    all: empty(),
    easy: empty(),
    medium: empty(),
    hard: empty(),
    expert: empty(),
  };
  const byDifficulty: Record<DifficultyFilter, Set<string>> = {
    all: new Set<string>(),
    easy: new Set<string>(),
    medium: new Set<string>(),
    hard: new Set<string>(),
    expert: new Set<string>(),
  };
  const shotCounts: Record<DifficultyFilter, number> = {
    all: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  };

  for (const shot of shots) {
    byDifficulty.all.add(shot.map_id);
    byDifficulty[shot.difficulty].add(shot.map_id);
    shotCounts.all += 1;
    shotCounts[shot.difficulty] += 1;
  }

  for (const key of Object.keys(result) as DifficultyFilter[]) {
    const mapCount = byDifficulty[key].size;
    result[key] = {
      mapCount,
      shotCount: shotCounts[key],
      requiredMapCount,
      requiredShotCount,
      disabled:
        mapCount < requiredMapCount || shotCounts[key] < requiredShotCount,
    };
  }

  return result;
}

function getFirstAvailableDifficulty(
  availability: Record<DifficultyFilter, DifficultyAvailability>,
): DifficultyFilter | null {
  const preferred: DifficultyFilter[] = [
    'all',
    'easy',
    'medium',
    'hard',
    'expert',
  ];
  return (
    preferred.find((difficulty) => !availability[difficulty].disabled) ?? null
  );
}

function getStartDisabledReason(
  hasNickname: boolean,
  availability: DifficultyAvailability | undefined,
): string | null {
  if (!hasNickname) return 'Choisis d’abord un pseudo';
  if (!availability?.disabled) return null;
  if (availability.mapCount < availability.requiredMapCount) {
    return `Il faut ${availability.requiredMapCount} maps minimum pour ce mode.`;
  }
  return `Il faut ${availability.requiredShotCount} screenshots minimum pour ce mode.`;
}

function getRoundActionStatus(
  selectedMapName: string | null,
  hasPick: boolean,
  showReveal: boolean,
): { label: string; detail: string; cta: string } {
  if (showReveal) {
    return {
      label: 'Révélation',
      detail: 'Compare ton point avec la position correcte.',
      cta: 'Continuer',
    };
  }
  if (!selectedMapName) {
    return {
      label: 'Étape 1',
      detail: 'Ouvre le sélecteur de map en bas à droite et choisis la minimap.',
      cta: 'Choisis une map',
    };
  }
  if (!hasPick) {
    return {
      label: 'Étape 2',
      detail: `${selectedMapName} sélectionnée. Clique sur la minimap pour poser ton point.`,
      cta: 'Place ton point',
    };
  }
  return {
    label: 'Prêt',
    detail: `${selectedMapName} sélectionnée. Tu peux valider ou déplacer ton point.`,
    cta: 'Valider',
  };
}

type BadgeVariant = 'neutral' | 'gold' | 'success' | 'warning' | 'danger' | 'outline';

function getModeBadgeVariant(mode: GameMode): BadgeVariant {
  if (mode === 'daily') return 'gold';
  if (mode === 'sprint') return 'warning';
  if (mode === 'blind') return 'neutral';
  return 'outline';
}

function getTrendBadgeVariant(tone: PersonalTrend['tone']): BadgeVariant {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  return 'outline';
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest.toString().padStart(2, '0')}s` : `${rest}s`;
}

function getLeaderboardSubmode(
  mode: GameMode,
  difficulty: DifficultyFilter,
  challengeKey: string,
  dailyRounds: number,
  settings: GeoguesserModeSettings,
): string {
  const difficultyKey = difficulty === 'all' ? 'default' : difficulty;
  if (mode === 'daily') {
    return `daily:${challengeKey}:${difficultyKey}:${dailyRounds}`;
  }
  if (mode === 'sprint') {
    return `sprint:${difficultyKey}:${settings.sprintRounds}`;
  }
  if (mode === 'blind') {
    return `blind:${difficultyKey}:${settings.blindRounds}`;
  }
  return settings.randomRounds === 5
    ? difficultyKey
    : `random:${difficultyKey}:${settings.randomRounds}`;
}

function createSeededRandom(seed: string): () => number {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getMetaNumber(
  meta: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  const value = meta?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getMetaString(
  meta: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = meta?.[key];
  return typeof value === 'string' ? value : null;
}

function sortShotsStable(shots: ShotWithMap[]): ShotWithMap[] {
  return [...shots].sort((a, b) => {
    const map = a.map_id.localeCompare(b.map_id);
    if (map !== 0) return map;
    return a.id.localeCompare(b.id);
  });
}

// ---------------------------------------------------------------------------
// Pool selection — Fisher-Yates + prefer one shot per map (variety),
// then dedup by id and image_url.
// ---------------------------------------------------------------------------
function pickPool(
  all: ShotWithMap[],
  n: number,
  rng: () => number = Math.random,
): ShotWithMap[] {
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
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  // Pick one shot per map first (random map order), then refill.
  const mapKeys = [...byMap.keys()];
  for (let i = mapKeys.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
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
      const j = Math.floor(rng() * (i + 1));
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

interface RoundInsight {
  round: number;
  result: RoundResult;
}

interface ResultStats {
  rounds: number;
  correctMaps: number;
  wrongMaps: number;
  timeouts: number;
  mapAccuracyPct: number;
  currentStreak: number;
  bestStreak: number;
  best: RoundInsight | null;
  toughest: RoundInsight | null;
  advice: string;
}

interface PersonalModeStat {
  mode: GameMode;
  games: number;
  bestScoreM: number;
  avgScoreM: number;
  bestRatio: number;
}

interface PersonalRecentScore {
  id: string;
  mode: GameMode;
  scoreM: number;
  rounds: number | null;
  mapAccuracyPct: number | null;
  dailyKey: string | null;
  createdAt: string;
  ratio: number;
}

interface PersonalTrend {
  label: string;
  detail: string;
  tone: 'success' | 'warning' | 'neutral';
}

interface PersonalStats {
  games: number;
  gamesLast7Days: number;
  bestScoreM: number | null;
  avgScoreM: number | null;
  avgMapAccuracyPct: number | null;
  bestStreak: number;
  bestMode: PersonalModeStat | null;
  modes: PersonalModeStat[];
  recent: PersonalRecentScore[];
  trend: PersonalTrend | null;
}

function summarizeResults(results: RoundResult[]): ResultStats {
  let best: RoundInsight | null = null;
  let toughest: RoundInsight | null = null;
  let correctMaps = 0;
  let wrongMaps = 0;
  let timeouts = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  results.forEach((result, index) => {
    const current = { round: index + 1, result };
    if (result.correctMap) {
      correctMaps += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    if (result.kind === 'wrong-map') wrongMaps += 1;
    if (result.kind === 'timeout') timeouts += 1;

    if (
      result.kind === 'distance' &&
      result.distanceM != null &&
      (!best || result.distanceM < (best.result.distanceM ?? Infinity))
    ) {
      best = current;
    }

    if (!toughest || result.score > toughest.result.score) {
      toughest = current;
    }
  });

  const rounds = results.length;
  const mapAccuracyPct =
    rounds > 0 ? Math.round((correctMaps / rounds) * 100) : 0;

  return {
    rounds,
    correctMaps,
    wrongMaps,
    timeouts,
    mapAccuracyPct,
    currentStreak,
    bestStreak,
    best,
    toughest,
    advice: buildResultAdvice({
      rounds,
      correctMaps,
      wrongMaps,
      timeouts,
      best,
    }),
  };
}

function buildResultAdvice({
  rounds,
  correctMaps,
  wrongMaps,
  timeouts,
  best,
}: Pick<
  ResultStats,
  'rounds' | 'correctMaps' | 'wrongMaps' | 'timeouts' | 'best'
>): string {
  if (rounds === 0) return 'Lance une partie pour obtenir une lecture utile.';
  if (timeouts > 0) {
    return 'Pose un point approximatif dès que tu as une intuition : même imparfait, un pick joué bat souvent un time out.';
  }
  if (wrongMaps >= Math.ceil(rounds / 2)) {
    return 'Travaille d’abord la silhouette des minimaps : chemins de fer, lignes d’eau et gros reliefs donnent souvent la map avant les détails.';
  }
  if (correctMaps < rounds) {
    return 'Tu lis déjà plusieurs maps. Pour gratter des mètres, repère les spawns, bases et couloirs de tir visibles sur le screen.';
  }
  if (best?.result.distanceM != null && best.result.distanceM < 100) {
    return 'Très propre : garde cette méthode, puis cherche les micro-repères pour stabiliser les manches plus dures.';
  }
  return 'Bonne lecture globale. Le prochain palier se joue sur la précision du pin, pas seulement sur le choix de map.';
}

function buildRoundFeedback(result: RoundResult): string {
  if (result.kind === 'timeout') {
    return 'Même sans certitude, pose un point tôt : tu peux toujours le déplacer avant de valider.';
  }
  if (result.kind === 'wrong-map') {
    return 'Mauvaise map : compare les grands repères de minimap avant les détails du screenshot.';
  }
  if (
    result.selectedX == null ||
    result.selectedY == null ||
    result.distanceM == null
  ) {
    return 'Bonne map. Rejoue les zones autour des bases pour gagner en précision.';
  }

  const dx = result.selectedX - result.shot.x_pct;
  const dy = result.selectedY - result.shot.y_pct;
  const horizontal =
    Math.abs(dx) < 0.06 ? null : dx > 0 ? 'à l’est' : 'à l’ouest';
  const vertical =
    Math.abs(dy) < 0.06 ? null : dy > 0 ? 'au sud' : 'au nord';
  const direction = [vertical, horizontal].filter(Boolean).join(' et ');

  if (result.distanceM < 80) {
    return 'Excellent placement : tu as identifié la bonne zone et les micro-repères.';
  }
  if (direction) {
    return `Bonne map, mais ton point est trop ${direction}. Recale-toi avec les bases, reliefs et lignes de tir.`;
  }
  return 'Bonne map : tu es dans le bon secteur, il manque surtout un repère fin pour verrouiller le pin.';
}

function summarizePlayerScores(entries: LeaderboardEntry[]): PersonalStats {
  const parsed = entries
    .map((entry) => {
      const scoreM =
        getMetaNumber(entry.meta, 'distance_m') ??
        Math.max(0, entry.max_score - entry.score);
      return {
        entry,
        mode: getEntryGameMode(entry),
        scoreM,
        rounds: getMetaNumber(entry.meta, 'rounds'),
        mapAccuracyPct: getMetaNumber(entry.meta, 'map_accuracy_pct'),
        dailyKey: getMetaString(entry.meta, 'daily_key'),
        bestStreak: getMetaNumber(entry.meta, 'best_streak') ?? 0,
        createdMs: new Date(entry.created_at).getTime(),
      };
    })
    .filter((item) => Number.isFinite(item.scoreM))
    .sort((a, b) => b.createdMs - a.createdMs);

  if (parsed.length === 0) {
    return {
      games: 0,
      gamesLast7Days: 0,
      bestScoreM: null,
      avgScoreM: null,
      avgMapAccuracyPct: null,
      bestStreak: 0,
      bestMode: null,
      modes: [],
      recent: [],
      trend: null,
    };
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const mapAccuracyValues = parsed
    .map((item) => item.mapAccuracyPct)
    .filter((value): value is number => value != null);
  const modes = new Map<GameMode, typeof parsed>();
  for (const item of parsed) {
    const list = modes.get(item.mode) ?? [];
    list.push(item);
    modes.set(item.mode, list);
  }
  const modeStats = [...modes.entries()]
    .map(([mode, items]) => ({
      mode,
      games: items.length,
      bestScoreM: Math.min(...items.map((item) => item.scoreM)),
      avgScoreM:
        items.reduce((acc, item) => acc + item.scoreM, 0) / items.length,
      bestRatio: Math.max(...items.map((item) => item.entry.ratio)),
    }))
    .sort((a, b) => b.bestRatio - a.bestRatio || b.games - a.games);

  return {
    games: parsed.length,
    gamesLast7Days: parsed.filter((item) => item.createdMs >= weekAgo).length,
    bestScoreM: Math.min(...parsed.map((item) => item.scoreM)),
    avgScoreM:
      parsed.reduce((acc, item) => acc + item.scoreM, 0) / parsed.length,
    avgMapAccuracyPct:
      mapAccuracyValues.length > 0
        ? Math.round(
            mapAccuracyValues.reduce((acc, value) => acc + value, 0) /
              mapAccuracyValues.length,
          )
        : null,
    bestStreak: Math.max(...parsed.map((item) => item.bestStreak)),
    bestMode: modeStats[0] ?? null,
    modes: modeStats,
    recent: parsed.slice(0, 5).map((item) => ({
      id: item.entry.id,
      mode: item.mode,
      scoreM: item.scoreM,
      rounds: item.rounds,
      mapAccuracyPct: item.mapAccuracyPct,
      dailyKey: item.dailyKey,
      createdAt: item.entry.created_at,
      ratio: item.entry.ratio,
    })),
    trend: buildPersonalTrend(parsed),
  };
}

function buildPersonalTrend(
  parsed: Array<{ scoreM: number; createdMs: number }>,
): PersonalTrend | null {
  if (parsed.length < 6) return null;
  const recent = parsed.slice(0, 5);
  const previous = parsed.slice(5, 10);
  if (previous.length < 3) return null;
  const recentAvg =
    recent.reduce((acc, item) => acc + item.scoreM, 0) / recent.length;
  const previousAvg =
    previous.reduce((acc, item) => acc + item.scoreM, 0) / previous.length;
  if (previousAvg <= 0) return null;
  const deltaPct = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
  if (deltaPct <= -5) {
    return {
      label: 'En progrès',
      detail: `${Math.abs(deltaPct)}% de distance en moins sur tes 5 dernières parties.`,
      tone: 'success',
    };
  }
  if (deltaPct >= 8) {
    return {
      label: 'À stabiliser',
      detail: `${deltaPct}% de distance en plus récemment. Rejoue tes modes forts.`,
      tone: 'warning',
    };
  }
  return {
    label: 'Stable',
    detail: 'Tes 5 dernières parties restent dans ton rythme habituel.',
    tone: 'neutral',
  };
}

function getEntryGameMode(entry: LeaderboardEntry): GameMode {
  const metaMode = getMetaString(entry.meta, 'game_mode');
  if (
    metaMode === 'daily' ||
    metaMode === 'random' ||
    metaMode === 'sprint' ||
    metaMode === 'blind'
  ) {
    return metaMode;
  }
  if (entry.submode.startsWith('daily:')) return 'daily';
  if (entry.submode.startsWith('sprint:')) return 'sprint';
  if (entry.submode.startsWith('blind:')) return 'blind';
  return 'random';
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

function GameModeSelector({
  value,
  onChange,
  challengeKey,
  modeSettings,
}: {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  challengeKey: string;
  modeSettings: GeoguesserModeSettings;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
        Mode
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <ModeButton
          active={value === 'daily'}
          icon={<CalendarDays size={16} />}
          title="Challenge du jour"
          detail={`Même série pour tous · ${formatChallengeDate(challengeKey)}`}
          onClick={() => onChange('daily')}
        />
        <ModeButton
          active={value === 'random'}
          icon={<Shuffle size={16} />}
          title="Série libre"
          detail={`${modeSettings.randomRounds} manches tirées au hasard`}
          onClick={() => onChange('random')}
        />
        <ModeButton
          active={value === 'sprint'}
          icon={<Zap size={16} />}
          title="Sprint"
          detail={`${modeSettings.sprintRounds} manches · ${modeSettings.sprintRoundTimeS}s`}
          onClick={() => onChange('sprint')}
        />
        <ModeButton
          active={value === 'blind'}
          icon={<EyeOff size={16} />}
          title="Blind Guess"
          detail={`Screen visible ${modeSettings.blindPreviewSeconds}s puis mémoire`}
          onClick={() => onChange('blind')}
        />
      </div>
    </div>
  );
}

function DifficultyPicker({
  value,
  onChange,
  availability,
}: {
  value: DifficultyFilter;
  onChange: (difficulty: DifficultyFilter) => void;
  availability: Record<DifficultyFilter, DifficultyAvailability>;
}) {
  const options: Array<{
    value: DifficultyFilter;
    label: string;
    detail: string;
  }> = [
    {
      value: 'all',
      label: 'Mixte',
      detail: 'Toutes les difficultés',
    },
    ...(Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]).map((d) => ({
      value: d,
      label: DIFFICULTY_LABELS[d],
      detail: getDifficultyDetail(d),
    })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
          Difficulté
        </p>
        <span className="text-xs text-atfr-fog">
          {value === 'all' ? 'Pool complet' : DIFFICULTY_LABELS[value]}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {options.map((option) => {
          const active = value === option.value;
          const status = availability[option.value];
          const disabled = status.disabled;
          const disabledDetail =
            status.mapCount < status.requiredMapCount
              ? `${status.mapCount}/${status.requiredMapCount} maps nécessaires`
              : `${status.shotCount}/${status.requiredShotCount} screens nécessaires`;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              title={
                disabled
                  ? disabledDetail
                  : undefined
              }
              onClick={() => {
                if (!disabled) onChange(option.value);
              }}
              className={cn(
                'rounded-md border p-3 text-left transition-colors',
                disabled
                  ? 'cursor-not-allowed border-atfr-gold/10 bg-atfr-graphite/25 text-atfr-fog opacity-45 grayscale'
                  : active
                    ? 'border-atfr-gold/70 bg-atfr-gold/10 text-atfr-bone'
                    : 'border-atfr-gold/15 bg-atfr-graphite/40 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-bone',
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border',
                    getDifficultyDotClass(option.value),
                  )}
                />
                {option.label}
              </span>
              <span className="mt-2 block text-xs text-atfr-fog">
                {disabled
                  ? disabledDetail
                  : `${status.mapCount} maps · ${status.shotCount} screens`}
              </span>
              <span className="mt-1 block text-[10px] text-atfr-fog/80">
                {option.detail}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SetupSummaryPanel({
  gameMode,
  difficulty,
  roundTimeS,
  roundTarget,
  playableMapCount,
  playableShotCount,
  requiredMapCount,
  wrongMapMalusM,
  timeoutMalusM,
  modeSettings,
  hasNickname,
  canStart,
  disabledReason,
  onStart,
}: {
  gameMode: GameMode;
  difficulty: DifficultyFilter;
  roundTimeS: number;
  roundTarget: number;
  playableMapCount: number;
  playableShotCount: number;
  requiredMapCount: number;
  wrongMapMalusM: number;
  timeoutMalusM: number;
  modeSettings: GeoguesserModeSettings;
  hasNickname: boolean;
  canStart: boolean;
  disabledReason: string | null;
  onStart: () => void;
}) {
  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-ink/45 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
            Partie prête
          </p>
          <h3 className="mt-1 font-display text-xl text-atfr-bone">
            {formatGenericModeLabel(gameMode)}
          </h3>
        </div>
        <Badge variant={getModeBadgeVariant(gameMode)}>
          {difficulty === 'all' ? 'Mixte' : DIFFICULTY_LABELS[difficulty]}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SetupMetric label="Manches" value={String(roundTarget)} />
        <SetupMetric
          label="Maps jouables"
          value={`${playableMapCount}/${requiredMapCount}`}
          tone={playableMapCount >= requiredMapCount ? 'default' : 'warning'}
        />
        <SetupMetric
          label="Screens"
          value={`${playableShotCount}/${roundTarget}`}
          tone={playableShotCount >= roundTarget ? 'default' : 'warning'}
        />
        <SetupMetric label="Timer" value={`${roundTimeS}s`} />
        <SetupMetric
          label="Mauvaise map"
          value={`+${formatDistance(wrongMapMalusM)}`}
        />
        <SetupMetric
          label="Time out"
          value={`+${formatDistance(timeoutMalusM)}`}
        />
      </div>

      <div className="mt-4">
        <ModeRules
          gameMode={gameMode}
          roundTimeS={roundTimeS}
          modeSettings={modeSettings}
        />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-atfr-fog">
        Le score le plus bas gagne. Choisis la map, place ton pin, puis valide
        avant la fin du timer.
      </p>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={onStart}
        disabled={!canStart}
        trailingIcon={<ArrowRight size={16} />}
      >
        {hasNickname
          ? getStartButtonLabel(gameMode)
          : 'Choisis d’abord un pseudo'}
      </Button>
      {disabledReason && (
        <p className="mt-2 text-xs text-atfr-warning">{disabledReason}</p>
      )}
    </div>
  );
}

function SetupMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <div
      className={cn(
        'rounded px-3 py-2',
        tone === 'warning'
          ? 'border border-atfr-warning/30 bg-atfr-warning/10'
          : 'bg-atfr-graphite/55',
      )}
    >
      <p className="text-[9px] uppercase tracking-[0.16em] text-atfr-fog">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-atfr-bone tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ModeRules({
  gameMode,
  roundTimeS,
  modeSettings,
}: {
  gameMode: GameMode;
  roundTimeS: number;
  modeSettings: GeoguesserModeSettings;
}) {
  if (gameMode === 'sprint') {
    return (
      <div className="rounded-md border border-atfr-warning/30 bg-atfr-warning/10 p-4 text-sm text-atfr-bone leading-relaxed">
        <p className="font-medium text-atfr-warning">Sprint</p>
        <p className="mt-1 text-atfr-fog">
          {modeSettings.sprintRounds} manches, {roundTimeS}s par screen. Une
          bonne map reçoit une pénalité chrono de{' '}
          {modeSettings.sprintTimePenaltyM} m par seconde écoulée.
        </p>
      </div>
    );
  }

  if (gameMode === 'blind') {
    return (
      <div className="rounded-md border border-atfr-gold/20 bg-atfr-graphite/40 p-4 text-sm text-atfr-bone leading-relaxed">
        <p className="font-medium text-atfr-gold">Blind Guess</p>
        <p className="mt-1 text-atfr-fog">
          Le screenshot reste visible{' '}
          {getBlindPreviewSeconds(modeSettings, roundTimeS)}s, puis il
          disparaît. Tu dois choisir la map et placer le point de mémoire.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 p-4 text-sm text-atfr-bone leading-relaxed">
      <p className="font-medium text-atfr-gold">
        {gameMode === 'daily' ? 'Challenge du jour' : 'Série libre'}
      </p>
      <p className="mt-1 text-atfr-fog">
        {gameMode === 'daily'
          ? 'Même sélection pour tout le clan aujourd’hui, avec un classement dédié.'
          : 'Une série rapide pour t’entraîner sur le pool et la difficulté choisis.'}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  title,
  detail,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-md border p-3 text-left transition-colors',
        active
          ? 'border-atfr-gold/70 bg-atfr-gold/10 text-atfr-bone'
          : 'border-atfr-gold/15 bg-atfr-graphite/40 text-atfr-fog hover:border-atfr-gold/40 hover:text-atfr-bone',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md border',
            active
              ? 'border-atfr-gold/40 bg-atfr-gold/15 text-atfr-gold'
              : 'border-atfr-gold/15 bg-atfr-ink/50 text-atfr-fog',
          )}
        >
          {icon}
        </span>
        {title}
      </span>
      <span className="mt-2 block text-xs text-atfr-fog">{detail}</span>
    </button>
  );
}

function RoundStatusBar({
  stats,
  totalScore,
  gameMode,
  challengeKey,
  difficulty,
}: {
  stats: ResultStats;
  totalScore: number;
  gameMode: GameMode;
  challengeKey: string;
  difficulty: DifficultyFilter;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-atfr-gold/10 bg-atfr-carbon/70 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getModeBadgeVariant(gameMode)}>
          {formatModeLabel(gameMode, challengeKey)}
        </Badge>
        <Badge variant="outline">
          {difficulty === 'all' ? 'Mixte' : DIFFICULTY_LABELS[difficulty]}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-atfr-fog">
        <span className="inline-flex items-center gap-1">
          <Flame size={13} className="text-atfr-gold" />
          Série {stats.currentStreak}
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy size={13} className="text-atfr-gold" />
          Best {stats.bestStreak}
        </span>
        <span className="tabular-nums">{formatDistance(totalScore)}</span>
      </div>
    </div>
  );
}

function RoundActionDock({
  showReveal,
  canValidate,
  selectedMapName,
  hasPick,
  currentIndex,
  total,
  totalScore,
  secondsLeft,
  gameMode,
  onValidate,
  onNext,
}: {
  showReveal: boolean;
  canValidate: boolean;
  selectedMapName: string | null;
  hasPick: boolean;
  currentIndex: number;
  total: number;
  totalScore: number;
  secondsLeft: number;
  gameMode: GameMode;
  onValidate: () => void;
  onNext: () => void;
}) {
  const status = getRoundActionStatus(selectedMapName, hasPick, showReveal);
  return (
    <div className="sticky bottom-3 z-30 rounded-lg border border-atfr-gold/25 bg-atfr-ink/95 p-3 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={showReveal ? 'gold' : getModeBadgeVariant(gameMode)}>
              {showReveal ? 'Révélation' : status.label}
            </Badge>
            <span className="text-xs text-atfr-fog tabular-nums">
              Manche {currentIndex + 1}/{total}
            </span>
            {!showReveal && (
              <span className="text-xs text-atfr-fog tabular-nums">
                {secondsLeft}s
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-atfr-bone">
            {showReveal
              ? 'Analyse la correction puis passe à la suite.'
              : status.detail}
          </p>
          <p className="mt-0.5 text-xs text-atfr-fog">
            Score actuel : {formatDistance(totalScore)}
          </p>
        </div>

        {showReveal ? (
          <Button
            className="w-full sm:w-auto"
            onClick={onNext}
            trailingIcon={<ArrowRight size={14} />}
          >
            {currentIndex < total - 1
              ? 'Manche suivante'
              : 'Voir le score final'}
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto"
            onClick={onValidate}
            disabled={!canValidate}
            trailingIcon={<ArrowRight size={14} />}
          >
            {status.cta}
          </Button>
        )}
      </div>
    </div>
  );
}

function ResultInsights({ stats }: { stats: ResultStats }) {
  const bestValue =
    stats.best?.result.distanceM != null
      ? formatDistance(stats.best.result.distanceM)
      : '—';
  const bestDetail = stats.best
    ? `Manche ${stats.best.round} · ${stats.best.result.shot.map?.name ?? 'Map inconnue'}`
    : 'Aucune bonne map cette fois';
  const toughestValue = stats.toughest
    ? formatDistance(stats.toughest.result.score)
    : '—';
  const toughestDetail = stats.toughest
    ? `Manche ${stats.toughest.round} · ${stats.toughest.result.shot.map?.name ?? 'Map inconnue'}`
    : 'Aucune manche jouée';

  return (
    <Card>
      <CardBody className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
              Lecture de partie
            </p>
            <p className="text-sm text-atfr-fog mt-1">
              Les points à retenir avant de relancer une série.
            </p>
          </div>
          <Badge variant="outline">
            {stats.mapAccuracyPct}% maps trouvées
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InsightStat
            icon={<CheckCircle2 size={16} />}
            label="Maps trouvées"
            value={`${stats.correctMaps}/${stats.rounds}`}
            detail={`${stats.wrongMaps} mauvaise(s) · streak ${stats.bestStreak}`}
            tone="success"
          />
          <InsightStat
            icon={<Target size={16} />}
            label="Meilleur placement"
            value={bestValue}
            detail={bestDetail}
            tone="gold"
          />
          <InsightStat
            icon={<XCircle size={16} />}
            label="Manche à revoir"
            value={toughestValue}
            detail={toughestDetail}
            tone="danger"
          />
        </div>

        <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-1">
            Conseil
          </p>
          <p className="text-sm text-atfr-bone leading-relaxed">
            {stats.advice}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function PersonalStatsPanel({
  stats,
  isLoading,
}: {
  stats: PersonalStats;
  isLoading: boolean;
}) {
  if (isLoading && stats.games === 0) {
    return (
      <Card>
        <CardBody className="p-5 flex justify-center">
          <Spinner />
        </CardBody>
      </Card>
    );
  }

  if (stats.games === 0) {
    return (
      <Card>
        <CardBody className="p-5 flex items-start gap-4">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg text-atfr-bone">Mes stats</h3>
            <p className="mt-1 text-sm leading-relaxed text-atfr-fog">
              Termine une partie pour débloquer ton historique personnel :
              meilleur score, progression, modes forts et dernières manches.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-5 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-lg text-atfr-bone flex items-center gap-2">
              <BarChart3 size={18} className="text-atfr-gold" />
              Mes stats GeoGuesseur
            </h3>
            <p className="text-xs text-atfr-fog mt-1">
              Ton historique personnel, tous modes confondus.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{stats.games} partie(s)</Badge>
            <Badge variant="gold">{stats.gamesLast7Days} cette semaine</Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PersonalStatTile
            icon={<Trophy size={16} />}
            label="Meilleur score"
            value={stats.bestScoreM != null ? formatDistance(stats.bestScoreM) : '—'}
            detail="plus bas score total"
          />
          <PersonalStatTile
            icon={<Target size={16} />}
            label="Moyenne"
            value={stats.avgScoreM != null ? formatDistance(stats.avgScoreM) : '—'}
            detail="par partie terminée"
          />
          <PersonalStatTile
            icon={<MapIcon size={16} />}
            label="Maps trouvées"
            value={
              stats.avgMapAccuracyPct != null
                ? `${stats.avgMapAccuracyPct}%`
                : '—'
            }
            detail="précision moyenne"
          />
          <PersonalStatTile
            icon={<Flame size={16} />}
            label="Meilleure série"
            value={String(stats.bestStreak)}
            detail="bonnes maps d'affilée"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/35 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-3">
              Progression
            </p>
            {stats.trend ? (
              <div className="space-y-2">
                <Badge variant={getTrendBadgeVariant(stats.trend.tone)}>
                  {stats.trend.label}
                </Badge>
                <p className="text-sm leading-relaxed text-atfr-bone">
                  {stats.trend.detail}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-atfr-fog">
                Joue encore quelques parties pour comparer tes dernières
                performances avec ton historique.
              </p>
            )}
            {stats.bestMode && (
              <p className="mt-3 text-xs text-atfr-fog">
                Mode fort :{' '}
                <strong className="text-atfr-bone">
                  {formatGenericModeLabel(stats.bestMode.mode)}
                </strong>{' '}
                · meilleur score {formatDistance(stats.bestMode.bestScoreM)}
              </p>
            )}
          </div>

          <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/35 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-3">
              Par mode
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stats.modes.map((mode) => (
                <div
                  key={mode.mode}
                  className="rounded bg-atfr-ink/45 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={getModeBadgeVariant(mode.mode)}>
                      {formatGenericModeLabel(mode.mode)}
                    </Badge>
                    <span className="text-[10px] text-atfr-fog">
                      {mode.games} partie(s)
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-atfr-bone">
                    Best {formatDistance(mode.bestScoreM)}
                  </p>
                  <p className="text-xs text-atfr-fog">
                    Moy. {formatDistance(mode.avgScoreM)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-3">
            Dernières parties
          </p>
          <div className="grid gap-2">
            {stats.recent.map((score) => (
              <div
                key={score.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-atfr-gold/10 bg-atfr-ink/35 px-3 py-2"
              >
                <Badge variant={getModeBadgeVariant(score.mode)}>
                  {formatScoreModeLabel(score.mode, score.dailyKey)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-atfr-bone tabular-nums">
                    {formatDistance(score.scoreM)}
                  </p>
                  <p className="text-xs text-atfr-fog">
                    {formatScoreDate(score.createdAt)}
                    {score.rounds ? ` · ${score.rounds} manche(s)` : ''}
                    {score.mapAccuracyPct != null
                      ? ` · ${score.mapAccuracyPct}% maps`
                      : ''}
                  </p>
                </div>
                <span className="text-xs text-atfr-fog tabular-nums">
                  {Math.round(score.ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function PersonalStatTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-ink/45 p-3 min-w-0">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-xl text-atfr-bone mt-1 truncate">
        {value}
      </p>
      <p className="text-xs text-atfr-fog mt-1 truncate">{detail}</p>
    </div>
  );
}

function InsightStat({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: 'success' | 'gold' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-atfr-success/30 bg-atfr-success/10 text-atfr-success'
      : tone === 'danger'
        ? 'border-atfr-danger/30 bg-atfr-danger/10 text-atfr-danger'
        : 'border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold';

  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-ink/45 p-3 min-w-0">
      <div
        className={cn(
          'mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border',
          toneClass,
        )}
      >
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-xl text-atfr-bone mt-1 truncate">
        {value}
      </p>
      <p className="text-xs text-atfr-fog mt-1 truncate">{detail}</p>
    </div>
  );
}

function GeoguesserLeaderboardPanel({
  moduleSlug,
  submode,
  gameMode,
  challengeKey,
}: {
  moduleSlug: string;
  submode: string;
  gameMode: GameMode;
  challengeKey: string;
}) {
  const [tab, setTab] = useState<'all' | 'verified'>('all');
  const me = usePlayerIdentity();
  const board = useLeaderboard({
    moduleSlug,
    submode,
    limit: 50,
    verifiedOnly: tab === 'verified',
  });
  const entries = useMemo(
    () => dedupeLeaderboardEntries(board.data ?? []).slice(0, 12),
    [board.data],
  );
  const title =
    gameMode === 'daily'
      ? `Classement du défi ${formatChallengeDate(challengeKey)}`
      : `Classement ${formatModeLabel(gameMode, challengeKey)}`;
  const description =
    gameMode === 'sprint'
      ? 'Meilleur score par joueur, avec distance et chrono combinés.'
      : 'Meilleur score par joueur, distance réelle et précision map.';

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="font-display text-lg text-atfr-bone flex items-center gap-2">
              <Crown size={18} className="text-atfr-gold" />
              {title}
            </h3>
            <p className="text-xs text-atfr-fog mt-1">
              {description}
            </p>
          </div>
          <div className="flex gap-1">
            <LeaderboardTab active={tab === 'all'} onClick={() => setTab('all')}>
              <Users size={12} /> Tous
            </LeaderboardTab>
            <LeaderboardTab
              active={tab === 'verified'}
              onClick={() => setTab('verified')}
            >
              <ShieldCheck size={12} /> Vérifiés WG
            </LeaderboardTab>
          </div>
        </div>

        {board.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-atfr-fog py-6">
            {gameMode === 'daily'
              ? 'Personne n’a encore terminé le défi du jour.'
              : 'Pas encore de score sur cette difficulté.'}
          </p>
        ) : (
          <ol className="space-y-2">
            {entries.map((entry, idx) => (
              <GeoguesserLeaderboardRow
                key={entry.id}
                entry={entry}
                rank={idx + 1}
                isMe={isLeaderboardEntryMe(entry, me)}
                gameMode={gameMode}
              />
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

function GeoguesserLeaderboardRow({
  entry,
  rank,
  isMe,
  gameMode,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  gameMode: GameMode;
}) {
  const scoreM =
    getMetaNumber(entry.meta, 'distance_m') ??
    Math.max(0, entry.max_score - entry.score);
  const rawDistanceM = getMetaNumber(entry.meta, 'raw_distance_m');
  const elapsedSeconds = getMetaNumber(entry.meta, 'elapsed_seconds');
  const rounds = getMetaNumber(entry.meta, 'rounds');
  const avgM = rounds && rounds > 0 ? scoreM / rounds : null;
  const mapAccuracy = getMetaNumber(entry.meta, 'map_accuracy_pct');
  const bestStreak = getMetaNumber(entry.meta, 'best_streak');
  const dailyKey = getMetaString(entry.meta, 'daily_key');
  const pct = Math.round(entry.ratio * 100);
  const isSprint = gameMode === 'sprint';

  return (
    <li
      className={cn(
        'rounded-md border p-3 transition-colors',
        isMe
          ? 'border-atfr-gold/60 bg-atfr-gold/10'
          : 'border-atfr-gold/15 bg-atfr-graphite/40',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-display',
            rank === 1 && 'bg-gradient-gold text-atfr-ink',
            rank > 1 && 'bg-atfr-ink/60 text-atfr-gold',
          )}
        >
          {rank === 1 ? <Crown size={15} /> : rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-atfr-bone truncate flex items-center gap-1.5">
            {entry.player_nickname}
            {entry.is_verified && (
              <ShieldCheck
                size={14}
                className="text-atfr-success shrink-0"
                aria-label="Compte WG vérifié"
              />
            )}
          </p>
          <p className="text-xs text-atfr-fog">
            {dailyKey ? `Défi ${formatChallengeDate(dailyKey)} · ` : ''}
            {formatScoreDate(entry.created_at)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-xl text-atfr-bone tabular-nums">
            {formatDistance(scoreM)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
            {isSprint ? 'score' : 'perf'} {pct}%
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <LeaderboardMetric
          label="Moy."
          value={avgM != null ? formatDistance(avgM) : '—'}
        />
        <LeaderboardMetric
          label={isSprint ? 'Temps' : 'Maps'}
          value={
            isSprint
              ? elapsedSeconds != null
                ? formatDuration(elapsedSeconds)
                : '—'
              : mapAccuracy != null
                ? `${mapAccuracy}%`
                : '—'
          }
        />
        <LeaderboardMetric
          label={isSprint ? 'Distance' : 'Série'}
          value={
            isSprint
              ? rawDistanceM != null
                ? formatDistance(rawDistanceM)
                : '—'
              : bestStreak != null
                ? String(bestStreak)
                : '—'
          }
        />
      </div>
    </li>
  );
}

function LeaderboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-atfr-ink/45 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-[0.16em] text-atfr-fog">
        {label}
      </p>
      <p className="text-sm text-atfr-bone tabular-nums">{value}</p>
    </div>
  );
}

function LeaderboardTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.15em] transition-colors',
        active
          ? 'bg-atfr-gold text-atfr-ink border-atfr-gold'
          : 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60',
      )}
    >
      {children}
    </button>
  );
}

function isLeaderboardEntryMe(
  entry: LeaderboardEntry,
  me: ReturnType<typeof usePlayerIdentity>,
): boolean {
  return (
    (me.isVerified &&
      entry.is_verified &&
      entry.player_account_id === me.accountId) ||
    (!me.isVerified &&
      !entry.is_verified &&
      entry.player_anon_id === me.id)
  );
}

function dedupeLeaderboardEntries(
  entries: LeaderboardEntry[],
): LeaderboardEntry[] {
  const bestByPlayer = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const key =
      entry.is_verified && entry.player_account_id != null
        ? `wg:${entry.player_account_id}`
        : `anon:${entry.player_anon_id}`;
    if (!bestByPlayer.has(key)) {
      bestByPlayer.set(key, entry);
    }
  }
  return [...bestByPlayer.values()];
}

function formatScoreDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
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
                ? r.kind === 'timeout'
                  ? 'bg-atfr-warning'
                  : r.correctMap
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
  const feedback = buildRoundFeedback(result);
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
            {result.timePenalty > 0 && (
              <span>
                Chrono : +{formatDistance(result.timePenalty)} (
                {formatDuration(result.elapsedSeconds)})
              </span>
            )}
            <span>
              <Camera size={12} className="inline mr-1" />
              {result.shot.map?.name}
            </span>
          </p>
          <p className="text-sm text-atfr-bone/90 mt-2 leading-relaxed">
            {feedback}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-atfr-bone tabular-nums">
            {formatDistance(result.score)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
            score
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function BlindGuessCurtain({ previewSeconds }: { previewSeconds: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-atfr-ink"
    >
      <div className="mx-4 max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold">
          <EyeOff size={24} />
        </div>
        <p className="font-display text-2xl text-atfr-bone">
          Screen masqué
        </p>
        <p className="mt-2 text-sm leading-relaxed text-atfr-fog">
          Tu avais {previewSeconds}s pour mémoriser la scène. Choisis la map et
          place ton point de mémoire.
        </p>
      </div>
    </motion.div>
  );
}

function TutorialCard({
  onClose,
  roundTimeS,
  gameMode,
  modeSettings,
}: {
  onClose: () => void;
  roundTimeS: number;
  gameMode: GameMode;
  modeSettings: GeoguesserModeSettings;
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
        {gameMode === 'sprint' && (
          <p className="rounded-md border border-atfr-warning/30 bg-atfr-warning/10 p-3 text-xs text-atfr-bone">
            Mode Sprint : valide vite. Chaque seconde utilisée ajoute une
            petite pénalité si tu as trouvé la bonne map.
          </p>
        )}
        {gameMode === 'blind' && (
          <p className="rounded-md border border-atfr-gold/20 bg-atfr-graphite/50 p-3 text-xs text-atfr-bone">
            Mode Blind Guess : mémorise le screenshot au lancement, il sera
            masqué après {getBlindPreviewSeconds(modeSettings, roundTimeS)}s.
          </p>
        )}
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
