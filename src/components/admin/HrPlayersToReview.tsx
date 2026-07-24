import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  Clock,
  Eye,
  Link2Off,
  Mic,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Card, CardBody } from '@/components/ui';
import type { PlayerActivitySummary } from '@/features/rh/activity';
import {
  computeReviewLists,
  reviewRowValue,
  type ReviewList,
} from '@/features/rh/review';
import { DataQualityDot } from './DataQualityBadge';

const LIST_ICONS: Record<ReviewList['key'], React.ReactNode> = {
  drop: <ArrowDownRight size={15} />,
  inactive: <Clock size={15} />,
  game_no_voice: <Mic size={15} />,
  no_discord: <Link2Off size={15} />,
  prospects: <Sparkles size={15} />,
  new_no_activity: <UserPlus size={15} />,
  watch: <Eye size={15} />,
};

/**
 * Listes actionnables « à traiter » (complète les tops). Chaque joueur est
 * cliquable vers sa fiche. Se masque de lui-même si aucune liste n'a de contenu.
 */
export function HrPlayersToReview({
  players,
}: {
  players: PlayerActivitySummary[];
}) {
  const lists = useMemo(() => computeReviewLists(players), [players]);
  if (lists.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold/70">
          À passer en revue
        </p>
        <div className="h-px flex-1 bg-atfr-gold/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lists.map((list) => (
          <Card key={list.key}>
            <CardBody className="p-4">
              <div className="mb-2.5 flex items-center gap-2 text-atfr-gold">
                {LIST_ICONS[list.key]}
                <h3 className="font-display text-sm text-atfr-bone">
                  {list.label}
                </h3>
                <span className="ml-auto text-xs text-atfr-fog">
                  {list.rows.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {list.rows.map((summary) => (
                  <li
                    key={summary.player.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <DataQualityDot quality={summary.dataQuality} />
                      <Link
                        to={`/admin/rh/${summary.player.id}`}
                        className="truncate text-atfr-bone hover:text-atfr-gold"
                      >
                        {summary.player.nickname}
                      </Link>
                    </span>
                    <span className="shrink-0 text-xs text-atfr-fog">
                      {reviewRowValue(list.key, summary)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
