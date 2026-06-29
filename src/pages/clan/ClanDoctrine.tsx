import { Shield, Swords, ClipboardList, TrendingUp, Mic, Users, Star, type LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { DOCTRINE, DOCTRINE_INTRO } from '@/data/clan/doctrine';

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Swords, ClipboardList, TrendingUp, Mic, Users, Star,
};

export default function ClanDoctrine() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Doctrine ATFR</h1>
        <p className="mt-2 text-sm text-atfr-fog max-w-xl">{DOCTRINE_INTRO}</p>
      </div>

      <div className="space-y-4">
        {DOCTRINE.map((section) => {
          const Icon: LucideIcon = ICON_MAP[section.icon] ?? Shield;
          return (
            <div key={section.id} className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-atfr-gold/10">
                <div className="h-8 w-8 shrink-0 rounded-lg border border-atfr-gold/25 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
                  <Icon size={16} strokeWidth={1.6} />
                </div>
                <h2 className="font-display text-lg text-atfr-bone">{section.title}</h2>
              </div>
              <ul className="px-5 py-4 space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-atfr-fog">
                    <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-atfr-gold/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
