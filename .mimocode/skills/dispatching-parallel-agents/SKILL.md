---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Agents

## Overview

You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use

**Use when:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

**Don't use when:**
- Failures are related (fix one might fix others)
- Need to understand full system state
- Agents would interfere with each other

## The Pattern

### 1. Identify Independent Domains

Group failures by what's broken:
- File A tests: Tool approval flow
- File B tests: Batch completion behavior
- File C tests: Abort functionality

Each domain is independent.

### 2. Create Focused Agent Tasks

Each agent gets:
- **Specific scope:** One test file or subsystem
- **Clear goal:** Make these tests pass
- **Constraints:** Don't change other code
- **Expected output:** Summary of what you found and fixed

### 3. Dispatch in Parallel

Issue all three subagent dispatches in the same response - they run in parallel:

```text
Subagent: "Fix agent-tool-abort.test.ts failures"
Subagent: "Fix batch-completion-behavior.test.ts failures"
Subagent: "Fix tool-approval-race-conditions.test.ts failures"
# All three run concurrently.
```

### 4. Review and Integrate

When agents return:
- Read each summary
- Verify fixes don't conflict
- Run full test suite
- Integrate all changes

## Agent Prompt Structure

Good agent prompts are:
1. **Focused** - One clear problem domain
2. **Self-contained** - All context needed to understand the problem
3. **Specific about output** - What should the agent return?

## Common Mistakes

- Too broad: "Fix all the tests" - agent gets lost
- Specific: "Fix agent-tool-abort.test.ts" - focused scope

- No context: "Fix the race condition" - agent doesn't know where
- Context: Paste the error messages and test names

- No constraints: Agent might refactor everything
- Constraints: "Do NOT change production code" or "Fix tests only"

## When NOT to Use

- Related failures: Fixing one might fix others
- Need full context: Understanding requires seeing entire system
- Exploratory debugging: You don't know what's broken yet
- Shared state: Agents would interfere (editing same files)
