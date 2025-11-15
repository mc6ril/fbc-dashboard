---
name: "Security Review"
description: "Deep-dive security review using Security Agent with code fixes"
agent: "Security Agent"
tags: ["security", "review", "remediation", "code-fixes"]
---

# Security Review

## Overview

Perform a comprehensive security review of the current code using the **Security Agent** and provide specific remediation steps with code examples for each security issue identified.

## Agent

**use**: @Security Agent

The Security Agent performs a deep-dive manual review covering:

- Authentication & Authorization
- Input Validation & Sanitization
- Data Protection
- Mobile Platform Security (Android/iOS/React Native)
- Infrastructure & CI/CD Security

**Report Location**: Results are saved to `.cursor/reports/security/LATEST.md`

## Steps

1. **Authentication & Authorization**

   - Verify proper authentication mechanisms
   - Check authorization controls and permission systems
   - Review session management and token handling
   - Ensure secure password policies and storage (argon2/bcrypt)
   - Review refresh token security and rotation

2. **Input Validation & Sanitization**

   - Identify SQL injection vulnerabilities (SQLi/NoSQLi)
   - Check for XSS and CSRF attack vectors
   - Validate all user inputs and API parameters
   - Review file upload and processing security
   - Propose validation strategies (zod/yup/class-validator)

3. **Data Protection**

   - Ensure sensitive data encryption at rest and in transit
   - Check for data exposure in logs and error messages
   - Review API responses for information leakage
   - Verify proper secrets management (.env handling, vaults)
   - Review secure storage usage (keychain/keystore)

4. **Mobile Platform Security**

   - **Android**: Permissions review, ProGuard/R8 config, keystore management, network security config, deep linking security
   - **iOS**: Entitlements review, Info.plist security, keychain usage, App Transport Security, deep linking and universal links security
   - **React Native**: Native module security, bridge communication, secure storage usage

5. **Infrastructure & CI/CD Security**
   - Review dependency security and known vulnerabilities
   - Check HTTPS configuration and certificate pinning
   - Analyze CORS policies and security headers
   - Review environment variable and configuration security
   - Audit CI/CD pipeline security (secrets management, build artifacts)

## Security Review Checklist

### Authentication & Authorization

- [ ] Verified proper authentication mechanisms
- [ ] Checked authorization controls and permission systems
- [ ] Reviewed session management and token handling
- [ ] Ensured secure password policies and storage (argon2/bcrypt)
- [ ] Reviewed refresh token security and rotation

### Input Validation & Sanitization

- [ ] Identified SQL injection vulnerabilities (SQLi/NoSQLi)
- [ ] Checked for XSS and CSRF attack vectors
- [ ] Validated all user inputs and API parameters
- [ ] Reviewed file upload and processing security

### Data Protection

- [ ] Ensured sensitive data encryption at rest and in transit
- [ ] Checked for data exposure in logs and error messages
- [ ] Reviewed API responses for information leakage
- [ ] Verified proper secrets management

### Mobile Platform Security

- [ ] Reviewed Android permissions and ProGuard configuration
- [ ] Reviewed iOS entitlements and Info.plist security
- [ ] Verified secure storage usage (keychain/keystore)
- [ ] Checked React Native bridge communication security
- [ ] Reviewed native module security
- [ ] Validated deep linking and universal links security

### Infrastructure & CI/CD

- [ ] Reviewed dependency security and known vulnerabilities
- [ ] Checked HTTPS configuration and certificate pinning
- [ ] Analyzed CORS policies and security headers
- [ ] Reviewed CI/CD pipeline secrets management
