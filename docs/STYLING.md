# Project styling

OrfinSupport supports three levels of styling: a complete preset, preset overrides, and a project-owned appearance with no preset at all. All framework adapters use the same settings.

The Northstar demo and Next example use locally hosted Inter, stronger text contrast, 15px conversation text and a 16px composer. Their [shared typography stylesheet](../demo/assistant-typography.css) uses the public CSS variable and shadow parts, and stops applying when `theme: 'none'` is selected. Fonts belong to your application; the npm widget does not download them or require Inter.

## Disable the preset

```ts
import { createOrfin } from 'orfinsupport';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  theme: 'none',
  logo: { src: '/brand/assistant.svg', alt: 'Project assistant' },
});
```

`theme: 'none'` leaves the preset stylesheet empty and removes inline preset palette, radius, shadow and header tokens. It does not select a transparent version of Cloud or another built-in theme. Without project CSS, native browser defaults remain visible.

The layout stylesheet stays active: positioning, dimensions, scroll containment, pointer behavior, responsive layout, keyboard focus indicators, disabled-control feedback, spotlight geometry and reduced-motion behavior. The full-viewport host remains transparent and does not intercept input outside interactive surfaces. These are interaction defaults, not a hidden color palette. Visual styles on the exposed components remain overridable; preserve their accessibility and usable geometry when designing a replacement.

## The Shadow DOM boundary

| Mechanism                     | What it controls                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| External `::part()` selectors | The explicitly exposed elements, including their supported pseudo-classes such as `:hover` and `:focus-visible`.   |
| CSS custom properties         | Values inherited through the shadow boundary. A preset or project stylesheet must actually reference the property. |
| `styles` configuration        | Trusted project CSS inserted inside Shadow DOM, with access to internal classes, descendants and attribute states. |

An ordinary selector such as `[data-orfin-root] .panel` cannot reach the panel. `::part(panel)` can. A selector such as `::part(header) button` cannot reach arbitrary descendants either; target the exported control part, or use `styles`. Internal classes in the examples below are usable inside `styles`, not directly from an ordinary application stylesheet.

Setting `--app-surface` or `--orfin-surface` alone in no-preset mode does not paint a panel. Your stylesheet maps those values to `background`. Likewise, the host resets inherited typography; set the font on `::part(orfin)` or `.orfin` inside `styles`.

## Use an external project stylesheet

Load this CSS through your application's normal stylesheet mechanism. The `data-theme` condition makes it stop applying when a built-in preset is restored.

```css
[data-orfin-root] {
  --app-assistant-surface: #f9fff3;
  --app-assistant-text: #263c35;
  --app-assistant-accent: #315947;
}

[data-orfin-root][data-theme='none']::part(orfin) {
  color: var(--app-assistant-text);
  font:
    14px/1.5 Georgia,
    serif;
}

[data-orfin-root][data-theme='none']::part(panel),
[data-orfin-root][data-theme='none']::part(popover),
[data-orfin-root][data-theme='none']::part(actions-menu),
[data-orfin-root][data-theme='none']::part(picker-bar),
[data-orfin-root][data-theme='none']::part(section-list) {
  background: var(--app-assistant-surface);
  border: 2px solid var(--app-assistant-accent);
  border-radius: 0;
  box-shadow: 0 12px 32px #263c3526;
}

[data-orfin-root][data-theme='none']::part(header) {
  border-bottom: 3px double var(--app-assistant-accent);
}

[data-orfin-root][data-theme='none']::part(launcher),
[data-orfin-root][data-theme='none']::part(send),
[data-orfin-root][data-theme='none']::part(primary) {
  color: #fff;
  background: var(--app-assistant-accent);
  border: 1px solid var(--app-assistant-accent);
  border-radius: 4px;
}

[data-orfin-root][data-theme='none']::part(launcher):hover {
  background: #263c35;
}

[data-orfin-root][data-theme='none']::part(input) {
  color: var(--app-assistant-text);
  background: var(--app-assistant-surface);
  font: inherit;
}

[data-orfin-root][data-theme='none']::part(input):focus-visible {
  outline: 2px solid var(--app-assistant-accent);
}
```

This example covers the main surfaces and primary controls. The complete demo design additionally styles messages, suggestions, settings, errors, secondary controls, tool states and spotlight labels.

## Supply the complete project design

`styles` accepts a CSS string. Use your bundler's CSS-as-text mechanism or a JavaScript string. In the Vite demo, the actual application stylesheet is imported as text:

```ts
import projectStyles from './host-theme.css?inline';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  theme: 'none',
  styles: projectStyles,
});
```

`?inline` is Vite syntax, not an OrfinSupport requirement. Other bundlers can provide the string differently. The [Northstar project stylesheet](../demo/host-theme.css) is maintained by the demo application and passed from [its integration](../demo/ui/App.tsx). It supplies paper surfaces, forest controls, serif typography, square corners and a double-rule header, including tours, hover prompts and preferences. It is not part of the library's preset registry.

Scope CSS to `:host([data-theme='none'])` to keep it installed while switching presets:

```css
:host([data-theme='none']) .orfin {
  font:
    14px/1.5 Georgia,
    serif;
  color: #263c35;
}

:host([data-theme='none']) button,
:host([data-theme='none']) select,
:host([data-theme='none']) textarea {
  color: inherit;
  background: #f9fff3;
  border: 1px solid #315947;
  border-radius: 4px;
}

:host([data-theme='none']) .theme[aria-pressed='true'],
:host([data-theme='none']) .toggle[aria-checked='true'] {
  color: #fff;
  background: #315947;
}

:host([data-theme='none']) button:disabled {
  opacity: 0.5;
}

:host([data-theme='none']) button:focus-visible {
  outline: 2px solid #315947;
  outline-offset: 3px;
}
```

The stylesheet is inserted as text after layout and preset CSS, not as HTML. It is trusted developer configuration and is never sent to the model. The `nonce` option applies to each injected style element. Custom CSS can intentionally alter layout too; avoid hiding focus indicators or overriding reduced-motion safeguards.

## Restore a preset without remounting

```ts
orfin.updateSettings({ theme: 'none', styles: projectStyles });
orfin.updateSettings({ styles: revisedProjectStyles });
orfin.updateSettings({ theme: 'forest', styles: '' });
```

The controller, conversation, selected locale and configured logo remain intact. If all project rules are scoped to no-preset mode, switching to `{ theme: 'forest' }` alone is sufficient. Unscoped CSS continues to apply until replaced or cleared. External project CSS should likewise use `[data-theme='none']` if it must stop applying to presets.

React's `useOrfin().updateSettings`, Vue's `useOrfin().updateSettings` and Angular's `injectOrfin().updateSettings` accept the same changes. No new provider or component instance is needed.

## Surfaces and states

| Area                          | Useful exported parts                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Overall typography and layout | `orfin`, `panel`, `header`, `heading`, `conversation`, `composer`, `footer`                    |
| Identity and launcher         | `launcher`, `avatar`, `logo`, `logo-image`, `welcome-mark`                                     |
| Default vector identity       | `logo-mark`, `logo-body`, `logo-face`, `logo-idle`, `logo-busy`                                |
| Messages and feedback         | `message`, `user`, `assistant`, `message-label`, `tool`, `source`, `error`, `retry`            |
| Inputs and settings           | `input-wrap`, `input`, `send`, `language`, `theme`, `toggle`, `preferences`, `suggestion`      |
| Tours and hover help          | `popover`, `tour-popover`, `popover-top`, `tour-inline`, `primary`, `secondary`, `icon-button` |
| Selection and spotlight       | `picker-bar`, `section-list`, `spotlight`, `spot-label`                                        |

Use `styles` for attribute states and descendants not individually exposed as parts. A tour popover also exports `popover`, so a common surface rule covers both tours and hover prompts. Adjust spotlight darkness and timing through `highlightOpacity` and `highlightTransition`; both remain independent of the chosen theme.

The project owns contrast, typography and visual state design in no-preset mode. Check the replacement on narrow screens, keyboard focus, loading/disabled/error states and RTL. Orfin retains its accessible labels, runtime locale changes, responsive placement and reduced-motion handling. See [the API reference](API.md#style-tokens) for token defaults when using a preset.

## Motion and actions

The default SVG face follows real response activity. Idle uses round eyes and a smile; waiting, tools and streamed text use happy closed eyes and a small mouth. The body uses `currentColor`, while `--orfin-eye` controls the face color. Host CSS can also style `::part(logo-body)` and `::part(logo-face)` directly. Facial transitions share `--orfin-motion-enter` and `--orfin-motion-ease`; reduced motion switches expressions immediately. Supplied image logos are not transformed into facial states. Static brand assets always use the idle face.

Motion is independent of the palette. The layout layer keeps panel/menu presence, short content entrances, control feedback and tool progress active in no-preset mode; it adds no surface colors, borders or fonts. Use `motion: 'none'` to disable this behavior entirely, or `'auto'` to follow the device preference. Both settings work at creation and through `updateSettings`. OS reduced motion always wins.

```css
[data-orfin-root] {
  --orfin-motion-fast: 120ms;
  --orfin-motion-content: 200ms;
  --orfin-motion-enter: 260ms;
  --orfin-motion-exit: 160ms;
  --orfin-motion-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}

[data-orfin-root][data-theme='none']::part(actions-trigger) {
  color: #263c35;
  background: #e5ecd6;
  border: 2px solid #315947;
  border-radius: 4px;
  font: 600 14px/1.4 system-ui;
}

[data-orfin-root][data-theme='none']::part(action-item) {
  color: #263c35;
  background: #f9fff3;
  border: 0;
  font: inherit;
}

[data-orfin-root][data-theme='none']::part(action-item):focus-visible {
  outline: 2px solid #315947;
}
```

Defaults are 140 ms for feedback, 240 ms for content, 300 ms for panel arrival and 180 ms for exit. The exit duration also determines when an inert surface is removed; use a CSS duration in `ms` or `s`, bounded to 0–1500 ms by the presence lifecycle. Set the matching motion variable when changing the exit transition so CSS and removal remain synchronized. Spotlight timing is separately controlled by `highlightTransition`.

Welcome elements enter with a short stagger; each message enters once, without replaying for streamed text. Pending tools rotate, completed tools briefly settle, and theme colors transition without replacing the input. Locale changes fade the labels while preserving keyboard focus. Preferences enter and exit over the retained chat view, preserving scroll and draft state; their wrappers export `panel-body`, `chat-view` and `preferences-view`. Rapid close/reopen reverses the transition. Closing surfaces are inert and hidden from assistive technology before removal.

The actions area exports `actions`, `actions-trigger`, `action-chevron`, `actions-menu`, `action-item`, `action-icon` and `action-label`. Its menu is anchored above the labelled trigger and can overlay the composer until dismissed. Arrow keys, Home and End move between enabled commands; Escape returns to the trigger, Tab leaves the menu, and outside clicks close it. Page explanation is disabled during a reply. For expanded-state design inside `styles`, target `.actions-trigger[aria-expanded='true']`; arbitrary attribute selectors cannot cross the shadow boundary through `::part()`.

Custom menu items use the same exported parts and motion as built-ins. Long localized lists scroll inside the menu, including keyboard Home/End navigation. Configure the items through [`menuActions`](API.md#actions-menu). The writing indicator exports `streaming-indicator`; it follows the current text color and is removed on completion, cancellation or error. Tool activity exposes `data-status` inside `styles`, including `interrupted` when a running operation has no observed completion after the stream stops.

Keep focus indicators, disabled states and 44 px action targets when replacing appearance. External `::part()` rules can override visual transitions; the explicit motion setting and reduced-motion rule intentionally suppress them for users who request less movement.
