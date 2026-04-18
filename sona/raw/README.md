---
title: Raw Folder
type: index
---

# Raw Folder

Drop anything here — articles, papers, screenshots, clippings, links saved as markdown.

**This folder is immutable.** The LLM reads it but never modifies it.

After adding a file, tell Claude: "ingest sona/raw/<filename>" and it will:
1. Read the file
2. Create a summary page in `wiki/sources/<filename>.md`
3. Extract key concepts and link them to existing wiki pages
4. Update `wiki/index.md`

## Ingested files

| File | Summary page | Date |
|------|-------------|------|
