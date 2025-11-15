---
Generated: 2025-01-27 14:30:22
Report Type: planning
Command: pm-plan-from-ticket
Ticket: FBC-1
---

# Implementation Plan: Add run script for project commands

## Summary

### Goal

Create a centralized `run` script at the root of the project that provides a unified interface for common development tasks: clean, build, start, and dev commands. The script will be callable with `sh run <command>` syntax, improving developer experience by reducing context switching and command memorization.

### User Value

-   **Improved Developer Experience**: Developers can use a single, memorable command interface (`sh run <command>`) instead of remembering individual yarn commands
-   **Reduced Friction**: No need to check `package.json` for available commands
-   **Consistency**: Unified interface for all common development operations
-   **Efficiency**: Quick switching between development modes and maintenance tasks

### Constraints

-   Script must be located at project root (same level as `package.json`, `next.config.ts`)
-   Script must be callable with `sh run <command>` syntax (not `./run command`)
-   Must work on macOS and Linux environments
-   Must rely on existing package.json scripts (`dev`, `build`, `start`)
-   No impact on Clean Architecture layers (pure utility script)

### Non-Goals

-   Adding new functionality beyond command orchestration
-   Modifying existing package.json scripts
-   Creating GUI or interactive interface
-   Adding command aliases to shell configuration
-   Supporting Windows PowerShell/cmd (Linux/macOS only)

---

## Assumptions & Risks

### Assumptions

1. **Package Manager**: Project uses Yarn (based on `yarn.lock` presence)
2. **Shell Environment**: Developers use bash-compatible shells (macOS/Linux default)
3. **Node.js/Yarn**: Node.js and Yarn are already installed on developer machines
4. **Permissions**: Developers can execute shell scripts (`sh` command available)
5. **Build Artifacts**: `.next/` directory is the primary build output directory
6. **No Breaking Changes**: Existing package.json scripts remain unchanged

### Risks

| Risk                                                | Impact | Probability | Mitigation                                                                                         |
| --------------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------------------------------------- |
| Script compatibility issues across different shells | Medium | Low         | Use `#!/usr/bin/env bash` shebang, test on common shells                                           |
| Incorrect directory removal (clean command)         | High   | Low         | Add confirmation prompt or verbose output, carefully target `.next/` and optionally `node_modules` |
| Missing dependencies detection                      | Low    | Low         | Add basic checks for yarn/node availability                                                        |
| Developers not adopting new script                  | Low    | Medium      | Document in README.md, team communication                                                          |
| Script becomes maintenance burden                   | Low    | Low         | Keep script simple, well-documented, aligned with existing scripts                                 |

### Blockers

-   None identified. This is a standalone tooling task with no external dependencies.

---

## Solution Outline (aligned with architecture)

### Architecture Impact

**None** - This script is a utility tool outside Clean Architecture layers. It executes existing package.json scripts and does not interact with:

-   Domain layer (no business logic)
-   Usecases layer (no orchestration)
-   Infrastructure layer (no Supabase/repository calls)
-   Presentation layer (no React/UI code)

### Implementation Approach

1. **Script Location**: Create `run` file at project root
2. **Script Type**: Bash shell script with shebang `#!/usr/bin/env bash`
3. **Command Routing**: Parse command-line arguments and route to appropriate yarn/npm commands
4. **Error Handling**: Graceful error handling with meaningful messages
5. **Usage Help**: Display usage instructions when no arguments or invalid commands provided
6. **Clean Command**: Remove `.next/` directory (and optionally `node_modules/` with confirmation)

### Data Flow

```
Developer → sh run <command> → Bash Script → yarn <command> → Next.js/React Application
```

No data flows through Clean Architecture layers - pure utility script execution.

---

## Sub-Tickets

### Sub-Ticket 1: Create basic run script with command routing

**Title:** Create run script with dev, build, and start commands

**Rationale:**
Core functionality - implement basic command routing for the most common operations. This establishes the script structure and command parsing logic.

**Acceptance Criteria:**

-   [x] AC1.1: Script file `run` created at project root (same level as `package.json`)
-   [x] AC1.2: Script includes shebang line `#!/usr/bin/env bash`
-   [x] AC1.3: Script supports `dev` command: executes `yarn dev`
-   [x] AC1.4: Script supports `build` command: executes `yarn build`
-   [x] AC1.5: Script supports `start` command: executes `yarn start`
-   [x] AC1.6: Script can be called with `sh run <command>` syntax (e.g., `sh run dev`)
-   [x] AC1.7: Script detects if yarn is available, shows error if not found

**Definition of Done:**

-   [x] Script created and executable
-   [x] All three commands (dev, build, start) work correctly
-   [x] Script tested manually with `sh run dev`, `sh run build`, `sh run start`
-   [x] Error handling for missing yarn implemented
-   [x] Code reviewed

**Estimated Effort:** 2 hours

**Dependencies:** None

**Owner:** Developer

**Risk Notes:** Low risk - straightforward command routing. Main consideration is ensuring yarn detection works correctly.

---

### Sub-Ticket 2: Add clean command with build artifacts removal

**Title:** Add clean command to remove build artifacts

**Rationale:**
Add maintenance functionality to remove build artifacts (`.next/` directory) and optionally `node_modules/` to help developers reset their environment.

**Acceptance Criteria:**

-   [x] AC2.1: Script supports `clean` command that removes `.next/` directory if it exists
-   [x] AC2.2: Script removes `node_modules/` directory if `clean --all` flag is used (with confirmation prompt)
-   [x] AC2.3: Clean command provides verbose output showing what is being removed
-   [x] AC2.4: Clean command handles cases where directories don't exist gracefully (no errors)
-   [x] AC2.5: Clean command does not remove files outside project root (safety check)

**Definition of Done:**

-   [x] Clean command implemented and tested
-   [x] Safety checks prevent deletion of files outside project root
-   [x] Confirmation prompt for `--all` flag implemented
-   [x] Script tested manually: `sh run clean` and `sh run clean --all`
-   [x] Error handling verified for missing directories
-   [x] Code reviewed

**Estimated Effort:** 2 hours

**Dependencies:** Sub-Ticket 1 (requires basic script structure)

**Owner:** Developer

**Risk Notes:** Medium risk - directory deletion must be carefully implemented to avoid accidental data loss. Safety checks are critical.

---

### Sub-Ticket 3: Add usage instructions and error handling

**Title:** Add usage help and comprehensive error handling

**Rationale:**
Improve developer experience with clear usage instructions and meaningful error messages. Help developers understand available commands and diagnose issues.

**Acceptance Criteria:**

-   [x] AC3.1: Script displays usage instructions when called without arguments (`sh run`)
-   [x] AC3.2: Script displays usage instructions when called with invalid command (`sh run invalid`)
-   [x] AC3.3: Usage instructions list all available commands: `dev`, `build`, `start`, `clean`
-   [x] AC3.4: Usage instructions include examples: `sh run dev`, `sh run clean`, etc.
-   [x] AC3.5: Script handles errors gracefully with meaningful error messages
-   [x] AC3.6: Script exits with appropriate exit codes (0 for success, non-zero for errors)
-   [x] AC3.7: Error messages are clear and actionable (e.g., "yarn not found, please install yarn")

**Definition of Done:**

-   [x] Usage instructions implemented and tested
-   [x] Error handling implemented for all failure scenarios
-   [x] Exit codes set correctly for success and error cases
-   [x] Script tested manually with invalid commands and missing dependencies
-   [x] Error messages reviewed for clarity and actionability
-   [x] Code reviewed

**Estimated Effort:** 1.5 hours

**Dependencies:** Sub-Ticket 1, Sub-Ticket 2 (requires all commands to be implemented)

**Owner:** Developer

**Risk Notes:** Low risk - straightforward error handling and help text implementation.

---
