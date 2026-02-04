# Company Contact Information Extraction Service

**Dashboard:** [sme-venture.vercel.app](https://sme-venture.vercel.app)

An automated n8n workflow that extracts and validates business contact information (phone, email, address) from enriched company data using AI, then safely updates HubSpot CRM records.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [AI Prompt Design](#ai-prompt-design)
- [Data Validation Rules](#data-validation-rules)
- [Error Handling Strategy](#error-handling-strategy)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)

---

## Architecture Overview

### System Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Orchestration | n8n | Workflow automation |
| AI Provider | Google Vertex AI (Gemini 2.5 Pro) | Contact extraction |
| CRM | HubSpot | Company data source & destination |
| Database | PostgreSQL | Audit logging & deduplication |

### Data Flow Diagram

```
┌─────────────────┐
│ Schedule Trigger│ (Every 6 hours)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HubSpot Search  │ Search companies needing extraction
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PostgreSQL      │ Check deduplication status
│ Dedup Check     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Apply Dedup     │ Filter based on 8 trigger conditions
│ Rules (Code)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Split Batches   │ Process one company at a time
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Agent        │ Gemini 2.5 Pro + Tools
│ (Extraction)    │ - HTTP Request Tool
└────────┬────────┘ - Deep Research Tool
         ▼
┌─────────────────┐
│ Data Validation │ Phone, Email, Address rules
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Store │ │ Log   │
│Result │ │Error  │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Update Status   │ PostgreSQL processing_status
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aggregate       │ Collect all results
│ Results         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Safety          │ Batch preparation (max 100)
│ Validation      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HubSpot Batch   │ Update CRM records
│ Update          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update CRM      │ Set crm_updated_at timestamp
│ Timestamp       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Log Run         │ Audit trail
│ Complete        │
└─────────────────┘
```

### Workflow Nodes Summary

| Node | Type | Purpose |
|------|------|---------|
| Schedule Trigger | scheduleTrigger | Runs every 6 hours |
| Crypto | crypto | Generates UUID for run_id |
| Initialize Run | set | Sets run_id, started_at, six_months_ago |
| HubSpot Search with Pagination | code | Fetches all eligible companies with internal pagination |
| Check Dedup Status | postgres | Queries processing_status |
| Apply Dedup Rules | code | Implements 8 trigger conditions |
| Split In Batches | splitInBatches | Sequential company processing |
| Prepare AI Input | set | Formats data for AI, records extraction start time |
| AI Agent | langchain.agent | Orchestrates extraction |
| Google Vertex Chat Model | lmChatGoogleVertex | Gemini 2.5 Pro |
| HTTP Request Tool | httpRequestTool | Fetches company pages |
| Deep Research Tool | toolCode | Email pattern generation |
| Structured Output Parser | outputParserStructured | JSON parsing |
| Process Agent Output | code | Extracts fields, computes extraction_time_seconds |
| Validate Data | code | Applies validation rules |
| Check Valid | if | Routes valid/invalid |
| Store Result | postgres | Saves to contact_extraction_results |
| Log Error | postgres | Logs to processing_errors |
| Update Status | postgres | Updates processing_status with last_trigger_timestamp |
| Carry Forward Data | code | Preserves extraction data through batch loop |
| Aggregate Results | aggregate | Collects batch data |
| Safety Validation | code | Prepares HubSpot payload, computes companies_skipped |
| HubSpot Batch Update | httpRequest | Updates CRM |
| Update CRM Timestamp | postgres | Sets crm_updated_at after successful CRM update |
| Log Run Complete | postgres | Records run metrics with skipped count |

---

## Setup Instructions

### Prerequisites

- n8n instance (self-hosted or cloud)
- HubSpot free sandbox account
- Google Cloud account with Vertex AI enabled
- PostgreSQL database (Supabase, Neon, Railway, or local)

### 1. PostgreSQL Database Setup

1. Create a new PostgreSQL database
2. Run the schema creation script:

```bash
psql -h your-host -U your-user -d your-database -f schema.sql
```

This creates:
- `contact_extraction_results` - Main results table
- `processing_status` - Deduplication tracking
- `processing_errors` - Error logging
- `workflow_runs` - Run metrics
- Views for dashboard metrics

### 2. HubSpot Configuration

1. Create a free HubSpot sandbox account at https://app.hubspot.com/signup
2. Navigate to Settings > Properties > Company
3. Create these custom properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| enrichment_trigger | Date | Timestamp when enrichment was triggered |
| scraped_website_content | Multi-line text | Scraped website text |
| scraped_contact_page | Multi-line text | Scraped contact page |
| scraped_about_page | Multi-line text | Scraped about page |
| extracted_phone | Single-line text | AI-extracted phone |
| extracted_email | Single-line text | AI-extracted email |
| extracted_address | Multi-line text | AI-extracted address |
| extraction_model | Single-line text | Model version used |
| extraction_timestamp | Date | When extraction performed |
| extraction_confidence | Number | Confidence score 0-1 |
| fields_found_count | Number | Count of fields (0-3) |
| processing_status | Single-line text | pending/complete/error/partial |
| error_message | Multi-line text | Error details |
| manual_override | Single checkbox | Skip automatic processing |
| clearbit_enriched | Single checkbox | Already enriched externally |
| clearbit_confidence | Number | External enrichment confidence |

4. Create a private app with these scopes:
   - `crm.objects.companies.read`
   - `crm.objects.companies.write`

### 3. Google Vertex AI Setup

1. Create a Google Cloud project
2. Enable the Vertex AI API
3. Create a service account with Vertex AI User role
4. Download the JSON key file
5. In n8n, create a Google credential using the service account

### 4. n8n Workflow Import

1. Import `workflows/contact-extraction-workflow.json`
2. Configure credentials:
   - **HubSpot**: Add your private app access token
   - **PostgreSQL**: Add database connection details
   - **Google Vertex AI**: Add Vertex AI service account (project: chrystalesia)

### 5. Test the Workflow

1. Create test companies in HubSpot with mock enrichment data
2. Set `enrichment_trigger` to current date
3. Manually execute the workflow
4. Verify results in HubSpot and PostgreSQL

---

## AI Prompt Design

### System Prompt

```
You are an expert contact information extraction agent. Your primary job is to
extract verified phone numbers, email addresses, and physical addresses from
pre-scraped company data.

## YOUR TOOLS
1. **HTTP Request** - Fetch specific web pages from the company domain if
   pre-scraped content is missing data
2. **Deep Research Tool** - Generate common business email patterns for a domain
   as a last resort

## EXTRACTION STRATEGY

### Step 1: Analyze Pre-Scraped Content (ALWAYS do this first)
- Carefully read ALL provided scraped content (website, contact page, about page)
- Extract any phone numbers, emails, and addresses present
- This is your PRIMARY data source

### Step 2: Direct Page Fetch (ONLY if pre-scraped content has gaps)
If a field is still missing after Step 1, try fetching:
- `https://[domain]/contact` or `/contact-us`
- `https://[domain]/about` or `/about-us`

### Step 3: Email Pattern Check (ONLY if no email found)
Use the Deep Research Tool with the company domain to generate email pattern
candidates. Only use patterns that are common for the company type.

## EXTRACTION RULES
1. **Accuracy First**: Only extract information you can verify. Never guess.
2. **Phone Numbers**: Include country code, remove all formatting.
   Example: +18005551234
3. **Addresses**: Full format with country.
   Example: 259 W Santa Clara St, Ventura, CA 93001, United States
4. **Emails**: Prefer general company emails (info@, contact@, hello@, support@,
   customerservice@) over personal emails
5. **Reject Invalid Data**:
   - PO Box addresses (extract physical address instead)
   - Generic test emails like test@example.com
   - Phone numbers like 0000000000 or 1234567890
   - Fax numbers should NOT be used as phone numbers
   - noreply@, no-reply@, donotreply@ emails

## CONFIDENCE SCORING
- Data from pre-scraped official content: 0.85-1.0
- Data from fetched company pages: 0.70-0.85
- Email from pattern generation: 0.40-0.60
- No data found: 0.0

## OUTPUT FORMAT
Return a structured JSON with exactly these fields:
- phone: string (with country code, no formatting) or "none"
- address: string (full address) or "none"
- email: string (company email) or "none"
- confidence: number (0.0 to 1.0)
- sources: array of strings describing where each piece of info came from
```

### User Prompt Template

```
Extract verified contact information (phone, email, address) for this company
from the provided data.

## TARGET COMPANY
- **Name:** {{ company_name }}
- **Domain:** {{ domain }}
- **Location:** {{ city }}, {{ state }}, {{ country }}

## PRE-SCRAPED CONTENT
<website_content>
{{ scraped_website_content || 'Not available' }}
</website_content>

<contact_page>
{{ scraped_contact_page || 'Not available' }}
</contact_page>

<about_page>
{{ scraped_about_page || 'Not available' }}
</about_page>

## INSTRUCTIONS
1. First, extract all contact info from the pre-scraped content above
2. If any field is missing, use HTTP Request to fetch https://[domain]/contact
   or /about
3. If no email found at all, use Deep Research Tool with "[domain]" as fallback
4. Reject invalid data: PO Boxes, test@example.com, 0000000000, noreply@ emails
5. Return "none" for any field that cannot be verified
```

### Model Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Model | gemini-2.5-pro | Higher quality extraction, better reasoning |
| Temperature | 0.5 | Balanced creativity/consistency per TRD |
| Max Output Tokens | 2048 | Sufficient for structured response |
| Max Iterations | 10 | Allow multiple tool uses |

---

## Data Validation Rules

### Phone Number Validation

```javascript
// Valid country codes
const VALID_COUNTRY_CODES = ['1', '44', '61', '64', '49', '33', '81', '86', '91', '65'];

// Rules applied:
- Length: 10-20 digits (including country code)
- Format: Must start with + or digit, no spaces/parentheses/hyphens in output
- Reject: All zeros (^0{5,})
- Reject: All ones (^1{5,})
- Reject: Sequential (^123456)
- Reject: Repeated (555555 or any digit repeated 6+ times)
- Require: Valid country code prefix
```

### Email Validation

```javascript
// Rules applied:
- Valid format: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
- Length: 5-254 characters
- Exactly one @ symbol
- Reject prefixes: test@, example@, noreply@, no-reply@, donotreply@, admin@localhost
- Reject domains: @test., @example., @localhost
```

### Address Validation

```javascript
// Rules applied:
- Length: 10-500 characters
- Reject: PO Box patterns (PO Box, P.O. Box, Post Office Box, GPO Box)
- Reject: Test data (^test, ^example, ^none$, ^n/a$)
- Require: Street number (digits present)
- Require: Street type indicator (St, Ave, Rd, Way, Blvd, Dr, Ln, etc.)
```

---

## Error Handling Strategy

### Retry Logic

| Component | Max Retries | Wait Between | Timeout |
|-----------|-------------|--------------|---------|
| HubSpot Search | 3 | 4 seconds | 30 seconds |
| AI Agent | 3 | 4 seconds | 30 seconds |
| HubSpot Batch Update | 3 | 4 seconds | 30 seconds |
| PostgreSQL Queries | Auto | Built-in | Default |

### Error Flow

```
1. Node Error Occurs
   │
   ├── Retry up to 3 times with 4s delay
   │
   ├── On persistent failure:
   │   │
   │   ├── Log to processing_errors table
   │   │   - error_type
   │   │   - error_message
   │   │   - error_details (JSONB)
   │   │   - processing_run_id
   │   │
   │   ├── Update processing_status
   │   │   - last_error_timestamp = NOW()
   │   │   - error_count += 1
   │   │   - last_status = 'error'
   │   │
   │   └── Set error_message in HubSpot
   │
   └── Continue workflow (onError: continueRegularOutput)
```

### Deduplication & Cooldown

- **30-day window**: Don't reprocess companies processed within 30 days
- **24-hour error cooldown**: Skip companies with errors in last 24 hours
- **5 error limit**: Stop processing after 5 cumulative errors
- **6-month trigger expiry**: Ignore enrichment triggers older than 6 months

---

## Design Decisions

### 1. AI Agent vs Direct API

**Decision**: Use LangChain Agent with tools instead of direct Gemini API

**Rationale**:
- Agent can autonomously search for missing information
- Multiple tools (HTTP Request, Deep Research) provide verification
- Handles edge cases where scraped data is incomplete
- More robust than single prompt extraction

### 2. Internal Pagination in Code Node

**Decision**: Handle HubSpot search pagination inside a single Code node using a do-while loop, rather than using n8n's splitInBatches for the search phase

**Rationale**:
- n8n's `splitInBatches` requires an input LIST of items to iterate over; it cannot be used as a do-while loop with a single trigger item
- The HubSpot CRM Search API returns paginated results (100 per page) with a cursor-based `paging.next.after` token
- A Code node with `this.helpers.httpRequestWithAuthentication` handles pagination internally, collecting all pages into a single results array
- Maximum 50 pages (5,000 companies) per run as a safety limit
- The downstream `splitInBatches` (for AI extraction) correctly receives the individual company items after dedup filtering

### 3. Batch Size of 1

**Decision**: Process companies one at a time in the extraction loop

**Rationale**:
- AI Agent with tools is resource-intensive
- Prevents rate limiting on external APIs
- Easier error isolation and recovery
- HubSpot batch update handles batching for CRM writes (100 per batch)

### 4. PostgreSQL for State Management

**Decision**: Use PostgreSQL for deduplication instead of HubSpot-only tracking

**Rationale**:
- Faster querying than HubSpot API
- Supports complex deduplication logic
- Enables detailed audit trail
- Powers metrics dashboard
- Decouples processing state from CRM data

### 5. Structured Output Parser with Dual-Format Parsing

**Decision**: Use LangChain's structured output parser with JSON schema as primary format, with fallback parsing for the `Phone:/Address:/Email:` text format specified in the requirements

**Rationale**:
- The PDF specifies a `Phone:/Address:/Email:` text output format (Section 3.1)
- JSON structured output is more reliable for programmatic parsing and reduces post-processing errors
- The `Process Agent Output` node handles both formats: JSON from the structured parser (primary path) and `Phone:/Address:/Email:` regex parsing (fallback path)
- This dual approach ensures robustness regardless of which format the AI model returns
- Error detection: AI Agent errors (timeouts, parse failures) are caught and routed to the error branch with proper `error_count` increment

### 6. Safety Validation Layer

**Decision**: Separate safety validation before HubSpot update

**Rationale**:
- Final check before CRM modification
- Batches updates for efficiency (max 100 per API call)
- Filters out invalid records
- Counts success/failure metrics

### 7. PostgreSQL Retry Strategy

**Decision**: Disable retries on PostgreSQL nodes, enable retries only on external API calls (HubSpot, Vertex AI)

**Rationale**:
- PostgreSQL (Supabase) operates on managed infrastructure with built-in connection pooling
- Database transient errors are rare compared to external API failures (rate limits, network)
- Retrying failed DB writes could cause duplicate inserts if the INSERT succeeded but the response was lost
- The `ON CONFLICT` clauses in `Update Status` provide idempotent upsert behavior
- External API nodes (HubSpot Search, AI Agent, HubSpot Batch Update) use 3 retries with 4-second fixed delay

### 8. Temperature Setting (0.5)

**Decision**: Use 0.5 temperature as specified in TRD

**Rationale**:
- Balanced between consistency and finding creative solutions
- Higher than typical extraction (0.0-0.3) to allow tool use flexibility
- Lower than creative tasks (0.7+) to maintain accuracy

---

## Known Limitations

### 1. No True Exponential Backoff

n8n's built-in retry mechanism only supports fixed intervals, not true exponential backoff (2^attempt seconds as specified in the PDF). The implementation uses a 4-second fixed delay between retries on external API calls (HubSpot, Vertex AI), which approximates the average of the 2s/4s/8s exponential sequence. PostgreSQL nodes do not use retries since they are local database operations.

**Why not Code-node retry?** Implementing custom exponential backoff in Code nodes would add significant complexity for minimal gain, since n8n's native retry already handles transient failures. The 4-second fixed delay provides a reasonable middle ground.

### 2. Rate Limiting

HubSpot free tier: 100 requests/10 seconds, 250,000/day
Vertex AI: Subject to quota limits

**Mitigation**: Batch processing with controlled throughput.

### 3. Address Validation - International Support

Street indicator validation supports both English and international street types (Strasse/Straße, Rue, Via, Calle, Avenida, Camino, Platz, Piazza, Prospekt, Ulitsa, Jalan, Soi, Marg) as well as building indicators (Level, Floor, Suite, Unit, Apt, Industrial). Some less common international address formats may still be rejected.

**Future improvement**: Add region-specific validation profiles.

### 4. No Real-time Processing

Schedule-based trigger (every 6 hours) means delays between enrichment and extraction.

**Alternative**: Add webhook trigger for immediate processing.

### 5. Single-threaded Processing

Companies processed sequentially, limiting throughput.

**Future improvement**: Implement parallel processing with rate limiting.

### 6. Tool Reliability

External HTTP requests to company domains may time out or return unexpected results.

**Mitigation**: Agent falls back to scraped content; Deep Research Tool generates email patterns as last resort; validation catches bad data.

---

## Metrics Dashboard

A Next.js dashboard for monitoring the extraction pipeline in real time. See [`dashboard/README.md`](dashboard/README.md) for setup and details.

**Key features:**
- KPI cards (total processed, success rate, throughput)
- Field extraction rate and confidence histograms
- CRM writeback status tracking
- Error breakdown and trend charts
- Extracted data detail table
- Dark mode support

---

## Project Structure

```
.
├── dashboard/          # Next.js metrics dashboard
├── database/           # PostgreSQL schema (schema.sql)
├── docs/               # Requirements, design docs, TRD
├── tests/              # Test cases and validation results
└── workflow/           # n8n workflow JSON files
```

## Files

| File | Description |
|------|-------------|
| `workflow/contact-extraction-workflow.json` | Main n8n workflow |
| `database/schema.sql` | PostgreSQL schema |
| `dashboard/` | Next.js monitoring dashboard |
| `docs/requirements-contact-extraction.md` | Requirements doc |
| `docs/design-contact-extraction.md` | Design doc |
| `docs/dashboard_trd.md` | Dashboard technical requirements |
| `tests/test-cases-contact-extraction.md` | Test cases |

---

## License

Confidential - SMEVentures Technical Assessment
