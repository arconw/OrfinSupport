// Offline demonstration only: replace transport with endpoint for real AI.
window.orfin = OrfinSupport.createOrfin({
  locale: 'en',
  theme: 'iris',
  initiallyOpen: true,
  memory: { storage: 'none' },
  features: { hoverHelp: false },
  transport: {
    async *stream() {
      yield {
        type: 'delta',
        text: 'This reply runs entirely in your browser. Try the guided tour in Actions, or switch to the backend example to connect your own AI.',
      };
      yield { type: 'done' };
    },
  },
});
