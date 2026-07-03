import { formatDuration, type PlayerActivitySummary } from './activity';

// Règles de classement « Top performers » du dashboard RH (P1-5) —
// extraites du composant HrTopPerformers.tsx à l'identique : les anciens
// membres sont exclus, chaque classement garde le top 5, batailles et
// vocal ignorent les joueurs à zéro.

export interface TopPerformerRow {
  summary: PlayerActivitySummary;
  value: string;
}

export interface TopPerformerRanking {
  key: 'score' | 'battles' | 'voice';
  label: string;
  rows: TopPerformerRow[];
}

export function computeTopPerformers(
  players: PlayerActivitySummary[],
): TopPerformerRanking[] {
  const active = players.filter((s) => s.player.status !== 'former');

  const byScore = [...active]
    .sort((a, b) => b.score.value - a.score.value)
    .slice(0, 5)
    .map((summary) => ({ summary, value: `${summary.score.value}` }));

  const byBattles = [...active]
    .filter((s) => (s.battleDelta ?? 0) > 0)
    .sort((a, b) => (b.battleDelta ?? 0) - (a.battleDelta ?? 0))
    .slice(0, 5)
    .map((summary) => ({
      summary,
      value: `${summary.battleDelta} bataille(s)`,
    }));

  const byVoice = [...active]
    .filter((s) => s.voiceSeconds > 0)
    .sort((a, b) => b.voiceSeconds - a.voiceSeconds)
    .slice(0, 5)
    .map((summary) => ({
      summary,
      value: formatDuration(summary.voiceSeconds),
    }));

  return [
    { key: 'score', label: 'Meilleur score d’activité', rows: byScore },
    { key: 'battles', label: 'Plus de batailles', rows: byBattles },
    { key: 'voice', label: 'Plus de vocal', rows: byVoice },
  ];
}
