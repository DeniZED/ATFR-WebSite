// API Constants
export const API_URL = 'https://votre-serveur.com/api';
export const API_KEY = '6de9de98abd254ebc17dfa65ed9b17b6';
export const CLAN_ID = '500191501';
export const WOT_API = 'https://api.worldoftanks.eu/wot';

// Discord Constants
export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1303716498749264053/pss6pxCyqr7clvQsqAkQXVKXPQcpmi3SlA45kAQkALlSgauL44qVH37u4AQ2WFsrxzEq';

// Role Constants
export const ROLE_PRIORITY: Record<string, number> = {
  "commander": 1,
  "executive_officer": 2,
  "personnel_officer": 3,
  "combat_officer": 4,
  "intelligence_officer": 5,
  "quartermaster": 6,
  "recruitment_officer": 7,
  "junior_officer": 8,
  "private": 9,
  "recruit": 10,
  "reservist": 11
};

export const ROLE_TRANSLATIONS: Record<string, string> = {
  "commander": "Commandant",
  "executive_officer": "Commandant en second",
  "personnel_officer": "Officier du personnel",
  "combat_officer": "Officier de combat",
  "intelligence_officer": "Officier du renseignement",
  "quartermaster": "Quartier-maître",
  "recruitment_officer": "Recruteur",
  "junior_officer": "Officier subalterne",
  "private": "Soldat",
  "recruit": "Recrue",
  "reservist": "Réserviste"
};

// Event Constants
export const EVENT_TYPES = [
  "Entraînement",
  "Compétition",
  "Tournoi",
  "Réunion",
  "Événement Spécial"
];

// Clan Constants
export const CLANS = [
  { id: "500191501", name: "ATFR" },
  { id: "500197997", name: "A-T-O" }
];

// Availability Constants
export const DAYS = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi',
  'Vendredi', 'Samedi', 'Dimanche'
];

export const HOURS = [
  'Matin (8h-12h)',
  'Après-midi (12h-18h)',
  'Soir (18h-22h)',
  'Nuit (22h-00h)'
];