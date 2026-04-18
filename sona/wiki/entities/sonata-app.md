---
title: Sonata App
type: entity
subtype: project
related:
  - ../index
confidence: low
last_updated: 2026-04-17
sources: []
---

# Sonata App

> **Status:** stub — fill this in. This is the primary project entity page.

## What it is

<!-- Describe the project in 2-3 sentences -->

## Goals

<!-- What problem does this solve? What does success look like? -->

## Stack

<!-- Languages, frameworks, services -->

## Key decisions

<!-- Architectural choices and why. Use [[wikilinks]] to concept pages for each decision. -->

## Open questions

<!-- Things that need answering before the next session -->

## Related

- [[../index|Index]]
# Sonata App: Constitutional Sandbox

## Overview
A portfolio application designed to demonstrate a deep understanding of Anthropic's core engineering values: Safety, Alignment, Interpretability, and the HHH (Helpful, Honest, Harmless) framework. This is not a standard API wrapper; it is an interactive sandbox for testing AI steerability and constitutional adherence.

## Tech Stack
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS (Minimalist, academic aesthetic)
* **AI Integration:** `@anthropic-ai/sdk`
* **Primary Model:** `claude-haiku-4-5` (low-latency, cost-effective rapid iteration). Originally spec'd as `claude-3-5-haiku-latest` but that alias was retired — switched 2026-04-17 after 404 from the API.
* **Future Evaluator Model:** `claude-sonnet-4-6` (Reserved for Phase 2 automated safety scoring). Updated from `claude-3-5-sonnet-latest` for the same reason.

## MVP Architecture
The dashboard consists of three primary, interconnected UI panels:

1. **The Constitution Editor (The Rules):** An interface for users to define system prompts, persona constraints, and ethical rules (e.g., "Refuse to write code," "Always answer skeptically").
2. **The Adversarial Gauntlet (The Test):** A chat interface explicitly designed for prompt injections, jailbreaks, and edge-case testing against the active constitution.
3. **The Trace Panel (The Interpretability Layer):** The most critical feature. The app must use prompt engineering to force Claude to output its reasoning inside `<thinking>` tags *before* answering. This panel extracts and displays that hidden reasoning to the user.

## Key Development Decisions
* **Interpretability Over Flashiness:** The extraction and display of the `<thinking>` tags take priority over complex UI animations.
* **Stateless MVP:** Avoiding complex databases or auth for Phase 1. React local state (or Context) is sufficient for live sandbox sessions.
* **Security:** `ANTHROPIC_API_KEY` is strictly managed via a local `.env.local` file and must be verified in `.gitignore`.