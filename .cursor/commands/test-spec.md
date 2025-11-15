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
- **Unit Test Coach**: Test-first specs/scaffolds (TDD, BEFORE implementation) ← **This command**
- **QA & Test Coach**: Test plans, e2e scenarios, A11y (AFTER implementation)

## Steps

1. **Extract Behaviors from AC**
   - Extract behaviors from acceptance criteria into Given/When/Then scenarios
   - List units to test (helpers, services, utils, redux reducers/selectors)
   - **NO UI component tests** - only business logic

2. **Define Test Paths**
   - Helper/Service method → Input → Expected output
   - List edge cases, failure modes, and dual-pump scenarios (Left/Right)

3. **Create Unit Test Spec**
   - Files & paths (in `__tests__/` directory, mirroring source structure)
   - Test names (describe/it blocks)
   - Mocks (external dependencies: EventService, settings, BLE, network)
   - Fixtures (test data)
   - Edge cases (including dual-pump scenarios)
   - Coverage target (~80% for helpers/services)

4. **Map AC → Tests**
   - Map each acceptance criterion to specific test scenarios
   - Ensure all ACs are covered by tests

5. **Scaffold Test Files** (optional)
   - Generate minimal test files in `__tests__/` directory
   - Use Jest imports only (describe, it, expect, jest.mock, jest.spyOn)
   - Stub Providers/Services and sample fixtures
   - Add mock setup using `jest.mock()` at top level
   - Add `jest.clearAllMocks()` in `beforeEach()`

## Test Spec Checklist

### Specification
- [ ] Behaviors extracted from acceptance criteria
- [ ] Units to test identified (helpers/services/utils/redux only)
- [ ] Test paths defined (Input → Expected output)
- [ ] Edge cases identified
- [ ] Dual-pump scenarios identified (Left/Right) when applicable

### Test Structure
- [ ] Files & paths defined (in `__tests__/` directory)
- [ ] Test names defined (describe/it blocks)
- [ ] Mocks identified (EventService, settings, BLE, network)
- [ ] Fixtures defined (test data)
- [ ] Coverage target set (~80% for helpers/services)

### AC Mapping
- [ ] Acceptance criteria mapped to test scenarios
- [ ] All ACs covered by tests

### Scaffolding (optional)
- [ ] Test files created in `__tests__/` directory
- [ ] Jest imports used (no React Testing Library)
- [ ] Mocks set up using `jest.mock()`
- [ ] `jest.clearAllMocks()` in `beforeEach()`
- [ ] Test structure mirrors source structure

## Output Format

The Unit Test Coach outputs:

```
## Unit Test Spec

### Units under test (helpers/services/utils/redux only)
- {HelperOrService}: {methods_to_test}

### Test paths (Input → Expected output)
- {method}({input}) → {expected_output}

### Files & paths (in __tests__/)
- __tests__/{area}/{name}.test.js

### Test names (describe/it)
- describe("{HelperOrService}", () => {
    it("should {do something}", () => { ... });
  });

### Mocks (external dependencies)
- EventService: jest.mock("services/eventService")
- Settings: jest.mock("modules/settings")
- BLE: Mock BLE operations (no real device connections)
- Network: Mock network requests (no real API calls)

### Fixtures (test data)
- {fixture_name}: {data_structure}

### Edge cases (including dual-pump scenarios)
- {edge_case_description}
- Dual-pump: Left/Right isolation

### Coverage target
- ~80% for helpers/services

### How to run
- `sh run test` or `yarn test`
```

## Important Notes

- **BEFORE implementation**: This command is used BEFORE implementation begins (TDD approach)
- **Test specs, not test plans**: Unit Test Coach creates test specs and scaffolds, not test plans (QA & Test Coach creates test plans)
- **Business logic only**: NO UI component tests - only test helpers/services/utils/redux
- **Test location**: All tests must be in `__tests__/` directory at project root
- **Jest only**: Use Jest framework only (no React Testing Library)
- **Deterministic**: All tests must be deterministic (no real timers, network, or BLE)
- **Called by PM Agent**: PM Agent calls Unit Test Coach as part of the "Define Test Contract" playbook
- **Called by Dev Agent**: Dev Agent calls Unit Test Coach as part of the "Define Test Contract" playbook

## Example Workflow

1. PM Agent or Dev Agent calls Unit Test Coach with feature description
2. Unit Test Coach extracts behaviors from AC
3. Unit Test Coach creates Unit Test Spec
4. Unit Test Coach scaffolds test files (optional)
5. Status marked as `tests: approved`
6. Implementation begins (tests are written first, then code makes them pass)

