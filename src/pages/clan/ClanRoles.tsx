import { useClanContent } from '@/features/clan/contentQueries';
import type { RoleEntry } from '@/features/clan/types';
import { ClanContentBoundary } from '@/components/clan/ClanContentBoundary';
import { EmptyState } from '@/components/clan/EmptyState';
import { ModeBadge } from '@/components/clan/ModeBadge';
import { TagList } from '@/components/clan/TagList';
import { ArrowRight, Target, AlertTriangle, MapPin, Heart, Clock } from 'lucide-react';

function RoleCard({ role }: { role: RoleEntry }) {
  return (
    <div className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-5 space-y-4">
      <div>
        <h2 className="font-display text-xl text-atfr-bone mb-0.5">{role.title}</h2>
        <p className="text-sm text-atfr-fog">{role.summary}</p>
      </div>

      {/* Mission */}
      <div className="rounded-lg border border-atfr-gold/15 bg-atfr-gold/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1 flex items-center gap-1">
          <Target size={11} /> Mission
        </p>
        <p className="text-sm text-atfr-bone">{role.mission}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Priorités */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/85 mb-2 flex items-center gap-1">
            <ArrowRight size={11} /> Priorités
          </p>
          <ul className="space-y-1">
            {role.priorities.map((p) => (
              <li key={p} className="text-xs text-atfr-fog flex items-start gap-1.5">
                <ArrowRight size={10} className="text-atfr-gold/40 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        {/* Erreurs */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400/50 mb-2 flex items-center gap-1">
            <AlertTriangle size={11} /> Erreurs fréquentes
          </p>
          <ul className="space-y-1">
            {role.mistakes.map((m) => (
              <li key={m} className="text-xs text-atfr-fog flex items-start gap-1.5">
                <AlertTriangle size={10} className="text-red-500/40 shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-atfr-graphite/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-atfr-fog/85 mb-1 flex items-center gap-1"><MapPin size={10} />Position</p>
          <p className="text-xs text-atfr-fog">{role.positioning}</p>
        </div>
        <div className="rounded-lg bg-atfr-graphite/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-atfr-fog/85 mb-1 flex items-center gap-1"><Heart size={10} />HP</p>
          <p className="text-xs text-atfr-fog">{role.hp_management}</p>
        </div>
        <div className="rounded-lg bg-atfr-graphite/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-atfr-fog/85 mb-1 flex items-center gap-1"><Clock size={10} />Timing</p>
          <p className="text-xs text-atfr-fog">{role.timing}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/85 mb-2">Chars recommandés</p>
        <div className="flex flex-wrap gap-1.5">
          {role.example_tanks.map((t) => (
            <span key={t} className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/40 px-2 py-0.5 text-xs text-atfr-bone">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-1">
          {role.modes.map((m) => <ModeBadge key={m} mode={m} />)}
        </div>
        <TagList tags={role.tags} />
      </div>
    </div>
  );
}

export default function ClanRoles() {
  const content = useClanContent();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Rôles & gameplay</h1>
        <p className="mt-1 text-sm text-atfr-fog">Mission, priorités, erreurs courantes et conseils par rôle en battle.</p>
      </div>
      <ClanContentBoundary query={content}>
        {({ roles }) => {
          const list = roles?.roles ?? [];
          if (list.length === 0) return <EmptyState message="Contenu indisponible." />;
          return (
            <div className="space-y-4">
              {list.map((role) => <RoleCard key={role.slug} role={role} />)}
            </div>
          );
        }}
      </ClanContentBoundary>
    </div>
  );
}
