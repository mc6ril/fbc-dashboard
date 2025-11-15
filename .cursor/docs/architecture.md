# 🏗️ Clean Architecture — Dashboard Workshop

## 📌 Fundamental Principles

This project follows **strict Clean Architecture**.

The goal is to clearly separate responsibilities:

-   **Domain** → pure business rules, types and logic without dependencies
-   **Usecases (Application)** → business logic orchestrating repositories
-   **Infrastructure** → data access (Supabase), concrete implementations
-   **Presentation** → Next.js UI, SCSS, state management (Zustand), data fetching (React Query)

### Golden Rule

**No business logic should be in the UI or infrastructure.**

### Layer Independence

Cursor must respect layer independence:

-   The UI **never** calls Supabase directly
-   The UI calls React Query hooks, which execute usecases
-   Usecases use ports to contact the database
-   Ports have multiple possible implementations
-   Concrete implementations (Supabase) are in `infrastructure/`

---

## 🧩 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── stocks/
│   │   └── page.tsx
│   └── products/
│       └── [id]/
│           └── page.tsx
│
├── core/                   # Business core (independent)
│   ├── domain/            # Business entities + pure rules
│   ├── usecases/          # Use cases (simple files)
│   └── ports/             # Repository interfaces
│
├── infrastructure/         # Concrete implementations
│   └── supabase/          # Concrete implementations of ports
│       ├── client.ts
│       ├── productRepositorySupabase.ts
│       ├── stockMovementRepositorySupabase.ts
│       └── utils/
│
├── presentation/           # Presentation layer
│   ├── components/        # Pure UI components
│   ├── layouts/
│   ├── stores/            # Zustand (global UI state)
│   ├── hooks/             # React Query hooks
│   └── providers/         # QueryClientProvider, other providers
│
├── shared/                # Code shared between layers
│   └── a11y/              # Accessibility (utilities, constants, helpers)
│
└── styles/                # Global styles
    ├── global.scss
    ├── variables/
    ├── components/
    └── layout/
```

---

## 🧱 Rules: What Cursor Must Respect

### 1. Domain (`core/domain`)

**Contains:**

-   Business types/interfaces (Product, StockMovement)
-   Pure business rules (e.g., `isLowStock(product)`)

**Must never import:**

-   ❌ Supabase
-   ❌ React
-   ❌ Zustand
-   ❌ React Query
-   ❌ Next.js

**Pure TypeScript only.**

---

### 2. Usecases (`core/usecases`)

**Characteristics:**

-   Each usecase is a pure function orchestrating business logic
-   It takes ports (repositories) as parameters
-   It returns domain data

**Must not know about:**

-   ❌ Supabase
-   ❌ React
-   ❌ Zustand

**Structure example:**

```typescript
export async function listProducts(repo: ProductRepository) {
    return repo.list();
}
```

---

### 3. Ports (`core/ports`)

**Role:**

-   Define repository interfaces
-   Example: `ProductRepository`, `StockMovementRepository`
-   These are the contracts that infrastructure must respect

---

### 4. Infrastructure (`infrastructure/`)

**Contains:**

-   Concrete implementations of ports
-   Supabase
-   Adapters
-   Mappers

**Can import:**

-   ✅ Supabase
-   ✅ Fetch
-   ✅ External libraries

**Must never import:**

-   ❌ UI
-   ❌ Zustand

**Example:**

```typescript
export const productRepositorySupabase: ProductRepository = {
    list: async () => {
        // ...supabase.from("products")...
    },
};
```

---

### 5. Presentation (UI Next + React)

#### 5.1. Components (`presentation/components`)

**Characteristics:**

-   Pure UI components
-   No business logic
-   No Supabase calls
-   Receive ready data via props

#### 5.2. Hooks (`presentation/hooks`)

**Role:**

-   React Query hooks
-   Call usecases
-   Provide: `data`, `isLoading`, `error`
-   Do not contain business logic → only orchestrate usecases

**Recommended structure:**

```typescript
export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: () => listProducts(productRepositorySupabase),
    });
}
```

#### 5.3. Zustand Stores (`presentation/stores`)

**Contains only UI state:**

-   Filters
-   Modals
-   Selected category
-   Drawer state

**Must never contain business logic.**

#### 5.4. Providers (`presentation/providers`)

**Contains:**

-   ReactQueryProvider
-   Global app providers

---

## ⚡ Modules Used in the Project

-   **Next.js** (App Router)
-   **SCSS** (global.scss + SCSS modules if needed)
-   **Supabase** → self-hosted backend (no Node backend)
-   **React Query** (TanStack Query) → data fetching & cache
-   **Zustand** → lightweight global UI state
-   **TypeScript strict**
-   **Clean Architecture** (Core / Infrastructure / Presentation)

---

## 🧪 Code Generation Rules for Cursor

### ✔️ Cursor must:

1. Create files in the correct directories according to their role
2. Respect layers:
    - A usecase must not import Supabase
    - A UI component must not call Supabase directly
    - A Zustand store must not contain business logic
    - A React Query hook must call a usecase, not directly infrastructure
3. Create proper types in the domain

### ❌ Cursor must never:

1. Mix UI and business logic
2. Put Supabase code in `/core/`
3. Put network calls in React components
4. Put business logic in Zustand
5. Call Supabase directly from the UI
6. Make forbidden cross-layer imports (e.g., infra → app)

---

## 📚 Complete Flow Example (reference for Cursor)

```
UI (Next Page)
    ↓ calls
React Query Hook (useProducts)
    ↓ calls
Usecase (listProducts)
    ↓ calls
Repository (productRepositorySupabase)
    ↓ calls
Supabase (infrastructure)
```

**Always in this direction. Never reversed.**
