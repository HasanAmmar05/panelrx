# Design System — INVARIANTS

These rules are non-negotiable. Every component must respect them. When in doubt, return here.

## Aesthetic Direction

**Cinematic clinical confidence.** Deep ink background. Sharp teal accent. Tabular numerics everywhere money lives. Mono font for system events, sans-serif for human moments. Like a Bloomberg terminal that learned bedside manner.

## Palette (Tailwind v4)

Add this to your `index.css` or via `@theme` block:

```css
@theme {
  --color-background: #0A0E1A;
  --color-surface: rgba(15, 23, 42, 0.6);
  --color-surface-elevated: rgba(15, 23, 42, 0.9);
  --color-surface-solid: #0F172A;

  --color-ink: #F8FAFC;
  --color-body: #94A3B8;
  --color-muted: #64748B;
  --color-faint: #475569;

  --color-primary: #14B8A6;
  --color-primary-deep: #0F766E;
  --color-primary-soft: rgba(20, 184, 166, 0.1);
  --color-primary-ring: rgba(20, 184, 166, 0.25);

  --color-amber: #F59E0B;
  --color-amber-soft: rgba(245, 158, 11, 0.1);
  --color-danger: #EF4444;
  --color-danger-soft: rgba(239, 68, 68, 0.1);
  --color-positive: #10B981;
  --color-positive-soft: rgba(16, 185, 129, 0.1);

  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.15);
}
```

Use Tailwind classes: `bg-background`, `text-ink`, `text-body`, `border-border`, etc.

## Typography

Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Then in Tailwind config:

```typescript
fontFamily: {
  display: ['Geist', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
}
```

**When to use which:**
- `font-display` (Geist): all numbers, headlines, KPI values, big amounts
- `font-sans` (Inter): body text, descriptions, paragraphs
- `font-mono` (JetBrains Mono): agent labels, model names, system events, terminal text, reference numbers

**Tabular numbers:** every money figure gets `tabular-nums` class.

## Components — visual rules

### Cards
- `rounded-md` (4px) or `rounded-lg` (8px) only
- `border border-border` for resting state
- `border-primary-ring` when an agent is "working"
- `bg-surface` for resting, `bg-surface-elevated` for elevated
- No drop shadows on dark bg — use border opacity for depth
- Padding: `p-4` for compact, `p-6` for generous

### Buttons
- Primary: `bg-primary text-background hover:bg-primary-deep`
- Ghost: `text-body hover:bg-primary-soft hover:text-primary`
- Outline: `border border-border text-ink hover:border-primary-ring`
- Sizing: `px-4 py-2` standard, `px-6 py-3` prominent, `px-8 py-5` CTA hero
- Always `rounded-md`

### Status indicators
- Small dot (8px or 10px) + label, never filled pills
- Dot colors map to status:
  - idle: `bg-muted`
  - working: `bg-primary` with `animate-pulse`
  - completed: `bg-positive`
  - failed: `bg-danger`

### Tables
- Header row: `text-muted text-xs uppercase tracking-wide font-mono`
- Body rows: `text-body text-sm` with `border-b border-border` between
- Money columns: right-aligned, `font-display tabular-nums`
- Hover: `hover:bg-primary-soft/30`

### Forms
- Inputs: `bg-surface border border-border focus:border-primary-ring focus:outline-none px-3 py-2 rounded-md text-ink placeholder:text-muted`
- Labels: `text-body text-sm font-medium mb-1.5`

## Animation principles

### Timing
- Quick acknowledgments: 150-200ms
- Standard transitions: 250-350ms
- Cinematic moments: 400-800ms
- Stage transitions: 250ms with subtle y-offset (8px)

### Easing
- Default: `cubic-bezier(0.22, 1, 0.36, 1)` (Framer's "easeOut")
- Cinematic: Framer's `spring` with stiffness 120, damping 18
- NEVER use linear easing except for the streaming text cursor blink

### Stagger
- 80ms between sibling elements (default)
- 120ms for emphasized sequences
- 200ms for cinematic reveals

## Streaming text (the future-feeling effect)

- Typing speed: 25ms per character (standard)
- Slow/dramatic: 40ms per character
- Fast/system: 12ms per character
- Cursor: 2px wide, 1em tall, blinks at 530ms cycle (terminal-classic)
- After completion: cursor blinks for 800ms then fades

## What NOT to do — anti-patterns

These will get your code rejected:

- ❌ Purple gradients anywhere
- ❌ Glass morphism (`backdrop-blur` on cards)
- ❌ `rounded-2xl` on anything (only ThoughtBubble is allowed)
- ❌ Drop shadows on dark backgrounds (`shadow-xl` etc.)
- ❌ Default shadcn purple
- ❌ Filled status pills (red/green/yellow rectangles with text)
- ❌ Emoji in UI (except where a phase brief specifies)
- ❌ Big illustrations (no stock doctor cartoons, no medical clipart)
- ❌ "AI sparkle" icons or stars
- ❌ Hover state that scales the whole card (subtle border change instead)
- ❌ Loading spinners (use named-status shimmer or skeleton)

## Mobile

- All pages must work at 375px width (iPhone SE)
- Sidebar collapses to hamburger on mobile
- Cinematic preserves landscape feel but adapts vertically
- Tap targets minimum 44px

## Dark mode only

This app is dark-mode only. Do not add light mode. The aesthetic depends on the deep-ink background.
