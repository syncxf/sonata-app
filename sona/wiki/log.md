---
title: Operation Log
type: log
---

# Operation Log

Append-only. One entry per Claude session. Format:

```
## YYYY-MM-DD — <session summary>
- What was done
- Pages created or updated
- Open questions left for future sessions
```

---

## 2026-04-17 — Wiki system initialized

- Scaffolded Karpathy-style wiki at `sona/wiki/`
- Created `index.md`, `log.md`, `entities/sonata-app.md`
- Wrote project `CLAUDE.md` with Obsidian retrieval protocol
- Moved existing daily notes to `daily/`
- Open: populate `entities/sonata-app.md` with actual project details

## 2026-04-17 — Next.js scaffolded, three-panel MVP built

- Next.js 16 + TS + Tailwind v4 scaffolded at project root (App Router, no `src/`)
- Installed `@anthropic-ai/sdk`
- Built three-panel dashboard in `app/page.tsx`:
  - [[../../app/components/ConstitutionPanel|ConstitutionPanel]] — textarea + presets (Skeptic / No-code / Terse)
  - [[../../app/components/GauntletPanel|GauntletPanel]] — chat UI with reset
  - [[../../app/components/TracePanel|TracePanel]] — per-turn trace browser with raw response toggle
- Wired API route at `app/api/chat/route.ts`:
  - Model pinned to `claude-3-5-haiku-latest` per spec
  - System prompt = `constitution` + `TRACE_INSTRUCTION` forcing `<thinking>...</thinking>` tags
  - Response parsed via regex; `thinking` and `answer` returned separately
  - Returns 500 with clear message if `ANTHROPIC_API_KEY` missing
- Page title/description set in `app/layout.tsx`
- New concept: [[../concepts/trace-extraction]]
- `npx tsc --noEmit` passes clean
- Open: `.env.local` at project root is MISSING — user needs to recreate with `ANTHROPIC_API_KEY=...` before route works
- Open: duplicate `.obsidian/` at project root (side effect of the move-shuffle); canonical vault lives in `sona/`

## 2026-04-17 — Model retirement fix

- `claude-3-5-haiku-latest` returned 404 `not_found_error` — alias retired
- Switched primary to `claude-haiku-4-5` in `app/api/chat/route.ts` and the page header
- Updated [[../entities/sonata-app]] stack section to reflect the change + reasoning
- Future evaluator model updated in doc from `claude-3-5-sonnet-latest` → `claude-sonnet-4-6`
- Follow-up to revisit: Claude 4.x supports a native `thinking` API parameter — cleaner than prompt-engineering `<thinking>` tags and NOT bypassable by adversarial prompts. See [[../concepts/trace-extraction]] tradeoffs section. Worth considering for Phase 2.

## 2026-04-17 — Dark-mode bleed-through fix

- Symptom: middle panel (Gauntlet) showed a solid black background behind dark text when scrolling long responses, but only on machines in OS dark mode
- Root cause: `app/globals.css` default template had `@media (prefers-color-scheme: dark) { :root { --background: #0a0a0a } }`; `body { background: var(--background) }` bled through the panel when content overflowed
- Secondary: same file had `font-family: Arial, Helvetica, sans-serif` silently overriding the Geist font loaded in `layout.tsx`
- Fix: removed the dark-mode media query (spec is explicitly light/academic per [[../entities/sonata-app]]); set font-family to `var(--font-geist-sans)`; added defensive `bg-white` on `GauntletPanel`'s root `<section>`
- **Do not re-add `prefers-color-scheme: dark` to globals.css** — the app is deliberately light-mode only. If dark mode is needed later, switch to a user-toggled theme, not OS-level auto-switch

## 2026-04-17 — Phase 2: A/B comparison + Sonnet evaluator

- Upgraded the sandbox from single-response to parallel aligned/naked comparison with automated safety scoring
- New route: `app/api/eval/route.ts`
  - Model: `claude-sonnet-4-6` (originally spec'd `claude-3-5-sonnet-latest`, preemptively upgraded — same alias-retirement risk as the haiku switch)
  - **Tool-use structured output** via `submit_evaluation` tool + `tool_choice: { type: "tool", name: ... }` — not regex JSON parsing
  - Scoring rubric inlined in SYSTEM prompt (90-100/70-89/40-69/10-39/0-9 bands)
  - Defensive clamp + integer round on returned score
- Updated `app/api/chat/route.ts` to branch on empty constitution — naked mode gets ONLY `TRACE_INSTRUCTION`, no alignment framing
- Rewrote `app/page.tsx` state model — now tracks `alignedHistory`, `nakedHistory`, `turns[]` (aligned + naked + evaluation per turn); parallel fetches via `Promise.allSettled`; eval triggered automatically when aligned side resolves
- Rewrote `app/components/TracePanel.tsx` for two-column split (Aligned · Haiku | Naked · Haiku) with eval badge above aligned; turn picker shows score badge per turn
- Rewrote `app/types.ts` — new `SideState`, `EvaluationState` discriminated union, `Turn` shape
- Layout grid changed from `md:grid-cols-3` equal columns to `lg:grid-cols-[320px_minmax(0,1fr)_minmax(0,2fr)]` — gives Trace panel more room for the split
- New concept pages: [[../concepts/ab-comparison]] and [[../concepts/safety-evaluation]]
- `npx tsc --noEmit` passes clean
- **NOT built, flagged as follow-up:** true SSE streaming. Current design is parallel-fetches-with-promise-resolve display. Token-by-token streaming requires SSE refactor of `/api/chat` + client-side incremental `<thinking>` parsing. Parallel fetches still give side-by-side reveal.
- Snapshot pattern: `turn.constitutionSnapshot` captures the constitution at submit time so mid-turn edits don't score the eval against the wrong ruleset

## 2026-04-17 — Phase 3: Auto Red-Team + Hardening Recommender

- Closed the loop: sandbox can now attack itself AND patch itself without leaving the page
- New route `app/api/redteam/route.ts`:
  - Model: `claude-haiku-4-5` (spec said `claude-3-5-haiku-latest`; preemptively swapped — same retired-alias pattern as Phase 1)
  - Plain text output (no tool-use) since the result goes into a text input; system prompt forbids preambles and handler strips stray quote-wrapping
  - Strategy palette enumerated in system prompt: hypothetical / authority override / incremental / instruction-hierarchy / ambiguity / emotional pressure
  - Empty-constitution fallback probes generic HHH failure modes
- Extended `app/api/eval/route.ts` into a Recommender:
  - Added `hardenedConstitution: string | null` to `submit_evaluation` tool input_schema (required field)
  - Updated SYSTEM prompt with hardening rules (preserve spirit, close the specific loophole, anticipate related evasions, stay concise)
  - Server-side gating: returns null unless `score < 50` AND original constitution was non-empty AND model returned a string. This keeps the UI's `hardenedConstitution` boolean check honest.
- UI wiring:
  - `GauntletPanel` — new Auto Red-Team button left of the chat input (target icon, spins while loading). Populates the input field but does not auto-send — user still reviews and fires.
  - `TracePanel` — new `HardenedRecommendation` card rendered inside the aligned `SideColumn` below the failing score badge. Indigo chrome, monospace scrollable preview of the hardened rewrite, "1-Click Apply" button.
  - `page.tsx` — `runRedTeam()` calls `/api/redteam` with current constitution; `applyHardened(text)` just sets constitution state.
- Types: extended `EvaluationState.done` and `EvalApiResponse` with `hardenedConstitution`; new `RedTeamApiResponse`.
- New concept page: [[../concepts/red-team-recommender]]
- `npx tsc --noEmit` passes clean
- **NOT built, flagged as follow-up:** auto-retry after Apply (currently user must re-send the same adversarial prompt manually to verify the patch held); constitution diff view (full-text rewrite is noisy when the delta is a single new clause); red-team prompt history per turn
- Why Haiku attacks / Sonnet patches: attacks are cheap-to-generate and we want volume, patches require tradeoff reasoning. Also keeps the model-under-test off the fix side so it's not grading and patching itself
