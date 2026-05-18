import { motion } from 'framer-motion';
import type { AvatarConfig } from '@/features/geoguesser/playerProfile';
import { cn } from '@/lib/cn';

interface SkinDef {
  top: string;       // dessus de la caisse
  side: string;      // côté de la caisse
  front: string;     // face avant
  turretTop: string; // dessus tourelle
  turretSide: string;
  track: string;
  gun: string;
  accent?: string;
  camo?: string;     // CSS class or gradient overlay on top face
}

const SKINS: Record<string, SkinDef> = {
  default:  { top: '#5a7332', side: '#3d5022', front: '#4a6029', turretTop: '#6b8038', turretSide: '#4a5c28', track: '#1e1e1e', gun: '#181818' },
  desert:   { top: '#c8993c', side: '#926e28', front: '#ae8532', turretTop: '#d4a840', turretSide: '#9a7830', track: '#1e1e1e', gun: '#181818' },
  winter:   { top: '#ccd6de', side: '#8ea4b0', front: '#b4c8d2', turretTop: '#d8e4ec', turretSide: '#9ab0bc', track: '#2c3844', gun: '#1e2830' },
  urban:    { top: '#6b7280', side: '#4a5360', front: '#5c6370', turretTop: '#7d8d9a', turretSide: '#58686e', track: '#1e1e1e', gun: '#181818' },
  forest:   { top: '#2c491c', side: '#1c3010', front: '#243c16', turretTop: '#385c24', turretSide: '#283e18', track: '#141414', gun: '#181818' },
  digital:  { top: '#4a6740', side: '#2e4228', front: '#3c5434', turretTop: '#5a7a4c', turretSide: '#3e5630', track: '#1e1e1e', gun: '#181818' },
  arctic:   { top: '#cee2f0', side: '#98bcd0', front: '#b4d0e4', turretTop: '#daeaf6', turretSide: '#a4c4d8', track: '#263040', gun: '#1a2030' },
  atfr:     { top: '#0f1923', side: '#070d14', front: '#0c1520', turretTop: '#162030', turretSide: '#0a1018', track: '#05090e', gun: '#0a0a0a', accent: '#c9a227' },
  chrome:   { top: '#b0bccc', side: '#7c8898', front: '#98a8b8', turretTop: '#c4d0de', turretSide: '#8898a8', track: '#2a2a2a', gun: '#1a1a1a', accent: '#e0eaf4' },
  prestige: { top: '#0c0c0c', side: '#050505', front: '#0a0a0a', turretTop: '#181818', turretSide: '#0e0e0e', track: '#050505', gun: '#080808', accent: '#c9a227' },
};

// Gradient overlays for camo skins
const CAMO_STYLES: Record<string, React.CSSProperties> = {
  urban: {
    backgroundImage: `
      radial-gradient(ellipse 40% 30% at 25% 35%, rgba(50,60,70,0.5) 0%, transparent 100%),
      radial-gradient(ellipse 35% 40% at 75% 65%, rgba(30,40,50,0.4) 0%, transparent 100%),
      radial-gradient(ellipse 25% 50% at 50% 20%, rgba(90,100,110,0.3) 0%, transparent 100%)
    `,
  },
  forest: {
    backgroundImage: `
      radial-gradient(ellipse 50% 40% at 20% 40%, rgba(0,20,0,0.6) 0%, transparent 100%),
      radial-gradient(ellipse 40% 50% at 70% 60%, rgba(0,10,0,0.5) 0%, transparent 100%),
      radial-gradient(ellipse 30% 30% at 55% 20%, rgba(10,30,5,0.4) 0%, transparent 100%)
    `,
  },
  digital: {
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 9px),
      repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px)
    `,
  },
};

interface TankAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

export function TankAvatar({ config, size = 120, className }: TankAvatarProps) {
  const skin = SKINS[config.skinId] ?? SKINS.default;
  const has = (id: string) => config.accessoryIds.includes(id);
  const effect = config.effectId;
  const camoStyle = CAMO_STYLES[config.skinId];

  // All measurements in px, scaled from a base size of 120
  const sc = size / 120;
  const s = (n: number) => `${Math.round(n * sc)}px`;

  const glowStyle: React.CSSProperties =
    effect === 'fx-glow-gold'
      ? { filter: 'drop-shadow(0 0 8px rgba(201,162,39,0.8)) drop-shadow(0 0 20px rgba(201,162,39,0.4))' }
      : effect === 'fx-prestige'
        ? { filter: 'drop-shadow(0 0 10px rgba(160,80,220,0.7)) drop-shadow(0 0 22px rgba(80,160,220,0.5))' }
        : {};

  // CSS 3D perspective scene
  // Base dimensions (at size=120):
  //   hull: 80w × 40d × 18h
  //   tracks: 8w × 44d each, offset outside hull
  //   turret: 36w × 28d × 14h, centered on hull top
  //   gun: 4w × 4h × 52l, extending forward from turret
  const scene: React.CSSProperties = {
    width: s(120),
    height: s(90),
    perspective: s(400),
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const world: React.CSSProperties = {
    position: 'relative',
    transformStyle: 'preserve-3d',
    transform: `rotateX(28deg) rotateZ(-32deg)`,
    width: s(80),
    height: s(40),
  };

  function face(
    w: number, h: number,
    tx: number, ty: number, tz: number,
    rx: number, ry: number, rz: number,
    bg: string,
    extra?: React.CSSProperties,
  ): React.CSSProperties {
    return {
      position: 'absolute',
      width: s(w),
      height: s(h),
      background: bg,
      transform: `translate3d(${s(tx)},${s(ty)},${s(tz)}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
      transformOrigin: '0 0',
      backfaceVisibility: 'hidden',
      ...extra,
    };
  }

  // gradient helpers
  const topGrad = (color: string, lighter: string) =>
    `linear-gradient(135deg, ${lighter} 0%, ${color} 50%, ${darken(color, 0.1)} 100%)`;
  const sideGrad = (color: string) =>
    `linear-gradient(90deg, ${darken(color, 0.05)} 0%, ${color} 40%, ${darken(color, 0.15)} 100%)`;

  const hullW = 80, hullD = 40, hullH = 18;
  const turW = 38, turD = 28, turH = 14;
  const trW = 10, trD = 48, trH = 16;

  return (
    <motion.div
      className={cn('inline-block select-none', className)}
      style={{ ...scene, ...glowStyle }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div style={world}>

        {/* ── Left track ── */}
        <TrackBox sc={sc} skin={skin} w={trW} d={trD} h={trH}
          tx={-trW - 2} ty={-4} tz={0}
          label="left"
        />

        {/* ── Right track ── */}
        <TrackBox sc={sc} skin={skin} w={trW} d={trD} h={trH}
          tx={hullW + 2} ty={-4} tz={0}
          label="right"
        />

        {/* ── Hull — top face ── */}
        <div style={{
          ...face(hullW, hullD, 0, 0, hullH, -90, 0, 0,
            topGrad(skin.top, lighten(skin.top, 0.12))),
          overflow: 'hidden',
        }}>
          {/* Camo overlay */}
          {camoStyle && <div style={{ position: 'absolute', inset: 0, ...camoStyle }} />}
          {/* Accent stripe for ATFR/prestige */}
          {skin.accent && (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: s(2.5), background: skin.accent, opacity: 0.75 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: s(2), background: skin.accent, opacity: 0.55 }} />
            </>
          )}
          {/* Battle-worn scratches */}
          {effect === 'fx-worn' && (
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
              <line x1="15%" y1="10%" x2="30%" y2="60%" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              <line x1="45%" y1="5%" x2="55%" y2="45%" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" />
              <line x1="70%" y1="20%" x2="80%" y2="70%" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* ── Hull — front face (gun side) ── */}
        <div style={face(hullD, hullH, 0, hullD, 0, 0, -90, 0,
          sideGrad(skin.front))} />

        {/* ── Hull — right side face ── */}
        <div style={face(hullW, hullH, 0, 0, 0, 90, 0, 0,
          `linear-gradient(90deg, ${skin.side} 0%, ${darken(skin.side, 0.08)} 100%)`)} />

        {/* ── Hull — back face ── */}
        <div style={face(hullD, hullH, 0, 0, 0, 0, -90, 0,
          darken(skin.side, 0.2))} />

        {/* ── Mudguard skirts ── */}
        {has('acc-mudguards') && (
          <>
            <div style={{ ...face(hullW + 4, 4, -2, -2, hullH - 2, -90, 0, 0, darken(skin.side, 0.15)), opacity: 0.9 }} />
            <div style={{ ...face(hullW + 4, 4, -2, hullD - 2, hullH - 2, -90, 0, 0, darken(skin.side, 0.15)), opacity: 0.9 }} />
          </>
        )}

        {/* ── Antenna ── */}
        {has('acc-antenna') && (
          <div style={{
            position: 'absolute',
            width: s(1.5),
            height: s(38),
            background: `linear-gradient(180deg, ${skin.accent ?? '#999'} 0%, ${darken(skin.side, 0.1)} 100%)`,
            transform: `translate3d(${s(12)}, ${s(hullD - 3)}, ${s(hullH)}) rotateX(90deg) rotateY(-8deg)`,
            transformOrigin: 'bottom center',
          }} />
        )}

        {/* ── Turret group (translate onto hull top center) ── */}
        <div style={{
          position: 'absolute',
          transformStyle: 'preserve-3d',
          transform: `translate3d(${s((hullW - turW) / 2 - 4)}, ${s((hullD - turD) / 2 - 2)}, ${s(hullH)})`,
        }}>
          {/* Turret top */}
          <div style={{
            ...face(turW, turD, 0, 0, turH, -90, 0, 0,
              topGrad(skin.turretTop, lighten(skin.turretTop, 0.15))),
            borderRadius: `${s(6)} ${s(6)} ${s(4)} ${s(4)}`,
            overflow: 'hidden',
          }}>
            {/* Hatch ring */}
            <div style={{
              position: 'absolute',
              width: s(12), height: s(12),
              borderRadius: '50%',
              background: `radial-gradient(circle, ${lighten(skin.turretTop, 0.08)} 0%, ${darken(skin.turretTop, 0.2)} 70%)`,
              border: `${s(1.5)} solid ${darken(skin.turretTop, 0.35)}`,
              top: '25%', left: '28%',
            }}>
              {/* Open hatch with commander */}
              {has('acc-hatch') && (
                <div style={{
                  position: 'absolute', inset: s(-2),
                  borderRadius: '50%',
                  background: darken(skin.turretTop, 0.4),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: s(7), lineHeight: 1,
                }}>
                  <svg width={s(14)} height={s(14)} viewBox="0 0 14 14">
                    {/* Head */}
                    <ellipse cx="7" cy="6" rx="4" ry="4.5" fill="#c8956e" />
                    {/* Helmet */}
                    <ellipse cx="7" cy="4" rx="4.5" ry="3" fill={skin.turretTop} />
                    {/* Goggles */}
                    <rect x="4.5" y="5.5" width="6" height="2.5" rx="1.2" fill="#1a3a5a" />
                    {/* Shoulder hint */}
                    <rect x="3.5" y="9.5" width="8" height="3" rx="1" fill={darken(skin.turretTop, 0.2)} />
                  </svg>
                </div>
              )}
            </div>
            {/* Ace medal */}
            {has('acc-ace') && (
              <div style={{
                position: 'absolute', right: '8%', top: '20%',
                width: s(10), height: s(10), borderRadius: '50%',
                background: 'radial-gradient(circle, #e0b838 40%, #9a7820 100%)',
                border: `${s(1)} solid #c9a227`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: s(6), fontWeight: 'bold', color: '#6a4a08', fontFamily: 'sans-serif',
              }}>A</div>
            )}
          </div>

          {/* Turret front face */}
          <div style={{
            ...face(turD, turH, 0, turD, 0, 0, -90, 0,
              sideGrad(darken(skin.turretSide, 0.05))),
            borderRadius: `0 0 ${s(4)} ${s(4)}`,
          }} />

          {/* Turret right face */}
          <div style={face(turW, turH, 0, 0, 0, 90, 0, 0, skin.turretSide)} />

          {/* Flag on turret */}
          {has('acc-flag') && (
            <div style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              transform: `translate3d(${s(4)}, ${s(-2)}, ${s(turH)})`,
            }}>
              {/* Pole */}
              <div style={{
                width: s(1.5), height: s(18),
                background: darken(skin.turretSide, 0.15),
                transform: 'rotateX(90deg)',
                transformOrigin: 'bottom center',
              }} />
              {/* Pennant — flat on top face using absolute trick */}
              <div style={{
                position: 'absolute',
                top: s(-12), left: s(1.5),
                width: 0, height: 0,
                borderTop: `${s(5)} solid transparent`,
                borderBottom: `${s(5)} solid transparent`,
                borderLeft: `${s(10)} solid #c9a227`,
                opacity: 0.95,
              }} />
            </div>
          )}

          {/* Kill stars on turret top */}
          {(has('acc-star1') || has('acc-star3')) && (
            <div style={{
              position: 'absolute',
              transform: `translate3d(${s(turW - 14)}, ${s(turD / 2 - 3)}, ${s(turH + 0.5)}) rotateX(-90deg)`,
              display: 'flex', gap: s(3),
            }}>
              {(has('acc-star3') ? [0, 1, 2] : [0]).map((i) => (
                <svg key={i} width={s(7)} height={s(7)} viewBox="-5 -5 10 10">
                  <polygon points="0,-4.5 1.05,-1.45 4.28,-1.39 1.72,0.56 2.65,3.64 0,1.8 -2.65,3.64 -1.72,0.56 -4.28,-1.39 -1.05,-1.45" fill="#c9a227" />
                </svg>
              ))}
            </div>
          )}

          {/* ── Gun barrel (extends forward from turret front) ── */}
          <div style={{
            position: 'absolute',
            transformStyle: 'preserve-3d',
            transform: `translate3d(${s(turW * 0.35)}, ${s(turD)}, ${s(turH * 0.5)})`,
          }}>
            {/* Gun top face */}
            <div style={face(6, 46, 0, 0, 5, -90, 0, 0,
              `linear-gradient(90deg, ${skin.gun} 0%, #2a2a2a 50%, ${skin.gun} 100%)`)} />
            {/* Gun side */}
            <div style={face(6, 5, 0, 0, 0, 90, 0, 0, darken(skin.gun, 0.3))} />
            {/* Gun front (muzzle) */}
            <div style={{
              ...face(6, 5, 0, 46, 0, 0, -90, 0, '#0a0a0a'),
              borderRadius: s(1),
            }} />
            {/* Muzzle brake — wider box at tip */}
            <div style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              transform: `translate3d(${s(-1)}, ${s(40)}, ${s(0)})`,
            }}>
              <div style={face(8, 8, 0, 0, 6, -90, 0, 0, '#111')} />
              <div style={face(8, 6, 0, 8, 0, 0, -90, 0, '#090909')} />
              <div style={face(8, 6, 0, 0, 0, 90, 0, 0, '#090909')} />
            </div>
          </div>
        </div>

        {/* ── Ground shadow ── */}
        <div style={{
          position: 'absolute',
          width: s(100), height: s(55),
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
          transform: `translate3d(${s(-10)}, ${s(-8)}, ${s(-1)})`,
          filter: `blur(${s(4)})`,
        }} />

      </div>
    </motion.div>
  );
}

// ── Track box component ────────────────────────────────────────────────────
function TrackBox({ sc, skin, w, d, h, tx, ty, tz }: {
  sc: number;
  skin: SkinDef;
  w: number; d: number; h: number;
  tx: number; ty: number; tz: number;
  label: string;
}) {
  const s = (n: number) => `${Math.round(n * sc)}px`;
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    transformStyle: 'preserve-3d',
    transform: `translate3d(${s(tx)}, ${s(ty)}, ${s(tz)})`,
  };
  function face(fw: number, fh: number, ftx: number, fty: number, ftz: number,
    rx: number, ry: number, bg: string, extra?: React.CSSProperties): React.CSSProperties {
    return {
      position: 'absolute',
      width: s(fw), height: s(fh),
      background: bg,
      transform: `translate3d(${s(ftx)}, ${s(fty)}, ${s(ftz)}) rotateX(${rx}deg) rotateY(${ry}deg)`,
      transformOrigin: '0 0',
      ...extra,
    };
  }

  const trackColor = skin.track;
  const trackLight = lighten(trackColor, 0.2);
  const treads = Array.from({ length: Math.floor(d / 5) }, (_, i) => i);

  return (
    <div style={baseStyle}>
      {/* Track top */}
      <div style={{ ...face(w, d, 0, 0, h, -90, 0, `linear-gradient(135deg, ${trackLight} 0%, ${trackColor} 60%)`), overflow: 'hidden' }}>
        {/* Tread pattern */}
        {treads.map((i) => (
          <div key={i} style={{
            position: 'absolute', left: '15%', right: '15%',
            top: `${(i / treads.length) * 100}%`,
            height: s(2), borderRadius: s(1),
            background: lighten(trackColor, 0.3),
            opacity: 0.7,
          }} />
        ))}
        {/* Sprocket wheels at ends */}
        <div style={{ position: 'absolute', left: '10%', top: '4%', width: '80%', height: s(6), borderRadius: '50%', background: lighten(trackColor, 0.25) }} />
        <div style={{ position: 'absolute', left: '10%', bottom: '4%', width: '80%', height: s(6), borderRadius: '50%', background: lighten(trackColor, 0.25) }} />
      </div>
      {/* Track outer side */}
      <div style={face(d, h, 0, 0, 0, 90, 0, darken(trackColor, 0.2))} />
      {/* Track front */}
      <div style={{ ...face(w, h, 0, d, 0, 0, -90, darken(trackColor, 0.3)), borderRadius: `0 0 ${s(4)} ${s(4)}` }} />
    </div>
  );
}

// ── Color utilities ────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function darken(hex: string, amount = 0.2): string {
  if (!hex.startsWith('#')) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
function lighten(hex: string, amount = 0.2): string {
  if (!hex.startsWith('#')) return hex;
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}
