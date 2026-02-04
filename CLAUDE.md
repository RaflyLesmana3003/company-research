# n8n Knowledge Base Project

## Overview

This project uses a structured 6-phase workflow for building n8n automations. All work MUST follow these phases sequentially.

---

## Behavioral Rules

### ALWAYS
- Use `mcp__n8n-mcp__search_nodes` before assuming any node exists
- Validate workflow JSON with `mcp__n8n-mcp__validate_workflow` before saving
- Check `TaskList` before starting any work to understand current state
- Save artifacts to appropriate directories (workflows/, docs/, tests/)
- Mark tasks `in_progress` before starting work on them
- Confirm with user before modifying live n8n workflows
- Use `mcp__n8n-mcp__get_node` to verify node configuration parameters

### NEVER
- Skip phases - each phase MUST complete before the next
- Create workflows without validation
- Mark tasks completed without meeting ALL acceptance criteria
- Modify live workflows without explicit user confirmation
- Guess node types or parameters - always verify with search/get tools
- Deploy to production without running `/workflow/test` phase

---

## Error Recovery

### When n8n-mcp tools fail:
1. Check connectivity: `mcp__n8n-mcp__n8n_health_check(mode: "diagnostic")`
2. Verify credentials in `.mcp.json`
3. Retry with simpler parameters
4. Fall back to manual JSON construction if needed

### When validation fails:
1. Run `mcp__n8n-mcp__n8n_autofix_workflow(id: "...", applyFixes: false)` to preview fixes
2. Review suggested fixes
3. Apply with `applyFixes: true` if appropriate
4. Re-validate

### When node configuration unknown:
1. Run `mcp__n8n-mcp__get_node(nodeType: "...", mode: "docs")`
2. Check required vs optional parameters
3. Use `includeExamples: true` for real-world configs

---

## Context Preservation

### When resuming work:
1. Run `TaskList` to see current state
2. Read relevant docs in `docs/` for requirements context
3. Check `workflows/` for existing progress
4. Identify current phase based on completed tasks

### When starting fresh:
1. Begin with `/workflow/requirements`
2. Follow phases sequentially
3. Never skip ahead

---

## Mandatory 6-Phase Workflow

### Phase 1: Gathering Requirements (`/requirements`)
- Ask clarifying questions about the automation goal
- Document user needs and constraints
- Identify integration points and triggers
- Define success criteria

**Exit Criteria:** Clear requirements documented, user confirms understanding

### Phase 2: Planning (`/plan`)
- Design the workflow architecture
- Use `search_nodes` to find appropriate n8n nodes
- Select nodes and define data flow
- Identify potential challenges

**Exit Criteria:** Workflow design documented with node selections

### Phase 3: Validating Tasks (`/validate-tasks`)
- Review planned tasks for completeness
- Ensure each task is well-defined and actionable
- Verify task dependencies are correct
- Check that all requirements are addressed

**Exit Criteria:** All tasks validated and ready for creation

### Phase 4: Creating Tasks (`/create-tasks`)
- Use `TaskCreate` tool for each implementation step
- Set up task dependencies with `TaskUpdate`
- Include clear descriptions and acceptance criteria

**Exit Criteria:** Complete task list created in task management system

### Phase 5: Executing (`/execute`)
- Build the workflow following the task list
- Use `TaskUpdate` to mark tasks in_progress and completed
- Use n8n-mcp tools for node configuration
- Save workflow JSON to `workflows/` directory

**Exit Criteria:** Workflow built and saved

### Phase 6: Testing (`/test`)
- Validate workflow with `validate_workflow`
- Test with sample data
- Document test results in `tests/`
- Verify all success criteria met

**Exit Criteria:** Workflow tested and validated

---

## Task Management Requirements

### MUST use TaskCreate/TaskUpdate tools
- Every implementation step MUST be tracked as a task
- Tasks MUST be marked `in_progress` before starting work
- Tasks MUST be marked `completed` only when fully done
- Include `activeForm` for status visibility

### Task Format
```
Subject: [Action verb] [Component] [Context]
Description: Clear, actionable description with acceptance criteria
ActiveForm: [Present continuous verb]ing [action]
```

---

## n8n-mcp Tool Conventions

### Node Type Formats
- **Trigger nodes:** `n8n-nodes-base.webhook`, `n8n-nodes-base.scheduleTrigger`
- **Action nodes:** `n8n-nodes-base.httpRequest`, `n8n-nodes-base.code`
- **Community nodes:** Include version, e.g., `@n8n/n8n-nodes-langchain.agent`

### Complete Tool Reference

#### Search & Discovery
| Tool | Purpose |
|------|---------|
| `search_nodes` | Find nodes by keyword |
| `get_node` | Get node schema, docs, config examples |
| `search_templates` | Find workflow templates |
| `get_template` | Get full template details |

#### Workflow Management
| Tool | Purpose |
|------|---------|
| `n8n_create_workflow` | Create new workflow on instance |
| `n8n_get_workflow` | Get workflow by ID |
| `n8n_update_full_workflow` | Full workflow replacement |
| `n8n_update_partial_workflow` | Incremental node/connection updates |
| `n8n_delete_workflow` | Delete workflow |
| `n8n_list_workflows` | List all workflows on instance |

#### Validation & Testing
| Tool | Purpose |
|------|---------|
| `validate_workflow` | Validate workflow JSON (offline) |
| `validate_node` | Validate single node config |
| `n8n_validate_workflow` | Validate by workflow ID (online) |
| `n8n_autofix_workflow` | Auto-fix common issues |
| `n8n_test_workflow` | Execute/trigger workflow |
| `n8n_executions` | Get execution history & details |

#### Utilities
| Tool | Purpose |
|------|---------|
| `n8n_health_check` | Check n8n instance connectivity |
| `n8n_workflow_versions` | Version history & rollback |
| `n8n_deploy_template` | Deploy template to instance |
| `tools_documentation` | Get MCP tool documentation |

### Validation Profiles
- `strict` - Full validation, all checks (recommended for production)
- `ai-friendly` - Balanced validation with suggestions (default)
- `runtime` - Runtime-focused checks
- `minimal` - Quick required fields only (drafts)

---

## Phase Transition Rules

1. **Sequential Only:** Phases must be completed in order (1 → 2 → 3 → 4 → 5 → 6)
2. **No Skipping:** Cannot skip phases; each builds on the previous
3. **Document Before Moving:** Each phase must have documented output
4. **User Confirmation:** User confirms readiness before major transitions

---

## Available Slash Commands

| Command | Phase | Description |
|---------|-------|-------------|
| `/workflow/requirements` | 1 | Start requirements gathering |
| `/workflow/plan` | 2 | Design workflow with node selection |
| `/workflow/validate-tasks` | 3 | Validate task definitions |
| `/workflow/create-tasks` | 4 | Create formal task list |
| `/workflow/execute` | 5 | Build workflow with task tracking |
| `/workflow/test` | 6 | Validate and test workflow |

---

## Directory Structure

```
workflows/     # n8n workflow JSON files
docs/          # Documentation and requirements
tests/         # Test cases and validation results
```

---

## Available Skills (Auto-Activated)

The following n8n-mcp skills activate automatically when relevant:
- **n8n-workflow-patterns** - Workflow architecture patterns
- **n8n-node-configuration** - Node setup guidance
- **n8n-expression-syntax** - Expression writing help
- **n8n-code-javascript** - JavaScript Code nodes
- **n8n-code-python** - Python Code nodes
- **n8n-validation-expert** - Error interpretation
- **n8n-mcp-tools-expert** - Tool usage guidance

---

## Quick Reference

### Starting a New Workflow
1. Run `/workflow/requirements` to begin
2. Answer questions and document needs
3. Continue through each phase sequentially

### Resuming Work
1. Check current phase status
2. Run the appropriate `/workflow/*` command
3. Review existing tasks with `TaskList`

### Getting Help
- Use skills for n8n-specific guidance
- Reference templates with `get_templates`
- Search nodes with `search_nodes`
