import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
        className="relative overflow-hidden rounded-2xl border border-atfr-gold/20 bg-gradient-to-br from-atfr-carbon via-atfr-graphite to-atfr-carbon p-10 sm:p-16 text-center"
      >
        <div
          className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20"
          aria-hidden
        />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-atfr-gold/10 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold mb-4">
            Recrutement ouvert
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-atfr-bone">
            {get('cta_title')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-atfr-fog leading-relaxed">
            {get('cta_text')}
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/recrutement">
              <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
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
