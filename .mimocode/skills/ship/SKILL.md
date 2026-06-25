---
name: ship
description: "Use when implementation is complete and ready to ship - runs final checks, creates PR, and ensures quality. The last step before merge."
---

# Ship - Release Process

执行发布流程。运行最终检查，创建PR，确保质量。

## Checklist

1. **Run tests** - all tests must pass
2. **Run linter** - no warnings or errors
3. **Run type check** - TypeScript clean
4. **Build succeeds** - production build works
5. **Security check** - no known vulnerabilities
6. **Create PR** - with proper description
7. **Request review** - assign reviewers

## The Ship Process

### Step 1: Run Tests

```bash
# Run full test suite
npm test

# If tests fail, DO NOT SHIP
# Fix tests first, then re-run
```

### Step 2: Run Linter

```bash
# Check for lint errors
npm run lint

# Fix any auto-fixable issues
npm run lint -- --fix
```

### Step 3: Type Check

```bash
# TypeScript check
npm run typecheck

# Or for Astro projects
npx astro check
```

### Step 4: Build

```bash
# Production build
npm run build

# Verify no errors
```

### Step 5: Security Check

```bash
# Check for vulnerabilities
npm audit

# Fix critical/high vulnerabilities
npm audit fix
```

### Step 6: Create PR

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "feat: add user authentication

- Implement JWT-based auth
- Add login/register endpoints
- Include rate limiting
- Closes #123"

# Push to branch
git push origin feature/auth
```

### Step 7: PR Description

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)
Before: 
After:

## Related Issues
Closes #123
```

## Pre-Ship Checklist

Before creating PR, verify:

- [ ] All tests pass
- [ ] No lint errors
- [ ] No type errors
- [ ] Build succeeds
- [ ] No security vulnerabilities
- [ ] Code reviewed (self or peer)
- [ ] Documentation updated (if needed)
- [ ] Changelog updated (if needed)

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| Tests failing | Fix tests, don't skip |
| Lint errors | Run `npm run lint -- --fix` |
| Type errors | Fix type annotations |
| Build fails | Check for missing imports |
| Security vulns | Run `npm audit fix` |

## After PR Created

1. Wait for CI to pass
2. Address review feedback
3. Get approval
4. Merge to main
5. Verify deployment (if applicable)

## Key Principles

- **Never ship broken tests** - tests are your safety net
- **Fix, don't skip** - technical debt accumulates
- **Clear commit messages** - future you will thank you
- **Small PRs** - easier to review, faster to merge
- **Document changes** - others need to understand what you did
