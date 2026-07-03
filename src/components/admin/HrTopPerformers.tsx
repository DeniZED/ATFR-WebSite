import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock3, Swords } from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import type { PlayerActivitySummary } from '@/features/rh/activity';
// Règles de classement extraites dans features/rh/topPerformers.ts (P1-5).
import {
  computeTopPerformers,
  type TopPerformerRanking,
} from '@/features/rh/topPerformers';

const RANKING_ICONS: Record<TopPerformerRanking['key'], React.ReactNode> = {
  score: <Award size={16} />,
  battles: <Swords size={16} />,
  voice: <Clock3 size={16} />,
};

export function HrTopPerformers({
  players,
}: {
  players: PlayerActivitySummary[];
}) {
  const rankings = useMemo(() => computeTopPerformers(players), [players]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {rankings.map((ranking) => (
        <Card key={ranking.label}>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3 text-atfr-gold">
              {RANKING_ICONS[ranking.key]}
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
