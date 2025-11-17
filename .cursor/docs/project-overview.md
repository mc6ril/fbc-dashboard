# 🧵 FBC Dashboard - Vue d'ensemble du projet

## Présentation

**FBC Dashboard** est une application web de suivi d'activité et de gestion d'inventaire pour **Atelier F.B.C**, une marque artisanale française spécialisée dans des accessoires textiles cousus main.

## À propos d'Atelier F.B.C

Atelier F.B.C est une entreprise artisanale qui crée des accessoires textiles faits main, en petites séries. Les créations sont organisées selon une structure en collections thématiques, chacune avec une identité forte.

## Les 3 piliers structurants

### 1. 🎨 Les Collections

Les créations sont organisées par **collections thématiques**, chacune avec une identité forte.

#### Collection actuelle : Ode à la Féminité

Composée de plusieurs **capsules**, chacune avec un univers propre :

-   **L'Assumée**
-   **L'Espiegle**
-   (Deux capsules restantes à venir)

Chaque capsule regroupe plusieurs produits (sac banane, pochette, trousse, etc.) dans un même motif / même tissu.

### 2. 👜 Les Types de Produits

Tous les produits sont faits main, en petites séries :

-   **Sac banane** (taille unique, avec réglage)
-   **Pochette ordinateur 13' / 14''**
-   **Trousse de toilette carrée**
-   **Pochette à volants**
-   **Trousse zippée classique**
-   **Accessoires divers** (scrunchies, petite maroquinerie textile…)

#### Caractéristiques de chaque produit

Chaque produit possède :

-   Une **fiche produit** (nom, capsule, collection, dimensions, matières)
-   Un **SKU interne**
-   Un **temps de confection** variable selon la complexité
-   Un **prix** variable selon la complexité

### 3. 🧮 Suivi d'activité & Inventaire (objectif principal)

L'application a pour but de **centraliser tout le suivi métier** de l'atelier.

## Fonctionnalités prévues

### Saisie des données

-   **Saisie des créations**

    -   Date
    -   Produit
    -   Capsule
    -   Quantité
    -   Variantes

-   **Saisie des ventes**
    -   Produit
    -   Plateforme
    -   Date
    -   Prix

### Gestion du stock

-   **Stock automatique** = Créations − Ventes
-   Suivi en temps réel de l'inventaire

### Tableau de bord

Le tableau de bord permet de visualiser :

-   **Nombre d'articles créés**
-   **Nombre d'articles vendus**
-   **Bénéfices réels**
-   **Temps de production**
-   **Analyse par collection / capsule / produit**

## Architecture technique

L'application est construite avec :

-   **Next.js** (App Router) pour le framework web
-   **React Query** pour la gestion des données
-   **Supabase** pour l'authentification et la base de données
-   **Clean Architecture** pour la séparation des responsabilités
-   **TypeScript** pour la sécurité de type
-   **SCSS** pour le styling

## Structure de l'application

L'application suit une architecture Clean Architecture stricte :

-   **Domain** (`core/domain/`) : Modèles métier purs (Product, StockMovement, Activity, etc.)
-   **Usecases** (`core/usecases/`) : Logique métier orchestrée
-   **Ports** (`core/ports/`) : Interfaces de repositories
-   **Infrastructure** (`infrastructure/`) : Implémentations concrètes (Supabase)
-   **Presentation** (`presentation/`) : Composants UI, hooks React Query, stores Zustand

## Objectifs métier

1. **Centraliser** toutes les données de production et de vente
2. **Automatiser** le calcul du stock
3. **Visualiser** les performances par collection, capsule et produit
4. **Optimiser** la production grâce aux analyses de temps et de rentabilité
5. **Faciliter** la gestion quotidienne de l'atelier

## État actuel du projet

Le projet est en cours de développement. Les modèles de domaine de base (Product, StockMovement, Activity) sont définis et testés. L'authentification est en place. Les fonctionnalités de saisie et de visualisation sont en cours d'implémentation.
