import type { LucideIcon } from 'lucide-react';
import { BookOpen, Map } from 'lucide-react';

// Pôle "Modules" : guide pédagogique + mini-jeux thématiques.
// La visibilité publique et les overrides éditoriaux (titre, description,
// badge) viennent de la table `learning_modules`. Tout le reste — icône,
// composant React, route, copy par défaut — vit ici dans le code.
export interface ModuleDefinition {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Route relative au préfixe /modules. */
  path: string;
  /** Classes Tailwind pour la bordure d'accent de la carte. */
  accentBorder: string;
  /** Classes Tailwind pour le gradient haut de carte (from-/to-). */
  accentGradient: string;
  /** Court tag affiché sous le titre dans le hub. */
  category: 'pédagogie' | 'jeu' | 'outil';
  /** Texte du CTA par défaut sur la carte. */
  cta: string;
  /** Affiche un état "implémentation à venir" tant que le composant n'est
   * pas prêt — la carte reste cliquable mais on annonce clairement le
   * statut. */
  comingSoon?: boolean;
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    slug: 'guide-bots',
    title: 'Guide pour les bots',
    description:
      'Un test type code de la route. Une situation, une question, plusieurs réponses crédibles, une seule bonne réponse — et une explication. Pédagogique, parodique, utile.',
    icon: BookOpen,
    path: 'guide-bots',
    accentBorder: 'border-atfr-gold/40',
    accentGradient: 'from-atfr-gold/30 to-transparent',
    category: 'pédagogie',
    cta: 'Commencer le test',
    comingSoon: true,
  },
  {
    slug: 'wot-geoguesser',
    title: 'WoT Géoguesseur',
    description:
      'Une capture, deviner la map. Mini-jeu chronométré, score à la clé, classement clan.',
    icon: Map,
    path: 'wot-geoguesser',
    accentBorder: 'border-emerald-400/40',
    accentGradient: 'from-emerald-500/25 to-transparent',
    category: 'jeu',
    cta: 'Lancer une partie',
    comingSoon: true,
  },
];

export function getModule(slug: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((m) => m.slug === slug);
}
