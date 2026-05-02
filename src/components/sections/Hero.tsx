import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Radio,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';
import { useClanInfo } from '@/features/clan/queries';
import { useContent } from '@/hooks/useContent';
import { usePendingApplicationsCount } from '@/features/applications/queries';

export function Hero() {
  const { data: clan } = useClanInfo();
  const { get } = useContent();
  const { data: pendingCount = 0 } = usePendingApplicationsCount();
  const reduceMotion = useReducedMotion();

  const videoUrl = get('hero_video_url');
  const posterUrl = get('hero_poster_url');

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {videoUrl ? (
        <video
          key={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterUrl || undefined}
          aria-hidden
        >
          <source src={videoUrl} />
        </video>
      ) : posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-atfr-ink/60 via-atfr-ink/70 to-atfr-ink"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-atfr-gold/10 to-transparent"
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
            <div className="mb-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-atfr-gold/30 bg-atfr-gold/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-atfr-gold">
                <Star size={12} /> {get('hero_eyebrow')}
              </div>
              {pendingCount > 0 && (
                <Link
                  to="/recrutement"
                  className="group inline-flex items-center gap-2 rounded-full border border-atfr-success/40 bg-atfr-success/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-atfr-success hover:border-atfr-success hover:bg-atfr-success/15 transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-atfr-success animate-ping opacity-75" />
                    <span className="relative rounded-full h-2 w-2 bg-atfr-success" />
                  </span>
                  <Radio size={10} />
                  <span>
                    {pendingCount} candidature{pendingCount > 1 ? 's' : ''} en attente
                  </span>
                  <ArrowRight
                    size={10}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </div>

            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-semibold leading-none tracking-tight">
              <span className="text-gradient-gold">
                {get('hero_title') || env.clanTag}
              </span>
              <span className="block text-atfr-bone mt-3 text-2xl sm:text-3xl lg:text-4xl font-normal tracking-normal">
                {get('hero_subtitle')}
              </span>
            </h1>

            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/recrutement">
                <Button
                  size="lg"
                  trailingIcon={<ArrowRight size={16} />}
                  className="group"
                >
                  {get('hero_cta_primary') || 'Nous rejoindre'}
                </Button>
              </Link>
              <a href="#about">
                <Button
                  variant="outline"
                  size="lg"
                  leadingIcon={<Users size={16} />}
                >
                  {get('hero_cta_secondary') || 'Découvrir le clan'}
                </Button>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  label: get('hero_signal_1_label'),
                  value: get('hero_signal_1_value'),
                },
                {
                  icon: BookOpen,
                  label: get('hero_signal_2_label'),
                  value: get('hero_signal_2_value'),
                },
                {
                  icon: Radio,
                  label: get('hero_signal_3_label'),
                  value: get('hero_signal_3_value'),
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.35 + i * 0.08,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="rounded-lg border border-atfr-gold/15 bg-atfr-ink/45 px-4 py-3 backdrop-blur"
                >
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    <item.icon size={15} className="text-atfr-gold" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-atfr-fog">
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-atfr-bone">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="relative mx-auto max-w-sm">
              <motion.div
                className="absolute inset-3 rounded-full border border-atfr-gold/25"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{
                  duration: 26,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                aria-hidden
              >
                <span className="absolute -top-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-sm bg-atfr-gold/70" />
                <span className="absolute -bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-sm bg-atfr-gold/40" />
              </motion.div>
              <motion.div
                className="absolute inset-9 rounded-full border border-dashed border-atfr-gold/20"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{
                  duration: 34,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                aria-hidden
              />
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
              <div
                className="absolute inset-x-10 bottom-1 h-px bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent"
                aria-hidden
              />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#about"
        aria-label="Découvrir"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-atfr-gold/70 hover:text-atfr-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <ChevronDown size={26} />
      </motion.a>
    </section>
  );
}
