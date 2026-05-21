'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import {
  getPrimaryColor,
  getAccentColor,
  resolveColor,
  type LevelInfo,
} from '@/features/geoguesser/playerProfile';

// ─── ViewBox ──────────────────────────────────────────────────────────────────
const VW = 160;
const VH = 190;
const SX = 80; // shield center X

// ─── Props ────────────────────────────────────────────────────────────────────
interface AcademyBadgeProps {
  levelInfo: LevelInfo;
  primaryColorId?: string;
  accentColorId?: string | null;
  numeralColorId?: string | null;
  emblemId?: string | null;
  emblemColorId?: string | null;
  patternId?: string | null;
  borderStyleId?: string;
  size?: number;
  className?: string;
}

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

// ─── Roman numerals ───────────────────────────────────────────────────────────
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
function toRoman(n: number): string { return ROMAN[n - 1] ?? String(n); }

// ─── Colour helpers ───────────────────────────────────────────────────────────
function lighten(hex: string, f: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `#${[
    Math.min(255, Math.round(r + (255 - r) * f)),
    Math.min(255, Math.round(g + (255 - g) * f)),
    Math.min(255, Math.round(b + (255 - b) * f)),
  ].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}
function darken(hex: string, f: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `#${[
    Math.round(r * (1 - f)),
    Math.round(g * (1 - f)),
    Math.round(b * (1 - f)),
  ].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Metallic type from color id — drives specular parameters
type MetallicType = 'gold' | 'silver' | 'bronze' | 'iron' | null;
function getMetallicType(primaryId: string, accentId: string | null): MetallicType {
  const ids = [primaryId, accentId].filter(Boolean).join(' ');
  if (/col-gold|col-bronze|acc-gold|acc-brass|acc-copper|acc-iridescent/.test(ids)) return 'gold';
  if (/col-silver|col-chrome|acc-silver|acc-platinum|acc-ivory/.test(ids)) return 'silver';
  if (/col-iron/.test(ids)) return 'iron';
  if (/col-prestige|col-void/.test(ids)) return 'iron';
  return null;
}

function specularExponent(mt: MetallicType, tier: Tier): number {
  if (mt === 'silver') return 80;
  if (mt === 'gold')   return 48;
  if (mt === 'bronze') return 36;
  if (mt === 'iron')   return 22;
  return tier >= 4 ? 28 : 18;
}

// Default accent per tier (used when no accent selected)
const TIER_DEFAULT_ACCENT: Record<Tier, string> = {
  1: '#9AAA88',
  2: '#8899AA',
  3: '#C9A227',
  4: '#C9A227',
  5: '#D4AF37',
};

// ─── WoT octagonal shield ────────────────────────────────────────────────────
// Derived from the official World of Tanks SVG (viewBox 0 0 24 43).
// Outer contour: first sub-path uniformly scaled to y=[12,164], centred at x=80.
//   scale=4.606, offset=(+24.73, -11.03)
const SHIELD = 'M 80.1 164 L 25.3 110 L 25.3 41.1 L 54.7 12 L 106 12 L 134.7 40.4 L 134.7 110 Z';

// Inner frame: second sub-path, same scale/offset
const SHIELD_INNER = 'M 128.9 42.6 L 103.2 17.3 L 57.4 17.3 L 31.2 43.2 L 31.2 107.3 L 80.1 155.5 L 128.9 107.3 Z';

// ─── Star helper ──────────────────────────────────────────────────────────────
function makeStar(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// ─── Leaf helper ──────────────────────────────────────────────────────────────
// Proper oval leaf: base at (cx,cy), growing in the direction of `angle` (0=up)
function leafSVG(cx: number, cy: number, angle: number, w: number, h: number): string {
  const rad = angle * (Math.PI / 180);
  const ux = Math.sin(rad), uy = -Math.cos(rad);   // "up" direction
  const rx = Math.cos(rad), ry =  Math.sin(rad);   // "right" direction
  const p = (lx: number, ly: number) =>
    `${(cx + lx * rx + ly * ux).toFixed(1)} ${(cy + lx * ry + ly * uy).toFixed(1)}`;
  return [
    `M ${p(0, 0)}`,
    `C ${p(-w * 0.2, h * 0.08)} ${p(-w, h * 0.22)} ${p(-w, h * 0.42)}`,
    `C ${p(-w, h * 0.64)} ${p(-w * 0.25, h * 0.86)} ${p(0, h)}`,
    `C ${p(w * 0.25, h * 0.86)} ${p(w, h * 0.64)} ${p(w, h * 0.42)}`,
    `C ${p(w, h * 0.22)} ${p(w * 0.2, h * 0.08)} ${p(0, 0)}`,
    'Z',
  ].join(' ');
}

// Midrib line along the leaf axis
function midribSVG(cx: number, cy: number, angle: number, h: number): string {
  const rad = angle * (Math.PI / 180);
  const x2 = (cx + h * 0.88 * Math.sin(rad)).toFixed(1);
  const y2 = (cy - h * 0.88 * Math.cos(rad)).toFixed(1);
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x2} ${y2}`;
}

// ─── Emblem renderer ──────────────────────────────────────────────────────────
function renderEmblem(id: string, cx: number, cy: number, col: string): React.ReactElement | null {
  switch (id) {
    case 'emb-crosshair':
      return (
        <g stroke={col} fill="none" strokeLinecap="round" opacity={0.9}>
          <circle cx={cx} cy={cy} r={7} strokeWidth={1.2} />
          <line x1={cx} y1={cy - 11} x2={cx} y2={cy - 8}  strokeWidth={1.2} />
          <line x1={cx} y1={cy + 8}  x2={cx} y2={cy + 11} strokeWidth={1.2} />
          <line x1={cx - 11} y1={cy} x2={cx - 8}  y2={cy} strokeWidth={1.2} />
          <line x1={cx + 8}  y1={cy} x2={cx + 11} y2={cy} strokeWidth={1.2} />
        </g>
      );
    case 'emb-star':
      return <path d={makeStar(cx, cy, 9)} fill={col} opacity={0.9} />;
    case 'emb-bolt':
      return (
        <path
          d={`M ${cx+3} ${cy-11} L ${cx-4} ${cy-1} L ${cx+2} ${cy-1} L ${cx-4} ${cy+11} L ${cx+6} ${cy+1} L ${cx+1} ${cy+1} Z`}
          fill={col} opacity={0.9}
        />
      );
    case 'emb-diamond':
      return (
        <g opacity={0.9}>
          <path d={`M ${cx} ${cy-11} L ${cx+8} ${cy} L ${cx} ${cy+11} L ${cx-8} ${cy} Z`}
                fill="none" stroke={col} strokeWidth={1.2} />
          <path d={`M ${cx} ${cy-6} L ${cx+4.5} ${cy} L ${cx} ${cy+6} L ${cx-4.5} ${cy} Z`}
                fill={col} opacity={0.3} />
        </g>
      );
    case 'emb-compass':
      return (
        <g opacity={0.9}>
          <path d={`M ${cx} ${cy-12} L ${cx+2.5} ${cy-3} L ${cx} ${cy} L ${cx-2.5} ${cy-3} Z`} fill={col} />
          <path d={`M ${cx} ${cy+12} L ${cx+2.5} ${cy+3} L ${cx} ${cy} L ${cx-2.5} ${cy+3} Z`}
                fill="none" stroke={col} strokeWidth={1} />
          <circle cx={cx} cy={cy} r={4} fill="none" stroke={col} strokeWidth={1} />
        </g>
      );
    default: return null;
  }
}

// ─── Sword renderer ───────────────────────────────────────────────────────────
// Both swords share the same design, just rotated ±38° around the shield center.
function renderSword(
  rotSign: 1 | -1,
  uid: string,
  accent: string,
  bLight: string,
  bDark: string,
): React.ReactElement {
  const G = 106; // guard Y position (unrotated)
  const TIP = 18; // blade tip Y
  const POMMEL_Y = 122;

  return (
    <g transform={`rotate(${rotSign * 38}, ${SX}, 85)`} key={rotSign}>
      {/* Blade — tapered polygon */}
      <polygon
        points={`${SX},${TIP} ${SX + 3.8},${G} ${SX - 3.8},${G}`}
        fill={`url(#${uid}blade)`}
      />
      {/* Fuller (centre groove) */}
      <line x1={SX} y1={TIP + 10} x2={SX} y2={G - 6}
            stroke={bDark} strokeWidth={0.8} opacity={0.55} />
      {/* Blade edge highlight */}
      <line x1={SX - 3.4} y1={TIP + 6} x2={SX - 3.8} y2={G}
            stroke={bLight} strokeWidth={0.4} opacity={0.45} />
      {/* Cross-guard — curved with ball ends */}
      <path
        d={`M ${SX - 18} ${G + 1} C ${SX - 16} ${G - 3},${SX - 5} ${G - 1},${SX} ${G - 1} C ${SX + 5} ${G - 1},${SX + 16} ${G - 3},${SX + 18} ${G + 1} C ${SX + 16} ${G + 4},${SX + 5} ${G + 3},${SX} ${G + 3} C ${SX - 5} ${G + 3},${SX - 16} ${G + 4},${SX - 18} ${G + 1} Z`}
        fill={accent}
        stroke={bLight} strokeWidth={0.5}
      />
      <circle cx={SX - 18} cy={G + 1} r={2.8} fill={bLight} />
      <circle cx={SX + 18} cy={G + 1} r={2.8} fill={bLight} />
      {/* Grip */}
      <rect x={SX - 3} y={G + 3} width={6} height={13} rx={1.5}
            fill={darken(accent, 0.40)} />
      {/* Grip wrapping lines */}
      {([G + 6, G + 9, G + 12] as number[]).map((gy) => (
        <line key={gy} x1={SX - 3} y1={gy} x2={SX + 3} y2={gy}
              stroke={bLight} strokeWidth={0.6} opacity={0.35} />
      ))}
      {/* Pommel */}
      <ellipse cx={SX} cy={POMMEL_Y} rx={7} ry={5.2}
               fill={accent} stroke={bLight} strokeWidth={0.5} />
      <ellipse cx={SX - 1} cy={POMMEL_Y - 1} rx={3} ry={2.2}
               fill={bLight} opacity={0.35} />
    </g>
  );
}

// ─── Crown renderer (tier 5) ─────────────────────────────────────────────────
// 5-point heraldic crown centred at SX, band base at baseY
function renderCrown(
  baseY: number,
  accent: string,
  bLight: string,
  bDark: string,
): React.ReactElement {
  const bTop = baseY - 7;   // top of band
  const bBot = baseY;       // bottom of band
  // 5 tips: [tall, short, tall(center), short, tall]
  const tips = [
    { x: SX - 22, y: bTop - 21, tall: true },
    { x: SX - 11, y: bTop - 13, tall: false },
    { x: SX,      y: bTop - 26, tall: true },
    { x: SX + 11, y: bTop - 13, tall: false },
    { x: SX + 22, y: bTop - 21, tall: true },
  ];

  // Build crown silhouette path
  let d = `M ${SX - 26} ${bBot} L ${SX - 26} ${bTop}`;
  for (const tip of tips) {
    const hw = tip.tall ? 4.5 : 3;
    d += ` L ${tip.x - hw} ${bTop}`;
    d += ` C ${tip.x - hw} ${tip.y + 8},${tip.x - 2} ${tip.y + 2},${tip.x} ${tip.y}`;
    d += ` C ${tip.x + 2} ${tip.y + 2},${tip.x + hw} ${tip.y + 8},${tip.x + hw} ${bTop}`;
  }
  d += ` L ${SX + 26} ${bTop} L ${SX + 26} ${bBot} Z`;

  return (
    <g>
      <path d={d} fill={accent} stroke={bDark} strokeWidth={0.6} />
      {/* Band highlight */}
      <rect x={SX - 26} y={bTop} width={52} height={3} rx={0}
            fill={bLight} opacity={0.25} />
      {/* Band bottom shadow */}
      <rect x={SX - 26} y={bTop + 4} width={52} height={3} rx={0}
            fill={bDark} opacity={0.30} />
      {/* Gems at tall point tips */}
      {tips.filter(t => t.tall).map((tip, i) => (
        <g key={i}>
          <circle cx={tip.x} cy={tip.y} r={3.8}
                  fill={i === 1 ? '#D8686880' : '#6868C880'}
                  stroke={bLight} strokeWidth={0.6} />
          <circle cx={tip.x - 1} cy={tip.y - 1} r={1.4}
                  fill="white" opacity={0.45} />
        </g>
      ))}
      {/* Left edge highlight */}
      <path d={`M ${SX - 26} ${bBot} L ${SX - 26} ${bTop} L ${SX - 26 + (tips[0]?.tall ? 4.5 : 3)} ${bTop} L ${tips[0]?.x} ${tips[0]?.y}`}
            fill="none" stroke={bLight} strokeWidth={0.6} opacity={0.35}
            strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AcademyBadge({
  levelInfo,
  primaryColorId = 'col-olive',
  accentColorId = null,
  numeralColorId = null,
  emblemId = null,
  emblemColorId = null,
  patternId = null,
  borderStyleId = 'standard',
  size = 80,
  className,
}: AcademyBadgeProps) {
  const uid = 'b' + useId().replace(/:/g, '_');
  const t = getTier(levelInfo.level);
  const stars = getStarCount(levelInfo.level);
  const lvl = levelInfo.level;

  // Colours
  const primaryDef = getPrimaryColor(primaryColorId);
  const accentDef  = getAccentColor(accentColorId ?? null);
  const base   = primaryDef.hex;
  const accent = accentDef?.hex ?? TIER_DEFAULT_ACCENT[t];

  const mt = getMetallicType(primaryColorId, accentColorId ?? null);
  const isMetallic = mt !== null || primaryDef.metallic || accentDef?.metallic;
  const specExp = specularExponent(mt, t);

  // Gradient colour ramps
  const bg0 = lighten(base, 0.28);
  const bg1 = lighten(base, 0.10);
  const bg2 = base;
  const bg3 = darken(base, 0.16);
  const bg4 = darken(base, 0.30);

  const bLight = lighten(accent, 0.30);
  const bDark  = darken(accent, 0.35);

  const numeralColor = resolveColor(numeralColorId) ?? lighten(base, 0.58);
  const emblemColor  = resolveColor(emblemColorId)  ?? accent;
  const border = borderStyleId as 'none' | 'thin' | 'standard' | 'double';

  const w = size;
  const h = Math.round(size * VH / VW);

  const showDetails   = size >= 50;
  const showOrnaments = size >= 80;
  const showEmblem    = size >= 65 && !!emblemId;

  const roman = toRoman(lvl);
  const numFontSize = roman.length <= 2 ? 34 : roman.length <= 4 ? 28 : 22;

  // Stars row
  const SR = 5.5, SS = 14;
  const sx0 = SX - ((stars - 1) * SS) / 2;

  // ── Laurel leaves along a quadratic bezier branch ─────────────────────────
  function laurelLeaves(isRight: boolean, leafCount: number): React.ReactElement[] {
    const P0 = isRight ? [84, 154] : [76, 154];
    const P1 = isRight ? [156, 88] : [4, 88];
    const P2 = isRight ? [148, 28] : [12, 28];
    const out: React.ReactElement[] = [];
    for (let i = 0; i < leafCount; i++) {
      const t2 = (i + 0.5) / leafCount;
      const bx = (1 - t2) * (1 - t2) * P0[0] + 2 * t2 * (1 - t2) * P1[0] + t2 * t2 * P2[0];
      const by = (1 - t2) * (1 - t2) * P0[1] + 2 * t2 * (1 - t2) * P1[1] + t2 * t2 * P2[1];
      const tx = 2 * (1 - t2) * (P1[0] - P0[0]) + 2 * t2 * (P2[0] - P1[0]);
      const ty = 2 * (1 - t2) * (P1[1] - P0[1]) + 2 * t2 * (P2[1] - P1[1]);
      const branchAngle = Math.atan2(ty, tx) * (180 / Math.PI);
      // Alternate leaf to left/right of branch. Flip direction for left branch.
      const side = (i % 2 === 0 ? 1 : -1) * (isRight ? 1 : -1);
      const leafAngle = branchAngle + side * 72;
      const leafW = 4.2 + i * 0.12;
      const leafH = 8.5 + i * 0.15;
      const opacity = 0.82 + (i / leafCount) * 0.10;
      const fill = leafSVG(bx, by, leafAngle, leafW, leafH);
      const midrib = midribSVG(bx, by, leafAngle, leafH);
      out.push(
        <g key={`${isRight ? 'r' : 'l'}${i}`}>
          <path d={fill} fill={`url(#${uid}leaf)`} opacity={opacity} />
          <path d={midrib} fill="none" stroke={bDark} strokeWidth={0.4} opacity={0.45} />
        </g>,
      );
    }
    return out;
  }

  const leafCount = t === 3 ? 6 : t === 4 ? 8 : 10;

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
        {/* ── Shield body gradient (convex 3D) ── */}
        <radialGradient id={`${uid}bg`} cx="40%" cy="28%" r="68%" fx="36%" fy="22%">
          <stop offset="0%"   stopColor={bg0} />
          <stop offset="22%"  stopColor={bg1} />
          <stop offset="55%"  stopColor={bg2} />
          <stop offset="82%"  stopColor={bg3} />
          <stop offset="100%" stopColor={bg4} />
        </radialGradient>

        {/* ── Top highlight arc ── */}
        <radialGradient id={`${uid}hl`} cx="50%" cy="12%" r="52%" fx="50%" fy="8%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* ── Medallion (inner circle) ── */}
        <radialGradient id={`${uid}med`} cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor={lighten(base, 0.40)} />
          <stop offset="45%"  stopColor={lighten(base, 0.16)} />
          <stop offset="100%" stopColor={darken(base, 0.28)} />
        </radialGradient>

        {/* ── Star gradient ── */}
        <radialGradient id={`${uid}star`} cx="32%" cy="28%" r="72%">
          <stop offset="0%"   stopColor={lighten(accent, 0.45)} />
          <stop offset="55%"  stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.35)} />
        </radialGradient>

        {/* ── Laurel leaf gradient ── */}
        <linearGradient id={`${uid}leaf`} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={lighten(accent, 0.25)} />
          <stop offset="50%"  stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.40)} />
        </linearGradient>

        {/* ── Sword blade gradient ── */}
        <linearGradient id={`${uid}blade`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={darken(accent, 0.22)} />
          <stop offset="35%"  stopColor={lighten(accent, 0.28)} />
          <stop offset="58%"  stopColor={lighten(accent, 0.55)} />
          <stop offset="100%" stopColor={darken(accent, 0.22)} />
        </linearGradient>

        {/* ── Background pattern ── */}
        {patternId && (
          <pattern id={`${uid}pat`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            {patternId === 'pat-hatch' && (
              <line x1="0" y1="8" x2="8" y2="0" stroke={accent} strokeWidth="0.8" opacity="0.4" />
            )}
            {patternId === 'pat-grid' && (
              <>
                <line x1="0" y1="0" x2="0" y2="8" stroke={accent} strokeWidth="0.6" opacity="0.3" />
                <line x1="0" y1="0" x2="8" y2="0" stroke={accent} strokeWidth="0.6" opacity="0.3" />
              </>
            )}
            {patternId === 'pat-dots' && (
              <circle cx="4" cy="4" r="1.2" fill={accent} opacity="0.35" />
            )}
          </pattern>
        )}

        {/* ── Specular lighting (metallic + tier 3+) ── */}
        {(t >= 3 || isMetallic) && (
          <filter id={`${uid}spec`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={isMetallic ? 2.5 : 3} result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale={isMetallic ? 9 : 6}
              specularConstant={isMetallic ? 1.0 : 0.75}
              specularExponent={specExp}
              result="spec"
            >
              <fePointLight x="55" y="25" z="130" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
            <feBlend in="SourceGraphic" in2="specClip" mode="screen" />
          </filter>
        )}

        {/* ── Drop shadow ── */}
        <filter id={`${uid}shadow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.45" />
        </filter>

        {/* ── Glow (tier 4–5) ── */}
        {t >= 4 && (
          <filter id={`${uid}glow`} x="-28%" y="-28%" width="156%" height="156%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}

        {/* ── Shield clip ── */}
        <clipPath id={`${uid}clip`}><path d={SHIELD} /></clipPath>
      </defs>

      {/* ═══ GLORY RAYS — tier 5, background ═══ */}
      {showOrnaments && t === 5 && (
        <g opacity={0.30}>
          {Array.from({ length: 20 }, (_, i) => {
            const ang = (i * 18 - 90) * (Math.PI / 180);
            const r1 = 52, r2 = i % 2 === 0 ? 100 : 80;
            return (
              <line key={i}
                x1={SX + r1 * Math.cos(ang)} y1={88 + r1 * Math.sin(ang)}
                x2={SX + r2 * Math.cos(ang)} y2={88 + r2 * Math.sin(ang)}
                stroke={accent}
                strokeWidth={i % 2 === 0 ? 2.8 : 1.4}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* ═══ CROSSED SWORDS — tier 4+, behind shield ═══ */}
      {showOrnaments && t >= 4 && (
        <g>
          {renderSword(-1, uid, accent, bLight, bDark)}
          {renderSword( 1, uid, accent, bLight, bDark)}
        </g>
      )}

      {/* ═══ LAUREL BRANCHES — tier 3+, behind shield ═══ */}
      {showOrnaments && t >= 3 && (
        <g>
          {laurelLeaves(true,  leafCount)}
          {laurelLeaves(false, leafCount)}
        </g>
      )}

      {/* ═══ SHIELD: drop shadow ═══ */}
      {t >= 2 && (
        <path d={SHIELD} fill={darken(base, 0.45)} opacity={0.38}
              transform="translate(2.5,4)" />
      )}

      {/* ═══ SHIELD: body ═══ */}
      <path
        d={SHIELD}
        fill={`url(#${uid}bg)`}
        filter={(t >= 3 || isMetallic) ? `url(#${uid}spec)` : undefined}
      />

      {/* ═══ SHIELD: highlight arc ═══ */}
      <path d={SHIELD} fill={`url(#${uid}hl)`} />

      {/* ═══ SHIELD: pattern overlay ═══ */}
      {patternId && <path d={SHIELD} fill={`url(#${uid}pat)`} />}

      {/* ═══ SHIELD: bevelled border ═══ */}
      {showDetails && border !== 'none' && (
        <>
          <path d={SHIELD} fill="none" stroke={bDark}
                strokeWidth={border === 'thin' ? 1.5 : border === 'double' ? 6 : (t >= 3 ? 4 : 2.8)}
                opacity={0.65} />
          {border === 'double' && (
            <path d={SHIELD} fill="none" stroke={accent} strokeWidth={3.2} opacity={0.55} />
          )}
          <path d={SHIELD} fill="none" stroke={bLight}
                strokeWidth={border === 'thin' ? 0.8 : 1.4}
                opacity={border === 'thin' ? 0.45 : 0.60} />
        </>
      )}

      {/* ═══ CONTENT clipped to shield ═══ */}
      <g clipPath={`url(#${uid}clip)`}>

        {/* Inner decorative frame (tier 2+) */}
        {showDetails && t >= 2 && (
          <path d={SHIELD_INNER} fill="none" stroke={accent}
                strokeWidth={0.9} opacity={0.40} />
        )}

        {/* Horizontal divider (tier 2+) */}
        {showDetails && t >= 2 && (
          <>
            <line x1={32} y1={55} x2={128} y2={55}
                  stroke={accent} strokeWidth={0.9} opacity={0.50} />
            {/* Corner ornaments at divider ends */}
            <circle cx={32} cy={55} r={2} fill={accent} opacity={0.40} />
            <circle cx={128} cy={55} r={2} fill={accent} opacity={0.40} />
          </>
        )}

        {/* Corner diamonds — tier 3+ */}
        {showDetails && t >= 3 && (
          <>
            {([[37, 38], [123, 38]] as [number, number][]).map(([cx, cy], i) => (
              <path key={i}
                d={`M ${cx} ${cy - 4} L ${cx + 3.5} ${cy} L ${cx} ${cy + 4} L ${cx - 3.5} ${cy} Z`}
                fill={accent} opacity={0.45}
              />
            ))}
          </>
        )}

        {/* Crown (tier 5) */}
        {showDetails && t === 5 && renderCrown(52, accent, bLight, bDark)}

        {/* Emblem (upper zone y≈40) */}
        {showEmblem && emblemId && renderEmblem(emblemId, SX, 40, emblemColor)}

        {/* Medallion ring (tier 3+) */}
        {showDetails && t >= 3 && (
          <>
            <circle cx={SX} cy={92} r={30}
                    fill={`url(#${uid}med)`}
                    stroke={accent} strokeWidth={0.9} opacity={0.38} />
            {/* Medallion inner ring */}
            <circle cx={SX} cy={92} r={26}
                    fill="none"
                    stroke={bLight} strokeWidth={0.4} opacity={0.30} />
          </>
        )}

        {/* Roman numeral — shadow layer */}
        {showDetails && (
          <text
            x={SX + 1} y={(stars > 0 ? 100 : 106) + 1.2}
            textAnchor="middle"
            fontFamily="'Rajdhani','Georgia','Times New Roman',serif"
            fontWeight="700"
            fontSize={numFontSize}
            fill={darken(numeralColor, 0.45)}
            opacity={0.55}
            letterSpacing="1"
            aria-hidden
          >
            {roman}
          </text>
        )}

        {/* Roman numeral — main */}
        <text
          x={SX} y={stars > 0 ? 100 : 106}
          textAnchor="middle"
          fontFamily="'Rajdhani','Georgia','Times New Roman',serif"
          fontWeight="700"
          fontSize={numFontSize}
          fill={numeralColor}
          filter={t >= 4 ? `url(#${uid}glow)` : undefined}
          letterSpacing="1"
        >
          {roman}
        </text>

      </g>

      {/* ═══ STARS ═══ */}
      {Array.from({ length: stars }, (_, i) => (
        <path
          key={i}
          d={makeStar(sx0 + i * SS, 167, SR)}
          fill={`url(#${uid}star)`}
          filter={t >= 4 ? `url(#${uid}glow)` : undefined}
        />
      ))}

      {/* ═══ BANNER — tier 3+ ═══ */}
      {showOrnaments && t >= 3 && levelInfo.title && (
        <g>
          {/* Ribbon body */}
          <path
            d={`M 23 174 C 18 171 16 177 20 179 L 58 179 Q ${SX} 177 102 179 L 140 179 C 144 177 142 171 137 174 L 102 177 Q ${SX} 179 58 177 Z`}
            fill={darken(accent, 0.28)}
            stroke={accent} strokeWidth={0.7}
          />
          {/* Ribbon folds */}
          <path d={`M 20 179 L 15 185 L 28 183 Z`} fill={darken(accent, 0.42)} />
          <path d={`M 140 179 L 145 185 L 132 183 Z`} fill={darken(accent, 0.42)} />
          {/* Title text */}
          <text
            x={SX} y={177.5}
            textAnchor="middle"
            fontFamily="'Rajdhani','Arial Narrow',sans-serif"
            fontWeight="600"
            fontSize={7.5}
            fill={lighten(accent, 0.55)}
            letterSpacing="1.8"
          >
            {levelInfo.title.toUpperCase().slice(0, 20)}
          </text>
        </g>
      )}
    </svg>
  );
}
