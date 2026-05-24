# Phase 17 — Polish + Bulletproof + Lovable Deploy

**Goal**: Final hardening. OG tags, error boundaries, cold-load reliability, keyboard shortcuts, then paste into Lovable for the submission URL.

**Dependencies**: All previous phases complete.

**Output**: Lovable URL that works cold-loaded on a judge's phone.

## Part A — Polish (15 min)

### Open Graph + meta tags

Update `index.html` head:

```html
<title>PanelRx — Autonomous AI ops for Malaysian GP clinics</title>
<meta name="description" content="Dr. Vani is owed RM 47,830 today. PanelRx is the AI shadow back office for the 9,600+ solo Malaysian GP clinics. Live demo at Lovable Vibeathon KL · May 2026.">

<meta property="og:title" content="PanelRx — Autonomous AI ops for Malaysian GP clinics">
<meta property="og:description" content="Dr. Vani is owed RM 47,830 today. PanelRx is the AI shadow back office for the 9,600+ solo Malaysian GP clinics.">
<meta property="og:image" content="/og-image.png">
<meta property="og:url" content="https://panelrx.lovable.app">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PanelRx — Autonomous AI ops for Malaysian GP clinics">
<meta name="twitter:description" content="Watch what happens when a patient walks in.">
<meta name="twitter:image" content="/og-image.png">

<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

### Favicon

Create `public/favicon.svg` — simple SVG of the letter "P" in primary teal on dark bg.

### OG image

Manually take a screenshot of the landing page (the hero section with the pulsing CTA). Save as `public/og-image.png` at 1200×630. If you don't have time, skip this — meta tags still render fine.

### Final routing cleanup

Make sure all routes are registered in `App.tsx`. Verify the routing tree:
- `/` → Landing
- `/demo` → Engine (cinematic)
- `/showcase` → Showcase (delete this route — it was for visual QA only)
- `/agents-debug` → AgentsDebug (delete this route)
- `/dashboard` → Dashboard
- `/eligibility` → Eligibility
- `/submit` → Submit
- `/status` → Status
- `/reconcile` → Reconcile
- `/aggregate` → Aggregate
- `/settings/connectors` → Connectors
- 404 → redirect to `/` after 2s

## Part B — Bulletproof (20 min)

### Error boundaries

Wrap each route in an ErrorBoundary:

```typescript
// src/lib/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[PanelRx/ErrorBoundary]", error, info);
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="p-8 text-body">Something went wrong. <a href="/" className="text-primary underline">Go home</a></div>;
    }
    return this.props.children;
  }
}
```

Wrap each route. For the cinematic specifically, wrap each individual stage in `StageErrorBoundary` — if a stage throws, dispatch NEXT_STAGE instead of crashing.

### Cinematic preload

Before the first stage starts, verify all stage components have loaded:
- Use `React.lazy` for stage components if needed (probably not necessary at this scale)
- Show a brief loading screen (max 1.5s) with PanelRx mark + "Preparing cinematic..."
- If load exceeds 3s, show a "Tap to start" button

### Pause-on-blur

In the cinematic Engine:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) dispatch({ type: "TOGGLE_PLAY" }); // pause if playing
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);
```

### Keyboard shortcuts (in cinematic only)

- Space: toggle play/pause
- ArrowRight: next stage
- ArrowLeft: previous stage
- R: replay
- Esc: skip to end

### Disable text selection in cinematic

Add `select-none` Tailwind class to the cinematic container so judges don't accidentally select text while clicking.

### Mobile cold-load test

Open the app on a real phone (via local network in dev mode, or via the eventual Lovable URL):
- Landing page renders without horizontal scroll
- CTA button is large enough to tap
- Click CTA → cinematic plays smoothly
- All 9 stages render without performance issues
- If any stage stutters on mobile, reduce animation complexity (fewer particles in Stage 5, simpler transitions in Stage 6)

## Part C — Lovable Integration (20 min)

### Production build test

```bash
npm run build
npm run preview
```

Open `localhost:4173` — verify the production build works identically to dev mode. If anything breaks (route issues, missing env vars, etc.), fix before proceeding.

### Environment variables

In your local `.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

In Lovable, you'll need to set this as a secret/env var in their UI.

### Copy to Lovable

Option A — clone-style: if Lovable supports importing a git repo, push your CC build to GitHub and import it.

Option B — manual paste: open a fresh Lovable project, then for each major file in your build:
1. Tell Lovable: "Create file at path src/cinematic/Engine.tsx with this content: [paste]"
2. Repeat for every file
3. Or use Lovable's "Settings → Connect to GitHub" feature if available

Files to copy in order (so dependencies resolve):
1. `package.json` (ensure all deps listed: framer-motion, lucide-react, react-router-dom, etc.)
2. `tailwind.config.ts` and `index.css`
3. `src/main.tsx`, `src/App.tsx`
4. `src/lib/` (utilities first)
5. `src/data/` (seed and types)
6. `src/cinematic/` (engine, components, stages)
7. `src/shell/` (sidebar, topbar)
8. `src/pages/` (all product pages)

### Verify in Lovable

After all files copied:
1. Lovable should auto-build
2. Open the live URL
3. Test the full user journey:
   - Landing page renders
   - Click CTA → /demo plays
   - All 9 cinematic stages work
   - Sidebar navigation works on all product pages
   - /reconcile live Claude call works (need VITE_ANTHROPIC_API_KEY set as Lovable env var)
4. Test on phone via the Lovable URL

### Final cold-load test

Open the Lovable URL in incognito (or on a colleague's phone):
- Page loads in < 5 seconds
- Cinematic plays without errors
- All product pages navigable
- No console errors

### Copy final URL

The Lovable URL is what you submit at 4 PM via the WhatsApp form.

## Submission checklist

When you fill in the Vibeathon submission form:

**Team name**: (your team)
**Track**: 3 — Healthcare Operations Automation
**Written problem statement** (paragraph):
> Malaysian solo GP clinics — 9,600+ of them, mostly single-doctor — wait 3 to 6 months (sometimes 9 months to 2 years) for third-party administrators (TPAs) to pay submitted claims. Up to 10% is deducted per claim, often with vague reasons like "admin adjustment" and no contract clause cited. Each clinic juggles 6+ TPAs, each with different portals, hotlines, and submission flows. Front-desk staff burn 8-11 hours per week chasing payments. The MMA has demanded TPA regulation since 2015 but lacks industry-wide data. PanelRx is the autonomous AI operations layer between clinics and TPAs.

**Written solution**:
> PanelRx is an autonomous AI operations layer between Malaysian GP clinics and third-party administrators (TPAs). Eight Claude-powered agents — Eligibility, Submission, Status, Ingestion, Matching, Variance, Appeal, Analytics — eliminate the manual handoffs in the four-stage TPA workflow (verification, claim creation, follow-up, payment reconciliation) that currently consumes 8-11 hours per week per clinic across Malaysia's 9,600+ solo GP practices. Built on Claude Sonnet 4.6 + Haiku 4.5 with a connector framework — extensible from 6 to 55+ payers (the MOH-mandated TPA registry size) via configuration, not custom code. Real bilingual appeal letters are generated live in /reconcile by Claude Sonnet 4.6. The aggregate layer surfaces anonymized industry data the Malaysian Medical Association has been requesting since 2015. Built in 4 hours on Lovable.

**Live URL**: (your Lovable URL)

## Acceptance criteria

- Live Lovable URL loads cold in under 5 seconds
- Cinematic plays without errors on mobile and desktop
- All product pages navigable
- Real Claude appeal letter works in /reconcile
- No console errors anywhere
- OG preview works when URL pasted into WhatsApp

## Commit

`Phase 17: polished, bulletproofed, Lovable-deployed`

## You did it

If this phase is done at 3:40 PM, you have 20 minutes of buffer before the 4 PM submission. Take a breath. Take a screenshot of the URL working. Hit submit.
