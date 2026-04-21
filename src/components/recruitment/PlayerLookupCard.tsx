import { ExternalLink } from 'lucide-react';
import { Alert, Badge, Card, CardBody, Spinner } from '@/components/ui';
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

  const { player, info, tomato } = data;

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
          <a
            href={tomato.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-atfr-gold hover:text-atfr-gold-light"
          >
            Voir sur tomato.gg
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Batailles" value={info?.battles.toLocaleString('fr-FR') ?? '—'} />
          <Stat
            label="Winrate"
            value={info ? `${info.win_rate.toFixed(2)}%` : '—'}
          />
          <Stat
            label="WN8"
            value={tomato.wn8 != null ? Math.round(tomato.wn8).toString() : '—'}
            valueClass={wn8Color(tomato.wn8)}
            hint={wn8Label(tomato.wn8)}
          />
          <Stat
            label="Tier X"
            value={tomato.tier10Count != null ? String(tomato.tier10Count) : '—'}
          />
        </div>

        {tomato.recentWn8 != null && (
          <div className="flex items-center gap-2 text-xs text-atfr-fog">
            <Badge variant="outline">60 jours</Badge>
            <span>
              WN8 récent :{' '}
              <span className={wn8Color(tomato.recentWn8)}>
                {Math.round(tomato.recentWn8)}
              </span>
            </span>
            {tomato.recentWinRate != null && (
              <span>· {tomato.recentWinRate.toFixed(1)}% WR</span>
            )}
          </div>
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
