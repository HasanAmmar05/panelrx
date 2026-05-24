# Phase 2 — Visual Vocabulary

**Goal**: Build the 7 reusable visual primitives used by every cinematic stage and several product pages.

**Dependencies**: Phase 1 complete.

**Output**: At `/showcase`, see every primitive in every state for visual QA.

## Components to create

All in `src/cinematic/components/`:

### `AgentCard.tsx`

Represents an AI agent doing work.

```typescript
type AgentCardProps = {
  icon: LucideIcon;
  name: string;
  model: string;          // e.g. "Claude Sonnet 4.6"
  status: "idle" | "working" | "done" | "error";
  statusText?: string;
  elapsedMs?: number;
  resultText?: string;
};
```

Visual:
- Container: `rounded-lg border p-4 bg-surface`
- Border color by status: idle `border-border`, working `border-primary-ring`, done `border-positive/40`, error `border-danger/40`
- Top row: icon (24px) + name (font-display 16px text-ink) + model (font-mono 11px text-muted)
- Icon color matches status (primary when working, body when idle, positive when done, danger when error)
- Middle: statusText in text-body text-sm
- When working: subtle shimmer animation on container (animate border-opacity 0.25 → 0.5 → 0.25 over 1.4s)
- Bottom right (working): elapsed in font-mono text-xs text-muted, like "4.2s"
- Bottom (done): resultText with CheckCircle icon, text-positive, fade in over 200ms

### `StreamingText.tsx`

Character-by-character typing.

```typescript
type StreamingTextProps = {
  text: string;
  speedMs?: number;          // default 25
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;      // default true
  delay?: number;            // ms before typing starts
};
```

Implementation:
- `useState` for current character index
- `useEffect` increments index every `speedMs` until reaching text.length
- Render: `<span>{text.slice(0, index)}</span>{showCursor && <Cursor />}`
- Cursor: a span with width 2px, height 1em, current text color background, animated opacity 1 → 0 → 1 at 530ms cycle (use CSS `@keyframes blink`)
- When complete: trigger onComplete, keep cursor visible 800ms, then fade
- If `delay` prop: wait that long before starting

### `ThoughtBubble.tsx`

Speech-bubble UI.

```typescript
type ThoughtBubbleProps = {
  speaker: "staff" | "doctor" | "patient" | "narrator";
  text: string;
  side?: "left" | "right";   // default "left"
  streaming?: boolean;        // if true, use StreamingText
};
```

Visual:
- Layout: flex with avatar circle and bubble side by side
- Avatar: circle 40px, bg-surface-elevated, border-border, Lucide icon centered
  - staff: `UserCheck`
  - doctor: `Stethoscope`
  - patient: `User`
  - narrator: `MessageSquareDashed`
- Bubble: `rounded-2xl bg-surface-elevated px-4 py-3 max-w-md` (rounded-2xl is allowed here only)
- Small triangular tail pointing toward avatar (use CSS clip-path triangle, 8px wide)
- Text: `text-body font-sans text-base`
- Mount animation: scale 0.95 → 1.0 + opacity 0 → 1 over 240ms with spring

### `TPAPortalCard.tsx`

Faux browser card representing a TPA system.

```typescript
type TPAPortalCardProps = {
  tpaName: string;
  accessMethod: "api" | "portal" | "hotline" | "app";
  status: "calling" | "success" | "failure";
  responseText?: string;
  latencyMs?: number;
};
```

Visual:
- Container: `rounded-md border bg-surface p-3 min-w-72 transition-colors`
- Border color by status: calling `border-border`, success `border-positive/40`, failure `border-danger/40`
- Top "chrome bar": h-6, flex items-center justify-between, border-b border-border, mb-3
  - Left: 3 dots (each 6px, rounded-full): bg-red-500, bg-amber-500, bg-emerald-500
  - Middle: tpaName in font-mono text-xs text-body
  - Right: method icon (Globe for api, Monitor for portal, Phone for hotline, Smartphone for app), 14px text-muted
- Content area (h-20):
  - When calling: 3 skeleton lines (rounded bars, bg-border animate-pulse, varying widths)
  - When success: responseText in text-body text-sm, with CheckCircle icon top-right (positive color, 16px)
  - When failure: responseText in text-danger text-sm, with XCircle icon top-right (danger color, 16px)
- Bottom right: latencyMs in font-mono text-xs text-muted, like "4700ms"

### `ResultCard.tsx`

Big numerical reveal card.

```typescript
type ResultCardProps = {
  label: string;
  value: string;
  valueColor?: "amber" | "danger" | "positive" | "primary" | "ink";
  sublabel?: string;
  icon?: LucideIcon;
  pulse?: boolean;
};
```

Visual:
- Container: `rounded-lg border border-border bg-surface p-6 min-w-64`
- If pulse: animate box-shadow with inset glow (use Framer Motion with `animate` prop), e.g. for danger: `0 0 0 0 rgba(239, 68, 68, 0.4)` → `0 0 0 8px rgba(239, 68, 68, 0)` at 2s loop
- Top: label in font-mono text-xs uppercase tracking-widest text-muted
- Middle: value in font-display text-5xl font-semibold, color mapped:
  - amber → text-amber
  - danger → text-danger
  - positive → text-positive
  - primary → text-primary
  - ink → text-ink
- Always use `tabular-nums` class on the value
- Below value: sublabel in text-body text-sm
- Top-right corner: icon (20px) in matching color

### `ClockCounter.tsx`

Clock/calendar for time skip stage.

```typescript
type ClockCounterProps = {
  fromDate: string;          // ISO
  toDate: string;            // ISO
  durationMs: number;
  events?: { atProgress: number; label: string }[];
  onComplete?: () => void;
};
```

Visual:
- Container: `flex flex-col items-center gap-6`
- SVG clock face: 160x160, slate stroke (text-faint), no fill
  - 12 hour markers (small lines)
  - Hour hand: thicker, length 40
  - Minute hand: thinner, length 60
  - Hands rotate via Framer Motion transforms based on progress
  - Hour hand makes ~2 full rotations across duration, minute hand makes ~10
- Below clock: current date interpolating from→to, in font-mono text-sm text-muted
  - Use date-fns or simple Date math to interpolate
- Event overlay below date: each event slides up from bottom + fades in at its progress threshold, holds 1.2s, slides up + fades out
  - Style: `text-body text-sm font-sans`
  - Only show one event at a time
- Subtle particles drifting upward in background (small dots, low opacity, CSS animation)

### `StatusBar.tsx`

Persistent orchestration state bar (inside stage content area, not full-screen fixed).

```typescript
type StatusBarProps = {
  activeAgents: string[];
  currentAction?: string;
  elapsedMs: number;
};
```

Visual:
- Container: `flex items-center justify-between gap-4 h-10 rounded-md bg-surface border-t border-primary-ring px-4`
- Left: small `Activity` icon (text-primary, animate-pulse) + agent names joined " · " in font-mono text-xs text-body
- Right: currentAction in text-body text-xs + elapsed in font-mono text-xs text-muted

## The showcase page

### `src/cinematic/showcase/Showcase.tsx`

Temporary route at `/showcase` for visual QA.

Layout:
- Full-page dark bg
- Title: "PanelRx Visual Vocabulary" (font-display text-3xl)
- Sections (one per component), each with:
  - Section title
  - 3-4 instances of the component in different states, in a grid

For each component, show:
- AgentCard: idle / working / done / error states side-by-side
- StreamingText: a sample that types out on mount
- ThoughtBubble: one per speaker type
- TPAPortalCard: calling / success / failure
- ResultCard: each valueColor option + one with pulse
- ClockCounter: a single instance running from one date to another (loops on completion)
- StatusBar: one with multiple active agents

Add `/showcase` route in `App.tsx`.

## Smoke test

`.claude/smoke-tests/phase-02.test.md`:

1. Open `/showcase` — every component renders without errors
2. StreamingText visibly types character by character with blinking cursor
3. AgentCard in working state has the subtle pulsing border
4. TPAPortalCard transitions visibly between states when toggled
5. ResultCard with pulse=true has the inset glow animation
6. ClockCounter sweeps through dates with events appearing at thresholds
7. ThoughtBubble has the tail pointing correctly toward the avatar
8. All components use only design-system colors (no purple, no glass-morphism)
9. ResponsiveLab: at 375px width, components stack/wrap reasonably
10. `npx tsc --noEmit` passes

## Acceptance criteria

- All 10 smoke test items pass
- No design-system violations (visually inspect)
- Take screenshots of each component for reference

## Commit

`Phase 2: visual vocabulary with showcase route`
