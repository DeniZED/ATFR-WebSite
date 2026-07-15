import { Suspense, lazy, useMemo } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  Camera,
  FileText,
  ShieldAlert,
  Swords,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/ui';
import { useApplications } from '@/features/applications/queries';
import { useEvents } from '@/features/events/queries';
import { useClanInfo } from '@/features/clan/queries';
import { useClanStats } from '@/features/stats/queries';
import { useGeoShots } from '@/features/geoguesser/queries';
import { useCwEvents } from '@/features/cw/queries';
import { makeRollingPeriod } from '@/features/rh/activity';
import { useHrPlayers } from '@/features/rh/queries';
import { useRole } from '@/hooks/useRole';
import { HrTopPerformers } from '@/components/admin/HrTopPerformers';
import { AdminTasks, type AdminTask } from '@/components/admin/AdminTasks';
import { useClanMovements } from '@/features/clanMovements/queries';

// Graphiques recharts chargés en lazy (P2-5) : le chunk recharts
// (~115 kB gzip) ne bloque pas le premier rendu du dashboard admin.
const HrTrendChart = lazy(() =>
  import('@/components/admin/HrTrendChart').then((m) => ({ default: m.HrTrendChart })),
);
const HrStatusBreakdown = lazy(() =>
  import('@/components/admin/HrStatusBreakdown').then((m) => ({ default: m.HrStatusBreakdown })),
);

export default function AdminHome() {
  const pending = useApplications('pending');
  const events = useEvents({ includePrivate: true });
  const clan = useClanInfo();
  const stats = useClanStats();
  const { can, canAccess } = useRole();
  const canReadRh = can('members');
  const canGeo = canAccess('geoguesser');
  const canCw = canAccess('clan-wars');
  const canApplications = canAccess('candidatures');
  const hrPeriod = useMemo(() => makeRollingPeriod(30), []);
  const hr = useHrPlayers(hrPeriod, { enabled: canReadRh });
  const movements = useClanMovements({ limit: 500, enabled: canReadRh });
  const geoShots = useGeoShots({ enabled: canGeo });
  const cwEvents = useCwEvents({ enabled: canCw });
  const hrAlerts =
    hr.data?.players.reduce((sum, player) => sum + player.alerts.length, 0) ?? 0;

  const now = Date.now();
  const tasks: AdminTask[] = [];
  if (canApplications) {
    tasks.push({
      key: 'applications',
      count: pending.data?.length ?? 0,
      singular: 'candidature en attente',
      plural: 'candidatures en attente',
      to: '/admin/candidatures',
      icon: <FileText size={16} />,
    });
  }
  if (canReadRh) {
    tasks.push({
      key: 'movements',
      count: movements.data?.filter((m) => m.contact_status === 'new').length ?? 0,
      singular: 'mouvement de clan à trier',
      plural: 'mouvements de clan à trier',
      to: '/admin/rh',
      icon: <ArrowLeftRight size={16} />,
    });
    tasks.push({
      key: 'hr-alerts',
      count: hr.isError ? 0 : hrAlerts,
      singular: 'alerte RH',
      plural: 'alertes RH',
      to: '/admin/rh',
      icon: <ShieldAlert size={16} />,
    });
  }
  if (canGeo) {
    tasks.push({
      key: 'unpublished-shots',
      count: geoShots.data?.filter((s) => !s.is_published).length ?? 0,
      singular: 'screenshot GeoGuesseur non publié',
      plural: 'screenshots GeoGuesseur non publiés',
      to: '/admin/geoguesser/shots',
      icon: <Camera size={16} />,
    });
  }
  if (canCw) {
    tasks.push({
      key: 'cw-to-close',
      count:
        cwEvents.data?.filter(
          (e) => e.status === 'open' && new Date(e.ends_at).getTime() < now,
        ).length ?? 0,
      singular: 'campagne CW terminée à clôturer',
      plural: 'campagnes CW terminées à clôturer',
      to: '/admin/clan-wars',
      icon: <Swords size={16} />,
    });
  }

  const tasksLoading =
    (canApplications && pending.isLoading) ||
    (canReadRh && (movements.isLoading || hr.isLoading)) ||
    (canGeo && geoShots.isLoading) ||
    (canCw && cwEvents.isLoading);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Dashboard
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Vue d'ensemble</h1>
      </div>

      {tasks.length > 0 && <AdminTasks tasks={tasks} loading={tasksLoading} />}

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

      {canReadRh && !hr.isError && hr.data && (
        <>
          <Suspense fallback={null}>
            <HrTrendChart
              players={hr.data.players}
              period={hr.data.period}
              movements={movements.data}
            />
            <HrStatusBreakdown players={hr.data.players} />
          </Suspense>
          <HrTopPerformers players={hr.data.players} />
        </>
      )}
    </div>
  );
}
