import type { DemoCopy } from './types';

export const pl = {
  sections: {
    welcome: {
      title: 'Twoja przestrzeń w skrócie',
      description:
        'Northstar łączy projekty, zespół i zadania. To fikcyjna przestrzeń pokazująca możliwości OrfinSupport.',
    },
    projects: {
      title: 'Aktywne projekty',
      description:
        'Śledź postępy i terminy. Brand refresh jest gotowy w 72%, a Website experience w 48%. Otwórz kartę projektu, aby poznać szczegóły.',
    },
    capacity: {
      title: 'Rytm zespołu',
      description:
        'Wykres pokazuje ukończone zadania w poszczególnych dniach i pomaga zauważyć większe obciążenie.',
    },
    activity: {
      title: 'Co się dzieje',
      description: 'Zobacz etapy projektów, nowe pliki i aktualności zespołu w jednym miejscu.',
    },
    tasks: {
      title: 'Twoje kolejne kroki',
      description: 'Oznaczaj wykonane zadania lub otwórz projekty, aby zobaczyć całość pracy.',
    },
    'project-board': {
      title: 'Wszystkie projekty',
      description: 'Filtruj projekty według statusu, twórz nowe i sprawdzaj ich szczegóły.',
    },
    knowledge: {
      title: 'Wiedza zespołu',
      description:
        'Znajdziesz tu przewodnik dla nowych osób, proces przekazania pracy i plan Studio. Orfin korzysta z tych artykułów w odpowiedziach.',
    },
    settings: {
      title: 'Ustawienia asystenta',
      description:
        'Wybierz motyw i język, włącz funkcje i zdecyduj, co zapamiętywać. Zmiany od razu dotyczą Orfin.',
    },
  },
  plan: 'Demonstracyjny plan Studio kosztuje $24 za osobę miesięcznie i obejmuje nielimitowane projekty, gości oraz 100 GB. Zespół liczy 12 osób. Dane są fikcyjne i nie pobieramy opłat.',
  capacity:
    'Przykładowy zespół liczy 12 osób i ma 48 dostępnych dni. Zaplanowano 36 dni, czyli 75% obciążenia. Pozostało 12 wolnych dni.',
  privacy:
    'Domyślnie Orfin odczytuje tylko oznaczone sekcje. Kontekst całej strony jest opcjonalny. Pola formularzy i obszary data-orfin-private są wykluczone. Historię można wyczyścić w ustawieniach.',
  followup: 'Zadaj kolejne pytanie lub kontynuuj poznawanie projektu.',
  planTitle: 'Twój plan Studio',
} satisfies DemoCopy;
