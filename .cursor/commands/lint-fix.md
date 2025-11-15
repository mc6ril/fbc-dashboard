---
name: "Lint and Fix Code"
description: "Fix linting issues following project standards using Architecture-Aware Dev"
agent: "Architecture-Aware Dev"
tags: ["lint", "code-quality", "standards"]
---

# Lint and Fix Code

## Overview

Analyze the current file for linting issues using the **Architecture-Aware Dev** agent and automatically fix them according to the project's coding standards, then apply the fixes directly to the code and explain what changes were made.

## Agent

**Use**: @Architecture-Aware Dev

The Architecture-Aware Dev ensures linting fixes respect:
- Import order (React → third-party → internal → relative)
- TypeScript strict mode compliance
- Project-specific rules (DI, Services/Helpers, Redux, Design System, etc.)

## Steps

1. **Identify linting issues**
   - Code formatting and style consistency
   - **Import order**: React → third-party → internal → relative
   - Unused imports and variables
   - Missing semicolons or proper indentation
   - Best practice violations
   - Type safety issues (no `any` types)
   - Architecture rule violations (DI, Services/Helpers, Redux, etc.)

2. **Apply fixes**
   - Fix formatting and style issues
   - Reorganize imports according to project standards
   - Remove unused imports and variables
   - Add missing semicolons or correct indentation
   - Apply best practice corrections
   - Fix type safety issues (add explicit return types, remove `any`)
   - Fix architecture rule violations
   - Run `yarn lint:fix` to apply automatic fixes
   - Explain what changes were made

## Lint and Fix Code Checklist

### Identification
- [ ] Identified all code formatting and style issues
- [ ] Identified import order violations (React → third-party → internal → relative)
- [ ] Identified unused imports and variables
- [ ] Identified missing semicolons or indentation issues
- [ ] Identified best practice violations
- [ ] Identified type safety issues (missing return types, `any` types)
- [ ] Identified architecture rule violations

### Fixes
- [ ] Applied all formatting and style fixes
- [ ] Reorganized imports according to project standards
- [ ] Removed unused imports and variables
- [ ] Fixed indentation and added missing semicolons
- [ ] Applied best practice corrections
- [ ] Fixed type safety issues (added explicit return types, removed `any`)
- [ ] Fixed architecture rule violations
- [ ] Ran `yarn lint:fix` to apply automatic fixes
- [ ] Explained what changes were made
