import { useMemo, useState, type ReactNode } from 'react';
import {
  Calendar,
  Castle,
  Clock,
  Gamepad2,
  Star,
  Swords,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useContent } from '@/hooks/useContent';
import { useClanActivities } from '@/features/activities/queries';
import { useAchievements } from '@/features/content/queries';

interface TabDef {
  id: string;
  label: string;
  Icon: LucideIcon;
  sub: string;
}

const TABS: TabDef[] = [
  { id: 'regulieres', label: 'Régulières', Icon: Clock, sub: 'Nos activités hebdomadaires et rendez-vous incontournables' },
  { id: 'clan-wars', label: 'Clan Wars', Icon: Swords, sub: 'Nos performances lors des campagnes mondiales et événements majeurs' },
  { id: 'bastion', label: 'Bastion', Icon: Castle, sub: 'Activités quotidiennes en équipe pour progresser et farmer' },
  { id: 'entrainements', label: 'Entraînements', Icon: Target, sub: 'Ressources et sessions pour améliorer vos compétences' },
  { id: 'fun', label: 'Fun', Icon: Gamepad2, sub: 'Moments de détente et activités récréatives entre membres' },
];

interface Card {
  key: string;
  title: string;
  badge: string | null;
  description: string | null;
  image: string | null;
  footer: ReactNode;
}

function formatEarnedOn(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function Activities() {
  const { get } = useContent();
  const activities = useClanActivities({ visibleOnly: true });
  const achievements = useAchievements({ visibleOnly: true });
  const [active, setActive] = useState('regulieres');

  const cardsByTab = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const t of TABS) map[t.id] = [];

    for (const a of activities.data ?? []) {
      if (!map[a.category]) continue;
      map[a.category].push({
        key: a.id,
        title: a.title,
        badge: a.badge,
        description: a.description,
        image: a.image_url,
        footer: <ScheduleFooter time={a.schedule_time} frequency={a.schedule_frequency} />,
      });
    }

    for (const a of achievements.data ?? []) {
      const hasStats = a.cw_position != null || a.cw_battles != null || a.cw_tanks != null;
      map['clan-wars'].push({
        key: a.id,
        title: a.title,
        badge: a.competition ?? formatEarnedOn(a.earned_on),
        description: a.description ?? a.rank,
        image: a.image_url,
        footer: hasStats ? (
          <StatsFooter position={a.cw_position} battles={a.cw_battles} tanks={a.cw_tanks} />
        ) : null,
      });
    }

    return map;
  }, [activities.data, achievements.data]);

  const total = Object.values(cardsByTab).reduce((n, c) => n + c.length, 0);
  if (total === 0) return null;

  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];
  const cards = cardsByTab[active] ?? [];

  return (
    <Section
      eyebrow={get('activities_eyebrow') || 'Le clan en action'}
      title={get('activities_title') || 'Notre Activité'}
      description="Découvrez nos activités régulières et nos plus grands exploits."
    >
      {/* Onglets */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-transparent bg-gradient-to-br from-atfr-gold-light to-atfr-gold text-atfr-ink'
                  : 'border-atfr-gold/25 bg-atfr-graphite/50 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/40',
              )}
            >
              <t.Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-sm text-atfr-fog mb-8">{activeTab.sub}</p>

      {cards.length === 0 ? (
        <p className="text-center text-atfr-fog py-8">Aucune activité pour l'instant.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <ActivityCard key={c.key} card={c} Icon={activeTab.Icon} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ActivityCard({ card, Icon }: { card: Card; Icon: LucideIcon }) {
  return (
    <article className="spotlight-card group flex flex-col overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon/80">
      <div className="relative h-36 overflow-hidden">
        {card.image ? (
          <img
            src={card.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-atfr-gold/10 via-atfr-graphite to-atfr-carbon" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-atfr-carbon via-atfr-carbon/20 to-transparent" />
        <span className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-atfr-gold/50 bg-atfr-ink/60 text-atfr-gold backdrop-blur">
          <Icon size={16} />
        </span>
      </div>
      <div className="relative z-10 -mt-6 flex flex-1 flex-col px-4 pb-4">
        {card.badge && (
          <span className="mb-2 inline-block w-fit rounded border border-atfr-gold/28 bg-atfr-gold/14 px-2 py-0.5 text-[11px] font-medium text-atfr-gold">
            {card.badge}
          </span>
        )}
        <h3 className="font-display text-lg uppercase tracking-tight text-atfr-gold mb-1">
          {card.title}
        </h3>
        {card.description && (
          <p className="flex-1 text-sm text-atfr-fog">{card.description}</p>
        )}
        {card.footer}
      </div>
    </article>
  );
}

function ScheduleFooter({
  time,
  frequency,
}: {
  time: string | null;
  frequency: string | null;
}) {
  if (!time && !frequency) return null;
  return (
    <div className="mt-3 space-y-1.5 border-t border-atfr-gold/12 pt-3 text-sm text-atfr-fog">
      {time && (
        <div className="flex items-center gap-2">
          <Clock size={14} className="shrink-0 text-atfr-gold/80" />
          <span>{time}</span>
        </div>
      )}
      {frequency && (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0 text-atfr-gold/80" />
          <span>{frequency}</span>
        </div>
      )}
    </div>
  );
}

function StatsFooter({
  position,
  battles,
  tanks,
}: {
  position: number | null;
  battles: number | null;
  tanks: number | null;
}) {
  const cells: Array<{ Icon: LucideIcon; value: string; label: string }> = [
    { Icon: Trophy, value: position != null ? String(position) : '—', label: 'Position FR' },
    { Icon: Target, value: battles != null ? `+${battles}` : '—', label: 'Batailles' },
    { Icon: Star, value: tanks != null ? String(tanks) : '—', label: 'Chars gagnés' },
  ];
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-atfr-gold/12 pt-3 text-center">
      {cells.map((c) => (
        <div key={c.label}>
          <c.Icon size={15} className="mx-auto mb-0.5 text-atfr-gold" />
          <div className="font-mono text-lg font-bold tabular-nums text-atfr-bone">{c.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-atfr-fog">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
