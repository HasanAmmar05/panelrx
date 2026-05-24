# Phase 1 — Stage Engine

**Goal**: A state machine that advances through 9 stages with hard-coded timings. NO content beyond placeholders. This is the spine of the cinematic.

**Dependencies**: none (this is the foundation)

**Output**: At `/demo`, see "STAGE 1 OF 9" with a timer ticking, auto-advancing through 9 stages, control bar working.

## Files to create

### `src/cinematic/types.ts`
Export the cinematic types from `.claude/data-contracts.md`:
- `StageId`, `Stage`, `EngineState`, `EngineAction`

### `src/cinematic/config.ts`

Export `STAGES: Stage[]` with exactly these values:

```typescript
export const STAGES: Stage[] = [
  { id: 1, name: "The Trigger", durationMs: 5000, description: "Patient walks in. Front-desk staff types MyKad." },
  { id: 2, name: "The Verification Cascade", durationMs: 10000, description: "EligibilityAgent checks 3 panels in parallel." },
  { id: 3, name: "The Consultation", durationMs: 4000, description: "45 minutes pass. The doctor sees the patient." },
  { id: 4, name: "The Submission Storm", durationMs: 10000, description: "SubmissionAgent broadcasts canonical claim." },
  { id: 5, name: "The Time Skip", durationMs: 6000, description: "Days and weeks pass. StatusAgent watches." },
  { id: 6, name: "The Reconciliation", durationMs: 18000, description: "Remittance arrives. 5 agents reconcile." },
  { id: 7, name: "The Resolution", durationMs: 8000, description: "Dr. Vani's dashboard at end of month." },
  { id: 8, name: "The MMA Reveal", durationMs: 6000, description: "Zoom out: 1,000 clinics." },
  { id: 9, name: "The CTA", durationMs: 5000, description: "Pilot Monday. Live demo ends." },
];
```

Total runtime: 72 seconds.

### `src/cinematic/Engine.tsx`

The state machine. Use `useReducer` with `EngineState` and `EngineAction`.

Reducer logic:
- `TICK`: increment `elapsedInStage` by `deltaMs`. If exceeds current stage duration, dispatch `NEXT_STAGE`.
- `NEXT_STAGE`: if `currentStage < 9`, increment + reset elapsed. Else set `hasEnded=true`, `isPlaying=false`.
- `PREV_STAGE`: if `currentStage > 1`, decrement + reset elapsed.
- `REPLAY`: reset to `{ currentStage: 1, elapsedInStage: 0, isPlaying: true, hasEnded: false }`.
- `TOGGLE_PLAY`: flip `isPlaying`.
- `JUMP_TO_STAGE`: set `currentStage` to specified stage, reset elapsed.
- `SKIP_TO_END`: set `currentStage: 9`, `elapsedInStage: STAGES[8].durationMs`, `hasEnded: true`.

Use a 100ms interval in `useEffect` that dispatches `TICK` while playing.

Container styling:
- `min-h-screen bg-background text-ink overflow-hidden`
- `select-none` (prevent text selection in cinematic)
- Renders `StageIndicator` at top, current stage content (just placeholder in this phase), `ControlBar` at bottom

### `src/cinematic/StageIndicator.tsx`

A thin progress bar at the very top.
- `fixed top-0 left-0 right-0 h-1 z-50`
- Background: `bg-border`
- 9 equal-width slots separated by 2px gaps
- Each slot: completed stages filled `bg-primary opacity-60`, current stage fills progressively `bg-primary` based on `elapsedInStage / durationMs`
- Use Framer Motion or CSS transitions for smooth fill

### `src/cinematic/ControlBar.tsx`

Floating bottom controls.
- `fixed bottom-6 left-1/2 -translate-x-1/2 z-40`
- Container: `flex items-center gap-3 bg-surface-elevated border border-border rounded-full px-4 py-3`
- Backdrop should be slightly translucent on the surface to feel like floating

Controls (using Lucide icons, 20px):
- `SkipBack` button (disabled if currentStage === 1)
- `Play` / `Pause` button (toggles)
- `SkipForward` button
- Vertical divider (1px wide, h-5, `bg-border-strong`)
- "Stage X of 9" label, `font-mono text-xs text-body`
- mm:ss format elapsed/total, `font-mono text-xs text-muted`
- Vertical divider
- "Skip to end" button (`ChevronsRight` icon + "End" label), only visible if currentStage < 9
- "Replay" button (`RotateCcw` icon + "Replay" label), only visible if `hasEnded`

Button styling:
- `p-2 rounded-md hover:bg-primary-soft transition-colors`
- Disabled: `opacity-30 cursor-not-allowed`

### `src/cinematic/PlaceholderContent.tsx`

The temporary stage display used only in Phase 1. Replaced in P3-P6.

Renders:
- Container: `flex flex-col items-center justify-center min-h-screen px-8 text-center`
- Top: small mono label `STAGE {currentStage} OF 9` in `text-muted text-xs tracking-widest uppercase`
- Middle: huge `text-6xl font-display font-semibold text-ink` showing stage name
- Below: `text-body text-lg max-w-2xl mt-4` showing description
- Bottom: `text-muted font-mono text-sm mt-12` showing `{elapsedSeconds}s / {durationSeconds}s` updating live

### `src/cinematic/StageContent.tsx`

A router component that switches on `currentStage` and renders the appropriate stage. In Phase 1, returns `<PlaceholderContent>` for all 9 stages.

### `src/App.tsx`

Set up React Router. Two routes for now:
- `/` redirects to `/demo` (we'll change to landing in Phase 7)
- `/demo` renders `<Engine />`

### `src/main.tsx` (verify)

Standard Vite + React entrypoint. No special setup yet.

## Tailwind setup

Ensure `index.css` includes the `@theme` block from `.claude/design-system.md`. Add Google Fonts link to `index.html`.

## Smoke test

Create `.claude/smoke-tests/phase-01.test.md` with manual checks:

1. `npm run dev` boots without errors
2. Open `localhost:5173/demo` — see "STAGE 1 OF 9 · The Trigger" centered, timer ticking 5.0 → 0.0
3. Auto-advances to Stage 2 after 5s
4. Click forward arrow → skips to Stage 3
5. Click back arrow → back to Stage 2
6. Click pause → timer pauses; click play → resumes
7. Click "Skip to end" → jumps to Stage 9
8. Let it end → "Replay" appears; click → restarts from Stage 1
9. Progress bar at top fills smoothly through each stage
10. Mobile (375px viewport): control bar doesn't overflow
11. `npx tsc --noEmit` passes with zero errors

## Acceptance criteria

- ✅ All 11 smoke test items pass
- ✅ No console errors in browser
- ✅ Animations feel smooth (no janky transitions)
- ✅ Selection cursor doesn't appear when hovering cinematic content

## Commit

`Phase 1: stage engine with control bar and progress indicator`

## Update PHASE_STATUS.md

Mark Phase 1 as `COMPLETE` with timestamp and brief notes on any deviations.
