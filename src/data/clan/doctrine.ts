import type { DoctrineSection } from '@/features/clan/types';

export const DOCTRINE: DoctrineSection[] = [
  {
    id: 'esprit',
    title: 'Esprit général ATFR',
    icon: 'Shield',
    items: [
      'Chez ATFR, on cherche à progresser collectivement, pas seulement individuellement.',
      'Le but n\'est pas seulement d\'avoir de bonnes stats — c\'est de mieux jouer ensemble.',
      'On respecte les callers même si on n\'est pas d\'accord sur le moment.',
      'On ne troll pas, on ne tilte pas, on ne blâme pas après une game.',
      'Les erreurs sont normales — ce qui compte, c\'est d\'en tirer une leçon.',
    ],
  },
  {
    id: 'bataille',
    title: 'En bataille',
    icon: 'Swords',
    items: [
      'Tu suis le call immédiatement — pas après avoir "fini ton tir".',
      'Tu gardes ton calme quelle que soit la situation.',
      'Tu annonces les infos utiles : "TD flanc gauche", "cap", "ennemi pénétrable là".',
      'Tu évites les débats pendant l\'action — ça peut attendre la fin de la game.',
      'Tu gardes tes HP quand ton rôle l\'exige (MT et LT surtout).',
      'Tu prends tes responsabilités quand tu es full HP et que les alliés ont besoin.',
      'Tu acceptes la critique après la game si elle sert à progresser.',
    ],
  },
  {
    id: 'preparation',
    title: 'Avant une session clan',
    icon: 'ClipboardList',
    items: [
      'Ton char doit être équipé selon les recommandations de la section Fiches chars.',
      'Ton équipage doit être correct (au minimum frères d\'armes).',
      'Tes consommables doivent être prêts avant de rentrer en salle d\'attente.',
      'Ton vocal doit fonctionner — pas d\'excuse technique non signalée à l\'avance.',
      'Tu dois être disponible entre les games — pas de pause imprévue longue.',
      'Si tu dois partir tôt, dis-le au caller AVANT le début de la session.',
    ],
  },
  {
    id: 'grind',
    title: 'Priorités de grind',
    icon: 'TrendingUp',
    items: [
      'Priorité absolue : Object 277, CS-63, EBR 105, Super Conqueror.',
      'Très utile en CW : 60TP, Vz. 55, Strv 103B.',
      'Pour les objectifs spécifiques du mois, surveille les announcements Discord.',
      'Les chars de tier 8-9 peuvent être utiles en bastion — demande au staff avant de grinder.',
      'N\'hésite pas à demander des conseils sur le char à grinder selon ton style de jeu.',
    ],
  },
  {
    id: 'vocal',
    title: 'Comportement en vocal',
    icon: 'Mic',
    items: [
      'Micro en sourdine si tu n\'as rien d\'utile à dire.',
      'Pas de musique, pas de bruit de fond excessif.',
      'Les "bg", "noob" et plaintes sont interdits pendant la session.',
      'Si tu veux proposer une strat ou signaler un problème, demande la parole au caller.',
      'Les discussions off-topic se font après la game ou sur le canal off-topic Discord.',
      'Règle ton volume pour être audible sans crafter.',
    ],
  },
  {
    id: 'reguliers',
    title: 'Attentes pour les joueurs réguliers',
    icon: 'Users',
    items: [
      'Participer aux sessions CW dès que possible.',
      'Avoir au minimum 2 chars compétitifs tier 10 équipés.',
      'Lire les fiches chars et les stratégies de la section Tactiques clan.',
      'Signaler les absences à l\'avance sur Discord.',
      'Progresser régulièrement en WN8 et en travail d\'équipe.',
    ],
  },
  {
    id: 'callers',
    title: 'Attentes pour les callers et officiers',
    icon: 'Star',
    items: [
      'Préparer le briefing avant la session (tanks demandés, cartes à réviser, strats).',
      'Annoncer les calls clairement et simplement — pas trop de détails en cours de game.',
      'Faire un debrief rapide après chaque game (ce qui a marché, ce qui n\'a pas marché).',
      'Rester calme même sous pression — ton attitude influence tout le monde.',
      'Mettre à jour les fiches chars et strats quand le méta change.',
    ],
  },
];

export const DOCTRINE_INTRO = `Chez ATFR, on cherche à progresser collectivement. Cette doctrine définit ce qu'on attend de chaque membre pour que nos sessions soient efficaces, agréables et progressives.`;
