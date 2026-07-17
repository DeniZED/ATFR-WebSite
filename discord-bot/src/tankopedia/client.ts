import { config } from '../config.js';

interface WgEnvelope<T> {
  status: string;
  error?: { message: string; field?: string };
  data: T;
}

async function wg<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!config.clanTracker.wotApplicationId) {
    throw new Error('WOT_APPLICATION_ID est requis pour la Tankopedia');
  }
  const qs = new URLSearchParams({ application_id: config.clanTracker.wotApplicationId, ...params });
  const res = await fetch(`${config.clanTracker.wgApiBase}${path}?${qs}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`WG ${path} → ${res.status}`);
  const body = (await res.json()) as WgEnvelope<T>;
  if (body.status !== 'ok') {
    const field = body.error?.field ? ` (field=${body.error.field})` : '';
    throw new Error(`WG error ${path}: ${body.error?.message ?? 'unknown'}${field}`);
  }
  return body.data;
}

export interface VehicleSummary {
  tankId: number;
  name: string;
  shortName: string;
  nation: string;
  tier: number;
  type: string;
  isPremium: boolean;
}

interface RawVehicleListEntry {
  tank_id: number;
  name: string;
  short_name: string;
  nation: string;
  tier: number;
  type: string;
  is_premium: boolean;
}

// Index de tous les véhicules — mis en cache indéfiniment (la liste évolue peu ;
// un redémarrage du bot suffit à la rafraîchir).
let indexCache: VehicleSummary[] | null = null;

export async function getVehicleIndex(): Promise<VehicleSummary[]> {
  if (indexCache) return indexCache;
  const data = await wg<Record<string, RawVehicleListEntry | null>>('/encyclopedia/vehicles/', {
    fields: 'tank_id,name,short_name,nation,tier,type,is_premium',
    language: 'fr',
  });
  const list: VehicleSummary[] = [];
  for (const v of Object.values(data)) {
    if (!v) continue;
    list.push({
      tankId: v.tank_id,
      name: v.name ?? '',
      shortName: v.short_name ?? '',
      nation: v.nation ?? '',
      tier: v.tier ?? 0,
      type: v.type ?? '',
      isPremium: Boolean(v.is_premium),
    });
  }
  indexCache = list;
  return list;
}

export interface VehicleSearchResult {
  best: VehicleSummary;
  alternatives: VehicleSummary[];
}

/**
 * Recherche un char par nom. Priorité : nom court exact → nom exact →
 * "commence par" → "contient". En cas de résultats multiples, `alternatives`
 * liste quelques autres correspondances (par tier décroissant).
 */
export async function searchVehicle(query: string): Promise<VehicleSearchResult | null> {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return null;
  const index = await getVehicleIndex();

  const norm = (s: string) => s.toLowerCase();
  const exactShort = index.filter((v) => norm(v.shortName) === q);
  const exactName = index.filter((v) => norm(v.name) === q);
  const startsWith = index.filter(
    (v) => norm(v.name).startsWith(q) || norm(v.shortName).startsWith(q),
  );
  const contains = index.filter(
    (v) => norm(v.name).includes(q) || norm(v.shortName).includes(q),
  );

  const ranked = [...exactShort, ...exactName, ...startsWith, ...contains];
  // Déduplique en conservant l'ordre de priorité.
  const seen = new Set<number>();
  const unique: VehicleSummary[] = [];
  for (const v of ranked) {
    if (seen.has(v.tankId)) continue;
    seen.add(v.tankId);
    unique.push(v);
  }
  if (unique.length === 0) return null;

  const best = unique[0];
  const alternatives = unique
    .slice(1)
    .sort((a, b) => b.tier - a.tier)
    .slice(0, 5);
  return { best, alternatives };
}

export interface VehicleDetail {
  tankId: number;
  name: string;
  nation: string;
  tier: number;
  type: string;
  isPremium: boolean;
  description: string | null;
  imageUrl: string | null;
  hp: number | null;
  speedForward: number | null;
  enginePower: number | null;
  gunName: string | null;
  fireRate: number | null;
  aimTime: number | null;
  dispersion: number | null;
  reloadTime: number | null;
  damage: number | null;
  penetration: number | null;
  viewRange: number | null;
  weight: number | null;
}

interface RawShell {
  type?: string;
  damage?: number[];
  penetration?: number[];
}

interface RawVehicleDetail {
  tank_id: number;
  name: string;
  nation: string;
  tier: number;
  type: string;
  is_premium: boolean;
  description?: string | null;
  images?: { big_icon?: string; contour_icon?: string } | null;
  default_profile?: {
    hp?: number;
    speed_forward?: number;
    weight?: number;
    max_weight?: number;
    hull_weight?: number;
    engine?: { power?: number } | null;
    turret?: { view_range?: number } | null;
    gun?: {
      name?: string;
      fire_rate?: number;
      aim_time?: number;
      dispersion?: number;
      reload_time?: number;
    } | null;
    ammo?: RawShell[] | null;
  } | null;
}

/** Détails complets d'un char via l'API Encyclopedia. */
export async function getVehicleDetail(tankId: number): Promise<VehicleDetail | null> {
  const data = await wg<Record<string, RawVehicleDetail | null>>('/encyclopedia/vehicles/', {
    tank_id: String(tankId),
    fields:
      'tank_id,name,nation,tier,type,is_premium,description,images,' +
      'default_profile.hp,default_profile.speed_forward,default_profile.weight,' +
      'default_profile.engine.power,default_profile.turret.view_range,' +
      'default_profile.gun.name,default_profile.gun.fire_rate,default_profile.gun.aim_time,' +
      'default_profile.gun.dispersion,default_profile.gun.reload_time,' +
      'default_profile.ammo.type,default_profile.ammo.damage,default_profile.ammo.penetration',
    language: 'fr',
  });

  const v = data?.[String(tankId)];
  if (!v) return null;

  const profile = v.default_profile ?? {};
  const shell = profile.ammo?.[0];
  const avg = (arr?: number[]): number | null =>
    Array.isArray(arr) && arr.length >= 2 ? (arr[1] ?? null) : null;

  return {
    tankId: v.tank_id,
    name: v.name ?? '',
    nation: v.nation ?? '',
    tier: v.tier ?? 0,
    type: v.type ?? '',
    isPremium: Boolean(v.is_premium),
    description: v.description ?? null,
    imageUrl: v.images?.big_icon ?? v.images?.contour_icon ?? null,
    hp: profile.hp ?? null,
    speedForward: profile.speed_forward ?? null,
    enginePower: profile.engine?.power ?? null,
    gunName: profile.gun?.name ?? null,
    fireRate: profile.gun?.fire_rate ?? null,
    aimTime: profile.gun?.aim_time ?? null,
    dispersion: profile.gun?.dispersion ?? null,
    reloadTime: profile.gun?.reload_time ?? null,
    damage: avg(shell?.damage),
    penetration: avg(shell?.penetration),
    viewRange: profile.turret?.view_range ?? null,
    weight: profile.weight != null ? profile.weight / 1000 : null,
  };
}
