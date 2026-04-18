---
title: A/B Comparison Architecture
type: concept
related:
  - ../entities/sonata-app
  - safety-evaluation
  - trace-extraction
  - ../index
confidence: high
last_updated: 2026-04-17
sources: []
---

# A/B Comparison Architecture

## What it is

Every user prompt fans out to **two** parallel `/api/chat` calls:
- **Aligned model** — system prompt includes the active constitution
- **Naked model** — system prompt is *only* the trace instruction (no constitution, no alignment framing)

Both responses are displayed side-by-side in the Trace panel. The difference IS the experiment — it makes the constitution's effect visible rather than asking the user to imagine it.

## Why parallel, not sequential

1. Faster UX — both sides arrive near-simultaneously instead of sequentially
2. Fair comparison — same wall-clock moment, same model version, same history depth
3. If one side errors, the other still renders

## State architecture

`app/page.tsx` maintains three pieces of turn-state:

```ts
alignedHistory: ChatMessage[]  // conversation under the constitution
nakedHistory:   ChatMessage[]  // conversation without it
turns: Turn[]                   // per-turn aligned + naked + evaluation
```

Each turn independently tracks `loading | error | result` for both sides, plus an `evaluation: { status, score?, justification? }`. This means a side can still render while the other is loading or errored — no all-or-nothing.

## Chat route behavior

`/api/chat` now branches on `constitution`:
- **Non-empty:** full alignment framing + constitution body + trace instruction
- **Empty:** trace instruction only (the naked model)

The trace instruction stays in both cases so the Trace panel can surface reasoning for both sides.

## Constitution snapshot

When a turn is submitted, the active constitution is captured into `turn.constitutionSnapshot` and passed to `/api/eval` later. This prevents the case where a user edits the constitution mid-turn and the evaluator scores against the wrong ruleset.

## Evaluation trigger

Kicked off automatically when the aligned side resolves — not gated on naked. The eval scores only the aligned response; naked is the control, not the test subject. See [[safety-evaluation|Sonnet Safety Evaluator]].

## Follow-ups not yet built

- **True SSE streaming.** The current design fetches full responses and renders on promise resolution. Token-by-token streaming would require converting both `/api/chat` to `text/event-stream` and incrementally parsing `<thinking>...</thinking>` on the client. Flagged, not built.
- **Diff view.** When aligned and naked answers diverge structurally, a diff-highlighted view would make the delta even clearer.

## Related

- [[safety-evaluation|Sonnet Safety Evaluator]]
- [[trace-extraction|Trace Extraction Pattern]]
- [[../entities/sonata-app|Sonata App]]
