import { html, svg } from 'lit';
import { orfinSilhouette, orfinEyes } from '../core/brand';

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
  down: 'm6 9 6 6 6-6',
  actions: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
} as const;

export function icon(name: keyof typeof paths, size = 18) {
  return svg`<svg data-icon=${name} width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d=${paths[name]} /></svg>`;
}

export function orfinMark(size = 28) {
  return html`<svg width=${size} height=${size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d=${orfinSilhouette} fill="currentColor" />
    <g class="orfin-eyes" fill="var(--orfin-eye, var(--surface, white))">
      ${orfinEyes.map((x) => svg`<ellipse cx=${x} cy="20" rx="1.85" ry="2.6" />`)}
    </g>
  </svg>`;
}
