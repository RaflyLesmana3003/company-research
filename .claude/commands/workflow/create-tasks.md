---
description: Start Phase 4 - Create formal tasks using TaskCreate
---

# Phase 4: Creating Tasks

You are in the task creation phase. Create formal tasks using the TaskCreate tool.

## Prerequisites

- Phase 3 (Validate Tasks) completed
- Task list validated and approved by user

## Your Tasks

1. **Create Tasks with TaskCreate**

   For each validated task, use the TaskCreate tool:

   ```
   TaskCreate:
     subject: "[Verb] [Component] [Context]"
     description: "[Detailed description]\n\nAcceptance Criteria:\n- [Criterion 1]\n- [Criterion 2]"
     activeForm: "[Verb]ing [action]"
   ```

2. **Set Dependencies with TaskUpdate**

   After creating tasks, establish dependencies:

   ```
   TaskUpdate:
     taskId: "[task ID]"
     addBlockedBy: ["[blocking task ID]"]
   ```

3. **Recommended Task Order**

   Create tasks in this sequence:

   1. **Setup/Prerequisites**
      - Environment configuration
      - Credentials setup

   2. **Core Implementation**
      - Trigger node creation
      - Main processing nodes
      - Integration connections

   3. **Data Handling**
      - Transformations
      - Field mappings

   4. **Error Handling**
      - Error triggers
      - Retry logic

   5. **Testing & Validation**
      - Test case creation
      - Workflow validation

   6. **Documentation**
      - Usage documentation
      - Maintenance notes

4. **Verify Task List**

   After creation, use TaskList to verify:
   - All tasks created
   - Dependencies set correctly
   - No orphaned tasks

## Task Creation Examples

### Trigger Task
```
TaskCreate:
  subject: "Create webhook trigger for incoming orders"
  description: "Set up a Webhook Trigger node to receive order data.\n\nConfiguration:\n- HTTP Method: POST\n- Path: /orders\n- Response: Immediately\n\nAcceptance Criteria:\n- Webhook endpoint is accessible\n- Returns 200 on valid request\n- Captures order JSON payload"
  activeForm: "Creating webhook trigger"
```

### Processing Task
```
TaskCreate:
  subject: "Add Code node for order validation"
  description: "Create a Code node to validate incoming order data.\n\nValidation Rules:\n- Required fields: orderId, customerEmail, items\n- Items array must not be empty\n- Email must be valid format\n\nAcceptance Criteria:\n- Invalid orders are rejected with error\n- Valid orders pass through unchanged"
  activeForm: "Adding order validation"
```

### Integration Task
```
TaskCreate:
  subject: "Configure Slack notification for new orders"
  description: "Add Slack node to send notification when order received.\n\nConfiguration:\n- Channel: #orders\n- Message format: Order #{orderId} from {customerEmail}\n\nAcceptance Criteria:\n- Message appears in Slack\n- Contains order details"
  activeForm: "Configuring Slack notification"
```

## Phase Completion

When all tasks are created:
1. Run TaskList to show complete task list
2. Confirm: "All tasks created with dependencies. Ready to start execution?"
3. If confirmed, user can run `/workflow/execute`
