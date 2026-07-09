import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  EyeOff,
  RotateCcw,
  Shuffle,
  X,
  XCircle,
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
import {
  DEFAULT_GEO_SETTINGS,
  useGeoMaps,
  useGeoSettings,
  usePublicGeoShots,
  type PublicShot,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import {
  usePlayerModuleScores,
} from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import {
  buildDifficultyAvailability,
  formatDuration,
  formatModeLabel,
  getBlindPreviewSeconds,
  getDailyChallengeKey,
  getFirstAvailableDifficulty,
  getLeaderboardSubmode,
  getMinMapRequirement,
  getModeSettings,
  getRoundTargetForMode,
  getRoundTimeLimit,
  getStartDisabledReason,
  getWorstTotalForMode,
  type DifficultyFilter,
  type GameMode,
} from '@/features/geoguesser/mode';
import { useModalA11y } from '@/hooks/useModalA11y';
import {
  formatDistance,
  scoreTier,
  type RoundScoreResult,
  type RoundScoreSettings,
} from '@/features/geoguesser/scoring';
import {
  DIFFICULTY_LABELS,
  type Database,
  type QuizDifficulty,
} from '@/types/database';

type MapRow = Database['public']['Tables']['wot_maps']['Row'];
import { usePlayerProfile } from '@/features/geoguesser/usePlayerProfile';
import { AvatarCustomizer } from '@/components/geoguesser/AvatarCustomizer';
import {
  BlindGuessCurtain,
  DifficultyPicker,
  GameModeSelector,
  GeoguesserLeaderboardPanel,
  PersonalStatsPanel,
  ProgressBar,
  ResultInsights,
  RevealBanner,
  RoundActionDock,
  RoundStatusBar,
  SetupSummaryPanel,
  TutorialCard,
} from '@/components/geoguesser/panels';
import {
  getModeBadgeVariant,
  summarizePlayerScores,
  summarizeResults,
  type RoundResult,
} from '@/features/geoguesser/resultStats';

const MODULE_SLUG = 'wot-geoguesser';
const TUTORIAL_KEY = 'atfr.geoguesser.tutorial.seen.v1';
const DAILY_DONE_KEY = 'atfr.geoguesser.daily.done.v1';

function getDailyDoneKeys(): Set<string> {
  try {
    if (typeof window === 'undefined') return new Set();
    const raw = localStorage.getItem(DAILY_DONE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function markDailyDone(key: string): void {
  try {
    const done = getDailyDoneKeys();
    done.add(key);
    // Keep only the 14 most recent entries to avoid unbounded growth.
    const arr = [...done].slice(-14);
    localStorage.setItem(DAILY_DONE_KEY, JSON.stringify(arr));
  } catch { /* ignore */ }
}

type Stage = 'intro' | 'playing' | 'reveal' | 'result';

export default function Geoguesser() {
  const [stage, setStage] = useState<Stage>('intro');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [gameMode, setGameMode] = useState<GameMode>('daily');

  const maps = useGeoMaps({ activeOnly: true });
  const allShots = usePublicGeoShots();
  const shots = usePublicGeoShots({ difficulty });
  const settings = useGeoSettings();
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [dailyDoneKeys, setDailyDoneKeys] = useState<Set<string>>(() => getDailyDoneKeys());
  const [trainingMode, setTrainingMode] = useState(false);
  const [activeTrainingMode, setActiveTrainingMode] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const statsPanelRef = useModalA11y<HTMLDivElement>({
    onClose: () => setShowStatsPanel(false),
    enabled: showStatsPanel,
  });
  const playerProfile = usePlayerProfile(identity, playerScores.data);

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
  const isDailyDone = dailyDoneKeys.has(todayChallengeKey);
  const canStartGame =
    !!identity.nickname &&
    !!selectedDifficultyAvailability &&
    !selectedDifficultyAvailability.disabled &&
    !shots.isLoading &&
    !(gameMode === 'daily' && isDailyDone);
  const startDisabledReason =
    gameMode === 'daily' && isDailyDone
      ? 'Tu as déjà fait le challenge du jour. Reviens demain !'
      : getStartDisabledReason(!!identity.nickname, selectedDifficultyAvailability);

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

  // Daily mode n'a pas de sélection de difficulté ni de mode entraînement.
  useEffect(() => {
    if (gameMode === 'daily') {
      setDifficulty('all');
      setTrainingMode(false);
    }
  }, [gameMode]);

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
  const mapsById = useMemo(
    () => new Map((maps.data ?? []).map((m) => [m.id, m])),
    [maps.data],
  );

  async function startGame() {
    if (!canStartGame) return;
    setStartError(null);
    const trainingModeAtStart = trainingMode;
    let res: Response;
    try {
      res = await fetch('/.netlify/functions/geoguesser-start-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: gameMode,
          difficulty,
          training_mode: trainingModeAtStart,
          player_anon_id: identity.id,
          player_nickname: identity.nickname,
          player_token: identity.playerToken,
        }),
      });
    } catch {
      setStartError('Connexion au serveur impossible. Réessaie.');
      return;
    }
    const json = await res.json().catch(() => ({}) as Record<string, unknown>);
    if (!res.ok) {
      setStartError(
        typeof json.error === 'string' ? json.error : 'Impossible de démarrer la partie.',
      );
      return;
    }
    const startedPool = (json.pool ?? []) as PublicShot[];
    const subset = startedPool.map((s) => toShotWithMap(s, null, mapsById));
    if (subset.length === 0) {
      setStartError('Aucun screenshot disponible pour ce mode.');
      return;
    }
    setSessionId(typeof json.session_id === 'string' ? json.session_id : null);
    setPool(subset);
    setIndex(0);
    setResults([]);
    setActiveChallengeKey(
      typeof json.daily_key === 'string' ? json.daily_key : getDailyChallengeKey(),
    );
    setActiveRoundTarget(
      typeof json.round_target === 'number' ? json.round_target : subset.length,
    );
    setActiveTrainingMode(trainingModeAtStart);
    setShareCopied(false);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setRoundError(null);
    setSecondsLeft(
      typeof json.round_time_limit_s === 'number' ? json.round_time_limit_s : roundTimeLimitS,
    );
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

  async function validate() {
    if (!current || !sessionId || isSubmitting) return;
    setIsSubmitting(true);
    setRoundError(null);
    try {
      const res = await fetch('/.netlify/functions/geoguesser-submit-round', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          shot_id: current.id,
          selected_map_id: selectedMapId,
          pick_x: pickX,
          pick_y: pickY,
        }),
      });
      const json = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok) {
        setRoundError(
          typeof json.error === 'string' ? json.error : 'Échec de la soumission de la manche.',
        );
        return;
      }
      const revealedShot = toShotWithMap(
        {
          id: current.id,
          map_id: String(json.map_id),
          image_url: current.image_url,
          difficulty: current.difficulty,
          caption: current.caption,
          tags: current.tags,
        },
        { x_pct: Number(json.x_pct), y_pct: Number(json.y_pct) },
        mapsById,
      );
      setResults((prev) => [
        ...prev,
        {
          shot: revealedShot,
          selectedMapId,
          selectedX: pickX,
          selectedY: pickY,
          correctMap: !!json.correct_map,
          distanceM: typeof json.distance_m === 'number' ? json.distance_m : null,
          score: Number(json.score),
          baseScore: Number(json.base_score),
          timePenalty: Number(json.time_penalty),
          elapsedSeconds: Number(json.elapsed_seconds),
          kind: json.kind as RoundScoreResult['kind'],
        },
      ]);
      setStage('reveal');
    } catch {
      setRoundError('Connexion au serveur impossible. Réessaie.');
    } finally {
      setIsSubmitting(false);
    }
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
    // End of game: le score (déjà accumulé manche par manche côté serveur)
    // est agrégé et poussé au leaderboard par geoguesser-finish-session,
    // qui décide aussi seul si la session doit compter (training_mode).
    if (sessionId) {
      try {
        await fetch('/.netlify/functions/geoguesser-finish-session', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        /* best-effort */
      }
    }
    // Persiste la clé du jour dès que la partie daily est terminée,
    // avant d'afficher les résultats — résiste au rechargement de page.
    if (gameMode === 'daily') {
      markDailyDone(activeChallengeKey);
      setDailyDoneKeys(getDailyDoneKeys());
    }
    setStage('result');
  }

  function restart() {
    setStage('intro');
    setSessionId(null);
    setStartError(null);
    setRoundError(null);
    setPool([]);
    setIndex(0);
    setResults([]);
    setShareCopied(false);
    setSelectedMapId(null);
    setPickX(null);
    setPickY(null);
    setActiveTrainingMode(false);
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
      <Section eyebrow="WoT GeoGuesseur" title="Devine la map et l'endroit">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Retour académie */}
          <Link
            to="/modules"
            className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold"
          >
            <ArrowLeft size={12} /> Académie
          </Link>

          {/* Avatar customizer modal */}
          {showCustomizer && (
            <AvatarCustomizer
              config={playerProfile.avatarConfig}
              levelInfo={playerProfile.levelInfo}
              onSave={playerProfile.updateAvatarConfig}
              onClose={() => setShowCustomizer(false)}
            />
          )}

          {/* Stats slide-in panel */}
          <AnimatePresence>
            {showStatsPanel && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-atfr-ink/70 backdrop-blur-sm"
                  onClick={() => setShowStatsPanel(false)}
                />
                <motion.div
                  ref={statsPanelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mes stats"
                  tabIndex={-1}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto bg-atfr-carbon border-l border-atfr-gold/20 shadow-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg text-atfr-bone">Mes stats</h2>
                    <button
                      type="button"
                      onClick={() => setShowStatsPanel(false)}
                      aria-label="Fermer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-atfr-gold/20 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/50 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <PersonalStatsPanel
                    stats={personalStats}
                    isLoading={playerScores.isLoading}
                    levelInfo={playerProfile.levelInfo}
                    avatarConfig={playerProfile.avatarConfig}
                    onCustomize={() => { setShowStatsPanel(false); setShowCustomizer(true); }}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

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
              <CardBody className="p-5 sm:p-7 space-y-5">
                <GameModeSelector
                  value={gameMode}
                  onChange={setGameMode}
                  challengeKey={displayChallengeKey}
                  modeSettings={modeSettings}
                  dailyDone={isDailyDone}
                />

                <AnimatePresence initial={false}>
                  {gameMode !== 'daily' && (
                    <motion.div
                      key="difficulty"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <DifficultyPicker
                        value={difficulty}
                        onChange={setDifficulty}
                        availability={difficultyAvailability}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {startError && <Alert tone="danger">{startError}</Alert>}

                <SetupSummaryPanel
                  gameMode={gameMode}
                  roundTimeS={roundTimeLimitS}
                  roundTarget={roundTarget}
                  wrongMapMalusM={cfg.wrong_map_malus_m}
                  timeoutMalusM={cfg.timeout_malus_m}
                  modeSettings={modeSettings}
                  hasNickname={!!identity.nickname}
                  dailyDone={isDailyDone}
                  canStart={canStartGame}
                  disabledReason={startDisabledReason}
                  trainingMode={trainingMode}
                  onTrainingModeChange={setTrainingMode}
                  onStart={startGame}
                />
              </CardBody>
            </Card>
          )}

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
    const canValidate =
      !!selectedMapId && pickX != null && pickY != null && !isSubmitting;
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
            trainingMode={activeTrainingMode}
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

          {roundError && !showReveal && (
            <Alert tone="danger">{roundError}</Alert>
          )}

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

  // Performance color
  const perfColor =
    pct <= 20
      ? 'text-atfr-success'
      : pct <= 50
        ? 'text-atfr-gold'
        : 'text-atfr-fog';

  return (
    <Section eyebrow="Résultat final" title="">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Hero score card */}
        <Card className="overflow-hidden">
          <CardBody className="p-0">
            {/* Color stripe at top */}
            <div className={cn(
              'h-1.5 w-full',
              pct <= 20 ? 'bg-atfr-success' : pct <= 50 ? 'bg-gradient-gold' : 'bg-atfr-fog/30',
            )} />
            <div className="p-6 sm:p-8">
              {/* Mode/difficulty badges */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Badge variant={getModeBadgeVariant(gameMode)}>
                  {formatModeLabel(gameMode, activeChallengeKey)}
                </Badge>
                <Badge variant="outline">
                  {difficulty === 'all' ? 'Mixte' : DIFFICULTY_LABELS[difficulty]}
                </Badge>
                <Badge variant="outline">{pool.length} manches</Badge>
                {activeTrainingMode && (
                  <Badge variant="neutral" className="inline-flex items-center gap-1">
                    <BookOpen size={10} /> Entraînement · non classé
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                {/* Score principal */}
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-2">
                    {gameMode === 'sprint' ? 'Score sprint (dist + chrono)' : 'Score total · plus bas = meilleur'}
                  </p>
                  <p className="font-display text-6xl sm:text-7xl text-atfr-bone leading-none tabular-nums">
                    {formatDistance(totalScore)}
                  </p>
                  <p className="text-sm text-atfr-fog mt-2">
                    Moyenne : <strong className="text-atfr-bone">{formatDistance(avg)}</strong> par manche
                  </p>
                  {gameMode === 'sprint' && (
                    <p className="text-xs text-atfr-fog mt-1">
                      Distance brute {formatDistance(baseTotalScore)} · chrono {formatDuration(totalElapsedSeconds)} · pénalité {formatDistance(totalTimePenalty)}
                    </p>
                  )}
                </div>

                {/* Performance gauge */}
                <div className="sm:text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog mb-1">Performance</p>
                  <p className={cn('font-display text-5xl tabular-nums', perfColor)}>
                    {Math.round(100 - pct)}%
                  </p>
                  <div className="mt-2 h-2 w-full sm:w-32 rounded-full bg-atfr-graphite overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - pct}%` }}
                      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
                      className={cn(
                        'h-full rounded-full',
                        pct <= 20 ? 'bg-atfr-success' : 'bg-gradient-gold',
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Tier */}
              <div className="mt-5 rounded-xl border border-atfr-gold/20 bg-atfr-graphite/40 px-4 py-3">
                <p className="font-display text-lg text-atfr-bone">{tier.title}</p>
                <p className="text-sm text-atfr-fog mt-0.5 leading-relaxed">{tier.message}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2.5 mt-5">
                <Button onClick={startGame} leadingIcon={<RotateCcw size={14} />}>
                  Rejouer
                </Button>
                <Button
                  onClick={copyClanChallenge}
                  leadingIcon={<Copy size={14} />}
                  variant="outline"
                >
                  {shareCopied ? 'Copié !' : 'Défier le clan'}
                </Button>
                <Button onClick={restart} leadingIcon={<Shuffle size={14} />} variant="outline">
                  Changer de mode
                </Button>
                <Link to="/modules">
                  <Button variant="ghost">
                    <ArrowLeft size={14} /> Académie
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>

        <ResultInsights stats={resultStats} />

        <PersonalStatsPanel
          stats={personalStats}
          isLoading={playerScores.isLoading || playerScores.isFetching}
          levelInfo={playerProfile.levelInfo}
          avatarConfig={playerProfile.avatarConfig}
          onCustomize={() => setShowCustomizer(true)}
        />

        {/* Per-round recap */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
            Détail des manches
          </p>
          <div className="grid gap-2">
            {results.map((r, i) => {
              const kindColor =
                r.kind === 'distance'
                  ? 'border-l-atfr-success'
                  : r.kind === 'timeout'
                    ? 'border-l-atfr-warning'
                    : 'border-l-atfr-danger';
              return (
                <Card key={i} className={cn('overflow-hidden border-l-4', kindColor)}>
                  <CardBody className="p-3 sm:p-4 flex items-center gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-atfr-graphite">
                      <img src={r.shot.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-atfr-fog/85">#{i + 1}</span>
                        <span className="text-sm font-semibold text-atfr-bone truncate">
                          {r.shot.map?.name ?? '?'}
                        </span>
                        <Badge variant="outline" className="text-[9px]">
                          {DIFFICULTY_LABELS[r.shot.difficulty]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {r.kind === 'distance' && (
                          <span className="inline-flex items-center gap-1 text-atfr-success">
                            <CheckCircle2 size={11} /> Bonne map
                          </span>
                        )}
                        {r.kind === 'wrong-map' && (
                          <span className="inline-flex items-center gap-1 text-atfr-danger">
                            <XCircle size={11} /> Mauvaise map
                          </span>
                        )}
                        {r.kind === 'timeout' && (
                          <span className="inline-flex items-center gap-1 text-atfr-warning">
                            <Clock size={11} /> Time out
                          </span>
                        )}
                        {r.distanceM != null && (
                          <span className="text-atfr-fog">· {formatDistance(r.distanceM)}</span>
                        )}
                        {r.timePenalty > 0 && (
                          <span className="text-atfr-fog">
                            · +{formatDistance(r.timePenalty)} chrono
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-xl text-atfr-bone tabular-nums">
                        {formatDistance(r.score)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-atfr-fog">score</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
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

// Reconstruit un ShotWithMap depuis les réponses (coordonnée-less) des
// endpoints serveur, pour réutiliser les composants d'affichage existants
// sans changer leur type. `coords` est null avant la révélation d'une
// manche (start-session ne renvoie jamais x_pct/y_pct) et contient la
// position réelle une fois renvoyée par geoguesser-submit-round.
function toShotWithMap(
  shot: {
    id: string;
    map_id: string;
    image_url: string;
    difficulty: QuizDifficulty;
    caption: string | null;
    tags: string[];
  },
  coords: { x_pct: number; y_pct: number } | null,
  mapsById: Map<string, MapRow>,
): ShotWithMap {
  return {
    id: shot.id,
    map_id: shot.map_id,
    image_url: shot.image_url,
    x_pct: coords?.x_pct ?? 0,
    y_pct: coords?.y_pct ?? 0,
    difficulty: shot.difficulty,
    caption: shot.caption,
    tags: shot.tags,
    is_published: true,
    sort_order: 0,
    attempt_count: 0,
    correct_map_count: 0,
    success_score_sum: 0,
    created_at: '',
    updated_at: '',
    created_by: null,
    map: coords ? (mapsById.get(shot.map_id) ?? null) : null,
  };
}


