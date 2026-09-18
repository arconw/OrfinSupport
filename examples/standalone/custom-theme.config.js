// Appearance and local tour, with no server or model calls.
window.orfin = OrfinSupport.createOrfin({
  locale: 'en',
  theme: 'none',
  initiallyOpen: true,
  memory: { storage: 'none' },
  features: { chat: false, hoverHelp: false },
  menuActions: ['tour', 'pick'],
  styles: `
    :host { --orfin-accent: #16665b; --orfin-font: Georgia, serif; }
    .panel { background: #fffdf5; color: #173b36; border: 2px solid #16665b; border-radius: 20px; box-shadow: 0 16px 48px #173b3626; }
    button, input, textarea, select { font: inherit; color: inherit; }
    button { background: #e5f1eb; border: 1px solid #8eafa3; border-radius: 8px; padding: 8px; }
    button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid #b55e19; outline-offset: 3px; }
    .header, .composer { padding: 16px; }
    .conversation { padding: 20px; }
    .launcher { background: #16665b; color: white; border-radius: 50%; }
  `,
});
