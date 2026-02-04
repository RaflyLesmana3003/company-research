---
description: Start Phase 1 - Gather requirements for n8n workflow
---

# Phase 1: Gathering Requirements

You are starting the requirements gathering phase for an n8n workflow project.

## Your Tasks

1. **Understand the Goal**
   - What problem does this workflow solve?
   - What is the desired outcome?
   - Who will use or benefit from this automation?

2. **Identify Triggers**
   - What event should start this workflow?
   - Options: webhook, schedule, manual, app trigger, file change, etc.

3. **Map Integrations**
   - What external services/APIs are involved?
   - What data sources and destinations?
   - Any authentication requirements?

4. **Define Data Flow**
   - What data comes in?
   - What transformations are needed?
   - What data goes out?

5. **Clarify Constraints**
   - Any rate limits or quotas?
   - Error handling preferences?
   - Performance requirements?

6. **Success Criteria**
   - How do we know the workflow works?
   - What should be tested?

## Questions to Ask

Ask the user these questions (adapt as needed):

1. "What do you want this workflow to accomplish?"
2. "What should trigger this workflow to run?"
3. "What services or apps need to be connected?"
4. "What data needs to be processed or transformed?"
5. "Are there any specific error handling requirements?"
6. "How should we test that it's working correctly?"

## Output

Document the requirements in `docs/requirements-[workflow-name].md` with:
- Goal summary
- Trigger type
- Services/integrations list
- Data flow description
- Success criteria

## Phase Completion

When requirements are clear and documented:
1. Confirm with user: "Requirements gathered. Ready to proceed to planning?"
2. If confirmed, user can run `/workflow/plan` to continue

## n8n-mcp Tools to Use

- `search_nodes` - Find relevant nodes for identified integrations
- `get_templates` - Find similar workflow templates for reference
