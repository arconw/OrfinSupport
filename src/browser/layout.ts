import { css } from 'lit';
import { motionStyles } from './motion';

export const layoutStyles = css`
  :host {
    all: initial;
    direction: ltr;
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
    outline: 3px solid var(--orfin-accent, Highlight);
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
  .orfin {
    line-height: 1.55;
    pointer-events: none;
    text-align: start;
  }
  .orfin[dir='rtl'] [data-icon='arrow'],
  .orfin[dir='rtl'] [data-icon='back'],
  .orfin[dir='rtl'] [data-icon='chevron'] {
    transform: scaleX(-1);
  }
  .orfin[dir='rtl'] .launcher {
    padding-inline: 14px 21px;
  }
  .orfin[dir='rtl'] .launcher[data-open] {
    padding: 0;
  }
  .preferences select {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 10px 12px;
  }
  .orfin-logo,
  .orfin-logo > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .orfin-logo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .launcher {
    position: fixed;
    right: var(--orfin-offset, 24px);
    bottom: max(var(--orfin-offset, 24px), env(safe-area-inset-bottom));
    height: 54px;
    padding: 0 21px 0 14px;
    pointer-events: auto;
    z-index: 5;
    transition:
      transform 0.18s,
      box-shadow 0.18s;
  }
  .launcher:hover {
    transform: translateY(-2px);
  }
  .launcher[data-open] {
    width: 54px;
    padding: 0;
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
    overflow: hidden;
    z-index: 4;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 18px 15px;
  }
  .panel-body {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 0;
    min-width: 0;
  }
  .chat-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
  }
  .preferences-view {
    position: absolute;
    inset: 0;
    display: flex;
  }
  .avatar {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .heading {
    flex: 1;
  }
  .heading h2 {
    line-height: 1.4;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .status i {
    display: block;
    width: 5px;
    height: 5px;
  }
  .icon-button {
    width: 30px;
    height: 30px;
    padding: 0;
  }
  .conversation {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 22px 20px;
  }
  .welcome {
    padding: 12px 0 3px;
  }
  .welcome-mark {
    height: 65px;
    width: 65px;
    display: grid;
    place-items: center;
    margin-bottom: 21px;
  }
  .welcome h3 {
    line-height: 1.3;
    margin-bottom: 10px;
  }
  .welcome > p {
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
    padding: 12px;
    text-align: start;
    justify-content: flex-start;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .suggestion > .suggestion-icon {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
  }
  .suggestion > span:nth-child(2) {
    flex: 1;
  }
  .suggestion > svg {
    width: 13px;
  }
  .message {
    margin-bottom: 20px;
    line-height: 1.75;
    overflow-wrap: anywhere;
  }
  .message p + p {
    margin-top: 10px;
  }
  .message ul {
    padding-inline-start: 18px;
    margin: 8px 0;
  }
  .message code {
    padding: 2px 4px;
  }
  .message.user {
    padding: 11px 14px;
    margin-inline-start: 35px;
  }
  .message.assistant {
    padding-inline-end: 6px;
  }
  .message-label {
    display: flex;
    align-items: center;
    gap: 5px;
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
    padding: 4px 7px;
  }
  .tool {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 0;
  }
  .composer {
    padding: 14px 16px 0;
  }
  .context {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
  }
  .context > span {
    flex: 1;
  }
  .input-wrap {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 10px;
  }
  textarea {
    width: 100%;
    min-height: 42px;
    max-height: 120px;
    resize: none;
    line-height: 1.5;
    padding: 0;
  }
  .send {
    height: 31px;
    width: 31px;
    flex-shrink: 0;
    padding: 0;
  }
  .composer-actions {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 8px;
  }
  .mini {
    padding: 4px 0;
    gap: 4px;
  }
  .mini svg {
    width: 13px;
    height: 13px;
  }
  .composer-actions .spacer {
    flex: 1;
  }
  .actions {
    flex: 1;
    min-width: 0;
  }
  .actions-trigger {
    min-height: 44px;
    max-width: 100%;
    padding: 8px 12px;
    gap: 8px;
  }
  .action-chevron {
    display: inline-flex;
    flex-shrink: 0;
  }
  .actions-menu {
    position: absolute;
    bottom: calc(100% + 10px);
    inset-inline-start: 0;
    width: 100%;
    max-height: min(260px, calc(100dvh - 248px));
    overflow: auto;
    overscroll-behavior: contain;
    padding: 6px;
    z-index: 2;
  }
  .action-item {
    display: flex;
    width: 100%;
    min-height: 44px;
    text-align: start;
    padding: 10px;
    gap: 10px;
  }
  .action-icon {
    display: inline-flex;
    flex-shrink: 0;
  }
  .action-label {
    flex: 1;
    overflow-wrap: anywhere;
  }
  .clear-conversation {
    margin-inline-start: auto;
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
    flex-shrink: 0;
  }
  .streaming-indicator {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 14px;
    margin-inline-start: 6px;
    vertical-align: middle;
  }
  .streaming-indicator i {
    width: 2px;
    height: 7px;
    background: currentColor;
    border-radius: 2px;
  }
  .footer {
    text-align: center;
    padding: 9px 8px 11px;
  }
  .spotlight {
    position: fixed;
    border-radius: 12px;
    border: 2px solid var(--accent, Highlight);
    box-shadow: 0 0 0 150vmax rgb(0 0 0 / var(--spotlight-opacity));
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    transition:
      opacity var(--spotlight-transition) ease,
      top var(--spotlight-transition) ease,
      left var(--spotlight-transition) ease,
      width var(--spotlight-transition) ease,
      height var(--spotlight-transition) ease;
  }
  .spotlight[data-visible='true'] {
    opacity: 1;
  }
  .spot-label {
    position: absolute;
    top: -28px;
    left: 0;
    padding: 3px 8px;
    white-space: nowrap;
  }
  .popover {
    overflow: auto;
    position: fixed;
    width: min(300px, calc(100vw - 24px));
    padding: 18px;
    pointer-events: auto;
    z-index: 3;
  }
  .popover-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .popover-top > span {
    flex: 1;
  }
  .popover h3 {
    margin: 5px 0 8px;
  }
  .popover p {
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
  }
  .popover-actions > .primary {
    margin-inline-start: auto;
  }
  .tour-progress {
    display: flex;
    gap: 4px;
    margin-top: 15px;
  }
  .tour-progress i {
    height: 3px;
    flex: 1;
  }
  .picker-bar {
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 18px;
    pointer-events: auto;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }
  .section-list {
    position: fixed;
    left: 18px;
    bottom: 18px;
    z-index: 3;
    padding: 12px;
    pointer-events: auto;
    max-height: 35dvh;
    overflow: auto;
    max-width: 260px;
  }
  .section-list summary {
    cursor: pointer;
  }
  .section-list button {
    display: flex;
    text-align: start;
    justify-content: flex-start;
    width: 100%;
    padding: 8px;
  }
  .preferences {
    padding: 20px;
  }
  .preferences h3 {
    margin-bottom: 20px;
  }
  .field {
    margin-bottom: 22px;
  }
  .field > label {
    display: block;
    margin-bottom: 8px;
  }
  .themes {
    flex-wrap: wrap;
    display: flex;
    gap: 8px;
  }
  .theme {
    padding: 9px 12px;
  }
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
  }
  .toggle {
    width: 34px;
    height: 20px;
    padding: 3px;
    justify-content: flex-start;
  }
  .toggle::after {
    content: '';
    width: 14px;
    height: 14px;
  }
  .motion-hint {
    margin: 0 0 14px;
    line-height: 1.6;
  }
  .error {
    padding: 12px;
    margin-bottom: 12px;
  }
  .error button {
    padding: 7px 0 0;
  }
  .disabled {
    padding: 18px;
  }
  .tour-inline {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
  }
  .tour-inline > span {
    margin-inline-end: auto;
    white-space: nowrap;
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
    .conversation {
      padding: 18px;
    }
    .welcome {
      padding-top: 0;
    }
  }
  ${motionStyles}
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
