---
name: "Run All Tests and Fix Failures"
description: "Run test suite and fix failures using Unit Test Coach or Architecture-Aware Dev"
agent: "Unit Test Coach or Architecture-Aware Dev"
tags: ["tests", "jest", "fix", "quality"]
---

# Run All Tests and Fix Failures

## Overview

Execute the full test suite and systematically fix any failures using the **Unit Test Coach** (for test fixes) or **Architecture-Aware Dev** (for implementation fixes), ensuring code quality and functionality.

## Agent

**Use**:

-   @Unit Test Coach: For fixing test code issues
-   @Architecture-Aware Dev: For fixing implementation issues that cause test failures

**Test Structure**:

-   All tests in `__tests__/` directory at project root
-   Jest framework (React Testing Library for reusable UI components only)
-   Tests for domain/usecases/reusable UI components only (no page component tests)
-   TypeScript only (.test.ts or .test.tsx)

## Steps

1. **Run test suite**

    - Execute all tests: `yarn test`
    - Capture output and identify failures
    - Check unit tests (domain/usecases/reusable UI components)
    - **Note**: No page component tests (only business logic and reusable UI components)

2. **Analyze failures**

    - Categorize by type: flaky, broken, new failures
    - Determine if issue is in test code or implementation
    - Prioritize fixes based on impact
    - Check if failures are related to recent changes

3. **Fix issues systematically**
    - **Test code issues** → Use @Unit Test Coach
    - **Implementation issues** → Use @Architecture-Aware Dev
    - Start with the most critical failures
    - Fix one issue at a time
    - Re-run tests after each fix: `yarn test --testPathPattern=<test-file>`

## Test Recovery Checklist

### Execution

-   [ ] Full test suite executed (`yarn test`)
-   [ ] Failures categorized and tracked
-   [ ] Failures categorized by type (test code vs implementation)

### Fixes

-   [ ] Test code issues fixed using Unit Test Coach
-   [ ] Implementation issues fixed using Architecture-Aware Dev
-   [ ] Root causes resolved
-   [ ] Architecture compliance maintained (Clean Architecture, layer separation, etc.)

### Verification

-   [ ] Tests re-run with passing results
-   [ ] No flaky tests introduced
-   [ ] Test coverage maintained (~80% for domain/usecases)
-   [ ] Follow-up improvements noted
