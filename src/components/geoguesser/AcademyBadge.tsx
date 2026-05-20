'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import {
  getPrimaryColor,
  getAccentColor,
  type LevelInfo,
} from '@/features/geoguesser/playerProfile';

// ─── ViewBox ──────────────────────────────────────────────────────────────────
const VW = 160;
const VH = 190;

// ─── Types ────────────────────────────────────────────────────────────────────
interface AcademyBadgeProps {
  levelInfo: LevelInfo;
  primaryColorId?: string;
  accentColorId?: string | null;
  emblemId?: string | null;
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

// ─── Chiffres romains ─────────────────────────────────────────────────────────
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
function toRoman(n: number): string { return ROMAN[(n - 1)] ?? String(n); }

// ─── Couleurs ─────────────────────────────────────────────────────────────────
function lighten(hex: string, f: number): string {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) + f * 255));
  const g = Math.min(255, Math.round(((n >> 8)  & 255) + f * 255));
  const b = Math.min(255, Math.round((n          & 255) + f * 255));
  return `#${[r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')}`;
}
function darken(hex: string, f: number): string { return lighten(hex, -f); }

// Couleur d'accent par défaut selon le tier (si aucun accent choisi)
const TIER_DEFAULT_ACCENT: Record<Tier, string> = {
  1: '#A0B080',
  2: '#9AAAB8',
  3: '#C9A227',
  4: '#C9A227',
  5: '#C9A227',
};

// ─── Forme du bouclier baroque ────────────────────────────────────────────────
// Shield centré sur (80, 82), de y=14 à y=155, x de 22 à 138
const SX = 80; // centre X

// Baroque shield path
const SHIELD = [
  `M ${SX} 14`,
  `C 95 14 135 26 138 38`,     // top-right
  `C 140 50 136 58 134 64`,    // upper-right side (slight baroque bow)
  `C 132 70 136 76 138 84`,    // baroque notch right
  `C 140 92 138 108 130 122`,  // lower-right
  `Q 120 142 ${SX} 155`,       // bottom-right to point
  `Q 40 142 30 122`,           // bottom-left from point
  `C 22 108 20 92 22 84`,      // lower-left
  `C 24 76 28 70 26 64`,       // baroque notch left
  `C 24 58 20 50 22 38`,       // upper-left side
  `C 25 26 65 14 ${SX} 14`,    // top-left
  'Z',
].join(' ');

// Inner frame path (slightly inset)
const SHIELD_INNER = [
  `M ${SX} 20`,
  `C 93 20 128 30 131 40`,
  `C 133 50 129 58 127 64`,
  `C 125 70 129 76 131 83`,
  `C 133 91 131 106 124 118`,
  `Q 115 136 ${SX} 148`,
  `Q 45 136 36 118`,
  `C 29 106 27 91 29 83`,
  `C 31 76 35 70 33 64`,
  `C 31 58 27 50 29 40`,
  `C 32 30 67 20 ${SX} 20`,
  'Z',
].join(' ');

// ─── Star path ────────────────────────────────────────────────────────────────
function makeStar(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

// ─── Feuille de laurier ───────────────────────────────────────────────────────
function leafPath(cx: number, cy: number, angle: number, size: number): string {
  const a = angle * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const pts = [
    [0, 0], [size*0.3, -size*0.5], [size*0.5, -size],
    [size*0.2, -size*1.3], [0, -size*1.5],
    [-size*0.2, -size*1.3], [-size*0.3, -size*0.8],
    [-size*0.1, -size*0.3],
  ].map(([x, y]) => {
    const rx = (x ?? 0) * cos - (y ?? 0) * sin + cx;
    const ry = (x ?? 0) * sin + (y ?? 0) * cos + cy;
    return `${rx.toFixed(1)},${ry.toFixed(1)}`;
  });
  return `M ${pts[0]} C ${pts[1]} ${pts[2]} ${pts[3]} C ${pts[4]} ${pts[5]} ${pts[6]} ${pts[7]} Z`;
}

// ─── Emblème ──────────────────────────────────────────────────────────────────
function renderEmblem(id: string, cx: number, cy: number, color: string): React.ReactElement | null {
  switch (id) {
    case 'emb-crosshair':
      return (
        <g stroke={color} fill="none" strokeLinecap="round" opacity={0.9}>
          <circle cx={cx} cy={cy} r={7} strokeWidth={1.2} />
          <line x1={cx} y1={cy-11} x2={cx} y2={cy-8} strokeWidth={1.2} />
          <line x1={cx} y1={cy+8} x2={cx} y2={cy+11} strokeWidth={1.2} />
          <line x1={cx-11} y1={cy} x2={cx-8} y2={cy} strokeWidth={1.2} />
          <line x1={cx+8} y1={cy} x2={cx+11} y2={cy} strokeWidth={1.2} />
        </g>
      );
    case 'emb-star':
      return <path d={makeStar(cx, cy, 9)} fill={color} opacity={0.9} />;
    case 'emb-bolt':
      return (
        <path
          d={`M ${cx+3} ${cy-11} L ${cx-4} ${cy-1} L ${cx+2} ${cy-1} L ${cx-4} ${cy+11} L ${cx+6} ${cy+1} L ${cx+1} ${cy+1} Z`}
          fill={color} opacity={0.9}
        />
      );
    case 'emb-diamond':
      return (
        <g opacity={0.9}>
          <path d={`M ${cx} ${cy-11} L ${cx+8} ${cy} L ${cx} ${cy+11} L ${cx-8} ${cy} Z`}
                fill="none" stroke={color} strokeWidth={1.2} />
          <path d={`M ${cx} ${cy-6} L ${cx+4.5} ${cy} L ${cx} ${cy+6} L ${cx-4.5} ${cy} Z`}
                fill={color} opacity={0.3} />
        </g>
      );
    case 'emb-compass':
      return (
        <g opacity={0.9}>
          <path d={`M ${cx} ${cy-12} L ${cx+2.5} ${cy-3} L ${cx} ${cy} L ${cx-2.5} ${cy-3} Z`} fill={color} />
          <path d={`M ${cx} ${cy+12} L ${cx+2.5} ${cy+3} L ${cx} ${cy} L ${cx-2.5} ${cy+3} Z`}
                fill="none" stroke={color} strokeWidth={1} />
          <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth={1} />
        </g>
      );
    default: return null;
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────
export function AcademyBadge({
  levelInfo,
  primaryColorId = 'col-olive',
  accentColorId = null,
  emblemId = null,
  size = 80,
  className,
}: AcademyBadgeProps) {
  const uid = 'b' + useId().replace(/:/g, '_');
  const t = getTier(levelInfo.level);
  const stars = getStarCount(levelInfo.level);
  const lvl = levelInfo.level;

  // Couleurs
  const primaryDef = getPrimaryColor(primaryColorId);
  const accentDef  = getAccentColor(accentColorId ?? null);
  const base   = primaryDef.hex;
  const accent = accentDef?.hex ?? TIER_DEFAULT_ACCENT[t];
  const isMetallic = primaryDef.metallic || accentDef?.metallic;

  const bg1 = lighten(base, 0.08);
  const bg2 = base;
  const bg3 = darken(base, 0.12);
  const bg4 = darken(base, 0.22);

  const borderLight = lighten(accent, 0.25);
  const borderDark  = darken(accent, 0.30);

  const w = size;
  const h = Math.round(size * VH / VW);

  const showDetails  = size >= 50;
  const showOrnaments= size >= 80;
  const showEmblem   = size >= 65 && !!emblemId;

  // Taille polices
  const roman = toRoman(lvl);
  const numFontSize = roman.length <= 2 ? 34 : roman.length <= 4 ? 28 : 22;

  // Stars layout (centrées, zone y≈130-140)
  const SR = 5.5, SS = 14;
  const sx0 = SX - ((stars - 1) * SS) / 2;

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
        {/* Gradient principal (effet convexe 3D) */}
        <radialGradient id={`${uid}bg`} cx="42%" cy="32%" r="65%" fx="38%" fy="28%">
          <stop offset="0%"   stopColor={lighten(base, 0.22)} />
          <stop offset="30%"  stopColor={bg1} />
          <stop offset="60%"  stopColor={bg2} />
          <stop offset="85%"  stopColor={bg3} />
          <stop offset="100%" stopColor={bg4} />
        </radialGradient>

        {/* Reflet highlight (arc lumineux en haut) */}
        <radialGradient id={`${uid}hl`} cx="50%" cy="15%" r="50%" fx="50%" fy="10%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Gradient médaillon (effet pièce) */}
        <radialGradient id={`${uid}med`} cx="38%" cy="32%" r="70%">
          <stop offset="0%"   stopColor={lighten(base, 0.35)} />
          <stop offset="40%"  stopColor={lighten(base, 0.15)} />
          <stop offset="100%" stopColor={darken(base, 0.25)} />
        </radialGradient>

        {/* Gradient étoile */}
        <radialGradient id={`${uid}star`} cx="35%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={lighten(accent, 0.40)} />
          <stop offset="60%"  stopColor={accent} />
          <stop offset="100%" stopColor={darken(accent, 0.30)} />
        </radialGradient>

        {/* Gradient feuille laurier */}
        <linearGradient id={`${uid}leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={lighten(accent, 0.20)} />
          <stop offset="100%" stopColor={darken(accent, 0.35)} />
        </linearGradient>

        {/* Gradient lame épée */}
        <linearGradient id={`${uid}blade`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={darken(accent, 0.20)} />
          <stop offset="40%"  stopColor={lighten(accent, 0.30)} />
          <stop offset="60%"  stopColor={lighten(accent, 0.50)} />
          <stop offset="100%" stopColor={darken(accent, 0.20)} />
        </linearGradient>

        {/* Filter specular (rendu métal) */}
        {(t >= 3 || isMetallic) && (
          <filter id={`${uid}spec`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="6" specularConstant="0.8"
                                specularExponent={isMetallic ? 40 : 20} result="spec">
              <fePointLight x="60" y="30" z="120" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
            <feBlend in="SourceGraphic" in2="specClip" mode="screen" />
          </filter>
        )}

        {/* Filter ombre portée */}
        <filter id={`${uid}shadow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.45" />
        </filter>

        {/* Filter glow (tier 4-5) */}
        {t >= 4 && (
          <filter id={`${uid}glow`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}

        {/* Clip path bouclier (pour confiner les éléments internes) */}
        <clipPath id={`${uid}clip`}>
          <path d={SHIELD} />
        </clipPath>
      </defs>

      {/* ── RAYONS DE GLOIRE (tier 5, fond) ── */}
      {showOrnaments && t === 5 && (
        <g opacity={0.35}>
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i * 22.5 - 90) * Math.PI / 180;
            const r1 = 55, r2 = i % 2 === 0 ? 95 : 78;
            return (
              <line key={i}
                x1={SX + r1 * Math.cos(angle)} y1={85 + r1 * Math.sin(angle)}
                x2={SX + r2 * Math.cos(angle)} y2={85 + r2 * Math.sin(angle)}
                stroke={accent} strokeWidth={i % 2 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* ── ÉPÉES CROISÉES (tier 4+, derrière le bouclier) ── */}
      {showOrnaments && t >= 4 && (
        <g opacity={0.75}>
          {/* Épée gauche (de bas-gauche vers haut-droite) */}
          <g transform={`rotate(-38, ${SX}, 85)`}>
            {/* Lame */}
            <rect x={SX-3} y={20} width={6} height={90} rx={1}
                  fill={`url(#${uid}blade)`} />
            {/* Garde */}
            <rect x={SX-16} y={108} width={32} height={5} rx={2}
                  fill={accent} />
            {/* Pommeau */}
            <ellipse cx={SX} cy={117} rx={7} ry={5}
                     fill={lighten(accent, 0.20)} />
          </g>
          {/* Épée droite (de bas-droite vers haut-gauche) */}
          <g transform={`rotate(38, ${SX}, 85)`}>
            <rect x={SX-3} y={20} width={6} height={90} rx={1}
                  fill={`url(#${uid}blade)`} />
            <rect x={SX-16} y={108} width={32} height={5} rx={2}
                  fill={accent} />
            <ellipse cx={SX} cy={117} rx={7} ry={5}
                     fill={lighten(accent, 0.20)} />
          </g>
        </g>
      )}

      {/* ── LAURIER (tier 3+, derrière le bouclier) ── */}
      {showOrnaments && t >= 3 && (() => {
        const leafCount = t === 3 ? 5 : t === 4 ? 7 : 9;
        const leaves: React.ReactElement[] = [];
        // Parametric: stem part follows the shield outline
        for (let i = 0; i < leafCount; i++) {
          const frac = i / (leafCount - 1); // 0 → 1
          // Right branch: from bottom (80,150) up to top-right (130, 35)
          const rx = SX + (50 * frac) + 5;
          const ry = 150 - (115 * frac);
          const rAngle = -30 - frac * 100;
          // Left branch: mirror
          const lx = SX - (50 * frac) - 5;
          const ly = ry;
          const lAngle = 30 + frac * 100;
          leaves.push(
            <path key={`r${i}`} d={leafPath(rx, ry, rAngle, 8)}
                  fill={`url(#${uid}leaf)`} opacity={0.85} />,
            <path key={`l${i}`} d={leafPath(lx, ly, lAngle, 8)}
                  fill={`url(#${uid}leaf)`} opacity={0.85} />,
          );
        }
        return <g>{leaves}</g>;
      })()}

      {/* ── BOUCLIER : ombre portée ── */}
      {t >= 2 && (
        <path d={SHIELD} fill={darken(base, 0.40)} opacity={0.4}
              transform="translate(2.5, 4)" />
      )}

      {/* ── BOUCLIER : corps principal ── */}
      <path
        d={SHIELD}
        fill={`url(#${uid}bg)`}
        filter={(t >= 3 || isMetallic) ? `url(#${uid}spec)` : undefined}
      />

      {/* ── BOUCLIER : reflet highlight ── */}
      <path d={SHIELD} fill={`url(#${uid}hl)`} />

      {/* ── BOUCLIER : bord biseauté (effet 3D) ── */}
      {showDetails && (
        <>
          {/* Ombre du bord (côté bas-droit) */}
          <path d={SHIELD} fill="none" stroke={borderDark}
                strokeWidth={t >= 3 ? 3.5 : 2.5} opacity={0.7} />
          {/* Lumière du bord (côté haut-gauche) */}
          <path d={SHIELD} fill="none" stroke={borderLight}
                strokeWidth={1.2} opacity={0.65} />
        </>
      )}

      {/* ── CONTENU INTERNE (clipé dans le bouclier) ── */}
      <g clipPath={`url(#${uid}clip)`}>

        {/* Cadre intérieur (tier 2+) */}
        {showDetails && t >= 2 && (
          <path d={SHIELD_INNER} fill="none" stroke={accent}
                strokeWidth={0.8} opacity={0.45} />
        )}

        {/* Ligne séparatrice haute (tier 2+) */}
        {showDetails && t >= 2 && (
          <line x1={32} y1={54} x2={128} y2={54}
                stroke={accent} strokeWidth={0.8} opacity={0.55} />
        )}

        {/* Rivets (tier 2 seulement) */}
        {showDetails && t === 2 && (
          [0, 1, 2, 3, 4, 5, 6].map((_, i) => {
            // Rivets along the inner frame perimeter (approximated positions)
            const angles = [225, 250, 270, 290, 315, 190, 170];
            const a = (angles[i] ?? 0) * Math.PI / 180;
            const r = 51;
            const cx = SX + r * Math.cos(a);
            const cy = 85 + r * Math.sin(a);
            return (
              <circle key={i} cx={cx} cy={cy} r={2.2}
                      fill={darken(accent, 0.10)}
                      stroke={lighten(accent, 0.30)} strokeWidth={0.6} />
            );
          })
        )}

        {/* Couronne (tier 5) */}
        {showDetails && t === 5 && (
          <g>
            {/* Base de la couronne */}
            <path
              d={`M ${SX-18} 42 L ${SX-18} 30 L ${SX-12} 22 L ${SX-6} 30 L ${SX} 20 L ${SX+6} 30 L ${SX+12} 22 L ${SX+18} 30 L ${SX+18} 42 Z`}
              fill={accent}
              stroke={borderLight} strokeWidth={0.8}
            />
            {/* Gems sur les pointes */}
            {([[SX-12, 22], [SX, 20], [SX+12, 22]] as [number, number][]).map(([gx, gy], i) => (
              <circle key={i} cx={gx} cy={gy} r={3.5}
                      fill={i === 1 ? '#E0A0A0' : '#A0A0E0'}
                      stroke={lighten(accent, 0.40)} strokeWidth={0.6} />
            ))}
            {/* Reflet couronne */}
            <path
              d={`M ${SX-18} 42 L ${SX-18} 30 L ${SX-12} 22`}
              fill="none" stroke="white" strokeWidth={0.7} opacity={0.4}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Emblème (dans la zone haute, y≈38) */}
        {showEmblem && emblemId && renderEmblem(emblemId, SX, 38, accent)}

        {/* Médaillon central (tier 3+) */}
        {showDetails && t >= 3 && (
          <circle cx={SX} cy={90} r={28}
                  fill={`url(#${uid}med)`}
                  stroke={accent} strokeWidth={0.8} opacity={0.4} />
        )}

        {/* Chiffre romain */}
        <text
          x={SX}
          y={stars > 0 ? 98 : 104}
          textAnchor="middle"
          fontFamily="'Rajdhani','Georgia','Times New Roman',serif"
          fontWeight="700"
          fontSize={numFontSize}
          fill={lighten(base, 0.55)}
          filter={t >= 4 ? `url(#${uid}glow)` : undefined}
          letterSpacing="1"
        >
          {roman}
        </text>

        {/* Ombre portée sous le chiffre (effet gravé) */}
        {showDetails && (
          <text
            x={SX + 0.8}
            y={(stars > 0 ? 98 : 104) + 1}
            textAnchor="middle"
            fontFamily="'Rajdhani','Georgia','Times New Roman',serif"
            fontWeight="700"
            fontSize={numFontSize}
            fill={darken(base, 0.40)}
            opacity={0.5}
            letterSpacing="1"
            aria-hidden
          >
            {roman}
          </text>
        )}

      </g>

      {/* ── ÉTOILES (en dessous du bouclier, devant tout) ── */}
      {Array.from({ length: stars }, (_, i) => (
        <path
          key={i}
          d={makeStar(sx0 + i * SS, 165, SR)}
          fill={`url(#${uid}star)`}
          filter={t >= 4 ? `url(#${uid}glow)` : undefined}
        />
      ))}

      {/* ── BANNIÈRE (tier 3+) ── */}
      {showOrnaments && t >= 3 && levelInfo.title && (
        <g>
          {/* Corps du ruban */}
          <path
            d={`M 25 173 C 20 170 18 175 22 178 L 60 178 Q 80 176 100 178 L 138 178 C 142 175 140 170 135 173 L 100 176 Q 80 178 60 176 Z`}
            fill={darken(accent, 0.25)}
            stroke={accent} strokeWidth={0.7}
          />
          {/* Replis du ruban (côtés) */}
          <path d={`M 22 178 L 18 183 L 30 181 Z`} fill={darken(accent, 0.40)} />
          <path d={`M 138 178 L 142 183 L 130 181 Z`} fill={darken(accent, 0.40)} />
          {/* Texte du titre */}
          <text
            x={SX} y={176}
            textAnchor="middle"
            fontFamily="'Rajdhani','Arial Narrow',sans-serif"
            fontWeight="600"
            fontSize={8}
            fill={lighten(accent, 0.50)}
            letterSpacing="1.5"
          >
            {levelInfo.title.toUpperCase().slice(0, 18)}
          </text>
        </g>
      )}
    </svg>
  );
}
