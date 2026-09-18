// Host this page and /api/orfin on the same origin.
// Provider API keys belong on the server, never in this file.
window.orfin = OrfinSupport.createOrfin({
  endpoint: '/api/orfin',
  locale: 'en',
  theme: 'cloud',
  initiallyOpen: true,
  memory: { storage: 'session', ttlMs: 86400000 },
  features: { hoverHelp: false, pageContext: 'sections' },
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Start here to learn about the product.',
      tourOrder: 0,
    },
    { id: 'plans', title: 'Plans', description: 'Compare the two example plans.', tourOrder: 1 },
  ],
});
