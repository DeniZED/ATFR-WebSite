import type { PlayerActivitySummary } from './activity';

/**
 * Listes actionnables pour le staff RH — « qui traiter en priorité ».
 * Chaque liste est calculée sur le périmètre déjà filtré passé en entrée.
 */
export interface ReviewList {
  key:
    | 'drop'
    | 'inactive'
    | 'game_no_voice'
    | 'no_discord'
    | 'prospects'
    | 'new_no_activity'
    | 'watch';
  label: string;
  rows: PlayerActivitySummary[];
}

const INACTIVE_DAYS = 14;
const NEW_MEMBER_DAYS = 14;
const STRONG_DROP_PCT = -45;
const MAX_ROWS = 6;

function daysSince(iso: string | null | undefined, now: number): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now - t) / 86_400_000);
}

export function computeReviewLists(
  players: PlayerActivitySummary[],
  now: number = Date.now(),
): ReviewList[] {
  const drop = players
    .filter((s) => s.score.trend.pct != null && s.score.trend.pct <= STRONG_DROP_PCT)
    .sort((a, b) => (a.score.trend.pct ?? 0) - (b.score.trend.pct ?? 0));

  const inactive = players
    .filter((s) => {
      const d = daysSince(s.latestWotActivityAt, now);
      return d != null && d >= INACTIVE_DAYS && s.player.status !== 'former';
    })
    .sort(
      (a, b) =>
        (daysSince(b.latestWotActivityAt, now) ?? 0) -
        (daysSince(a.latestWotActivityAt, now) ?? 0),
    );

  const gameNoVoice = players.filter(
    (s) => s.latestWotActivityAt && s.voiceSeconds === 0,
  );

  const noDiscord = players.filter((s) => !s.discordLink);

  const prospects = players.filter((s) => s.player.status === 'prospect');

  const newNoActivity = players.filter((s) => {
    const joined = daysSince(s.player.joined_at, now);
    return joined != null && joined <= NEW_MEMBER_DAYS && s.activeDays === 0;
  });

  const watch = players.filter((s) => s.player.status === 'watch');

  const lists: ReviewList[] = [
    { key: 'drop', label: 'Plus forte baisse', rows: drop },
    { key: 'inactive', label: `Inactifs ${INACTIVE_DAYS} j+`, rows: inactive },
    { key: 'game_no_voice', label: 'Joue sans vocal', rows: gameNoVoice },
    { key: 'no_discord', label: 'Discord non lié', rows: noDiscord },
    { key: 'prospects', label: 'Prospects à suivre', rows: prospects },
    { key: 'new_no_activity', label: 'Nouveaux sans activité', rows: newNoActivity },
    { key: 'watch', label: 'À surveiller', rows: watch },
  ];

  return lists
    .map((l) => ({ ...l, rows: l.rows.slice(0, MAX_ROWS) }))
    .filter((l) => l.rows.length > 0);
}

/** Valeur courte affichée à droite de chaque joueur selon la liste. */
export function reviewRowValue(
  key: ReviewList['key'],
  summary: PlayerActivitySummary,
  now: number = Date.now(),
): string {
  switch (key) {
    case 'drop':
      return summary.score.trend.pct != null
        ? `${Math.round(summary.score.trend.pct)} %`
        : '—';
    case 'inactive': {
      const d = daysSince(summary.latestWotActivityAt, now);
      return d != null ? `${d} j` : '—';
    }
    case 'new_no_activity': {
      const d = daysSince(summary.player.joined_at, now);
      return d != null ? `arrivé il y a ${d} j` : '—';
    }
    default:
      return `score ${summary.score.value}`;
  }
}
