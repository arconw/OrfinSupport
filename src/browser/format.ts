import { html } from 'lit';

export function safeURL(value?: string): string | undefined {
  if (!value) return;
  try {
    const url = new URL(value, location.href);
    if (['http:', 'https:'].includes(url.protocol)) return url.href;
  } catch {
    return;
  }
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\s)]+\))/g).map((part) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return html`<strong>${part.slice(2, -2)}</strong>`;
    if (part.startsWith('`') && part.endsWith('`')) return html`<code>${part.slice(1, -1)}</code>`;
    const link = /^\[([^\]]+)\]\(([^\s)]+)\)$/.exec(part);
    if (link) {
      const url = safeURL(link[2]);
      return url
        ? html`<a href=${url} target="_blank" rel="noopener noreferrer">${link[1]}</a>`
        : link[1];
    }
    return part;
  });
}

export function formattedText(text: string) {
  return text.split(/\n\n+/).map((paragraph) => {
    const lines = paragraph.split('\n');
    if (lines.every((line) => /^[-*] /.test(line)))
      return html`<ul>
        ${lines.map((line) => html`<li>${inline(line.slice(2))}</li>`)}
      </ul>`;
    return html`<p>
      ${lines.map((line, index) => html`${index ? html`<br />` : ''}${inline(line.replace(/^#{1,4} /, ''))}`)}
    </p>`;
  });
}
