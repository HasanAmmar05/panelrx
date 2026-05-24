# PanelRx — Phase Status Tracker

This file is the live source of truth for the build. Claude Code updates this after every phase.

**Last updated**: (not started)
**Current phase**: (not started)
**Next phase**: Phase 1

---

## Status Legend

- `NOT_STARTED` — phase has not begun
- `IN_PROGRESS` — actively being worked on
- `COMPLETE` — all acceptance criteria pass
- `BLOCKED` — cannot proceed (see notes)
- `SKIPPED` — intentionally skipped (see notes)
- `DEFERRED` — postponed (see notes)

---

## Phase Status Table

| # | Phase | Status | Started | Completed | Notes |
|---|---|---|---|---|---|
| 1 | Stage Engine | NOT_STARTED | — | — | — |
| 2 | Visual Vocabulary | NOT_STARTED | — | — | — |
| 3 | Cinematic Stages 1-3 | NOT_STARTED | — | — | — |
| 4 | Cinematic Stages 4-5 | NOT_STARTED | — | — | — |
| 5 | Cinematic Stage 6 (Crown Jewel) | NOT_STARTED | — | — | — |
| 6 | Cinematic Stages 7-9 | NOT_STARTED | — | — | — |
| 7 | Landing Page | NOT_STARTED | — | — | — |
| 8 | Agentic Harness | NOT_STARTED | — | — | — |
| 9 | Seed Data + Product Shell | NOT_STARTED | — | — | — |
| 10 | /reconcile (Live Claude) | NOT_STARTED | — | — | — |
| 11 | /dashboard | NOT_STARTED | — | — | — |
| 12 | /status | NOT_STARTED | — | — | — |
| 13 | /aggregate | NOT_STARTED | — | — | — |
| 14 | /eligibility | NOT_STARTED | — | — | — |
| 15 | /submit | NOT_STARTED | — | — | — |
| 16 | /settings/connectors | NOT_STARTED | — | — | — |
| 17 | Polish + Deploy | NOT_STARTED | — | — | — |

---

## Deviations log

(Claude Code logs any deviations from the phase briefs here)

---

## Post-phase fixes

(Bug fixes after a phase was marked complete go here)

---

## Build environment

- **Node version**: (set after setup)
- **Package manager**: npm
- **Dev URL**: http://localhost:5173
- **Production preview URL**: http://localhost:4173
- **Anthropic API key**: (set in `.env.local` as `VITE_ANTHROPIC_API_KEY`)

---

## Quick smoke commands

```bash
# Type check (must pass after every phase)
npx tsc --noEmit

# Dev server
npm run dev

# Production build
npm run build && npm run preview
```

---

## Time-budget reality check

Target completion times for Sunday May 24, 2026:

| Phase | Target start | Target finish |
|---|---|---|
| Pre-build (Sat) | Sat 22:00 | Sat 23:30 |
| 3-6 (cinematic content) | Sun 09:15 | Sun 11:05 |
| 7 (landing) | Sun 11:05 | Sun 11:35 |
| Dress rehearsal 1 | Sun 11:35 | Sun 11:50 |
| 10 (/reconcile) | Sun 12:20 | Sun 13:20 |
| 11-13 (dashboard, status, aggregate) | Sun 13:20 | Sun 14:45 |
| 14-16 (eligibility, submit, connectors) | Sun 14:45 | Sun 15:40 |
| 17 (polish + deploy) | Sun 15:40 | Sun 16:00 |
| **Submission deadline** | — | **Sun 16:00** |

If running >15 min behind at any checkpoint, drop a Tier 3 page (P14, P15, or P16) and replace with `<ProductShell><div>Coming in pilot release</div></ProductShell>` placeholder.
