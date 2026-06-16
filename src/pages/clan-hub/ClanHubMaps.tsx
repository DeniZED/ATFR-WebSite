import { useState } from 'react';
import { MAPS, MAP_FILTERS } from '@/data/clan-hub/maps';
import type { GameMode } from '@/features/clan-hub/types';
import { FilterBar } from '@/components/clan-hub/FilterBar';
import { PriorityBadge } from '@/components/clan-hub/PriorityBadge';
import { ModeBadge } from '@/components/clan-hub/ModeBadge';
import { TagList } from '@/components/clan-hub/TagList';
import { ValidatedBy } from '@/components/clan-hub/ValidatedBy';
import { EmptyState } from '@/components/clan-hub/EmptyState';
import { AlertTriangle, MessageSquareQuote, Lightbulb } from 'lucide-react';

function SpawnBlock({ label, positions }: { label: string; positions: (typeof MAPS)[0]['spawn_a'] }) {
  return (
    <div className="rounded-lg border border-atfr-gold/10 bg-atfr-graphite/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Spawn {label}</p>
      <div className="space-y-2">
        {positions.map((p) => (
          <div key={p.name}>
            <span className="text-xs font-medium text-atfr-bone">{p.name}</span>
            <span className="text-xs text-atfr-fog/60"> — {p.role}</span>
            {p.notes && <p className="text-xs text-atfr-fog/50 mt-0.5">{p.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MapCard({ map }: { map: (typeof MAPS)[0] }) {
  return (
    <div className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-5 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="font-display text-xl text-atfr-bone">{map.name}</h2>
          <PriorityBadge priority={map.priority} />
          <span className="text-xs border border-atfr-fog/20 text-atfr-fog/60 rounded px-1.5 py-0.5">{map.map_type}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {map.modes.map((m) => <ModeBadge key={m} mode={m} />)}
        </div>
      </div>

      {/* Spawns */}
      <div className="grid sm:grid-cols-2 gap-3">
        <SpawnBlock label="A" positions={map.spawn_a} />
        <SpawnBlock label="B" positions={map.spawn_b} />
      </div>

      {/* Chars recommandés */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/40 mb-2">Chars recommandés</p>
        <div className="flex flex-wrap gap-1.5">
          {map.recommended_tanks.map((t) => (
            <span key={t} className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 px-2 py-0.5 text-xs text-atfr-bone">{t}</span>
          ))}
        </div>
      </div>

      {/* Strats */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-atfr-gold/10 bg-atfr-gold/5 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/50 mb-1 flex items-center gap-1"><Lightbulb size={11} />Strat simple</p>
          <p className="text-xs text-atfr-fog">{map.strat_simple}</p>
        </div>
        <div className="rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/60 mb-1 flex items-center gap-1"><Lightbulb size={11} />Strat avancée</p>
          <p className="text-xs text-atfr-fog">{map.strat_advanced}</p>
        </div>
      </div>

      {/* Erreurs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400/50 mb-2 flex items-center gap-1">
          <AlertTriangle size={11} /> Erreurs courantes
        </p>
        <ul className="space-y-1">
          {map.common_mistakes.map((m, i) => (
            <li key={i} className="text-xs text-atfr-fog flex items-start gap-1.5">
              <AlertTriangle size={10} className="text-red-500/40 shrink-0 mt-0.5" />
              {m}
            </li>
          ))}
        </ul>
      </div>

      {/* Notes caller */}
      <div className="flex items-start gap-2 rounded-lg border border-atfr-gold/15 bg-atfr-gold/5 px-3 py-2">
        <MessageSquareQuote size={14} className="text-atfr-gold/60 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-atfr-gold/40 mb-0.5">Notes caller</p>
          <p className="text-xs text-atfr-bone">{map.caller_notes}</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <TagList tags={map.tags} />
        <ValidatedBy by={map.validated_by} at={map.updated_at} />
      </div>
    </div>
  );
}

export default function ClanHubMaps() {
  const [filter, setFilter] = useState('all');

  const filtered = MAPS.filter((m) => {
    if (filter === 'all') return true;
    return m.modes.includes(filter as GameMode) || m.map_type === filter || m.tags.includes(filter);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Fiches cartes</h1>
        <p className="mt-1 text-sm text-atfr-fog">Spawns, strats simples et avancées, erreurs courantes par carte.</p>
      </div>

      <FilterBar options={MAP_FILTERS} active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Aucune carte pour ce filtre." />
      ) : (
        <div className="space-y-4">
          {filtered.map((m) => <MapCard key={m.slug} map={m} />)}
        </div>
      )}
    </div>
  );
}
