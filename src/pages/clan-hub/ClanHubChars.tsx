import { useState } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, CircleX } from 'lucide-react';
import { TANKS } from '@/data/clan-hub/tanks';
import { FilterBar } from '@/components/clan-hub/FilterBar';
import { SearchInput } from '@/components/clan-hub/SearchInput';
import { PriorityBadge } from '@/components/clan-hub/PriorityBadge';
import { ModeBadge } from '@/components/clan-hub/ModeBadge';
import { TagList } from '@/components/clan-hub/TagList';
import { ValidatedBy } from '@/components/clan-hub/ValidatedBy';
import { EmptyState } from '@/components/clan-hub/EmptyState';

const CLASS_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'HT', label: 'HT' },
  { id: 'MT', label: 'MT' },
  { id: 'LT', label: 'LT' },
  { id: 'TD', label: 'TD' },
] as const;

const PRIORITY_FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'prioritaire', label: 'Prioritaire' },
  { id: 'utile', label: 'Utile' },
  { id: 'situationnel', label: 'Situationnel' },
] as const;

function TankCard({ tank }: { tank: (typeof TANKS)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div id={tank.slug} className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-atfr-graphite/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-atfr-fog/60 border border-atfr-fog/20 rounded px-1.5 py-0.5">{tank.class}</span>
            <span className="font-display text-lg text-atfr-bone">{tank.name}</span>
            <PriorityBadge priority={tank.clan_priority} />
          </div>
          <p className="text-xs text-atfr-fog/70">{tank.role_in_battle}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-atfr-fog/40 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-atfr-fog/40 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="border-t border-atfr-gold/10 px-4 pb-5 pt-4 space-y-5">
          {/* Summary */}
          <p className="text-sm text-atfr-fog">{tank.summary}</p>

          {/* Modes */}
          <div className="flex flex-wrap gap-1.5">
            {tank.modes.map((m) => <ModeBadge key={m} mode={m} />)}
          </div>

          {/* Équipement */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Équipement recommandé</p>
            <ul className="space-y-1.5">
              {tank.equipments.map((eq) => (
                <li key={eq.name} className="flex items-start gap-2">
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-atfr-gold/20 flex items-center justify-center text-atfr-gold text-[10px] font-bold">
                    {tank.equipments.indexOf(eq) + 1}
                  </span>
                  <div>
                    <span className="text-sm text-atfr-bone">{eq.name}</span>
                    {eq.reason && <span className="text-xs text-atfr-fog/60"> — {eq.reason}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Compétences */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Compétences équipage</p>
            <div className="flex flex-wrap gap-2">
              {tank.crew_skills.map((sk) => (
                <span key={sk.name} className="flex items-center gap-1 rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 px-2 py-1 text-xs text-atfr-bone">
                  <span className="text-atfr-fog/40 font-mono text-[10px]">{sk.priority}.</span>
                  {sk.name}
                </span>
              ))}
            </div>
          </div>

          {/* Do / Don't */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400/60 mb-2 flex items-center gap-1">
                <CircleCheck size={12} /> Do
              </p>
              <ul className="space-y-1">
                {tank.do_list.map((d) => (
                  <li key={d} className="text-xs text-atfr-fog flex items-start gap-1.5">
                    <CircleCheck size={11} className="text-green-500/60 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400/60 mb-2 flex items-center gap-1">
                <CircleX size={12} /> Don't
              </p>
              <ul className="space-y-1">
                {tank.dont_list.map((d) => (
                  <li key={d} className="text-xs text-atfr-fog flex items-start gap-1.5">
                    <CircleX size={11} className="text-red-500/50 shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consommables + munitions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Consommables</p>
              <div className="flex flex-col gap-1">
                {tank.consumables.map((c) => (
                  <span key={c} className="text-xs text-atfr-fog">{c}</span>
                ))}
              </div>
            </div>
            {tank.ammo_setup && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Munitions</p>
                <p className="text-xs text-atfr-fog">{tank.ammo_setup}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <TagList tags={tank.tags} />
            <ValidatedBy by={tank.validated_by} at={tank.updated_at} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClanHubChars() {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Fiches chars</h1>
        <p className="mt-1 text-sm text-atfr-fog">Équipement, compétences, munitions et conseils par char.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un char…" className="sm:w-56" />
        <FilterBar options={CLASS_FILTERS} active={classFilter} onChange={setClassFilter} />
      </div>
      <FilterBar options={PRIORITY_FILTERS} active={priorityFilter} onChange={setPriorityFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Aucun char ne correspond à cette recherche." />
      ) : (
        <div className="space-y-3">
          {filtered.map((tank) => <TankCard key={tank.slug} tank={tank} />)}
        </div>
      )}
    </div>
  );
}
