// Contrat de réponse de `/.netlify/functions/player-stats` (P3-4) — source de
// vérité unique, partagée entre la fonction Netlify (productrice, import
// type-only effacé au bundling) et le site (consommateur via
// `src/lib/tomato-api.ts`).
//
// Le bot Discord (`discord-bot/src/clan/types.ts`) consomme le même endpoint
// mais garde une copie miroir de ces interfaces : son tsconfig
// (`rootDir: "src"`) ne peut pas importer hors de son arbre sans changer son
// build déployé sur le VPS. Toute évolution ici doit être répercutée là-bas.

/** Stats « récentes » (fenêtre glissante tomato.gg), null si indisponibles. */
export interface PlayerRecentStats {
  battles: number | null;
  winRate: number | null;
  wn8: number | null;
  wnx: number | null;
  avgTier: number | null;
}

export interface PlayerStatsPayload {
  accountId: number;
  nickname: string;
  winRate: number | null;
  battles: number;
  damagePerBattle: number | null;
  wn8: number | null;
  wnx: number | null;
  avgTier: number | null;
  tier10Count: number;
  globalRating: number;
  lastBattleTime: number;
  recent: PlayerRecentStats | null;
  recruitmentScore: number | null;
  recruitmentThresholds: { minWn8: number; minBattles: number };
}
