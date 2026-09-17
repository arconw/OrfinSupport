import type { DemoCopy } from './types';

export const fr = {
  sections: {
    welcome: {
      title: 'Votre espace de travail en un regard',
      description:
        'Northstar rassemble projets, personnes et tâches. Cet espace fictif sert à présenter OrfinSupport.',
    },
    projects: {
      title: 'Projets actifs',
      description:
        'Suivez l’avancement et les échéances. Brand refresh est à 72 % et Website experience à 48 %. Ouvrez une fiche pour en savoir plus.',
    },
    capacity: {
      title: 'Rythme de l’équipe',
      description:
        'Le graphique montre les tâches terminées chaque jour et aide à repérer les journées chargées.',
    },
    activity: {
      title: 'Les dernières nouvelles',
      description:
        'Retrouvez les étapes des projets, les nouveaux fichiers et les actualités de l’équipe au même endroit.',
    },
    tasks: {
      title: 'Vos prochaines étapes',
      description:
        'Cochez les tâches terminées ou ouvrez vos projets pour voir l’ensemble du travail.',
    },
    'project-board': {
      title: 'Tous les projets',
      description: 'Filtrez les projets par statut, créez un projet et consultez ses détails.',
    },
    knowledge: {
      title: 'Documentation de l’équipe',
      description:
        'Retrouvez le guide d’accueil, le processus de livraison et l’offre Studio. Orfin peut utiliser ces articles pour répondre.',
    },
    settings: {
      title: 'Préférences de l’assistant',
      description:
        'Choisissez le thème et la langue, activez les fonctions et réglez la mémoire. Les changements s’appliquent immédiatement à Orfin.',
    },
  },
  plan: 'L’offre Studio de démonstration coûte $24 par personne et par mois, avec des projets illimités, des invités et 100 Go. L’équipe compte 12 personnes. Ces données sont fictives et aucun paiement n’a lieu.',
  capacity:
    'L’équipe de démonstration compte 12 personnes et 48 jours disponibles. 36 jours sont planifiés, soit 75 % de capacité. Il reste 12 jours libres.',
  privacy:
    'Par défaut, Orfin lit uniquement les sections marquées. Le contexte de toute la page est facultatif. Les champs de saisie et les zones data-orfin-private sont exclus. L’historique peut être effacé dans les préférences.',
  followup: 'Posez une autre question ou poursuivez votre découverte du projet.',
  planTitle: 'Votre offre Studio',
} satisfies DemoCopy;
