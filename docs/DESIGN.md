# OrfinSupport design direction

Orfin is a small guide who belongs in the product. The demo is Northstar, a creative team's project workspace. Actual project cards, a capacity chart, upcoming tasks and a useful knowledge area give the guide something meaningful to explain.

## Tokens

| Name   | Value     | Role                           |
| ------ | --------- | ------------------------------ |
| Cloud  | `#f4f7fc` | Workspace canvas               |
| Paper  | `#ffffff` | Surfaces                       |
| Ink    | `#25334a` | Text                           |
| Cobalt | `#4361ee` | Actions and Orfin's identity   |
| Ice    | `#e7edff` | Selected and contextual states |
| Fern   | `#dff2e4` | Positive progress              |

Manrope sets the workspace headings and DM Sans carries readable UI text. Type is left aligned. Main content uses a generous 32px rhythm, compact data uses 12–16px, and the assistant uses a softer 20px shell with tighter interior controls.

## Layout

The product itself is the opening demonstration. A narrow library toolbar sits above a navigable workspace. The assistant floats at the lower right. A blue, illustrated welcome panel is the single expressive surface; the surrounding workspace stays quiet.

```text
┌ OrfinSupport / interactive playground ───── controls ┐
├──────────┬───────────────────────────────────────────┤
│Northstar │ breadcrumb                          user │
│          ├───────────────────────────────────────────┤
│Overview  │ Workspace overview          Take a tour  │
│Projects  │ ┌ welcome / orbital map ┐ ┌ team pulse ┐ │
│Knowledge │ └──────────────────────┘ └────────────┘ │
│Settings  │ Active projects           ┌────────────┐ │
│          │ project / project         │ Orfin      │ │
│team      │ activity / next up        │            │ │
└──────────┴───────────────────────────┴────────────┴─┘
```

## Review before implementation

An isolated marketing hero would hide the key feature: interacting with a real page. The workspace therefore opens immediately. Cards correspond to projects, tasks and metrics rather than a uniform grid of feature claims. Decorative motion is restricted to the small Orfin identity; other motion answers a user action. A cobalt palette evokes guidance and focus while the fern and peach project artwork distinguish real work items.

The widget supports Cloud, Midnight and Iris presets, CSS custom properties and shadow parts. Keyboard navigation, high contrast, safe-area spacing and reduced motion are first-class. The 70% spotlight shades the viewport without mutating the selected element or its ancestors.

Design process informed by [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design).
