import { Activity, Crosshair, Trophy, Users } from 'lucide-react';
import { Section, StatCard } from '@/components/ui';
import { useClanStats } from '@/features/stats/queries';

export function LiveStats() {
  const { data, isLoading } = useClanStats();

  return (
    <Section
      eyebrow="Le clan en temps réel"
      title="Stats live"
      description="Données récupérées depuis l'API World of Tanks et tomato.gg. Les moyennes sont calculées sur les membres actifs."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membres"
          value="—"
          animateTo={data?.membersCount ?? null}
          loading={isLoading}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Winrate moyen"
          value="—"
          animateTo={data?.avgWinRate ?? null}
          decimals={2}
          suffix="%"
          loading={isLoading}
          icon={<Trophy size={20} />}
        />
        <StatCard
          label="WN8 moyen"
          value="—"
          animateTo={data?.avgWn8 ?? null}
          loading={isLoading}
          icon={<Crosshair size={20} />}
          hint="Échantillon top 20 membres"
        />
        <StatCard
          label="Personal rating"
          value="—"
          animateTo={data?.avgGlobalRating ?? null}
          loading={isLoading}
          icon={<Activity size={20} />}
        />
      </div>
    </Section>
  );
}
