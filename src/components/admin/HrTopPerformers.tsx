import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock3, Swords } from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatDuration, type PlayerActivitySummary } from '@/features/rh/activity';

interface Ranking {
  label: string;
  icon: React.ReactNode;
  rows: Array<{ summary: PlayerActivitySummary; value: string }>;
}

export function HrTopPerformers({
  players,
}: {
  players: PlayerActivitySummary[];
}) {
  const rankings = useMemo<Ranking[]>(() => {
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
      { label: 'Meilleur score d’activité', icon: <Award size={16} />, rows: byScore },
      { label: 'Plus de batailles', icon: <Swords size={16} />, rows: byBattles },
      { label: 'Plus de vocal', icon: <Clock3 size={16} />, rows: byVoice },
    ];
  }, [players]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {rankings.map((ranking) => (
        <Card key={ranking.label}>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3 text-atfr-gold">
              {ranking.icon}
              <h3 className="font-display text-base text-atfr-bone">
                {ranking.label}
              </h3>
            </div>
            {ranking.rows.length === 0 ? (
              <p className="text-sm text-atfr-fog">Pas de données sur la période.</p>
            ) : (
              <ol className="space-y-2">
                {ranking.rows.map(({ summary, value }, index) => (
                  <li
                    key={summary.player.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={index === 0 ? 'gold' : 'outline'} className="shrink-0">
                        {index + 1}
                      </Badge>
                      <Link
                        to={`/admin/rh/${summary.player.id}`}
                        className="truncate text-atfr-bone hover:text-atfr-gold"
                      >
                        {summary.player.nickname}
                      </Link>
                    </div>
                    <span className="shrink-0 text-atfr-fog">{value}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
