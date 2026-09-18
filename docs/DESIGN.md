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

The widget supports preset tokens, CSS custom properties and shadow parts. Keyboard navigation, high contrast, safe-area spacing and reduced motion are first-class. The default spotlight preserves approximately 85% of the background brightness, without mutating the selected element or its ancestors.

## Expanded workspace

Keep Northstar's cobalt, paper, ink, ice and fern palette and the existing type pairing. Add a studio equipment shop and a delivery report. These are places to accomplish a task: inspect a trend, read the evidence, compare equipment, and adjust a demonstration cart.

The report gives most of its width to a chart, followed by a compact segment table and an evidence ledger. The shop uses a quiet product stage with equipment silhouettes, an asymmetric featured product, and a specification table. Cart rows are compact, with quantities next to prices. They do not reuse the overview's project-card layout.

```text
Report                              Equipment
Delivery trend / period selector    Featured monitor / product silhouette
┌ weekly comparison chart ───────┐   ┌ catalog ─────────┐ ┌ session cart ┐
└───────────────────────────────┘   └──────────────────┘ └──────────────┘
Segment / delivered / lead time     Product / specifications / reviews
Evidence / observation / caveat     Two-product comparison / suitability
```

Ten assistant presets form two families of five. Cloud, Iris, Lagoon, Sand and Rose are light; Midnight, Graphite, Forest, Plum and Espresso are dark. Each defines a complete palette, shell radius, header treatment and shadow. The product hierarchy remains consistent across themes; dark presets use bright accents with dark text on filled actions. A supplied logo occupies the same reserved area in every assistant surface, with the Orfin mark as fallback.

Review: a grid of ten miniature dashboard cards would confuse theme selection with the product demo. Keep theme samples compact in the playground; spend the expressive design on the report and product illustrations. Motion follows actions: retain the spotlight while its target changes and fade its mask in and out. Nothing should flash or obscure tour controls.

Design process informed by [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design).
