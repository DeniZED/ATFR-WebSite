'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import type { LevelInfo } from '@/features/geoguesser/playerProfile';

interface AcademyBadgeProps {
  levelInfo: LevelInfo;
  skinId?: string;
  emblemId?: string | null;
  size?: number;
  className?: string;
}

const VW = 100;
const VH = 120;

type Tier = 1 | 2 | 3 | 4 | 5;

function getTier(level: number): Tier {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  if (level <= 12) return 4;
  return 5;
}

function getStarCount(level: number): number {
  if (level <= 3) return 0;
  if (level <= 5) return 1;
  if (level <= 7) return 2;
  if (level <= 10) return 3;
  if (level <= 12) return 4;
  return 5;
}

// Per-skin background gradient colours
const SKIN_BG: Record<string, [string, string]> = {
  default:  ['#223018', '#0F1A08'],
  desert:   ['#2E1E0A', '#1A1006'],
  winter:   ['#1A2840', '#0E1828'],
  urban:    ['#1E2228', '#121618'],
  forest:   ['#0E1C08', '#081004'],
  digital:  ['#162410', '#0A1408'],
  arctic:   ['#162448', '#0A1432'],
  atfr:     ['#0A1828', '#040E18'],
  chrome:   ['#1E2430', '#121820'],
  prestige: ['#0A0A0A', '#040404'],
};

// Per-skin accent colours (tier 1-2 only)
const SKIN_ACCENT: Record<string, { stroke: string; accent: string; text: string; star: string }> = {
  default:  { stroke: '#4A6030', accent: '#7A9060', text: '#A8C088', star: '#7A9060' },
  desert:   { stroke: '#7A6020', accent: '#A88040', text: '#C8A060', star: '#A88040' },
  winter:   { stroke: '#607090', accent: '#8090A8', text: '#A8B8C8', star: '#8090A8' },
  urban:    { stroke: '#505860', accent: '#707880', text: '#909AA0', star: '#707880' },
  forest:   { stroke: '#304820', accent: '#487040', text: '#688060', star: '#487040' },
  digital:  { stroke: '#405830', accent: '#587848', text: '#789068', star: '#587848' },
  arctic:   { stroke: '#506090', accent: '#7090B8', text: '#90B0D0', star: '#7090B8' },
  atfr:     { stroke: '#304060', accent: '#486090', text: '#6888B0', star: '#486090' },
  chrome:   { stroke: '#5A6878', accent: '#7888A0', text: '#98A8B8', star: '#7888A0' },
  prestige: { stroke: '#282828', accent: '#484848', text: '#686868', star: '#484848' },
};

// Tier 3-5: precious metal accents override skin (background stays from skin)
const TIER_ACCENT: Record<3 | 4 | 5, { stroke: string; accent: string; text: string; star: string }> = {
  3: { stroke: '#C9A227', accent: '#E0B84A', text: '#F0D870', star: '#C9A227' },
  4: { stroke: '#C9A227', accent: '#C8C8EE', text: '#E0E0F8', star: '#C9A227' },
  5: { stroke: '#C9A227', accent: '#C9A227', text: '#F5DC80', star: '#C9A227' },
};

function getColors(tier: Tier, skinId: string) {
  const [bg1, bg2] = SKIN_BG[skinId] ?? SKIN_BG.default;
  if (tier >= 3) {
    return { bg1, bg2, ...TIER_ACCENT[tier as 3 | 4 | 5] };
  }
  return { bg1, bg2, ...(SKIN_ACCENT[skinId] ?? SKIN_ACCENT.default) };
}

// Shield paths
const SHIELD_PATH  = 'M 50 6 L 91 22 L 91 70 Q 91 97 50 114 Q 9 97 9 70 L 9 22 Z';
const SHIELD_INNER = 'M 50 11 L 86 26 L 86 69 Q 86 92 50 108 Q 14 92 14 69 L 14 26 Z';

// 5-pointed star path
function makeStar(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// Emblem renderers — centred at (cx, cy)
function renderEmblem(
  id: string,
  cx: number,
  cy: number,
  color: string,
): React.ReactElement | null {
  switch (id) {
    case 'emb-crosshair':
      return (
        <g key="emb" stroke={color} fill="none" strokeLinecap="round" opacity={0.85}>
          <circle cx={cx} cy={cy} r={4.5} strokeWidth={0.9} />
          <line x1={cx} y1={cy - 8} x2={cx} y2={cy - 5.2} strokeWidth={0.9} />
          <line x1={cx} y1={cy + 5.2} x2={cx} y2={cy + 8} strokeWidth={0.9} />
          <line x1={cx - 8} y1={cy} x2={cx - 5.2} y2={cy} strokeWidth={0.9} />
          <line x1={cx + 5.2} y1={cy} x2={cx + 8} y2={cy} strokeWidth={0.9} />
        </g>
      );
    case 'emb-star':
      return <path key="emb" d={makeStar(cx, cy, 6)} fill={color} opacity={0.85} />;
    case 'emb-bolt':
      return (
        <path
          key="emb"
          d={`M ${cx + 2} ${cy - 7} L ${cx - 2.5} ${cy - 0.5} L ${cx + 1} ${cy - 0.5} L ${cx - 2.5} ${cy + 7} L ${cx + 4} ${cy + 0.5} L ${cx + 0.5} ${cy + 0.5} Z`}
          fill={color}
          opacity={0.85}
        />
      );
    case 'emb-diamond':
      return (
        <g key="emb" opacity={0.85}>
          <path d={`M ${cx} ${cy - 7} L ${cx + 5.5} ${cy} L ${cx} ${cy + 7} L ${cx - 5.5} ${cy} Z`} fill="none" stroke={color} strokeWidth={1} />
          <path d={`M ${cx} ${cy - 4} L ${cx + 3.2} ${cy} L ${cx} ${cy + 4} L ${cx - 3.2} ${cy} Z`} fill={color} opacity={0.35} />
        </g>
      );
    case 'emb-compass':
      return (
        <g key="emb" opacity={0.85}>
          <path d={`M ${cx} ${cy - 8} L ${cx + 1.8} ${cy - 2} L ${cx} ${cy} L ${cx - 1.8} ${cy - 2} Z`} fill={color} />
          <path d={`M ${cx} ${cy + 8} L ${cx + 1.8} ${cy + 2} L ${cx} ${cy} L ${cx - 1.8} ${cy + 2} Z`} fill="none" stroke={color} strokeWidth={0.8} />
          <circle cx={cx} cy={cy} r={3} fill="none" stroke={color} strokeWidth={0.8} />
        </g>
      );
    default:
      return null;
  }
}

export function AcademyBadge({
  levelInfo,
  skinId = 'default',
  emblemId = null,
  size = 80,
  className,
}: AcademyBadgeProps) {
  const uid = 'b' + useId().replace(/:/g, '_');
  const t = getTier(levelInfo.level);
  const p = getColors(t, skinId);
  const stars = getStarCount(levelInfo.level);
  const lvl = levelInfo.level;

  const w = size;
  const h = Math.round(size * VH / VW);
  const numFontSize = lvl >= 10 ? 32 : 36;
  const numY = stars > 0 ? 71 : 76;

  // Hide fine detail at small render sizes
  const showDetails = size >= 50;
  const showEmblem  = size >= 60 && !!emblemId;

  const SR = 4.5;
  const SS = 11;
  const sx0 = 50 - ((stars - 1) * SS) / 2;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={w}
      height={h}
      className={cn('shrink-0 select-none', className)}
      role="img"
      aria-label={`Insigne niveau ${lvl} — ${levelInfo.title}`}
    >
      <defs>
        <linearGradient id={`${uid}bg`} x1="35%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%"   stopColor={p.bg1} />
          <stop offset="100%" stopColor={p.bg2} />
        </linearGradient>
        {t >= 4 && (
          <filter id={`${uid}glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>

      {/* Drop shadow — tier 3+ */}
      {t >= 3 && (
        <path d={SHIELD_PATH} fill="rgba(0,0,0,0.35)" transform="translate(1.5,2.5)" />
      )}

      {/* Shield body */}
      <path d={SHIELD_PATH} fill={`url(#${uid}bg)`} stroke={p.stroke} strokeWidth={t >= 3 ? 1.8 : 1.2} />

      {showDetails && (
        <>
          {/* Inner decorative frame — tier 2+ */}
          {t >= 2 && (
            <path d={SHIELD_INNER} fill="none" stroke={p.accent} strokeWidth={0.65} opacity={0.45} />
          )}

          {/* Horizontal divider — tier 2+ */}
          {t >= 2 && (
            <line x1="21" y1="38" x2="79" y2="38" stroke={p.accent} strokeWidth={0.65} opacity={0.5} />
          )}

          {/* Crown ornament — tier 5 */}
          {t === 5 && (
            <path
              d="M 37 17 L 39 14 L 41 17 L 44 13 L 46 17 L 50 11 L 54 17 L 56 13 L 59 17 L 61 14 L 63 17"
              fill="none"
              stroke={p.accent}
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Emblem */}
          {showEmblem && renderEmblem(emblemId!, 50, 26, p.accent)}

          {/* Diamond side accents — tier 4+ */}
          {t >= 4 && (
            <>
              <path d="M 19 68 L 22 71 L 19 74 L 16 71 Z" fill={p.accent} opacity={0.6} />
              <path d="M 81 68 L 84 71 L 81 74 L 78 71 Z" fill={p.accent} opacity={0.6} />
            </>
          )}
        </>
      )}

      {/* Level number */}
      <text
        x="50"
        y={numY}
        textAnchor="middle"
        fontFamily="'Rajdhani','Arial Narrow',sans-serif"
        fontWeight="700"
        fontSize={numFontSize}
        fill={p.text}
        filter={t >= 4 && showDetails ? `url(#${uid}glow)` : undefined}
      >
        {lvl}
      </text>

      {/* Stars */}
      {Array.from({ length: stars }, (_, i) => (
        <path
          key={i}
          d={makeStar(sx0 + i * SS, 88, SR)}
          fill={p.star}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}
