import type { Section, Source } from '../src/core/types';
import { sectionTranslations } from './locales';
import { products } from './catalog';

export const workspaceStatistics = {
  plan: 'Studio',
  members: 12,
  activeProjects: 8,
  completedTasks: 24,
  period: 'this week',
  onTimeDelivery: '92%',
} as const;

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
].map((section) => ({ ...section, translations: sectionTranslations(section.id) }));

sections.push(
  {
    id: 'delivery-chart',
    title: 'Delivery, with the evidence',
    description:
      'Compare six weeks of delivered and planned tasks. Orfin reads the delivery ledger to calculate changes and explain what supports each conclusion.',
    path: '/reports',
    prompt:
      'Call get_delivery_report for analysis. Separate observations from causal hypotheses. Show calculations, comparison periods and evidence IDs.',
  },
  {
    id: 'delivery-segments',
    title: 'Two disciplines, different momentum',
    description:
      'Compare Brand and Web on delivered tasks, lead time and rework across equal three-week windows.',
    path: '/reports',
  },
  {
    id: 'delivery-evidence',
    title: 'Behind the numbers',
    description:
      'Read dated observations DL-041 and DL-052. A checklist and documented feedback delays provide context; the report does not prove causation.',
    path: '/reports',
  },
  {
    id: 'equipment-catalog',
    title: 'Tools for thoughtful work',
    description:
      'Browse four fictional studio products, inspect actual specifications and reviews, or ask Orfin to compare displays and add an item to your demonstration cart.',
    path: '/shop',
  },
  {
    id: 'demo-cart',
    title: 'Your equipment shortlist',
    description:
      'A working demo cart with quantities, removal and a calculated total. No checkout or real purchases. Ask Orfin to add a product, then see the change here.',
    path: '/shop',
  },
  {
    id: 'product-comparison',
    title: 'Find your kind of screen',
    description:
      'Compare Luma 27 at $349 and Luma 32 Pro at $599. See size, color coverage, power delivery, desk footprint and limitations side by side.',
    path: '/compare',
  },
  ...products.flatMap((product) => [
    {
      id: `product-${product.id}`,
      title: product.name,
      description: product.description,
      path: `/shop/${product.id}`,
      prompt:
        'Use open_product or browse_products for up-to-date details. Prices in the catalog are cents; convert to USD. Use update_cart for requested cart changes, never claim a change without a tool.',
    },
    {
      id: `reviews-${product.id}`,
      title: `${product.name} customer reviews`,
      description:
        'Read the actual fictional customer reviews and their reasons. Use product_reviews to retrieve a specific rating, and quote only the supplied text.',
      path: `/shop/${product.id}`,
    },
  ]),
);

export const projectContext =
  'Northstar is a fictional project workspace for a small creative studio. The current visitor is Alex Morgan, the workspace owner. Current workspace metrics, including completed task counts, come from the workspace_statistics MCP tool. Brand refresh is 72% complete (September 28); Website experience is 48% complete (October 4); Mobile companion is 24% complete (October 12). The demo plan is Studio at $24 per member monthly with unlimited projects, guest access, and 100 GB storage. These are fictional demo data, not a commercial offer. Navigation paths: / overview, /projects project board, /knowledge team documentation, /settings assistant settings. OrfinSupport is an open-source embeddable assistant by arconw; the agent name is Orfin. The assistant has a guided tour, section picker, hover help, page navigation, retrieval and custom/MCP tools. Never imply that a mock project is a real production service. Additional pages: /reports studio delivery analysis, /shop equipment catalog and demo cart, /compare Luma 27 versus Luma 32 Pro, /shop/luma-27, /shop/luma-32-pro, /shop/arc-light, /shop/field-carry product details. For analytical questions call get_delivery_report and explain numeric changes, supporting evidence, and uncertainty about causes. For product facts call browse_products/open_product/compare_products/product_reviews. The second display means Luma 32 Pro. For requested cart mutations ALWAYS call update_cart; get_cart reads current state. Cart contents are per visitor and must never be inferred from history. No payments or checkout exist. If asked to open AND add, call open_product and update_cart. If only asked to compare or read reviews, do not change the cart. Respect the selected response locale.';

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
