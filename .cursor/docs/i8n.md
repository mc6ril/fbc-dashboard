# i18n Translation System

This directory contains the internationalization (i18n) infrastructure for the FBC Dashboard application. The system uses `next-intl` for translation management and provides type-safe translation keys and utilities.

## Structure

-   `config.ts` - i18n configuration and locale settings
-   `types.ts` - TypeScript type definitions for locales and translation keys
-   `useTranslation.ts` - React hook for accessing translations
-   `utils.ts` - General utility functions for translation keys
-   `dynamic.ts` - Utilities for dynamic translations (conditional, interpolation, pluralization)
-   `messages/` - Translation files organized by locale
    -   `fr.json` - French translations (default locale)

## Usage

### Basic Translation

```tsx
import { useTranslation } from "@/shared/i18n";

const MyComponent = () => {
    const t = useTranslation("common");

    return <button>{t("loading")}</button>; // "Chargement en cours..."
};
```

### Conditional Translations

For activity type-specific labels:

```tsx
import { useTranslation } from "@/shared/i18n";
import { getActivityQuantityLabelKey, getActivityHelperTextKey } from "@/shared/i18n/dynamic";
import { ActivityType } from "@/core/domain/activity";

const ActivityForm = () => {
    const t = useTranslation("forms.activity.fields.quantity");
    const activityType = ActivityType.SALE;

    // Get label key based on activity type
    const labelKey = getActivityQuantityLabelKey(activityType);
    const label = t(labelKey); // "Quantité vendue" for SALE, "Quantité" for others

    // Get helper text key based on activity type
    const helperKey = getActivityHelperTextKey(activityType);
    const helperText = helperKey ? t(helperKey) : undefined;

    return <Input label={label} helperText={helperText} />;
};
```

### Interpolation

For translations with variables:

```tsx
import { useTranslation } from "@/shared/i18n";
import { createInterpolatedTranslation } from "@/shared/i18n/dynamic";

const MyComponent = () => {
    const t = useTranslation("common");
    const translate = createInterpolatedTranslation(t);

    // Translation key: "welcome": "Bienvenue, {name}!"
    const message = translate("welcome", { name: "John" }); // "Bienvenue, John!"

    return <p>{message}</p>;
};
```

### Pluralization

For translations with plural forms:

```tsx
import { useTranslation } from "@/shared/i18n";
import { createPluralKey } from "@/shared/i18n/dynamic";

const MyComponent = ({ count }: { count: number }) => {
    const t = useTranslation("common");

    // Translation keys:
    // "items": "{count} article"
    // "items_other": "{count} articles"
    const key = createPluralKey("items", count);
    const message = t(key, { count }); // "1 article" or "5 articles"

    return <p>{message}</p>;
};
```

### Generic Conditional Translations

For simple boolean-based conditionals:

```tsx
import { useTranslation } from "@/shared/i18n";
import { getConditionalTranslation } from "@/shared/i18n/dynamic";

const MyComponent = ({ isSale }: { isSale: boolean }) => {
    const t = useTranslation("forms.activity.fields.quantity");

    const labelKey = getConditionalTranslation(
        isSale,
        "label_sale", // "Quantité vendue"
        "label" // "Quantité"
    );
    const label = t(labelKey);

    return <Input label={label} />;
};
```

## Translation Key Structure

Translation keys are organized by domain using dot notation:

-   `common.*` - Common UI messages (loading, buttons, etc.)
-   `forms.activity.*` - Activity form translations
-   `forms.product.*` - Product form translations
-   `errors.*` - Error messages
-   `pages.*` - Page-specific translations
-   `empty.*` - Empty state messages

## Type Safety

All translation keys are type-safe. TypeScript will autocomplete available keys and catch invalid keys at compile time:

```tsx
const t = useTranslation("common");
t("loading"); // ✅ Valid
t("invalid_key"); // ❌ TypeScript error
```

## Dynamic Translation Patterns

### Activity Type-Specific Translations

Use `getActivityQuantityLabelKey()` and `getActivityHelperTextKey()` for activity type-specific labels and helper texts.

### Conditional Translations

Use `getConditionalTranslation()` for simple boolean-based conditionals, or `getActivityTypeTranslation()` for activity type-based conditionals.

### Interpolation

Use `createInterpolatedTranslation()` wrapper for type-safe interpolation, or pass values directly to the translation function:

```tsx
t("welcome", { name: "John" });
```

### Pluralization

Use `createPluralKey()` to construct pluralized keys, or use ICU message format directly in translation files:

```json
{
    "items": "{count, plural, one {# article} other {# articles}}"
}
```

## Best Practices

1. **Use namespaces**: Always use the appropriate namespace when calling `useTranslation()` to improve performance and organization
2. **Type safety**: Leverage TypeScript types for translation keys - avoid string concatenation for keys
3. **Dynamic translations**: Use helper functions from `dynamic.ts` for conditional and dynamic translations
4. **Consistent naming**: Follow the existing naming conventions (dot notation, camelCase)
5. **Documentation**: Document complex translation patterns in code comments

## Translation Key Naming Conventions

### Structure

Translation keys follow a hierarchical dot notation structure organized by domain:

-   **Namespace** (first level): Domain or feature area

    -   `common.*` - Common UI messages (loading, buttons, etc.)
    -   `forms.*` - Form-related translations
    -   `errors.*` - Error messages
    -   `pages.*` - Page-specific translations
    -   `empty.*` - Empty state messages
    -   `ui.*` - UI component-specific translations
    -   `dashboard.*` - Dashboard-specific translations

-   **Sub-namespace** (second level): Feature or component

    -   `forms.activity.*` - Activity form translations
    -   `forms.product.*` - Product form translations
    -   `errors.dashboard.*` - Dashboard error messages
    -   `pages.catalog.*` - Catalog page translations

-   **Key** (final level): Specific message identifier
    -   Use camelCase: `label`, `helperText`, `placeholder`
    -   Use descriptive names: `addProduct`, `editActivity`
    -   Use suffixes for variations: `label_sale`, `helper_creation`

### Examples

```json
{
    "common": {
        "loading": "Chargement en cours...",
        "cancel": "Annuler"
    },
    "forms": {
        "activity": {
            "fields": {
                "quantity": {
                    "label": "Quantité",
                    "label_sale": "Quantité vendue",
                    "helper_creation": "Quantité ajoutée au stock"
                }
            }
        }
    },
    "errors": {
        "dashboard": {
            "sales": "Erreur lors du chargement des données de ventes..."
        }
    }
}
```

### Naming Guidelines

1. **Be descriptive**: Use clear, self-documenting key names
2. **Group logically**: Keep related keys together in the same namespace
3. **Use consistent suffixes**: `_sale`, `_creation`, `_error`, etc. for variations
4. **Avoid abbreviations**: Prefer `quantity` over `qty`, `product` over `prod`
5. **Use camelCase**: All keys use camelCase (e.g., `helperText`, `addProduct`)
6. **Namespace depth**: Keep namespaces to 3-4 levels maximum for readability

## Migration from Hardcoded Strings

### Step-by-Step Migration Guide

#### 1. Identify Hardcoded Strings

Search for hardcoded French strings in your component:

```tsx
// ❌ Before
<button>Annuler</button>
<label>Quantité</label>
<p>Erreur lors du chargement</p>
```

#### 2. Add Translation Keys

Add appropriate keys to `src/shared/i18n/messages/fr.json`:

```json
{
    "common": {
        "cancel": "Annuler"
    },
    "forms": {
        "activity": {
            "fields": {
                "quantity": {
                    "label": "Quantité"
                }
            }
        }
    },
    "errors": {
        "dashboard": {
            "loading": "Erreur lors du chargement"
        }
    }
}
```

#### 3. Replace with useTranslation Hook

Replace hardcoded strings with translation calls:

```tsx
// ✅ After
import { useTranslation } from "@/shared/i18n";

const MyComponent = () => {
    const tCommon = useTranslation("common");
    const tActivity = useTranslation("forms.activity.fields.quantity");
    const tErrors = useTranslation("errors.dashboard");

    return (
        <>
            <button>{tCommon("cancel")}</button>
            <label>{tActivity("label")}</label>
            <p>{tErrors("loading")}</p>
        </>
    );
};
```

#### 4. Handle Dynamic Translations

For conditional or dynamic strings, use helper functions:

```tsx
import { getActivityQuantityLabelKey } from "@/shared/i18n/dynamic";

const ActivityForm = ({ activityType }: { activityType: ActivityType }) => {
    const t = useTranslation("forms.activity.fields.quantity");

    // Dynamic label based on activity type
    const labelKey = getActivityQuantityLabelKey(activityType);
    const label = t(labelKey);

    return <Input label={label} />;
};
```

#### 5. Update Tests

Update tests to use translation keys or mock translations:

```tsx
// Test example
import { useTranslation } from "@/shared/i18n";

jest.mock("@/shared/i18n", () => ({
    useTranslation: () => (key: string) => key, // Return key as value for tests
}));
```

### Migration Checklist

-   [ ] Identify all hardcoded user-facing strings
-   [ ] Add translation keys to `messages/fr.json` following naming conventions
-   [ ] Replace hardcoded strings with `useTranslation()` calls
-   [ ] Use dynamic translation utilities for conditional strings
-   [ ] Update ARIA labels to use i18n
-   [ ] Update tests to use translation keys or mocks
-   [ ] Verify no hardcoded strings remain
-   [ ] Test component functionality

### Deprecated Constants

The file `src/shared/constants/messages.ts` is deprecated. All constants have been migrated to i18n keys. Use `useTranslation()` hook directly instead:

```tsx
// ❌ Deprecated
import { LOADING_MESSAGE } from "@/shared/constants/messages";
const message = LOADING_MESSAGE; // This is just a key string

// ✅ Recommended
import { useTranslation } from "@/shared/i18n";
const t = useTranslation("common");
const message = t("loading"); // This is the actual translated string
```
