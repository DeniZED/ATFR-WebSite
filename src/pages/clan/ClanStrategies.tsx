import { useState } from 'react';
import { STRATEGY_CATEGORIES } from '@/features/clan/filters';
import { useClanContent } from '@/features/clan/contentQueries';
import type { StrategyEntry } from '@/features/clan/types';
import { ClanContentBoundary } from '@/components/clan/ClanContentBoundary';
import { FilterBar } from '@/components/clan/FilterBar';
import { ModeBadge } from '@/components/clan/ModeBadge';
import { TagList } from '@/components/clan/TagList';
import { ValidatedBy } from '@/components/clan/ValidatedBy';
import { EmptyState } from '@/components/clan/EmptyState';
import { AlertTriangle, MessageSquareQuote, User } from 'lucide-react';

function StratCard({ strat }: { strat: StrategyEntry }) {
  return (
    <div className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-5 space-y-4">
      <div>
        <h2 className="font-display text-xl text-atfr-bone mb-1">{strat.title}</h2>
        <p className="text-sm text-atfr-fog">{strat.summary}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {strat.modes.map((m) => <ModeBadge key={m} mode={m} />)}
      </div>

      {/* Règles */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/85 mb-2">Règles</p>
        <ul className="space-y-1.5">
          {strat.rules.map((r, i) => (
            <li key={i} className="text-xs text-atfr-fog flex items-start gap-2">
              <span className="shrink-0 h-4 w-4 rounded-full bg-atfr-gold/15 text-atfr-gold text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Exemple */}
      <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/60 mb-1">Exemple</p>
        <p className="text-xs text-atfr-fog">{strat.example}</p>
      </div>

      {/* Erreurs + Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400/50 mb-2 flex items-center gap-1">
            <AlertTriangle size={11} /> Erreurs courantes
          </p>
          <ul className="space-y-1">
            {strat.common_mistakes.map((m, i) => (
              <li key={i} className="text-xs text-atfr-fog flex items-start gap-1.5">
                <AlertTriangle size={10} className="text-red-500/40 shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/85 mb-2 flex items-center gap-1">
            <User size={11} /> Actions joueur
          </p>
          <ul className="space-y-1">
            {strat.player_actions.map((a, i) => (
              <li key={i} className="text-xs text-atfr-fog">→ {a}</li>
            ))}
          </ul>
        </div>
      </div>

      {strat.caller_phrase && (
        <div className="flex items-start gap-2 rounded-lg border border-atfr-gold/15 bg-atfr-gold/5 px-3 py-2">
          <MessageSquareQuote size={14} className="text-atfr-gold/60 shrink-0 mt-0.5" />
          <p className="text-xs text-atfr-bone italic">{strat.caller_phrase}</p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <TagList tags={strat.tags} />
        <ValidatedBy by={strat.validated_by} at={strat.updated_at} />
      </div>
    </div>
  );
}

export default function ClanStrategies() {
  const [category, setCategory] = useState('all');
  const content = useClanContent();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Tactiques clan</h1>
        <p className="mt-1 text-sm text-atfr-fog">Règles, exemples et phrases de caller pour chaque tactique.</p>
      </div>

      <FilterBar options={STRATEGY_CATEGORIES} active={category} onChange={setCategory} />

      <ClanContentBoundary query={content}>
        {({ strategies }) => {
          const filtered = (strategies?.strategies ?? []).filter(
            (s) => category === 'all' || s.category === category,
          );
          if (filtered.length === 0) {
            return <EmptyState message="Aucune tactique dans cette catégorie." />;
          }
          return (
            <div className="space-y-4">
              {filtered.map((s) => <StratCard key={s.slug} strat={s} />)}
            </div>
          );
        }}
      </ClanContentBoundary>
    </div>
  );
}
