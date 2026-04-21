import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, ExternalLink, Trash2, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Select,
  Spinner,
} from '@/components/ui';
import {
  useApplications,
  useDeleteApplication,
  useUpdateApplicationStatus,
} from '@/features/applications/queries';
import { tomatoProfileUrl, wn8Color } from '@/lib/tomato-api';
import type { ApplicationStatus } from '@/types/database';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  archived: 'Archivée',
};

const STATUS_VARIANT: Record<
  ApplicationStatus,
  'warning' | 'success' | 'danger' | 'neutral'
> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  archived: 'neutral',
};

export default function AdminApplications() {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('pending');
  const list = useApplications(filter === 'all' ? undefined : filter);
  const update = useUpdateApplicationStatus();
  const remove = useDeleteApplication();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Recrutement
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Candidatures</h1>
        </div>
        <div className="w-48">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Refusées</option>
            <option value="archived">Archivées</option>
          </Select>
        </div>
      </div>

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Chargement…" />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucune candidature.</p>
      ) : (
        <div className="grid gap-4">
          {list.data.map((app) => (
            <Card key={app.id}>
              <CardBody className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg text-atfr-bone">
                        {app.player_name}
                      </h3>
                      <Badge variant="gold">{app.target_clan}</Badge>
                      <Badge variant={STATUS_VARIANT[app.status]}>
                        {STATUS_LABELS[app.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-atfr-fog">
                      Reçue le{' '}
                      {format(parseISO(app.created_at), 'dd MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>

                  <a
                    href={tomatoProfileUrl(app.player_name)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-atfr-gold hover:text-atfr-gold-light"
                  >
                    tomato.gg <ExternalLink size={14} />
                  </a>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm">
                  <KV label="Discord" value={app.discord_tag} />
                  <KV
                    label="WN8"
                    value={
                      app.wn8 != null ? Math.round(app.wn8).toString() : '—'
                    }
                    valueClass={wn8Color(app.wn8)}
                  />
                  <KV
                    label="Winrate"
                    value={app.win_rate != null ? `${app.win_rate.toFixed(2)}%` : '—'}
                  />
                  <KV
                    label="Batailles"
                    value={
                      app.battles != null
                        ? app.battles.toLocaleString('fr-FR')
                        : '—'
                    }
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-atfr-fog">
                    <span className="font-medium text-atfr-bone">Dispo : </span>
                    {app.availability}
                  </p>
                  <p className="text-atfr-fog whitespace-pre-wrap">
                    <span className="font-medium text-atfr-bone">
                      Motivation :{' '}
                    </span>
                    {app.motivation}
                  </p>
                  {app.previous_clans && (
                    <p className="text-atfr-fog">
                      <span className="font-medium text-atfr-bone">
                        Anciens clans :{' '}
                      </span>
                      {app.previous_clans}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {app.status !== 'accepted' && (
                    <Button
                      size="sm"
                      leadingIcon={<Check size={14} />}
                      onClick={() =>
                        update.mutate({ id: app.id, status: 'accepted' })
                      }
                      disabled={update.isPending}
                    >
                      Accepter
                    </Button>
                  )}
                  {app.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leadingIcon={<X size={14} />}
                      onClick={() =>
                        update.mutate({ id: app.id, status: 'rejected' })
                      }
                      disabled={update.isPending}
                    >
                      Refuser
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update.mutate({ id: app.id, status: 'archived' })
                    }
                    disabled={update.isPending}
                  >
                    Archiver
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leadingIcon={<Trash2 size={14} />}
                    onClick={() => {
                      if (confirm('Supprimer définitivement ?')) {
                        remove.mutate(app.id);
                      }
                    }}
                    disabled={remove.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function KV({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-atfr-gold/10 bg-atfr-ink/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
        {label}
      </p>
      <p className={`text-sm ${valueClass ?? 'text-atfr-bone'}`}>{value}</p>
    </div>
  );
}
