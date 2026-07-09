// Sous-composants de la page GeoGuesseur (P2-1 tranche 2) — extraits de
// Geoguesser.tsx à l'identique.
import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  EyeOff,
  Flame,
  Info,
  Map as MapIcon,
  ShieldCheck,
  Shuffle,
  Target,
  Trophy,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Spinner,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import {
  useLeaderboard,
  type LeaderboardEntry,
} from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import {
  formatChallengeDate,
  formatDuration,
  formatGenericModeLabel,
  formatModeLabel,
  formatScoreModeLabel,
  getBlindPreviewSeconds,
  getDifficultyDetail,
  getDifficultyDotClass,
  getStartButtonLabel,
  type DifficultyAvailability,
  type DifficultyFilter,
  type GameMode,
  type GeoguesserModeSettings,
} from '@/features/geoguesser/mode';
import {
  formatDistance,
  type RoundScoreSettings,
} from '@/features/geoguesser/scoring';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';

import { getUnlockById, type AvatarConfig, type LevelInfo } from '@/features/geoguesser/playerProfile';
import { TankAvatar } from '@/components/geoguesser/TankAvatar';
import {
  buildRoundFeedback,
  dedupeLeaderboardEntries,
  formatScoreDate,
  getMetaNumber,
  getMetaString,
  getModeBadgeVariant,
  getTrendBadgeVariant,
  isLeaderboardEntryMe,
  type PersonalStats,
  type ResultStats,
  type RoundResult,
} from '@/features/geoguesser/resultStats';

export function GameModeSelector({
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
                  ? 'border-atfr-gold/10 bg-atfr-ink/30 text-atfr-fog/85'
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
            <p className={cn('text-xs leading-relaxed', dailyDone && !dailyActive ? 'text-atfr-fog/85' : 'text-atfr-fog')}>
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
        <p className="text-[10px] uppercase tracking-[0.25em] text-atfr-fog/85 mb-2 px-0.5">
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

export function TrainingModeButton({
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
      <p className="text-[9px] text-atfr-fog/85 mt-0.5 leading-snug uppercase tracking-wide">{subDetail}</p>
    </button>
  );
}


export function DifficultyPicker({
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
              <span className="mt-1.5 block text-[10px] text-atfr-fog/85">
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

export function SetupSummaryPanel({
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
          className="text-atfr-fog/85 hover:text-atfr-gold transition-colors"
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
            <p className="text-xs text-atfr-fog/85 mt-0.5">
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


export function ModeRules({
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


export function RoundStatusBar({
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
            className={stats.currentStreak > 0 ? 'text-atfr-warning' : 'text-atfr-fog/85'}
          />
          <span className={cn(
            'text-xs tabular-nums font-medium',
            stats.currentStreak > 0 ? 'text-atfr-bone' : 'text-atfr-fog/85',
          )}>
            ×{stats.currentStreak}
          </span>
        </div>
        {/* Score courant */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-widest text-atfr-fog/85">Score</span>
          <span className="font-display text-base text-atfr-gold tabular-nums">
            {formatDistance(totalScore)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RoundActionDock({
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
                        : 'bg-atfr-graphite/40 text-atfr-fog/85 border border-atfr-gold/10',
                  )}
                >
                  {step > n ? <CheckCircle2 size={9} /> : <span>{n}</span>}
                  {label}
                </span>
              ))}
              <span className="text-[10px] text-atfr-fog/85 tabular-nums ml-1">
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

export function ResultInsights({ stats }: { stats: ResultStats }) {
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

export function PersonalStatsPanel({
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
          <p className="text-[11px] text-atfr-fog/85 italic mb-1.5">{titleUnlock.label}</p>
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
                      <span className="text-[10px] text-atfr-fog/85">{mode.games}p</span>
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
                    <p className="text-xs text-atfr-fog/85">
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

export function PersonalStatTile({
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
      <p className="text-[10px] text-atfr-fog/85 mt-1 truncate">{detail}</p>
    </div>
  );
}

export function InsightStat({
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

export function GeoguesserLeaderboardPanel({
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

export function GeoguesserLeaderboardRow({
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
          <p className="text-[10px] text-atfr-fog/85 mt-0.5">
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

export function LeaderboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-atfr-ink/50 px-2 py-2">
      <p className="text-[9px] uppercase tracking-[0.14em] text-atfr-fog/85 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-atfr-bone tabular-nums">{value}</p>
    </div>
  );
}

export function LeaderboardTab({
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

export function ProgressBar({
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
                  : isCurrent ? 'text-atfr-gold font-semibold' : 'text-atfr-fog/85',
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

export function RevealBanner({
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

export function BlindGuessCurtain({ previewSeconds }: { previewSeconds: number }) {
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

export function TutorialCard({
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

export function Step({ n }: { n: number }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-atfr-gold/20 border border-atfr-gold/40 text-atfr-gold text-xs font-display">
      {n}
    </span>
  );
}
