---
description: Start Phase 5 - Execute tasks and build the workflow
---

# Phase 5: Executing

You are in the execution phase. Build the workflow by completing tasks systematically.

## Prerequisites

- Phase 4 (Create Tasks) completed
- All tasks created and dependencies set
- User confirmed ready to execute

## Your Tasks

1. **Review Task List**
   - Use TaskList to see all tasks
   - Identify tasks with no blockers (ready to start)
   - Plan execution order

2. **Execute Tasks Systematically**

   For each task:

   a. **Start Task**
   ```
   TaskUpdate:
     taskId: "[ID]"
     status: "in_progress"
   ```

   b. **Do the Work**
   - Follow the task description
   - Use n8n-mcp tools as needed
   - Document any issues

   c. **Complete Task**
   ```
   TaskUpdate:
     taskId: "[ID]"
     status: "completed"
   ```

3. **Build Workflow JSON**

   Structure for n8n workflow:
   ```json
   {
     "name": "[Workflow Name]",
     "nodes": [...],
     "connections": {...},
     "settings": {
       "executionOrder": "v1"
     }
   }
   ```

4. **Use n8n-mcp Tools**

   | Tool | When to Use |
   |------|-------------|
   | `get_node` | Get node configuration template |
   | `search_nodes` | Find specific node types |
   | `validate_workflow` | Check workflow validity |
   | `create_workflow` | Create in n8n instance |
   | `update_workflow` | Update existing workflow |

5. **Save Workflow**
   - Save JSON to `workflows/[name].json`
   - Create/update in n8n instance if connected

## Execution Workflow

```
┌─────────────────┐
│   TaskList      │
│   (find ready)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TaskUpdate      │
│ (in_progress)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Do the work     │
│ (build nodes)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ TaskUpdate      │
│ (completed)     │
└────────┬────────┘
         │
         ▼
    More tasks?
    ├── Yes → Loop back
    └── No → Phase complete
```

## Node Configuration Pattern

When configuring nodes:

1. **Get node details**
   ```
   get_node(nodeType: "n8n-nodes-base.webhook")
   ```

2. **Configure based on requirements**
   - Set required parameters
   - Configure authentication
   - Set options

3. **Position nodes**
   - X increases left to right (increment by 250)
   - Y varies for parallel paths

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Missing credentials | Set up in n8n first, reference by name |
| Invalid connections | Check output/input types match |
| Expression errors | Validate with n8n-mcp expression tools |
| Node not found | Use exact nodeType from search_nodes |

## Phase Completion

When all tasks are completed:
1. Verify all tasks show "completed" in TaskList
2. Validate workflow with `validate_workflow`
3. Confirm: "Workflow built. Ready to proceed to testing?"
4. If confirmed, user can run `/workflow/test`
