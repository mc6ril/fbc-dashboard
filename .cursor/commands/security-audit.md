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
    - Generate comprehensive report at `report/security/security-audit-{timestamp}.md`
    - Include Executive Summary with traffic-light status
    - List top 10 actionable items
    - Provide dependency upgrade suggestions
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
