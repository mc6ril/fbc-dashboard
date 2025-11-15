---
name: "Test Plan"
description: "Create comprehensive test plan using QA & Test Coach"
agent: "QA & Test Coach"
tags: ["qa", "tests", "e2e", "a11y", "test-plan"]
---

# Test Plan

## Overview

Create a comprehensive test plan for a feature using the **QA & Test Coach** agent. This includes test plans, e2e scenarios, A11y checks, and integration test strategies. This is done **AFTER implementation** is complete.

## Agent

**Use**: @QA & Test Coach

**Important**: This agent works **AFTER implementation** (unlike Unit Test Coach which works BEFORE).

**Distinction**:

-   **QA & Test Coach**: Test plans, e2e scenarios, A11y (AFTER implementation) ← **This command**
-   **Unit Test Coach**: Test-first specs/scaffolds (TDD, BEFORE implementation)

## Steps

1. **Review Implementation**

    - Review feature implementation and acceptance criteria
    - Identify test levels needed: unit (domain/usecases), integration (React Query, Zustand, Supabase), e2e (user journeys)

2. **Define Test Scenarios**

    - Happy path scenarios
    - Error cases
    - Edge cases
    - Map acceptance criteria to test scenarios

3. **Create E2E Scenarios**

    - Identify critical user journeys
    - Define e2e test scenarios in Given/When/Then format
    - List test data and fixtures needed
    - Identify test environment requirements (network, database, etc.)
    - Document expected outcomes and assertions

4. **A11y Checklist**

    - Review UI components for WCAG 2.1 AA compliance
    - Check accessibility roles, labels, hints, and live regions
    - Verify keyboard navigation and screen reader support
    - Test with high contrast mode and text scaling (200%)
    - List A11y violations with file:line references and fixes

5. **Integration Test Strategy**

    - Identify integration points: React Query → usecases → repositories → Supabase
    - Define integration test scenarios for data flow
    - Test Zustand state transitions and selector outputs
    - Verify React Query cache behavior and error handling

6. **Output Test Plan**
    - Test levels (unit, integration, e2e)
    - Test scenarios (happy path, errors, edge cases)
    - Coverage targets (~80% for domain/usecases)
    - Mapping of acceptance criteria to test scenarios
    - E2E user journeys
    - Integration test strategy
    - A11y checklist

## Test Plan Checklist

### Test Levels

-   [ ] Unit tests identified (domain/usecases)
-   [ ] Integration tests identified (React Query, Zustand, Supabase)
-   [ ] E2E tests identified (user journeys)

### Test Scenarios

-   [ ] Happy path scenarios defined
-   [ ] Error cases defined
-   [ ] Edge cases defined
-   [ ] Acceptance criteria mapped to test scenarios

### E2E Scenarios

-   [ ] Critical user journeys identified
-   [ ] E2E scenarios in Given/When/Then format
-   [ ] Test data and fixtures listed
-   [ ] Test environment requirements identified
-   [ ] Expected outcomes and assertions documented

### A11y Checklist

-   [ ] UI components reviewed for WCAG 2.1 AA compliance
-   [ ] Accessibility roles, labels, hints checked
-   [ ] Live regions for dynamic content verified
-   [ ] Keyboard navigation verified
-   [ ] Screen reader support verified
-   [ ] High contrast mode tested
-   [ ] Text scaling (200%) tested
-   [ ] A11y violations listed with file:line and fixes

### Integration Test Strategy

-   [ ] Integration points identified (React Query → usecases → repositories → Supabase)
-   [ ] Data flow test scenarios defined
-   [ ] Zustand state transitions tested
-   [ ] React Query cache behavior verified

## Output Format

The QA & Test Coach outputs:

```
## Test Plan for {feature}

### Test Levels
- Unit tests (domain/usecases): {coverage_target}
- Integration tests: {scenarios}
- E2E tests: {user_journeys}

### Test Scenarios
- Happy path: {scenarios}
- Error cases: {scenarios}
- Edge cases: {scenarios}

### Acceptance Criteria → Test Mapping
- AC1 → Test scenarios: {mapping}
- AC2 → Test scenarios: {mapping}

### E2E User Journeys
- Journey 1: {Given/When/Then}
- Journey 2: {Given/When/Then}

### Integration Test Strategy
- React Query: {scenarios}
- Zustand state: {scenarios}
- Supabase flow: {scenarios}

### A11y Checklist
- ✅/❌ Roles and labels
- ✅/❌ Keyboard navigation
- ✅/❌ Screen reader support
- ✅/❌ High contrast mode
- ✅/❌ Text scaling
```

## Important Notes

-   **After implementation**: This command is used AFTER implementation is complete
-   **Test plans, not test code**: QA & Test Coach creates test plans, not test code (Unit Test Coach creates test scaffolds)
-   **Focus on e2e, integration, A11y**: QA focuses on test plans, e2e scenarios, and A11y checks
-   **Coordinate with Unit Test Coach**: QA creates overall test strategy, Unit Test Coach creates unit test scaffolds
-   **No page component unit tests**: UI is covered at e2e level when needed
