import type { DemoCopy } from './types';

export const es = {
  sections: {
    welcome: {
      title: 'Tu espacio de trabajo de un vistazo',
      description:
        'Northstar reúne proyectos, personas y tareas. Es un espacio de trabajo ficticio creado para mostrar OrfinSupport.',
    },
    projects: {
      title: 'Proyectos activos',
      description:
        'Sigue el progreso y los plazos. Brand refresh está al 72% y Website experience al 48%. Abre una tarjeta para ver los detalles.',
    },
    capacity: {
      title: 'Ritmo del equipo',
      description:
        'El gráfico muestra las tareas completadas cada día y ayuda a detectar los días de mayor actividad.',
    },
    activity: {
      title: 'Qué está pasando',
      description:
        'Consulta los hitos, los archivos nuevos y las novedades del equipo en una sola línea de tiempo.',
    },
    tasks: {
      title: 'Tus próximos pasos',
      description:
        'Marca las tareas completadas o abre tus proyectos para ver el panorama completo.',
    },
    'project-board': {
      title: 'Todos los proyectos',
      description: 'Filtra los proyectos por estado, crea uno nuevo y consulta sus detalles.',
    },
    knowledge: {
      title: 'Conocimiento del equipo',
      description:
        'Encuentra la guía de incorporación, el proceso de entrega y el plan Studio. Orfin puede usar estos artículos para responder.',
    },
    settings: {
      title: 'Preferencias del asistente',
      description:
        'Elige un tema y un idioma, activa funciones y decide qué recordar. Los cambios se aplican a Orfin al instante.',
    },
  },
  plan: 'El plan Studio de demostración cuesta $24 por miembro al mes e incluye proyectos ilimitados, invitados y 100 GB. El equipo tiene 12 miembros. Son datos ficticios y no se realizan cobros.',
  capacity:
    'El equipo de muestra tiene 12 personas y 48 días disponibles. Hay 36 días planificados: un 75% de capacidad. Quedan 12 días libres.',
  privacy:
    'Orfin solo lee las secciones marcadas por defecto. El contexto de toda la página es opcional. Los campos de entrada y las áreas data-orfin-private se excluyen. Puedes borrar el historial en las preferencias.',
  followup: 'Haz otra pregunta o sigue explorando el proyecto.',
  planTitle: 'Tu plan Studio',
} satisfies DemoCopy;
