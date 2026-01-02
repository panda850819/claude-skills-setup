---
name: prefer-pnpm
description: Use when installing packages, adding dependencies, or running package manager commands. Triggers on npm install, npm add, package installation, dependency management.
---

# Prefer pnpm

## Overview

Always use `pnpm` instead of `npm` for package management operations.

## When to Use

This skill applies when:
- Installing packages or dependencies
- Adding new packages to a project
- Running package manager commands
- Setting up a new project with dependencies

## Core Rule

| Instead of | Use |
|------------|-----|
| `npm install` | `pnpm install` |
| `npm add <pkg>` | `pnpm add <pkg>` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm run <script>` | `pnpm run <script>` or `pnpm <script>` |
| `npm init` | `pnpm init` |
| `npm ci` | `pnpm install --frozen-lockfile` |

## Quick Reference

```bash
# Install all dependencies
pnpm install

# Add a package
pnpm add express

# Add dev dependency
pnpm add -D typescript

# Run a script
pnpm dev
pnpm build

# Initialize new project
pnpm init
```

## Notes

- If a project has `package-lock.json` but no `pnpm-lock.yaml`, still use pnpm (it will create the lock file)
- pnpm is faster and more disk-efficient than npm
- pnpm uses a content-addressable store, avoiding duplicate packages
