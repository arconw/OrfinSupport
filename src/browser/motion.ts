import { css } from 'lit';

export const motionStyles = css`
  .orfin {
    --motion-fast: var(--orfin-motion-fast, 140ms);
    --motion-content: var(--orfin-motion-content, 240ms);
    --motion-enter: var(--orfin-motion-enter, 300ms);
    --motion-exit: var(--orfin-motion-exit, 180ms);
    --motion-ease: var(--orfin-motion-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
  }
  .panel,
  .popover,
  .preferences-view,
  .actions-menu {
    opacity: 0;
    translate: 0 10px;
    scale: 0.985;
    transform-origin: bottom right;
    transition:
      opacity var(--motion-enter) var(--motion-ease),
      translate var(--motion-enter) var(--motion-ease),
      scale var(--motion-enter) var(--motion-ease),
      background-color var(--motion-content),
      color var(--motion-content),
      border-color var(--motion-content),
      box-shadow var(--motion-content);
  }
  .popover {
    transform-origin: center;
    transition:
      opacity var(--motion-content) var(--motion-ease),
      translate var(--motion-content) var(--motion-ease),
      scale var(--motion-content) var(--motion-ease),
      top var(--motion-content) var(--motion-ease),
      left var(--motion-content) var(--motion-ease),
      background-color var(--motion-content),
      color var(--motion-content);
  }
  .panel[data-visible='true'],
  .preferences-view[data-visible='true'],
  .popover[data-visible='true'],
  .actions-menu[data-visible='true'] {
    opacity: 1;
    translate: 0 0;
    scale: 1;
  }
  [data-exiting='true'] {
    pointer-events: none;
    transition-duration: var(--motion-exit);
  }
  .chat-view {
    opacity: 1;
    translate: 0 0;
    visibility: visible;
    transition:
      opacity var(--motion-content) var(--motion-ease),
      translate var(--motion-content) var(--motion-ease),
      visibility 0s;
  }
  .chat-view[data-active='false'] {
    opacity: 0;
    translate: 0 -4px;
    pointer-events: none;
    visibility: hidden;
    transition-delay: 0s, 0s, var(--motion-content);
  }
  .orfin[dir='rtl'] .panel,
  .orfin[dir='rtl'] .actions-menu {
    transform-origin: bottom left;
  }
  button,
  select,
  .header,
  .avatar,
  .composer,
  .input-wrap,
  .message.user,
  .welcome-mark,
  .context,
  .source {
    transition:
      background-color var(--motion-content),
      color var(--motion-content),
      border-color var(--motion-fast),
      box-shadow var(--motion-fast),
      translate var(--motion-fast) var(--motion-ease),
      scale var(--motion-fast) var(--motion-ease);
  }
  button:active:not(:disabled) {
    scale: 0.96;
  }
  .actions-trigger:active,
  .action-item:active,
  .suggestion:active {
    scale: 0.985;
  }
  .suggestion > svg,
  .action-item > svg {
    transition: translate var(--motion-fast) var(--motion-ease);
  }
  @media (hover: hover) {
    .suggestion:hover > svg,
    .action-item:hover > svg {
      translate: 3px 0;
    }
    .orfin[dir='rtl'] .suggestion:hover > svg,
    .orfin[dir='rtl'] .action-item:hover > svg {
      translate: -3px 0;
    }
    .icon-button:hover > svg {
      rotate: -6deg;
    }
  }
  .icon-button > svg,
  .action-chevron {
    transition: rotate var(--motion-content) var(--motion-ease);
  }
  .actions-trigger[aria-expanded='true'] .action-chevron {
    rotate: 180deg;
  }
  .welcome-mark {
    animation: orfin-greet 440ms var(--motion-ease) both;
  }
  .welcome .orfin-eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: orfin-blink 220ms ease 500ms;
  }
  .welcome h3,
  .welcome > p,
  .welcome .suggestion,
  .preferences > *,
  .actions-menu .action-item {
    animation: orfin-content var(--motion-enter) var(--motion-ease) both;
  }
  .welcome h3 {
    animation-delay: 35ms;
  }
  .welcome > p {
    animation-delay: 70ms;
  }
  .welcome .suggestion:nth-child(1),
  .preferences > :nth-child(2) {
    animation-delay: 100ms;
  }
  .welcome .suggestion:nth-child(2),
  .preferences > :nth-child(3) {
    animation-delay: 140ms;
  }
  .welcome .suggestion:nth-child(3),
  .preferences > :nth-child(4) {
    animation-delay: 180ms;
  }
  .actions-menu .action-item:nth-child(2) {
    animation-delay: 30ms;
  }
  .actions-menu .action-item:nth-child(3) {
    animation-delay: 60ms;
  }
  .message,
  .tool,
  .sources,
  .context,
  .error,
  .tour-copy,
  .tour-inline,
  .picker-bar,
  .section-list {
    animation: orfin-content var(--motion-content) var(--motion-ease) both;
  }
  .tool-icon {
    display: inline-flex;
    flex-shrink: 0;
  }
  .tool[data-status='running'] .tool-icon {
    animation: orfin-tool 1600ms linear infinite;
  }
  .tool[data-status='complete'] .tool-icon {
    animation: orfin-done var(--motion-enter) var(--motion-ease);
  }
  .tool[data-status='complete'] [data-icon='check'] path {
    stroke-dasharray: 26;
    animation: orfin-check var(--motion-content) var(--motion-ease);
  }
  .streaming-indicator i {
    animation: orfin-writing 850ms ease-in-out infinite alternate;
  }
  .streaming-indicator i:nth-child(2) {
    animation-delay: 140ms;
  }
  .streaming-indicator i:nth-child(3) {
    animation-delay: 280ms;
  }
  @keyframes orfin-writing {
    from {
      scale: 1 0.45;
      opacity: 0.45;
    }
    to {
      scale: 1 1;
      opacity: 1;
    }
  }
  .launcher > svg,
  .launcher > .orfin-logo {
    animation: orfin-done var(--motion-enter) var(--motion-ease);
  }
  .tour-progress i {
    transition: background-color var(--motion-content);
  }
  .toggle::after {
    transition: translate var(--motion-content) var(--motion-ease);
  }
  .toggle[aria-checked='true']::after {
    translate: 14px 0;
  }
  .orfin[dir='rtl'] .toggle[aria-checked='true']::after {
    translate: -14px 0;
  }
  .orfin[data-copy='a'] .heading,
  .orfin[data-copy='a'] .preferences h3,
  .orfin[data-copy='a'] .field > label,
  .orfin[data-copy='a'] .composer-actions,
  .orfin[data-copy='a'] .footer {
    animation: orfin-copy-a var(--motion-content) ease;
  }
  .orfin[data-copy='b'] .heading,
  .orfin[data-copy='b'] .preferences h3,
  .orfin[data-copy='b'] .field > label,
  .orfin[data-copy='b'] .composer-actions,
  .orfin[data-copy='b'] .footer {
    animation: orfin-copy-b var(--motion-content) ease;
  }
  @keyframes orfin-content {
    from {
      opacity: 0.4;
      translate: 0 6px;
    }
    to {
      opacity: 1;
      translate: 0 0;
    }
  }
  @keyframes orfin-greet {
    from {
      opacity: 0;
      scale: 0.88;
      rotate: -8deg;
    }
    65% {
      scale: 1.025;
      rotate: 2deg;
    }
    to {
      opacity: 1;
      scale: 1;
      rotate: 0deg;
    }
  }
  @keyframes orfin-blink {
    0%,
    100% {
      scale: 1 1;
    }
    45% {
      scale: 1 0.12;
    }
  }
  @keyframes orfin-tool {
    to {
      rotate: 360deg;
    }
  }
  @keyframes orfin-done {
    from {
      opacity: 0.5;
      scale: 0.8;
    }
    65% {
      scale: 1.1;
    }
    to {
      opacity: 1;
      scale: 1;
    }
  }
  @keyframes orfin-check {
    from {
      stroke-dashoffset: 26;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  @keyframes orfin-copy-a {
    from {
      opacity: 0.55;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes orfin-copy-b {
    from {
      opacity: 0.55;
    }
    to {
      opacity: 1;
    }
  }
  .orfin[data-motion='none'] *,
  .orfin[data-motion='none'] *::before,
  .orfin[data-motion='none'] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
`;
