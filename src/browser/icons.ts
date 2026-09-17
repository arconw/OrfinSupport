import { html, svg } from 'lit';

const paths = {
  close: 'M6 6l12 12M18 6 6 18',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  send: 'm5 12 14-7-4 14-3-6-7-1Zm7 1 7-8',
  tour: 'm9 5 10 7-10 7V5Z',
  pick: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M9 9h6v6H9z',
  page: 'M6 3h9l4 4v14H6V3Zm8 0v5h5M9 12h7m-7 4h5',
  settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
  clear: 'M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6m4-6v6',
  stop: 'M7 7h10v10H7z',
  check: 'm5 12 4 4L19 6',
  help: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  chevron: 'm9 5 7 7-7 7',
} as const;

export function icon(name: keyof typeof paths, size = 18) {
  return svg`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name]} /></svg>`;
}

export function orfinMark(size = 28) {
  return html`<svg width=${size} height=${size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M20 3c2 10 7 15 17 17-10 2-15 7-17 17C18 27 13 22 3 20 13 18 18 13 20 3Z"
      fill="currentColor"
    />
    <circle cx="17" cy="20" r="1.4" fill="var(--orfin-surface, white)" />
    <circle cx="23" cy="20" r="1.4" fill="var(--orfin-surface, white)" />
  </svg>`;
}
