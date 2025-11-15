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

- **@Architecture Guardian**: For architecture compliance review (DI, Services/Helpers, BLE pipeline, Redux, Design System, Navigation, Settings)
- **@QA & Test Coach**: For quality assurance review (test plans, e2e scenarios, A11y checks)

**Note**: For security-specific reviews, use the **Security Agent** instead.

## Steps

1. **Understand the change**

   - Read the PR description and related issues for context
   - Identify the scope of files and features impacted
   - Note any assumptions or questions to clarify with the author

2. **Architecture Compliance** (Use @Architecture Guardian)

   - Check DI via Providers (no direct service instantiation)
   - Verify Services/Helpers boundaries
   - Check BLE pipeline compliance
   - Verify Redux usage (no local state for global concerns)
   - Check Design System usage (no inline styles)
   - Verify NavigationHelper usage
   - Check Settings module usage (no direct AsyncStorage)

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

- [ ] DI via Providers verified (no direct service instantiation)
- [ ] Services/Helpers boundaries respected
- [ ] BLE pipeline compliance verified
- [ ] Redux usage verified (no local state for global concerns)
- [ ] Design System usage verified (no inline styles)
- [ ] NavigationHelper usage verified
- [ ] Settings module usage verified (no direct AsyncStorage)

### Functionality

- [ ] Intended behavior works and matches requirements
- [ ] Edge cases handled gracefully
- [ ] Error handling is appropriate and informative

### Code Quality

- [ ] Code structure is clear and maintainable
- [ ] No unnecessary duplication or dead code
- [ ] Tests/documentation updated as needed
- [ ] Test coverage adequate (~80% for helpers/services)
- [ ] A11y compliance verified (WCAG 2.1 AA)

### Security & Safety

- [ ] No obvious security vulnerabilities introduced
- [ ] Inputs validated and outputs sanitized
- [ ] Sensitive data handled correctly
- [ ] No hardcoded secrets or credentials

## Additional Review Notes

- Architecture and design decisions considered
- Performance bottlenecks or regressions assessed
- Coding standards and best practices followed
- Resource management, error handling, and logging reviewed
- Suggested alternatives, additional test cases, or documentation updates
  captured

Provide constructive feedback with concrete examples and actionable guidance for
the author.
