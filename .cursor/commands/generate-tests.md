---
name: "Generate Tests"
description: "Generate comprehensive unit tests using Unit Test Coach (TDD approach)"
agent: "Unit Test Coach"
tags: ["tests", "tdd", "unit-tests", "jest"]
---

# Generate Tests

## Overview

Generate comprehensive unit tests for provided file or function using the **Unit Test Coach** agent. This follows a test-first (TDD) approach where test specs are defined before implementation.

## Agent

**Use**: @Unit Test Coach

The Unit Test Coach generates test-first specs and scaffolds unit tests for domain/usecases and reusable UI components. This is different from QA & Test Coach which creates test plans and e2e scenarios AFTER implementation.

**Distinction**:

-   **Unit Test Coach**: Test-first specs/scaffolds (TDD, BEFORE implementation) ← **This command**
-   **QA & Test Coach**: Test plans, e2e scenarios, A11y (AFTER implementation)

## Steps

1. **Analyze Source Code**

    - Identify the file type (domain, usecase, reusable UI component)
    - Understand the functions/methods to test
    - Identify dependencies and external services
    - Note input/output types and expected behaviors

2. **Identify Test Cases**

    - **Success paths**: Normal operation with valid inputs
    - **Error paths**: Error handling, invalid inputs, exceptions
    - **Edge cases**: Boundary conditions, null/undefined values, empty arrays/objects

3. **Generate Test File**

    - Create test file in `__tests__/` directory mirroring source structure
    - Use Jest framework (React Testing Library for reusable UI components only)
    - Set up mocks for external dependencies (Supabase, network, time)
    - Use `describe()` blocks to group related tests
    - Use `it()` or `test()` for individual test cases
    - Include `beforeEach()` with `jest.clearAllMocks()`
    - Use TypeScript (.test.ts or .test.tsx)

4. **Mock Dependencies**

    - Mock repositories: `jest.mock("infrastructure/supabase/productRepositorySupabase")`
    - Mock Supabase client (no real database connections)
    - Mock network requests (no real API calls)
    - Use `jest.spyOn()` for partial mocks when needed

5. **Follow Project Patterns**
    - Use Arrange-Act-Assert pattern
    - Test business logic only (domain/usecases) or reusable UI components
    - Ensure tests are deterministic (no flaky tests)

## Generate Tests Checklist

-   [ ] Test file created in `__tests__/` directory (not in `src/`)
-   [ ] Test file uses TypeScript (.test.ts or .test.tsx)
-   [ ] Test file structure mirrors source code structure
-   [ ] Jest framework used (React Testing Library for reusable UI components only)
-   [ ] All external dependencies mocked
-   [ ] Success paths tested
-   [ ] Error paths tested
-   [ ] Edge cases tested
-   [ ] Tests follow Arrange-Act-Assert pattern
-   [ ] `beforeEach()` includes `jest.clearAllMocks()`
-   [ ] Tests are deterministic (no real timers, network, or database)

## Important Notes

-   **NO page component tests**: Only test domain, usecases, and reusable UI components
-   **Test location**: All tests must be in `__tests__/` at project root
-   **TypeScript only**: Use TypeScript for all test files
-   **Coverage**: Focus on meaningful tests that verify business logic (~80% target for domain/usecases)
-   **Deterministic**: All tests must be deterministic (no real external dependencies)
-   **Test-First Protocol**: This command generates test specs BEFORE implementation (TDD approach)
-   **Distinction from QA & Test Coach**: Unit Test Coach creates test scaffolds. QA & Test Coach creates test plans and e2e scenarios after implementation.

Generate comprehensive tests that follow project patterns and ensure code quality.
