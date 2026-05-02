import { useMemo } from 'react';
import {
  Calendar,
  FileText,
  ShieldAlert,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useApplications } from '@/features/applications/queries';
import { useEvents } from '@/features/events/queries';
import { useClanInfo } from '@/features/clan/queries';
import { useClanStats } from '@/features/stats/queries';
import { makeRollingPeriod } from '@/features/rh/activity';
import { useHrPlayers } from '@/features/rh/queries';
import { useRole } from '@/hooks/useRole';

export default function AdminHome() {
  const pending = useApplications('pending');
  const events = useEvents({ includePrivate: true });
  const clan = useClanInfo();
  const stats = useClanStats();
  const { can } = useRole();
  const canReadRh = can('members');
  const hrPeriod = useMemo(() => makeRollingPeriod(30), []);
  const hr = useHrPlayers(hrPeriod, { enabled: canReadRh });
  const hrAlerts =
    hr.data?.players.reduce((sum, player) => sum + player.alerts.length, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Dashboard
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Vue d'ensemble</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Candidatures en attente"
          value={pending.data?.length ?? 0}
          loading={pending.isLoading}
          icon={<FileText size={20} />}
        />
        <StatCard
          label="Événements à venir"
          value={events.data?.length ?? 0}
          loading={events.isLoading}
          icon={<Calendar size={20} />}
        />
        <StatCard
          label="Membres"
          value={clan.data?.members_count ?? 0}
          loading={clan.isLoading}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Joueurs RH"
          value={!canReadRh || hr.isError ? '—' : (hr.data?.players.length ?? 0)}
          loading={canReadRh && hr.isLoading}
          icon={<UserCog size={20} />}
        />
        <StatCard
          label="Alertes RH"
          value={!canReadRh || hr.isError ? '—' : hrAlerts}
          loading={canReadRh && hr.isLoading}
          icon={<ShieldAlert size={20} />}
        />
        <StatCard
          label="WN8 moyen"
          value={stats.data?.avgWn8 ? Math.round(stats.data.avgWn8) : '—'}
          loading={stats.isLoading}
          icon={<Trophy size={20} />}
        />
      </div>
    </div>
  );
}
