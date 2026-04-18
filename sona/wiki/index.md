---
title: Wiki Index
type: index
last_updated: 2026-04-17
---

# Wiki Index

> **For Claude:** This is the entry point for all context. Read this file first on every new conversation. Identify relevant pages, read them, follow [[wikilinks]] (BFS, max depth 2). Do NOT scan the codebase before checking here.

## How to navigate

1. Find relevant sections below
2. Read the linked pages
3. Check each page's `related:` frontmatter for neighbors
4. Stop at depth 2 — if you still lack context, ask the user

---

## Project

| Page | Summary |
|------|---------|
| [[entities/sonata-app]] | This project — what it is, goals, stack |

## Concepts

| Page | Summary |
|------|---------|
| [[concepts/trace-extraction]] | How `<thinking>` tags are forced and parsed |
| [[concepts/ab-comparison]] | Parallel aligned-vs-naked chat architecture |
| [[concepts/safety-evaluation]] | Sonnet evaluator with tool-use structured scoring |
| [[concepts/red-team-recommender]] | Auto Red-Team prompt generator + hardening recommender loop |

## People & Tools

| Page | Summary |
|------|---------|

## Sources

| Page | Summary |
|------|---------|

---

## Daily Notes

Daily notes live in `daily/YYYY-MM-DD.md`. They are raw — do not treat them as authoritative wiki pages. Extract insights from them into `concepts/` or `entities/` if they contain repeated patterns.

---

## Maintenance

After completing significant work, update this index:
- Add new pages to the correct table with a one-line summary
- Keep summaries ≤ 10 words
- Never remove a row — mark stale pages with `[archived]` instead
