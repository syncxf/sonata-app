---
title: Trace Extraction Pattern
type: concept
related:
  - ../entities/sonata-app
  - ../index
confidence: high
last_updated: 2026-04-17
sources: []
---

# Trace Extraction Pattern

## What it is

The interpretability mechanism at the heart of Sonata. Every model turn is forced to wrap its reasoning in `<thinking>...</thinking>` tags via the system prompt. The API route then splits the response on `</thinking>` — the tagged block goes to the Trace Panel, the remaining prose is the user-facing answer.

## Why it matters

This is the critical feature per [[../entities/sonata-app|sonata-app]]. Without it, the Adversarial Gauntlet is just another chat UI. With it, you can see *why* the model complied or refused — the tension between the active [[constitution|constitution]] and the user request becomes legible.

## Implementation

- System prompt composed of: `{constitution}\n\n{TRACE_INSTRUCTION}`
- `TRACE_INSTRUCTION` lives in `app/api/chat/route.ts`
- Regex: `/<thinking>([\s\S]*?)<\/thinking>([\s\S]*)/`
- If the model does NOT emit the block, `thinking` is empty and the Trace Panel shows a yellow "model ignored the instruction" notice — this is itself a data point about steerability

## Tradeoffs

- **Prompt-engineered, not native.** Claude 4.x has a native `thinking` API parameter that is cleaner and not bypassable by adversarial prompts. We chose prompt-engineering because the spec pins `claude-3-5-haiku-latest`. Revisit when upgrading the model.
- **Trust the tags.** The reasoning inside `<thinking>` is whatever the model chose to emit — it is not guaranteed to reflect the true internal computation. Treat traces as plausible rationalizations, not ground truth.

## Related

- [[../entities/sonata-app|Sonata App]]
- [[../index|Index]]
