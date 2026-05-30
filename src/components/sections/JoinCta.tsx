import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Button, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

export function JoinCta() {
  const { get } = useContent();
  const reduceMotion = useReducedMotion();

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative overflow-hidden rounded-2xl border border-atfr-gold/25 bg-gradient-to-br from-atfr-carbon via-atfr-graphite to-atfr-carbon p-10 sm:p-16 text-center"
      >
        {/* Tactical grid */}
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-15" aria-hidden />

        {/* Multi-layer glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-atfr-gold/10 blur-[80px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-atfr-gold/6 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-atfr-gold/6 blur-3xl pointer-events-none"
          aria-hidden
        />

        {/* Animated top border scan */}
        {!reduceMotion && (
          <motion.div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(232,176,67,0.8), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            aria-hidden
          />
        )}
        {/* Static top border */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/40 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/20 to-transparent"
          aria-hidden
        />

        {/* Corner marks */}
        {[
          'top-4 left-4 border-t border-l',
          'top-4 right-4 border-t border-r',
          'bottom-4 left-4 border-b border-l',
          'bottom-4 right-4 border-b border-r',
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute h-5 w-5 border-atfr-gold/40 ${cls}`}
            aria-hidden
          />
        ))}

        <div className="relative">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-atfr-gold/50" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-atfr-gold/80">
              Recrutement ouvert
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-atfr-gold/50" />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-atfr-bone leading-tight">
            {get('cta_title')}
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-atfr-fog leading-relaxed text-base sm:text-lg">
            {get('cta_text')}
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/recrutement">
              <Button size="xl" trailingIcon={<ArrowRight size={18} />}>
                Postuler maintenant
              </Button>
            </Link>
            <Link to="/membres">
              <Button variant="outline" size="xl" leadingIcon={<Users size={16} />}>
                Voir les membres
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
