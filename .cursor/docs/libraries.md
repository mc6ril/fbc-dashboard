---
description: Shared documentation for key third-party libraries used across the project.
alwaysApply: true
---

# Core Libraries Documentation

This document lists the official documentation for key third-party libraries used in the fbc-dashboard project. Reference these documents when implementing features or troubleshooting issues.

## Framework & Core

### Next.js (v16.0.3)

-   **Official Documentation**: https://nextjs.org/docs
-   **App Router Guide**: https://nextjs.org/docs/app
-   **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
-   **Data Fetching**: https://nextjs.org/docs/app/building-your-application/data-fetching
-   **Server Components**: https://nextjs.org/docs/app/building-your-application/rendering/server-components
-   **Key Features**: App Router, Server Components, API Routes, Image Optimization, Font Optimization

### React (v19.2.0)

-   **Official Documentation**: https://react.dev
-   **Hooks Reference**: https://react.dev/reference/react
-   **Server Components**: https://react.dev/reference/react/use-client
-   **React Compiler**: https://react.dev/learn/react-compiler
-   **Key Features**: React 19 features, Server Components, Hooks, React Compiler

### TypeScript (v5)

-   **Official Documentation**: https://www.typescriptlang.org/docs
-   **Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
-   **Type Reference**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
-   **Key Features**: Strict mode, type safety, interfaces vs types

## State Management & Data Fetching

### TanStack Query (React Query) (v5.90.9)

-   **Official Documentation**: https://tanstack.com/query/latest
-   **React Query Guide**: https://tanstack.com/query/latest/docs/framework/react/overview
-   **Queries**: https://tanstack.com/query/latest/docs/framework/react/guides/queries
-   **Mutations**: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
-   **Query Keys**: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
-   **Caching**: https://tanstack.com/query/latest/docs/framework/react/guides/caching
-   **Key Features**: Server state management, caching, automatic refetching, optimistic updates

### Zustand (v5.0.8)

-   **Official Documentation**: https://docs.pmnd.rs/zustand
-   **Getting Started**: https://docs.pmnd.rs/zustand/getting-started/introduction
-   **TypeScript Guide**: https://docs.pmnd.rs/zustand/guides/typescript
-   **Persisting State**: https://docs.pmnd.rs/zustand/integrations/persisting-store-data
-   **Key Features**: Lightweight state management, TypeScript support, no providers needed

## Backend & Database

### Supabase (v2.81.1)

-   **Official Documentation**: https://supabase.com/docs
-   **JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction
-   **Authentication**: https://supabase.com/docs/guides/auth
-   **Database**: https://supabase.com/docs/guides/database
-   **Realtime**: https://supabase.com/docs/guides/realtime
-   **Storage**: https://supabase.com/docs/guides/storage
-   **Key Features**: PostgreSQL database, authentication, realtime subscriptions, storage

## Styling

### Sass/SCSS (v1.94.0)

-   **Official Documentation**: https://sass-lang.com/documentation
-   **Sass Basics**: https://sass-lang.com/guide
-   **SCSS Syntax**: https://sass-lang.com/documentation/syntax
-   **Variables**: https://sass-lang.com/documentation/variables
-   **Mixins**: https://sass-lang.com/documentation/at-rules/mixin
-   **Key Features**: Variables, nesting, mixins, partials, modules

## Development Tools

### ESLint (v9)

-   **Official Documentation**: https://eslint.org/docs/latest
-   **Next.js ESLint**: https://nextjs.org/docs/app/building-your-application/configuring/eslint
-   **Rules Reference**: https://eslint.org/docs/latest/rules

### React Compiler (babel-plugin-react-compiler) (v1.0.0)

-   **Official Documentation**: https://react.dev/learn/react-compiler
-   **React Compiler Guide**: https://github.com/reactjs/react-compiler
-   **Key Features**: Automatic memoization, performance optimizations

## Architecture Patterns

### Clean Architecture

-   **Project Structure**: Following Clean Architecture principles with Domain, Usecases, Infrastructure, and Presentation layers
-   **Dependency Direction**: Domain → Usecases → Infrastructure → Presentation
-   **Repository Pattern**: Using ports (interfaces) and adapters (implementations)

## Accessibility

### WCAG 2.1 Guidelines

-   **WCAG 2.1 Overview**: https://www.w3.org/WAI/WCAG21/quickref/
-   **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
-   **Accessibility Project**: https://www.a11yproject.com/

---

## Quick Reference

When implementing features, always refer to:

1. **Next.js App Router** for routing and page structure
2. **React Query** for all data fetching and server state
3. **Zustand** for UI state management only
4. **Supabase** for database operations and authentication
5. **SCSS Variables** from `styles/variables/*` for all styling values
