---
name: "i18n Refactor"
description: "Refactor existing code to use Resx using i18n Specialist"
agent: "i18n Specialist"
tags: ["i18n", "localization", "refactor", "legacy"]
---

# i18n Refactor

## Overview

Refactor existing code with hardcoded strings to use `react-native-localization` (Resx) using the **i18n Specialist** agent.

## Agent

**Use**: @i18n Specialist

**Important**: This agent is for **REFACTORING existing/legacy code** only. For **NEW code creation**, use **@UI Designer** which handles Resx directly.

**Distinction**:

- **i18n Specialist**: Refactors existing code with hardcoded strings (legacy code) ← **This command**
- **UI Designer**: Creates new code with Resx from the start (new code)

## Steps

1. **Verify Scope**

   - Confirm this is existing/legacy code (not new code)
   - If new code, use @UI Designer instead

2. **Detect Hardcoded Strings**

   - Scan file for hardcoded strings in UI components, messages, or alerts
   - Identify user-facing text that needs translation
   - Check accessibility labels and hints

3. **Check Existing Keys**

   - Check if matching translation key exists in `src/modules/localisation/lokalise/en.json`
   - Review existing key naming patterns

4. **Add Missing Keys**

   - If key missing, add new descriptive camelCase key to `en.json`
   - Use descriptive, semantic names (e.g. `connectDeviceError`, `languageInfoText`)
   - Group related keys with common prefixes
   - **Never modify** `fr.json`, `de.json`, or `es.json` (handled externally by Localize)

5. **Replace Strings**

   - Replace hardcoded strings with `Resx.keyName`
   - Ensure `import Resx from "modules/localisation"` is present
   - Handle dynamic content separately (keep text static, interpolate values)

6. **Verify Accessibility**
   - Ensure `accessibilityLabel` and `accessibilityHint` also use Resx
   - Verify all user-facing text uses Resx

## i18n Refactor Checklist

### Detection

- [ ] Verified this is existing/legacy code (not new code)
- [ ] Identified all hardcoded strings in UI components
- [ ] Identified hardcoded strings in messages and alerts
- [ ] Identified hardcoded strings in accessibility labels/hints

### Translation Keys

- [ ] Checked existing keys in `en.json`
- [ ] Added missing keys with descriptive camelCase names
- [ ] Grouped related keys with common prefixes
- [ ] Did not modify `fr.json`, `de.json`, or `es.json`

### Code Updates

- [ ] Replaced hardcoded strings with `Resx.keyName`
- [ ] Added `import Resx from "modules/localisation"` if missing
- [ ] Handled dynamic content separately (interpolation)
- [ ] Updated accessibility labels and hints to use Resx

### Verification

- [ ] All user-facing text uses Resx
- [ ] All referenced keys exist in `en.json`
- [ ] Accessibility text is translated
- [ ] No hardcoded strings remain

## Important Notes

- **ONLY for existing/legacy code**: This command is for refactoring old code. For new code, use @UI Designer.
- **Only edit en.json**: Never modify `fr.json`, `de.json`, or `es.json` - translations are handled externally via Localize platform.
- **Use camelCase**: Translation keys should use camelCase with descriptive names.
- **Group related keys**: Use common prefixes for related keys (e.g. `progressUpdatingText`, `progressLoadingText`).
- **Dynamic content**: Keep text static in Resx, interpolate values separately.

## Example

**Before**:

```typescript
<Text>Connect Device</Text>
<Text>Error: {errorMessage}</Text>
```

**After**:

```typescript
import Resx from "modules/localisation";

<Text>{Resx.connectDevice}</Text>
<Text>{Resx.connectDeviceError}: {errorMessage}</Text>
```

**en.json**:

```json
{
  "connectDevice": "Connect Device",
  "connectDeviceError": "Error"
}
```
