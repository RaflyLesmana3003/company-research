---
description: Start Phase 3 - Validate task definitions before creation
---

# Phase 3: Validating Tasks

You are in the task validation phase. Ensure all planned tasks are well-defined before formal creation.

## Prerequisites

- Phase 1 (Requirements) completed
- Phase 2 (Planning/Design) completed
- Workflow design document exists

## Your Tasks

1. **Extract Tasks from Design**
   - Review the workflow design document
   - List each implementation step as a potential task
   - Include setup, configuration, and testing tasks

2. **Validate Each Task**

   For each task, verify:

   | Criteria | Check |
   |----------|-------|
   | **Specific** | Does it describe exactly what to do? |
   | **Actionable** | Can it be completed in one sitting? |
   | **Measurable** | Is there a clear done state? |
   | **Independent** | Are dependencies identified? |
   | **Sized Right** | Not too big, not too small? |

3. **Define Task Structure**

   For each validated task, prepare:
   ```
   Subject: [Verb] [Component] [Context]
   Description: [Detailed description with acceptance criteria]
   ActiveForm: [Verb]ing [action]
   Dependencies: [List of blocking tasks]
   ```

4. **Check Coverage**
   - Are all requirements addressed?
   - Are all design steps covered?
   - Is testing included?
   - Is documentation included?

5. **Review with User**
   - Present the task list
   - Confirm nothing is missing
   - Adjust based on feedback

## Task Validation Checklist

```markdown
## Task Validation: [Workflow Name]

### Proposed Tasks

1. [ ] Task: [Subject]
   - Specific: Yes/No
   - Actionable: Yes/No
   - Measurable: Yes/No
   - Dependencies: [list]

2. [ ] Task: [Subject]
   ...

### Coverage Check
- [ ] All requirements addressed
- [ ] All design steps covered
- [ ] Setup tasks included
- [ ] Error handling tasks included
- [ ] Testing tasks included
- [ ] Documentation tasks included

### User Confirmation
- [ ] User reviewed task list
- [ ] User approved tasks
```

## Common Task Categories

1. **Setup Tasks**
   - Configure credentials
   - Set up environment variables

2. **Implementation Tasks**
   - Create trigger node
   - Add processing nodes
   - Configure integrations

3. **Data Tasks**
   - Set up data transformations
   - Configure field mappings

4. **Error Handling Tasks**
   - Add error triggers
   - Configure retry logic

5. **Testing Tasks**
   - Create test data
   - Validate workflow
   - Test error scenarios

## Phase Completion

When all tasks are validated:
1. Confirm: "All tasks validated. Ready to create formal task list?"
2. If confirmed, user can run `/workflow/create-tasks`
