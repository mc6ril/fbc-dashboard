---
name: "Git Commit & Push"
description: "Commit and push changes to git repository with automatic message generation"
tags: ["git", "commit", "push", "version-control"]
---

# Git Commit & Push

## Overview

Commit and push all staged or modified changes to the git repository. The command automatically generates a commit message based on the changes or uses the provided message.

## Steps

1. **Check Git Status**

    - Show current git status
    - List all modified, added, or deleted files
    - Identify untracked files

2. **Stage Changes**

    - Add all modified files (`git add .`)
    - Or stage specific files if needed
    - Verify staged files

3. **Generate Commit Message** (if not provided)

    - Analyze changes to determine type (feat, fix, refactor, docs, etc.)
    - Create descriptive commit message following conventional commits format
    - Include scope if applicable (e.g., `.cursor`, `rules`, `agents`)

4. **Commit Changes**

    - Create commit with generated or provided message
    - Follow conventional commits format: `type(scope): description`
    - Ensure message is clear and descriptive

5. **Push to Remote**
    - Push changes to current branch (default: `main`)
    - Verify push success

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:

-   `feat`: New feature
-   `fix`: Bug fix
-   `refactor`: Code refactoring
-   `docs`: Documentation changes
-   `style`: Code style changes (formatting, etc.)
-   `test`: Test changes
-   `chore`: Maintenance tasks
-   `perf`: Performance improvements

**Examples**:

```
feat(.cursor): add automatic file management for Jira tickets and reports
fix(rules): correct scopes in testing-patterns.mdc
docs(.cursor): add README.md with usage guide
refactor(agents): update security-agent to save reports to report/security/
```

## Agent

**Use**: Architecture-Aware Dev or direct git commands

This command can be executed directly or through the Architecture-Aware Dev agent to ensure changes follow project conventions.

## Usage

### Basic Usage (Auto-generated message)

```
/git-commit-push
```

The command will:

1. Check git status and show changes
2. Stage all changes (`git add .`)
3. Generate commit message based on changes
4. Commit changes with generated message
5. Push to remote branch

### With Custom Message

```
/git-commit-push "feat: add new feature X"
```

Or provide message in the command:

```
/git-commit-push
Commit message: feat: add new feature X
```

## Examples

### Example 1: Auto-generated message

**Input**: `/git-commit-push`

**Process**:

1. Check status → 5 modified files, 2 new files
2. Stage all changes
3. Analyze: new rule file, updated agents → `feat(.cursor): add automatic file management rule`
4. Commit: `git commit -m "feat(.cursor): add automatic file management rule"`
5. Push: `git push`

### Example 2: Custom message

**Input**: `/git-commit-push "fix(rules): correct testing-patterns scopes"`

**Process**:

1. Check status → 1 modified file
2. Stage changes
3. Use provided message: `fix(rules): correct testing-patterns scopes`
4. Commit with custom message
5. Push to remote

### Example 3: Documentation update

**Input**: `/git-commit-push`

**Auto-detected**: Only `.md` files changed → `docs(.cursor): update documentation`

## Safety Checks

-   **NEVER** commit sensitive data (secrets, passwords, API keys)
-   **NEVER** commit `.env` files or environment variables
-   **ALWAYS** review staged changes before committing
-   **ALWAYS** ensure tests pass before pushing (if applicable)
-   **VERIFY** branch name before pushing (default: `main`)

## Notes

-   If no changes are detected, the command will inform the user
-   If working directory is not clean, all changes will be staged
-   The command assumes the remote is already configured
-   For feature branches, the command pushes to the current branch
-   Always review the generated commit message before accepting

## Related Commands

-   `/debug-issue`: Debug code issues
-   `/code-review`: Review code changes before commit
-   `/lint-fix`: Fix linting issues before commit
