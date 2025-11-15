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
- DI via Providers violations
- Services/Helpers boundaries
- BLE pipeline compliance
- Redux state management
- Design System usage
- Navigation and Settings module usage

## Steps

1. **Scan recent changes**
   - List open branches or pending commits requiring review
   - Skim side-by-side diffs focusing on new or modified files
   - Note files or modules with large or complex edits
2. **Assess architecture compliance**
   - Check DI via Providers (no direct service instantiation)
   - Verify Services/Helpers boundaries (helpers stateless, services own side-effects)
   - Check BLE pipeline (BLE → handlers → EventService → helpers → redux → UI)
   - Verify Redux usage (no local state for global concerns)
   - Check Design System usage (no inline styles, use tokens)
   - Verify NavigationHelper usage (no direct `useNavigation()`)
   - Check Settings module usage (no direct AsyncStorage)

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
- [ ] DI via Providers verified (no direct service instantiation)
- [ ] Services/Helpers boundaries respected
- [ ] BLE pipeline compliance verified
- [ ] Redux usage verified (no local state for global concerns)
- [ ] Design System usage verified (no inline styles)
- [ ] NavigationHelper usage verified
- [ ] Settings module usage verified (no direct AsyncStorage)
- [ ] Architecture violations listed with file:line and minimal fixes

### Code Quality
- [ ] High-risk files identified
- [ ] Debugging artifacts removed or flagged
- [ ] Style and conventions validated
- [ ] Tests/docs updates confirmed or requested
- [ ] Follow-up items recorded for deeper review
