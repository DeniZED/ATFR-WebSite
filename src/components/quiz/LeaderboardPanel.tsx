import { useState } from 'react';
import { Crown, ShieldCheck, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardBody, Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useLeaderboard } from '@/features/leaderboard/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';

interface LeaderboardPanelProps {
  moduleSlug: string;
  submode?: string;
  limit?: number;
  /** Default tab when both are available. */
  defaultTab?: 'all' | 'verified';
  className?: string;
}

export function LeaderboardPanel({
  moduleSlug,
  submode = 'default',
  limit = 10,
  defaultTab = 'all',
  className,
}: LeaderboardPanelProps) {
  const [tab, setTab] = useState<'all' | 'verified'>(defaultTab);
  const me = usePlayerIdentity();

  const board = useLeaderboard({
    moduleSlug,
    submode,
    limit,
    verifiedOnly: tab === 'verified',
  });

  return (
    <Card className={className}>
      <CardBody className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h3 className="font-display text-lg text-atfr-bone flex items-center gap-2">
            <Crown size={18} className="text-atfr-gold" />
            Classement
          </h3>
          <div className="flex gap-1">
            <TabBtn active={tab === 'all'} onClick={() => setTab('all')}>
              <Users size={12} /> Tous
            </TabBtn>
            <TabBtn
              active={tab === 'verified'}
              onClick={() => setTab('verified')}
            >
              <ShieldCheck size={12} /> Vérifiés WG
            </TabBtn>
          </div>
        </div>

        {board.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : !board.data || board.data.length === 0 ? (
          <p className="text-center text-sm text-atfr-fog py-6">
            {tab === 'verified'
              ? 'Aucun joueur vérifié n’a encore terminé.'
              : 'Pas encore de score. Lance la première partie !'}
          </p>
        ) : (
          <ol className="space-y-2">
            {board.data.map((entry, idx) => {
              const isMe =
                (me.isVerified &&
                  entry.is_verified &&
                  entry.player_account_id === me.accountId) ||
                (!me.isVerified &&
                  !entry.is_verified &&
                  entry.player_anon_id === me.id);
              const pct = Math.round(entry.ratio * 100);
              return (
                <li
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 rounded-md border p-3 transition-colors',
                    isMe
                      ? 'border-atfr-gold/60 bg-atfr-gold/10'
                      : 'border-atfr-gold/15 bg-atfr-graphite/40',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-display',
                      idx === 0 && 'bg-gradient-gold text-atfr-ink',
                      idx > 0 && 'bg-atfr-ink/60 text-atfr-gold',
                    )}
                  >
                    {idx === 0 ? <Crown size={14} /> : idx + 1}
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
                      {format(parseISO(entry.created_at), 'dd MMM HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl text-atfr-bone">
                      {entry.score}
                      <span className="text-atfr-fog text-sm">
                        /{entry.max_score}
                      </span>
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                      {pct}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
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
