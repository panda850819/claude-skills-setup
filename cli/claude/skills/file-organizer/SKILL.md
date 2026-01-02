---
name: file-organizer
description: Intelligently organizes your files and folders across your computer by understanding context, finding duplicates, suggesting better structures, and automating cleanup tasks. Reduces cognitive load and keeps your digital workspace tidy without manual effort.
---

# File Organizer

This skill acts as your personal organization assistant, helping you maintain a clean, logical file structure across your computer without the mental overhead of constant manual organization.

## When to Use This Skill

- Your Downloads folder is a chaotic mess
- You can't find files because they're scattered everywhere
- You have duplicate files taking up space
- Your folder structure doesn't make sense anymore
- You want to establish better organization habits
- You're starting a new project and need a good structure
- You're cleaning up before archiving old projects

## What This Skill Does

1. **Analyzes Current Structure**: Reviews your folders and files to understand what you have
2. **Finds Duplicates**: Identifies duplicate files across your system
3. **Suggests Organization**: Proposes logical folder structures based on your content
4. **Automates Cleanup**: Moves, renames, and organizes files with your approval
5. **Maintains Context**: Makes smart decisions based on file types, dates, and content
6. **Reduces Clutter**: Identifies old files you probably don't need anymore

## How to Use

```bash
cd ~
```

Then ask:
- "Help me organize my Downloads folder"
- "Find duplicate files in my Documents folder"
- "Review my project directories and suggest improvements"

## Instructions

When a user requests file organization help:

1. **Understand the Scope**
   - Which directory needs organization?
   - What's the main problem?
   - Any files or folders to avoid?
   - How aggressively to organize?

2. **Analyze Current State**
   ```bash
   ls -la [target_directory]
   find [target_directory] -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn
   du -sh [target_directory]/* | sort -rh | head -20
   ```

3. **Identify Organization Patterns**

   **By Type**: Documents, Images, Videos, Archives, Code, Spreadsheets
   **By Purpose**: Work vs. Personal, Active vs. Archive
   **By Date**: Current, Previous years, Very old

4. **Find Duplicates**
   ```bash
   find [directory] -type f -exec md5 {} \; | sort | uniq -d
   ```

5. **Propose Organization Plan**
   Present clear plan before making changes with proposed structure and changes.

6. **Execute Organization**
   - Always confirm before deleting
   - Log all moves for potential undo
   - Handle filename conflicts gracefully

7. **Provide Summary and Maintenance Tips**

## Example Structure

```
Downloads/
├── Work/
│   ├── Projects/
│   ├── Documents/
│   └── Archive/
├── Personal/
│   ├── Photos/
│   ├── Documents/
│   └── Media/
└── ToSort/
```

## Best Practices

### Folder Naming
- Use clear, descriptive names
- Avoid spaces (use hyphens)
- Use prefixes for ordering: "01-current", "02-archive"

### File Naming
- Include dates: "2024-10-17-meeting-notes.md"
- Be descriptive
- Remove download artifacts: "doc-final-v2 (1).pdf" → "doc.pdf"

### When to Archive
- Projects not touched in 6+ months
- Completed work that might be referenced
- Files you're hesitant to delete
