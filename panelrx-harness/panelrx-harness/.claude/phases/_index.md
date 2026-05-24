# Phase Index

The complete ordered build plan for PanelRx. Each phase is a self-contained brief in this directory.

## Build philosophy

- Each phase produces a working, testable state
- Phases build on each other — never skip
- Saturday: Phases 1, 2, 8, 9 (scaffolding)
- Sunday morning: Phases 3-7 (cinematic + landing)
- Sunday afternoon: Phases 10-16 (product pages)
- Sunday late afternoon: Phase 17 (polish + Lovable deploy)

## Phase list

| # | File | Title | Time | Tier |
|---|---|---|---|---|
| 1 | `phase-01-stage-engine.md` | Stage Engine + Control Bar | 20 min | Saturday |
| 2 | `phase-02-visual-vocabulary.md` | Visual Primitives + Showcase | 30 min | Saturday |
| 3 | `phase-03-cinematic-stages-1-3.md` | Cinematic Stages 1-3 | 30 min | Sunday AM |
| 4 | `phase-04-cinematic-stages-4-5.md` | Cinematic Stages 4-5 | 25 min | Sunday AM |
| 5 | `phase-05-cinematic-stage-6.md` | Cinematic Stage 6 (Crown Jewel) | 30 min | Sunday AM |
| 6 | `phase-06-cinematic-stages-7-9.md` | Cinematic Stages 7-9 | 25 min | Sunday AM |
| 7 | `phase-07-landing-page.md` | Landing Page + Pulsing CTA | 30 min | Sunday AM |
| 8 | `phase-08-agentic-harness.md` | Agentic Harness (Claude Client + Event Bus) | 30 min | Saturday |
| 9 | `phase-09-seed-data.md` | Seed Data + Product Shell | 25 min | Saturday |
| 10 | `phase-10-reconcile.md` | /reconcile Page (Live Claude) | 60 min | Sunday PM |
| 11 | `phase-11-dashboard.md` | /dashboard Page | 30 min | Sunday PM |
| 12 | `phase-12-status.md` | /status Page | 25 min | Sunday PM |
| 13 | `phase-13-aggregate.md` | /aggregate MMA Reveal | 30 min | Sunday PM |
| 14 | `phase-14-eligibility.md` | /eligibility Page | 20 min | Sunday PM |
| 15 | `phase-15-submit.md` | /submit Page | 20 min | Sunday PM |
| 16 | `phase-16-connectors.md` | /settings/connectors Page | 15 min | Sunday PM |
| 17 | `phase-17-polish-deploy.md` | Polish + Lovable Deploy | 30 min | Sunday final |

## Dependency graph

```
P1 → P2 → P3 → P4 → P5 → P6 → P7 ─┐
                                   ├──> P17
P8 → P9 → P10 ─┬─ P11 ─┬─ P13 ─────┤
              ├─ P12 ─┤            │
              └─ P14 ─┴─ P15 → P16 ┘
```

## Status

See `PHASE_STATUS.md` in the project root for live status.
