import type { AvatarConfig } from '@/features/geoguesser/playerProfile';

interface SkinDef {
  hull: string;
  hullSide: string;
  turret: string;
  turretTop: string;
  hatch: string;
  track: string;
  gun: string;
  accent?: string;
  pattern?: 'urban' | 'forest' | 'digital' | 'atfr' | 'chrome';
}

const SKINS: Record<string, SkinDef> = {
  default:  { hull: '#556B2F', hullSide: '#3B4D20', turret: '#6B7E38', turretTop: '#7A9042', hatch: '#4A5A28', track: '#1c1c1c', gun: '#181818' },
  desert:   { hull: '#C19A3E', hullSide: '#8B6E2A', turret: '#CDA844', turretTop: '#D4B552', hatch: '#9A7830', track: '#1c1c1c', gun: '#181818' },
  winter:   { hull: '#C4CDD6', hullSide: '#8E9BA8', turret: '#D2DBE4', turretTop: '#E0E8EE', hatch: '#A0B0BC', track: '#28323C', gun: '#1a2028' },
  urban:    { hull: '#6B7280', hullSide: '#4A5360', turret: '#7D8D9A', turretTop: '#8E9FAE', hatch: '#586270', track: '#1c1c1c', gun: '#181818', pattern: 'urban' },
  forest:   { hull: '#2D4A1E', hullSide: '#1C3012', turret: '#3A5E27', turretTop: '#476D30', hatch: '#243C17', track: '#141414', gun: '#181818', pattern: 'forest' },
  digital:  { hull: '#4A6741', hullSide: '#2E4228', turret: '#5A7A4E', turretTop: '#6A8A5C', hatch: '#3A5433', track: '#1c1c1c', gun: '#181818', pattern: 'digital' },
  arctic:   { hull: '#D0E0EC', hullSide: '#98B8CC', turret: '#DDE8F4', turretTop: '#EAF2F8', hatch: '#ACC4D8', track: '#263040', gun: '#1a2030' },
  atfr:     { hull: '#0F1923', hullSide: '#070D14', turret: '#162030', turretTop: '#1F2E42', hatch: '#0A1520', track: '#05090E', gun: '#0A0A0A', accent: '#C9A227', pattern: 'atfr' },
  chrome:   { hull: '#A8B4C4', hullSide: '#788090', turret: '#B8C4D4', turretTop: '#D0DCE8', hatch: '#88949E', track: '#2a2a2a', gun: '#1a1a1a', accent: '#E0E8F2', pattern: 'chrome' },
  prestige: { hull: '#0C0C0C', hullSide: '#050505', turret: '#161616', turretTop: '#202020', hatch: '#0A0A0A', track: '#050505', gun: '#080808', accent: '#C9A227' },
};

function darken(hex: string, amount = 0.25): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round((n >> 16) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

// Star polygon helper (5-pointed, centered at 0,0, radius r)
function starPoints(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(Math.cos(angle) * radius).toFixed(2)},${(Math.sin(angle) * radius).toFixed(2)}`);
  }
  return pts.join(' ');
}

interface TankAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function TankAvatar({ config, size = 120, className }: TankAvatarProps) {
  const skin = SKINS[config.skinId] ?? SKINS.default;
  const has = (id: string) => config.accessoryIds.includes(id);
  const effect = config.effectId;

  // viewBox: 0 0 170 90
  const height = Math.round(size * 90 / 170);

  const filterId = `tank-fx-${config.skinId}-${effect ?? 'none'}`;

  return (
    <svg
      viewBox="0 0 170 90"
      width={size}
      height={height}
      className={className}
      aria-label="Avatar tank"
    >
      <defs>
        {/* Glow filter - gold */}
        {effect === 'fx-glow-gold' && (
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="1 0.7 0 0 0   0.6 0.4 0 0 0   0 0 0 0 0   0 0 0 1 0"
              result="gold-blur" />
            <feMerge>
              <feMergeNode in="gold-blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {/* Prestige glow */}
        {effect === 'fx-prestige' && (
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="0.8 0.2 0.8 0 0   0.2 0.2 1 0 0   0.8 0.2 0.8 0 0   0 0 0 1 0"
              result="iris-blur" />
            <feMerge>
              <feMergeNode in="iris-blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}

        {/* Urban camo pattern */}
        {skin.pattern === 'urban' && (
          <pattern id="pat-urban" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill={skin.hull} />
            <rect x="0" y="0" width="10" height="12" fill={darken(skin.hull, 0.2)} />
            <rect x="14" y="10" width="10" height="14" fill={darken(skin.hull, 0.1)} />
            <rect x="4" y="16" width="12" height="8" fill={darken(skin.hull, 0.35)} opacity="0.7" />
          </pattern>
        )}
        {/* Forest camo pattern */}
        {skin.pattern === 'forest' && (
          <pattern id="pat-forest" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect width="28" height="28" fill={skin.hull} />
            <ellipse cx="6" cy="8" rx="7" ry="6" fill={darken(skin.hull, 0.4)} />
            <ellipse cx="20" cy="20" rx="9" ry="7" fill={darken(skin.hull, 0.3)} />
            <ellipse cx="22" cy="5" rx="5" ry="4" fill={darken(skin.hull, 0.5)} />
          </pattern>
        )}
        {/* Digital camo pattern */}
        {skin.pattern === 'digital' && (
          <pattern id="pat-digital" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill={skin.hull} />
            <rect x="0" y="0" width="4" height="4" fill={darken(skin.hull, 0.3)} />
            <rect x="8" y="0" width="4" height="4" fill={darken(skin.hull, 0.15)} />
            <rect x="4" y="4" width="4" height="4" fill={darken(skin.hull, 0.4)} />
            <rect x="12" y="4" width="4" height="4" fill={darken(skin.hull, 0.1)} />
            <rect x="0" y="8" width="4" height="4" fill={darken(skin.hull, 0.2)} />
            <rect x="8" y="8" width="4" height="4" fill={darken(skin.hull, 0.3)} />
            <rect x="4" y="12" width="4" height="4" fill={darken(skin.hull, 0.1)} />
            <rect x="12" y="12" width="4" height="4" fill={darken(skin.hull, 0.35)} />
          </pattern>
        )}
        {/* ATFR skin — gold accent lines defined inline */}
        {/* Chrome — metallic gradient */}
        {skin.pattern === 'chrome' && (
          <linearGradient id="pat-chrome" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={darken(skin.hull, 0.1)} />
            <stop offset="40%" stopColor={skin.accent ?? skin.turretTop} />
            <stop offset="60%" stopColor={skin.hull} />
            <stop offset="100%" stopColor={darken(skin.hull, 0.15)} />
          </linearGradient>
        )}
      </defs>

      <g filter={effect && effect !== 'fx-worn' ? `url(#${filterId})` : undefined}>

        {/* ── Overall tank shadow ── */}
        <ellipse cx="88" cy="79" rx="75" ry="7" fill="rgba(0,0,0,0.25)" />

        {/* ── Left track ── */}
        <rect x="5" y="28" width="21" height="44" rx="7" fill={skin.track} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x="6" y={31 + i * 6} width="19" height="2" rx="1" fill={darken(skin.track, -0.3)} />
        ))}
        {/* Track wheel hints */}
        <circle cx="15" cy="32" r="5" fill={darken(skin.track, -0.15)} />
        <circle cx="15" cy="66" r="5" fill={darken(skin.track, -0.15)} />

        {/* ── Right track ── */}
        <rect x="144" y="28" width="21" height="44" rx="7" fill={skin.track} />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x="145" y={31 + i * 6} width="19" height="2" rx="1" fill={darken(skin.track, -0.3)} />
        ))}
        <circle cx="154" cy="32" r="5" fill={darken(skin.track, -0.15)} />
        <circle cx="154" cy="66" r="5" fill={darken(skin.track, -0.15)} />

        {/* ── Hull body ── */}
        <rect
          x="22" y="24" width="126" height="48" rx="6"
          fill={
            skin.pattern === 'urban' ? 'url(#pat-urban)' :
            skin.pattern === 'forest' ? 'url(#pat-forest)' :
            skin.pattern === 'digital' ? 'url(#pat-digital)' :
            skin.pattern === 'chrome' ? 'url(#pat-chrome)' :
            skin.hull
          }
        />
        {/* Hull lower side face (3-D effect) */}
        <rect x="22" y="62" width="126" height="10" rx="3" fill={skin.hullSide} />
        {/* Hull front bevel (right side — gun side) */}
        <rect x="128" y="24" width="20" height="48" rx="3" fill="rgba(255,255,255,0.06)" />

        {/* ATFR accent stripe */}
        {skin.pattern === 'atfr' && skin.accent && (
          <>
            <rect x="22" y="24" width="126" height="4" rx="2" fill={skin.accent} opacity="0.7" />
            <rect x="22" y="66" width="126" height="4" rx="2" fill={skin.accent} opacity="0.5" />
            <rect x="22" y="44" width="126" height="2" fill={skin.accent} opacity="0.2" />
          </>
        )}
        {/* Prestige accent stripe */}
        {config.skinId === 'prestige' && skin.accent && (
          <>
            <rect x="22" y="24" width="126" height="3" rx="1.5" fill={skin.accent} opacity="0.8" />
            <rect x="22" y="68" width="126" height="3" rx="1.5" fill={skin.accent} opacity="0.6" />
          </>
        )}

        {/* Battle-worn scratches overlay */}
        {effect === 'fx-worn' && (
          <g opacity="0.25" stroke="#fff" strokeWidth="0.8" strokeLinecap="round">
            <line x1="35" y1="28" x2="50" y2="45" />
            <line x1="60" y1="30" x2="72" y2="38" />
            <line x1="90" y1="35" x2="102" y2="52" />
            <line x1="115" y1="28" x2="120" y2="40" />
            <line x1="42" y1="50" x2="52" y2="62" />
          </g>
        )}

        {/* ── Mudguard accessory ── */}
        {has('acc-mudguards') && (
          <g>
            <rect x="22" y="22" width="126" height="4" rx="2" fill={darken(skin.hullSide, 0.1)} />
            <rect x="22" y="70" width="126" height="3" rx="1.5" fill={darken(skin.hullSide, 0.1)} />
            {/* Mud patches */}
            <ellipse cx="40" cy="71" rx="9" ry="3" fill="#3a2a18" opacity="0.6" />
            <ellipse cx="110" cy="71" rx="7" ry="2.5" fill="#3a2a18" opacity="0.5" />
          </g>
        )}

        {/* ── Turret ── */}
        {/* Shadow */}
        <ellipse cx="80" cy="57" rx="30" ry="18" fill="rgba(0,0,0,0.2)" />
        {/* Turret body */}
        <ellipse cx="78" cy="50" rx="30" ry="18" fill={skin.turret} />
        {/* Turret top highlight */}
        <ellipse cx="75" cy="47" rx="25" ry="14" fill={skin.turretTop} />
        {/* Turret ring */}
        <ellipse cx="78" cy="50" rx="30" ry="18" fill="none" stroke={darken(skin.turret, 0.3)} strokeWidth="1" />

        {/* ── Gun barrel ── */}
        <rect x="106" y="45" width="57" height="9" rx="3" fill={skin.gun} />
        {/* Gun top highlight */}
        <rect x="106" y="45" width="57" height="3" rx="1.5" fill="rgba(255,255,255,0.08)" />
        {/* Muzzle brake */}
        <rect x="159" y="42" width="9" height="15" rx="2" fill={darken(skin.gun, -0.2)} />
        <rect x="160" y="44" width="3" height="11" rx="1" fill={darken(skin.gun, 0.15)} />
        <rect x="164" y="44" width="3" height="11" rx="1" fill={darken(skin.gun, 0.15)} />

        {/* ── Hatch ── */}
        <circle cx="70" cy="46" r="8" fill={skin.hatch} />
        <circle cx="70" cy="46" r="8" fill="none" stroke={darken(skin.hatch, 0.4)} strokeWidth="1.2" />
        <circle cx="70" cy="46" r="4" fill={darken(skin.hatch, 0.35)} />

        {/* ── Commander hatch accessory ── */}
        {has('acc-hatch') && (
          <g>
            {/* Open hatch door */}
            <ellipse cx="70" cy="40" rx="8" ry="4" fill={darken(skin.hatch, 0.2)} stroke={darken(skin.hatch, 0.5)} strokeWidth="1" />
            {/* Commander head (oval) */}
            <ellipse cx="70" cy="34" rx="5" ry="6" fill="#C8956E" />
            {/* Helmet */}
            <ellipse cx="70" cy="31" rx="5.5" ry="3.5" fill={skin.hatch} />
            {/* Goggles */}
            <rect x="67" y="33" width="7" height="3" rx="1.5" fill="#1a3a5a" opacity="0.8" />
          </g>
        )}

        {/* ── Antenna accessory ── */}
        {has('acc-antenna') && (
          <g>
            <line x1="33" y1="62" x2="28" y2="14" stroke={darken(skin.hull, 0.2)} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="28" cy="14" r="1.5" fill={skin.accent ?? '#888'} />
          </g>
        )}

        {/* ── Flag/pennant accessory ── */}
        {has('acc-flag') && (
          <g>
            {/* Flagpole */}
            <line x1="52" y1="50" x2="52" y2="22" stroke={darken(skin.hull, 0.2)} strokeWidth="1.2" strokeLinecap="round" />
            {/* Pennant triangle */}
            <polygon points="52,22 66,27 52,32" fill="#C9A227" opacity="0.9" />
            {/* ATFR mark (simplified cross) */}
            <line x1="56" y1="25" x2="56" y2="31" stroke="#fff" strokeWidth="0.8" />
            <line x1="54" y1="27.5" x2="58" y2="27.5" stroke="#fff" strokeWidth="0.8" />
          </g>
        )}

        {/* ── Kill stars accessory ── */}
        {has('acc-star1') && !has('acc-star3') && (
          <g transform="translate(94, 38)">
            <polygon points={starPoints(5)} fill="#C9A227" />
            <polygon points={starPoints(5)} fill="none" stroke="#9A7820" strokeWidth="0.6" />
          </g>
        )}
        {has('acc-star3') && (
          <g>
            {[82, 94, 106].map((x) => (
              <g key={x} transform={`translate(${x}, 38)`}>
                <polygon points={starPoints(4.5)} fill="#C9A227" />
              </g>
            ))}
          </g>
        )}

        {/* ── Ace medal accessory ── */}
        {has('acc-ace') && (
          <g transform="translate(100, 53)">
            {/* Medal circle */}
            <circle cx="0" cy="0" r="7" fill="#C9A227" />
            <circle cx="0" cy="0" r="5.5" fill="#E0B83A" />
            {/* Ace symbol (simplified) */}
            <text x="0" y="4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#7A5A10" fontFamily="sans-serif">A</text>
            {/* Ribbon */}
            <rect x="-3" y="-10" width="6" height="5" fill="#C23030" />
          </g>
        )}

      </g>
    </svg>
  );
}
