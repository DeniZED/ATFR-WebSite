import { Link } from 'react-router-dom';
import { Crosshair, Users, Swords, Map, BookOpen, Flag, Link as LinkIcon, Star, ArrowRight } from 'lucide-react';
import { TANKS } from '@/data/clan-hub/tanks';
import { STRATEGIES } from '@/data/clan-hub/strategies';
import { MAPS } from '@/data/clan-hub/maps';
import { PriorityBadge } from '@/components/clan-hub/PriorityBadge';
import { cn } from '@/lib/cn';

const SHORTCUTS = [
  { to: '/clan-hub/chars',      icon: Crosshair, label: 'Fiches chars',  description: 'Équipement, compétences, do/don\'t list' },
  { to: '/clan-hub/roles',      icon: Users,    label: 'Rôles',         description: 'Heavy, medium, light, TD' },
  { to: '/clan-hub/strategies', icon: Swords,   label: 'Tactiques',     description: 'Focus fire, push, crossfire…' },
  { to: '/clan-hub/maps',       icon: Map,      label: 'Cartes',        description: 'Plans par spawn et mode de jeu' },
  { to: '/clan-hub/doctrine',   icon: BookOpen, label: 'Doctrine',      description: 'Règles et attentes ATFR' },
  { to: '/clan-hub/cw',         icon: Flag,     label: 'Clan Wars',     description: 'Sessions à venir, préparation' },
  { to: '/clan-hub/liens',      icon: LinkIcon, label: 'Ressources',    description: 'Outils externes recommandés' },
];

const priorityTanks = TANKS.filter((t) => t.clan_priority === 'prioritaire');

export default function ClanHubHome() {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Centre tactique</p>
        <h1 className="font-display text-3xl sm:text-4xl text-atfr-bone">ATFR Clan Hub</h1>
        <p className="mt-2 text-atfr-fog text-sm max-w-xl">
          Toutes les ressources tactiques du clan en un seul endroit. Équipement, stratégies, doctrine — réservé aux membres.
        </p>
      </div>

      {/* Raccourcis */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/50 mb-3">Sections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SHORTCUTS.map(({ to, icon: Icon, label, description }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-atfr-gold/10 bg-atfr-graphite/30 p-4 hover:border-atfr-gold/30 hover:bg-atfr-graphite/50 transition-colors"
            >
              <Icon size={20} strokeWidth={1.5} className="text-atfr-gold/70 mb-2 group-hover:text-atfr-gold transition-colors" />
              <p className="text-sm font-medium text-atfr-bone">{label}</p>
              <p className="text-xs text-atfr-fog/60 mt-0.5">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Chars prioritaires */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/50">
            <Star size={12} className="inline mr-1 text-atfr-gold/60" />
            Chars prioritaires
          </h2>
          <Link to="/clan-hub/chars" className="text-xs text-atfr-gold/70 hover:text-atfr-gold flex items-center gap-1">
            Voir tous <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {priorityTanks.map((tank) => (
            <Link
              key={tank.slug}
              to={`/clan-hub/chars#${tank.slug}`}
              className="flex items-center gap-2 rounded-lg border border-atfr-gold/15 bg-atfr-graphite/30 px-3 py-2 hover:border-atfr-gold/30 transition-colors"
            >
              <span className="text-xs text-atfr-fog/60 font-mono">{tank.class}</span>
              <span className="text-sm text-atfr-bone">{tank.name}</span>
              <PriorityBadge priority={tank.clan_priority} />
            </Link>
          ))}
        </div>
      </div>

      {/* Dernières strats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/50">Tactiques récentes</h2>
          <Link to="/clan-hub/strategies" className="text-xs text-atfr-gold/70 hover:text-atfr-gold flex items-center gap-1">
            Voir toutes <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {STRATEGIES.slice(0, 4).map((s) => (
            <div key={s.slug} className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-4">
              <p className="font-medium text-sm text-atfr-bone mb-1">{s.title}</p>
              <p className="text-xs text-atfr-fog/70">{s.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cartes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/50">Cartes disponibles</h2>
          <Link to="/clan-hub/maps" className="text-xs text-atfr-gold/70 hover:text-atfr-gold flex items-center gap-1">
            Voir toutes <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {MAPS.map((m) => (
            <Link
              key={m.slug}
              to={`/clan-hub/maps`}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                m.priority === 'prioritaire'
                  ? 'border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold'
                  : 'border-atfr-gold/10 bg-atfr-graphite/30 text-atfr-fog hover:text-atfr-bone',
              )}
            >
              {m.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
