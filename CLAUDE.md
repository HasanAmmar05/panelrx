# PanelRx — Cinematic Demo Build

## What we're building
A 90-second cinematic demo at /demo showing 9 stages of an autonomous AI agent workflow for Malaysian GP clinics. Built for the Lovable Vibeathon KL Track 3, May 24 2026.

## Architecture
- Single-page React app (Vite + TS + Tailwind v4 + Framer Motion)
- One main route: /demo (the cinematic)
- All cinematic content in src/cinematic/config.ts
- All cinematic primitives in src/cinematic/components/
- State machine via useReducer in src/cinematic/Engine.tsx
- Final build will be pasted into Lovable

## Design System (NON-NEGOTIABLE)
Palette:
- background: #0A0E1A (deep ink cinematic bg)
- surface: rgba(15, 23, 42, 0.6)
- surface-elevated: rgba(15, 23, 42, 0.9)
- ink: #F8FAFC
- body: #94A3B8
- muted: #64748B
- primary: #14B8A6 (teal accent)
- primary-deep: #0F766E
- amber: #F59E0B (money/variance)
- danger: #EF4444 (unexplained)
- positive: #10B981 (paid/matched)

Fonts:
- Display & numbers: Geist (fallback: system-ui)
- Body: Inter (fallback: system-ui)
- Mono (agent labels, terminal text): JetBrains Mono (fallback: monospace)

Anti-patterns (DO NOT USE):
- No purple gradients anywhere
- No glass morphism
- No drop-shadow blobs
- No emoji except where explicitly specified
- No default shadcn colors
- No rounded-2xl on anything (use rounded-md or rounded-lg)
- No filled status pills (use dot + label)

## Definition of Done per phase
Each phase ends with a working `npm run dev` that I can open at localhost:5173/demo and verify visually. No phase is done until I can take a screenshot of it working.

## Commands
- Run dev: `npm run dev`
- Type check: `npx tsc --noEmit`
- Always run typecheck before declaring a phase done.