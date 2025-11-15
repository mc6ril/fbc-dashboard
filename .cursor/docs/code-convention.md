# 🧼 Code Conventions — Dashboard Atelier

**Standards de développement et style de code**

---

## ✨ 1. Style général

-   **TypeScript strict** en toutes circonstances
-   **Aucun `any`** autorisé
-   **Privilégier les types explicites**
-   **Fonctions courtes, lisibles et pures** — éviter la logique inutilement complexe

---

## 🎨 2. SCSS / Styling

### Structure SCSS

-   **SCSS global** dans `styles/global.scss`
-   **Variables** dans `styles/variables/*`
-   **Composants UI** dans `styles/components/*`

### Variables SCSS

-   ✅ **Toujours utiliser uniquement des variables** depuis `styles/variables/*` pour tous les styles
-   ❌ **Ne JAMAIS créer de styles** avec des valeurs hardcodées (couleurs, espacements, tailles, etc.)
-   ✅ **Si une variable n'existe pas** dans `styles/variables/*`, l'ajouter dans la section dédiée du fichier approprié
-   ❌ **Ne JAMAIS utiliser de valeurs directes** (ex: `#fff`, `16px`, `1rem`) sans passer par une variable

### Règles de nommage

**Classes en kebab-case :**

```scss
.product-card {
    // ...
}
```

**Sous-éléments avec `__` :**

```scss
.product-card__title {
    // ...
}
```

**Variations avec `--` :**

```scss
.button--primary {
    // ...
}
```

### Interdictions

-   ❌ **Zéro CSS inline** dans les composants React
-   ❌ **Pas d'utilisation de `!important`**

---

## ⚛️ 3. React / Next.js conventions

### Composants

**Format :** arrow function avec export default

```typescript
const ComponentName = () => {
    // ...
};

export default ComponentName;
```

**Règles :**

-   ❌ Pas de classes ES6
-   ❌ Pas de `export function`
-   ✅ Nommage : **PascalCase** pour le composant
-   ✅ Toujours utiliser `const componentName = () => {}`
-   ✅ Toujours utiliser `export default ComponentName` à la fin

### Props

**Type de props défini au-dessus du composant :**

```typescript
type Props = {
    products: Product[];
};

const ProductList = ({ products }: Props) => {
    // ...
};

export default ProductList;
```

**Règles :**

-   ✅ Toujours utiliser `type` pour les props (jamais `interface`)

### JSX

**JSX minimal :**

-   ❌ Pas d'appels réseau
-   ❌ Pas de logique métier
-   ❌ Pas de calcul lourd

**Conditions :**

-   ✅ Utiliser `&&` ou ternaires
-   ❌ Jamais `if` dans JSX

### Fichiers

-   **Extension :** `.tsx`
-   **Règle :** Un fichier = un composant principal

---

## 🐻 4. Zustand conventions (state UI)

### Règles

-   **Un store = un domaine d'état UI** : filtres, modales, sélection, thème, etc.
-   ❌ **Aucun effet secondaire** dans les stores
-   ❌ **Aucun lien direct** avec Supabase, React Query ou logique métier

### Nommage

**Format :** `useXxxStore.ts`

**Exemple :**

```typescript
export const useFilterStore = create<FilterState>((set) => ({
    search: "",
    setSearch: (v) => set({ search: v }),
}));
```

---

## 🔍 5. React Query conventions (data-fetching)

### Règles

-   **Un hook par ressource** : `useProducts`, `useStockMovements`, etc.
-   **queryKey explicite et stable** : `queryKey: ["products"]`
-   ❌ **Jamais d'appel Supabase direct** : uniquement exécution d'un usecase
-   ✅ **Toujours retourner** : `data`, `isLoading`, `error`

### Exemple

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

-   **Types métiers** dans `core/domain` et utilisés partout via imports
-   ❌ **Préfixes proscrits** : pas de `IProduct`, `IUser`
-   ✅ **Préférer** : `Product`, `StockMovement`

### Interface vs Type vs Enum

**Règles strictes :**

-   ✅ **`interface`** : **UNIQUEMENT** pour les classes
-   ✅ **`type`** : pour tout le reste (props, objets, unions, intersections, etc.)
-   ✅ **`enum`** : pour les constantes énumérées

**Exemples :**

```typescript
// ✅ Interface uniquement pour les classes
interface IRepository {
    list(): Promise<Product[]>;
}

class ProductRepository implements IRepository {
    // ...
}

// ✅ Type pour les props, objets, etc.
type Product = {
    id: string;
    name: string;
};

type Props = {
    products: Product[];
};

// ✅ Enum pour les constantes
enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}
```

### Variables

-   **camelCase** pour variables et fonctions
-   **PascalCase** pour types / composants

### Fichiers

| Fichier                        | Type                      |
| ------------------------------ | ------------------------- |
| `ProductTable.tsx`             | Composant                 |
| `useProducts.ts`               | Hook React Query          |
| `useProductFilterStore.ts`     | Store Zustand             |
| `productRepositorySupabase.ts` | Repository infrastructure |

---

## 🧪 7. Tests

**Tests unitaires seulement pour :**

-   `domain`
-   `usecases`

**Tests UI :**

-   ❌ Pas de tests UI obligatoires pour les composants de pages
-   ✅ **Tests obligatoires** pour les composants réutilisables dans `presentation/components/ui`

---

## 🧰 8. Imports — Ordre et propreté

### Ordre recommandé

1. **Librairies externes** (React, Zustand, React Query…)
2. **Types / domain**
3. **Usecases**
4. **Infrastructure**
5. **Presentation** (components, hooks, stores)
6. **Styles ou SCSS modules**
7. **Imports relatifs**

### Règles

-   ✅ **Toujours supprimer** les imports non utilisés

---

## 🔧 9. Qualité & bonnes pratiques

-   ✅ **Nommer les fonctions** selon ce qu'elles font vraiment
-   ✅ **Préférer les fonctions pures**
-   ✅ **Découper les composants** trop longs
-   ✅ **Utiliser `async/await`** plutôt que `.then()`
-   ✅ **Toujours typer** les valeurs de retour des fonctions publiques
-   ✅ **Jamais ignorer une erreur réseau** (toujours au moins un `throw`)

---

## 📝 10. Commits

**Convention simple et claire :**

```
feat: ajoute le hook useProducts
fix: supprime erreur de mapping Produit
refactor: déplace stores Zustand
style: nettoie SCSS
docs: ajoute code_conventions.md
```

---

## 🏁 Conclusion

Cette documentation définit les conventions de style, **indépendantes de l'architecture**.

**Cursor doit appliquer systématiquement ces règles** lors de la génération ou la modification de fichiers.
