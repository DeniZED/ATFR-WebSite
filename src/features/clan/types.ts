export type ClanPriority = 'prioritaire' | 'utile' | 'situationnel' | 'non_recommande';
export type GameMode = 'cw' | 'bastion' | 'offensive' | 'peloton' | 'random';
export type TankClass = 'HT' | 'MT' | 'LT' | 'TD' | 'SPG';

export interface Equipment {
  name: string;
  reason?: string;
}

export interface CrewSkill {
  name: string;
  priority: number;
  reason?: string;
}

export interface TankEntry {
  slug: string;
  name: string;
  nation: string;
  tier: number;
  class: TankClass;
  clan_priority: ClanPriority;
  modes: GameMode[];
  role_in_battle: string;
  gameplay_type: string;
  summary: string;
  equipments: Equipment[];
  alt_equipments?: Equipment[];
  crew_skills: CrewSkill[];
  consumables: string[];
  field_mods?: string;
  ammo_setup?: string;
  do_list: string[];
  dont_list: string[];
  image_url?: string;
  tags: string[];
  validated_by: string;
  updated_at: string;
}

export interface RoleEntry {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  mission: string;
  priorities: string[];
  mistakes: string[];
  positioning: string;
  hp_management: string;
  timing: string;
  example_tanks: string[];
  modes: GameMode[];
  tags: string[];
  updated_at: string;
}

export interface StrategyEntry {
  slug: string;
  title: string;
  category: string;
  modes: GameMode[];
  tags: string[];
  summary: string;
  rules: string[];
  example: string;
  common_mistakes: string[];
  caller_phrase?: string;
  player_actions: string[];
  validated_by: string;
  updated_at: string;
}

export interface SpawnPosition {
  name: string;
  role: string;
  notes?: string;
}

export interface MapEntry {
  slug: string;
  name: string;
  modes: GameMode[];
  priority: ClanPriority;
  map_type: string;
  spawn_a: SpawnPosition[];
  spawn_b: SpawnPosition[];
  recommended_roles: string[];
  recommended_tanks: string[];
  strat_simple: string;
  strat_advanced: string;
  common_mistakes: string[];
  caller_notes: string;
  map_image_url?: string;
  tags: string[];
  validated_by: string;
  updated_at: string;
}

export interface LinkEntry {
  id: string;
  title: string;
  url: string;
  category: 'stats' | 'comparaison' | 'blindage' | 'maps' | 'officiel' | 'clan' | 'interne';
  description: string;
  tags: string[];
}

export interface DoctrineSection {
  id: string;
  title: string;
  icon: string;
  items: string[];
}
