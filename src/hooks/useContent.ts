import { useSiteContent, type ContentMap } from '@/features/content/queries';

const DEFAULTS: Record<string, string> = {
  hero_video_url: '',
  hero_poster_url: '',
  hero_eyebrow: 'World of Tanks — Clan FR',
  hero_title: 'LE CLAN ATFR',
  hero_subtitle: 'Compétitif, stratégique, communautaire.',
  hero_cta_primary: 'Nous rejoindre',
  hero_cta_secondary: 'Découvrir le clan',
  about_eyebrow: 'À propos',
  about_title: 'Un clan forgé par la stratégie',
  about_text:
    "ATFR réunit des joueurs passionnés autour d'un objectif commun : progresser ensemble et exceller en compétition.",
  activities_eyebrow: 'Ce que nous faisons',
  activities_title: 'Nos activités',
  activity_1_title: 'Entraînements',
  activity_1_text:
    'Sessions hebdomadaires pour affiner tactiques et coordination.',
  activity_1_image: '',
  activity_2_title: 'Tournois & compétitions',
  activity_2_text:
    'Participations régulières aux tournois officiels et communautaires.',
  activity_2_image: '',
  activity_3_title: 'Événements spéciaux',
  activity_3_text:
    'Soirées à thème, batailles fun et streams communautaires.',
  activity_3_image: '',
  cta_title: 'Prêt à rejoindre l’aventure ?',
  cta_text:
    'Le clan recrute des joueurs motivés et stratégiques. Postule en 2 minutes.',
  highlights_eyebrow: 'Moments forts',
  highlights_title: 'Nos fiertés',
  achievements_eyebrow: 'Palmarès',
  achievements_title: 'Trophées & classements',
  testimonials_eyebrow: 'Témoignages',
  testimonials_title: 'La parole aux membres',
};

export function useContent() {
  const { data, isLoading } = useSiteContent();
  const get = (key: string): string =>
    (data as ContentMap | undefined)?.[key]?.value || DEFAULTS[key] || '';
  return { get, isLoading };
}
