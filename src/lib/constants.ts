import type { EventType, TargetClan } from '@/types/database';

export const CLANS: { id: string; tag: TargetClan; name: string }[] = [
  { id: '500191501', tag: 'ATFR', name: 'ATFR' },
  { id: '500197997', tag: 'A-T-O', name: 'A-T-O' },
];

export const ROLE_PRIORITY: Record<string, number> = {
  commander: 1,
  executive_officer: 2,
  personnel_officer: 3,
  combat_officer: 4,
  intelligence_officer: 5,
  quartermaster: 6,
  recruitment_officer: 7,
  junior_officer: 8,
  private: 9,
  recruit: 10,
  reservist: 11,
};

export const ROLE_TRANSLATIONS: Record<string, string> = {
  commander: 'Commandant',
  executive_officer: 'Commandant en second',
  personnel_officer: 'Officier du personnel',
  combat_officer: 'Officier de combat',
  intelligence_officer: 'Officier du renseignement',
  quartermaster: 'Quartier-maître',
  recruitment_officer: 'Recruteur',
  junior_officer: 'Officier subalterne',
  private: 'Soldat',
  recruit: 'Recrue',
  reservist: 'Réserviste',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  training: 'Entraînement',
  competition: 'Compétition',
  tournament: 'Tournoi',
  meeting: 'Réunion',
  special: 'Événement spécial',
};

export const DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

export const TIME_SLOTS = [
  { id: 'morning', label: 'Matin (8h–12h)' },
  { id: 'afternoon', label: 'Après-midi (12h–18h)' },
  { id: 'evening', label: 'Soir (18h–22h)' },
  { id: 'night', label: 'Nuit (22h–00h)' },
] as const;

export type TimeSlotId = (typeof TIME_SLOTS)[number]['id'];
