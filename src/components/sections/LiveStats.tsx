import { Activity, Crosshair, Trophy, Users } from 'lucide-react';
import { Section, StatCard } from '@/components/ui';
import { useClanStats } from '@/features/stats/queries';

export function LiveStats() {
  const { data, isLoading } = useClanStats();

  const format = (n: number | null | undefined, digits = 0, suffix = '') =>
    n == null ? '—' : `${n.toFixed(digits)}${suffix}`;

  return (
    <Section
      eyebrow="Le clan en temps réel"
      title="Stats live"
      description="Données récupérées depuis l'API World of Tanks et tomato.gg. Les moyennes sont calculées sur les membres actifs."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membres"
          value={data?.membersCount ?? '—'}
          loading={isLoading}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Winrate moyen"
          value={format(data?.avgWinRate ?? null, 2, '%')}
          loading={isLoading}
          icon={<Trophy size={20} />}
        />
        <StatCard
          label="WN8 moyen"
          value={format(data?.avgWn8 ?? null, 0)}
          loading={isLoading}
          icon={<Crosshair size={20} />}
          hint="Échantillon top 20 membres"
        />
        <StatCard
          label="Personal rating"
          value={format(data?.avgGlobalRating ?? null, 0)}
          loading={isLoading}
          icon={<Activity size={20} />}
        />
      </div>
    </Section>
  );
}
