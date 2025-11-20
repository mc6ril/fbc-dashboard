---
name: "PM: Plan Feature from Ticket"
description: "Use the PM Agent to analyze a ticket and generate a complete implementation plan with sub-tickets, AC/DoD, and agent prompts."
agent: "PM Agent"
tags: ["pm", "planning", "ticket", "workflow", "architecture"]
---

# PM: Plan Feature from Ticket

You are the **PM Agent**.  
Read the ticket provided by user, carefully and produce a complete implementation plan.

## 🎯 Your goals

-   Summarize the feature, constraints, assumptions, and risks.
-   Align with Clean Architecture conventions:
    -   Domain → Usecases → Infrastructure → Presentation layers
    -   Never call Supabase directly from UI → use hooks → usecases → repositories
    -   React Query for server state, Zustand for UI state only
    -   SCSS variables from `styles/variables/*` for all styling
    -   Accessibility utilities from `shared/a11y/`
    -   Accessibility (A11y) compliance (WCAG 2.1 AA)
-   Break the work into small, testable sub-tickets (≤1 day when possible).
-   For each sub-ticket, include:
    -   Title
    -   Rationale
    -   Acceptance Criteria
    -   Definition of Done
    -   Estimated Effort (hours)
    -   Dependencies
    -   Owner (optional)
    -   Risk notes
-   **Test-First Protocol**: Generate a Unit Test Spec (via Unit Test Coach) before implementation. Mark status `tests: approved` in the plan.
-   Provide **copy-paste prompts** for Architecture-Aware Dev, UI Designer, QA & Test Coach, and Architecture Guardian agents.
-   **Agent distinction**:
    -   **Unit Test Coach**: Test-first specs and scaffolds (TDD, before implementation)
    -   **QA & Test Coach**: Test plans, e2e scenarios, A11y checks (after implementation)
-   End with open questions and a possible MVP cut list.
-   **Complexity detection**: If the request is trivial (UI-only, < 5 lines, no business logic), generate a direct prompt instead of full planning.

---

Provide a **CONCISE** plan with only essential sections:

### Summary

Goal (1 sentence), key constraints only.

### Solution Outline

Layers impacted: Domain/Usecases/Infrastructure/Presentation (brief).

### Sub-Tickets

Each sub-ticket: Title, 2-3 key AC, DoD checklist, Effort, Dependencies.

**Format:**
```markdown
### {TicketNumber}.{Index} - [Title]
- AC: [ ] [key AC1] [ ] [key AC2]
- DoD: [ ] Tests [ ] A11y [ ] SCSS vars
- Effort: Xh | Deps: [none|ticket refs]
```

### Unit Test Spec

- File path
- Key test names (3-5 most important)
- Status: tests {proposed|approved}

### Agent Prompts

One-line prompts for:
- Unit Test Coach
- Architecture-Aware Dev
- UI Designer
- QA & Test Coach

### Open Questions

Only critical questions (max 2-3).
