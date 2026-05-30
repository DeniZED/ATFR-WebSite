import { motion } from 'framer-motion';
import { Award, Globe, Shield, Swords, Trophy, Zap } from 'lucide-react';

const badges = [
  { icon: Globe, label: 'Campagnes Globales' },
  { icon: Swords, label: 'Avancées' },
  { icon: Trophy, label: 'Ligue des Clans' },
  { icon: Shield, label: 'Escarmouches' },
  { icon: Zap, label: 'Tournois Communautaires' },
  { icon: Award, label: 'Événements Wargaming' },
];

export function PrestigeBanner() {
  return (
    <div className="relative border-y border-atfr-gold/10 bg-atfr-carbon/60 backdrop-blur-sm overflow-hidden">
      <div
        className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-10"
        aria-hidden
      />
      <div className="container py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-atfr-gold/60 shrink-0">
            Présents sur
          </p>
          <div className="h-4 w-px bg-atfr-gold/20 hidden sm:block" aria-hidden />
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex items-center gap-2 text-atfr-fog/80 hover:text-atfr-bone transition-colors group"
            >
              <badge.icon
                size={14}
                className="text-atfr-gold/60 group-hover:text-atfr-gold transition-colors"
                strokeWidth={1.5}
              />
              <span className="text-xs tracking-wide whitespace-nowrap">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
