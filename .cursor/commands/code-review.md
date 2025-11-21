---
name: "Code Review"
description: "Comprehensive code review using Architecture Guardian and QA & Test Coach"
agent: "Architecture Guardian or QA & Test Coach"
tags: ["review", "quality", "architecture", "security"]
---

# Code Review

## Overview

Perform a thorough code review that verifies functionality, maintainability, and security before approving a change. Use the appropriate agent based on review focus.

## Agent

**Use**:

-   **@Architecture Guardian**: For architecture compliance review (Clean Architecture, layer separation, React Query + Zustand, SCSS variables, Supabase usage, A11y)
-   **@QA & Test Coach**: For quality assurance review (test plans, e2e scenarios, A11y checks)

**Note**: For security-specific reviews, use the **Security Agent** instead.

## Steps

1. **Understand the change**

    - Read the PR description and related issues for context
    - Identify the scope of files and features impacted
    - Note any assumptions or questions to clarify with the author

2. **Architecture Compliance** (Use @Architecture Guardian)

    - Check Clean Architecture boundaries (Domain → Usecases → Infrastructure → Presentation)
    - Verify layer separation (no Supabase in UI, no business logic in UI)
    - Check React Query + Zustand usage (React Query for server state, Zustand for UI state only)
    - Verify SCSS variables usage (no hardcoded values)
    - Check Supabase usage (only in infrastructure layer)
    - Verify accessibility compliance (shared/a11y/ utilities)
    - **Verify Product Reference Tables compliance**: reference tables (product_models, product_coloris) used, cascading filters (type → model → coloris) implemented, no free-text name/coloris fields, validation of model/coloris combinations. Schema: product_models.type uses product_type enum (not TEXT), products.coloris removed (use coloris_id FK only), products.weight is INT4 (integer grams, not NUMERIC)

3. **Validate functionality**

    - Confirm the code delivers the intended behavior
    - Exercise edge cases or guard conditions mentally or by running locally
    - Check error handling paths and logging for clarity

4. **Assess quality** (Use @QA & Test Coach)

    - Ensure functions are focused, names are descriptive, and code is readable
    - Watch for duplication, dead code, or missing tests
    - Verify documentation and comments reflect the latest changes
    - Check test coverage and test plans
    - Verify A11y compliance (WCAG 2.1 AA)

5. **Review security and risk** (Use @Security Agent for deep security review)
    - Look for injection points, insecure defaults, or missing validation
    - Confirm secrets or credentials are not exposed
    - Evaluate performance or scalability impacts of the change

## Review Checklist

### Architecture Compliance

-   [ ] Clean Architecture boundaries verified
-   [ ] Layer separation respected (no Supabase in UI, no business logic in UI)
-   [ ] React Query + Zustand usage verified
-   [ ] SCSS variables usage verified (no hardcoded values)
-   [ ] Supabase usage verified (only in infrastructure layer)
-   [ ] Accessibility compliance verified (shared/a11y/ utilities)
-   [ ] **Product Reference Tables compliance verified**: reference tables (product_models, product_coloris) used, cascading filters implemented, no free-text name/coloris fields, validation of model/coloris combinations, product_models.type uses product_type enum, products.coloris removed, products.weight is INT4

### Functionality

-   [ ] Intended behavior works and matches requirements
-   [ ] Edge cases handled gracefully
-   [ ] Error handling is appropriate and informative

### Code Quality

-   [ ] Code structure is clear and maintainable
-   [ ] No unnecessary duplication or dead code
-   [ ] Tests/documentation updated as needed
-   [ ] Test coverage adequate (~80% for domain/usecases)
-   [ ] A11y compliance verified (WCAG 2.1 AA)

### Security & Safety

-   [ ] No obvious security vulnerabilities introduced
-   [ ] Inputs validated and outputs sanitized
-   [ ] Sensitive data handled correctly
-   [ ] No hardcoded secrets or credentials

## Additional Review Notes

-   Architecture and design decisions considered
-   Performance bottlenecks or regressions assessed
-   Coding standards and best practices followed
-   Resource management, error handling, and logging reviewed
-   Suggested alternatives, additional test cases, or documentation updates captured

Provide constructive feedback with concrete examples and actionable guidance for the author.

## Output Format

Both agents use a standardized template:

```
# Code Review Report

**Description:** Brief 1-2 sentence summary of the review scope and findings.

**Status:** ✅ OK for merge | ⚠️ Refused | 🔴 Blocked

## Alerts

{ONLY_LIST_ALERTS_IF_ISSUES_FOUND}

### 🔴 High Risk
- `file:line` - **Issue:** {description} - **Recommendation:** {fix_or_action}

### ⚠️ Medium Risk
- `file:line` - **Issue:** {description} - **Recommendation:** {fix_or_action}

### ℹ️ Low Risk
- `file:line` - **Issue:** {description} - **Recommendation:** {fix_or_action}

{IF_NO_ISSUES:}
No issue detected. Code is ready for merge.
```

**Important:** Alerts are only listed if issues are found. If the code is clean, the report will clearly state that no issues were detected.
