import { css } from 'lit';

export const widgetStyles = css`
  :host {
    all: initial;
    font-family: var(--orfin-font, 'DM Sans', ui-sans-serif, system-ui, sans-serif);
    font-size: 14px;
    color: var(--orfin-text, #25334a);
    direction: ltr;
    color-scheme: light;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  button,
  textarea,
  select {
    font: inherit;
  }
  button {
    cursor: pointer;
  }
  button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  button,
  textarea,
  select,
  a {
    outline-offset: 4px;
  }
  button:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  a:focus-visible {
    outline: 3px solid var(--orfin-accent, #4361ee);
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  svg {
    flex-shrink: 0;
  }
  p,
  h2,
  h3 {
    margin: 0;
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
    line-height: 1.55;
    color: var(--text);
    pointer-events: none;
  }
  .orfin[data-theme='midnight'] {
    --accent: var(--orfin-accent, #a7b8ff);
    --surface: var(--orfin-surface, #1b2436);
    --soft: var(--orfin-soft, #253149);
    --text: var(--orfin-text, #f0f3ff);
    --muted: var(--orfin-muted, #b3bfd5);
    --line: var(--orfin-border, #36435d);
    color-scheme: dark;
  }
  .orfin[data-theme='iris'] {
    --accent: var(--orfin-accent, #7451bb);
    --surface: var(--orfin-surface, #fdfbff);
    --soft: var(--orfin-soft, #f0eafa);
    --text: var(--orfin-text, #362947);
    --muted: var(--orfin-muted, #7c6c8f);
    --line: var(--orfin-border, #e8dff3);
  }
  .launcher {
    position: fixed;
    right: var(--orfin-offset, 24px);
    bottom: max(var(--orfin-offset, 24px), env(safe-area-inset-bottom));
    height: 54px;
    padding: 0 21px 0 14px;
    border: 1px solid color-mix(in srgb, var(--accent) 80%, white);
    border-radius: 100px;
    color: var(--surface);
    background: var(--accent);
    font-weight: 600;
    box-shadow: 0 5px 24px #24376326;
    pointer-events: auto;
    z-index: 5;
    transition:
      transform 0.18s,
      box-shadow 0.18s;
  }
  .launcher:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px #2437633b;
  }
  .launcher svg {
    --orfin-surface: var(--accent);
  }
  .launcher[data-open] {
    width: 54px;
    padding: 0;
  }
  .launcher[data-open] svg {
    color: inherit;
  }
  .panel {
    position: fixed;
    right: var(--orfin-offset, 24px);
    bottom: calc(var(--orfin-offset, 24px) + 68px);
    width: var(--orfin-width, 378px);
    height: min(620px, calc(100dvh - 128px));
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--orfin-radius, 22px);
    box-shadow:
      0 18px 70px #24376322,
      0 2px 8px #2437630a;
    overflow: hidden;
    z-index: 4;
    animation: orfin-enter 0.22s ease-out;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 18px 15px;
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 13px;
    background: var(--soft);
    color: var(--accent);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .heading {
    flex: 1;
  }
  .heading h2 {
    font-size: 16px;
    line-height: 1.4;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--muted);
    font-size: 11px;
  }
  .status i {
    display: block;
    background: #359868;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  .icon-button {
    width: 30px;
    height: 30px;
    border: 0;
    background: transparent;
    color: var(--muted);
    border-radius: 8px;
    padding: 0;
  }
  .icon-button:hover {
    background: var(--soft);
    color: var(--text);
  }
  .conversation {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 22px 20px;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
  .welcome {
    padding: 12px 0 3px;
  }
  .welcome-mark {
    height: 65px;
    width: 65px;
    background: var(--soft);
    color: var(--accent);
    border-radius: 22px;
    display: grid;
    place-items: center;
    margin-bottom: 21px;
  }
  .welcome h3 {
    font-size: 25px;
    line-height: 1.3;
    letter-spacing: -0.9px;
    font-weight: 650;
    margin-bottom: 10px;
  }
  .welcome > p {
    font-size: 14px;
    color: var(--muted);
    max-width: 290px;
    line-height: 1.7;
  }
  .suggestions {
    margin-top: 24px;
    display: grid;
    gap: 9px;
  }
  .suggestion {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--text);
    padding: 12px;
    border-radius: 11px;
    text-align: left;
    justify-content: flex-start;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .suggestion:hover {
    border-color: var(--accent);
    background: var(--soft);
  }
  .suggestion > .suggestion-icon {
    color: var(--accent);
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    background: var(--soft);
    border-radius: 7px;
  }
  .suggestion > span:nth-child(2) {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
  }
  .suggestion > svg {
    width: 13px;
    color: var(--muted);
  }
  .message {
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }
  .message p + p {
    margin-top: 10px;
  }
  .message ul {
    padding-left: 18px;
    margin: 8px 0;
  }
  .message code {
    background: var(--soft);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 12px;
  }
  .message.user {
    background: var(--soft);
    padding: 11px 14px;
    border-radius: 14px 14px 3px 14px;
    margin-left: 35px;
  }
  .message.assistant {
    padding-right: 6px;
  }
  .message-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
    color: var(--accent);
    font-size: 11px;
    margin-bottom: 7px;
  }
  .thinking {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 7px 0;
  }
  .thinking i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--muted);
    animation: orfin-dot 1.2s infinite;
  }
  .thinking i:nth-child(2) {
    animation-delay: 0.15s;
  }
  .thinking i:nth-child(3) {
    animation-delay: 0.3s;
  }
  .sources {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .source {
    font-size: 10px;
    padding: 4px 7px;
    border-radius: 5px;
    background: var(--soft);
    text-decoration: none;
    color: var(--muted);
  }
  .tool {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    padding: 5px 0;
    color: var(--muted);
  }
  .tool svg {
    color: var(--accent);
  }
  .composer {
    border-top: 1px solid var(--line);
    padding: 14px 16px 0;
    background: var(--surface);
  }
  .context {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--accent);
    font-size: 11px;
    margin-bottom: 8px;
  }
  .context > span {
    flex: 1;
  }
  .input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: var(--soft);
    border: 1px solid transparent;
    padding: 10px;
    border-radius: 12px;
  }
  .input-wrap:focus-within {
    border-color: var(--accent);
  }
  textarea {
    color: var(--text);
    width: 100%;
    min-height: 42px;
    max-height: 120px;
    resize: none;
    border: 0;
    background: transparent;
    line-height: 1.5;
    font-size: 12px;
    padding: 0;
    outline: none !important;
  }
  textarea::placeholder {
    color: var(--muted);
  }
  .send {
    height: 31px;
    width: 31px;
    flex-shrink: 0;
    border: 0;
    background: var(--accent);
    color: var(--surface);
    border-radius: 9px;
    padding: 0;
  }
  .composer-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
  }
  .mini {
    font-size: 10px;
    border: 0;
    background: none;
    color: var(--muted);
    padding: 4px 0;
    gap: 4px;
  }
  .mini:hover {
    color: var(--accent);
  }
  .mini svg {
    width: 13px;
    height: 13px;
  }
  .composer-actions .spacer {
    flex: 1;
  }
  .footer {
    font-size: 9px;
    text-align: center;
    color: var(--muted);
    padding: 9px 8px 11px;
    letter-spacing: 0.15px;
  }
  .spotlight {
    position: fixed;
    border-radius: 12px;
    border: 2px solid var(--accent);
    box-shadow: 0 0 0 150vmax rgb(0 0 0 / 0.7);
    pointer-events: none;
    z-index: 1;
    transition:
      top 0.18s,
      left 0.18s,
      width 0.18s,
      height 0.18s;
  }
  .spot-label {
    position: absolute;
    top: -28px;
    left: 0;
    background: var(--accent);
    color: var(--surface);
    font-size: 10px;
    border-radius: 5px;
    padding: 3px 8px;
    white-space: nowrap;
  }
  .popover {
    overflow: auto;
    position: fixed;
    width: min(300px, calc(100vw - 24px));
    padding: 18px;
    border: 1px solid var(--line);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 12px 40px #1b294526;
    pointer-events: auto;
    z-index: 3;
    animation: orfin-enter 0.2s ease-out;
  }
  .popover-top {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--accent);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .popover-top > span {
    flex: 1;
  }
  .popover h3 {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.3px;
    margin: 5px 0 8px;
  }
  .popover p {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.65;
  }
  .popover-actions {
    display: flex;
    gap: 7px;
    margin-top: 16px;
  }
  .primary,
  .secondary {
    padding: 8px 12px;
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
  .popover-actions > .primary {
    margin-left: auto;
  }
  .tour-progress {
    display: flex;
    gap: 4px;
    margin-top: 15px;
  }
  .tour-progress i {
    height: 3px;
    background: var(--line);
    flex: 1;
    border-radius: 2px;
  }
  .tour-progress i.active {
    background: var(--accent);
  }
  .picker-bar {
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 18px;
    background: var(--surface);
    color: var(--text);
    border-radius: 12px;
    box-shadow: 0 5px 35px #0002;
    pointer-events: auto;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .picker-bar > span {
    font-size: 13px;
  }
  .picker-bar small {
    color: var(--muted);
    font-size: 10px;
  }
  .section-list {
    position: fixed;
    left: 18px;
    bottom: 18px;
    z-index: 3;
    background: var(--surface);
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    pointer-events: auto;
    max-height: 35dvh;
    overflow: auto;
    max-width: 260px;
  }
  .section-list summary {
    cursor: pointer;
    font-size: 12px;
  }
  .section-list button {
    display: flex;
    text-align: left;
    justify-content: flex-start;
    width: 100%;
    border: 0;
    color: var(--text);
    background: none;
    font-size: 12px;
    padding: 8px;
  }
  .section-list button:hover {
    background: var(--soft);
  }
  .preferences {
    padding: 20px;
  }
  .preferences h3 {
    font-size: 18px;
    margin-bottom: 20px;
  }
  .field {
    margin-bottom: 22px;
  }
  .field > label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .themes {
    display: flex;
    gap: 8px;
  }
  .theme {
    border: 1px solid var(--line);
    padding: 9px 12px;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding: 12px 0;
  }
  .toggle {
    width: 34px;
    height: 20px;
    border: 0;
    background: var(--line);
    border-radius: 10px;
    padding: 3px;
    justify-content: flex-start;
  }
  .toggle::after {
    content: '';
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
  }
  .toggle[aria-checked='true'] {
    background: var(--accent);
    justify-content: flex-end;
  }
  .error {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 10px;
    font-size: 12px;
    background: var(--soft);
    color: var(--text);
  }
  .error button {
    color: var(--accent);
    background: none;
    border: 0;
    padding: 7px 0 0;
    font-weight: 600;
  }
  .disabled {
    padding: 18px;
    font-size: 12px;
    color: var(--muted);
  }
  .tour-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 11px;
  }
  .tour-inline > span {
    margin-right: auto;
    color: var(--muted);
  }
  @keyframes orfin-enter {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes orfin-dot {
    0%,
    70%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    35% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }
  @media (max-width: 600px) {
    .panel {
      right: 12px;
      bottom: 80px;
      width: calc(100vw - 24px);
      height: min(600px, calc(100dvh - 104px));
      border-radius: 18px;
    }
    .launcher {
      right: 16px;
      bottom: 16px;
    }
    .picker-bar {
      top: 12px;
      max-width: calc(100vw - 24px);
      padding: 10px 12px;
      white-space: normal;
    }
    .picker-bar small {
      display: none;
    }
    .popover {
      max-height: 45dvh;
      overflow: auto;
    }
    .spotlight {
      transition: none;
    }
    .conversation {
      padding: 18px;
    }
    .welcome {
      padding-top: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;
