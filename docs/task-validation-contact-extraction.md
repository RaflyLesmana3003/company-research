# Task Validation: Contact Extraction Workflow

## Overview

This document validates all implementation tasks extracted from the requirements and design documents to ensure they are specific, actionable, measurable, and properly sequenced.

---

## Task Categories

### Category A: Setup & Configuration (5 tasks)
### Category B: Workflow Core Implementation (10 tasks)
### Category C: Testing & Validation (4 tasks)

**Total Tasks: 19**

---

## Category A: Setup & Configuration

### Task A1: Set up PostgreSQL database on Supabase
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Create Supabase project and execute schema.sql |
| Actionable | ✅ Yes | Single sitting, ~15 minutes |
| Measurable | ✅ Yes | Done when all 4 tables + 3 views exist |
| Dependencies | None | First task |

**Subject:** Set up PostgreSQL database on Supabase
**Description:**
- Create a new Supabase project
- Execute the schema.sql file to create tables:
  - contact_extraction_results
  - processing_status
  - processing_errors
  - workflow_runs
- Create the 3 views for dashboard metrics
- Note the connection string for n8n

**Acceptance Criteria:**
- [ ] Supabase project created
- [ ] All 4 tables created with correct schema
- [ ] All 3 views created
- [ ] Connection string documented

**ActiveForm:** Setting up PostgreSQL database

---

### Task A2: Configure HubSpot sandbox with custom properties
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Create 16 custom properties on Company object |
| Actionable | ✅ Yes | Single sitting, ~20 minutes |
| Measurable | ✅ Yes | Done when all properties exist |
| Dependencies | None | Can run parallel with A1 |

**Subject:** Configure HubSpot sandbox with custom properties
**Description:**
- Create HubSpot developer sandbox account
- Navigate to Settings > Properties > Company
- Create all 16 custom properties as specified in requirements:
  - enrichment_trigger (Date)
  - scraped_website_content (Multi-line text)
  - scraped_contact_page (Multi-line text)
  - scraped_about_page (Multi-line text)
  - extracted_phone (Single-line text)
  - extracted_email (Single-line text)
  - extracted_address (Multi-line text)
  - extraction_model (Single-line text)
  - extraction_timestamp (Date)
  - extraction_confidence (Number)
  - fields_found_count (Number)
  - processing_status (Single-line text)
  - error_message (Multi-line text)
  - manual_override (Checkbox)
  - clearbit_enriched (Checkbox)
  - clearbit_confidence (Number)

**Acceptance Criteria:**
- [ ] HubSpot sandbox account created
- [ ] All 16 custom properties created
- [ ] Property types match specification

**ActiveForm:** Configuring HubSpot custom properties

---

### Task A3: Create 5 test companies in HubSpot
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Create 5 specific companies with mock data |
| Actionable | ✅ Yes | Single sitting, ~15 minutes |
| Measurable | ✅ Yes | 5 companies with correct data exist |
| Dependencies | A2 | Needs custom properties first |

**Subject:** Create 5 test companies in HubSpot with mock data
**Description:**
Create these companies with the exact mock enrichment data:

1. **Patagonia** (patagonia.com, US) - Contact page with phone, email, HQ address
2. **Atlassian** (atlassian.com, Australia) - About page with address, email (no phone)
3. **Basecamp** (basecamp.com, US) - Website content with all three fields
4. **TechStartup XYZ** (techstartupxyz.io, US) - Minimal data, no extractable info
5. **Global Imports Ltd** (globalimportsltd.co.uk, UK) - Invalid data edge case

Each company must have:
- enrichment_trigger set to today
- Appropriate scraped_* fields populated
- All extracted_* fields empty
- clearbit_enriched = false

**Acceptance Criteria:**
- [ ] 5 companies created with correct names/domains
- [ ] Mock enrichment data matches requirements document
- [ ] enrichment_trigger set for all companies
- [ ] All extracted fields are empty

**ActiveForm:** Creating test companies in HubSpot

---

### Task A4: Set up Google Cloud project with Vertex AI
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Create GCP project, enable Vertex AI, create service account |
| Actionable | ✅ Yes | Single sitting, ~20 minutes |
| Measurable | ✅ Yes | Service account JSON key obtained |
| Dependencies | None | Can run parallel |

**Subject:** Set up Google Cloud project with Vertex AI API
**Description:**
- Create new GCP project or use existing
- Enable Vertex AI API
- Create service account with "Vertex AI User" role
- Generate JSON key file
- Note project ID for n8n configuration

**Acceptance Criteria:**
- [ ] GCP project exists
- [ ] Vertex AI API enabled
- [ ] Service account created with correct role
- [ ] JSON key file downloaded
- [ ] Project ID documented

**ActiveForm:** Setting up Google Cloud Vertex AI

---

### Task A5: Configure n8n credentials
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Add 3 credentials to n8n |
| Actionable | ✅ Yes | Single sitting, ~10 minutes |
| Measurable | ✅ Yes | All credentials test successfully |
| Dependencies | A1, A2, A4 | Needs all services set up |

**Subject:** Configure n8n credentials for all services
**Description:**
Add these credentials in n8n:
1. **HubSpot** - OAuth2 or API Key with scopes:
   - crm.objects.companies.read
   - crm.objects.companies.write
2. **PostgreSQL** - Supabase connection string
3. **Google Cloud Service Account** - Upload JSON key file

**Acceptance Criteria:**
- [ ] HubSpot credential created and tested
- [ ] PostgreSQL credential created and tested
- [ ] Google Service Account credential created
- [ ] All credentials work with test queries

**ActiveForm:** Configuring n8n credentials

---

## Category B: Workflow Core Implementation

### Task B1: Create workflow with Schedule Trigger and Initialize Run
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | 2 nodes: trigger + set |
| Actionable | ✅ Yes | ~15 minutes |
| Measurable | ✅ Yes | Workflow triggers, UUID generated |
| Dependencies | A5 | Needs credentials |

**Subject:** Create workflow with Schedule Trigger and Initialize Run nodes
**Description:**
- Create new n8n workflow named "Contact Extraction Service"
- Add Schedule Trigger (every 6 hours)
- Add Set node to generate:
  - run_id (UUID)
  - started_at (ISO timestamp)
  - trigger_type ("schedule")

**Acceptance Criteria:**
- [ ] Workflow created with correct name
- [ ] Schedule Trigger configured for 6-hour interval
- [ ] Initialize Run node generates UUID and timestamps
- [ ] Manual trigger works for testing

**ActiveForm:** Creating workflow trigger and initialization

---

### Task B2: Implement HubSpot company search
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | HubSpot node with search filters |
| Actionable | ✅ Yes | ~20 minutes |
| Measurable | ✅ Yes | Returns companies matching basic filters |
| Dependencies | B1 | Connects to trigger |

**Subject:** Implement HubSpot company search with filters
**Description:**
Add HubSpot node configured for:
- Operation: Search Companies
- Filters (what HubSpot API supports):
  - enrichment_trigger is known
  - clearbit_enriched = false
  - extracted_phone is unknown
  - extracted_email is unknown
  - extracted_address is unknown
- Return properties: All custom properties + name, domain, city, state, country
- Limit: 100 (will paginate if needed)

**Note:** Complex filter logic (6-month window, OR conditions for scraped fields) will be handled in Code node.

**Acceptance Criteria:**
- [ ] HubSpot node added and connected
- [ ] Basic filters configured
- [ ] Returns test companies when triggered
- [ ] All required properties included in response

**ActiveForm:** Implementing HubSpot company search

---

### Task B3: Implement PostgreSQL deduplication check
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Query processing_status table |
| Actionable | ✅ Yes | ~15 minutes |
| Measurable | ✅ Yes | Returns status for company IDs |
| Dependencies | B2 | Needs company IDs |

**Subject:** Implement PostgreSQL deduplication status check
**Description:**
Add PostgreSQL node to query processing_status:
- Operation: Execute Query
- Query: SELECT crm_record_id, last_processed_timestamp, last_error_timestamp, error_count FROM processing_status WHERE crm_record_id = ANY($1)
- Use company IDs from HubSpot response

**Acceptance Criteria:**
- [ ] PostgreSQL node added and connected
- [ ] Query executes without error
- [ ] Returns empty result for new companies (expected)
- [ ] Query parameters correctly mapped

**ActiveForm:** Implementing deduplication check

---

### Task B4: Implement deduplication rules filter (Code node)
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Apply 7 trigger conditions |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | Correctly filters test companies |
| Dependencies | B3 | Needs both HubSpot and PG data |

**Subject:** Implement deduplication rules filter in Code node
**Description:**
Add Code node that applies all 7 trigger conditions:
1. enrichment_trigger within 6 months
2. clearbit fields empty
3. extracted fields empty
4. No manual_override
5. Has enrichment data (at least one scraped_* field)
6. Not processed within 30 days
7. No errors within 24 hours
8. error_count < 5

Merge data from HubSpot and PostgreSQL, output only companies that pass all rules.

**Acceptance Criteria:**
- [ ] Code node added with filter logic
- [ ] All 7 rules implemented correctly
- [ ] Test companies pass when they should
- [ ] Edge cases handled (null values, missing fields)

**ActiveForm:** Implementing deduplication filter logic

---

### Task B5: Implement processing loop with Split In Batches
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Split node + input preparation |
| Actionable | ✅ Yes | ~15 minutes |
| Measurable | ✅ Yes | Processes one company at a time |
| Dependencies | B4 | Needs filtered companies |

**Subject:** Implement processing loop with Split In Batches
**Description:**
- Add Split In Batches node (batch size: 1)
- Add Set node to prepare AI input:
  - company_id
  - company_name
  - domain
  - country
  - combined_content (merge all scraped fields)

**Acceptance Criteria:**
- [ ] Split In Batches configured for batch size 1
- [ ] Set node prepares combined_content correctly
- [ ] Loop processes each company individually
- [ ] Empty scraped fields handled gracefully

**ActiveForm:** Implementing processing loop

---

### Task B6: Implement AI extraction with Vertex AI
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Basic LLM Chain + Vertex model |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | AI returns structured output |
| Dependencies | B5 | Needs prepared input |

**Subject:** Implement AI extraction with Basic LLM Chain and Vertex AI
**Description:**
- Add Google Vertex Chat Model sub-node:
  - Project ID: from credentials
  - Model: gemini-2.5-pro
  - Temperature: 0.5
  - Max tokens: 1024
- Add Basic LLM Chain node:
  - Prompt type: Define below
  - System message: Extraction rules and validation
  - User message: Company data with combined_content
- Configure output format enforcement

**Acceptance Criteria:**
- [ ] Vertex AI model node configured
- [ ] Basic LLM Chain connected to model
- [ ] Prompt matches design specification
- [ ] AI returns Phone/Address/Email format
- [ ] Handles "none" for missing data

**ActiveForm:** Implementing AI extraction

---

### Task B7: Implement AI response parser (Code node)
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Parse structured AI output |
| Actionable | ✅ Yes | ~15 minutes |
| Measurable | ✅ Yes | Extracts 3 fields correctly |
| Dependencies | B6 | Needs AI response |

**Subject:** Implement AI response parser
**Description:**
Add Code node to parse AI output:
- Extract Phone: line using regex
- Extract Address: line using regex
- Extract Email: line using regex
- Calculate fields_found count
- Preserve original company data
- Store raw_ai_response for debugging

**Acceptance Criteria:**
- [ ] Code node parses all 3 fields
- [ ] Handles variations in AI output format
- [ ] fields_found calculated correctly
- [ ] Original company data preserved

**ActiveForm:** Implementing response parser

---

### Task B8: Implement data validation (Code node)
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Apply phone/email/address rules |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | Invalid data replaced with "none" |
| Dependencies | B7 | Needs parsed data |

**Subject:** Implement data validation rules
**Description:**
Add Code node with validation functions:

**Phone validation:**
- Length: 10-20 digits
- Reject: all zeros, all ones, sequential, repeated
- Clean format: + followed by digits only

**Email validation:**
- Regex format check
- Length: 5-254 characters
- Reject: test@, example@, noreply@, etc.

**Address validation:**
- Length: 10-500 characters
- Reject: PO Box patterns, test data

Calculate confidence_score and determine status.

**Acceptance Criteria:**
- [ ] Phone validation rejects invalid patterns
- [ ] Email validation rejects test/noreply addresses
- [ ] Address validation rejects PO Boxes
- [ ] "none" used for invalid data
- [ ] Confidence score calculated correctly
- [ ] Global Imports test case passes (rejects invalid, keeps valid)

**ActiveForm:** Implementing data validation

---

### Task B9: Implement PostgreSQL result storage and error logging
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Insert to 3 tables |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | Records appear in database |
| Dependencies | B8 | Needs validated data |

**Subject:** Implement PostgreSQL storage for results, status, and errors
**Description:**
Add nodes for database operations:

1. **IF node** - Route based on validation_passed
2. **Store Result** (PostgreSQL Insert):
   - Table: contact_extraction_results
   - All extraction fields + metadata
3. **Log Error** (PostgreSQL Insert):
   - Table: processing_errors
   - Error type, message, details
4. **Update Status** (PostgreSQL Upsert):
   - Table: processing_status
   - Increment counters, update timestamps

Connect to loop back to Split In Batches.

**Acceptance Criteria:**
- [ ] Results stored in contact_extraction_results
- [ ] Errors logged in processing_errors
- [ ] Status updated in processing_status
- [ ] Upsert works correctly (new + existing records)
- [ ] Loop continues after each company

**ActiveForm:** Implementing database storage

---

### Task B10: Implement batch update to HubSpot
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Aggregate + safety check + HTTP batch |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | HubSpot records updated |
| Dependencies | B9 | Needs all results |

**Subject:** Implement batch update to HubSpot
**Description:**
Add nodes for HubSpot batch update:

1. **Aggregate** - Combine all processed results
2. **Safety Validation** (Code node):
   - Filter out errors
   - Validate no sensitive data
   - Format for HubSpot API
   - Split into batches of 100
3. **HTTP Request** - POST to HubSpot batch update API:
   - URL: https://api.hubapi.com/crm/v3/objects/companies/batch/update
   - Auth: HubSpot credential
   - Body: { inputs: [...] }
4. **Log Run Complete** (PostgreSQL):
   - Update workflow_runs table
   - Record counts and completion time

**Acceptance Criteria:**
- [ ] Results aggregated correctly
- [ ] Safety validation filters errors
- [ ] HubSpot batch update succeeds
- [ ] All custom properties updated in HubSpot
- [ ] Run completion logged to database

**ActiveForm:** Implementing HubSpot batch update

---

## Category C: Testing & Validation

### Task C1: Test workflow with all 5 test companies
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Run workflow, verify outputs |
| Actionable | ✅ Yes | ~30 minutes |
| Measurable | ✅ Yes | All 5 produce expected results |
| Dependencies | B10 | Full workflow complete |

**Subject:** Test workflow with all 5 test companies
**Description:**
Run the complete workflow and verify:

1. **Patagonia** → Phone: +18006386464, Address: 259 W Santa Clara St..., Email: customerservice@patagonia.com
2. **Atlassian** → Phone: none, Address: Level 6, 341 George Street..., Email: info@atlassian.com
3. **Basecamp** → Phone: +13125550123, Address: 30 N Racine Ave..., Email: support@basecamp.com
4. **TechStartup XYZ** → Phone: none, Address: none, Email: none
5. **Global Imports** → Phone: +442079460958 (not zeros), Address: 45 Industrial Way... (not PO Box), Email: enquiries@globalimportsltd.co.uk (not test@)

**Acceptance Criteria:**
- [ ] All 5 companies processed
- [ ] Expected outputs match for each company
- [ ] HubSpot records updated correctly
- [ ] PostgreSQL audit records created

**ActiveForm:** Testing with test companies

---

### Task C2: Test error handling scenarios
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Deliberately trigger errors |
| Actionable | ✅ Yes | ~20 minutes |
| Measurable | ✅ Yes | Errors logged, workflow continues |
| Dependencies | C1 | Needs working workflow |

**Subject:** Test error handling and recovery
**Description:**
Test these error scenarios:
1. **AI timeout** - Test with very long content (if possible simulate)
2. **Invalid AI response** - Manually test parser with malformed response
3. **Database connection** - Verify retry behavior
4. **Error cooldown** - Run workflow twice, verify 24h cooldown works
5. **Max retries** - Verify company skipped after 5 errors

**Acceptance Criteria:**
- [ ] Errors logged to processing_errors table
- [ ] Workflow continues after errors
- [ ] Error cooldown prevents immediate retry
- [ ] HubSpot error_message field populated

**ActiveForm:** Testing error handling

---

### Task C3: Validate workflow with n8n-mcp tools
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Use validate_workflow tool |
| Actionable | ✅ Yes | ~15 minutes |
| Measurable | ✅ Yes | No validation errors |
| Dependencies | B10 | Needs complete workflow |

**Subject:** Validate workflow using n8n-mcp validation tools
**Description:**
- Export workflow JSON
- Run mcp__n8n-mcp__validate_workflow
- Fix any reported issues
- Run mcp__n8n-mcp__n8n_autofix_workflow if needed
- Re-validate until clean

**Acceptance Criteria:**
- [ ] No validation errors
- [ ] No critical warnings
- [ ] Workflow structure correct
- [ ] All connections valid

**ActiveForm:** Validating workflow

---

### Task C4: Export and verify workflow JSON
| Criteria | Status | Notes |
|----------|--------|-------|
| Specific | ✅ Yes | Export and test import |
| Actionable | ✅ Yes | ~10 minutes |
| Measurable | ✅ Yes | Clean import works |
| Dependencies | C3 | After validation |

**Subject:** Export workflow JSON and verify reimport
**Description:**
- Export workflow as contact-extraction-workflow.json
- Create new n8n instance or clear workflow
- Import the JSON
- Verify all nodes present
- Verify credentials can be reattached

**Acceptance Criteria:**
- [ ] JSON file exported
- [ ] File imports without errors
- [ ] All 19 nodes present
- [ ] Connections preserved
- [ ] Only credentials need configuration

**ActiveForm:** Exporting workflow JSON

---

## Coverage Verification

### Requirements Coverage

| Requirement | Task(s) | Status |
|-------------|---------|--------|
| Schedule trigger (6 hours) | B1 | ✅ |
| HubSpot search with filters | B2 | ✅ |
| PostgreSQL deduplication | B3, B4 | ✅ |
| 7 trigger conditions | B4 | ✅ |
| Vertex AI extraction | B6 | ✅ |
| Data validation rules | B8 | ✅ |
| PostgreSQL audit logging | B9 | ✅ |
| HubSpot batch update | B10 | ✅ |
| Error handling & retry | B9 | ✅ |
| 5 test companies | A3, C1 | ✅ |

### Design Coverage

| Design Component | Task(s) | Status |
|------------------|---------|--------|
| Node 1: Schedule Trigger | B1 | ✅ |
| Node 2: Initialize Run | B1 | ✅ |
| Node 3: HubSpot Search | B2 | ✅ |
| Node 4: Check Dedup Status | B3 | ✅ |
| Node 5: Apply Dedup Rules | B4 | ✅ |
| Node 6: Split In Batches | B5 | ✅ |
| Node 7: Prepare AI Input | B5 | ✅ |
| Node 8: Vertex AI Model | B6 | ✅ |
| Node 9: Basic LLM Chain | B6 | ✅ |
| Node 10: Parse AI Response | B7 | ✅ |
| Node 11: Validate Data | B8 | ✅ |
| Node 12: Check Valid (IF) | B9 | ✅ |
| Node 13: Store Result | B9 | ✅ |
| Node 14: Log Error | B9 | ✅ |
| Node 15: Update Status | B9 | ✅ |
| Node 16: Aggregate Results | B10 | ✅ |
| Node 17: Safety Validation | B10 | ✅ |
| Node 18: HubSpot Batch Update | B10 | ✅ |
| Node 19: Log Run Complete | B10 | ✅ |

### Deliverables Coverage

| Deliverable | Task(s) | Status |
|-------------|---------|--------|
| contact-extraction-workflow.json | C4 | ✅ |
| schema.sql | Already created | ✅ |

---

## Task Dependency Graph

```
Phase: SETUP
A1 (PostgreSQL) ──────────────────────────┐
A2 (HubSpot Props) ─→ A3 (Test Companies) │
A4 (GCP/Vertex) ──────────────────────────┼─→ A5 (n8n Credentials)
                                          │
Phase: IMPLEMENTATION                     │
                                          ↓
B1 (Trigger+Init) ──────────────────────────────────────────────────→
  ↓
B2 (HubSpot Search) ───────────────────────────────────────────────→
  ↓
B3 (PG Dedup Check) ───────────────────────────────────────────────→
  ↓
B4 (Dedup Rules) ──────────────────────────────────────────────────→
  ↓
B5 (Loop + Prepare) ───────────────────────────────────────────────→
  ↓
B6 (AI Extraction) ────────────────────────────────────────────────→
  ↓
B7 (Parse Response) ───────────────────────────────────────────────→
  ↓
B8 (Validation) ───────────────────────────────────────────────────→
  ↓
B9 (PG Storage) ───────────────────────────────────────────────────→
  ↓
B10 (Batch Update) ────────────────────────────────────────────────→

Phase: TESTING
  ↓
C1 (Test 5 Companies) ─────────────────────────────────────────────→
  ↓
C2 (Error Handling) ───────────────────────────────────────────────→
  ↓
C3 (Validate Workflow) ────────────────────────────────────────────→
  ↓
C4 (Export JSON) ──────────────────────────────────────────────────→ DONE
```

---

## Summary

| Category | Tasks | Est. Time |
|----------|-------|-----------|
| A: Setup | 5 | ~1.5 hours |
| B: Implementation | 10 | ~4 hours |
| C: Testing | 4 | ~1.5 hours |
| **Total** | **19** | **~7 hours** |

---

## Validation Complete

All tasks have been validated against:
- [x] Specific - Each task describes exactly what to do
- [x] Actionable - Each can be completed in one sitting
- [x] Measurable - Clear acceptance criteria defined
- [x] Dependencies identified and mapped
- [x] All workflow requirements addressed
- [x] All design components covered
- [x] Core deliverables covered (workflow JSON, schema)

**Ready to proceed to Phase 4: Create Tasks**
