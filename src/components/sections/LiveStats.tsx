import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Crosshair,
  Eye,
  Flame,
  Radio,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Alert, StatCard } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useClanStats } from '@/features/stats/queries';

type Scope = 'overview' | 'combat' | 'activity';

const SCOPES: Array<{ id: Scope; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: "Vue d'ensemble", icon: <Users size={14} /> },
  { id: 'combat', label: 'Combat', icon: <Crosshair size={14} /> },
  { id: 'activity', label: 'Activité', icon: <Activity size={14} /> },
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
  const { data, isLoading, isError } = useClanStats();
  const [scope, setScope] = useState<Scope>('overview');

  const sampled = data?.sampledMembers ?? 0;
  const engagementPct =
    sampled > 0 && data ? (data.active7d / sampled) * 100 : null;
  const sampleHint =
    sampled > 0 && data && sampled < data.membersCount
      ? `sur ${sampled}/${data.membersCount} joueurs`
      : undefined;

  const cards: Record<Scope, CardSpec[]> = {
    overview: [
      { label: 'Membres', animateTo: data?.membersCount ?? null, icon: <Users size={20} /> },
      { label: 'En jeu', animateTo: data?.onlineNow ?? null, icon: <Wifi size={20} />, hint: 'Bataille jouée depuis ≤ 30 min' },
      { label: 'Actifs 24h', animateTo: data?.active24h ?? null, icon: <Radio size={20} /> },
      { label: 'Actifs 7 jours', animateTo: data?.active7d ?? null, icon: <Flame size={20} /> },
    ],
    combat: [
      { label: 'Winrate moyen', animateTo: data?.avgWinRate ?? null, decimals: 2, suffix: '%', icon: <Trophy size={20} />, hint: sampleHint },
      { label: 'WN8 moyen', animateTo: data?.avgWn8 ?? null, icon: <Crosshair size={20} />, hint: sampleHint ?? 'sur random battles' },
      { label: 'Dégâts / bataille', animateTo: data?.avgDamagePerBattle ?? null, icon: <Zap size={20} />, hint: sampleHint },
      { label: 'Meilleur WN8', animateTo: data?.maxWn8 ?? null, icon: <Sparkles size={20} />, hint: data?.maxWn8Nickname ?? undefined },
    ],
    activity: [
      { label: 'Frags / bataille', animateTo: data?.avgFragsPerBattle ?? null, decimals: 2, icon: <Target size={20} />, hint: sampleHint },
      { label: 'Spots / bataille', animateTo: data?.avgSpotsPerBattle ?? null, decimals: 2, icon: <Eye size={20} />, hint: sampleHint },
      { label: 'Batailles cumulées', animateTo: data?.totalBattles ?? null, icon: <Swords size={20} />, hint: sampleHint },
      { label: 'Engagement 7j', animateTo: engagementPct, decimals: 0, suffix: '%', hint: sampleHint, icon: <Activity size={20} /> },
    ],
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* HUD background */}
      <div className="absolute inset-0 bg-atfr-carbon/40" aria-hidden />
      <div className="absolute inset-0 bg-grid bg-[size:38px_38px] opacity-10" aria-hidden />
      {/* Top/bottom scan lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/30 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/20 to-transparent" aria-hidden />
      {/* Corner marks */}
      {[
        'top-4 left-4 border-t border-l',
        'top-4 right-4 border-t border-r',
        'bottom-4 left-4 border-b border-l',
        'bottom-4 right-4 border-b border-r',
      ].map((cls, i) => (
        <div key={i} className={`absolute h-6 w-6 border-atfr-gold/25 ${cls}`} aria-hidden />
      ))}

      <div className="container relative z-10">
        {/* Section header — war-room style */}
        <motion.div
          className="mb-10 sm:mb-14 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-atfr-gold/50" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-atfr-gold/80">
              Le clan en temps réel
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-atfr-gold/50" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-atfr-bone">
            Stats live
          </h2>
          <p className="mt-4 text-atfr-fog text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Données agrégées depuis l'API Wargaming. WN8, winrate et dégâts moyens calculés sur les random battles.
          </p>
        </motion.div>

        {isError && (
          <div className="mb-6">
            <Alert tone="danger">Les statistiques sont temporairement indisponibles. Réessaie dans quelques instants.</Alert>
          </div>
        )}

        {/* Scope switcher — tactical tabs */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex gap-0 rounded-xl border border-atfr-gold/20 bg-atfr-ink/60 p-1 backdrop-blur">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                aria-pressed={scope === s.id}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-all duration-200 min-h-[40px]',
                  scope === s.id
                    ? 'bg-atfr-gold text-atfr-ink font-semibold shadow-[0_0_20px_-4px_rgba(232,176,67,0.6)]'
                    : 'text-atfr-fog hover:text-atfr-bone',
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <motion.div
          key={scope}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
