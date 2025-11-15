# 📁 Dossier .cursor — Configuration Cursor AI

Ce dossier contient toute la configuration pour Cursor AI afin de garantir la cohérence du code selon les règles du projet **fbc-dashboard**.

---

## 📋 Structure

```
.cursor/
├── agents/          # Agents spécialisés pour différentes tâches
├── commands/        # Commandes réutilisables (slash commands)
├── docs/            # Documentation de référence (architecture, conventions, etc.)
├── prompts/         # Prompts réutilisables pour guider l'IA
├── rules/           # Règles strictes appliquées automatiquement
├── settings.json    # Configuration Cursor (référence les rules)
└── README.md        # Ce fichier
```

---

## 🎯 Agents (`agents/`)

Les agents sont des assistants spécialisés pour différentes tâches. Chaque agent a un rôle précis et des playbooks structurés.

### Liste des Agents

| Agent                      | Rôle                                      | Quand l'utiliser                |
| -------------------------- | ----------------------------------------- | ------------------------------- |
| **Architecture-Aware Dev** | Développement suivant Clean Architecture  | Implémenter des fonctionnalités |
| **Architecture Guardian**  | Vérification de conformité architecturale | Revues de code, plans           |
| **Unit Test Coach**        | Génération de tests unitaires (TDD)       | Avant l'implémentation          |
| **QA & Test Coach**        | Plans de test, scénarios e2e, A11y        | Après l'implémentation          |
| **PM Agent**               | Planification de tickets                  | Créer un plan d'implémentation  |
| **UI Designer**            | Création de composants UI depuis designs  | Intégrer des maquettes Figma    |
| **Security Agent**         | Audit et revue de sécurité                | Vérification de sécurité        |
| **Jira Ticket Generator**  | Génération de tickets Jira                | Créer des tickets structurés    |

### Utilisation

Pour utiliser un agent, référencez-le dans un prompt ou utilisez une commande qui l'emploie :

```markdown
@Architecture-Aware Dev implement feature X
```

---

## ⚡ Commands (`commands/`)

Les commands sont des raccourcis (slash commands) pour des tâches répétitives.

### Liste des Commands Principales

| Command                | Agent                  | Description                                      |
| ---------------------- | ---------------------- | ------------------------------------------------ |
| `/pm-plan-from-ticket` | PM Agent               | Génère un plan d'implémentation depuis un ticket |
| `/generate-tests`      | Unit Test Coach        | Génère des tests unitaires (TDD)                 |
| `/code-review`         | Architecture Guardian  | Revue de code complète                           |
| `/architecture-review` | Architecture Guardian  | Vérification de conformité architecturale        |
| `/ui-from-design`      | UI Designer            | Crée des composants UI depuis une maquette       |
| `/security-audit`      | Security Agent         | Audit de sécurité automatisé                     |
| `/refactor-code`       | Architecture-Aware Dev | Refactorisation suivant les règles               |

### Utilisation

Dans Cursor, utilisez le préfixe `/` suivi du nom de la commande :

```
/pm-plan-from-ticket
```

---

## 📝 Prompts (`prompts/`)

Les prompts sont des templates réutilisables pour guider l'IA.

### Liste des Prompts

| Prompt                          | Description                                 |
| ------------------------------- | ------------------------------------------- |
| `apply-project-rules.mdc`       | Vérifier la conformité aux règles du projet |
| `ask-before-coding.mdc`         | Discuter une approche avant implémentation  |
| `explain-this-ticket.mdc`       | Analyser un ticket en détail                |
| `explain-file.mdc`              | Expliquer le rôle d'un fichier              |
| `fix-bug.mdc`                   | Guide pour corriger un bug simple           |
| `review-pr.mdc`                 | Revue de Pull Request                       |
| `speak-as-senior-architect.mdc` | Guidance architecturale haut niveau         |
| `ui-component-from-design.mdc`  | Créer un composant UI depuis un design      |

### Utilisation

Référencez un prompt dans votre message à l'IA :

```markdown
@explain-this-ticket.mdc [contenu du ticket]
```

---

## 📐 Rules (`rules/`)

Les rules sont des règles strictes appliquées automatiquement par Cursor. Elles sont référencées dans `.cursor/settings.json`.

### Règles Actives

| Rule                           | Domaine       | Description                                            |
| ------------------------------ | ------------- | ------------------------------------------------------ |
| `clean_architecture.mdc`       | Architecture  | Clean Architecture stricte avec séparation des couches |
| `code-convention.mdc`          | Qualité       | Conventions de code (TypeScript, SCSS, React)          |
| `contextual-comments.mdc`      | Documentation | Documentation complète avec contexte métier            |
| `performance-optimization.mdc` | Performance   | Optimisations React/Next.js                            |
| `testing-patterns.mdc`         | Tests         | Patterns de test unitaire (Jest)                       |
| `accessibility.mdc`            | UI            | Accessibilité WCAG 2.1 AA                              |
| `component-structure.mdc`      | UI            | Structure des composants UI                            |

### Ajout d'une Nouvelle Rule

1. Créer le fichier dans `rules/` avec le bon sous-dossier
2. Ajouter le frontmatter YAML avec `alwaysApply: true`
3. Référencer le fichier dans `.cursor/settings.json`

Exemple :

```yaml
---
alwaysApply: true
name: "Nom de la Rule"
description: "Description courte"
---
```

---

## 📚 Documentation (`docs/`)

Documentation de référence pour comprendre le projet.

| Document             | Contenu                                 |
| -------------------- | --------------------------------------- |
| `architecture.md`    | Clean Architecture, structure du projet |
| `code-convention.md` | Conventions de code détaillées          |
| `testing.md`         | Guide de tests avec exemples            |
| `libraries.md`       | Documentation des librairies utilisées  |

---

## ⚙️ Configuration (`settings.json`)

Ce fichier référence toutes les rules qui doivent être appliquées automatiquement.

**Ne pas modifier manuellement** sauf pour ajouter une nouvelle rule.

---

## 🔄 Workflow Recommandé

### 1. Créer une Feature

1. **Analyser le ticket** : `@explain-this-ticket.mdc`
2. **Générer le plan** : `/pm-plan-from-ticket`
3. **Définir les tests** : `/generate-tests` (TDD)
4. **Implémenter** : `@Architecture-Aware Dev`
5. **Vérifier** : `/architecture-review`

### 2. Corriger un Bug

1. **Analyser** : `@explain-file.mdc` (fichier concerné)
2. **Corriger** : `@fix-bug.mdc` ou `/debug-issue`
3. **Vérifier** : `/code-review`

### 3. Intégrer un Design

1. **Créer les composants** : `/ui-from-design`
2. **Vérifier l'accessibilité** : Vérification automatique via rules
3. **Intégrer** : Utiliser les composants dans les pages

---

## 📖 Ressources

-   [Documentation Cursor](https://docs.cursor.com)
-   [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [React Query Docs](https://tanstack.com/query/latest)
-   [Next.js Docs](https://nextjs.org/docs)

---

## 🛠️ Maintenance

### Ajout d'un Nouvel Agent

1. Créer le fichier `.yaml` dans `agents/`
2. Définir `name`, `description`, `goals`, `instructions`, `playbooks`
3. Créer une commande associée dans `commands/` si nécessaire

### Modification d'une Rule

1. Modifier le fichier `.mdc` dans `rules/`
2. Vérifier que les agents et commands sont alignés
3. Tester avec un cas réel

### Ajout d'une Commande

1. Créer le fichier `.md` dans `commands/`
2. Référencer l'agent approprié
3. Documenter l'utilisation

---

## ✅ Checklist de Conformité

Avant de soumettre du code, vérifier :

-   [ ] Clean Architecture respectée
-   [ ] React Query pour server state, Zustand pour UI state
-   [ ] SCSS variables utilisées (pas de valeurs hardcodées)
-   [ ] Accessibilité WCAG 2.1 AA
-   [ ] Tests unitaires pour domain/usecases
-   [ ] Documentation JSDoc complète
-   [ ] Pas de logique métier dans UI
-   [ ] Pas d'appel Supabase direct depuis UI

Utiliser `/code-review` pour une vérification automatique.

---

## 📞 Support

Pour toute question ou amélioration de cette configuration :

1. Vérifier la documentation existante
2. Consulter les exemples dans les fichiers
3. Utiliser `/architecture-review` pour valider les changements

---

**Dernière mise à jour** : 2025-01-27
