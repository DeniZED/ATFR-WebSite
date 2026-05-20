import { motion } from 'framer-motion';
import type { AvatarConfig } from '@/features/geoguesser/playerProfile';
import { cn } from '@/lib/cn';

// ── Isometric projection ─────────────────────────────────────────────────
// +x → lower-right on screen
// +y → lower-left on screen
// +z → up
const SC = 5.5;
const OX = 100;
const OY = 80;

function iso(x: number, y: number, z: number): [number, number] {
  return [
    OX + (x - y) * SC * 0.866,
    OY + (x + y) * SC * 0.5 - z * SC,
  ];
}

function pStr(x: number, y: number, z: number): string {
  const [sx, sy] = iso(x, y, z);
  return `${sx.toFixed(1)},${sy.toFixed(1)}`;
}

function poly(...pts: [number, number, number][]): string {
  return pts.map(([x, y, z]) => pStr(x, y, z)).join(' ');
}

// ── Color helpers ────────────────────────────────────────────────────────
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}
function dk(c: string, f: number): string {
  const [r, g, b] = rgb(c);
  return hex(r * (1 - f), g * (1 - f), b * (1 - f));
}
function lt(c: string, f: number): string {
  const [r, g, b] = rgb(c);
  return hex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

// ── Isometric box (3 visible faces) ─────────────────────────────────────
// x,y,z = back-left-bottom corner; w/d/h = x/y/z dimensions
function IsoBox({
  x, y, z, w, d, h,
  top, side, right,
}: {
  x: number; y: number; z: number; w: number; d: number; h: number;
  top: string; side: string; right: string;
}) {
  const [x2, y2, z2] = [x + w, y + d, z + h];
  return (
    <g>
      {/* y-max face (lower-left on screen) */}
      <polygon points={poly([x, y2, z], [x2, y2, z], [x2, y2, z2], [x, y2, z2])} fill={side} stroke="#0004" strokeWidth="0.4" />
      {/* x-max face (lower-right on screen) */}
      <polygon points={poly([x2, y, z], [x2, y2, z], [x2, y2, z2], [x2, y, z2])} fill={right} stroke="#0004" strokeWidth="0.4" />
      {/* top face */}
      <polygon points={poly([x, y, z2], [x2, y, z2], [x2, y2, z2], [x, y2, z2])} fill={top} stroke="#0003" strokeWidth="0.35" />
    </g>
  );
}

// ── Skin definitions ─────────────────────────────────────────────────────
const SKINS: Record<string, { base: string; track: string; accent?: string }> = {
  default:  { base: '#4e7828', track: '#1c1c1c' },
  desert:   { base: '#b08828', track: '#201a10' },
  winter:   { base: '#9cbcd0', track: '#22303e' },
  urban:    { base: '#586068', track: '#1c1e20' },
  forest:   { base: '#264816', track: '#101410' },
  digital:  { base: '#3c5c32', track: '#181c14' },
  arctic:   { base: '#b8dcf0', track: '#1e2c3c' },
  atfr:     { base: '#1a2a3a', track: '#08101a', accent: '#c9a227' },
  chrome:   { base: '#90acbe', track: '#262626', accent: '#d0e8f4' },
  prestige: { base: '#242424', track: '#0a0a0a', accent: '#c9a227' },
};

// Mapping primaryColorId → internal SKINS key
const COLOR_TO_SKIN: Record<string, string> = {
  'col-olive':    'default',
  'col-forest':   'forest',
  'col-desert':   'desert',
  'col-savanna':  'desert',
  'col-steel':    'urban',
  'col-storm':    'winter',
  'col-teal':     'digital',
  'col-navy':     'atfr',
  'col-burgundy': 'urban',
  'col-purple':   'urban',
  'col-charcoal': 'prestige',
  'col-iron':     'arctic',
  'col-copper':   'desert',
  'col-jungle':   'forest',
  'col-slate':    'atfr',
  'col-rust':     'desert',
  'col-bronze':   'desert',
  'col-silver':   'chrome',
  'col-gold':     'desert',
  'col-crimson':  'urban',
  'col-atfr':     'atfr',
  'col-chrome':   'chrome',
  'col-prestige': 'prestige',
};

// ── 3D layout (all in isometric units) ───────────────────────────────────
// Hull
const HX = -4, HY = -3.5, HZ = 0, HW = 8, HD = 7, HH = 2.8;
// Tracks — run in +x direction (parallel to gun), on y-min and y-max sides of hull
const TW = 2.0, TE = 0.5, TH = HH;    // width(y), x-extension, height — same as hull
const TX = HX - TE, TDX = HW + TE * 2; // x start, x length
const NTY = HY - TW;                    // near track y start (y-min side)
const FTY = HY + HD;                    // far track y start (y-max side)
// Turret
const UW = 5.2, UD = 4.4, UH = 2.3;
const UX = HX + (HW - UW) / 2 - 0.4;
const UY = HY + (HD - UD) / 2 - 0.3;
const UZ = HZ + HH;
// Gun (points in +x direction)
const GW = 6.6, GD = 0.8, GH = 0.8;
const GX = UX + UW;
const GY = UY + (UD - GD) / 2;
const GZ = UZ + (UH - GH) / 2;
// Muzzle brake
const MBX = GX + GW, MBY = GY - 0.22, MBZ = GZ - 0.22;

// ── Size presets ──────────────────────────────────────────────────────────
const SIZE_PRESETS = { sm: 60, md: 100, lg: 180, xl: 260 } as const;
type SizePreset = keyof typeof SIZE_PRESETS;

// ── Component ─────────────────────────────────────────────────────────────
interface TankAvatarProps {
  config: AvatarConfig;
  size?: number | SizePreset;
  fallback?: string;
  className?: string;
}

// ViewBox tight around tank content: x[48,158] y[30,112] → 110×82
const VX = 48, VY = 30, VW = 110, VH = 82;

export function TankAvatar({ config, size = 'md', fallback, className }: TankAvatarProps) {
  const pxSize: number = typeof size === 'string' ? SIZE_PRESETS[size] : size;
  const simplified = pxSize < 90;

  // When 'sm' and a fallback image is provided, skip SVG rendering entirely.
  if (size === 'sm' && fallback) {
    return (
      <img
        src={fallback}
        width={pxSize}
        height={Math.round(pxSize * VH / VW)}
        className={cn('inline-block select-none object-contain', className)}
        alt="tank avatar"
      />
    );
  }

  // Map primaryColorId to internal skin key
  const skinKey = COLOR_TO_SKIN[config.primaryColorId] ?? 'default';
  const skin = SKINS[skinKey] ?? SKINS.default;
  const { base: b, track: tr, accent: acc } = skin;

  // Face colors — top brightest, right darkest (isometric lighting)
  const hT = lt(b, 0.12), hS = dk(b, 0.26), hR = dk(b, 0.44);
  const uT = lt(b, 0.16), uS = dk(b, 0.22), uR = dk(b, 0.38);
  const tT = lt(tr, 0.20), tS = dk(tr, 0.22), tR = dk(tr, 0.38);

  const [hatchX, hatchY] = iso(UX + 1.8, UY + 1.8, UZ + UH);

  // Display size: width=pxSize, height proportional to viewBox
  const dW = pxSize;
  const dH = Math.round(pxSize * VH / VW);

  return (
    <motion.div
      className={cn('inline-block select-none', className)}
      whileHover={simplified ? undefined : { scale: 1.07 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <svg
        width={dW}
        height={dH}
        viewBox={`${VX} ${VY} ${VW} ${VH}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="shd">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
        </defs>

        <g>

          {/* ── Ground shadow ── */}
          {!simplified && (
            <ellipse
              cx={OX + 6} cy={OY + 28}
              rx={66} ry={20}
              fill="rgba(0,0,0,0.20)"
              filter="url(#shd)"
            />
          )}

          {/* ── Far track (behind hull — draw first) ── */}
          <IsoBox x={TX} y={FTY} z={0} w={TDX} d={TW} h={TH} top={tT} side={tS} right={tR} />

          {/* Tread grooves on far track y-max face */}
          {!simplified && [0.5, 1.1, 1.7, 2.3].map((zt, i) => {
            const [x1, y1] = iso(TX,       FTY + TW, zt);
            const [x2, y2] = iso(TX + TDX, FTY + TW, zt);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dk(tr, 0.5)} strokeWidth="0.65" opacity="0.75" />;
          })}

          {/* Track link dividers on far track y-max face */}
          {!simplified && Array.from({ length: Math.round(TDX) + 1 }, (_, i) => {
            const xi = TX + i;
            const [x1, y1] = iso(xi, FTY + TW, 0);
            const [x2, y2] = iso(xi, FTY + TW, TH);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dk(tr, 0.4)} strokeWidth="0.4" opacity="0.5" />;
          })}

          {/* Road wheels on far track visible face */}
          {!simplified && [-3.6, -1.8, 0, 1.8, 3.6].map((wx, i) => {
            const [cx, cy] = iso(wx, FTY + TW, TH * 0.38);
            return <ellipse key={i} cx={cx} cy={cy} rx={2.8} ry={3.5} fill={lt(tr, 0.22)} stroke="#0009" strokeWidth="0.8" />;
          })}

          {/* Sprocket wheel on far track */}
          {!simplified && (() => {
            const [sx, sy] = iso(TX + TDX, FTY + TW * 0.5, TH * 0.5);
            return <ellipse cx={sx} cy={sy} rx={4} ry={2.4} fill={lt(tr, 0.28)} />;
          })()}

          {/* ── Hull ── */}
          <IsoBox x={HX} y={HY} z={HZ} w={HW} d={HD} h={HH} top={hT} side={hS} right={hR} />

          {/* Accent stripes on hull top (ATFR / prestige / chrome) */}
          {!simplified && acc && (
            <>
              <polygon
                points={poly([HX+0.4, HY, HZ+HH], [HX+HW-0.4, HY, HZ+HH], [HX+HW-0.4, HY+0.65, HZ+HH], [HX+0.4, HY+0.65, HZ+HH])}
                fill={acc} opacity="0.65"
              />
              <polygon
                points={poly([HX+0.4, HY+HD-0.65, HZ+HH], [HX+HW-0.4, HY+HD-0.65, HZ+HH], [HX+HW-0.4, HY+HD, HZ+HH], [HX+0.4, HY+HD, HZ+HH])}
                fill={acc} opacity="0.50"
              />
            </>
          )}

          {/* Camo blotches (forest / digital / urban) */}
          {!simplified && ['forest', 'digital', 'urban'].includes(skinKey) && (
            <>
              <polygon
                points={poly([HX+0.8, HY+0.8, HZ+HH+0.01], [HX+3, HY+0.8, HZ+HH+0.01], [HX+2.6, HY+3.2, HZ+HH+0.01], [HX+0.7, HY+2.8, HZ+HH+0.01])}
                fill={dk(b, 0.18)} opacity="0.55"
              />
              <polygon
                points={poly([HX+4, HY+1.8, HZ+HH+0.01], [HX+6.2, HY+1.3, HZ+HH+0.01], [HX+6.6, HY+4.8, HZ+HH+0.01], [HX+4.5, HY+5.3, HZ+HH+0.01])}
                fill={dk(b, 0.22)} opacity="0.48"
              />
            </>
          )}

          {/* Winter snow patches */}
          {!simplified && skinKey === 'winter' && (
            <>
              <polygon
                points={poly([HX+1, HY+1, HZ+HH+0.01], [HX+4, HY+0.5, HZ+HH+0.01], [HX+3.5, HY+3, HZ+HH+0.01], [HX+1.2, HY+3.5, HZ+HH+0.01])}
                fill="#ffffff" opacity="0.35"
              />
              <polygon
                points={poly([HX+5, HY+3, HZ+HH+0.01], [HX+7, HY+2.5, HZ+HH+0.01], [HX+7.2, HY+5.5, HZ+HH+0.01], [HX+5.2, HY+6, HZ+HH+0.01])}
                fill="#ffffff" opacity="0.30"
              />
            </>
          )}

          {/* ── Near track (in front of hull — draw after hull) ── */}
          <IsoBox x={TX} y={NTY} z={0} w={TDX} d={TW} h={TH} top={tT} side={tS} right={tR} />

          {/* Tread grooves on near track y-max face */}
          {!simplified && [0.5, 1.1, 1.7, 2.3].map((zt, i) => {
            const [x1, y1] = iso(TX,       NTY + TW, zt);
            const [x2, y2] = iso(TX + TDX, NTY + TW, zt);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dk(tr, 0.5)} strokeWidth="0.65" opacity="0.75" />;
          })}

          {/* Track link dividers on near track y-max face */}
          {!simplified && Array.from({ length: Math.round(TDX) + 1 }, (_, i) => {
            const xi = TX + i;
            const [x1, y1] = iso(xi, NTY + TW, 0);
            const [x2, y2] = iso(xi, NTY + TW, TH);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dk(tr, 0.4)} strokeWidth="0.4" opacity="0.5" />;
          })}

          {/* Road wheels on near track visible face */}
          {!simplified && [-3.6, -1.8, 0, 1.8, 3.6].map((wx, i) => {
            const [cx, cy] = iso(wx, NTY + TW, TH * 0.38);
            return <ellipse key={i} cx={cx} cy={cy} rx={2.8} ry={3.5} fill={lt(tr, 0.22)} stroke="#0009" strokeWidth="0.8" />;
          })}

          {/* Sprocket wheel on near track */}
          {!simplified && (() => {
            const [sx, sy] = iso(TX + TDX, NTY + TW * 0.5, TH * 0.5);
            return <ellipse cx={sx} cy={sy} rx={4} ry={2.4} fill={lt(tr, 0.28)} />;
          })()}

          {/* ── Turret ── */}
          <IsoBox x={UX} y={UY} z={UZ} w={UW} d={UD} h={UH} top={uT} side={uS} right={uR} />

          {/* Ventilation lines on turret top (right half) */}
          {!simplified && [UY + 0.8, UY + 1.4, UY + 2.0, UY + 2.6].map((gy, i) => {
            const [x1, y1] = iso(UX + 3.2, gy, UZ + UH + 0.01);
            const [x2, y2] = iso(UX + UW - 0.3, gy, UZ + UH + 0.01);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={dk(uT, 0.30)} strokeWidth="0.55" opacity="0.5" />;
          })}

          {/* Hatch ring */}
          {!simplified && (
            <ellipse cx={hatchX} cy={hatchY} rx={7} ry={4.2} fill={dk(b, 0.40)} stroke={dk(b, 0.55)} strokeWidth="0.8" />
          )}

          {/* ── Gun barrel ── */}
          <IsoBox x={GX} y={GY} z={GZ} w={GW} d={GD} h={GH} top="#2a2a2a" side="#121212" right="#0c0c0c" />
          {/* Muzzle brake */}
          {!simplified && (
            <IsoBox x={MBX} y={MBY} z={MBZ} w={0.65} d={1.22} h={1.22} top="#222" side="#101010" right="#0a0a0a" />
          )}

        </g>
      </svg>
    </motion.div>
  );
}
