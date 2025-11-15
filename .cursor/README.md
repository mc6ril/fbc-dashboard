# 📁 .cursor Directory — Cursor AI Configuration

This directory contains all configuration for Cursor AI to ensure code consistency according to **fbc-dashboard** project rules.

---

## 📋 Structure

```
.cursor/
├── agents/          # Specialized agents for different tasks
├── commands/        # Reusable commands (slash commands)
├── docs/            # Reference documentation (architecture, conventions, etc.)
├── prompts/         # Reusable prompts to guide the AI
├── rules/           # Strict rules applied automatically
├── settings.json    # Cursor configuration (references the rules)
└── README.md        # This file
```

---

## 🎯 Agents (`agents/`)

Agents are specialized assistants for different tasks. Each agent has a specific role and structured playbooks.

### Agent List

| Agent                      | Role                                     | When to use                |
| -------------------------- | ---------------------------------------- | -------------------------- |
| **Architecture-Aware Dev** | Development following Clean Architecture | Implement features         |
| **Architecture Guardian**  | Architecture compliance verification     | Code reviews, plans        |
| **Unit Test Coach**        | Unit test generation (TDD)               | Before implementation      |
| **QA & Test Coach**        | Test plans, e2e scenarios, A11y          | After implementation       |
| **PM Agent**               | Ticket planning                          | Create implementation plan |
| **UI Designer**            | UI component creation from designs       | Integrate Figma mockups    |
| **Security Agent**         | Security audit and review                | Security verification      |
| **Jira Ticket Generator**  | Jira ticket generation                   | Create structured tickets  |

### Usage

To use an agent, reference it in a prompt or use a command that employs it:

```markdown
@Architecture-Aware Dev implement feature X
```

---

## ⚡ Commands (`commands/`)

Commands are shortcuts (slash commands) for repetitive tasks.

### Main Commands List

| Command                | Agent                  | Description                                         |
| ---------------------- | ---------------------- | --------------------------------------------------- |
| `/pm-plan-from-ticket` | PM Agent               | Generates implementation plan from a ticket         |
| `/generate-tests`      | Unit Test Coach        | Generates unit tests (TDD)                          |
| `/code-review`         | Architecture Guardian  | Complete code review                                |
| `/architecture-review` | Architecture Guardian  | Architecture compliance verification                |
| `/ui-from-design`      | UI Designer            | Creates UI components from a mockup                 |
| `/security-audit`      | Security Agent         | Automated security audit                            |
| `/refactor-code`       | Architecture-Aware Dev | Refactoring following rules                         |
| `/git-commit-push`     | Architecture-Aware Dev | Commit and push changes with auto-generated message |

### Usage

In Cursor, use the `/` prefix followed by the command name:

```
/pm-plan-from-ticket
```

---

## 📝 Prompts (`prompts/`)

Prompts are reusable templates to guide the AI.

### Prompt List

| Prompt                          | Description                            |
| ------------------------------- | -------------------------------------- |
| `apply-project-rules.mdc`       | Verify compliance with project rules   |
| `ask-before-coding.mdc`         | Discuss approach before implementation |
| `explain-this-ticket.mdc`       | Analyze a ticket in detail             |
| `explain-file.mdc`              | Explain a file's role                  |
| `fix-bug.mdc`                   | Guide to fix a simple bug              |
| `review-pr.mdc`                 | Pull Request review                    |
| `speak-as-senior-architect.mdc` | High-level architectural guidance      |
| `ui-component-from-design.mdc`  | Create a UI component from a design    |

### Usage

Reference a prompt in your message to the AI:

```markdown
@explain-this-ticket.mdc [ticket content]
```

---

## 📐 Rules (`rules/`)

Rules are strict rules automatically applied by Cursor. They are referenced in `.cursor/settings.json`.

### Active Rules

| Rule                           | Domain        | Description                                            |
| ------------------------------ | ------------- | ------------------------------------------------------ |
| `clean_architecture.mdc`       | Architecture  | Strict Clean Architecture with layer separation        |
| `code-convention.mdc`          | Quality       | Code conventions (TypeScript, SCSS, React)             |
| `contextual-comments.mdc`      | Documentation | Complete documentation with business context           |
| `performance-optimization.mdc` | Performance   | React/Next.js optimizations                            |
| `testing-patterns.mdc`         | Testing       | Unit test patterns (Jest)                              |
| `accessibility.mdc`            | UI            | WCAG 2.1 AA accessibility                              |
| `component-structure.mdc`      | UI            | UI component structure                                 |
| `generated-files.mdc`          | Workflow      | Automatic file management for Jira tickets and reports |

### Adding a New Rule

1. Create the file in `rules/` with the appropriate subdirectory
2. Add YAML frontmatter with `alwaysApply: true`
3. Reference the file in `.cursor/settings.json`

Example:

```yaml
---
alwaysApply: true
name: "Rule Name"
description: "Short description"
---
```

---

## 📚 Documentation (`docs/`)

Reference documentation to understand the project.

| Document             | Content                               |
| -------------------- | ------------------------------------- |
| `architecture.md`    | Clean Architecture, project structure |
| `code-convention.md` | Detailed code conventions             |
| `testing.md`         | Testing guide with examples           |
| `libraries.md`       | Documentation of used libraries       |

---

## ⚙️ Configuration (`settings.json`)

This file references all rules that should be automatically applied.

**Do not modify manually** except to add a new rule.

---

## 🔄 Recommended Workflow

### 1. Create a Feature

1. **Analyze the ticket**: `@explain-this-ticket.mdc`
2. **Generate the plan**: `/pm-plan-from-ticket`
3. **Define tests**: `/generate-tests` (TDD)
4. **Implement**: `@Architecture-Aware Dev`
5. **Verify**: `/architecture-review`

### 2. Fix a Bug

1. **Analyze**: `@explain-file.mdc` (affected file)
2. **Fix**: `@fix-bug.mdc` or `/debug-issue`
3. **Verify**: `/code-review`

### 3. Integrate a Design

1. **Create components**: `/ui-from-design`
2. **Verify accessibility**: Automatic verification via rules
3. **Integrate**: Use components in pages

---

## 📖 Resources

-   [Documentation Cursor](https://docs.cursor.com)
-   [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [React Query Docs](https://tanstack.com/query/latest)
-   [Next.js Docs](https://nextjs.org/docs)

---

## 🛠️ Maintenance

### Adding a New Agent

1. Create the `.yaml` file in `agents/`
2. Define `name`, `description`, `goals`, `instructions`, `playbooks`
3. Create an associated command in `commands/` if needed

### Modifying a Rule

1. Modify the `.mdc` file in `rules/`
2. Verify that agents and commands are aligned
3. Test with a real case

### Adding a Command

1. Create the `.md` file in `commands/`
2. Reference the appropriate agent
3. Document usage

---

## ✅ Compliance Checklist

Before submitting code, verify:

-   [ ] Clean Architecture respected
-   [ ] React Query for server state, Zustand for UI state
-   [ ] SCSS variables used (no hardcoded values)
-   [ ] WCAG 2.1 AA accessibility
-   [ ] Unit tests for domain/usecases
-   [ ] Complete JSDoc documentation
-   [ ] No business logic in UI
-   [ ] No direct Supabase call from UI

Use `/code-review` for automatic verification.

---

## 📞 Support

For any questions or improvements to this configuration:

1. Check existing documentation
2. Consult examples in files
3. Use `/architecture-review` to validate changes

---

**Last updated**: 2025-01-27
