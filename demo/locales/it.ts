import type { DemoCopy } from './types';

export const it = {
  sections: {
    welcome: {
      title: 'Il tuo spazio di lavoro a colpo d’occhio',
      description:
        'Northstar riunisce progetti, persone e attività. È uno spazio fittizio creato per mostrare OrfinSupport.',
    },
    projects: {
      title: 'Progetti attivi',
      description:
        'Segui progressi e scadenze. Brand refresh è al 72% e Website experience al 48%. Apri una scheda per vedere i dettagli.',
    },
    capacity: {
      title: 'Ritmo del team',
      description:
        'Il grafico mostra le attività completate ogni giorno e aiuta a individuare le giornate più impegnative.',
    },
    activity: {
      title: 'Cosa succede',
      description:
        'Trova traguardi dei progetti, nuovi file e aggiornamenti del team in un unico posto.',
    },
    tasks: {
      title: 'I tuoi prossimi passi',
      description:
        'Segna le attività completate o apri i progetti per avere una visione d’insieme.',
    },
    'project-board': {
      title: 'Tutti i progetti',
      description: 'Filtra i progetti per stato, creane di nuovi e consulta i dettagli.',
    },
    knowledge: {
      title: 'Conoscenze del team',
      description:
        'Trova la guida iniziale, il processo di consegna e il piano Studio. Orfin può usare questi articoli per rispondere.',
    },
    settings: {
      title: 'Preferenze dell’assistente',
      description:
        'Scegli tema e lingua, attiva le funzioni e decidi cosa ricordare. Le modifiche vengono applicate subito a Orfin.',
    },
  },
  plan: 'Il piano Studio dimostrativo costa $24 a persona al mese, con progetti illimitati, ospiti e 100 GB. Il team conta 12 persone. I dati sono fittizi e non vengono effettuati addebiti.',
  capacity:
    'Il team di esempio ha 12 persone e 48 giorni disponibili. Sono pianificati 36 giorni: il 75% della capacità. Restano 12 giorni liberi.',
  privacy:
    'Orfin legge solo le sezioni contrassegnate per impostazione predefinita. Il contesto dell’intera pagina è facoltativo. I campi di input e le aree data-orfin-private sono esclusi. Puoi cancellare la cronologia nelle preferenze.',
  followup: 'Fai un’altra domanda o continua a esplorare il progetto.',
  planTitle: 'Il tuo piano Studio',
} satisfies DemoCopy;
