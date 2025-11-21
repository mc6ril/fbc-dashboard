---
name: "Security Audit"
description: "Run automated security scans using Security Agent"
agent: "Security Agent"
tags: ["security", "audit", "vulnerabilities", "dependencies"]
---

# Security Audit

## Overview

Comprehensive security review to identify and fix vulnerabilities in the codebase using the **Security Agent**.

## Agent

**Use**: @Security Agent

The Security Agent performs automated security scans including:

-   Dependency vulnerability checks
-   Secret detection
-   Static code analysis (SAST)
-   Next.js security configuration
-   Supabase security
-   CI/CD pipeline security

**Report Location**: Results are saved to `report/security/security-audit-{timestamp}.md` (timestamp format: YYYY-MM-DD-HHMMSS)

## Steps

1. **Recon Phase**

    - Auto-detect package manager (yarn/npm/pnpm)
    - Detect Next.js version and configuration
    - Build target map for scanning

2. **Dependency Audit**

    - Run `yarn npm audit --all` (or npm/pnpm equivalent)
    - Check for known vulnerabilities
    - Identify outdated packages
    - Review third-party dependencies

3. **Secret Detection**

    - Run gitleaks and trufflehog scans
    - Detect hardcoded secrets, API keys, tokens
    - Check for exposed credentials

4. **Static Code Analysis**

    - Run ESLint security plugins
    - Check for common vulnerabilities (XSS, SQLi, etc.)
    - Review authentication/authorization patterns

5. **Next.js Security**

    - Review environment variables handling
    - Check API routes security
    - Review middleware configuration
    - Verify security headers

6. **Supabase Security**

    - Review RLS policies
    - Check API keys management
    - Review authentication configuration

7. **Infrastructure Security**

    - Review CI/CD pipelines
    - Check environment variable handling
    - Audit network security configs

8. **Report Generation**
    - Generate comprehensive report at `report/security/security-audit-{timestamp}.md` using standardized template
    - Include Title, Description (1-2 sentences), Status (✅ OK pour merge | ⚠️ Refused | 🔴 Blocked)
    - List alerts ONLY if security issues are found, grouped by severity (🔴 High Risk, ⚠️ Medium Risk, ℹ️ Low Risk)
    - For each alert: file:line (if applicable), description, recommendation
    - If no issues found: "No vulnerabilities detected. The code respects the security standards."
    - Always use english in your reports
    - Timestamp format: YYYY-MM-DD-HHMMSS

## Security Checklist

-   [ ] Dependencies updated and secure
-   [ ] No hardcoded secrets
-   [ ] Input validation implemented
-   [ ] Authentication secure
-   [ ] Authorization properly configured
-   [ ] Environment variables properly managed
-   [ ] Next.js security headers configured
-   [ ] Supabase RLS policies reviewed

## Output Format

The Security Agent uses a standardized template:

```
# Security Audit Report

**Description:** Brief 1-2 sentence summary of the security audit scope and findings.

**Status:** ✅ OK for merge | ⚠️ Refused | 🔴 Blocked

## Alertes

{ONLY_LIST_ALERTS_IF_SECURITY_ISSUES_FOUND}

### 🔴 High Risk
- **Issue:** {title} - **Location:** `file:line` - **Recommandation:** {fix_or_action}

### ⚠️ Medium Risk
- **Issue:** {title} - **Location:** `file:line` - **Recommandation:** {fix_or_action}

### ℹ️ Low Risk
- **Issue:** {title} - **Location:** `file:line` - **Recommandation:** {fix_or_action}

{IF_NO_ISSUES:}
No vulnerabilities detected. The code respects the security standards.
```

**Important:** Alerts are only listed if security issues are found. If the code is secure, the report will clearly state that no vulnerabilities were detected.
