# sonata-app

## Obsidian Wiki — Context Protocol

This project's knowledge base lives in `sona/wiki/`. Every new conversation MUST read the wiki before touching the codebase.

### On session start (do this first, every time)

1. Read `sona/wiki/index.md` — scan the tables, identify pages relevant to the user's request
2. Read those pages — follow their `related:` frontmatter one level deep if needed
3. Read `sona/wiki/log.md` (last 3 entries) — know what was done recently and what questions are open
4. **Only then** look at code or files the user specifically mentions

This replaces codebase scanning. The wiki is the source of truth for why things are the way they are.

### Retrieval rules

- Entry point is always `sona/wiki/index.md`
- BFS traversal: read a page, collect its `related:` links, read those (depth 2 max)
- Stop when you have enough context or have read 8 pages — then answer or ask the user
- Daily notes in `sona/daily/` are raw and informal — don't treat them as decisions
- `sona/raw/` contains immutable source material — read it when a source page links to it

### After completing significant work

Append to `sona/wiki/log.md`:
```markdown
## YYYY-MM-DD — <one-line summary>
- What changed
- Pages created or updated: [[page-name]]
- Open questions
```

Update existing wiki pages if new facts were discovered. Create new pages in:
- `sona/wiki/concepts/` — ideas, patterns, technical concepts
- `sona/wiki/entities/` — people, projects, tools, services
- `sona/wiki/sources/` — summaries of external sources ingested into `sona/raw/`

Then add the new page to the relevant table in `sona/wiki/index.md`.

### Wiki page format

Every page must have YAML frontmatter:
```yaml
---
title: Page Title
type: concept | entity | source | log | index
related:
  - ../index
  - ../concepts/related-concept
confidence: high | medium | low
last_updated: YYYY-MM-DD
sources: []
---
```

Cross-references use `[[wikilinks]]` — Obsidian resolves them. Cite sources as `[[../sources/source-name]]`.

### What NOT to do

- Do not scan `node_modules/`, build artifacts, or config files to understand context
- Do not re-derive project goals from the codebase — check `entities/sonata-app.md` first
- Do not create new wiki pages for ephemeral task details — only for durable knowledge
