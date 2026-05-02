import { useSiteContent, type ContentMap } from '@/features/content/queries';

const DEFAULTS: Record<string, string> = {
  hero_video_url: '',
  hero_poster_url: '',
  hero_eyebrow: 'World of Tanks — Clan FR',
  hero_title: 'LE CLAN ATFR',
  hero_subtitle: 'Compétitif, stratégique, communautaire.',
  hero_cta_primary: 'Nous rejoindre',
  hero_cta_secondary: 'Découvrir le clan',
  hero_signal_1_label: 'Structure',
  hero_signal_1_value: 'Clan organisé',
  hero_signal_2_label: 'Académie',
  hero_signal_2_value: 'Outils & tests',
  hero_signal_3_label: 'Discord',
  hero_signal_3_value: 'Vie active',
  why_join_eyebrow: 'Pourquoi ATFR',
  why_join_title: 'Un clan qui aide vraiment à jouer mieux',
  why_join_text:
    'La home doit montrer en quelques secondes que le clan est actif, organisé et utile aux joueurs qui veulent progresser.',
  why_join_1_title: 'Ambiance vocale',
  why_join_1_stat: 'Discord actif',
  why_join_1_text:
    'Un Discord vivant pour lancer des pelotons, organiser les soirées et garder le contact hors bataille.',
  why_join_2_title: 'Progression utile',
  why_join_2_stat: 'Coaching clan',
  why_join_2_text:
    "Des retours concrets, des modules d'académie et des outils pour travailler décision, map awareness et placement.",
  why_join_3_title: 'Jeu structuré',
  why_join_3_stat: 'Objectifs partagés',
  why_join_3_text:
    'Escarmouches, événements et objectifs communs avec une organisation claire sans perdre le plaisir de jouer.',
  why_join_4_title: 'Culture performance',
  why_join_4_stat: 'Stats lisibles',
  why_join_4_text:
    "Des stats suivies, des replays discutés et une envie simple : progresser ensemble sans casser l'ambiance.",
  why_join_path_eyebrow: 'Parcours joueur',
  why_join_path_title: 'De la candidature au vocal, le chemin est plus clair.',
  why_join_path_1_title: 'Postuler avec les infos utiles',
  why_join_path_1_text: 'Le formulaire donne une base propre aux officiers.',
  why_join_path_2_title: 'Passer en vocal et jouer quelques games',
  why_join_path_2_text: 'La vraie compatibilité se voit vite en jeu.',
  why_join_path_3_title: 'Trouver sa place dans les activités du clan',
  why_join_path_3_text: 'Le site devient le hub qui garde tout lisible.',
  why_join_cta: 'Postuler',
  next_operation_eyebrow: 'Agenda clan',
  next_operation_title: 'Prochaine opération',
  next_operation_text:
    'Une home plus vivante montre immédiatement ce qui arrive : entraînement, tournoi, soirée clan ou rendez-vous vocal.',
  next_operation_empty_title: 'Aucun événement public planifié',
  next_operation_empty_text:
    "Ajoute le prochain entraînement ou tournoi depuis l'admin pour le faire apparaître ici automatiquement.",
  next_operation_queue_title: "File d'attente",
  next_operation_queue_empty:
    'Aucun autre événement public à venir. Le prochain ajout admin remontera automatiquement ici.',
  next_operation_default_location: 'Discord / World of Tanks',
  next_operation_cta: 'Agenda',
  next_operation_empty_cta: "Voir l'agenda",
  next_operation_date_label: 'Date',
  next_operation_time_label: 'Horaire',
  next_operation_location_label: 'Lieu',
  academy_preview_eyebrow: 'Académie ATFR',
  academy_preview_title: 'Des outils qui rendent le site vivant',
  academy_preview_text:
    'La page principale peut aussi orienter les joueurs vers les modules, les défis et les contenus utiles du clan.',
  academy_preview_card_title: 'Un hub qui donne envie de revenir.',
  academy_preview_card_text:
    'Les modules transforment le site en espace communautaire : on joue, on apprend, on compare les scores et on garde une trace des défis.',
  academy_preview_cta: 'Voir les modules',
  academy_preview_module_cta: 'Lancer',
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
