import { html } from 'lit';
import type { AssistantLogo } from '../core/types';
import { orfinMark } from './icons';

function imageURL(src: string): string | undefined {
  try {
    const url = new URL(src, location.href);
    if (['http:', 'https:', 'blob:'].includes(url.protocol)) return url.href;
    if (/^data:image\/(png|jpeg|webp|gif|avif);base64,/i.test(src)) return src;
  } catch {
    return;
  }
}

export function createLogoRenderer(refresh: () => void) {
  const failed = new Set<string>();
  let previous: AssistantLogo | null = null;
  return (logo: AssistantLogo | null, size: number) => {
    if (logo !== previous) {
      failed.clear();
      previous = logo;
    }
    const src = logo?.src ? imageURL(logo.src) : undefined;
    const alt = logo?.alt?.trim() || 'Orfin';
    return html`<span class="orfin-logo" part="logo" style=${`width:${size}px;height:${size}px`}>
      ${
        src && !failed.has(src)
          ? html`<img
              part="logo-image"
              src=${src}
              alt=${alt}
              width=${size}
              height=${size}
              @error=${() => {
                failed.add(src);
                refresh();
              }}
            />`
          : html`<span role="img" aria-label="Orfin">${orfinMark(size)}</span>`
      }
    </span>`;
  };
}
