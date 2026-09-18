import { mkdir, writeFile } from 'node:fs/promises';
import {
  orfinSilhouette,
  orfinEyes,
  orfinEyeY,
  orfinEyeRadius,
  orfinFaceStroke,
  orfinMouthStroke,
  orfinSmile,
  orfinClosedEyes,
  orfinBusyMouth,
} from '../src/core/brand';

const mark = (size: number, busy = false, body = '#4361ee', face = '#ffffff') => {
  const eyes = busy
    ? orfinClosedEyes.map((path) => `<path d="${path}"/>`).join('')
    : orfinEyes.map((x) => `<circle cx="${x}" cy="${orfinEyeY}" r="${orfinEyeRadius}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none"><path d="${orfinSilhouette}" fill="${body}"/><g stroke="${face}" stroke-width="${orfinFaceStroke}" stroke-linecap="round" stroke-linejoin="round">${eyes}<path d="${busy ? orfinBusyMouth : orfinSmile}" stroke-width="${orfinMouthStroke}"/></g></svg>`;
};

await mkdir('docs/assets', { recursive: true });
await writeFile('demo/public/orfin.svg', mark(64) + '\n');
await writeFile('docs/assets/orfin.svg', mark(256) + '\n');

const column = (x: number, busy: boolean, title: string, description: string) =>
  `<g transform="translate(${x} 0)"><text x="0" y="128" font-size="21" font-weight="700">${title}</text><text x="0" y="155" font-size="14" fill="#667188">${description}</text><g transform="translate(72 174)">${mark(150, busy)}</g>${[16, 24, 40].map((size, i) => `<g transform="translate(${24 + i * 92} 354)">${mark(size, busy)}</g><text x="${24 + i * 92}" y="420" font-size="13" fill="#667188">${size} px</text>`).join('')}<rect x="0" y="454" width="320" height="66" rx="16" fill="#20332d"/><g transform="translate(20 468)">${mark(36, busy, '#9ac8af', '#20332d')}</g><text x="75" y="494" font-size="16" fill="#e7f4ea">Orfin</text></g>`;
const study = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="554" viewBox="0 0 800 554"><rect width="800" height="554" fill="#f4f7fc"/><g font-family="Arial,sans-serif" fill="#25334a"><text x="40" y="48" font-size="27" font-weight="700">Orfin · one character, two expressions</text><text x="40" y="76" font-size="15" fill="#667188">The supplied silhouette, redrawn as editable vectors. The body stays still.</text>${column(40, false, 'Here to help', 'Round eyes and a small smile.')}${column(440, true, 'Working on your reply', 'Closed happy eyes during actual response activity.')}</g></svg>`;
await writeFile('docs/assets/logo-expressions.svg', study + '\n');
