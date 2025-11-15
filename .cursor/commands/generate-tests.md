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

The Unit Test Coach generates test-first specs and scaffolds unit tests for helpers/services/utils/redux. This is different from QA & Test Coach which creates test plans and e2e scenarios AFTER implementation.

**Distinction**:

- **Unit Test Coach**: Test-first specs/scaffolds (TDD, BEFORE implementation) ← **This command**
- **QA & Test Coach**: Test plans, e2e scenarios, A11y (AFTER implementation)

## Steps

1. **Analyze Source Code**

   - Identify the file type (helper, service, util, redux reducer/selector)
   - Understand the functions/methods to test
   - Identify dependencies and external services
   - Note input/output types and expected behaviors

2. **Identify Test Cases**

   - **Success paths**: Normal operation with valid inputs
   - **Error paths**: Error handling, invalid inputs, exceptions
   - **Edge cases**: Boundary conditions, null/undefined values, empty arrays/objects
   - **Dual-pump scenarios**: Left/Right pump handling when applicable

3. **Generate Test File**

   - Create test file in `__tests__/` directory mirroring source structure
   - Use Jest framework only (no React Testing Library)
   - Set up mocks for external dependencies (EventService, settings, BLE, network)
   - Use `describe()` blocks to group related tests
   - Use `it()` or `test()` for individual test cases
   - Include `beforeEach()` with `jest.clearAllMocks()`

4. **Mock Dependencies**

   - Mock external services: `jest.mock("services/eventService")`
   - Mock modules: `jest.mock("modules/settings")`
   - Mock BLE operations (no real device connections)
   - Mock network requests (no real API calls)
   - Use `jest.spyOn()` for partial mocks when needed

5. **Follow Project Patterns**
   - Use Arrange-Act-Assert pattern
   - Test business logic only (no UI component tests)
   - Ensure tests are deterministic (no flaky tests)

## Generate Tests Checklist

- [ ] Test file created in `__tests__/` directory (not in `src/`)
- [ ] Test file structure mirrors source code structure
- [ ] Jest framework used (no React Testing Library)
- [ ] All external dependencies mocked
- [ ] Success paths tested
- [ ] Error paths tested
- [ ] Edge cases tested
- [ ] Dual-pump scenarios tested (when applicable)
- [ ] Tests follow Arrange-Act-Assert pattern
- [ ] `beforeEach()` includes `jest.clearAllMocks()`
- [ ] Tests are deterministic (no real timers, network, or BLE)

## Important Notes

- **NO UI component tests**: Only test helpers, services, utils, and redux
- **Test location**: All tests must be in `__tests__/` at project root
- **Mock location**: Use centralized mocks from `__mocks__/` when available
- **Coverage**: Focus on meaningful tests that verify business logic (~80% target for helpers/services)
- **Deterministic**: All tests must be deterministic (no real external dependencies)
- **Test-First Protocol**: This command generates test specs BEFORE implementation (TDD approach)
- **Distinction from QA & Test Coach**: Unit Test Coach creates test scaffolds. QA & Test Coach creates test plans and e2e scenarios after implementation.

Generate comprehensive tests that follow project patterns and ensure code quality.
