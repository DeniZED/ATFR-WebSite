import {
  BookOpen,
  Calendar,
  FileText,
  Gauge,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Map,
  Settings,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Type,
  UserCog,
  Users,
} from 'lucide-react';

// Configuration de navigation admin partagée entre la sidebar (AdminLayout)
// et la palette de commandes (CommandPalette). Une seule source pour les
// libellés, routes, icônes et clés de module.

export interface NavItem {
  to: string;
  label: string;
  icon: typeof Gauge;
  end?: boolean;
  moduleKey?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Entrées hors groupe, toujours en tête. */
export const topNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
];

/** Regroupement thématique de la sidebar. */
export const navGroups: NavGroup[] = [
  {
    id: 'effectif',
    label: 'Recrutement & effectif',
    items: [
      { to: '/admin/candidatures', label: 'Candidatures', icon: FileText, moduleKey: 'candidatures' },
      { to: '/admin/membres', label: 'Membres', icon: Users, moduleKey: 'membres' },
      { to: '/admin/rh', label: 'RH joueurs', icon: UserCog, moduleKey: 'rh' },
    ],
  },
  {
    id: 'activite',
    label: 'Activité du clan',
    items: [
      { to: '/admin/evenements', label: 'Événements', icon: Calendar, moduleKey: 'evenements' },
      { to: '/admin/clan-wars', label: 'Clan Wars', icon: Swords, moduleKey: 'clan-wars' },
      { to: '/admin/pages-clan', label: 'Pages clan', icon: Lock, moduleKey: 'pages-clan' },
    ],
  },
  {
    id: 'vitrine',
    label: 'Site vitrine',
    items: [
      { to: '/admin/contenu', label: 'Contenu', icon: Type, moduleKey: 'contenu' },
      { to: '/admin/galerie', label: 'Galerie', icon: ImageIcon, moduleKey: 'galerie' },
      { to: '/admin/moments', label: 'Moments forts', icon: Star, moduleKey: 'moments' },
      { to: '/admin/palmares', label: 'Palmarès', icon: Trophy, moduleKey: 'palmares' },
      { to: '/admin/temoignages', label: 'Témoignages', icon: Sparkles, moduleKey: 'temoignages' },
    ],
  },
  {
    id: 'academie',
    label: 'Académie & mini-jeux',
    items: [
      { to: '/admin/modules', label: 'Académie', icon: GraduationCap, moduleKey: 'modules' },
      { to: '/admin/academie', label: 'Joueurs Académie', icon: GraduationCap, moduleKey: 'academie' },
      { to: '/admin/quiz', label: 'Guide pour les bots', icon: BookOpen, moduleKey: 'quiz' },
      { to: '/admin/geoguesser', label: 'GeoGuesser', icon: Map, moduleKey: 'geoguesser' },
    ],
  },
  {
    id: 'systeme',
    label: 'Système',
    items: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: KeyRound, moduleKey: 'utilisateurs' },
      { to: '/admin/parametres', label: 'Paramètres', icon: Settings, moduleKey: 'parametres' },
    ],
  },
];

export interface FlatNavItem extends NavItem {
  /** Libellé du groupe d'origine (pour l'affichage dans la palette). */
  group: string;
}

/** Aplatit topNav + navGroups en une liste unique, groupe conservé. */
export function flattenNav(): FlatNavItem[] {
  const flat: FlatNavItem[] = topNav.map((item) => ({ ...item, group: 'Général' }));
  for (const group of navGroups) {
    for (const item of group.items) {
      flat.push({ ...item, group: group.label });
    }
  }
  return flat;
}
