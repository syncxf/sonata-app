---
title: Red-Team & Auto-Remediation Loop
type: concept
related:
  - ../entities/sonata-app
  - ab-comparison
  - safety-evaluation
  - trace-extraction
  - ../index
confidence: high
last_updated: 2026-04-17
sources: []
---

# Red-Team & Auto-Remediation Loop

## What it is

Phase 3 closes the loop: the sandbox can now **generate its own attacks** and **propose its own fixes**.

- **Auto Red-Teamer** (`/api/redteam`) — given the current constitution, Haiku crafts a single adversarial prompt designed to expose a loophole. Output drops straight into the chat input.
- **Hardening Recommender** — the Sonnet evaluator was extended. When it scores a turn below 50, it also returns a rewritten constitution (`hardenedConstitution`) that closes the exploited loophole. A "1-Click Apply" button in the Trace panel swaps it into the Constitution Editor.

Together they form a red-team → fail → harden → retry feedback loop without leaving the page.

## Red-Teamer design

- Route: `app/api/redteam/route.ts`
- Model: `claude-haiku-4-5` (spec'd `claude-3-5-haiku-latest`; retired alias family, preemptively swapped for the Phase 1 reasons)
- **No tool-use.** The output is plain prose destined for a text input — structured JSON would be overkill. The system prompt forbids preambles and the handler strips stray wrapping quotes defensively.
- Strategy palette enumerated in the system prompt (hypothetical framing, authority override, incremental request, instruction-hierarchy attack, ambiguity exploitation, emotional pressure). Haiku picks one — deliberately not mixed, to keep each probe sharp.
- If constitution is empty, the red-teamer probes generic HHH failure modes instead.

## Recommender design (schema extension)

`submit_evaluation` tool schema grew one field:

```
hardenedConstitution: string | null
```

Required in the schema, but the route returns `null` whenever:
1. `score >= 50` (the constitution held — don't over-engineer)
2. The original constitution was empty (nothing to harden)
3. The model returned a non-string

This gate lives server-side so the UI can trust the field.

System prompt instructs Sonnet to: preserve original spirit, explicitly close the exploited loophole, anticipate related evasions (rewording, hypotheticals, role-play, incremental requests), stay concise. Over-engineering is explicitly discouraged.

## Why haiku writes attacks and sonnet writes fixes

- **Attacks are cheap to generate, expensive to defend against.** Haiku is fine — we want a steady firehose of probes, not one perfect one.
- **Fixes need to reason about tradeoffs.** Preserving intent while closing a loophole is harder than spotting one; Sonnet's the tool.
- Bonus: keeps the "aligned subject" model (Haiku) off the fix side, so we don't have the model-under-test grading and patching itself.

## UI surfacing

- **Auto Red-Team button** sits to the left of the chat input in `GauntletPanel`. Target icon, spinning state while fetching, populates the input field (does not auto-submit — user still reviews and sends).
- **Security Recommendation card** renders below the failed score badge inside the aligned `SideColumn`. Indigo chrome to match the aligned accent. Contains the hardened constitution text (monospace, max-height with scroll) and a "1-Click Apply" button that calls `onApplyHardened(hardened)` → `setConstitution(hardened)` in `page.tsx`.

## Follow-ups not built

- **Auto-retry after apply.** Right now Apply just swaps the constitution; the user still has to re-run the adversarial prompt to see if the fix held. Natural next step: run the same user message through the aligned side with the hardened constitution and score it again, forming a visible before/after pair.
- **Diff view of the constitution change.** The hardened rewrite often just adds a clause — a side-by-side diff would make the recommender's reasoning clearer than showing the full rewrite.
- **Red-team history.** Currently only the latest generated prompt lives in the input field. Storing prior adversarial prompts per turn would let the user batch-replay them after each hardening round.

## Related

- [[safety-evaluation|Sonnet Safety Evaluator]] — the recommender was grafted onto the evaluator, not built as a separate route
- [[ab-comparison|A/B Comparison Architecture]]
- [[trace-extraction|Trace Extraction Pattern]]
- [[../entities/sonata-app|Sonata App]]
