import { Link } from 'react-router-dom';
import { Crosshair, Users, Swords, Map, BookOpen, Flag, Link as LinkIcon, Star, ArrowRight, Shield } from 'lucide-react';
import { TANKS } from '@/data/clan-hub/tanks';
import { STRATEGIES } from '@/data/clan-hub/strategies';
import { MAPS } from '@/data/clan-hub/maps';
import { PriorityBadge } from '@/components/clan-hub/PriorityBadge';
import { ModeBadge } from '@/components/clan-hub/ModeBadge';
import { cn } from '@/lib/cn';

const SHORTCUTS = [
  { to: '/clan-hub/chars',      icon: Crosshair, label: 'Fiches chars',  description: 'Équipement, compétences, do/don\'t', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { to: '/clan-hub/roles',      icon: Users,     label: 'Rôles',         description: 'Heavy, medium, light, TD',            color: 'text-blue-300 bg-blue-500/10 border-blue-500/20' },
  { to: '/clan-hub/strategies', icon: Swords,    label: 'Tactiques',     description: 'Focus fire, push, crossfire…',        color: 'text-atfr-gold bg-atfr-gold/10 border-atfr-gold/20' },
  { to: '/clan-hub/maps',       icon: Map,       label: 'Cartes',        description: 'Spawns, strats par carte',             color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { to: '/clan-hub/doctrine',   icon: BookOpen,  label: 'Doctrine',      description: 'Règles et attentes ATFR',              color: 'text-purple-300 bg-purple-500/10 border-purple-500/20' },
  { to: '/clan-hub/cw',         icon: Flag,      label: 'Clan Wars',     description: 'Préparation et checklist',             color: 'text-orange-300 bg-orange-500/10 border-orange-500/20' },
  { to: '/clan-hub/liens',      icon: LinkIcon,  label: 'Ressources',    description: 'Outils externes recommandés',          color: 'text-atfr-fog bg-atfr-graphite/40 border-atfr-gold/10' },
];

const CLASS_CONFIG = {
  HT: { text: 'text-red-400', bg: 'bg-red-500/10' },
  MT: { text: 'text-green-400', bg: 'bg-green-500/10' },
  LT: { text: 'text-yellow-300', bg: 'bg-yellow-400/10' },
  TD: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  SPG: { text: 'text-orange-400', bg: 'bg-orange-500/10' },
};

const priorityTanks = TANKS.filter((t) => t.clan_priority === 'prioritaire');

const stats = [
  { label: 'Chars référencés', value: TANKS.length },
  { label: 'Tactiques disponibles', value: STRATEGIES.length },
  { label: 'Cartes analysées', value: MAPS.length },
  { label: 'Chars prioritaires', value: priorityTanks.length },
];

export default function ClanHubHome() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-atfr-gold/15 bg-gradient-to-br from-atfr-graphite/60 via-atfr-graphite/30 to-atfr-ink/80 p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-atfr-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-atfr-gold/70" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60">Centre Tactique</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-atfr-bone mb-2">
            ATFR Clan Hub
          </h1>
          <p className="text-sm text-atfr-fog max-w-xl mb-6">
            Toutes les ressources tactiques du clan en un seul endroit. Équipement, stratégies, doctrine — réservé aux membres ATFR.
          </p>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-atfr-ink/40 border border-atfr-gold/10 px-3 py-2.5 text-center">
                <p className="font-display text-2xl text-atfr-gold">{value}</p>
                <p className="text-[11px] text-atfr-fog/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-3">Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SHORTCUTS.map(({ to, icon: Icon, label, description, color }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-4 hover:border-atfr-gold/25 hover:bg-atfr-graphite/40 transition-all"
            >
              <div className={cn('h-8 w-8 rounded-lg border flex items-center justify-center mb-3', color)}>
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-atfr-bone group-hover:text-atfr-gold transition-colors">{label}</p>
              <p className="text-xs text-atfr-fog/50 mt-0.5">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chars prioritaires */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40">
            <Star size={11} className="text-atfr-gold/60" />
            Chars prioritaires CW
          </h2>
          <Link to="/clan-hub/chars" className="flex items-center gap-1 text-xs text-atfr-gold/60 hover:text-atfr-gold transition-colors">
            Voir tous <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {priorityTanks.map((tank) => {
            const cfg = CLASS_CONFIG[tank.class] ?? CLASS_CONFIG.HT;
            return (
              <Link
                key={tank.slug}
                to="/clan-hub/chars"
                className="flex items-center gap-2.5 rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 px-3 py-2.5 hover:border-atfr-gold/25 hover:bg-atfr-graphite/40 transition-all"
              >
                <div className={cn('h-7 w-7 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold font-mono', cfg.bg, cfg.text)}>
                  {tank.class}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-atfr-bone leading-tight truncate">{tank.name}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {tank.modes.slice(0, 2).map((m) => <ModeBadge key={m} mode={m} />)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dernières strats + cartes */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Strats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40">
              <Swords size={11} className="text-atfr-gold/60" />
              Tactiques
            </h2>
            <Link to="/clan-hub/strategies" className="flex items-center gap-1 text-xs text-atfr-gold/60 hover:text-atfr-gold transition-colors">
              Voir toutes <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {STRATEGIES.slice(0, 5).map((s) => (
              <div key={s.slug} className="flex items-start gap-2 rounded-lg border border-atfr-gold/10 bg-atfr-graphite/20 px-3 py-2.5">
                <Swords size={12} className="text-atfr-gold/40 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-atfr-bone">{s.title}</p>
                  <p className="text-xs text-atfr-fog/50 mt-0.5 line-clamp-1">{s.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cartes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40">
              <Map size={11} className="text-atfr-gold/60" />
              Fiches cartes
            </h2>
            <Link to="/clan-hub/maps" className="flex items-center gap-1 text-xs text-atfr-gold/60 hover:text-atfr-gold transition-colors">
              Voir toutes <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {MAPS.map((m) => (
              <div key={m.slug} className="rounded-lg border border-atfr-gold/10 bg-atfr-graphite/20 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-atfr-bone">{m.name}</p>
                  <PriorityBadge priority={m.priority} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.modes.map((mode) => <ModeBadge key={mode} mode={mode} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
