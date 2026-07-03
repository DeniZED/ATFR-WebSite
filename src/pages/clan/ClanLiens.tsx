import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { LINK_CATEGORIES } from '@/features/clan/filters';
import { useClanContent } from '@/features/clan/contentQueries';
import { ClanContentBoundary } from '@/components/clan/ClanContentBoundary';
import { FilterBar } from '@/components/clan/FilterBar';
import { TagList } from '@/components/clan/TagList';
import { EmptyState } from '@/components/clan/EmptyState';

export default function ClanLiens() {
  const [filter, setFilter] = useState('all');
  const content = useClanContent();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Ressources</h1>
        <p className="mt-1 text-sm text-atfr-fog">Outils, stats et guides recommandés par le staff ATFR.</p>
      </div>

      <FilterBar options={LINK_CATEGORIES} active={filter} onChange={setFilter} />

      <ClanContentBoundary query={content}>
        {({ links }) => {
          const filtered = (links?.links ?? []).filter(
            (l) => filter === 'all' || l.category === filter,
          );
          if (filtered.length === 0) {
            return <EmptyState message="Aucune ressource dans cette catégorie." />;
          }
          return (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-4 hover:border-atfr-gold/30 hover:bg-atfr-graphite/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-atfr-bone group-hover:text-atfr-gold transition-colors">{link.title}</p>
                    <ExternalLink size={13} className="text-atfr-fog/85 group-hover:text-atfr-gold/60 shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <p className="text-xs text-atfr-fog/85">{link.description}</p>
                  <TagList tags={link.tags} />
                </a>
              ))}
            </div>
          );
        }}
      </ClanContentBoundary>
    </div>
  );
}
