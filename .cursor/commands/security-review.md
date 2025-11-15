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

**Use**: @Security Agent

The Security Agent performs a deep-dive manual review covering:

-   Authentication & Authorization
-   Input Validation & Sanitization
-   Data Protection
-   Next.js Security
-   Supabase Security
-   Infrastructure & CI/CD Security

**Report Location**: Results are saved to `report/security/security-review-{timestamp}.md` (timestamp format: YYYY-MM-DD-HHMMSS)

## Steps

1. **Authentication & Authorization**

    - Verify proper authentication mechanisms
    - Check authorization controls and permission systems
    - Review session management and token handling
    - Ensure secure password policies and storage
    - Review refresh token security and rotation

2. **Input Validation & Sanitization**

    - Identify SQL injection vulnerabilities (SQLi/NoSQLi)
    - Check for XSS and CSRF attack vectors
    - Validate all user inputs and API parameters
    - Review file upload and processing security
    - Propose validation strategies (zod/yup)

3. **Data Protection**

    - Ensure sensitive data encryption at rest and in transit
    - Check for data exposure in logs and error messages
    - Review API responses for information leakage
    - Verify proper secrets management (.env handling, vaults)

4. **Next.js Security**

    - Environment variables handling
    - API routes security
    - Middleware security
    - Security headers (CSP, etc.)

5. **Supabase Security**

    - RLS policies review
    - API keys management
    - Authentication flows
    - Data access patterns

6. **Infrastructure & CI/CD Security**
    - Review dependency security and known vulnerabilities
    - Check HTTPS configuration
    - Analyze CORS policies and security headers
    - Review environment variable and configuration security
    - Audit CI/CD pipeline security (secrets management, build artifacts)

## Security Review Checklist

### Authentication & Authorization

-   [ ] Verified proper authentication mechanisms
-   [ ] Checked authorization controls and permission systems
-   [ ] Reviewed session management and token handling
-   [ ] Ensured secure password policies and storage
-   [ ] Reviewed refresh token security and rotation

### Input Validation & Sanitization

-   [ ] Identified SQL injection vulnerabilities (SQLi/NoSQLi)
-   [ ] Checked for XSS and CSRF attack vectors
-   [ ] Validated all user inputs and API parameters
-   [ ] Reviewed file upload and processing security

### Data Protection

-   [ ] Ensured sensitive data encryption at rest and in transit
-   [ ] Checked for data exposure in logs and error messages
-   [ ] Reviewed API responses for information leakage
-   [ ] Verified proper secrets management

### Next.js Security

-   [ ] Reviewed environment variables handling
-   [ ] Checked API routes security
-   [ ] Reviewed middleware security
-   [ ] Verified security headers (CSP, etc.)

### Supabase Security

-   [ ] Reviewed RLS policies
-   [ ] Checked API keys management
-   [ ] Reviewed authentication flows
-   [ ] Verified data access patterns

### Infrastructure & CI/CD

-   [ ] Reviewed dependency security and known vulnerabilities
-   [ ] Checked HTTPS configuration
-   [ ] Analyzed CORS policies and security headers
-   [ ] Reviewed CI/CD pipeline secrets management
