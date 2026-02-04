---
description: Start Phase 6 - Test and validate the workflow
---

# Phase 6: Testing

You are in the testing phase. Validate the workflow and verify it meets requirements.

## Prerequisites

- Phase 5 (Execute) completed
- Workflow JSON saved to `workflows/`
- All implementation tasks completed

## Your Tasks

1. **Validate Workflow Structure**

   Use `validate_workflow` tool:
   ```
   validate_workflow(
     workflow: [workflow JSON],
     profile: "strict"
   )
   ```

   Validation profiles:
   - `strict` - All checks, recommended for final validation
   - `standard` - Normal validation
   - `lenient` - Minimum checks for drafts

2. **Review Validation Results**

   Check for:
   - Node configuration errors
   - Missing connections
   - Invalid expressions
   - Credential issues

3. **Create Test Cases**

   Document in `tests/[workflow-name]-tests.md`:
   ```markdown
   # Test Cases: [Workflow Name]

   ## Test 1: Happy Path
   - Input: [test data]
   - Expected: [expected outcome]
   - Result: [ ] Pass / [ ] Fail

   ## Test 2: Error Handling
   - Input: [invalid data]
   - Expected: [error handling behavior]
   - Result: [ ] Pass / [ ] Fail

   ## Test 3: Edge Cases
   ...
   ```

4. **Execute Test Workflow**

   If connected to n8n instance:
   ```
   execute_workflow(
     workflowId: "[ID]",
     data: [test input data]
   )
   ```

5. **Verify Against Requirements**

   Review each requirement from Phase 1:
   - [ ] Requirement 1: Met / Not Met
   - [ ] Requirement 2: Met / Not Met
   - ...

6. **Document Test Results**

   Create test summary in `tests/`:
   ```markdown
   # Test Results: [Workflow Name]

   Date: [date]
   Workflow Version: [version]

   ## Summary
   - Total Tests: [N]
   - Passed: [N]
   - Failed: [N]

   ## Detailed Results
   [test details]

   ## Issues Found
   [any issues]

   ## Recommendations
   [next steps]
   ```

## Testing Checklist

```markdown
## Testing Checklist

### Structure Validation
- [ ] Workflow validates without errors
- [ ] All nodes properly configured
- [ ] Connections are correct
- [ ] Expressions are valid

### Functional Testing
- [ ] Trigger works correctly
- [ ] Data flows through all nodes
- [ ] Transformations produce expected output
- [ ] Integrations connect successfully

### Error Handling
- [ ] Invalid input is handled
- [ ] API errors are caught
- [ ] Error notifications work

### Edge Cases
- [ ] Empty data handled
- [ ] Large data handled
- [ ] Rate limits respected

### Requirements Verification
- [ ] All requirements met
- [ ] Success criteria achieved
```

## n8n-mcp Tools for Testing

| Tool | Purpose |
|------|---------|
| `validate_workflow` | Validate workflow JSON |
| `execute_workflow` | Run workflow with test data |
| `get_workflow_executions` | Check execution history |

## Phase Completion

When testing is complete:
1. All tests pass or issues documented
2. Requirements verified as met
3. Test documentation saved

**Workflow development complete!**

## Next Steps After Completion

- Activate workflow if ready: `activate_workflow`
- Set up monitoring
- Create maintenance documentation
- Train users if needed
