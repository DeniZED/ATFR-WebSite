import { useState } from 'react';
import {
  Activity,
  Crosshair,
  Flame,
  Radio,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Section, StatCard } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useClanStats } from '@/features/stats/queries';

type Scope = 'overview' | 'combat' | 'activity';

const SCOPES: Array<{ id: Scope; label: string }> = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'combat', label: 'Combat' },
  { id: 'activity', label: 'Activité' },
];

interface CardSpec {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  animateTo: number | null;
  decimals?: number;
  suffix?: string;
}

export function LiveStats() {
  const { data, isLoading } = useClanStats();
  const [scope, setScope] = useState<Scope>('overview');

  const engagementPct =
    data && data.membersCount > 0
      ? (data.active7d / Math.min(data.membersCount, 20)) * 100
      : null;

  const cards: Record<Scope, CardSpec[]> = {
    overview: [
      {
        label: 'Membres',
        animateTo: data?.membersCount ?? null,
        icon: <Users size={20} />,
      },
      {
        label: 'Actifs 24h',
        animateTo: data?.active24h ?? null,
        icon: <Radio size={20} />,
        hint: 'Bataille jouée dans les 24h',
      },
      {
        label: 'Actifs 7 jours',
        animateTo: data?.active7d ?? null,
        icon: <Flame size={20} />,
      },
      {
        label: 'Batailles (top 20)',
        animateTo: data?.totalBattles ?? null,
        icon: <Swords size={20} />,
      },
    ],
    combat: [
      {
        label: 'Winrate moyen',
        animateTo: data?.avgWinRate ?? null,
        decimals: 2,
        suffix: '%',
        icon: <Trophy size={20} />,
      },
      {
        label: 'WN8 moyen',
        animateTo: data?.avgWn8 ?? null,
        icon: <Crosshair size={20} />,
        hint: 'Calculé sur le top 20',
      },
      {
        label: 'Dégâts / bataille',
        animateTo: data?.avgDamagePerBattle ?? null,
        icon: <Zap size={20} />,
      },
      {
        label: 'Personal rating',
        animateTo: data?.avgGlobalRating ?? null,
        icon: <Activity size={20} />,
      },
    ],
    activity: [
      {
        label: 'Total membres',
        animateTo: data?.membersCount ?? null,
        icon: <Users size={20} />,
      },
      {
        label: 'Actifs 24h',
        animateTo: data?.active24h ?? null,
        icon: <Radio size={20} />,
      },
      {
        label: 'Actifs 7 jours',
        animateTo: data?.active7d ?? null,
        icon: <Flame size={20} />,
      },
      {
        label: 'Engagement 7j',
        animateTo: engagementPct,
        decimals: 0,
        suffix: '%',
        hint: 'sur échantillon top 20',
        icon: <Activity size={20} />,
      },
    ],
  };

  return (
    <Section
      eyebrow="Le clan en temps réel"
      title="Stats live"
      description="Données agrégées depuis l'API Wargaming. Winrate, WN8 et dégâts moyens sont calculés sur un échantillon des 20 premiers membres."
    >
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScope(s.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors',
              scope === s.id
                ? 'bg-atfr-gold text-atfr-ink border-atfr-gold'
                : 'border-atfr-gold/30 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/60',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards[scope].map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value="—"
            animateTo={c.animateTo}
            decimals={c.decimals}
            suffix={c.suffix}
            icon={c.icon}
            hint={c.hint}
            loading={isLoading}
          />
        ))}
      </div>
    </Section>
  );
}
