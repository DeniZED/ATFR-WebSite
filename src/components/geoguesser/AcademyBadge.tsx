'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import type { LevelInfo } from '@/features/geoguesser/playerProfile';

interface AcademyBadgeProps {
  levelInfo: LevelInfo;
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

const PALETTE: Record<Tier, {
  bg1: string; bg2: string; stroke: string;
  accent: string; text: string; star: string;
}> = {
  // Tier 1 — Olive vert (Recrue → Caporal)
  1: { bg1: '#28381A', bg2: '#1A2610', stroke: '#4A6030', accent: '#7A9060', text: '#A8C088', star: '#7A9060' },
  // Tier 2 — Acier (Sergent → Lieutenant)
  2: { bg1: '#2E3848', bg2: '#1E2834', stroke: '#60707E', accent: '#8A9AAA', text: '#BCC8D2', star: '#8A9AAA' },
  // Tier 3 — Bronze doré (Capitaine → Colonel)
  3: { bg1: '#3A2C10', bg2: '#26180A', stroke: '#C9A227', accent: '#E0B84A', text: '#F0D870', star: '#C9A227' },
  // Tier 4 — Marine + platine (Général → Maréchal)
  4: { bg1: '#1C1C38', bg2: '#0E0E24', stroke: '#C9A227', accent: '#C8C8EE', text: '#E0E0F8', star: '#C9A227' },
  // Tier 5 — Noir ATFR + or (As → Légende)
  5: { bg1: '#101C2C', bg2: '#080F18', stroke: '#C9A227', accent: '#C9A227', text: '#F5DC80', star: '#C9A227' },
};

// Classic heraldic shield
const SHIELD_PATH  = 'M 50 6 L 91 22 L 91 70 Q 91 97 50 114 Q 9 97 9 70 L 9 22 Z';
const SHIELD_INNER = 'M 50 11 L 86 26 L 86 69 Q 86 92 50 108 Q 14 92 14 69 L 14 26 Z';

function makeStar(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

export function AcademyBadge({ levelInfo, size = 80, className }: AcademyBadgeProps) {
  const uid = 'b' + useId().replace(/:/g, '_');
  const t = getTier(levelInfo.level);
  const p = PALETTE[t];
  const stars = getStarCount(levelInfo.level);
  const lvl = levelInfo.level;

  const w = size;
  const h = Math.round(size * VH / VW);
  const numFontSize = lvl >= 10 ? 32 : 36;
  const numY = stars > 0 ? 71 : 76;

  const SR = 4.5;    // star outer radius
  const SS = 11;     // star centre spacing
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

      {/* ATFR label */}
      <text
        x="50"
        y="32"
        textAnchor="middle"
        fontFamily="'Rajdhani','Arial Narrow',sans-serif"
        fontWeight="700"
        fontSize={t >= 3 ? 11 : 10}
        fill={p.accent}
        letterSpacing={t >= 4 ? '3' : '2.5'}
      >
        ATFR
      </text>

      {/* Level number */}
      <text
        x="50"
        y={numY}
        textAnchor="middle"
        fontFamily="'Rajdhani','Arial Narrow',sans-serif"
        fontWeight="700"
        fontSize={numFontSize}
        fill={p.text}
        filter={t >= 4 ? `url(#${uid}glow)` : undefined}
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

      {/* Diamond side accents — tier 4+ */}
      {t >= 4 && (
        <>
          <path d="M 19 68 L 22 71 L 19 74 L 16 71 Z" fill={p.accent} opacity={0.6} />
          <path d="M 81 68 L 84 71 L 81 74 L 78 71 Z" fill={p.accent} opacity={0.6} />
        </>
      )}
    </svg>
  );
}
