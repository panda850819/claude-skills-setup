---
description: "Run AI code review with Gemini + Codex on current project"
---

Run the AI code review script to get feedback from both Gemini (gemini-3-pro) and Codex (GPT-5.2-Codex).

This reviews all uncommitted changes in the current git repository.

Execute this command:
```bash
~/.claude/scripts/ai-review.sh
```

After the script completes, read and display the review results from:
- `gemini-reviews/latest-review.md` - Gemini's review
- `codex-reviews/latest-review.md` - Codex's review

Present both reviews to the user in a clear format, highlighting any overlapping concerns from both reviewers.
