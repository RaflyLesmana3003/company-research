---
description: Build n8n workflows using the 6-phase development process with n8n-mcp tools
---

# n8n Workflow Development Skill

You are an expert n8n workflow developer. This skill guides you through building production-quality n8n workflows using the structured 6-phase process.

## When to Activate

This skill activates when the user:
- Asks to build, create, or design an n8n workflow
- Wants to automate a process using n8n
- Needs help with n8n node configuration
- Is working through the workflow development phases

## Related Skills (Auto-Activate)

These built-in n8n-mcp skills complement this one:
- **n8n-workflow-patterns** - Architecture patterns and templates
- **n8n-node-configuration** - Node setup and configuration
- **n8n-expression-syntax** - n8n expression writing
- **n8n-code-javascript** - JavaScript in Code nodes
- **n8n-code-python** - Python in Code nodes
- **n8n-validation-expert** - Error interpretation
- **n8n-mcp-tools-expert** - Tool usage guidance

## The 6-Phase Process

### Phase 1: Requirements (`/workflow/requirements`)
Gather and document what the workflow needs to accomplish.

**Key Activities:**
- Ask clarifying questions
- Identify triggers and integrations
- Define success criteria

**Tools:** `search_nodes`, `get_templates`

### Phase 2: Planning (`/workflow/plan`)
Design the workflow architecture.

**Key Activities:**
- Select appropriate nodes
- Map data flow
- Plan error handling

**Tools:** `search_nodes`, `get_node`, `get_templates`

### Phase 3: Validate Tasks (`/workflow/validate-tasks`)
Ensure tasks are well-defined before creation.

**Key Activities:**
- Review task list for completeness
- Verify dependencies
- Confirm with user

### Phase 4: Create Tasks (`/workflow/create-tasks`)
Create formal tasks using TaskCreate tool.

**Key Activities:**
- Create tasks with proper format
- Set up dependencies
- Verify task list

**Tools:** `TaskCreate`, `TaskUpdate`, `TaskList`

### Phase 5: Execute (`/workflow/execute`)
Build the workflow.

**Key Activities:**
- Complete tasks systematically
- Configure nodes
- Save workflow JSON

**Tools:** `get_node`, `validate_workflow`, `create_workflow`

### Phase 6: Test (`/workflow/test`)
Validate and test the workflow.

**Key Activities:**
- Run validation
- Execute tests
- Verify requirements met

**Tools:** `validate_workflow`, `execute_workflow`

## n8n-mcp Quick Reference

### Node Search
```
search_nodes(query: "send email")
search_nodes(query: "webhook trigger")
search_nodes(query: "HTTP request")
```

### Node Details
```
get_node(nodeType: "n8n-nodes-base.webhook")
get_node(nodeType: "n8n-nodes-base.code", detail: "full")
```

### Templates
```
get_templates(search: "slack notification")
get_templates(category: "Sales")
```

### Validation
```
validate_workflow(workflow: {...}, profile: "strict")
```

### Workflow Management
```
create_workflow(name: "My Workflow", nodes: [...], connections: {...})
update_workflow(workflowId: "123", updates: {...})
execute_workflow(workflowId: "123", data: {...})
activate_workflow(workflowId: "123", active: true)
```

## Task Management Pattern

Always use tasks to track implementation:

```
# Start a task
TaskUpdate(taskId: "1", status: "in_progress")

# Do the work...

# Complete the task
TaskUpdate(taskId: "1", status: "completed")
```

## Common Node Types

### Triggers
- `n8n-nodes-base.webhook` - HTTP webhook
- `n8n-nodes-base.scheduleTrigger` - Cron/interval
- `n8n-nodes-base.manualTrigger` - Manual execution

### Data Processing
- `n8n-nodes-base.code` - JavaScript/Python
- `n8n-nodes-base.set` - Set/modify fields
- `n8n-nodes-base.if` - Conditional logic
- `n8n-nodes-base.switch` - Multiple conditions

### HTTP & APIs
- `n8n-nodes-base.httpRequest` - API calls
- `n8n-nodes-base.respondToWebhook` - Webhook response

### Popular Integrations
- `n8n-nodes-base.slack` - Slack
- `n8n-nodes-base.googleSheets` - Google Sheets
- `n8n-nodes-base.airtable` - Airtable
- `n8n-nodes-base.notion` - Notion

## Best Practices

1. **Always validate** - Use `validate_workflow` before deploying
2. **Handle errors** - Add error handling for production workflows
3. **Use expressions wisely** - Keep complex logic in Code nodes
4. **Test thoroughly** - Test with realistic data
5. **Document** - Keep requirements and design docs updated

## Getting Started

If the user hasn't started a workflow yet, guide them to:
1. Run `/workflow/requirements` to begin Phase 1
2. Work through each phase sequentially
3. Use the appropriate tools at each phase

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Node not found | Use `search_nodes` with different terms |
| Validation errors | Check `validate_workflow` output details |
| Connection issues | Verify node input/output types match |
| Expression errors | Use n8n-expression-syntax skill |

---

## Workflow JSON Examples

### Minimal Valid Workflow
```json
{
  "name": "Example Workflow",
  "nodes": [
    {
      "id": "1",
      "name": "Start",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {}
    },
    {
      "id": "2",
      "name": "Set Data",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [500, 300],
      "parameters": {
        "assignments": {
          "assignments": [
            {"name": "message", "value": "Hello World", "type": "string"}
          ]
        }
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [[{"node": "Set Data", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Webhook Trigger Template
```json
{
  "id": "webhook-1",
  "name": "Webhook Trigger",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [250, 300],
  "webhookId": "unique-webhook-id",
  "parameters": {
    "path": "my-webhook",
    "httpMethod": "POST",
    "responseMode": "onReceived",
    "responseData": "allEntries"
  }
}
```

### HTTP Request Node Template
```json
{
  "id": "http-1",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [500, 300],
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "options": {}
  }
}
```

---

## Expression Syntax Quick Reference

| Pattern | Example | Result |
|---------|---------|--------|
| Access field | `{{ $json.email }}` | Current item's email field |
| Previous node | `{{ $('NodeName').item.json.field }}` | Data from specific node |
| All items | `{{ $input.all() }}` | Array of all input items |
| First item | `{{ $input.first() }}` | First input item |
| Current index | `{{ $itemIndex }}` | 0, 1, 2... |
| Current run index | `{{ $runIndex }}` | Execution run number |
| Workflow ID | `{{ $workflow.id }}` | Current workflow ID |
| If expression | `{{ $json.status === 'active' ? 'Yes' : 'No' }}` | Conditional value |
| Date now | `{{ $now.toISO() }}` | Current ISO timestamp |
| Math | `{{ $json.price * 1.1 }}` | Calculate value |

### Common Expression Patterns

**String concatenation:**
```
{{ $json.firstName + ' ' + $json.lastName }}
```

**Array access:**
```
{{ $json.items[0].name }}
```

**Object property check:**
```
{{ $json.data?.nested?.value ?? 'default' }}
```

**JSON stringify:**
```
{{ JSON.stringify($json.data) }}
```

---

## Error Recovery Patterns

### MCP Connection Failed
```
1. Run: n8n_health_check(mode: "diagnostic")
2. Check N8N_API_URL and N8N_API_KEY in .mcp.json
3. Verify n8n instance is accessible via browser
4. Restart Claude Code if needed: exit and run `claude` again
```

### Validation Failures
```
1. Preview fixes: n8n_autofix_workflow(id: "...", applyFixes: false)
2. Review suggested fixes carefully
3. Apply safe fixes: n8n_autofix_workflow(id: "...", applyFixes: true, confidenceThreshold: "high")
4. Re-validate: n8n_validate_workflow(id: "...")
5. Fix remaining issues manually
```

### Node Configuration Unknown
```
1. Get documentation: get_node(nodeType: "...", mode: "docs")
2. Get full schema: get_node(nodeType: "...", detail: "full")
3. Get examples: get_node(nodeType: "...", includeExamples: true)
4. Search for templates: search_templates(nodeTypes: ["..."])
```

### Execution Failures
```
1. Get error details: n8n_executions(action: "get", id: "...", mode: "error")
2. Identify failing node from execution path
3. Check node configuration against schema
4. Review input data at failure point
5. Fix and re-test
```

### Expression Errors
```
1. Check expression syntax (must start with {{ and end with }})
2. Verify field names exist in input data
3. Use optional chaining (?.) for nullable paths
4. Test expressions in n8n expression editor first
```

---

## Node Position Guidelines

**Standard Layout:**
- Start trigger at position [250, 300]
- Increment X by 250 for sequential nodes
- Use Y offset for parallel branches (e.g., [500, 200] and [500, 400])

**Visual Example:**
```
[Trigger]----[Process]----[Output]
   250          500          750

For branches:
                  [Branch A] (Y: 200)
                 /
[Trigger]----[IF]
                 \
                  [Branch B] (Y: 400)
```
