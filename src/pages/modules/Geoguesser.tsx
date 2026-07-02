import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  EyeOff,
  Flame,
  Info,
  Map as MapIcon,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Target,
  Trophy,
  Users,
  X,
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
import {
  DEFAULT_GEO_SETTINGS,
  useGeoMaps,
  useGeoSettings,
  usePublicGeoShots,
  type PublicShot,
  type ShotWithMap,
} from '@/features/geoguesser/queries';
import {
  useLeaderboard,
  usePlayerModuleScores,
  type LeaderboardEntry,
} from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { useModalA11y } from '@/hooks/useModalA11y';
import {
  formatDistance,
  scoreTier,
  worstTotalFor,
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
import { getUnlockById, type AvatarConfig, type LevelInfo } from '@/features/geoguesser/playerProfile';
import { TankAvatar } from '@/components/geoguesser/TankAvatar';
import { AvatarCustomizer } from '@/components/geoguesser/AvatarCustomizer';

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
                        <span className="text-xs font-semibold text-atfr-fog/60">#{i + 1}</span>
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
  shots: PublicShot[],
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
  if (!hasNickname) return "Choisis d'abord un pseudo";
  if (!availability?.disabled) return null;
  if (availability.mapCount < availability.requiredMapCount) {
    return `Il faut ${availability.requiredMapCount} maps minimum pour ce mode.`;
  }
  return `Il faut ${availability.requiredShotCount} screenshots minimum pour ce mode.`;
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
    return "Travaille d'abord la silhouette des minimaps : chemins de fer, lignes d'eau et gros reliefs donnent souvent la map avant les détails.";
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
    Math.abs(dx) < 0.06 ? null : dx > 0 ? "à l'est" : "à l'ouest";
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


// ---------------------------------------------------------------------------
// Game mode selector
// ---------------------------------------------------------------------------

function GameModeSelector({
  value,
  onChange,
  challengeKey,
  modeSettings,
  dailyDone,
}: {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  challengeKey: string;
  modeSettings: GeoguesserModeSettings;
  dailyDone: boolean;
}) {
  const dailyActive = value === 'daily';
  return (
    <div className="space-y-3">
      {/* ── Challenge du jour — carte hero ── */}
      <button
        type="button"
        aria-pressed={dailyActive}
        onClick={() => onChange('daily')}
        className={cn(
          'relative w-full rounded-xl border-2 p-5 text-left transition-all duration-200 overflow-hidden group',
          dailyActive
            ? 'border-atfr-gold/70 bg-gradient-to-br from-atfr-gold/15 via-atfr-gold/6 to-atfr-ink shadow-lg shadow-atfr-gold/10'
            : dailyDone
              ? 'border-atfr-gold/10 bg-atfr-graphite/20 opacity-60'
              : 'border-atfr-gold/25 bg-atfr-graphite/30 hover:border-atfr-gold/50 hover:bg-atfr-graphite/50',
        )}
      >
        {/* Decorative glow for active state */}
        {dailyActive && (
          <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-atfr-gold/10 blur-xl pointer-events-none" />
        )}
        {dailyDone && (
          <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full border border-atfr-success/40 bg-atfr-success/10 px-2.5 py-0.5 text-[10px] font-medium text-atfr-success">
            <CheckCircle2 size={10} /> Effectué
          </span>
        )}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
              dailyActive
                ? 'border-atfr-gold/60 bg-atfr-gold/20 text-atfr-gold shadow-sm shadow-atfr-gold/20'
                : dailyDone
                  ? 'border-atfr-gold/10 bg-atfr-ink/30 text-atfr-fog/40'
                  : 'border-atfr-gold/20 bg-atfr-ink/60 text-atfr-fog group-hover:border-atfr-gold/40 group-hover:text-atfr-bone',
            )}
          >
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={cn(
                  'font-display text-lg leading-tight',
                  dailyDone && !dailyActive ? 'text-atfr-fog' : 'text-atfr-bone',
                )}
              >
                Challenge du jour
              </span>
              <Badge variant="gold" className="text-xs">{formatChallengeDate(challengeKey)}</Badge>
            </div>
            <p className={cn('text-xs leading-relaxed', dailyDone && !dailyActive ? 'text-atfr-fog/50' : 'text-atfr-fog')}>
              {modeSettings.dailyRounds} manches · même pool pour tout le clan · classement commun
            </p>
          </div>
          {dailyActive && (
            <ArrowRight size={16} className="shrink-0 text-atfr-gold" />
          )}
        </div>
      </button>

      {/* ── Modes entraînement ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-atfr-fog/60 mb-2 px-0.5">
          Entraînement
        </p>
        <div className="grid grid-cols-3 gap-2">
          <TrainingModeButton
            active={value === 'random'}
            icon={<Shuffle size={16} />}
            title="Série libre"
            detail={`${modeSettings.randomRounds} manches`}
            subDetail="Pool aléatoire"
            accentClass="border-atfr-success/30 bg-atfr-success/8 text-atfr-success"
            onClick={() => onChange('random')}
          />
          <TrainingModeButton
            active={value === 'sprint'}
            icon={<Zap size={16} />}
            title="Sprint"
            detail={`${modeSettings.sprintRounds} m · ${modeSettings.sprintRoundTimeS}s`}
            subDetail="Chrono & vitesse"
            accentClass="border-atfr-warning/30 bg-atfr-warning/8 text-atfr-warning"
            onClick={() => onChange('sprint')}
          />
          <TrainingModeButton
            active={value === 'blind'}
            icon={<EyeOff size={16} />}
            title="Blind"
            detail={`${modeSettings.blindRounds} m · ${modeSettings.blindPreviewSeconds}s`}
            subDetail="De mémoire"
            accentClass="border-atfr-fog/20 bg-atfr-graphite/50 text-atfr-fog"
            onClick={() => onChange('blind')}
          />
        </div>
      </div>
    </div>
  );
}

function TrainingModeButton({
  active,
  icon,
  title,
  detail,
  subDetail,
  accentClass,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  detail: string;
  subDetail: string;
  accentClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-xl border p-3 text-left transition-all duration-200 group',
        active
          ? 'border-atfr-gold/60 bg-atfr-gold/10 text-atfr-bone shadow-sm shadow-atfr-gold/10'
          : 'border-atfr-gold/15 bg-atfr-graphite/40 text-atfr-fog hover:border-atfr-gold/30 hover:bg-atfr-graphite/60 hover:text-atfr-bone',
      )}
    >
      <div
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border mb-2.5 transition-all',
          active
            ? 'border-atfr-gold/40 bg-atfr-gold/15 text-atfr-gold'
            : cn('border-atfr-gold/10 bg-atfr-ink/50', accentClass, 'opacity-70 group-hover:opacity-100'),
        )}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold leading-tight text-atfr-bone">{title}</p>
      <p className="text-[10px] text-atfr-fog mt-1 leading-snug">{detail}</p>
      <p className="text-[9px] text-atfr-fog/60 mt-0.5 leading-snug uppercase tracking-wide">{subDetail}</p>
    </button>
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
    <div className="space-y-2.5">
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
              ? `${status.mapCount}/${status.requiredMapCount} maps`
              : `${status.shotCount}/${status.requiredShotCount} screens`;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              title={disabled ? disabledDetail : undefined}
              onClick={() => {
                if (!disabled) onChange(option.value);
              }}
              className={cn(
                'rounded-xl border p-3 text-left transition-all duration-150 group',
                disabled
                  ? 'cursor-not-allowed border-atfr-gold/8 bg-atfr-graphite/20 opacity-40 grayscale'
                  : active
                    ? 'border-atfr-gold/70 bg-atfr-gold/10 text-atfr-bone shadow-sm shadow-atfr-gold/10'
                    : 'border-atfr-gold/15 bg-atfr-graphite/40 text-atfr-fog hover:border-atfr-gold/35 hover:bg-atfr-graphite/60 hover:text-atfr-bone',
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'h-2.5 w-2.5 flex-shrink-0 rounded-full border shadow-sm',
                    getDifficultyDotClass(option.value),
                  )}
                />
                <span className="text-sm font-semibold text-atfr-bone leading-tight">
                  {option.label}
                </span>
              </div>
              <span className="block text-[10px] text-atfr-fog/80 leading-relaxed">
                {option.detail}
              </span>
              <span className="mt-1.5 block text-[10px] text-atfr-fog/50">
                {disabled
                  ? `Manque ${disabledDetail}`
                  : `${status.mapCount} maps · ${status.shotCount} screens`}
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
  roundTimeS,
  roundTarget,
  wrongMapMalusM,
  timeoutMalusM,
  modeSettings,
  hasNickname,
  dailyDone,
  canStart,
  disabledReason,
  trainingMode,
  onTrainingModeChange,
  onStart,
}: {
  gameMode: GameMode;
  roundTimeS: number;
  roundTarget: number;
  wrongMapMalusM: number;
  timeoutMalusM: number;
  modeSettings: GeoguesserModeSettings;
  hasNickname: boolean;
  dailyDone: boolean;
  canStart: boolean;
  disabledReason: string | null;
  trainingMode: boolean;
  onTrainingModeChange: (v: boolean) => void;
  onStart: () => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-3">
      {/* Règles condensées avec toggle info */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-atfr-fog flex-1">
          <span className="inline-flex items-center gap-1">
            <Camera size={11} /> {roundTarget} manches
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> {roundTimeS}s / manche
          </span>
          {gameMode === 'sprint' && (
            <>
              <span>·</span>
              <span className="text-atfr-warning">Pénalité chrono</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((p) => !p)}
          className="text-atfr-fog/50 hover:text-atfr-gold transition-colors"
          title="Voir les règles de scoring"
        >
          <Info size={14} />
        </button>
      </div>

      {/* Détail des pénalités (optionnel) */}
      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.div
            key="info"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ModeRules gameMode={gameMode} roundTimeS={roundTimeS} modeSettings={modeSettings} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-1 text-xs text-atfr-fog">
              <span>
                Mauvaise map{' '}
                <strong className="text-atfr-bone">+{formatDistance(wrongMapMalusM)}</strong>
              </span>
              <span>·</span>
              <span>
                Time out{' '}
                <strong className="text-atfr-bone">+{formatDistance(timeoutMalusM)}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle entraînement (hors daily) */}
      {gameMode !== 'daily' && (
        <label className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all select-none',
          trainingMode
            ? 'border-atfr-fog/30 bg-atfr-graphite/60'
            : 'border-atfr-gold/15 bg-atfr-graphite/30 hover:border-atfr-gold/25',
        )}>
          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={trainingMode}
              onChange={(e) => onTrainingModeChange(e.target.checked)}
              className="sr-only"
            />
            <div className={cn(
              'h-5 w-5 rounded border-2 flex items-center justify-center transition-all',
              trainingMode
                ? 'border-atfr-fog/60 bg-atfr-graphite'
                : 'border-atfr-gold/30 bg-atfr-ink/60',
            )}>
              {trainingMode && <CheckCircle2 size={12} className="text-atfr-fog" />}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className={trainingMode ? 'text-atfr-fog' : 'text-atfr-gold/60'} />
              <span className={cn(
                'text-sm font-medium',
                trainingMode ? 'text-atfr-fog' : 'text-atfr-bone',
              )}>
                Mode entraînement
              </span>
            </div>
            <p className="text-xs text-atfr-fog/60 mt-0.5">
              Score non soumis au classement — joue sans pression
            </p>
          </div>
        </label>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={onStart}
        disabled={!canStart}
        trailingIcon={<ArrowRight size={16} />}
      >
        {gameMode === 'daily' && dailyDone
          ? "Challenge déjà effectué aujourd'hui"
          : hasNickname
            ? getStartButtonLabel(gameMode)
            : "Connecte-toi d'abord"}
      </Button>
      {disabledReason && (
        <p className="text-xs text-atfr-warning">{disabledReason}</p>
      )}
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
          ? "Même sélection pour tout le clan aujourd'hui, avec un classement dédié."
          : "Une série rapide pour t'entraîner sur le pool et la difficulté choisis."}
      </p>
    </div>
  );
}


function RoundStatusBar({
  stats,
  totalScore,
  gameMode,
  challengeKey,
  difficulty,
  trainingMode,
}: {
  stats: ResultStats;
  totalScore: number;
  gameMode: GameMode;
  challengeKey: string;
  difficulty: DifficultyFilter;
  trainingMode: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-atfr-gold/15 bg-atfr-carbon/80 px-4 py-2.5 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getModeBadgeVariant(gameMode)}>
          {formatModeLabel(gameMode, challengeKey)}
        </Badge>
        {difficulty !== 'all' && (
          <Badge variant="outline" className="text-[10px]">
            {DIFFICULTY_LABELS[difficulty]}
          </Badge>
        )}
        {trainingMode && (
          <Badge variant="neutral" className="text-[10px] inline-flex items-center gap-1">
            <BookOpen size={9} /> Entraînement
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5">
          <Flame
            size={13}
            className={stats.currentStreak > 0 ? 'text-atfr-warning' : 'text-atfr-fog/30'}
          />
          <span className={cn(
            'text-xs tabular-nums font-medium',
            stats.currentStreak > 0 ? 'text-atfr-bone' : 'text-atfr-fog/40',
          )}>
            ×{stats.currentStreak}
          </span>
        </div>
        {/* Score courant */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-widest text-atfr-fog/60">Score</span>
          <span className="font-display text-base text-atfr-gold tabular-nums">
            {formatDistance(totalScore)}
          </span>
        </div>
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
  onValidate: () => void;
  onNext: () => void;
}) {
  const step = showReveal ? 3 : !selectedMapName ? 1 : !hasPick ? 2 : 3;
  const stepDetail = showReveal
    ? 'Analyse la correction, puis passe à la suite.'
    : !selectedMapName
      ? 'Ouvre le sélecteur en bas à droite et choisis la minimap.'
      : !hasPick
        ? `${selectedMapName} — clique sur la minimap pour poser le pin.`
        : `${selectedMapName} — pin posé. Tu peux encore le déplacer.`;

  return (
    <div className="sticky bottom-3 z-30 rounded-xl border border-atfr-gold/30 bg-atfr-ink/95 p-4 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* Step pills */}
          {!showReveal && (
            <div className="flex items-center gap-1.5 mb-2">
              {[
                { n: 1, label: 'Map' },
                { n: 2, label: 'Pin' },
                { n: 3, label: 'Valider' },
              ].map(({ n, label }) => (
                <span
                  key={n}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
                    step > n
                      ? 'bg-atfr-success/20 text-atfr-success border border-atfr-success/30'
                      : step === n
                        ? 'bg-atfr-gold/20 text-atfr-gold border border-atfr-gold/40'
                        : 'bg-atfr-graphite/40 text-atfr-fog/40 border border-atfr-gold/10',
                  )}
                >
                  {step > n ? <CheckCircle2 size={9} /> : <span>{n}</span>}
                  {label}
                </span>
              ))}
              <span className="text-[10px] text-atfr-fog/50 tabular-nums ml-1">
                {secondsLeft}s
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {showReveal && (
              <Badge variant="gold">Révélation</Badge>
            )}
            <span className="text-xs text-atfr-fog">
              Manche {currentIndex + 1}/{total}
            </span>
            {!showReveal && (
              <span className="text-xs text-atfr-fog">
                · Score : <strong className="text-atfr-gold">{formatDistance(totalScore)}</strong>
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-atfr-bone leading-snug">
            {showReveal ? stepDetail : <span className="text-atfr-fog">{stepDetail}</span>}
          </p>
        </div>

        {showReveal ? (
          <Button
            className="w-full sm:w-auto shrink-0"
            onClick={onNext}
            trailingIcon={<ArrowRight size={14} />}
          >
            {currentIndex < total - 1 ? 'Manche suivante' : 'Voir le résultat'}
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto shrink-0"
            onClick={onValidate}
            disabled={!canValidate}
            trailingIcon={<ArrowRight size={14} />}
          >
            Valider
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
  levelInfo,
  avatarConfig,
  onCustomize,
}: {
  stats: PersonalStats;
  isLoading: boolean;
  levelInfo: LevelInfo;
  avatarConfig: AvatarConfig;
  onCustomize: () => void;
}) {
  const titleUnlock = avatarConfig.titleId ? getUnlockById(avatarConfig.titleId) : null;

  const AvatarCard = (
    <div className="flex items-center gap-4 rounded-xl border border-atfr-gold/20 bg-atfr-graphite/40 p-3">
      <div className="shrink-0 flex items-center justify-center w-28 h-[76px] rounded-lg bg-atfr-ink/50 border border-atfr-gold/10">
        <TankAvatar config={avatarConfig} size={104} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-display text-lg text-atfr-gold">Niv. {levelInfo.level}</span>
          <Badge variant="gold">{levelInfo.title}</Badge>
        </div>
        {titleUnlock && (
          <p className="text-[11px] text-atfr-fog/60 italic mb-1.5">{titleUnlock.label}</p>
        )}
        <div className="h-1.5 rounded-full bg-atfr-ink/70 overflow-hidden mb-1">
          <div
            className="h-full rounded-full bg-gradient-to-r from-atfr-gold/70 to-atfr-gold transition-all duration-700"
            style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-atfr-fog">
          {levelInfo.xp.toLocaleString('fr')} XP
          {!levelInfo.isMax && ` · +${levelInfo.xpToNext.toLocaleString('fr')} → niv. ${levelInfo.level + 1}`}
          {levelInfo.isMax && <span className="text-atfr-gold"> · Niveau max !</span>}
        </p>
      </div>
      <button
        onClick={onCustomize}
        className="shrink-0 px-2.5 py-1.5 rounded-lg border border-atfr-gold/30 text-[11px] text-atfr-gold hover:bg-atfr-gold/10 transition-colors font-medium"
      >
        Perso.
      </button>
    </div>
  );

  if (isLoading && stats.games === 0) {
    return (
      <Card>
        <CardBody className="p-5 space-y-4">
          {AvatarCard}
          <div className="flex justify-center">
            <Spinner />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (stats.games === 0) {
    return (
      <Card>
        <CardBody className="p-5 space-y-4">
          {AvatarCard}
          <div className="flex items-start gap-4">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg text-atfr-bone">Mes stats</h3>
              <p className="mt-1 text-sm leading-relaxed text-atfr-fog">
                Termine une partie pour débloquer ton historique : meilleur score,
                progression, modes forts et dernières manches.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-5 space-y-5">
        {/* Avatar + Level */}
        {AvatarCard}

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-display text-lg text-atfr-bone flex items-center gap-2">
            <BarChart3 size={18} className="text-atfr-gold" />
            Mes stats
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {stats.trend && (
              <Badge variant={getTrendBadgeVariant(stats.trend.tone)}>
                {stats.trend.label}
              </Badge>
            )}
            <span className="text-xs text-atfr-fog">
              {stats.games} partie{stats.games > 1 ? 's' : ''}
              {stats.gamesLast7Days > 0 && ` · ${stats.gamesLast7Days} cette semaine`}
            </span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <PersonalStatTile
            icon={<Trophy size={15} />}
            label="Meilleur score"
            value={stats.bestScoreM != null ? formatDistance(stats.bestScoreM) : '—'}
            detail="score le plus bas"
            tone="gold"
          />
          <PersonalStatTile
            icon={<Target size={15} />}
            label="Moyenne"
            value={stats.avgScoreM != null ? formatDistance(stats.avgScoreM) : '—'}
            detail="par partie"
            tone="neutral"
          />
          <PersonalStatTile
            icon={<MapIcon size={15} />}
            label="Précision maps"
            value={stats.avgMapAccuracyPct != null ? `${stats.avgMapAccuracyPct}%` : '—'}
            detail="maps correctes en moy."
            tone={stats.avgMapAccuracyPct != null && stats.avgMapAccuracyPct >= 70 ? 'success' : 'neutral'}
          />
          <PersonalStatTile
            icon={<Flame size={15} />}
            label="Meilleure série"
            value={stats.bestStreak > 0 ? `×${stats.bestStreak}` : '—'}
            detail="maps d'affilée"
            tone={stats.bestStreak >= 3 ? 'warning' : 'neutral'}
          />
        </div>

        {/* Par mode */}
        {stats.modes.length > 0 && (
          <div className="rounded-xl border border-atfr-gold/15 bg-atfr-graphite/35 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-3">
              Par mode
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stats.modes.map((mode) => (
                <div
                  key={mode.mode}
                  className="flex items-center gap-3 rounded-lg bg-atfr-ink/45 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getModeBadgeVariant(mode.mode)} className="text-[10px]">
                        {formatGenericModeLabel(mode.mode)}
                      </Badge>
                      <span className="text-[10px] text-atfr-fog/60">{mode.games}p</span>
                    </div>
                    <p className="text-xs text-atfr-fog">
                      Moy. <span className="text-atfr-bone">{formatDistance(mode.avgScoreM)}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-base text-atfr-bone tabular-nums">
                      {formatDistance(mode.bestScoreM)}
                    </p>
                    <p className="text-[9px] text-atfr-fog uppercase tracking-wide">best</p>
                  </div>
                </div>
              ))}
            </div>
            {stats.trend && (
              <p className="mt-3 text-xs text-atfr-fog border-t border-atfr-gold/10 pt-3">
                {stats.trend.detail}
              </p>
            )}
          </div>
        )}

        {/* Dernières parties */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-gold mb-2.5">
            Dernières parties
          </p>
          <div className="grid gap-1.5">
            {stats.recent.map((score) => {
              const pct = Math.round(score.ratio * 100);
              return (
                <div
                  key={score.id}
                  className="flex items-center gap-3 rounded-lg border border-atfr-gold/10 bg-atfr-ink/35 px-3 py-2.5"
                >
                  <Badge variant={getModeBadgeVariant(score.mode)} className="shrink-0 text-[10px]">
                    {formatScoreModeLabel(score.mode, score.dailyKey)}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-atfr-fog/70">
                      {formatScoreDate(score.createdAt)}
                      {score.mapAccuracyPct != null ? ` · ${score.mapAccuracyPct}% maps` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm text-atfr-bone tabular-nums">
                      {formatDistance(score.scoreM)}
                    </p>
                    <p className={cn(
                      'text-[9px] tabular-nums',
                      pct >= 80 ? 'text-atfr-success' : pct >= 50 ? 'text-atfr-gold' : 'text-atfr-fog',
                    )}>
                      {pct}%
                    </p>
                  </div>
                </div>
              );
            })}
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
  tone = 'gold',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: 'gold' | 'success' | 'warning' | 'neutral';
}) {
  const iconClass =
    tone === 'success'
      ? 'border-atfr-success/30 bg-atfr-success/10 text-atfr-success'
      : tone === 'warning'
        ? 'border-atfr-warning/30 bg-atfr-warning/10 text-atfr-warning'
        : tone === 'neutral'
          ? 'border-atfr-fog/20 bg-atfr-ink/60 text-atfr-fog'
          : 'border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold';

  return (
    <div className="rounded-xl border border-atfr-gold/15 bg-atfr-ink/45 p-3.5 min-w-0">
      <div className={cn('mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border', iconClass)}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog">
        {label}
      </p>
      <p className="font-display text-xl text-atfr-bone mt-1 truncate">
        {value}
      </p>
      <p className="text-[10px] text-atfr-fog/70 mt-1 truncate">{detail}</p>
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
              ? "Personne n'a encore terminé le défi du jour."
              : "Pas encore de score sur cette difficulté."}
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

  const rankBadge =
    rank === 1
      ? { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', text: 'text-atfr-ink', shadow: 'shadow-amber-400/30' }
      : rank === 2
        ? { bg: 'bg-gradient-to-br from-slate-300 to-slate-400', text: 'text-atfr-ink', shadow: 'shadow-slate-400/20' }
        : rank === 3
          ? { bg: 'bg-gradient-to-br from-amber-600 to-amber-700', text: 'text-white', shadow: 'shadow-amber-700/20' }
          : { bg: 'bg-atfr-ink/60', text: 'text-atfr-fog', shadow: '' };

  return (
    <li
      className={cn(
        'rounded-xl border p-3.5 transition-colors',
        isMe
          ? 'border-atfr-gold/60 bg-atfr-gold/10 shadow-sm shadow-atfr-gold/10'
          : rank <= 3
            ? 'border-atfr-gold/20 bg-atfr-graphite/50'
            : 'border-atfr-gold/10 bg-atfr-graphite/35',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow',
            rankBadge.bg,
            rankBadge.text,
            rankBadge.shadow,
          )}
        >
          {rank === 1 ? <Crown size={14} /> : rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn(
            'font-semibold truncate flex items-center gap-1.5 text-sm',
            isMe ? 'text-atfr-gold' : 'text-atfr-bone',
          )}>
            {entry.player_nickname}
            {isMe && <span className="text-[9px] uppercase tracking-widest text-atfr-gold/70 font-normal">(moi)</span>}
            {entry.is_verified && (
              <ShieldCheck
                size={13}
                className="text-atfr-success shrink-0"
                aria-label="Compte WG vérifié"
              />
            )}
          </p>
          <p className="text-[10px] text-atfr-fog/70 mt-0.5">
            {dailyKey ? `Défi ${formatChallengeDate(dailyKey)} · ` : ''}
            {formatScoreDate(entry.created_at)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-xl text-atfr-bone tabular-nums leading-tight">
            {formatDistance(scoreM)}
          </p>
          <p className="text-[10px] text-atfr-fog mt-0.5">
            <span className={cn('font-semibold', pct >= 80 ? 'text-atfr-success' : pct >= 50 ? 'text-atfr-gold' : 'text-atfr-fog')}>
              {pct}%
            </span>
            {' '}perf
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
        <LeaderboardMetric
          label="Moy./manche"
          value={avgM != null ? formatDistance(avgM) : '—'}
        />
        <LeaderboardMetric
          label={isSprint ? 'Temps total' : 'Maps OK'}
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
          label={isSprint ? 'Dist. brute' : 'Meilleure série'}
          value={
            isSprint
              ? rawDistanceM != null
                ? formatDistance(rawDistanceM)
                : '—'
              : bestStreak != null
                ? `×${bestStreak}`
                : '—'
          }
        />
      </div>
    </li>
  );
}

function LeaderboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-atfr-ink/50 px-2 py-2">
      <p className="text-[9px] uppercase tracking-[0.14em] text-atfr-fog/70 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-atfr-bone tabular-nums">{value}</p>
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
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const r = results[i];
          const isCurrent = i === currentIndex && !r;
          return (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-full transition-all duration-300',
                isCurrent ? 'h-2.5' : 'h-2',
                r
                  ? r.kind === 'timeout'
                    ? 'bg-atfr-warning'
                    : r.correctMap
                      ? 'bg-atfr-success'
                      : 'bg-atfr-danger'
                  : isCurrent
                    ? 'bg-atfr-gold shadow-sm shadow-atfr-gold/50'
                    : 'bg-atfr-graphite/60',
              )}
            />
          );
        })}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => {
          const r = results[i];
          const isCurrent = i === currentIndex && !r;
          return (
            <div key={i} className="flex-1 text-center">
              <span className={cn(
                'text-[9px] tabular-nums',
                r
                  ? r.correctMap ? 'text-atfr-success/80' : 'text-atfr-danger/80'
                  : isCurrent ? 'text-atfr-gold font-semibold' : 'text-atfr-fog/30',
              )}>
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>
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
  const tone =
    result.kind === 'distance'
      ? 'success'
      : result.kind === 'timeout'
        ? 'warning'
        : 'danger';
  const headline =
    result.kind === 'wrong-map'
      ? 'Mauvaise map'
      : result.kind === 'timeout'
        ? 'Temps écoulé'
        : closeHit
          ? 'Pile au bon endroit !'
          : 'Bonne map !';
  const Icon =
    result.kind === 'distance'
      ? closeHit ? CheckCircle2 : Target
      : result.kind === 'timeout'
        ? Clock
        : XCircle;

  const borderClass =
    tone === 'success'
      ? 'border-atfr-success/40'
      : tone === 'warning'
        ? 'border-atfr-warning/40'
        : 'border-atfr-danger/40';
  const bgClass =
    tone === 'success'
      ? 'bg-gradient-to-r from-atfr-success/10 to-transparent'
      : tone === 'warning'
        ? 'bg-gradient-to-r from-atfr-warning/10 to-transparent'
        : 'bg-gradient-to-r from-atfr-danger/10 to-transparent';
  const iconClass =
    tone === 'success'
      ? 'border-atfr-success/40 bg-atfr-success/15 text-atfr-success'
      : tone === 'warning'
        ? 'border-atfr-warning/40 bg-atfr-warning/15 text-atfr-warning'
        : 'border-atfr-danger/40 bg-atfr-danger/15 text-atfr-danger';
  const headlineClass =
    tone === 'success'
      ? 'text-atfr-success'
      : tone === 'warning'
        ? 'text-atfr-warning'
        : 'text-atfr-danger';

  return (
    <Card className={cn('overflow-hidden border-2', borderClass)}>
      <CardBody className={cn('p-0', bgClass)}>
        <div className="flex items-start gap-4 p-4 sm:p-5">
          <div className={cn(
            'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
            iconClass,
          )}>
            <Icon size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <p className={cn('font-display text-xl font-bold leading-tight', headlineClass)}>
              {headline}
            </p>
            {/* Métriques clés */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {result.kind === 'distance' && result.distanceM != null && (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-atfr-bone">
                  <Target size={13} className="text-atfr-gold" />
                  {formatDistance(result.distanceM)}
                </span>
              )}
              {result.kind === 'wrong-map' && (
                <span className="text-xs text-atfr-fog">
                  +{formatDistance(settings.wrongMapMalusM)} de malus
                </span>
              )}
              {result.kind === 'timeout' && (
                <span className="text-xs text-atfr-fog">
                  +{formatDistance(settings.timeoutMalusM)} de malus
                </span>
              )}
              {result.timePenalty > 0 && (
                <span className="text-xs text-atfr-fog">
                  · Chrono +{formatDistance(result.timePenalty)} ({formatDuration(result.elapsedSeconds)})
                </span>
              )}
              <span className="text-xs text-atfr-fog">
                <Camera size={11} className="inline mr-1 opacity-60" />
                {result.shot.map?.name}
              </span>
            </div>
            <p className="text-sm text-atfr-bone/80 mt-2 leading-relaxed">
              {feedback}
            </p>
          </div>

          {/* Score de la manche */}
          <div className="shrink-0 text-right pl-2 border-l border-atfr-gold/15">
            <p className="font-display text-4xl text-atfr-bone tabular-nums leading-none">
              {formatDistance(result.score)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-atfr-fog mt-1">
              cette manche
            </p>
          </div>
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
