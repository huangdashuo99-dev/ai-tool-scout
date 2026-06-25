---
name: security-audit
description: "Use before shipping or when reviewing security - conducts OWASP + STRIDE security audit. Identifies vulnerabilities and provides remediation."
---

# Security Audit - OWASP + STRIDE

执行 OWASP + STRIDE 安全审计。识别漏洞并提供修复方案。

## Checklist

1. **STRIDE analysis** - 6 threat categories
2. **OWASP Top 10 check** - common vulnerabilities
3. **Input validation** - all entry points
4. **Authentication/Authorization** - access controls
5. **Data protection** - encryption, secrets
6. **Write report** - findings and remediation

## STRIDE Analysis

For each component, analyze:

| Threat | Question | Example |
|--------|----------|---------|
| **S**poofing | Can someone pretend to be another user? | Fake JWT, session hijack |
| **T**ampering | Can data be modified in transit? | MITM, SQL injection |
| **R**epudiation | Can actions be denied? | No audit logs |
| **I**nformation Disclosure | Can sensitive data leak? | Verbose errors, logs |
| **D**enial of Service | Can system be overwhelmed? | No rate limiting |
| **E**levation of Privilege | Can users gain unauthorized access? | IDOR, broken auth |

## OWASP Top 10 Check

| # | Vulnerability | Check |
|---|---------------|-------|
| A01 | Broken Access Control | IDOR, missing auth checks |
| A02 | Cryptographic Failures | Weak encryption, hardcoded keys |
| A03 | Injection | SQL, NoSQL, OS, LDAP injection |
| A04 | Insecure Design | Missing threat modeling |
| A05 | Security Misconfiguration | Default creds, verbose errors |
| A06 | Vulnerable Components | Outdated dependencies |
| A07 | Auth Failures | Weak passwords, no MFA |
| A08 | Data Integrity Failures | Unsigned updates, insecure deserialization |
| A09 | Logging Failures | Insufficient logging, no alerting |
| A10 | SSRF | Unvalidated URLs |

## Input Validation Checklist

For each input point:
- [ ] Validate on server (never trust client)
- [ ] Use allowlists, not blocklists
- [ ] Sanitize for output context (HTML, SQL, JS)
- [ ] Limit input length
- [ ] Validate file types (if uploads)

## Authentication/Authorization

- [ ] Use established libraries (not custom crypto)
- [ ] Store passwords with bcrypt/argon2
- [ ] Implement rate limiting on auth endpoints
- [ ] Use session tokens properly
- [ ] Check authorization on every request

## Data Protection

- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS everywhere
- [ ] Never log sensitive data
- [ ] Use environment variables for secrets
- [ ] Rotate secrets regularly

## Report Format

```markdown
## Security Audit Report

### Summary
- Critical: X
- High: X
- Medium: X
- Low: X

### Findings

#### [CRITICAL] Finding Title
- **Category**: OWASP A0X / STRIDE
- **Location**: file:line
- **Description**: What's wrong
- **Impact**: What could happen
- **Remediation**: How to fix
- **Code Fix**: (if applicable)

### Recommendations
1. Immediate fixes
2. Short-term improvements
3. Long-term hardening
```

## Key Principles

- **Defense in depth** - multiple layers of security
- **Least privilege** - minimal access needed
- **Fail securely** - errors shouldn't expose info
- **Don't roll your own crypto** - use established libraries
- **Security is not optional** - ship with it, not after
