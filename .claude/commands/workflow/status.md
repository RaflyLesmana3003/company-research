---
description: Check current workflow development status and phase
---

# Workflow Status Check

You are checking the current state of workflow development for this project.

## Status Check Process

### 1. Check Task State
Run `TaskList` to see all tasks and their status:
- **Pending tasks**: Work not yet started
- **In-progress tasks**: Currently being worked on
- **Completed tasks**: Finished work

### 2. Check Project Artifacts

Examine these directories for existing work:

**docs/**
- `requirements-*.md` - Requirements documents (Phase 1 output)
- `design-*.md` - Design documents (Phase 2 output)

**workflows/**
- `*.json` - Workflow JSON files (Phase 5 output)

**tests/**
- `*/test-plan.md` - Test plans (Phase 6)
- `*/test-results.md` - Test results (Phase 6)

### 3. Determine Current Phase

Based on artifacts and tasks, identify the phase:

| Phase | Indicators |
|-------|------------|
| **Not Started** | No docs, no tasks, no workflows |
| **Phase 1: Requirements** | Working on requirements doc, no design yet |
| **Phase 2: Planning** | Requirements done, working on design |
| **Phase 3: Validate Tasks** | Design done, reviewing task list |
| **Phase 4: Create Tasks** | Creating formal tasks in system |
| **Phase 5: Execute** | Tasks created, building workflow |
| **Phase 6: Test** | Workflow built, testing in progress |
| **Complete** | All tests pass, workflow deployed |

### 4. Report Status

Provide a summary including:

```
## Current Status

**Phase:** [1-6 or Complete]
**Phase Name:** [Requirements/Planning/etc.]

### Completed
- [x] Item 1
- [x] Item 2

### In Progress
- [ ] Current work item

### Next Steps
1. [What to do next]
2. [Following step]

### Artifacts
- docs/: [count] files
- workflows/: [count] files
- tests/: [count] files

### Commands
- Continue: `/workflow/[current-phase]`
- Next phase: `/workflow/[next-phase]`
```

## Quick Commands Reference

| Current Phase | Continue Command | Next Phase Command |
|---------------|------------------|-------------------|
| 1 | `/workflow/requirements` | `/workflow/plan` |
| 2 | `/workflow/plan` | `/workflow/validate-tasks` |
| 3 | `/workflow/validate-tasks` | `/workflow/create-tasks` |
| 4 | `/workflow/create-tasks` | `/workflow/execute` |
| 5 | `/workflow/execute` | `/workflow/test` |
| 6 | `/workflow/test` | Complete! |

## n8n Instance Status

Also check n8n connectivity:
```
n8n_health_check(mode: "status")
```

Report if the n8n instance is accessible and any workflows that exist there.
