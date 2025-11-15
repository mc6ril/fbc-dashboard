---
name: "Test Spec"
description: "Generate test-first specification using Unit Test Coach (TDD)"
agent: "Unit Test Coach"
tags: ["tests", "tdd", "test-first", "spec", "scaffold"]
---

# Test Spec

## Overview

Generate a test-first specification (TDD approach) for a feature using the **Unit Test Coach** agent. This creates test specs and scaffolds **BEFORE implementation** begins.

## Agent

**Use**: @Unit Test Coach

**Important**: This agent works **BEFORE implementation** (unlike QA & Test Coach which works AFTER).

**Distinction**:

-   **Unit Test Coach**: Test-first specs/scaffolds (TDD, BEFORE implementation) ← **This command**
-   **QA & Test Coach**: Test plans, e2e scenarios, A11y (AFTER implementation)

## Steps

1. **Extract Behaviors from AC**

    - Extract behaviors from acceptance criteria into Given/When/Then scenarios
    - List units to test (domain, usecases, reusable UI components)
    - **NO page component tests** - only business logic and reusable UI components

2. **Define Test Paths**

    - Domain/Usecase method → Input → Expected output
    - List edge cases and failure modes

3. **Create Unit Test Spec**

    - Files & paths (in `__tests__/` directory, mirroring source structure)
    - Test names (describe/it blocks)
    - Mocks (external dependencies: Supabase, network, time)
    - Fixtures (test data)
    - Edge cases
    - Coverage target (~80% for domain/usecases)

4. **Map AC → Tests**

    - Map each acceptance criterion to specific test scenarios
    - Ensure all ACs are covered by tests

5. **Scaffold Test Files** (optional)
    - Generate minimal test files in `__tests__/` directory
    - Use Jest imports only (describe, it, expect, jest.mock, jest.spyOn)
    - Use React Testing Library for reusable UI components only
    - Stub repositories and sample fixtures
    - Add mock setup using `jest.mock()` at top level
    - Add `jest.clearAllMocks()` in `beforeEach()`
    - Use TypeScript (.test.ts or .test.tsx)

## Test Spec Checklist

### Specification

-   [ ] Behaviors extracted from acceptance criteria
-   [ ] Units to test identified (domain/usecases/reusable UI components only)
-   [ ] Test paths defined (Input → Expected output)
-   [ ] Edge cases identified

### Test Structure

-   [ ] Files & paths defined (in `__tests__/` directory)
-   [ ] Test names defined (describe/it blocks)
-   [ ] Mocks identified (Supabase, network, time)
-   [ ] Fixtures defined (test data)
-   [ ] Coverage target set (~80% for domain/usecases)

### AC Mapping

-   [ ] Acceptance criteria mapped to test scenarios
-   [ ] All ACs covered by tests

### Scaffolding (optional)

-   [ ] Test files created in `__tests__/` directory
-   [ ] Jest imports used (React Testing Library for reusable UI components only)
-   [ ] Mocks set up using `jest.mock()`
-   [ ] `jest.clearAllMocks()` in `beforeEach()`
-   [ ] Test structure mirrors source structure
-   [ ] TypeScript used (.test.ts or .test.tsx)

## Output Format

The Unit Test Coach outputs:

```
## Unit Test Spec

### Units under test (domain/usecases/reusable UI components only)
- {Domain/Usecase}: {methods_to_test}

### Test paths (Input → Expected output)
- {method}({input}) → {expected_output}

### Files & paths (in __tests__/)
- __tests__/{area}/{name}.test.ts

### Test names (describe/it)
- describe("{Domain/Usecase}", () => {
    it("should {do something}", () => { ... });
  });

### Mocks (external dependencies)
- Supabase: jest.mock("infrastructure/supabase/productRepositorySupabase")
- Network: Mock network requests (no real API calls)
- Time: Mock timers if needed

### Fixtures (test data)
- {fixture_name}: {data_structure}

### Edge cases
- {edge_case_description}

### Coverage target
- ~80% for domain/usecases

### How to run
- `yarn test`
```

## Important Notes

-   **BEFORE implementation**: This command is used BEFORE implementation begins (TDD approach)
-   **Test specs, not test plans**: Unit Test Coach creates test specs and scaffolds, not test plans (QA & Test Coach creates test plans)
-   **Business logic and reusable UI only**: NO page component tests - only test domain, usecases, and reusable UI components
-   **Test location**: All tests must be in `__tests__/` directory at project root
-   **TypeScript only**: Use TypeScript for all test files (.test.ts or .test.tsx)
-   **Jest only**: Use Jest framework (React Testing Library for reusable UI components only)
-   **Deterministic**: All tests must be deterministic (no real timers, network, or database)
-   **Called by PM Agent**: PM Agent calls Unit Test Coach as part of the "Define Test Contract" playbook
-   **Called by Dev Agent**: Dev Agent calls Unit Test Coach as part of the "Define Test Contract" playbook

## Example Workflow

1. PM Agent or Dev Agent calls Unit Test Coach with feature description
2. Unit Test Coach extracts behaviors from AC
3. Unit Test Coach creates Unit Test Spec
4. Unit Test Coach scaffolds test files (optional)
5. Status marked as `tests: approved`
6. Implementation begins (tests are written first, then code makes them pass)
