import { html, nothing } from 'lit';
import type { ChatMessage } from '../core/types';
import type { OrfinController } from './controller';
import type { createLogoRenderer } from './logo';
import { formattedText, safeURL } from './format';
import { localeDirection } from '../core/locale';
import { icon } from './icons';

export function createMessageRenderer(
  controller: OrfinController,
  logo: ReturnType<typeof createLogoRenderer>,
) {
  return (message: ChatMessage) =>
    html`<article
      class="message ${message.role}"
      part="message ${message.role}"
      data-message-id=${message.id}
      lang=${message.locale ?? controller.settings.locale}
      dir=${message.role === 'assistant' ? localeDirection(message.locale ?? controller.settings.locale) : 'auto'}
    >
      ${message.role === 'assistant' ? html`<div class="message-label" part="message-label">${logo(controller.settings.logo, 17)} Orfin</div>` : nothing}
      ${message.tools?.map((tool) => html`<div class="tool" part="tool" data-status=${tool.status}><span class="tool-icon" part="tool-icon">${icon(tool.status === 'complete' ? 'check' : tool.status === 'interrupted' ? 'stop' : 'settings', 13)}</span>${tool.name === 'highlight_section' ? controller.text.highlightTool : tool.name === 'navigate' ? controller.text.navigateTool : tool.name === 'start_tour' ? controller.text.tourTool : tool.name.replace(/_/g, ' ')} · ${tool.status === 'complete' ? controller.text.complete : tool.status === 'error' ? controller.text.error : tool.status === 'interrupted' ? controller.text.interrupted : controller.text.thinking}</div>`)}
      ${formattedText(message.content)}
      ${message.status === 'streaming' && message.content && controller.state.busy ? html`<span class="streaming-indicator" part="streaming-indicator" role="img" aria-label=${controller.text.replying}><i></i><i></i><i></i></span>` : nothing}
      ${message.status === 'streaming' && !message.content ? html`<div class="thinking" part="thinking" aria-label=${controller.text.thinking}><i></i><i></i><i></i></div>` : nothing}
      ${message.sources?.length ? html`<div class="sources" part="sources" aria-label=${controller.text.sources}>${message.sources.map((source) => (safeURL(source.url) ? html`<a class="source" part="source" href=${safeURL(source.url)!} target="_blank" rel="noopener noreferrer">${source.title}</a>` : html`<span class="source" part="source">${source.title}</span>`))}</div>` : nothing}
    </article>`;
}
