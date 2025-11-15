---
name: "Optimize Performance"
description: "Optimize performance following architecture rules using Architecture-Aware Dev"
agent: "Architecture-Aware Dev"
tags: ["performance", "optimization", "nextjs"]
---

# Optimize Performance

## Overview

Analyze the current code for performance bottlenecks using the **Architecture-Aware Dev** agent and provide optimization recommendations, focusing on measurable improvements while maintaining code quality, readability, and architecture compliance.

## Agent

**Use**: @Architecture-Aware Dev

The Architecture-Aware Dev ensures optimizations respect architecture rules and include Next.js-specific optimizations.

## Steps

1. **Performance Analysis**
    - Identify slow algorithms and inefficient data structures
    - Find memory leaks and excessive allocations
    - Detect unnecessary computations and redundant operations
    - Analyze database queries and API calls
2. **Next.js Specific Optimizations**

    - Component memoization (React.memo, useMemo, useCallback)
    - React Query optimization (queryKeys, staleTime, select, enabled)
    - Zustand selector optimization (specific selectors, not entire state)
    - Next.js Image component for optimized image loading
    - Code splitting and dynamic imports
    - Prevent unnecessary re-renders

3. **Optimization Strategies**

    - Suggest algorithm improvements and better data structures
    - Recommend caching strategies where appropriate
    - Propose lazy loading and pagination solutions
    - Identify opportunities for parallel processing

4. **Implementation**
    - Provide optimized code with explanations
    - Include performance impact estimates
    - Suggest profiling and monitoring approaches
    - Consider trade-offs between performance and maintainability

## Optimize Performance Checklist

### Analysis

-   [ ] Identified slow algorithms and inefficient data structures
-   [ ] Found memory leaks and excessive allocations
-   [ ] Detected unnecessary computations and redundant operations
-   [ ] Analyzed database queries and API calls
-   [ ] Identified Next.js specific bottlenecks

### Next.js Optimizations

-   [ ] Applied component memoization (React.memo, useMemo, useCallback)
-   [ ] Optimized React Query (queryKeys, staleTime, select, enabled)
-   [ ] Optimized Zustand selectors (specific selectors, not entire state)
-   [ ] Used Next.js Image component for optimized image loading
-   [ ] Applied code splitting and dynamic imports
-   [ ] Prevented unnecessary re-renders

### General Optimizations

-   [ ] Suggested algorithm improvements and better data structures
-   [ ] Recommended caching strategies where appropriate
-   [ ] Provided optimized code with explanations
-   [ ] Included performance impact estimates
-   [ ] Considered trade-offs between performance and maintainability
-   [ ] Maintained architecture compliance (Clean Architecture, layer separation, etc.)
