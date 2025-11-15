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

- Dependency vulnerability checks
- Secret detection
- Static code analysis (SAST)
- Native platform security (Android/iOS)
- CI/CD pipeline security

**Report Location**: Results are saved to `.cursor/reports/security/LATEST.md`

## Steps

1. **Recon Phase**

   - Auto-detect package manager (yarn/npm/pnpm)
   - Detect React Native version and native platforms
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

5. **Native Platform Security**

   - **Android**: Review permissions, ProGuard config, keystores
   - **iOS**: Review entitlements, Info.plist, keychain usage
   - **React Native**: Review native module security, bridge communication

6. **Infrastructure Security**

   - Review CI/CD pipelines (bitbucket-pipelines.yml, codemagic.yaml)
   - Check environment variable handling
   - Audit network security configs

7. **Report Generation**
   - Generate comprehensive report at `.cursor/reports/security/LATEST.md`
   - Include Executive Summary with traffic-light status
   - List top 10 actionable items
   - Provide dependency upgrade suggestions

## Security Checklist

- [ ] Dependencies updated and secure
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Authentication secure
- [ ] Authorization properly configured
