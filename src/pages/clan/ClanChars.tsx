import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, CircleX, Wrench, Users, AlertTriangle, MessageSquare, Crosshair } from 'lucide-react';
import { TANKS } from '@/data/clan/tanks';
import { FilterBar } from '@/components/clan/FilterBar';
import { SearchInput } from '@/components/clan/SearchInput';
import { PriorityBadge } from '@/components/clan/PriorityBadge';
import { ModeBadge } from '@/components/clan/ModeBadge';
import { TagList } from '@/components/clan/TagList';
import { ValidatedBy } from '@/components/clan/ValidatedBy';
import { EmptyState } from '@/components/clan/EmptyState';
import { cn } from '@/lib/cn';
import type { TankEntry } from '@/features/clan/types';

const PRIORITY_FILTERS = [
  { id: 'all', label: 'Toutes priorités' },
  { id: 'prioritaire', label: 'Prioritaire' },
  { id: 'utile', label: 'Utile' },
  { id: 'situationnel', label: 'Situationnel' },
] as const;

const CLASS_CONFIG = {
  HT: { label: 'Lourd',    color: 'border-l-red-500',    bg: 'bg-red-500/10',    text: 'text-red-400',    ring: 'ring-red-500/30' },
  MT: { label: 'Moyen',    color: 'border-l-green-500',  bg: 'bg-green-500/10',  text: 'text-green-400',  ring: 'ring-green-500/30' },
  LT: { label: 'Léger',    color: 'border-l-yellow-400', bg: 'bg-yellow-400/10', text: 'text-yellow-300', ring: 'ring-yellow-400/30' },
  TD: { label: 'Chasseur', color: 'border-l-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', ring: 'ring-purple-500/30' },
  SPG: { label: 'SPG',     color: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/30' },
};

const NATION_FLAG: Record<string, string> = {
  urss:      '🇷🇺',
  france:    '🇫🇷',
  gb:        '🇬🇧',
  allemagne: '🇩🇪',
  usa:       '🇺🇸',
  pologne:   '🇵🇱',
  suede:     '🇸🇪',
  tcheque:   '🇨🇿',
  chine:     '🇨🇳',
  japon:     '🇯🇵',
  italie:    '🇮🇹',
};

function ClassBadge({ cls }: { cls: keyof typeof CLASS_CONFIG }) {
  const cfg = CLASS_CONFIG[cls];
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold font-mono', cfg.bg, cfg.text)}>
      {cls}
    </span>
  );
}

function TankCard({ tank }: { tank: TankEntry }) {
  const [open, setOpen] = useState(false);
  const cls = CLASS_CONFIG[tank.class];

  return (
    <div id={tank.slug} className={cn(
      'rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 overflow-hidden border-l-4 transition-shadow',
      cls.color,
      open && 'shadow-lg shadow-black/30',
    )}>
      {/* Header — toujours visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-atfr-graphite/30 transition-colors"
      >
        {/* Image ou placeholder */}
        {tank.image_url ? (
          <img
            src={tank.image_url}
            alt={tank.name}
            className="h-12 w-20 object-contain object-center shrink-0"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className={cn('h-12 w-12 shrink-0 rounded-lg flex items-center justify-center text-lg', cls.bg)}>
            <span className={cls.text}><Crosshair size={20} strokeWidth={1.4} /></span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm">{NATION_FLAG[tank.nation] ?? '🏳️'}</span>
            <span className="font-display text-lg text-atfr-bone leading-tight">{tank.name}</span>
            <ClassBadge cls={tank.class} />
            <span className="text-xs font-mono text-atfr-fog/40">Tier X</span>
            <PriorityBadge priority={tank.clan_priority} />
          </div>
          <p className="text-xs text-atfr-fog/60 truncate">{tank.role_in_battle}</p>
        </div>

        <div className="shrink-0 text-atfr-fog/30">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Contenu expansé */}
      {open && (
        <div className="border-t border-atfr-gold/10 px-4 pb-6 pt-4 space-y-5">

          {/* Résumé */}
          <p className="text-sm text-atfr-fog leading-relaxed">{tank.summary}</p>
          <p className="text-xs text-atfr-fog/50 italic">{tank.gameplay_type}</p>

          {/* Modes */}
          <div className="flex flex-wrap gap-1.5">
            {tank.modes.map((m) => <ModeBadge key={m} mode={m} />)}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Équipement */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-3">
                <Wrench size={11} /> Équipement recommandé
              </p>
              <ul className="space-y-2">
                {tank.equipments.map((eq, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={cn(
                      'shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                      cls.bg, cls.text,
                    )}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm text-atfr-bone">{eq.name}</span>
                      {eq.reason && <p className="text-xs text-atfr-fog/50 mt-0.5">{eq.reason}</p>}
                    </div>
                  </li>
                ))}
              </ul>

              {tank.alt_equipments && (
                <div className="mt-3 pt-3 border-t border-atfr-gold/10">
                  <p className="text-xs text-atfr-fog/40 mb-2">Alternative</p>
                  {tank.alt_equipments.map((eq, i) => (
                    <div key={i} className="text-xs text-atfr-fog/60">{i + 1}. {eq.name}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Compétences équipage */}
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-3">
                <Users size={11} /> Compétences équipage
              </p>
              <div className="space-y-1.5">
                {tank.crew_skills.map((sk) => (
                  <div key={sk.name} className="flex items-center gap-2">
                    <span className="shrink-0 h-4 w-4 rounded-sm bg-atfr-graphite/60 border border-atfr-gold/15 text-[10px] text-atfr-gold/60 flex items-center justify-center font-mono">
                      {sk.priority}
                    </span>
                    <span className="text-xs text-atfr-bone">{sk.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Do / Don't */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-500/5 border border-green-500/15 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-green-400/70 mb-2">
                <CircleCheck size={11} /> À faire
              </p>
              <ul className="space-y-1.5">
                {tank.do_list.map((d, i) => (
                  <li key={i} className="text-xs text-atfr-fog flex items-start gap-1.5">
                    <CircleCheck size={10} className="text-green-500/50 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3">
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-2">
                <CircleX size={11} /> À éviter
              </p>
              <ul className="space-y-1.5">
                {tank.dont_list.map((d, i) => (
                  <li key={i} className="text-xs text-atfr-fog flex items-start gap-1.5">
                    <CircleX size={10} className="text-red-500/40 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consommables + munitions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">
                <MessageSquare size={10} className="inline mr-1" />Consommables
              </p>
              <div className="space-y-1">
                {tank.consumables.map((c, i) => (
                  <div key={i} className="text-xs text-atfr-fog flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-atfr-gold/40 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
            {tank.ammo_setup && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">
                  <AlertTriangle size={10} className="inline mr-1" />Munitions
                </p>
                <p className="text-xs text-atfr-fog">{tank.ammo_setup}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-atfr-gold/10">
            <TagList tags={tank.tags} />
            <ValidatedBy by={tank.validated_by} at={tank.updated_at} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClanChars() {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filtered = TANKS.filter((t) => {
    if (classFilter !== 'all' && t.class !== classFilter) return false;
    if (priorityFilter !== 'all' && t.clan_priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q));
    }
    return true;
  });

  const counts = { HT: 0, MT: 0, LT: 0, TD: 0 };
  TANKS.forEach((t) => { if (t.class in counts) counts[t.class as keyof typeof counts]++; });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Fiches chars</h1>
        <p className="mt-1 text-sm text-atfr-fog">Équipement, compétences, munitions et conseils par char.</p>

        {/* Compteurs par classe */}
        <div className="flex gap-3 mt-3">
          {(Object.entries(counts) as [keyof typeof counts, number][]).map(([cls, count]) => {
            const cfg = CLASS_CONFIG[cls];
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setClassFilter(classFilter === cls ? 'all' : cls)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border',
                  classFilter === cls
                    ? cn(cfg.bg, cfg.text, 'border-current/30 ring-1', cfg.ring)
                    : 'border-atfr-gold/10 text-atfr-fog hover:text-atfr-bone bg-atfr-graphite/20',
                )}
              >
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  classFilter === cls ? cfg.text : 'bg-atfr-fog/40',
                )} style={{ backgroundColor: 'currentColor' }} />
                {cls}
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un char…" className="sm:flex-1" />
        <FilterBar options={PRIORITY_FILTERS} active={priorityFilter} onChange={setPriorityFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Aucun char ne correspond à cette recherche." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tank) => <TankCard key={tank.slug} tank={tank} />)}
        </div>
      )}
    </div>
  );
}
