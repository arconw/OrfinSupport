import type { DemoCopy } from './types';

export const pt = {
  sections: {
    welcome: {
      title: 'Seu espaço de trabalho em um olhar',
      description:
        'Northstar reúne projetos, pessoas e tarefas. É um espaço fictício criado para demonstrar o OrfinSupport.',
    },
    projects: {
      title: 'Projetos ativos',
      description:
        'Acompanhe o progresso e os prazos. Brand refresh está em 72% e Website experience em 48%. Abra um cartão para ver os detalhes.',
    },
    capacity: {
      title: 'Ritmo da equipe',
      description:
        'O gráfico mostra tarefas concluídas por dia e ajuda a identificar os dias mais ocupados.',
    },
    activity: {
      title: 'O que está acontecendo',
      description:
        'Veja etapas dos projetos, arquivos novos e atualizações da equipe em um só lugar.',
    },
    tasks: {
      title: 'Seus próximos passos',
      description: 'Marque as tarefas concluídas ou abra seus projetos para ter uma visão geral.',
    },
    'project-board': {
      title: 'Todos os projetos',
      description: 'Filtre projetos por status, crie novos e consulte seus detalhes.',
    },
    knowledge: {
      title: 'Conhecimento da equipe',
      description:
        'Encontre o guia de integração, o processo de entrega e o plano Studio. Orfin usa esses artigos nas respostas.',
    },
    settings: {
      title: 'Preferências do assistente',
      description:
        'Escolha tema e idioma, ative funções e decida o que lembrar. As mudanças são aplicadas ao Orfin imediatamente.',
    },
  },
  plan: 'O plano Studio de demonstração custa $24 por pessoa ao mês, com projetos ilimitados, convidados e 100 GB. A equipe tem 12 pessoas. Os dados são fictícios e não há cobranças.',
  capacity:
    'A equipe de exemplo tem 12 pessoas e 48 dias disponíveis. Há 36 dias planejados: 75% de capacidade. Restam 12 dias livres.',
  privacy:
    'Por padrão, Orfin lê apenas seções marcadas. O contexto da página inteira é opcional. Campos de entrada e áreas data-orfin-private são excluídos. Limpe o histórico nas preferências.',
  followup: 'Faça outra pergunta ou continue explorando o projeto.',
  planTitle: 'Seu plano Studio',
} satisfies DemoCopy;
