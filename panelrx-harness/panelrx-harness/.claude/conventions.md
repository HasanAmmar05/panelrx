# Coding Conventions

## TypeScript

- Strict mode on
- Prefer `type` over `interface` unless extension is needed
- All component props as named types: `type FooProps = { ... }`
- Avoid `any` — use `unknown` and narrow with type guards
- Exhaustive switch with `never` assertion for enum-like unions

## React

- Functional components only
- Hooks at top, in order: useState, useReducer, useEffect, useMemo, useCallback, custom hooks
- No prop drilling beyond 2 levels — extract into context or restructure
- Event handlers prefixed `handle`: `handleClick`, `handleSubmit`
- Memo only when measured to help (don't preemptively wrap everything in useMemo)

## Imports — order matters

```typescript
// 1. React + framework
import { useState, useEffect } from "react";

// 2. Third-party
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, GitMerge } from "lucide-react";

// 3. Internal absolute (using @ alias)
import { Button } from "@/components/Button";
import { seed } from "@/data/seed";

// 4. Internal relative
import { useStageMachine } from "./useStageMachine";

// 5. Types
import type { AgentId, AgentStatus } from "@/lib/types";
```

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `AgentCard.tsx` |
| Hooks | camelCase with `use` prefix | `useStageMachine.ts` |
| Utilities | camelCase | `formatRM.ts` |
| Constants | SCREAMING_SNAKE_CASE | `STAGE_DURATIONS` |
| Booleans | `is`, `has`, `should`, `can` prefix | `isPlaying`, `hasEnded` |
| Event handlers | `handle` prefix | `handleSkipForward` |
| Types | PascalCase | `type AgentDefinition = ...` |

## File size

- Components under 250 lines
- Hooks under 150 lines
- If approaching limits, extract sub-components into a folder

## State management

- `useReducer` for state machines (cinematic engine, multi-agent orchestration)
- `useState` for simple UI state
- No external state library — React's built-ins are sufficient

## Animation

- Framer Motion for all entrance/exit and complex sequences
- CSS keyframes only for simple things: pulse, blink cursor
- Use Framer's stagger for sequential reveals, not setTimeout chains in JSX
- Animation timings: use Framer's spring presets where possible

## Error handling

- Wrap risky sections in ErrorBoundary
- Never let a Claude API call crash the page — always have a deterministic fallback
- Log errors to console with prefix: `[PanelRx/<Module>]`
- User-facing errors should be calm and non-technical

## Money formatting

- All RM amounts use `formatRM()` utility — tabular-nums, comma separators, 2 decimal places when needed
- Always right-align money in tables and lists
- Use `tabular-nums` Tailwind class on every numeric display

## Tailwind class ordering

Use this order for readability:
1. Layout (flex, grid, block)
2. Positioning (absolute, relative, top, left)
3. Sizing (w, h, max-w)
4. Spacing (p, m, gap)
5. Typography (text-*, font-*)
6. Background and borders
7. Effects (shadow, opacity)
8. Transitions and animations
9. Responsive (md:*, lg:*)

## Commits

- One commit per phase
- Format: `Phase N: <one-line summary>`
- Examples:
  - `Phase 1: stage engine with control bar and progress indicator`
  - `Phase 5: stage 6 reconciliation crown jewel`
  - `Phase 8: agentic harness with Claude client and event bus`

## Things to NEVER do

- ❌ Add new dependencies without explicit instruction
- ❌ Reach across the cinematic/pages boundary (cinematic is self-contained)
- ❌ Put real API keys in committed code (use `import.meta.env.VITE_*`)
- ❌ Use emoji in UI except where a phase brief explicitly specifies
- ❌ Use inline styles when a Tailwind class exists
- ❌ Use `console.log` without the `[PanelRx/<Module>]` prefix
- ❌ Break working code from a previous phase to fix a new one
- ❌ Skip the smoke test
- ❌ Delete `PHASE_STATUS.md` — only update it
