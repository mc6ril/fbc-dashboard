---
name: "Debug Issue"
description: "Debug issues using Architecture-Aware Dev with project-specific tools"
agent: "Architecture-Aware Dev"
tags: ["debug", "troubleshooting", "react-native"]
---

# Debug Issue

## Overview

Help debug the current issue in the code using the **Architecture-Aware Dev** agent by walking through the debugging process systematically and providing clear, actionable solutions.

## Agent

**Use**: @Architecture-Aware Dev

The Architecture-Aware Dev uses project-specific debugging tools:
- **React Native Debugger**: Chrome DevTools integration
- **Reactotron**: Redux state inspection
- **Logger**: Structured logging (Bugfender in production)
- **BLE Debugging**: EventService event flow inspection

## Steps

1. **Problem Analysis**
   - Identify the specific problem or error
   - Understand the expected vs actual behavior
   - Trace the execution flow to find the root cause
2. **Debugging Strategy**
   - Add appropriate logging statements using `Logger.logInfo()`, `Logger.logWarning()`, `Logger.logError()`
   - **React Native Debugger**: Enable remote debugging (shake device or `Cmd+D` on simulator)
   - **Reactotron**: Inspect Redux state transitions and actions
   - **BLE Debugging**: Trace BLE → handlers → EventService → helpers → redux → UI flow
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
- [ ] Identified the specific problem or error
- [ ] Understood expected vs actual behavior
- [ ] Traced execution flow to find root cause
- [ ] Traced BLE pipeline if applicable (BLE → handlers → EventService → helpers → redux → UI)

### Debugging Tools
- [ ] Added appropriate logging statements (Logger.logInfo/Warning/Error)
- [ ] Used React Native Debugger for JavaScript debugging
- [ ] Used Reactotron for Redux state inspection
- [ ] Verified no sensitive data in logs

### Solution
- [ ] Proposed potential fixes with explanations
- [ ] Evaluated trade-offs of different approaches
- [ ] Provided step-by-step resolution plan
- [ ] Ensured fixes respect architecture rules (DI, Services/Helpers, Redux, etc.)

### Prevention
- [ ] Suggested ways to prevent similar issues
- [ ] Recommended additional tests or checks
- [ ] Identified code patterns that could be improved
