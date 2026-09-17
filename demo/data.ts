import type { Section, Source } from '../src/core/types';

export const sections: Section[] = [
  {
    id: 'welcome',
    title: 'Your workspace, at a glance',
    description:
      'Northstar brings your projects, people, and next steps into one calm workspace. Start here to see what your team is working toward.',
    path: '/',
    tourOrder: 0,
    prompt:
      'Explain that Northstar is a fictional creative-team workspace used to demonstrate OrfinSupport.',
  },
  {
    id: 'projects',
    title: 'Active projects',
    description:
      'Follow your team’s work from the first idea to the final handoff. Each project has its own timeline, progress, and people. Open one to see the details.',
    path: '/',
    tourOrder: 1,
  },
  {
    id: 'capacity',
    title: 'Team pulse',
    description:
      'A quick look at your team’s week. The bars show completed tasks, with a daily breakdown. Use it to spot busy days and keep a sustainable pace.',
    path: '/',
    tourOrder: 2,
  },
  {
    id: 'activity',
    title: 'What’s happening',
    description:
      'A shared timeline of project milestones, new files, and team updates. You can catch up without interrupting anyone’s flow.',
    path: '/',
    tourOrder: 3,
  },
  {
    id: 'tasks',
    title: 'Your next steps',
    description:
      'Keep the small things moving. Check off a task when it’s done, or open your projects to see the bigger picture.',
    path: '/',
  },
  {
    id: 'project-board',
    title: 'All projects',
    description:
      'Browse and filter projects by status. Create a project, give it a name, and invite your team to work on it together.',
    path: '/projects',
  },
  {
    id: 'knowledge',
    title: 'Team knowledge',
    description:
      'Find your team’s onboarding guide, delivery process, and workspace plan in one place. Orfin can use these articles to answer your questions.',
    path: '/knowledge',
    prompt:
      'Mention the relevant knowledge source title when answering policy or onboarding questions.',
  },
  {
    id: 'settings',
    title: 'Assistant playground',
    description:
      'Make Orfin feel at home. Change the theme, enable features, choose what it remembers, and try the assistant in your own language.',
    path: '/settings',
  },
];

export const projectContext =
  'Northstar is a fictional project workspace for a small creative studio. The current visitor is Alex Morgan, the workspace owner. There are 12 team members, 8 active projects, 24 completed tasks this week and 92% on-time delivery. Brand refresh is 72% complete (September 28); Website experience is 48% complete (October 4); Mobile companion is 24% complete (October 12). The demo plan is Studio at $24 per member monthly with unlimited projects, guest access, and 100 GB storage. These are fictional demo data, not a commercial offer. Navigation paths: / overview, /projects project board, /knowledge team documentation, /settings assistant settings. OrfinSupport is an open-source embeddable assistant by arconw; the agent name is Orfin. The assistant has a guided tour, section picker, hover help, page navigation, retrieval and custom/MCP tools. Never imply that a mock project is a real production service.';

export const knowledge: Source[] = [
  {
    id: 'onboarding',
    title: 'Getting started with Northstar',
    content:
      'Invite your team from the workspace member list. Start by creating a project, choosing an owner, and setting a due date. Guest collaborators can view only projects shared with them. The Orfin guided tour walks through the overview, projects, team pulse and recent activity.',
    url: '#/knowledge',
  },
  {
    id: 'delivery',
    title: 'From idea to handoff',
    content:
      'Projects move from In progress to In review and then Done. A handoff includes approved design files, a short decision log, and an owner for the next step. The Brand refresh is in progress at 72%, with a September 28 due date. Website experience is at 48%, due October 4.',
    url: '#/knowledge',
  },
  {
    id: 'plan',
    title: 'Your Studio plan',
    content:
      'The fictional Northstar Studio plan costs $24 per team member per month. It includes unlimited projects, external guests and 100 GB of shared storage. The current team has 12 members. Billing changes are managed by the workspace owner. This demo never charges money.',
    url: '#/knowledge',
  },
  {
    id: 'privacy',
    title: 'A thoughtful assistant',
    content:
      'Orfin uses explicitly marked page sections by default. Whole-page context is opt-in. Inputs and sections marked data-orfin-private are excluded from extracted context. Hover choices can be remembered for the session, locally, or not persisted. Clear section history in assistant preferences. Provider keys belong in a backend environment, never in browser JavaScript.',
    url: '#/knowledge',
  },
];

export const initialProjects = [
  {
    id: 'brand',
    name: 'Brand refresh',
    category: 'Brand & identity',
    progress: 72,
    due: 'Sep 28',
    color: 'peach',
    status: 'In progress',
    initials: ['JD', 'MK', 'AL'],
    description:
      'A clearer identity for the next chapter. Strategy, visual language, and all the little details that make a brand feel like itself.',
  },
  {
    id: 'website',
    name: 'Website experience',
    category: 'Design & development',
    progress: 48,
    due: 'Oct 04',
    color: 'lavender',
    status: 'In progress',
    initials: ['SN', 'JD', 'RB'],
    description:
      'A thoughtful new home on the web. Research, design, and development for a site that is easy to explore and a pleasure to use.',
  },
  {
    id: 'mobile',
    name: 'Mobile companion',
    category: 'Product design',
    progress: 24,
    due: 'Oct 12',
    color: 'green',
    status: 'In review',
    initials: ['AL', 'MK'],
    description:
      'The right things, wherever you are. Bringing the essential workspace experience to a small screen.',
  },
];
export type Project = (typeof initialProjects)[number];
