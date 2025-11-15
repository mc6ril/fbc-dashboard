---
name: "Debug Issue"
description: "Debug issues using Architecture-Aware Dev with project-specific tools"
agent: "Architecture-Aware Dev"
tags: ["debug", "troubleshooting", "nextjs"]
---

# Debug Issue

## Overview

Help debug the current issue in the code using the **Architecture-Aware Dev** agent by walking through the debugging process systematically and providing clear, actionable solutions.

## Agent

**Use**: @Architecture-Aware Dev

The Architecture-Aware Dev uses project-specific debugging tools:

-   **Next.js DevTools**: Browser DevTools integration
-   **React Query DevTools**: React Query state inspection
-   **Zustand DevTools**: Zustand state inspection
-   **Logger**: Structured logging

## Steps

1. **Problem Analysis**
    - Identify the specific problem or error
    - Understand the expected vs actual behavior
    - Trace the execution flow to find the root cause
2. **Debugging Strategy**
    - Add appropriate logging statements
    - **Next.js DevTools**: Use browser DevTools for debugging
    - **React Query DevTools**: Inspect React Query cache and queries
    - **Zustand DevTools**: Inspect Zustand state transitions
    - Trace data flow: UI → React Query hooks → usecases → repositories → Supabase
    - Identify key variables and states to monitor
    - Recommend breakpoint locations
    - **Never log sensitive data** (passwords, tokens, personal info)
3. **Solution Approach**
    - Propose potential fixes with explanations
    - Consider multiple solution approaches
    - Evaluate trade-offs of different approaches
    - Provide step-by-step resolution plan
4. **Prevention**
    - Suggest ways to prevent similar issues
    - Recommend additional tests or checks
    - Identify code patterns that could be improved

## Debug Issue Checklist

### Problem Analysis

-   [ ] Identified the specific problem or error
-   [ ] Understood expected vs actual behavior
-   [ ] Traced execution flow to find root cause
-   [ ] Traced data flow if applicable (UI → React Query hooks → usecases → repositories → Supabase)

### Debugging Tools

-   [ ] Added appropriate logging statements
-   [ ] Used Next.js DevTools for debugging
-   [ ] Used React Query DevTools for cache inspection
-   [ ] Used Zustand DevTools for state inspection
-   [ ] Verified no sensitive data in logs

### Solution

-   [ ] Proposed potential fixes with explanations
-   [ ] Evaluated trade-offs of different approaches
-   [ ] Provided step-by-step resolution plan
-   [ ] Ensured fixes respect architecture rules (Clean Architecture, layer separation, etc.)

### Prevention

-   [ ] Suggested ways to prevent similar issues
-   [ ] Recommended additional tests or checks
-   [ ] Identified code patterns that could be improved
