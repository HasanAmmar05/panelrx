# Phase 3 — Cinematic Stages 1-3

**Goal**: Replace placeholder content with real stage components for Stages 1, 2, 3.

**Dependencies**: Phases 1 and 2 complete.

**Output**: At `/demo`, Stages 1-3 play with real content, then placeholder for Stages 4-9.

## Architecture change

Replace `PlaceholderContent.tsx` consumption with a stage router. Create `src/cinematic/stages/` folder with one file per stage.

Update `StageContent.tsx`:
```typescript
switch (currentStage) {
  case 1: return <Stage1Trigger elapsedMs={elapsedInStage} />;
  case 2: return <Stage2Verification elapsedMs={elapsedInStage} />;
  case 3: return <Stage3Consultation elapsedMs={elapsedInStage} />;
  default: return <PlaceholderContent ... />;
}
```

Each stage component takes `elapsedMs` and internally derives sub-phase from it.

## Stage 1 — "The Trigger" (5000ms)

`src/cinematic/stages/Stage1Trigger.tsx`

Frame budget:
- 0–500ms: Empty stage with subtle ambient glow (radial gradient from primary-soft at very low opacity)
- 500–2000ms: `ThoughtBubble` appears (left, staff): StreamingText "Patient just walked in. Let me verify his coverage." (30ms/char so it completes by 2000ms)
- 2000–3000ms: A simulated check-in form appears below the bubble — `bg-surface rounded-lg p-6 border border-border max-w-md`. Header: "Patient check-in" font-display text-lg. Input field labeled "MyKad / IC number" with the value `920101-10-1234` being typed character-by-character (40ms/char). Below input on completion: small text "Encik Faizal Rahman · 34 male" in text-body text-sm
- 3000–5000ms: Form fades. Big text appears center, font-mono text-2xl text-primary: `"STARTING WORKFLOW..."` fades in/out over 1.5s

Use Framer Motion AnimatePresence for transitions between sub-phases.

Layout: `flex flex-col items-center justify-center min-h-screen px-8 gap-6`.

## Stage 2 — "The Verification Cascade" (10000ms)

`src/cinematic/stages/Stage2Verification.tsx`

Frame budget:
- 0–800ms: `ThoughtBubble` (left, staff): "I need to check MiCare, MediExpress, and PMCare. Old way: 3 phone calls, 17 minutes."
- 800–1200ms: ThoughtBubble fades. Big mono text fades in (text-2xl text-primary): "EligibilityAgent · calling 3 panels in parallel"
- 1200–2000ms: Three `TPAPortalCard` components animate in horizontally (stagger 200ms, slide up + fade in):
  - MiCare, accessMethod=hotline, status=calling
  - MediExpress, accessMethod=portal, status=calling
  - PMCare, accessMethod=app, status=calling
- 2000–5500ms: Cards remain calling
- 5500–6200ms: Card 1 resolves: status=success, responseText="Active · Berjaya Sompo OPD · RM 1,200 remaining · RM 0 copay", latencyMs=4700
- 6200–7000ms: Card 2 resolves: status=success, responseText="Active · Etiqa Corporate · RM 800 remaining · RM 5 copay", latencyMs=5400
- 7000–7800ms: Card 3 resolves: status=failure, responseText="Employee resigned 14-Feb-2026", latencyMs=6000
- 7800–9000ms: Summary banner slides up below cards: "2 of 3 panels active · patient eligible at clinic" in text-positive font-display text-lg with a CheckCircle icon
- 9000–10000ms: Bottom text appears, text-body text-base, two lines: "Old way: 17 minutes. New way: 6.8 seconds." Second line italic: "Patient hasn't even sat down."

StatusBar visible throughout:
- 0–1200ms: activeAgents=["Orchestrator"], currentAction="initializing eligibility check"
- 1200ms onward: activeAgents=["EligibilityAgent"], currentAction updates dynamically (transitions through "calling 3/3 panels" → "2/3 resolved" → "3/3 complete")

Layout: vertical flex, cards in horizontal row (`flex flex-row gap-4` on md+, `flex flex-col gap-3` on mobile).

## Stage 3 — "The Consultation" (4000ms)

`src/cinematic/stages/Stage3Consultation.tsx`

Frame budget:
- 0–800ms: Full screen darkens (additional overlay over bg, opacity 0 → 0.3). Single line center, font-display italic text-2xl text-muted: "45 minutes pass."
- 800–2000ms: SOAP note container appears (`bg-surface border border-border rounded-lg p-6 max-w-md font-mono text-sm`). Lines stream in with StreamingText (100ms gap between lines):
  - "Patient: Encik Faizal Rahman"
  - "DX: Acute pharyngitis (J02.9)"
  - "Rx: Paracetamol 500mg, Amoxicillin 500mg"
  - "MC: 2 days"
  - "Consultation: RM 35.00"
- 2000–3500ms: Below SOAP note, subtle text appears (text-body text-base font-sans, italic): "The doctor finishes consultation."
- 3500–4000ms: Fade out

Use a single SOAP note component that takes a list of lines and streams them sequentially.

## Sub-phase derivation pattern

For each stage, create a helper that maps `elapsedMs` to a sub-phase index. Example for Stage 1:

```typescript
function getSubPhase(elapsedMs: number): "ambient" | "bubble" | "form" | "starting" {
  if (elapsedMs < 500) return "ambient";
  if (elapsedMs < 2000) return "bubble";
  if (elapsedMs < 3000) return "form";
  return "starting";
}
```

Then use `<AnimatePresence mode="wait">` to crossfade between sub-phases.

## Content config

Update `src/cinematic/config.ts` to add `content` fields per stage. Pull strings into a structured config so they're easy to tweak later:

```typescript
export const STAGE_CONTENT = {
  stage1: {
    bubbleText: "Patient just walked in. Let me verify his coverage.",
    patientName: "Encik Faizal Rahman · 34 male",
    icNumber: "920101-10-1234",
  },
  stage2: {
    bubbleText: "I need to check MiCare, MediExpress, and PMCare. Old way: 3 phone calls, 17 minutes.",
    agentLabel: "EligibilityAgent · calling 3 panels in parallel",
    tpas: [
      { name: "MiCare", method: "hotline", response: "Active · Berjaya Sompo OPD · RM 1,200 remaining · RM 0 copay", latency: 4700, status: "success" },
      { name: "MediExpress", method: "portal", response: "Active · Etiqa Corporate · RM 800 remaining · RM 5 copay", latency: 5400, status: "success" },
      { name: "PMCare", method: "app", response: "Employee resigned 14-Feb-2026", latency: 6000, status: "failure" },
    ],
    summary: "2 of 3 panels active · patient eligible at clinic",
    comparison: { old: "17 minutes", new: "6.8 seconds", kicker: "Patient hasn't even sat down." },
  },
  stage3: {
    intro: "45 minutes pass.",
    soapLines: [
      "Patient: Encik Faizal Rahman",
      "DX: Acute pharyngitis (J02.9)",
      "Rx: Paracetamol 500mg, Amoxicillin 500mg",
      "MC: 2 days",
      "Consultation: RM 35.00",
    ],
    outro: "The doctor finishes consultation.",
  },
};
```

## Smoke test

`.claude/smoke-tests/phase-03.test.md`:

1. Open `/demo` from start. Stage 1 plays: ambient → thought bubble → form with IC typing → "STARTING WORKFLOW"
2. Auto-advances to Stage 2: bubble → agent label → 3 portal cards cascade in
3. Stage 2 cards resolve correctly: 2 success, 1 failure with right text
4. Summary banner appears with positive accent
5. Comparison text "Old way: 17 minutes. New way: 6.8 seconds." appears
6. Auto-advances to Stage 3: fade to dark → "45 minutes pass." → SOAP note streams line by line
7. Auto-advances to Stage 4 (placeholder still)
8. Skip/replay still work
9. No layout jumps between sub-phases of a stage
10. StatusBar updates correctly throughout
11. Mobile: SOAP note readable, portal cards stack vertically
12. `npx tsc --noEmit` passes

## Acceptance criteria

- All smoke test items pass
- Sub-phase transitions feel smooth, not jumpy
- The streaming text feels deliberate, not rushed

## Commit

`Phase 3: cinematic stages 1-3 (trigger, verification, consultation)`
