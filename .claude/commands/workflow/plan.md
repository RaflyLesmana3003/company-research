---
description: Start Phase 2 - Plan the n8n workflow design
---

# Phase 2: Planning

You are in the planning phase. Design the workflow architecture based on gathered requirements.

## Prerequisites

- Phase 1 (Requirements) must be completed
- Requirements document should exist in `docs/`

## Your Tasks

1. **Review Requirements**
   - Read the requirements document
   - Confirm understanding with user if unclear

2. **Select Trigger Node**
   - Use `search_nodes` to find appropriate trigger
   - Consider: webhook, schedule, app trigger, manual
   - Document the trigger choice and configuration

3. **Design Node Sequence**
   - Map out the workflow steps
   - Use `search_nodes` for each integration
   - Use `get_node` for detailed configuration info

4. **Plan Data Transformations**
   - Identify where Code nodes are needed
   - Plan expression usage for simple mappings
   - Consider Set node for data restructuring

5. **Design Error Handling**
   - Plan IF nodes for conditional logic
   - Consider Error Trigger for failure handling
   - Plan retry logic if needed

6. **Find Reference Templates**
   - Use `get_templates` to find similar workflows
   - Learn from existing patterns

## Workflow Design Template

Create `docs/design-[workflow-name].md`:

```markdown
# Workflow Design: [Name]

## Trigger
- Node: [trigger node type]
- Configuration: [key settings]

## Workflow Steps

### Step 1: [Name]
- Node: [node type]
- Purpose: [what it does]
- Input: [expected data]
- Output: [produced data]

### Step 2: [Name]
...

## Error Handling
- [Strategy description]

## Data Flow Diagram
[Trigger] → [Step 1] → [Step 2] → ... → [Output]

## Notes
- [Any implementation notes]
```

## n8n-mcp Tools

| Tool | Usage |
|------|-------|
| `search_nodes` | Find nodes by functionality |
| `get_node` | Get node configuration details |
| `get_templates` | Find reference templates |

## Phase Completion

When design is complete:
1. Review the design document with user
2. Confirm: "Workflow design complete. Ready to validate tasks?"
3. If confirmed, user can run `/workflow/validate-tasks`
