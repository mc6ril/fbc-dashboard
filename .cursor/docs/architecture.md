# 🏗️ Clean Architecture — Atelier Dashboard

## 📌 Principes fondamentaux

Ce projet suit une **Clean Architecture stricte**.

L'objectif est de séparer clairement les responsabilités :

- **Domain** → règles métier pures, types et logique sans dépendance
- **Usecases (Application)** → logique métier orchestrant les repositories
- **Infrastructure** → accès aux données (Supabase), implémentations concrètes
- **Presentation** → UI Next.js, SCSS, state-management (Zustand), data-fetching (React Query)

### Règle d'or

**Aucune logique métier ne doit se trouver dans la UI ou dans l'infrastructure.**

### Indépendance des couches

Cursor doit respecter l'indépendance des couches :

- La UI n'appelle **jamais** Supabase directement
- La UI appelle les hooks React Query, qui eux exécutent des usecases
- Les usecases utilisent les ports pour contacter la base
- Les ports ont plusieurs implémentations possibles
- Les implémentations concrètes (Supabase) sont dans `infrastructure/`

---

## 🧩 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── stocks/
│   │   └── page.tsx
│   └── products/
│       └── [id]/
│           └── page.tsx
│
├── core/                   # Cœur métier (indépendant)
│   ├── domain/            # Entités métier + règles pures
│   ├── usecases/          # Cas d'usage (fichiers simples)
│   └── ports/             # Interfaces des repositories
│
├── infrastructure/         # Implémentations concrètes
│   └── supabase/          # Implémentations concrètes des ports
│       ├── client.ts
│       ├── productRepositorySupabase.ts
│       ├── stockMovementRepositorySupabase.ts
│       └── utils/
│
├── presentation/           # Couche présentation
│   ├── components/        # Composants UI purs
│   ├── layouts/
│   ├── stores/            # Zustand (state UI global)
│   ├── hooks/             # Hooks React Query
│   └── providers/         # QueryClientProvider, autres providers
│
├── shared/                # Code partagé entre les couches
│   └── a11y/              # Accessibilité (utilitaires, constantes, helpers)
│
└── styles/                # Styles globaux
    ├── global.scss
    ├── variables/
    ├── components/
    └── layout/
```

---

## 🧱 Règles : ce que Cursor doit respecter

### 1. Domain (`core/domain`)

**Contient :**
- Types / interfaces métiers (Product, StockMovement)
- Règles métier pures (ex: `isLowStock(product)`)

**Ne doit jamais importer :**
- ❌ Supabase
- ❌ React
- ❌ Zustand
- ❌ React Query
- ❌ Next.js

**Pur TypeScript uniquement.**

---

### 2. Usecases (`core/usecases`)

**Caractéristiques :**
- Chaque usecase est une fonction pure orchestrant la logique métier
- Elle prend en paramètre des ports (repositories)
- Elle retourne des données du domaine

**Ne doit pas connaître :**
- ❌ Supabase
- ❌ React
- ❌ Zustand

**Exemple de structure :**

```typescript
export async function listProducts(repo: ProductRepository) {
  return repo.list();
}
```

---

### 3. Ports (`core/ports`)

**Rôle :**
- Définissent les interfaces des repositories
- Exemple : `ProductRepository`, `StockMovementRepository`
- Ce sont les contrats que l'infrastructure doit respecter

---

### 4. Infrastructure (`infrastructure/`)

**Contient :**
- Les implémentations concrètes des ports
- Supabase
- Adaptateurs
- Mappers

**Peut importer :**
- ✅ Supabase
- ✅ Fetch
- ✅ Des libs externes

**Ne doit jamais importer :**
- ❌ La UI
- ❌ Zustand

**Exemple :**

```typescript
export const productRepositorySupabase: ProductRepository = {
  list: async () => {
    // ...supabase.from("products")...
  }
};
```

---

### 5. Presentation (UI Next + React)

#### 5.1. Components (`presentation/components`)

**Caractéristiques :**
- Composants UI purs
- Pas de logique métier
- Pas d'appels Supabase
- Reçoivent les données déjà prêtes via props

#### 5.2. Hooks (`presentation/hooks`)

**Rôle :**
- Hooks React Query
- Appellent les usecases
- Fournissent : `data`, `isLoading`, `error`
- Ne contiennent pas de logique métier → juste orchestrent les usecases

**Structure conseillée :**

```typescript
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(productRepositorySupabase),
  });
}
```

#### 5.3. Stores Zustand (`presentation/stores`)

**Contient uniquement le state UI :**
- Filtres
- Modales
- Catégorie sélectionnée
- État du drawer

**Ne doit jamais contenir de logique métier.**

#### 5.4. Providers (`presentation/providers`)

**Contient :**
- ReactQueryProvider
- Providers globaux de l'app

---

## ⚡ Modules utilisés dans le projet

- **Next.js** (App Router)
- **SCSS** (global.scss + modules SCSS si nécessaire)
- **Supabase** → backend auto-géré (pas de backend Node)
- **React Query** (TanStack Query) → data fetching & cache
- **Zustand** → state UI global léger
- **TypeScript strict**
- **Clean Architecture** (Core / Infrastructure / Presentation)

---

## 🧪 Règles de génération de code pour Cursor

### ✔️ Cursor doit :

1. Créer les fichiers dans les bons dossiers selon leur rôle
2. Respecter les couches :
   - Un usecase ne doit pas importer Supabase
   - Un composant UI ne doit pas appeler Supabase directement
   - Une store Zustand ne doit pas contenir de logique métier
   - Un hook React Query doit appeler un usecase, pas directement l'infrastructure
3. Créer des types propres dans le domain

### ❌ Cursor ne doit jamais :

1. Mélanger UI et logique métier
2. Mettre du code Supabase dans `/core/`
3. Mettre des appels réseau dans les composants React
4. Mettre de la logique métier dans Zustand
5. Appeler directement Supabase depuis la UI
6. Faire des imports transversaux interdits (ex: infra → app)

---

## 📚 Exemple de flux complet (référence pour Cursor)

```
UI (Page Next)
    ↓ appelle
Hook React Query (useProducts)
    ↓ appelle
Usecase (listProducts)
    ↓ appelle
Repository (productRepositorySupabase)
    ↓ appelle
Supabase (infrastructure)
```

**Toujours dans ce sens. Jamais l'inverse.**
