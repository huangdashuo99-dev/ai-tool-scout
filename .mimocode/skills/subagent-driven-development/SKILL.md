---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching a fresh implementer subagent per task, a task review (spec compliance + code quality) after each, and a broad whole-branch review at the end.

**Why subagents:** You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task.

**Core principle:** Fresh subagent per task + task review (spec + quality) + broad final review = high quality, fast iteration

**Continuous execution:** Do not pause to check in with your human partner between tasks. Execute all tasks from the plan without stopping.

## The Process

1. **Read plan, note context and global constraints, create todos**
2. **For each task:**
   - Dispatch implementer subagent
   - Implementer implements, tests, commits, self-reviews
   - Dispatch task reviewer subagent (spec compliance + code quality)
   - If issues found: dispatch fix subagent, re-review
   - Mark task complete
3. **After all tasks:** Dispatch final code reviewer
4. **Use finishing-a-development-branch** to complete

## Model Selection

Use the least powerful model that can handle each role:

- **Mechanical implementation tasks** (isolated functions, clear specs, 1-2 files): use a fast, cheap model
- **Integration and judgment tasks** (multi-file coordination, pattern matching, debugging): use a standard model
- **Architecture and design tasks**: use the most capable available model

## Handling Implementer Status

**DONE:** Generate review package, dispatch task reviewer.

**DONE_WITH_CONCERNS:** Read concerns before proceeding. If concerns are about correctness or scope, address them before review.

**NEEDS_CONTEXT:** Provide missing context and re-dispatch.

**BLOCKED:** Assess the blocker:
1. If context problem: provide more context
2. If needs more reasoning: re-dispatch with more capable model
3. If too large: break into smaller pieces
4. If plan is wrong: escalate to human

## Handling Reviewer Items

The task reviewer may report items that cannot be verified from diff alone. Resolve each one yourself before marking the task complete.

## Constructing Reviewer Prompts

- Do not add open-ended directives without concrete, task-specific reason
- Do not ask a reviewer to re-run tests the implementer already ran
- Do not pre-judge findings for the reviewer
- Hand the reviewer its diff as a file

## File Handoffs

Hand artifacts over as files:

- **Task brief:** Extract the task's full text to a file, compose dispatch so the brief is the single source of requirements
- **Report file:** Name the implementer's report file after the brief
- **Reviewer inputs:** Give the task reviewer the brief file, report file, and review package

## Durable Progress

Track progress in a ledger file, not only in todos:

- At skill start, check for a ledger
- When a task's review comes back clean, append one line to the ledger
- After compaction, trust the ledger and `git log` over your own recollection

## Red Flags

**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip task review
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make a subagent read the whole plan file
- Skip scene-setting context
- Ignore subagent questions
- Accept "close enough" on spec compliance

## Integration

**Required workflow skills:**
- **using-git-worktrees** - Ensures isolated workspace
- **writing-plans** - Creates the plan this skill executes
- **requesting-code-review** - Code review template for final review
- **finishing-a-development-branch** - Complete development after all tasks

**Subagents should use:**
- **test-driven-development** - Subagents follow TDD for each task

**Alternative workflow:**
- **executing-plans** - Use for parallel session instead of same-session execution
