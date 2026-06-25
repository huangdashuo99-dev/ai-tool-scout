---
name: engineering-review
description: "Use after ceo-review or when reviewing architecture - provides engineering manager perspective. Creates ASCII diagrams, identifies edge cases, and defines test strategy."
---

# Engineering Review - Architecture Lock

提供工程经理视角的架构审查。创建ASCII图表，识别边界情况，定义测试策略。

## Checklist

1. **Read design doc** - understand approved scope
2. **Draw architecture** - ASCII diagrams of data flow
3. **Identify edge cases** - what can go wrong?
4. **Define interfaces** - API contracts, data shapes
5. **Test strategy** - what to test and how
6. **Failure modes** - how does it break? how to recover?
7. **Write review** - update design doc with engineering decisions

## The Review Process

### Step 1: Read the Design Doc
- Understand: problem, CEO-approved scope, constraints
- Note any ambiguities or missing details

### Step 2: Draw Architecture

Create ASCII diagrams for:

**Data Flow:**
```
User Input → [Component A] → [Component B] → Output
                ↓                    ↓
            [Storage]          [External API]
```

**State Machine (if applicable):**
```
[State 1] --event--> [State 2] --event--> [State 3]
    ↑                    ↓
    └──────event──────────┘
```

**Component Diagram:**
```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │
└─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Database  │
                    └─────────────┘
```

### Step 3: Identify Edge Cases

For each component, ask:
- What happens with empty input?
- What happens with invalid data?
- What happens when external service fails?
- What happens with concurrent access?
- What are the race conditions?

### Step 4: Define Interfaces

```typescript
// API Contract
interface CreateItemRequest {
  name: string;
  description?: string;
}

interface CreateItemResponse {
  id: string;
  createdAt: Date;
}

// Data Shape
interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 5: Test Strategy

| Layer | What to Test | How |
|-------|--------------|-----|
| Unit | Business logic | Jest/Vitest |
| Integration | API endpoints | Supertest |
| E2E | User flows | Playwright/Cypress |
| Performance | Load handling | k6/artillery |

### Step 6: Failure Modes

| Failure | Impact | Recovery |
|---------|--------|----------|
| Database down | High | Retry, circuit breaker |
| API timeout | Medium | Fallback, cache |
| Invalid input | Low | Validation, error msg |

## Key Principles

- **Diagram everything** - if you can't draw it, you don't understand it
- **Assume failure** - everything will break, plan for it
- **Define contracts** - clear interfaces between components
- **Test the unhappy path** - edge cases are where bugs hide
- **Keep it simple** - complexity is the enemy

## After Review

- Design doc updated with architecture decisions
- Ready for implementation
- Test strategy defined for verification-before-completion
