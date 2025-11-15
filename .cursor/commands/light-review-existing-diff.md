---
name: "Light Review Existing Diffs"
description: "Quick architecture compliance check using Architecture Guardian"
agent: "Architecture Guardian"
tags: ["review", "architecture", "compliance", "quick-check"]
---

# Light Review Existing Diffs

## Overview

Perform a quick quality pass on current diffs using the **Architecture Guardian** agent to surface risky areas, ensure polish, and flag follow-up actions for deeper review.

## Agent

**Use**: @Architecture Guardian

The Architecture Guardian performs a lightweight compliance check focusing on:

-   Clean Architecture boundaries
-   Layer separation
-   React Query + Zustand usage
-   SCSS variables usage
-   Supabase usage
-   Accessibility compliance

## Steps

1. **Scan recent changes**
    - List open branches or pending commits requiring review
    - Skim side-by-side diffs focusing on new or modified files
    - Note files or modules with large or complex edits
2. **Assess architecture compliance**

    - Check Clean Architecture boundaries (Domain → Usecases → Infrastructure → Presentation)
    - Verify layer separation (no Supabase in UI, no business logic in UI)
    - Check React Query + Zustand usage (React Query for server state, Zustand for UI state only)
    - Verify SCSS variables usage (no hardcoded values)
    - Check Supabase usage (only in infrastructure layer)
    - Verify accessibility compliance (shared/a11y/ utilities)

3. **Assess quality signals**

    - Watch for TODOs, debug code, or commented blocks needing cleanup
    - Verify naming, formatting, and imports follow project standards
    - Check that tests or documentation were updated when behavior changed

4. **Flag next actions**
    - Mark sections that warrant full review or pair programming
    - Capture questions or uncertainties to raise with the author
    - Document any quick fixes you can apply immediately
    - List architecture violations with file:line references and minimal fixes

## Review Checklist

### Architecture Compliance

-   [ ] Clean Architecture boundaries verified
-   [ ] Layer separation maintained (no Supabase in UI, no business logic in UI)
-   [ ] React Query + Zustand usage verified
-   [ ] SCSS variables usage verified (no hardcoded values)
-   [ ] Supabase usage verified (only in infrastructure layer)
-   [ ] Accessibility compliance verified (shared/a11y/ utilities)
-   [ ] Architecture violations listed with file:line and minimal fixes

### Code Quality

-   [ ] High-risk files identified
-   [ ] Debugging artifacts removed or flagged
-   [ ] Style and conventions validated
-   [ ] Tests/docs updates confirmed or requested
-   [ ] Follow-up items recorded for deeper review
