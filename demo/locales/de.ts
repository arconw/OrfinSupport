import type { DemoCopy } from './types';

export const de = {
  sections: {
    welcome: {
      title: 'Dein Arbeitsbereich auf einen Blick',
      description:
        'Northstar verbindet Projekte, Menschen und Aufgaben. Dieser fiktive Arbeitsbereich zeigt die Funktionen von OrfinSupport.',
    },
    projects: {
      title: 'Aktive Projekte',
      description:
        'Verfolge Fortschritt und Termine. Brand refresh ist zu 72 % fertig, Website experience zu 48 %. Öffne eine Projektkarte für Details.',
    },
    capacity: {
      title: 'Teamrhythmus',
      description:
        'Das Diagramm zeigt abgeschlossene Aufgaben pro Tag und hilft dir, besonders volle Tage zu erkennen.',
    },
    activity: {
      title: 'Was gerade passiert',
      description:
        'Hier findest du Projektmeilensteine, neue Dateien und Neuigkeiten aus dem Team an einem Ort.',
    },
    tasks: {
      title: 'Deine nächsten Schritte',
      description:
        'Hake erledigte Aufgaben ab oder öffne deine Projekte für den vollständigen Überblick.',
    },
    'project-board': {
      title: 'Alle Projekte',
      description:
        'Filtere Projekte nach Status, erstelle neue Projekte und sieh dir ihre Details an.',
    },
    knowledge: {
      title: 'Teamwissen',
      description:
        'Hier findest du den Einstiegsleitfaden, den Übergabeprozess und den Studio-Tarif. Orfin kann diese Artikel für Antworten nutzen.',
    },
    settings: {
      title: 'Assistenten-Einstellungen',
      description:
        'Wähle Design und Sprache, aktiviere Funktionen und lege fest, was gespeichert wird. Änderungen gelten sofort für Orfin.',
    },
  },
  plan: 'Der fiktive Studio-Tarif kostet $24 pro Person und Monat, mit unbegrenzten Projekten, Gästen und 100 GB Speicher. Das Team hat 12 Mitglieder. In dieser Demo wird nichts berechnet.',
  capacity:
    'Das Beispielteam hat 12 Mitglieder und 48 verfügbare Tage. 36 Tage sind verplant: 75 % Auslastung. 12 Tage sind noch frei.',
  privacy:
    'Orfin liest standardmäßig nur markierte Bereiche. Der ganze Seiteninhalt ist optional. Eingabefelder und Bereiche mit data-orfin-private sind ausgeschlossen. Den Verlauf kannst du in den Einstellungen löschen.',
  followup: 'Stelle eine weitere Frage oder erkunde das Projekt weiter.',
  planTitle: 'Dein Studio-Tarif',
} satisfies DemoCopy;
