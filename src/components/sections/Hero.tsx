import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';
import { useClanInfo } from '@/features/clan/queries';

export function Hero() {
  const { data: clan } = useClanInfo();

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-30" aria-hidden />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full blur-[120px] bg-atfr-gold/20"
        aria-hidden
      />

      <div className="container relative z-10 py-24">
        <div className="grid lg:grid-cols-12 items-center gap-12">
          <motion.div
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-atfr-gold/30 bg-atfr-gold/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-atfr-gold mb-6">
              <Star size={12} /> Clan FR actif
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-semibold leading-none tracking-tight">
              <span className="text-gradient-gold">{env.clanTag}</span>
              <span className="block text-atfr-bone mt-2 text-3xl sm:text-4xl lg:text-5xl">
                Jouer sérieusement, sans se prendre au sérieux.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-atfr-fog leading-relaxed">
              Rejoignez {env.clanTag} et son clan frère A-T-O : entraînements,
              soirées en escadron, opérations globales, et une communauté
              francophone qui joue pour gagner — et pour s'amuser.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/recrutement">
                <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
                  Nous rejoindre
                </Button>
              </Link>
              <Link to="/membres">
                <Button variant="outline" size="lg" leadingIcon={<Users size={16} />}>
                  Voir les membres
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="relative mx-auto max-w-sm">
              <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-3xl rounded-full" />
              <img
                src={
                  clan?.emblems?.x195?.portal ??
                  `https://eu.wargaming.net/clans/media/clans/emblems/cl_501/${env.clanId}/emblem_195x195.png`
                }
                alt={`Emblème du clan ${env.clanTag}`}
                className="relative w-full animate-float drop-shadow-[0_0_40px_rgba(232,176,67,0.4)]"
                width={320}
                height={320}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-atfr-ink" />
    </section>
  );
}
