import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Radio,
  Shield,
  Swords,
  Trophy,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';
import { useClanInfo } from '@/features/clan/queries';
import { useContent } from '@/hooks/useContent';
import { useClanStats } from '@/features/stats/queries';
import { usePendingApplicationsCount } from '@/features/applications/queries';

/* ── Animated counter hook ─────────────────────────────────────── */
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number | null, duration = 1200, delay = 0) {
  const [value, setValue] = useState<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === null) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) frameRef.current = requestAnimationFrame(tick);
        else setValue(target);
      };
      frameRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

/* ── HUD corner bracket ─────────────────────────────────────────── */
function HudCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const corners = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
  };
  return (
    <span
      className={`absolute w-5 h-5 border-atfr-gold/70 ${corners[pos]}`}
      aria-hidden
    />
  );
}

/* ── Hero stat pill ─────────────────────────────────────────────── */
function HeroStat({
  icon: Icon,
  label,
  value,
  delay,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative overflow-hidden rounded-lg border px-4 py-3 backdrop-blur-sm ${
        highlight
          ? 'border-atfr-gold/40 bg-atfr-gold/8'
          : 'border-atfr-gold/15 bg-atfr-ink/50'
      }`}
    >
      <HudCorner pos="tl" />
      <HudCorner pos="br" />
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-atfr-gold/80" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-atfr-fog">
          {label}
        </span>
      </div>
      <p
        className={`font-display text-lg font-semibold leading-none ${
          highlight ? 'text-gradient-gold' : 'text-atfr-bone'
        }`}
      >
        {value !== null ? value : '—'}
      </p>
    </motion.div>
  );
}

/* ── Floating particle grid ─────────────────────────────────────── */
function ParticleGrid({ reduce }: { reduce: boolean | null }) {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (i % 6) * 17 + Math.sin(i * 1.3) * 6,
    y: Math.floor(i / 6) * 28 + (i % 3) * 4,
    size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
    delay: i * 0.18,
    dur: 3 + (i % 4) * 0.7,
  }));

  if (reduce) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {particles.map((p) => (
          <circle key={p.id} cx={p.x} cy={p.y} r={p.size * 0.3} fill="#E8B043">
            <animate
              attributeName="opacity"
              values="0.2;0.9;0.2"
              dur={`${p.dur}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; ${Math.sin(p.id) * 1.2} ${Math.cos(p.id) * 1.5}; 0 0`}
              dur={`${p.dur * 1.4}s`}
              begin={`${p.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        {/* Connecting lines */}
        {particles.slice(0, 12).map((p, i) => {
          const next = particles[(i + 5) % 24];
          const dist = Math.hypot(p.x - next.x, p.y - next.y);
          if (dist > 25) return null;
          return (
            <line
              key={`l${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke="#E8B043"
              strokeWidth="0.2"
              strokeOpacity="0.15"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ── Hexagon emblem ─────────────────────────────────────────────── */
function HexEmblem({
  src,
  alt,
  reduce,
}: {
  src: string;
  alt: string;
  reduce: boolean | null;
}) {
  return (
    <div className="relative mx-auto w-64 sm:w-80 select-none">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 hex-clip"
        animate={reduce ? undefined : { opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(232,176,67,0.25) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      {/* Rotating border */}
      <motion.div
        className="absolute inset-[-6px]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ clipPath: 'none' }}>
          <polygon
            points="50,2 95,26 95,74 50,98 5,74 5,26"
            fill="none"
            stroke="rgba(232,176,67,0.35)"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />
        </svg>
      </motion.div>
      {/* Counter-rotating inner border */}
      <motion.div
        className="absolute inset-[4px]"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,4 93,28 93,72 50,96 7,72 7,28"
            fill="none"
            stroke="rgba(232,176,67,0.2)"
            strokeWidth="0.5"
            strokeDasharray="2 8"
          />
        </svg>
      </motion.div>
      {/* Hex frame */}
      <div className="relative hex-clip bg-gradient-to-b from-atfr-graphite to-atfr-carbon border-0 overflow-hidden">
        {/* Inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(232,176,67,0.12) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <motion.img
          src={src}
          alt={alt}
          className="relative w-full p-8 drop-shadow-[0_0_30px_rgba(232,176,67,0.5)]"
          animate={reduce ? undefined : { filter: ['drop-shadow(0 0 24px rgba(232,176,67,0.4))', 'drop-shadow(0 0 48px rgba(232,176,67,0.7))', 'drop-shadow(0 0 24px rgba(232,176,67,0.4))'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          width={320}
          height={320}
        />
      </div>
      {/* Bottom reflection */}
      <div
        className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-atfr-gold/70 to-transparent"
        aria-hidden
      />
      {/* Scan line */}
      {!reduce && (
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent pointer-events-none"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        />
      )}
    </div>
  );
}

/* ── Main Hero ──────────────────────────────────────────────────── */
export function Hero() {
  const { data: clan } = useClanInfo();
  const { get } = useContent();
  const { data: pendingCount = 0 } = usePendingApplicationsCount();
  const { data: stats } = useClanStats();
  const reduceMotion = useReducedMotion();

  const videoUrl = get('hero_video_url');
  const posterUrl = get('hero_poster_url');

  const members = useCountUp(stats?.membersCount ?? null, 1200, 600);
  const winrate = useCountUp(
    stats?.avgWinRate != null ? Math.round(stats.avgWinRate * 100) / 100 : null,
    1000,
    800,
  );
  const wn8 = useCountUp(stats?.avgWn8 ?? null, 1100, 700);
  const active = useCountUp(stats?.active7d ?? null, 900, 900);

  const clanTag = env.clanTag;

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden scanlines">
      {/* ── Background media ──────────────────────────────── */}
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

      {/* ── Overlays ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-atfr-ink/65 via-atfr-ink/72 to-atfr-ink"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-15"
        aria-hidden
      />
      {/* Gold vignette top */}
      <div
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-atfr-gold/8 to-transparent"
        aria-hidden
      />
      {/* Diagonal glow */}
      <div
        className="absolute top-1/4 -left-40 w-[700px] h-[500px] rounded-full bg-atfr-gold/6 blur-[120px] pointer-events-none"
        aria-hidden
      />

      {/* ── Particles ────────────────────────────────────── */}
      <ParticleGrid reduce={reduceMotion} />

      {/* ── Moving scan beam ─────────────────────────────── */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-atfr-gold/20 to-transparent pointer-events-none z-0"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        />
      )}

      {/* ── HUD status bar (top) ──────────────────────────── */}
      <motion.div
        className="absolute top-0 inset-x-0 z-20 h-px bg-gradient-to-r from-transparent via-atfr-gold/40 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        aria-hidden
      />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="container relative z-10 py-24">
        <div className="grid lg:grid-cols-12 items-center gap-10 xl:gap-16">

          {/* ── Left column ────────────────────────────────── */}
          <motion.div
            className="lg:col-span-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* ── Eyebrow badges ───────────────────────────── */}
            <div className="mb-7 flex flex-wrap gap-2 justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-atfr-gold/30 bg-atfr-gold/8 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-atfr-gold animate-hud-blink">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-atfr-gold animate-ping opacity-75" />
                  <span className="relative rounded-full h-1.5 w-1.5 bg-atfr-gold" />
                </span>
                {get('hero_eyebrow') || 'Clan World of Tanks'}
              </div>
              {pendingCount > 0 && (
                <Link
                  to="/recrutement"
                  className="group inline-flex items-center gap-2 rounded-full border border-atfr-success/40 bg-atfr-success/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-atfr-success hover:border-atfr-success hover:bg-atfr-success/15 transition-colors"
                >
                  <Radio size={10} />
                  {pendingCount} candidature{pendingCount > 1 ? 's' : ''} en attente
                  <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            {/* ── Main title with glitch ───────────────────── */}
            <div className="relative mb-2">
              <h1
                className="glitch-text font-display text-[clamp(4rem,10vw,7.5rem)] font-semibold leading-none tracking-tight text-gradient-gold"
                data-text={get('hero_title') || clanTag}
              >
                {get('hero_title') || clanTag}
              </h1>
            </div>
            <p className="font-display text-[clamp(1.2rem,3vw,2.2rem)] text-atfr-bone/80 font-normal tracking-wide">
              {get('hero_subtitle')}
            </p>

            {/* ── Tactical divider ─────────────────────────── */}
            <motion.div
              className="my-8 flex items-center gap-3"
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-atfr-gold/60 to-transparent" />
              <Shield size={14} className="text-atfr-gold/60" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-atfr-gold/25 to-transparent max-w-xs" />
            </motion.div>

            {/* ── Live stat grid ───────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <HeroStat
                icon={Users}
                label="Membres"
                value={members}
                delay={0.6}
              />
              <HeroStat
                icon={Trophy}
                label="Winrate moy."
                value={winrate !== null ? `${winrate}%` : null}
                delay={0.68}
                highlight
              />
              <HeroStat
                icon={Swords}
                label="WN8 moyen"
                value={wn8}
                delay={0.76}
              />
              <HeroStat
                icon={Zap}
                label="Actifs 7j"
                value={active}
                delay={0.84}
              />
            </div>

            {/* ── CTAs ─────────────────────────────────────── */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.95 }}
            >
              <Link to="/recrutement">
                <Button size="lg" trailingIcon={<ArrowRight size={16} />} className="group shadow-glow">
                  {get('hero_cta_primary') || 'Nous rejoindre'}
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" size="lg" leadingIcon={<Users size={16} />}>
                  {get('hero_cta_secondary') || 'Découvrir le clan'}
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right column — Hex emblem ──────────────────── */}
          <motion.div
            className="lg:col-span-5 flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <HexEmblem
              src={
                clan?.emblems?.x195?.portal ??
                `https://eu.wargaming.net/clans/media/clans/emblems/cl_501/${env.clanId}/emblem_195x195.png`
              }
              alt={`Emblème du clan ${clanTag}`}
              reduce={reduceMotion}
            />

            {/* Online indicator */}
            <motion.div
              className="flex items-center gap-2 rounded-full border border-atfr-gold/20 bg-atfr-carbon/60 backdrop-blur px-4 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <Wifi size={12} className="text-atfr-success" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-atfr-fog">
                {stats?.onlineNow != null ? (
                  <><span className="text-atfr-success font-semibold">{stats.onlineNow}</span> en jeu maintenant</>
                ) : (
                  'Connexion…'
                )}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── HUD bottom status bar ─────────────────────────── */}
      <motion.div
        className="absolute bottom-16 inset-x-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <div className="container">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-atfr-gold/40 font-mono">
            <span>EU — Server Online</span>
            <span className="hidden sm:block">ATFR // {clanTag} // WoT FR</span>
            <span>Sys: Nominal</span>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────── */}
      <motion.a
        href="#about"
        aria-label="Découvrir"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-atfr-gold/60 hover:text-atfr-gold transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[8px] uppercase tracking-[0.4em]">Scroll</span>
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </motion.a>
    </section>
  );
}
