---
Generated: 2025-01-27 19:00:00
Report Type: mvp-deferred-decisions
---

# MVP - Décisions Différées et Optimisations Futures

Ce document liste les décisions prises dans le cadre du MVP (Minimum Viable Product) : les fonctionnalités, optimisations et améliorations que nous avons **choisi de ne pas implémenter maintenant** mais que nous voulons **garder en mémoire** pour une implémentation future.

## Objectif

Documenter les choix techniques et fonctionnels du MVP pour :

-   **Traçabilité** : Comprendre pourquoi certaines décisions ont été prises
-   **Planification** : Avoir une liste claire des optimisations futures
-   **Priorisation** : Réévaluer ces décisions quand le contexte change
-   **Onboarding** : Aider les nouveaux développeurs à comprendre les choix d'architecture

---

## Performance & Scalabilité

### 1. Filtrage et Pagination Côté Serveur (FBC-13)

**Statut:** ⏸️ **Différé**  
**Priorité:** 🔵 **Moyenne** (optimisation future)  
**Ticket:** FBC-13 - Activities Log

#### Situation Actuelle

-   **Implémentation:** Filtrage et pagination effectués en mémoire (côté client)
-   **Méthode:** `listActivitiesWithFilters()` et `listActivitiesPaginated()` récupèrent toutes les activités via `repo.list()`, puis filtrent/paginent en mémoire
-   **Performance:** Acceptable pour petits datasets (< 5,000 activités)

#### Pourquoi Différé

-   ✅ **YAGNI (You Aren't Gonna Need It)** : Pas de besoin immédiat
-   ✅ **Simplicité** : Solution simple à maintenir et déboguer
-   ✅ **MVP** : Fonctionne parfaitement pour le scope initial
-   ✅ **Architecture prête** : La structure permet une migration facile plus tard

#### Quand Optimiser

**Seuils d'alerte:**

-   📊 **Dataset > 5,000 activités** → Considérer l'optimisation
-   ⏱️ **Temps de chargement > 2 secondes** → Optimiser immédiatement
-   📈 **Croissance rapide** → Planifier l'optimisation proactivement

#### Comment Optimiser (Quand le Moment Viendra)

**Étapes d'implémentation:**

1. **Étendre le Port (`core/ports/activityRepository.ts`):**

    ```typescript
    interface ActivityRepository {
        // ... méthodes existantes

        listWithFilters(filters: { startDate?: string; endDate?: string; type?: ActivityType; productId?: ProductId }): Promise<Activity[]>;

        listPaginated(
            filters: {
                startDate?: string;
                endDate?: string;
                type?: ActivityType;
                productId?: ProductId;
            },
            pagination: {
                page: number;
                pageSize: number;
            }
        ): Promise<{
            activities: Activity[];
            total: number;
        }>;
    }
    ```

2. **Implémenter dans Supabase (`infrastructure/supabase/activityRepositorySupabase.ts`):**

    ```typescript
    listWithFilters: async (filters) => {
        let query = supabaseClient.from("activities").select();

        if (filters.startDate) {
            query = query.gte("date", filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte("date", filters.endDate);
        }
        if (filters.type) {
            query = query.eq("type", filters.type);
        }
        if (filters.productId) {
            query = query.eq("product_id", filters.productId);
        }

        const { data, error } = await query.order("date", { ascending: false });
        // ... error handling and mapping
    };
    ```

3. **Migrer les Usecases:**

    - Modifier `listActivitiesWithFilters()` pour utiliser `repo.listWithFilters()`
    - Modifier `listActivitiesPaginated()` pour utiliser `repo.listPaginated()`
    - Supprimer la logique de filtrage/pagination en mémoire

4. **Ajouter des Index Database:**
    ```sql
    CREATE INDEX idx_activities_date ON activities(date DESC);
    CREATE INDEX idx_activities_type ON activities(type);
    CREATE INDEX idx_activities_product_id ON activities(product_id);
    CREATE INDEX idx_activities_date_type ON activities(date DESC, type);
    ```

**Bénéfices attendus:**

-   ⚡ **Performance** : Requêtes SQL optimisées avec index
-   📉 **Bande passante** : Moins de données transférées
-   💾 **Mémoire** : Moins de données chargées en mémoire
-   🚀 **Scalabilité** : Support de datasets beaucoup plus grands

**Risques:**

-   ⚠️ **Complexité** : Plus de code à maintenir
-   ⚠️ **Tests** : Plus de cas de test à couvrir
-   ⚠️ **Migration** : Nécessite une migration des usecases existants

**Références:**

-   Code Review: `report/code-review/code-review-fbc-13-activities-log.md` (lignes 292-305)
-   Usecases: `src/core/usecases/activity.ts` (`listActivitiesWithFilters`, `listActivitiesPaginated`)
-   Repository: `src/infrastructure/supabase/activityRepositorySupabase.ts`

---

## Fonctionnalités

### 2. Export des Activités

**Statut:** ⏸️ **Différé**  
**Priorité:** 🟢 **Basse** (nice-to-have)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Permettre aux utilisateurs d'exporter les activités filtrées vers différents formats (CSV, Excel, PDF).

#### Pourquoi Différé

-   ✅ **Pas de besoin utilisateur identifié** dans le MVP
-   ✅ **Complexité** : Nécessite des bibliothèques d'export
-   ✅ **Scope MVP** : Focus sur la visualisation et le filtrage

#### Quand Implémenter

-   📋 **Demande utilisateur** : Quand les utilisateurs demandent cette fonctionnalité
-   📊 **Analyse de données** : Si besoin d'analyses externes devient fréquent

#### Comment Implémenter

-   Utiliser une bibliothèque comme `xlsx` ou `papaparse` pour CSV/Excel
-   Créer un usecase `exportActivities()` qui réutilise `listActivitiesWithFilters()`
-   Ajouter un bouton "Export" dans l'UI avec sélection de format

---

### 3. Tri Avancé des Activités

**Statut:** ⏸️ **Différé**  
**Priorité:** 🟢 **Basse** (nice-to-have)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Permettre aux utilisateurs de trier les activités par différentes colonnes (date, type, produit, quantité, montant) avec ordre ascendant/descendant.

#### Situation Actuelle

-   Tri fixe : Date descendante (plus récent en premier)
-   Pas de tri personnalisable par l'utilisateur

#### Pourquoi Différé

-   ✅ **Tri par défaut suffisant** : La plupart des cas d'usage nécessitent le tri par date
-   ✅ **Complexité UI** : Nécessite des contrôles de tri dans le tableau
-   ✅ **Scope MVP** : Focus sur le filtrage et la pagination

#### Quand Implémenter

-   📋 **Demande utilisateur** : Quand les utilisateurs demandent cette fonctionnalité
-   📊 **Cas d'usage identifiés** : Si des besoins de tri spécifiques émergent

#### Comment Implémenter

-   Ajouter un état de tri dans le store Zustand (`useActivityFiltersStore`)
-   Ajouter des contrôles de tri dans le composant `Table` (flèches cliquables)
-   Étendre les usecases pour accepter des paramètres de tri
-   Implémenter le tri côté serveur (si optimisation #1 est faite)

---

### 4. Vue Détaillée d'une Activité

**Statut:** ⏸️ **Différé**  
**Priorité:** 🟢 **Basse** (nice-to-have)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Permettre aux utilisateurs de cliquer sur une activité pour voir ses détails complets dans une modal ou une page dédiée.

#### Pourquoi Différé

-   ✅ **Informations déjà visibles** : Toutes les infos sont dans le tableau
-   ✅ **Pas de besoin identifié** : Pas de données supplémentaires à afficher
-   ✅ **Scope MVP** : Focus sur la liste et le filtrage

#### Quand Implémenter

-   📋 **Demande utilisateur** : Quand les utilisateurs demandent cette fonctionnalité
-   📊 **Données supplémentaires** : Si on ajoute des champs qui ne rentrent pas dans le tableau

---

## UX & Accessibilité

### 5. Loading Skeletons au lieu de Messages de Chargement

**Statut:** ⏸️ **Différé**  
**Priorité:** 🔵 **Moyenne** (amélioration UX)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Remplacer les messages de chargement textuels par des skeletons animés qui donnent une meilleure indication visuelle du contenu à venir.

#### Situation Actuelle

-   Message texte simple : "Loading..." affiché pendant le chargement

#### Pourquoi Différé

-   ✅ **Fonctionnel** : Les messages actuels fonctionnent
-   ✅ **Priorité** : Pas critique pour le MVP
-   ✅ **Complexité** : Nécessite de créer des composants skeleton

#### Quand Implémenter

-   🎨 **Amélioration UX** : Quand on veut améliorer l'expérience utilisateur
-   ⏱️ **Temps de chargement** : Si les temps de chargement deviennent perceptibles

#### Comment Implémenter

-   Créer un composant `TableSkeleton` dans `presentation/components/ui/`
-   Utiliser des rectangles animés pour simuler les lignes du tableau
-   Remplacer les messages de chargement dans `ActivitiesTable`

---

## Monitoring & Observabilité

### 6. Métriques de Performance

**Statut:** ⏸️ **Différé**  
**Priorité:** 🔵 **Moyenne** (monitoring)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Ajouter du logging et des métriques pour monitorer les performances des requêtes d'activités (temps d'exécution, nombre d'activités récupérées, etc.).

#### Pourquoi Différé

-   ✅ **Pas de problème identifié** : Pas de problèmes de performance actuellement
-   ✅ **Complexité** : Nécessite une infrastructure de monitoring
-   ✅ **Scope MVP** : Focus sur les fonctionnalités core

#### Quand Implémenter

-   📊 **Problèmes de performance** : Si on observe des lenteurs
-   🔍 **Debugging** : Si on a besoin de comprendre les problèmes de performance
-   📈 **Croissance** : Quand le dataset commence à grandir

#### Comment Implémenter

-   Ajouter des logs dans les usecases avec timing
-   Utiliser une solution de monitoring (Sentry, LogRocket, etc.)
-   Ajouter des métriques custom si nécessaire

---

## Architecture & Technique

### 7. Virtual Scrolling pour Grandes Listes

**Statut:** ⏸️ **Différé**  
**Priorité:** 🟢 **Basse** (optimisation avancée)  
**Ticket:** FBC-13 - Activities Log (non-implémenté)

#### Description

Implémenter le virtual scrolling pour afficher efficacement de très grandes listes d'activités sans impacter les performances du navigateur.

#### Pourquoi Différé

-   ✅ **Pagination suffisante** : La pagination actuelle résout le problème
-   ✅ **Complexité** : Nécessite une bibliothèque comme `react-window` ou `react-virtualized`
-   ✅ **Pas de besoin** : Pas de cas d'usage nécessitant l'affichage de milliers d'éléments

#### Quand Implémenter

-   📊 **Grandes listes** : Si on veut afficher plus de 100 éléments à la fois
-   ⚡ **Performance** : Si la pagination devient un problème UX

---

## Notes Générales

### Principes de Décision MVP

1. **YAGNI (You Aren't Gonna Need It)** : Ne pas implémenter ce dont on n'a pas besoin maintenant
2. **Simplicité** : Préférer les solutions simples qui fonctionnent
3. **Itération** : Améliorer progressivement basé sur les retours utilisateurs
4. **Mesure** : Optimiser seulement quand on a des métriques qui le justifient

### Révision de ce Document

Ce document devrait être révisé :

-   📅 **Trimestriellement** : Réévaluer les priorités
-   🎯 **Avant chaque sprint** : Vérifier si des éléments doivent être promus
-   📊 **Après analyse de données** : Si de nouveaux besoins émergent
-   🐛 **Après incidents** : Si des problèmes révèlent des besoins non couverts

### Comment Ajouter une Nouvelle Décision Différée

1. Ajouter une nouvelle section avec le format ci-dessus
2. Inclure : Statut, Priorité, Description, Pourquoi Différé, Quand Implémenter, Comment Implémenter
3. Référencer les tickets/PRs/Code Reviews pertinents
4. Mettre à jour la date de génération en en-tête

---

**Dernière mise à jour:** 2025-01-27  
**Prochaine révision prévue:** 2025-04-27
