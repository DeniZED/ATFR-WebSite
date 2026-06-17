import { ExternalLink } from 'lucide-react';
import { Alert, Card, CardBody, Spinner } from '@/components/ui';
import { wn8Color, wn8Label } from '@/lib/tomato-api';
import type { usePlayerLookup } from '@/features/stats/queries';

type LookupResult = NonNullable<ReturnType<typeof usePlayerLookup>['data']>;

export function PlayerLookupCard({
  loading,
  data,
  error,
}: {
  loading: boolean;
  data: LookupResult | null | undefined;
  error: unknown;
}) {
  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-10">
          <Spinner label="Vérification sur l'API WoT…" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert tone="danger" title="Erreur API">
        Impossible de joindre l'API Wargaming pour le moment.
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert tone="warning" title="Joueur introuvable">
        Aucun compte ne correspond à ce pseudo sur le serveur EU.
      </Alert>
    );
  }

  const { player, stats } = data;

  return (
    <Card>
      <CardBody className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-atfr-bone">
              {player.nickname}
            </p>
            <p className="text-xs text-atfr-fog">
              Account ID · {player.account_id}
            </p>
          </div>
          {stats?.recruitmentScore != null && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                Score de recrutement
              </p>
              <p className="font-display text-2xl text-atfr-gold">{stats.recruitmentScore}/100</p>
            </div>
          )}
        </div>

        {stats && (
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-atfr-gold hover:text-atfr-gold-light"
          >
            Voir sur tomato.gg
            <ExternalLink size={14} />
          </a>
        )}

        {stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat
                label="Batailles (global)"
                value={stats.battles.toLocaleString('fr-FR')}
                hint={stats.recent?.battles != null ? `${stats.recent.battles} (30j)` : undefined}
              />
              <Stat
                label="Winrate (global)"
                value={stats.winRate != null ? `${stats.winRate.toFixed(2)}%` : '—'}
                hint={stats.recent?.winRate != null ? `${stats.recent.winRate.toFixed(2)}% (30j)` : undefined}
              />
              <Stat
                label="WN8 (global)"
                value={stats.wn8 != null ? Math.round(stats.wn8).toString() : '—'}
                valueClass={wn8Color(stats.wn8)}
                hint={
                  stats.recent?.wn8 != null
                    ? `${Math.round(stats.recent.wn8)} (30j) · ${wn8Label(stats.wn8)}`
                    : wn8Label(stats.wn8)
                }
              />
              <Stat
                label="Tier moyen"
                value={stats.avgTier != null ? stats.avgTier.toFixed(1) : '—'}
                hint={stats.recent?.avgTier != null ? `${stats.recent.avgTier.toFixed(1)} (30j)` : undefined}
              />
            </div>
            <p className="text-xs text-atfr-fog">
              {stats.damagePerBattle != null && (
                <>
                  Dégâts moyens : <span className="text-atfr-bone">{Math.round(stats.damagePerBattle)}</span>{' '}
                  ·{' '}
                </>
              )}
              Rating WG : <span className="text-atfr-bone">{stats.globalRating}</span> · Chars T10 :{' '}
              <span className="text-atfr-bone">{stats.tier10Count}</span>
            </p>
          </>
        ) : (
          <Alert tone="warning">
            Stats détaillées indisponibles (API limitée), les infos de base ont
            été récupérées.
          </Alert>
        )}
      </CardBody>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md bg-atfr-ink/80 border border-atfr-gold/10 p-3">
      <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
        {label}
      </p>
      <p className={`text-xl font-display ${valueClass ?? 'text-atfr-bone'}`}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-atfr-fog/80 mt-0.5">{hint}</p>}
    </div>
  );
}
