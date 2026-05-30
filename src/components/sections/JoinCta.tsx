import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Swords, Target } from 'lucide-react';
import { Button, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

export function JoinCta() {
  const { get } = useContent();
  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative overflow-hidden rounded-2xl border border-atfr-gold/25 bg-gradient-to-br from-atfr-carbon via-atfr-graphite to-atfr-carbon"
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20"
          aria-hidden
        />
        {/* Central glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-atfr-gold/10 blur-[80px]"
          aria-hidden
        />
        {/* Corner brackets */}
        <span className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-atfr-gold/50" aria-hidden />
        <span className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-atfr-gold/50" aria-hidden />
        <span className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-atfr-gold/50" aria-hidden />
        <span className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-atfr-gold/50" aria-hidden />

        {/* Top border glow */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent"
          aria-hidden
        />

        <div className="relative px-10 py-14 sm:px-16 sm:py-20 text-center">
          {/* Eyebrow */}
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-atfr-gold/30 bg-atfr-gold/8 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-atfr-gold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-atfr-success animate-ping opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-atfr-success" />
              </span>
              Recrutement ouvert
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-semibold text-gradient-gold">
            {get('cta_title')}
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-atfr-fog leading-relaxed">
            {get('cta_text')}
          </p>

          {/* 3 pillars */}
          <div className="mt-10 grid grid-cols-3 max-w-lg mx-auto gap-4 mb-10">
            {[
              { icon: Shield, label: 'Communauté soudée' },
              { icon: Swords, label: 'Jeu compétitif' },
              { icon: Target, label: 'Progression continue' },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="h-10 w-10 rounded-lg border border-atfr-gold/25 bg-atfr-gold/8 flex items-center justify-center text-atfr-gold">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-atfr-fog text-center">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/recrutement">
              <Button size="lg" trailingIcon={<ArrowRight size={16} />} className="shadow-glow-lg">
                Postuler maintenant
              </Button>
            </Link>
            <Link to="/membres">
              <Button variant="outline" size="lg">
                Voir la liste des membres
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
