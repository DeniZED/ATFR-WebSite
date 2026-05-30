import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Radio,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroParticles } from '@/components/ui/HeroParticles';
import { env } from '@/lib/env';
import { useClanInfo } from '@/features/clan/queries';
import { useClanStats } from '@/features/stats/queries';
import { useContent } from '@/hooks/useContent';
import { usePendingApplicationsCount } from '@/features/applications/queries';

function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const words = (text ?? '').split(' ');
  if (reduceMotion) return <>{text}</>;
  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.55,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </>
  );
}

function BigCountUp({
  to,
  decimals = 0,
  suffix = '',
  loading = false,
}: {
  to: number | null;
  decimals?: number;
  suffix?: string;
  loading?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (to == null) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  useEffect(() => {
    if (!started || to == null) return;
    if (reduceMotion) {
      setDisplay(to);
      return;
    }
    const startTime = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to, reduceMotion]);

  if (loading) {
    return (
      <span
        ref={ref}
        className="inline-block h-8 w-20 rounded shimmer align-middle"
        aria-hidden
      />
    );
  }

  return (
    <span ref={ref}>
      {to == null ? '—' : `${display.toFixed(decimals)}${suffix}`}
    </span>
  );
}

export function Hero() {
  const { data: clan } = useClanInfo();
  const { data: stats, isLoading: statsLoading } = useClanStats();
  const { get } = useContent();
  const { data: pendingCount = 0 } = usePendingApplicationsCount();
  const reduceMotion = useReducedMotion();

  const videoUrl = get('hero_video_url');
  const posterUrl = get('hero_poster_url');

  const heroTitle = get('hero_title') || env.clanTag;
  const heroSubtitle = get('hero_subtitle') || '';

  const metrics = [
    { label: 'Membres', value: stats?.membersCount ?? null, decimals: 0, suffix: '' },
    { label: 'Winrate moyen', value: stats?.avgWinRate ?? null, decimals: 1, suffix: '%' },
    { label: 'WN8 moyen', value: stats?.avgWn8 ?? null, decimals: 0, suffix: '' },
    { label: 'Actifs 7 jours', value: stats?.active7d ?? null, decimals: 0, suffix: '' },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background media */}
      {videoUrl ? (
        <video
          key={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={!reduceMotion}
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

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-atfr-ink/65 via-atfr-ink/75 to-atfr-ink"
        aria-hidden
      />
      {/* Tactical grid */}
      <div
        className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-15"
        aria-hidden
      />
      {/* Top gold tint */}
      <div
        className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-atfr-gold/8 to-transparent"
        aria-hidden
      />
      {/* Atmospheric radial glow bottom-right */}
      <div
        className="absolute -bottom-40 right-0 w-[700px] h-[500px] rounded-full bg-atfr-gold/6 blur-[120px] pointer-events-none"
        aria-hidden
      />

      {/* Floating gold particles */}
      <HeroParticles />

      <div className="container relative z-10 py-24">
        <div className="grid lg:grid-cols-12 items-center gap-12">
          {/* ── Left column: text ── */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Badges row */}
            <motion.div
              className="mb-6 flex flex-wrap gap-2 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
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
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </motion.div>

            {/* Main title with word-reveal */}
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-semibold leading-none tracking-tight">
              <span className="text-gradient-gold">
                <WordReveal text={heroTitle} delay={0.1} />
              </span>
              <span className="block text-atfr-bone mt-3 text-2xl sm:text-3xl lg:text-4xl font-normal tracking-normal overflow-hidden">
                {heroSubtitle && (
                  <motion.span
                    className="inline-block"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {heroSubtitle}
                  </motion.span>
                )}
              </span>
            </h1>

            {/* CTA buttons */}
            <motion.div
              className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Link to="/recrutement">
                <Button size="lg" trailingIcon={<ArrowRight size={16} />} className="group">
                  {get('hero_cta_primary') || 'Nous rejoindre'}
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" size="lg" leadingIcon={<Users size={16} />}>
                  {get('hero_cta_secondary') || 'Découvrir le clan'}
                </Button>
              </a>
            </motion.div>

            {/* Big live stats */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-atfr-gold/10">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.75 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                  className="bg-atfr-ink/50 backdrop-blur px-4 py-4 text-center lg:text-left group hover:bg-atfr-carbon/60 transition-colors"
                >
                  <p className="text-[9px] uppercase tracking-[0.25em] text-atfr-fog mb-1">
                    {m.label}
                  </p>
                  <p className="font-display text-3xl sm:text-4xl font-semibold text-atfr-bone group-hover:text-atfr-gold transition-colors">
                    <BigCountUp
                      to={m.value}
                      decimals={m.decimals}
                      suffix={m.suffix}
                      loading={statsLoading}
                    />
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Right column: cinematic emblem ── */}
          <motion.div
            className="lg:col-span-5 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Atmospheric halo behind emblem */}
              <div
                className="absolute inset-0 rounded-full bg-atfr-gold/12 blur-[60px]"
                aria-hidden
              />
              <div
                className="absolute inset-[15%] rounded-full bg-atfr-gold/8 blur-[40px]"
                aria-hidden
              />

              {/* Outermost slow ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-atfr-gold/15"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              >
                <span className="absolute -top-1 left-1/2 h-2 w-10 -translate-x-1/2 rounded-sm bg-atfr-gold/60" />
                <span className="absolute -bottom-1 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-sm bg-atfr-gold/30" />
              </motion.div>

              {/* Middle dashed ring */}
              <motion.div
                className="absolute inset-[8%] rounded-full border border-dashed border-atfr-gold/20"
                animate={reduceMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              >
                <span className="absolute top-0 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-atfr-gold/50" />
                <span className="absolute bottom-0 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-atfr-gold/30" />
                <span className="absolute left-0 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-atfr-gold/25" />
                <span className="absolute right-0 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-atfr-gold/25" />
              </motion.div>

              {/* Inner fast ring */}
              <motion.div
                className="absolute inset-[18%] rounded-full border border-atfr-gold/10"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                aria-hidden
              >
                <span className="absolute -top-px left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-atfr-gold-light/50" />
              </motion.div>

              {/* Scan line sweep */}
              {!reduceMotion && (
                <motion.div
                  className="absolute inset-[5%] rounded-full overflow-hidden pointer-events-none"
                  aria-hidden
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(232,176,67,0.08) 30deg, transparent 60deg)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              )}

              {/* Clan emblem */}
              <img
                src={
                  clan?.emblems?.x195?.portal ??
                  `https://eu.wargaming.net/clans/media/clans/emblems/cl_501/${env.clanId}/emblem_195x195.png`
                }
                alt={`Emblème du clan ${env.clanTag}`}
                className="relative z-10 w-[58%] animate-float drop-shadow-[0_0_50px_rgba(232,176,67,0.5)]"
                width={320}
                height={320}
              />

              {/* Bottom reflection line */}
              <div
                className="absolute inset-x-[15%] bottom-[8%] h-px bg-gradient-to-r from-transparent via-atfr-gold/50 to-transparent z-10"
                aria-hidden
              />

              {/* Corner accent marks */}
              {[
                'top-[10%] left-[10%] border-t border-l',
                'top-[10%] right-[10%] border-t border-r',
                'bottom-[10%] left-[10%] border-b border-l',
                'bottom-[10%] right-[10%] border-b border-r',
              ].map((cls, i) => (
                <motion.div
                  key={i}
                  className={`absolute h-5 w-5 border-atfr-gold/40 ${cls}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  aria-hidden
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        aria-label="Découvrir"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-atfr-gold/70 hover:text-atfr-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 1.2, duration: 0.5 },
          y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <ChevronDown size={26} />
      </motion.a>
    </section>
  );
}
