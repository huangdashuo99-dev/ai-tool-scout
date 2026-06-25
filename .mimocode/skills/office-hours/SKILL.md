---
name: office-hours
description: "Use when starting a new project or feature - conducts structured product discovery through forcing questions. Challenges assumptions, reframes problems, and generates implementation approaches."
---

# Office Hours - Product Discovery

Conduct structured product discovery类似 YC Office Hours，通过6个强制性问题重新定义问题，挑战假设，生成实现方案。

## Checklist

1. **Understand the pain** - what specific problem are you solving?
2. **Challenge the framing** - is this the right problem to solve?
3. **Extract hidden requirements** - what capabilities did you not realize you needed?
4. **Generate alternatives** - 2-3 implementation approaches with trade-offs
5. **Recommend narrowest wedge** - what can ship tomorrow?
6. **Write design doc** - capture decisions for downstream skills

## The 6 Forcing Questions

Ask these ONE AT A TIME. Do not proceed until each is answered.

### Question 1: The Pain
"What specific, concrete problem are you trying to solve? Give me a real example from your life/work."

### Question 2: The Stakes
"Why does this matter? What happens if you don't solve it?"

### Question 3: The Constraints
"What are your hard constraints? (budget, time, technical, team size)"

### Question 4: The Success
"How will you know this worked? What's the metric or observable change?"

### Question 5: The Anti-Requirements
"What should this NOT do? What are you explicitly excluding?"

### Question 6: The Timeline
"When do you need this? What's the real deadline vs. the ideal deadline?"

## After Questions

**Challenge the framing:**
- "You said X, but what you actually described is Y"
- Identify what they didn't realize they were describing
- Extract 3-5 hidden capabilities

**Generate approaches:**
- Option A: Narrowest wedge (ship tomorrow)
- Option B: Balanced scope (1-2 weeks)
- Option C: Full vision (1-3 months)
- Recommend Option A, explain why

**Write design doc:**
- Save to `docs/specs/YYYY-MM-DD-<topic>-design.md`
- Include: problem statement, constraints, approaches, recommendation
- This doc feeds into ceo-review, engineering-review, and ship skills

## Key Principles

- **Listen to pain, not features** - they describe solutions, you find problems
- **One question at a time** - don't overwhelm
- **Challenge assumptions** - push back on framing
- **YAGNI ruthlessly** - remove unnecessary features
- **Recommend narrowest wedge** - ship fast, learn from real usage
