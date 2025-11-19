---
name: "Implement Sub-Ticket and Update DoD"
description: "Implement a sub-ticket using Architecture-Aware Dev agent and automatically update the Definition of Done in the planning document."
agent: "Architecture-Aware Dev"
tags: ["dev", "implementation", "planning", "workflow", "dod"]
---

# Implement Sub-Ticket and Update DoD

## Overview

This command implements a sub-ticket from a planning document using the **Architecture-Aware Dev** agent and automatically updates the Definition of Done (DoD) checklist in the corresponding planning document.

## Usage

```
@dev-agent implement {ticket}
```

**Examples:**
- `@dev-agent implement Sub-Ticket 20.2`
- `@dev-agent implement Sub-Ticket 20.3`
- `@dev-agent implement 20.1`

## Workflow

### Step 1: Parse and Locate

1. **Extract ticket number** from input:
   - Input: "Sub-Ticket 20.2" → ticket: "20.2"
   - Input: "20.2" → ticket: "20.2"
   - Input: "Sub-Ticket 20.1" → ticket: "20.1"

2. **Determine parent ticket number**:
   - Ticket "20.2" → parent: "20"
   - Ticket "20.1" → parent: "20"

3. **Find planning document**:
   - Search for: `report/planning/plan-fbc-{parentNumber}-*.md`
   - Example: `report/planning/plan-fbc-20-add-product-coloris.md`

4. **Locate sub-ticket section**:
   - Find section: `### Sub-Ticket {ticket}`
   - Read Acceptance Criteria and Definition of Done

### Step 2: Implement

1. **Read sub-ticket requirements**:
   - Review Acceptance Criteria
   - Check dependencies
   - Understand technical requirements

2. **Implement following Architecture-Aware Dev playbooks**:
   - Follow Clean Architecture principles
   - Implement all Acceptance Criteria
   - Verify Product Reference Tables compliance (if product-related): reference tables used, cascading filters implemented, validation in place
   - Run TypeScript compilation check
   - Fix linting errors
   - Run tests (if applicable)

3. **Verify implementation**:
   - All AC items completed
   - Code compiles without errors
   - No linting errors
   - Tests pass (if applicable)

### Step 3: Update DoD

**CRITICAL: Only update DoD after successful implementation verification.**

1. **Read current planning document**:
   - Find the sub-ticket section
   - Read current Acceptance Criteria checkboxes
   - Read current Definition of Done checkboxes

2. **Verify each item**:
   - For each `[ ]` in Acceptance Criteria, verify it's implemented
   - For each `[ ]` in Definition of Done, verify it's completed

3. **Update checkboxes**:
   - Change `[ ]` to `[x]` ONLY for completed items
   - Keep `[ ]` for incomplete items
   - Update both Acceptance Criteria and Definition of Done sections

4. **Save planning document**:
   - Preserve all formatting and content
   - Only update checkbox states

## Implementation Checklist

Before marking DoD as complete, verify:

- [ ] All Acceptance Criteria items are implemented
- [ ] All Definition of Done items are completed
- [ ] TypeScript compilation succeeds (no errors)
- [ ] All tests pass (if applicable)
- [ ] No linting errors
- [ ] Code follows Clean Architecture principles
- [ ] Product Reference Tables compliance verified (if product-related): reference tables used, cascading filters implemented, validation in place, product_models.type uses product_type enum, products.coloris removed, products.weight is INT4
- [ ] JSDoc documentation updated (if applicable)
- [ ] Migration files created and tested (if applicable)

## DoD Update Process

1. **Read Current Planning Document**
   - Find the sub-ticket section
   - Read current Acceptance Criteria and DoD checkboxes

2. **Verify Implementation**
   - Check each AC item against actual implementation
   - Verify each DoD item is completed

3. **Update Checkboxes**
   - Change `[ ]` to `[x]` for completed items
   - Only mark items as complete if they are actually done
   - Keep incomplete items as `[ ]` if work remains

4. **Save Planning Document**
   - Update the planning document with checked items
   - Preserve all other content and formatting

## Example Workflow

**Input:** `@dev-agent implement Sub-Ticket 20.2`

**Process:**
1. Parse: ticket = "20.2", parent = "20"
2. Find: `report/planning/plan-fbc-20-add-product-coloris.md`
3. Read: Sub-Ticket 20.2 section (database migration)
4. Implement: Create migration file `002_add_coloris_to_products.sql`
5. Verify: Migration syntax, follows conventions
6. Update DoD: Mark all completed items in planning document

## Notes

- **Ticket Format**: Accepts "Sub-Ticket X.Y", "X.Y", or "Sub-Ticket X.Y" formats
- **Planning Document**: Automatically finds the correct planning document based on parent ticket number
- **DoD Update**: Only updates checkboxes, does not modify other content
- **Verification**: Always verify implementation before updating DoD
- **Dependencies**: Check if sub-ticket dependencies are met before starting

## Error Handling

- If planning document not found: Search for `plan-fbc-{number}-*.md` files and list available options
- If sub-ticket not found: List available sub-tickets in the planning document
- If implementation fails: Do not update DoD, report errors to user
- If DoD update fails: Report error but keep implementation changes

## Related Commands

- `pm-plan-from-ticket`: Create planning document with sub-tickets
- `generate-tests`: Generate test specs before implementation
- `code-review`: Review implementation before marking DoD complete

