# PanelRx — Claude Code Autonomous Build Harness

This package contains everything Claude Code needs to autonomously build PanelRx (the Lovable Vibeathon KL Track 3 submission) across 17 phases.

You drop these files into your empty project folder, give Claude Code the master prompt below, and execute one phase at a time. CC handles the building. You handle visual verification between phases.

---

## ⚡ Quick Start

### 1. Bootstrap the project (one-time, ~10 min)

```bash
# Create empty Vite + React + TS project
npx create-vite@latest panelrx -- --template react-ts
cd panelrx

# Install required deps
npm install
npm install react-router-dom framer-motion lucide-react clsx tailwind-merge
npm install -D tailwindcss@latest @tailwindcss/vite

# Tailwind v4 setup
# In vite.config.ts, add: import tailwindcss from "@tailwindcss/vite"; export default { plugins: [react(), tailwindcss()] }
# In src/index.css, add: @import "tailwindcss"; (and the @theme block from .claude/design-system.md)

# Initialize git
git init && git add -A && git commit -m "Initial Vite scaffold"
```

### 2. Unzip this harness into the project root

Unzip `panelrx-harness.zip` directly into your `panelrx/` folder. You should now have:

```
panelrx/
├── CLAUDE.md                  # ← from this zip
├── PHASE_STATUS.md            # ← from this zip
├── .claude/                   # ← from this zip
│   ├── conventions.md
│   ├── design-system.md
│   ├── data-contracts.md
│   ├── phases/                # 17 phase briefs
│   ├── prompts/               # CC protocols
│   └── smoke-tests/           # Per-phase test checklists
├── .env.example               # ← from this zip
├── src/                       # ← from Vite scaffold
├── package.json               # ← from Vite scaffold
└── ...
```

### 3. Set up `.env.local`

```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key:
# VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

You can use a temporary key for the hackathon — rotate after.

### 4. Start dev server (keep running)

```bash
npm run dev
```

Leave this running in one terminal throughout the build.

### 5. Open Claude Code

In the same `panelrx/` folder, in a separate terminal:

```bash
claude code
```

### 6. Give CC the master prompt

Paste the prompt below into Claude Code. CC will read everything, then build phase by phase as you instruct.

---

## 🎯 The Master Prompt

Paste this EXACTLY into Claude Code at the start of every session:

```
Read CLAUDE.md, then read .claude/prompts/start-phase.md.

You are building PanelRx, the Lovable Vibeathon KL Track 3 submission. The full build is decomposed into 17 phases. I will tell you which phase to run.

Operating rules:
1. Before each phase, follow .claude/prompts/start-phase.md exactly.
2. After each phase, update PHASE_STATUS.md and commit.
3. Do not skip the smoke test.
4. Do not modify previous phases' code unless the current brief requires it.
5. Do not add npm dependencies without checking package.json first.
6. Use the design system in .claude/design-system.md strictly — no purple, no glass-morphism, no rounded-2xl except ThoughtBubble.
7. Keep files under 250 lines; split if larger.
8. Always run `npx tsc --noEmit` before declaring done.

When ready, tell me you've read the context and confirm you understand the protocol. Then I'll tell you which phase to execute first.
```

### 7. Run phases in order

After CC confirms it understands, run phases one at a time:

```
Run Phase 1.
```

CC will:
- Read the phase brief
- Output a plan
- Build the phase
- Run smoke tests
- Update PHASE_STATUS.md
- Commit
- Tell you to run the next phase

Between phases, you visually verify at `http://localhost:5173/<route>`. If something looks wrong, tell CC:

```
Verify Phase 1.
```

or:

```
Debug: <symptom>
```

CC will fall back to the verify-phase or debug-failure protocols.

---

## 📅 Recommended Execution Schedule

### Saturday night (~90 min) — pre-build the scaffolding

Run these in order:

1. `Run Phase 1` — Stage engine (20 min)
2. `Run Phase 2` — Visual vocabulary (30 min)
3. `Run Phase 8` — Agentic harness (30 min)
4. `Run Phase 9` — Seed data + product shell (25 min)

After Saturday: visually verify all 4 phases work. You'll have:
- A working `/demo` stage engine (placeholders)
- A `/showcase` route showing all visual primitives
- An `/agents-debug` route proving the harness works
- All product page stubs accessible from the sidebar

### Sunday morning at the venue

| Time | Phase | What |
|---|---|---|
| 09:15 | Run Phase 3 | Cinematic stages 1-3 |
| 09:45 | Run Phase 4 | Cinematic stages 4-5 |
| 10:10 | Run Phase 5 | Cinematic stage 6 (crown jewel) |
| 10:40 | Run Phase 6 | Cinematic stages 7-9 |
| 11:05 | Run Phase 7 | Landing page |
| 11:35 | First dress rehearsal | (manual) |
| 11:50 | Lunch | (offline) |
| 12:20 | Run Phase 10 | /reconcile with live Claude |
| 13:20 | Run Phase 11 | /dashboard |
| 13:50 | Run Phase 12 | /status |
| 14:15 | Run Phase 13 | /aggregate |
| 14:45 | Run Phase 14 | /eligibility |
| 15:05 | Run Phase 15 | /submit |
| 15:25 | Run Phase 16 | /settings/connectors |
| 15:40 | Run Phase 17 | Polish + Lovable deploy |
| 15:50 | Final cold-load test on phone | (manual) |
| 16:00 | **SUBMIT via WhatsApp** | — |

### Time-budget rules

If you're running >15 min behind at any checkpoint:

- **First to drop**: Phase 16 (/settings/connectors) → replace with placeholder page
- **Second to drop**: Phase 15 (/submit) → replace with placeholder
- **Third to drop**: Phase 14 (/eligibility) → replace with placeholder
- **NEVER drop**: Phases 1-7 (cinematic + landing), Phase 8 (harness), Phase 10 (/reconcile), Phase 17 (polish + deploy)

---

## 📂 What's In This Zip

```
.
├── README.md                         ← YOU ARE HERE
├── CLAUDE.md                         ← Master context CC reads every session
├── PHASE_STATUS.md                   ← Live status tracker (CC updates this)
├── .env.example                      ← Template for .env.local
└── .claude/
    ├── conventions.md                ← Coding conventions
    ├── design-system.md              ← Visual invariants (palette, fonts, anti-patterns)
    ├── data-contracts.md             ← TypeScript types shared across phases
    ├── phases/
    │   ├── _index.md
    │   ├── phase-01-stage-engine.md
    │   ├── phase-02-visual-vocabulary.md
    │   ├── phase-03-cinematic-stages-1-3.md
    │   ├── phase-04-cinematic-stages-4-5.md
    │   ├── phase-05-cinematic-stage-6.md
    │   ├── phase-06-cinematic-stages-7-9.md
    │   ├── phase-07-landing-page.md
    │   ├── phase-08-agentic-harness.md
    │   ├── phase-09-seed-data.md
    │   ├── phase-10-reconcile.md
    │   ├── phase-11-dashboard.md
    │   ├── phase-12-status.md
    │   ├── phase-13-aggregate.md
    │   ├── phase-14-eligibility.md
    │   ├── phase-15-submit.md
    │   ├── phase-16-connectors.md
    │   └── phase-17-polish-deploy.md
    └── prompts/
        ├── start-phase.md            ← Protocol CC follows at start of each phase
        ├── verify-phase.md           ← Protocol for verification
        └── debug-failure.md          ← Protocol for bug fixes
```

---

## 🧪 How to Verify Each Phase

After CC declares a phase complete:

1. Open `http://localhost:5173/<route>` for the phase
2. Walk through the smoke test checklist (see `.claude/phases/phase-NN-*.md`)
3. If anything looks off:
   - `Verify Phase N` — CC walks through the smoke test with you
   - `Debug: <what's wrong>` — CC follows the debug protocol
4. When happy, proceed: `Run Phase N+1`

---

## 🆘 If Something Breaks

### "CC went off-rails"
Tell CC: `Stop. Re-read CLAUDE.md and .claude/prompts/start-phase.md.`

### "The cinematic broke on Stage 5"
Tell CC: `Debug: cinematic stage 5 has [symptom]. Use the debug-failure protocol.`

### "I'm out of time"
Tell CC: `Time pressure. Skip Phase NN by replacing /route with a "Coming in pilot release" placeholder. Update PHASE_STATUS.md to SKIPPED.`

### "Lovable deploy failing"
Phase 17's brief covers this. Open `.claude/phases/phase-17-polish-deploy.md` and follow Part C. If Lovable rejects something:
- Check that all deps in `package.json` are supported
- Check that env vars are set in Lovable's settings UI
- Check that no file references local file paths

---

## 🎯 Definition of Success

By 4 PM Sunday May 24, 2026:

✅ A live Lovable URL that:
- Loads in <5s cold on a phone
- Plays the 9-stage cinematic at `/demo` without errors
- Has a polished landing page at `/`
- Has working `/reconcile` with a real Claude call generating bilingual appeal letters
- Has at least 3-4 of the other product pages working
- Has no console errors
- Is shareable (OG preview works)

✅ A submission to the WhatsApp form with the live URL.

That's the win condition. Everything else is gravy.

---

## 🚀 Now Go

Run the master prompt. Tell CC to read the context. Then say "Run Phase 1." You're 7 hours of focused build away from one of the most ambitious solo hackathon submissions ever attempted.

Good luck.
