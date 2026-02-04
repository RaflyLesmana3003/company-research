# Workflow Design: Contact Extraction Service

## Overview

This document describes the architecture for an n8n workflow that extracts business contact information from HubSpot company records using Google Vertex AI (Gemini 2.5 Pro).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CONTACT EXTRACTION WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Schedule   │────▶│  Initialize Run │────▶│ HubSpot Search  │
│   Trigger    │     │   (Set Node)    │     │   Companies     │
│  (6 hours)   │     │  Generate UUID  │     │                 │
└──────────────┘     └─────────────────┘     └────────┬────────┘
                                                      │
                                                      ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              DEDUPLICATION GATE                                   │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐            │
│  │   PostgreSQL    │────▶│   Filter Node   │────▶│  Companies to   │            │
│  │  Check Status   │     │ Apply 7 Rules   │     │    Process      │            │
│  └─────────────────┘     └─────────────────┘     └────────┬────────┘            │
└───────────────────────────────────────────────────────────┼──────────────────────┘
                                                            │
                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              PROCESSING LOOP                                      │
│  ┌─────────────────┐                                                             │
│  │ Split In Batches│◀─────────────────────────────────────────────────┐          │
│  │  (1 at a time)  │                                                  │          │
│  └────────┬────────┘                                                  │          │
│           │                                                           │          │
│           ▼                                                           │          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ │          │
│  │  Prepare Input  │────▶│  Basic LLM      │────▶│  Parse AI       │ │          │
│  │  (Combine text) │     │  Chain + Vertex │     │  Response       │ │          │
│  └─────────────────┘     │  AI (Gemini)    │     │  (Code Node)    │ │          │
│                          └─────────────────┘     └────────┬────────┘ │          │
│                                                           │          │          │
│                                                           ▼          │          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ │          │
│  │   Validate      │◀────│    IF Node      │◀────│  Validate Data  │ │          │
│  │   Success Path  │     │  (Has Valid?)   │     │  (Code Node)    │ │          │
│  └────────┬────────┘     └────────┬────────┘     └─────────────────┘ │          │
│           │                       │                                   │          │
│           │              ┌────────▼────────┐                         │          │
│           │              │  Handle Errors  │                         │          │
│           │              │  (Log to PG)    │                         │          │
│           │              └────────┬────────┘                         │          │
│           │                       │                                   │          │
│           ▼                       ▼                                   │          │
│  ┌─────────────────────────────────────────────┐                     │          │
│  │          Store Result in PostgreSQL         │─────────────────────┘          │
│  │        (contact_extraction_results)         │                                 │
│  └─────────────────────────────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           BATCH UPDATE PHASE                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐            │
│  │   Aggregate     │────▶│  Safety Check   │────▶│ HubSpot Batch   │            │
│  │   Results       │     │  (Code Node)    │     │    Update       │            │
│  └─────────────────┘     └─────────────────┘     └────────┬────────┘            │
└───────────────────────────────────────────────────────────┼──────────────────────┘
                                                            │
                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              FINALIZATION                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐            │
│  │  Update PG      │────▶│  Log Run        │────▶│     Done        │            │
│  │  processing_    │     │  Completion     │     │                 │            │
│  │  status         │     │  (workflow_runs)│     │                 │            │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Node Inventory

| # | Node Name | Type | Version | Purpose |
|---|-----------|------|---------|---------|
| 1 | Schedule Trigger | `n8n-nodes-base.scheduleTrigger` | 1.2 | Trigger every 6 hours |
| 2 | Initialize Run | `n8n-nodes-base.set` | 3.4 | Generate run_id, timestamps |
| 3 | Search Companies | `n8n-nodes-base.hubspot` | 2 | Search companies with filters |
| 4 | Check Dedup Status | `n8n-nodes-base.postgres` | 2.5 | Query processing_status table |
| 5 | Apply Dedup Rules | `n8n-nodes-base.code` | 2 | Filter by 7 trigger conditions |
| 6 | Split In Batches | `n8n-nodes-base.splitInBatches` | 3 | Process 1 company at a time |
| 7 | Prepare AI Input | `n8n-nodes-base.set` | 3.4 | Combine scraped content |
| 8 | Vertex AI Model | `@n8n/n8n-nodes-langchain.lmChatGoogleVertex` | 1 | Gemini 2.5 Pro model |
| 9 | Basic LLM Chain | `@n8n/n8n-nodes-langchain.chainLlm` | 1.9 | Execute extraction prompt |
| 10 | Parse AI Response | `n8n-nodes-base.code` | 2 | Extract phone/email/address |
| 11 | Validate Data | `n8n-nodes-base.code` | 2 | Apply validation rules |
| 12 | Check Valid | `n8n-nodes-base.if` | 2 | Route success/error |
| 13 | Store Result | `n8n-nodes-base.postgres` | 2.5 | Insert extraction result |
| 14 | Log Error | `n8n-nodes-base.postgres` | 2.5 | Insert into processing_errors |
| 15 | Update Status | `n8n-nodes-base.postgres` | 2.5 | Upsert processing_status |
| 16 | Aggregate Results | `n8n-nodes-base.aggregate` | 1 | Combine for batch update |
| 17 | Safety Validation | `n8n-nodes-base.code` | 2 | Final check before CRM update |
| 18 | HubSpot Batch Update | `n8n-nodes-base.httpRequest` | 4.4 | Batch update companies |
| 19 | Log Run Complete | `n8n-nodes-base.postgres` | 2.5 | Update workflow_runs |

---

## Detailed Node Specifications

### 1. Schedule Trigger
```json
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "hours",
          "hoursInterval": 6
        }
      ]
    }
  }
}
```

### 2. Initialize Run (Set Node)
**Purpose:** Generate unique run ID and start timestamp
```javascript
// Fields to set:
{
  "run_id": "{{ $guid }}", // UUID for this run
  "started_at": "{{ $now.toISO() }}",
  "trigger_type": "schedule"
}
```

### 3. HubSpot Search Companies
**Operation:** Search companies
**Filters:** (Complex filter built in properties)
- `enrichment_trigger` is known AND within 6 months
- `clearbit_enriched` = false
- `extracted_phone` is unknown
- `extracted_email` is unknown
- `extracted_address` is unknown
- `manual_override` != true
- At least one of `scraped_*` fields has data

**Note:** HubSpot Search API has limitations on complex OR/AND combinations. Some filtering will be done post-search in the Code node.

### 4. Check Deduplication Status (PostgreSQL)
**Operation:** Execute Query
```sql
SELECT
  crm_record_id,
  last_processed_timestamp,
  last_error_timestamp,
  error_count
FROM processing_status
WHERE crm_record_id = ANY($1::varchar[])
```
**Query Parameters:** `{{ $json.company_ids }}`

### 5. Apply Deduplication Rules (Code Node)
**Purpose:** Apply the 7 trigger conditions that can't be done in HubSpot
```javascript
// Input: companies from HubSpot + status from PostgreSQL
// Rules to apply:
// 1. enrichment_trigger within 6 months
// 2. clearbit fields empty
// 3. extracted fields empty
// 4. No manual_override
// 5. Has enrichment data (at least one scraped_* field)
// 6. Not processed within 30 days (from PG)
// 7. No errors within 24 hours (from PG)
// 8. error_count < 5 (from PG)

const now = new Date();
const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);

const statusMap = new Map();
for (const status of $('Check Dedup Status').all()) {
  statusMap.set(status.json.crm_record_id, status.json);
}

return $input.all().filter(item => {
  const company = item.json;
  const status = statusMap.get(company.hs_object_id) || {};

  // Rule 1: enrichment_trigger within 6 months
  const triggerDate = new Date(company.enrichment_trigger);
  if (!company.enrichment_trigger || triggerDate < sixMonthsAgo) return false;

  // Rule 2: clearbit fields empty
  if (company.clearbit_enriched === true) return false;
  if (company.clearbit_confidence) return false;

  // Rule 3: extracted fields empty
  if (company.extracted_phone || company.extracted_email || company.extracted_address) return false;

  // Rule 4: No manual override
  if (company.manual_override === true) return false;

  // Rule 5: Has enrichment data
  const hasEnrichmentData = company.scraped_website_content ||
                            company.scraped_contact_page ||
                            company.scraped_about_page;
  if (!hasEnrichmentData) return false;

  // Rule 6: Not processed within 30 days
  if (status.last_processed_timestamp && new Date(status.last_processed_timestamp) > thirtyDaysAgo) return false;

  // Rule 7: No errors within 24 hours
  if (status.last_error_timestamp && new Date(status.last_error_timestamp) > twentyFourHoursAgo) return false;

  // Rule 8: error_count < 5
  if (status.error_count >= 5) return false;

  return true;
});
```

### 6. Split In Batches
**Purpose:** Process one company at a time to manage rate limits
```json
{
  "batchSize": 1,
  "options": {
    "reset": false
  }
}
```

### 7. Prepare AI Input (Set Node)
**Purpose:** Combine all scraped content into a single text block
```javascript
// Fields to set:
{
  "company_id": "{{ $json.hs_object_id }}",
  "company_name": "{{ $json.name }}",
  "domain": "{{ $json.domain }}",
  "country": "{{ $json.country }}",
  "combined_content": `
COMPANY: {{ $json.name }}
DOMAIN: {{ $json.domain }}
COUNTRY: {{ $json.country }}
CITY: {{ $json.city }}
STATE: {{ $json.state }}

=== SCRAPED CONTENT ===

WEBSITE CONTENT:
{{ $json.scraped_website_content || 'Not available' }}

CONTACT PAGE:
{{ $json.scraped_contact_page || 'Not available' }}

ABOUT PAGE:
{{ $json.scraped_about_page || 'Not available' }}
  `.trim()
}
```

### 8. Google Vertex Chat Model (Sub-node)
**Configuration:**
```json
{
  "type": "@n8n/n8n-nodes-langchain.lmChatGoogleVertex",
  "typeVersion": 1,
  "parameters": {
    "projectId": {
      "mode": "id",
      "value": "YOUR_GCP_PROJECT_ID"
    },
    "modelName": "gemini-2.5-pro",
    "options": {
      "temperature": 0.5,
      "maxOutputTokens": 1024,
      "topP": 0.95,
      "topK": 40
    }
  }
}
```

### 9. Basic LLM Chain
**Prompt (System + User):**

```
SYSTEM:
You are a precise data extraction assistant. Extract business contact information from company website content.

RULES:
1. Extract ONLY information explicitly stated in the content
2. Never infer, guess, or make up information
3. For phone numbers: Include country code, remove all formatting (spaces, dashes, parentheses)
4. For addresses: Use complete street addresses in Google Maps format, include country
5. For emails: Prefer general company emails (info@, contact@, support@) over personal emails
6. If information is not found or invalid, return "none" (lowercase)

VALIDATION RULES - Return "none" if:
- Phone: All zeros, all ones, sequential (123456), repeated (555555), or invalid format
- Email: Contains test@, example@, noreply@, no-reply@, donotreply@, or @localhost
- Address: Is a PO Box, P.O. Box, Post Office Box, or GPO Box

OUTPUT FORMAT (exactly as shown):
Phone: <phone_number_with_country_code_no_formatting>
Address: <full_street_address_google_format>
Email: <generic_company_email>

USER:
Extract contact information from this company data:

{{ $json.combined_content }}
```

### 10. Parse AI Response (Code Node)
**Purpose:** Parse the structured AI output into separate fields
```javascript
const response = $json.text || $json.output || '';

// Parse the response
const phoneMatch = response.match(/Phone:\s*(.+?)(?:\n|$)/i);
const addressMatch = response.match(/Address:\s*(.+?)(?:\n|$)/i);
const emailMatch = response.match(/Email:\s*(.+?)(?:\n|$)/i);

const extracted_phone = phoneMatch ? phoneMatch[1].trim() : 'none';
const extracted_address = addressMatch ? addressMatch[1].trim() : 'none';
const extracted_email = emailMatch ? emailMatch[1].trim() : 'none';

// Count non-"none" fields
let fields_found = 0;
if (extracted_phone !== 'none') fields_found++;
if (extracted_address !== 'none') fields_found++;
if (extracted_email !== 'none') fields_found++;

return [{
  json: {
    ...$('Prepare AI Input').first().json,
    extracted_phone,
    extracted_address,
    extracted_email,
    fields_found,
    raw_ai_response: response,
    extraction_timestamp: new Date().toISOString()
  }
}];
```

### 11. Validate Data (Code Node)
**Purpose:** Apply strict validation rules
```javascript
const item = $json;
let validationErrors = [];

// === PHONE VALIDATION ===
function validatePhone(phone) {
  if (!phone || phone === 'none') return 'none';

  // Remove all non-digits except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  // Extract digits only for validation
  const digits = cleaned.replace(/\D/g, '');

  // Length check: 10-20 digits
  if (digits.length < 10 || digits.length > 20) return 'none';

  // Reject patterns
  if (/^0{5,}/.test(digits)) return 'none';  // All zeros
  if (/^1{5,}/.test(digits)) return 'none';  // All ones
  if (/^123456/.test(digits)) return 'none'; // Sequential
  if (/^555555/.test(digits)) return 'none'; // Repeated 5s
  if (/(\d)\1{5,}/.test(digits)) return 'none'; // Any digit repeated 6+ times

  // Valid country codes
  const validCodes = ['1', '44', '61', '64', '49', '33', '81', '86', '91', '65'];
  const hasValidCode = validCodes.some(code => digits.startsWith(code));

  // Return cleaned format (just + and digits)
  return cleaned;
}

// === EMAIL VALIDATION ===
function validateEmail(email) {
  if (!email || email === 'none') return 'none';

  const cleaned = email.trim().toLowerCase();

  // Length check
  if (cleaned.length < 5 || cleaned.length > 254) return 'none';

  // Format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) return 'none';

  // Reject patterns
  const rejectPrefixes = ['test@', 'example@', 'admin@localhost', 'noreply@', 'no-reply@', 'donotreply@'];
  const rejectDomains = ['@test.', '@example.', '@localhost'];

  for (const prefix of rejectPrefixes) {
    if (cleaned.startsWith(prefix)) return 'none';
  }
  for (const domain of rejectDomains) {
    if (cleaned.includes(domain)) return 'none';
  }

  return cleaned;
}

// === ADDRESS VALIDATION ===
function validateAddress(address) {
  if (!address || address === 'none') return 'none';

  const cleaned = address.trim();

  // Length check
  if (cleaned.length < 10 || cleaned.length > 500) return 'none';

  // Reject PO Box patterns
  const poBoxPatterns = [
    /\bP\.?O\.?\s*Box\b/i,
    /\bPost\s*Office\s*Box\b/i,
    /\bGPO\s*Box\b/i
  ];
  for (const pattern of poBoxPatterns) {
    if (pattern.test(cleaned)) return 'none';
  }

  // Reject test data
  if (/^test/i.test(cleaned)) return 'none';
  if (/^example/i.test(cleaned)) return 'none';
  if (/^none$/i.test(cleaned)) return 'none';
  if (/^n\/a$/i.test(cleaned)) return 'none';

  return cleaned;
}

// Apply validation
const validated_phone = validatePhone(item.extracted_phone);
const validated_email = validateEmail(item.extracted_email);
const validated_address = validateAddress(item.extracted_address);

// Recalculate fields_found after validation
let fields_found = 0;
if (validated_phone !== 'none') fields_found++;
if (validated_email !== 'none') fields_found++;
if (validated_address !== 'none') fields_found++;

// Calculate confidence score (0-1)
const confidence_score = fields_found / 3;

// Determine status
let status = 'complete';
if (fields_found === 0) status = 'partial'; // No data found but no error

return [{
  json: {
    ...item,
    extracted_phone: validated_phone,
    extracted_email: validated_email,
    extracted_address: validated_address,
    fields_found,
    confidence_score,
    status,
    validation_passed: true
  }
}];
```

### 12. Check Valid (IF Node)
**Condition:** `{{ $json.validation_passed === true }}`
- **True branch:** Store result
- **False branch:** Log error

### 13. Store Result (PostgreSQL)
**Operation:** Insert
**Table:** `contact_extraction_results`
```sql
INSERT INTO contact_extraction_results (
  crm_record_id, company_name, domain,
  extracted_phone, extracted_address, extracted_email,
  extraction_timestamp, processing_run_id, model_version,
  status, data_sources_used, raw_ai_response,
  confidence_score, fields_found
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
```

### 14. Log Error (PostgreSQL)
**Operation:** Insert
**Table:** `processing_errors`
```sql
INSERT INTO processing_errors (
  crm_record_id, error_timestamp, error_type,
  error_message, error_details, processing_run_id
) VALUES ($1, NOW(), $2, $3, $4, $5)
```

### 15. Update Processing Status (PostgreSQL)
**Operation:** Insert or Update (Upsert)
**Table:** `processing_status`
```sql
INSERT INTO processing_status (
  crm_record_id, last_processed_timestamp, processing_count,
  last_status, last_run_id, updated_at
) VALUES ($1, NOW(), 1, $2, $3, NOW())
ON CONFLICT (crm_record_id)
DO UPDATE SET
  last_processed_timestamp = NOW(),
  processing_count = processing_status.processing_count + 1,
  last_status = EXCLUDED.last_status,
  last_run_id = EXCLUDED.last_run_id,
  updated_at = NOW()
```

### 16. Aggregate Results
**Purpose:** Combine all processed items for batch update
```json
{
  "aggregate": "aggregateAllItemData",
  "destinationFieldName": "results",
  "include": "allFieldsExcept"
}
```

### 17. Safety Validation (Code Node)
**Purpose:** Final check before sending to HubSpot
```javascript
const results = $json.results || [];
const safeResults = [];

for (const result of results) {
  // Skip if status is 'error'
  if (result.status === 'error') continue;

  // Double-check no sensitive data
  if (result.extracted_email && result.extracted_email.includes('password')) continue;

  // Ensure we have at least crm_record_id
  if (!result.company_id) continue;

  safeResults.push({
    id: result.company_id,
    properties: {
      extracted_phone: result.extracted_phone || 'none',
      extracted_email: result.extracted_email || 'none',
      extracted_address: result.extracted_address || 'none',
      extraction_model: 'gemini-2.5-pro',
      extraction_timestamp: result.extraction_timestamp,
      extraction_confidence: result.confidence_score,
      fields_found_count: result.fields_found,
      processing_status: result.status
    }
  });
}

// Batch into groups of 100 (HubSpot limit)
const batches = [];
for (let i = 0; i < safeResults.length; i += 100) {
  batches.push(safeResults.slice(i, i + 100));
}

return batches.map(batch => ({ json: { inputs: batch } }));
```

### 18. HubSpot Batch Update (HTTP Request)
**Method:** POST
**URL:** `https://api.hubapi.com/crm/v3/objects/companies/batch/update`
**Authentication:** HubSpot OAuth2 or API Key
**Body:**
```json
{
  "inputs": {{ $json.inputs }}
}
```
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

### 19. Log Run Complete (PostgreSQL)
**Operation:** Insert or Update
**Table:** `workflow_runs`
```sql
INSERT INTO workflow_runs (
  run_id, started_at, completed_at, status,
  companies_processed, companies_successful, companies_failed
) VALUES ($1, $2, NOW(), 'completed', $3, $4, $5)
ON CONFLICT (run_id) DO UPDATE SET
  completed_at = NOW(),
  status = 'completed',
  companies_processed = EXCLUDED.companies_processed,
  companies_successful = EXCLUDED.companies_successful,
  companies_failed = EXCLUDED.companies_failed
```

---

## Error Handling Strategy

### 1. Node-Level Error Handling
- Enable "Continue on Fail" for AI extraction nodes
- Use IF nodes to route errors to logging

### 2. Retry Logic
Implement in HTTP Request nodes:
- Max Retries: 3
- Backoff: Exponential (2^attempt seconds)
- Retry on: 429 (rate limit), 5xx (server errors)

### 3. Error Types & Handling

| Error Type | Source | Handling |
|------------|--------|----------|
| `rate_limit` | HubSpot API | Wait and retry with backoff |
| `api_error` | HubSpot/Vertex | Log and skip company |
| `validation_failed` | Code node | Mark as partial, store result |
| `timeout` | Vertex AI | Retry up to 3 times |
| `parse_error` | AI response | Log raw response, mark error |

### 4. Error Cooldown
- Companies with errors won't be retried for 24 hours
- After 5 total errors, company is permanently skipped until manual reset

---

## Connections Map

```
Schedule Trigger → Initialize Run
Initialize Run → Search Companies
Search Companies → Check Dedup Status
Check Dedup Status → Apply Dedup Rules
Apply Dedup Rules → Split In Batches
Split In Batches → Prepare AI Input
Prepare AI Input → Basic LLM Chain
Basic LLM Chain ← Google Vertex Chat Model (AI sub-node connection)
Basic LLM Chain → Parse AI Response
Parse AI Response → Validate Data
Validate Data → Check Valid
Check Valid (true) → Store Result
Check Valid (false) → Log Error
Store Result → Update Status
Log Error → Update Status
Update Status → Split In Batches (loop back)
Split In Batches (done) → Aggregate Results
Aggregate Results → Safety Validation
Safety Validation → HubSpot Batch Update
HubSpot Batch Update → Log Run Complete
```

---

## Credential Requirements

| Service | Credential Type | Scope/Permissions |
|---------|-----------------|-------------------|
| HubSpot | OAuth2 or API Key | `crm.objects.companies.read`, `crm.objects.companies.write` |
| Google Cloud | Service Account | Vertex AI User role |
| PostgreSQL | Connection String | SELECT, INSERT, UPDATE on all tables |

---

## Performance Considerations

1. **Rate Limiting:**
   - HubSpot: 100 requests/10 seconds
   - Vertex AI: Monitor quota in GCP console

2. **Batch Processing:**
   - Process 1 company at a time through AI
   - Batch updates to HubSpot in groups of 100

3. **Timeout Settings:**
   - HTTP Request timeout: 30 seconds
   - Total workflow timeout: Consider n8n settings

---

## Testing Plan

1. **Unit Test (Individual Nodes):**
   - Test HubSpot search filters
   - Test AI prompt with sample data
   - Test validation functions

2. **Integration Test:**
   - Run with 5 test companies
   - Verify expected outputs match

3. **Error Test:**
   - Deliberately cause Vertex AI timeout
   - Test invalid phone/email rejection
   - Verify error logging works

---

## Next Steps

1. Validate task definitions (Phase 3)
2. Create formal task list (Phase 4)
3. Build the workflow (Phase 5)
4. Test and validate (Phase 6)
