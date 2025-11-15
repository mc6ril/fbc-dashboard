# 🧼 Code Conventions — Dashboard Workshop

**Development standards and code style**

---

## ✨ 1. General Style

-   **TypeScript strict** at all times
-   **No `any`** allowed
-   **Prefer explicit types**
-   **Short, readable, and pure functions** — avoid unnecessarily complex logic

---

## 🎨 2. SCSS / Styling

### SCSS Structure

-   **Global SCSS** in `styles/global.scss`
-   **Variables** in `styles/variables/*`
-   **UI Components** in `styles/components/*`

### SCSS Variables

-   ✅ **Always use only variables** from `styles/variables/*` for all styles
-   ❌ **NEVER create styles** with hardcoded values (colors, spacing, sizes, etc.)
-   ✅ **If a variable doesn't exist** in `styles/variables/*`, add it to the dedicated section of the appropriate file
-   ❌ **NEVER use direct values** (e.g., `#fff`, `16px`, `1rem`) without using a variable

### Naming Rules

**Classes in kebab-case:**

```scss
.product-card {
    // ...
}
```

**Sub-elements with `__`:**

```scss
.product-card__title {
    // ...
}
```

**Variations with `--`:**

```scss
.button--primary {
    // ...
}
```

### Prohibitions

-   ❌ **Zero inline CSS** in React components
-   ❌ **No use of `!important`**

---

## ⚛️ 3. React / Next.js Conventions

### Components

**Format:** arrow function with export default

```typescript
const ComponentName = () => {
    // ...
};

export default ComponentName;
```

**Rules:**

-   ❌ No ES6 classes
-   ❌ No `export function`
-   ✅ Naming: **PascalCase** for component
-   ✅ Always use `const componentName = () => {}`
-   ✅ Always use `export default ComponentName` at the end

### Props

**Props type defined above the component:**

```typescript
type Props = {
    products: Product[];
};

const ProductList = ({ products }: Props) => {
    // ...
};

export default ProductList;
```

**Rules:**

-   ✅ Always use `type` for props (never `interface`)

### JSX

**Minimal JSX:**

-   ❌ No network calls
-   ❌ No business logic
-   ❌ No heavy calculations

**Conditions:**

-   ✅ Use `&&` or ternaries
-   ❌ Never `if` in JSX

### Files

-   **Extension:** `.tsx`
-   **Rule:** One file = one main component

---

## 🐻 4. Zustand Conventions (UI State)

### Rules

-   **One store = one UI state domain**: filters, modals, selection, theme, etc.
-   ❌ **No side effects** in stores
-   ❌ **No direct link** with Supabase, React Query, or business logic

### Naming

**Format:** `useXxxStore.ts`

**Example:**

```typescript
export const useFilterStore = create<FilterState>((set) => ({
    search: "",
    setSearch: (v) => set({ search: v }),
}));
```

---

## 🔍 5. React Query Conventions (Data Fetching)

### Rules

-   **One hook per resource**: `useProducts`, `useStockMovements`, etc.
-   **Explicit and stable queryKey**: `queryKey: ["products"]`
-   ❌ **Never direct Supabase call**: only execution of a usecase
-   ✅ **Always return**: `data`, `isLoading`, `error`

### Example

```typescript
export function useProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: () => listProducts(productRepositorySupabase),
    });
}
```

---

## 📦 6. Types & Naming

### Types

-   **Business types** in `core/domain` and used everywhere via imports
-   ❌ **Prefixes prohibited**: no `IProduct`, `IUser`
-   ✅ **Prefer**: `Product`, `StockMovement`

### Interface vs Type vs Enum

**Strict rules:**

-   ✅ **`interface`**: **ONLY** for classes
-   ✅ **`type`**: for everything else (props, objects, unions, intersections, etc.)
-   ✅ **`enum`**: for enumerated constants

**Examples:**

```typescript
// ✅ Interface only for classes
interface IRepository {
    list(): Promise<Product[]>;
}

class ProductRepository implements IRepository {
    // ...
}

// ✅ Type for props, objects, etc.
type Product = {
    id: string;
    name: string;
};

type Props = {
    products: Product[];
};

// ✅ Enum for constants
enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}
```

### Variables

-   **camelCase** for variables and functions
-   **PascalCase** for types / components

### Files

| File                           | Type                      |
| ------------------------------ | ------------------------- |
| `ProductTable.tsx`             | Component                 |
| `useProducts.ts`               | React Query hook          |
| `useProductFilterStore.ts`     | Zustand store             |
| `productRepositorySupabase.ts` | Infrastructure repository |

---

## 🧪 7. Tests

**Unit tests only for:**

-   `domain`
-   `usecases`

**UI Tests:**

-   ❌ No mandatory UI tests for page components
-   ✅ **Mandatory tests** for reusable components in `presentation/components/ui`

---

## 🧰 8. Imports — Order and Cleanliness

### Recommended Order

1. **External libraries** (React, Zustand, React Query…)
2. **Types / domain**
3. **Usecases**
4. **Infrastructure**
5. **Presentation** (components, hooks, stores)
6. **Styles or SCSS modules**
7. **Relative imports**

### Rules

-   ✅ **Always remove** unused imports

---

## 🔧 9. Quality & Best Practices

-   ✅ **Name functions** according to what they actually do
-   ✅ **Prefer pure functions**
-   ✅ **Split long components**
-   ✅ **Use `async/await`** rather than `.then()`
-   ✅ **Always type** return values of public functions
-   ✅ **Never ignore a network error** (always at least a `throw`)

---

## 📝 10. Commits

**Simple and clear convention:**

```
feat: add useProducts hook
fix: remove Product mapping error
refactor: move Zustand stores
style: clean up SCSS
docs: add code_conventions.md
```

---

## 🏁 Conclusion

This documentation defines style conventions, **independent of architecture**.

**Cursor must systematically apply these rules** when generating or modifying files.
