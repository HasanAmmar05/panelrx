# PanelRx — Claude Code Build Context

You are building **PanelRx**, an autonomous AI operations layer for Malaysian solo GP clinics that handles eligibility, claim submission, status tracking, payment reconciliation, and analytics across multiple third-party administrators (TPAs).

This is being built for the **Lovable Vibeathon KL Track 3** on Sunday May 24, 2026. Co-hosts: Lovable, OpenClaw KL, Doctor Anywhere, AWS. The final build will be pasted into Lovable for the submission URL.

## Operating Protocol — read this every session

1. **Always read `.claude/conventions.md`** before writing code
2. **Always read `.claude/design-system.md`** before any UI work
3. **Always check `PHASE_STATUS.md`** before starting a new phase
4. **Always run the phase smoke test** before declaring a phase done (`npm run smoke:phase-N`)
5. After completing a phase, **update `PHASE_STATUS.md`** with what was done, what was skipped, and any deviations
6. If something is ambiguous, check `.claude/data-contracts.md` or `.claude/phases/phase-NN-*.md`
7. **Never invent new dependencies** without asking — package.json is the source of truth
8. **Commit after every phase** with message `"Phase N: <one-line summary>"`

## Critical Rules

- TypeScript strict mode — `npx tsc --noEmit` must pass after every phase
- Tailwind v4 with the custom palette in `.claude/design-system.md` — nothing else
- No purple gradients, no glass morphism, no `rounded-2xl` (except ThoughtBubble), no shadow blobs
- Every file under 300 lines — split if larger
- All animations via Framer Motion
- No emoji in UI except where explicitly specified in a phase brief

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind v4
- Framer Motion
- Lucide React
- Anthropic SDK (browser fetch with env var, for live Claude calls in /reconcile only)

## File Structure (target)

```
src/
├── cinematic/              # The /demo cinematic system
│   ├── Engine.tsx
│   ├── ControlBar.tsx
│   ├── StageIndicator.tsx
│   ├── StageContent.tsx
│   ├── components/         # Visual primitives
│   │   ├── AgentCard.tsx
│   │   ├── StreamingText.tsx
│   │   ├── ThoughtBubble.tsx
│   │   ├── TPAPortalCard.tsx
│   │   ├── ResultCard.tsx
│   │   ├── ClockCounter.tsx
│   │   └── StatusBar.tsx
│   ├── stages/             # 9 stage components
│   │   ├── Stage1Trigger.tsx
│   │   ├── ... Stage9CTA.tsx
│   ├── config.ts
│   └── types.ts
├── shell/                  # Sidebar + topbar for product pages
│   ├── ProductShell.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── pages/                  # Product pages
│   ├── Landing.tsx
│   ├── Demo.tsx
│   ├── Dashboard.tsx
│   ├── Eligibility.tsx
│   ├── Submit.tsx
│   ├── Status.tsx
│   ├── Reconcile.tsx
│   ├── Aggregate.tsx
│   └── Connectors.tsx
├── data/
│   ├── seed.ts             # Single source of truth for all mock data
│   ├── payers.ts           # TPA definitions
│   └── types.ts            # Domain types
├── lib/
│   ├── claudeClient.ts     # Wrapped Anthropic API client
│   ├── agentTrace.ts       # Audit log
│   ├── eventBus.ts         # Agent lifecycle events
│   └── utils.ts            # cn(), formatRM(), etc.
└── App.tsx                 # Routing
```

## Phase Map

See `.claude/phases/_index.md` for the full ordered list and current status.

## Definition of Done per phase

Each phase ends with:
1. All files specified in the phase brief exist and pass `npx tsc --noEmit`
2. The smoke test for that phase passes
3. `npm run dev` builds without errors
4. The acceptance criteria in the phase brief are visually verifiable at the dev URL
5. `PHASE_STATUS.md` is updated
6. Changes are committed with the proper message

## How to start a session

The user will tell you which phase to run. You should:

1. Read this file
2. Read `.claude/prompts/start-phase.md`
3. Follow the start-phase protocol exactly

## How to fail gracefully

If a phase can't be completed:
- Update `PHASE_STATUS.md` with "BLOCKED" status and the specific blocker
- Do NOT proceed to the next phase
- Do NOT delete or break existing working code
- Output a clear summary of what was tried and what failed
