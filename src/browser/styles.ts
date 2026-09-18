import { css } from 'lit';

export const widgetStyles = css`
  :host {
    font-family: var(--orfin-font, 'DM Sans', ui-sans-serif, system-ui, sans-serif);
    font-size: 14px;
    color: var(--orfin-text, #25334a);
    color-scheme: light;
  }
  a {
    color: var(--accent);
  }
  .orfin {
    --accent: var(--orfin-accent, #4361ee);
    --surface: var(--orfin-surface, #fff);
    --soft: var(--orfin-soft, #f3f5fb);
    --text: var(--orfin-text, #25334a);
    --muted: var(--orfin-muted, #68758b);
    --line: var(--orfin-border, #e7eaf2);
    font-family: var(--orfin-font, 'DM Sans', ui-sans-serif, system-ui, sans-serif);
    font-size: 14px;
    color: var(--text);
  }
  .preferences select {
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
  }
  .orfin[data-header='tinted'] .header {
    background: var(--soft);
  }
  .orfin[data-header='lined'] .header {
    border-bottom: 3px solid var(--accent);
  }
  .launcher {
    border: 1px solid color-mix(in srgb, var(--accent) 80%, white);
    border-radius: 100px;
    color: var(--surface);
    background: var(--accent);
    font-weight: 600;
    box-shadow: 0 5px 24px #24376326;
  }
  .launcher:hover {
    box-shadow: 0 8px 28px #2437633b;
  }
  .launcher svg {
    --orfin-surface: var(--accent);
    --orfin-eye: var(--accent);
  }
  .launcher[data-open] svg {
    color: inherit;
  }
  .panel {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }
  .header {
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }
  .avatar {
    border-radius: 13px;
    background: var(--soft);
    color: var(--accent);
  }
  .heading h2 {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .status {
    color: var(--muted);
    font-size: 11px;
  }
  .status i {
    background: #359868;
    border-radius: 50%;
  }
  .icon-button {
    border: 0;
    background: transparent;
    color: var(--muted);
    border-radius: 8px;
  }
  .icon-button:hover {
    background: var(--soft);
    color: var(--text);
  }
  .icon-button[aria-pressed='true'] {
    background: var(--soft);
    color: var(--accent);
  }
  .conversation {
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
  .welcome-mark {
    background: var(--soft);
    color: var(--accent);
    border-radius: 22px;
  }
  .welcome h3 {
    font-size: 25px;
    letter-spacing: -0.9px;
    font-weight: 650;
  }
  .welcome > p {
    font-size: 14px;
    color: var(--muted);
  }
  .suggestion {
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--text);
    border-radius: 11px;
  }
  .suggestion:hover {
    border-color: var(--accent);
    background: var(--soft);
  }
  .suggestion > .suggestion-icon {
    color: var(--accent);
    background: var(--soft);
    border-radius: 7px;
  }
  .suggestion > span:nth-child(2) {
    font-size: 12px;
    font-weight: 500;
  }
  .suggestion > svg {
    color: var(--muted);
  }
  .message {
    font-size: 13px;
  }
  .message code {
    background: var(--soft);
    border-radius: 4px;
    font-size: 12px;
  }
  .message.user {
    background: var(--soft);
    border-radius: 14px 14px 3px 14px;
  }
  .message-label {
    font-weight: 600;
    color: var(--accent);
    font-size: 11px;
  }
  .thinking i {
    border-radius: 50%;
    background: var(--muted);
  }
  .source {
    font-size: 10px;
    border-radius: 5px;
    background: var(--soft);
    text-decoration: none;
    color: var(--muted);
  }
  .tool {
    font-size: 11px;
    color: var(--muted);
  }
  .tool svg {
    color: var(--accent);
  }
  .composer {
    border-top: 1px solid var(--line);
    background: var(--surface);
  }
  .context {
    color: var(--accent);
    font-size: 11px;
  }
  .input-wrap {
    background: var(--soft);
    border: 1px solid transparent;
    border-radius: 12px;
  }
  .input-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
  }
  textarea {
    color: var(--text);
    border: 0;
    background: transparent;
    font-size: 12px;
  }
  textarea:focus-visible {
    outline: none;
  }
  textarea::placeholder {
    color: var(--muted);
  }
  .send {
    border: 0;
    background: var(--accent);
    color: var(--surface);
    border-radius: 9px;
  }
  .mini {
    font-size: 10px;
    border: 0;
    background: none;
    color: var(--muted);
  }
  .mini:hover {
    color: var(--accent);
  }
  .actions-trigger {
    background: var(--soft);
    color: var(--accent);
    border: 1px solid var(--line);
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
  }
  .actions-trigger:hover,
  .actions-trigger[aria-expanded='true'] {
    border-color: var(--accent);
  }
  .actions-trigger[aria-expanded='true'] {
    background: var(--accent);
    color: var(--surface);
  }
  .actions-menu {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: var(--shadow);
  }
  .action-item {
    background: transparent;
    color: var(--text);
    border: 0;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
  }
  .action-item:hover,
  .action-item:focus-visible {
    background: var(--soft);
  }
  .action-icon {
    color: var(--accent);
  }
  .motion-hint {
    font-size: 11px;
    color: var(--muted);
  }
  .footer {
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 0.15px;
  }
  .spot-label {
    background: var(--accent);
    color: var(--surface);
    font-size: 10px;
    border-radius: 5px;
  }
  .popover {
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 12px 40px #1b294526;
  }
  .popover-top {
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
  }
  .popover h3 {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .popover p {
    font-size: 12px;
    color: var(--muted);
  }
  .primary,
  .secondary {
    font-size: 12px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--text);
    font-weight: 500;
  }
  .primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--surface);
  }
  .secondary:hover {
    background: var(--soft);
  }
  .tour-progress i {
    background: var(--line);
    border-radius: 2px;
  }
  .tour-progress i.active {
    background: var(--accent);
  }
  .picker-bar {
    background: var(--surface);
    color: var(--text);
    border-radius: 12px;
    box-shadow: 0 5px 35px #0002;
  }
  .picker-bar > span {
    font-size: 13px;
  }
  .picker-bar small {
    color: var(--muted);
    font-size: 10px;
  }
  .section-list {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
  }
  .section-list summary {
    font-size: 12px;
  }
  .section-list button {
    border: 0;
    color: var(--text);
    background: none;
    font-size: 12px;
  }
  .section-list button:hover {
    background: var(--soft);
  }
  .preferences h3 {
    font-size: 18px;
  }
  .field > label {
    font-size: 12px;
    font-weight: 600;
  }
  .theme {
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--surface);
    color: var(--text);
    font-size: 11px;
  }
  .theme[aria-pressed='true'] {
    border-color: var(--accent);
    background: var(--soft);
    color: var(--accent);
  }
  .toggle-row {
    font-size: 12px;
  }
  .toggle {
    border: 0;
    background: var(--line);
    border-radius: 10px;
  }
  .toggle::after {
    border-radius: 50%;
    background: #fff;
  }
  .toggle[aria-checked='true'] {
    background: var(--accent);
  }
  .error {
    border-radius: 10px;
    font-size: 12px;
    background: var(--soft);
    color: var(--text);
  }
  .error button {
    color: var(--accent);
    background: none;
    border: 0;
    font-weight: 600;
  }
  .disabled {
    font-size: 12px;
    color: var(--muted);
  }
  .tour-inline {
    border-bottom: 1px solid var(--line);
    font-size: 11px;
  }
  .tour-inline > span {
    color: var(--muted);
  }
  @media (max-width: 600px) {
    .panel {
      border-radius: 18px;
    }
  }
`;
