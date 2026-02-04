# Contact Extraction Workflow Requirements

## 1. Goal Summary

**Problem:** Extract and validate business contact information (phone, email, physical address) from enriched company data stored in HubSpot CRM.

**Solution:** Build an automated n8n workflow that:
- Fetches companies meeting specific trigger conditions from HubSpot
- Uses Google Vertex AI (Gemini) to extract contact information from scraped website content
- Validates extracted data against strict rules
- Stores results in PostgreSQL for audit/deduplication
- Updates HubSpot CRM records with extracted data

**Beneficiaries:** Sales/marketing teams who need accurate contact information for outreach.

---

## 2. Trigger Configuration

**Type:** Schedule Trigger
**Frequency:** To be determined (likely hourly or daily based on volume)

---

## 3. Integrations & Services

### 3.1 HubSpot CRM (Company Object)
- **Purpose:** Source and destination of company data
- **Auth:** OAuth2 or API Key
- **Operations:**
  - Search companies with complex filter conditions
  - Batch update company properties (max 100 per request)
- **Rate Limits:**
  - 100 requests per 10 seconds
  - 250,000 daily API calls (free tier)

### 3.2 Google Vertex AI (Gemini)
- **Purpose:** AI extraction of contact information from text
- **Model:** gemini-2.0-flash OR gemini-2.5-pro
- **Configuration:**
  - Temperature: 0.5
  - Timeout: 30 seconds per request
- **Auth:** Service Account JSON key

### 3.3 PostgreSQL Database
- **Purpose:** Deduplication tracking, audit logging, metrics storage
- **Tables Required:**
  1. `contact_extraction_results` - Main results storage
  2. `processing_status` - Deduplication tracking
  3. `processing_errors` - Error logging

---

## 4. HubSpot Custom Properties Required

Create these on the Company object:

| Property Name | Type | Purpose |
|---------------|------|---------|
| enrichment_trigger | Date | When enrichment was triggered |
| scraped_website_content | Multi-line text | Scraped website text |
| scraped_contact_page | Multi-line text | Scraped contact page |
| scraped_about_page | Multi-line text | Scraped about page |
| extracted_phone | Single-line text | AI-extracted phone |
| extracted_email | Single-line text | AI-extracted email |
| extracted_address | Multi-line text | AI-extracted address |
| extraction_model | Single-line text | Model version used |
| extraction_timestamp | Date | When extraction performed |
| extraction_confidence | Number | Confidence score 0-1 |
| fields_found_count | Number | Count of non-empty fields (0-3) |
| processing_status | Single-line text | pending/complete/error/partial |
| error_message | Multi-line text | Error details |
| manual_override | Checkbox | Skip automatic processing |
| clearbit_enriched | Checkbox | Already enriched externally |
| clearbit_confidence | Number | External enrichment confidence |

---

## 5. Trigger Conditions (ALL must be met)

1. **enrichment_trigger exists** and is within 6 months
2. **clearbit fields empty:** clearbit_enriched = false, clearbit_confidence is null
3. **extracted fields empty:** extracted_phone, extracted_email, extracted_address all empty
4. **No manual override:** manual_override ≠ true
5. **Has enrichment data:** At least one of scraped_website_content, scraped_contact_page, scraped_about_page exists
6. **Deduplication:** Not processed within last 30 days
7. **Error cooldown:** No errors within last 24 hours
8. **Max retries:** Less than 5 total error attempts

---

## 6. Data Flow

```
┌─────────────────┐
│ Schedule Trigger│
└────────┬────────┘
         ▼
┌─────────────────┐
│ HubSpot Search  │ ← Filter by trigger conditions
└────────┬────────┘
         ▼
┌─────────────────┐
│ PostgreSQL      │ ← Check deduplication (30-day window)
│ Deduplication   │   Check error cooldown (24h)
└────────┬────────┘   Check error count (<5)
         ▼
┌─────────────────┐
│ Vertex AI       │ ← Extract phone, email, address
│ Extraction      │   from scraped content
└────────┬────────┘
         ▼
┌─────────────────┐
│ Data Validation │ ← Validate phone, email, address
│                 │   Replace invalid with "none"
└────────┬────────┘
         ▼
┌─────────────────┐
│ PostgreSQL      │ ← Store extraction results
│ Storage         │   Update processing_status
└────────┬────────┘
         ▼
┌─────────────────┐
│ Batch Prepare   │ ← Group up to 100 companies
└────────┬────────┘
         ▼
┌─────────────────┐
│ Safety Check    │ ← Final validation before update
└────────┬────────┘
         ▼
┌─────────────────┐
│ HubSpot Update  │ ← Batch update company properties
└────────┬────────┘
         ▼
┌─────────────────┐
│ Audit Logging   │ ← Log completion/errors to PostgreSQL
└─────────────────┘
```

---

## 7. AI Output Format (Required)

The Vertex AI prompt must produce output in EXACTLY this format:
```
Phone: <phone_number_with_country_code_no_formatting>
Address: <full_street_address_google_format>
Email: <generic_company_email>
```

If a field cannot be found, return "none" (lowercase).

---

## 8. Data Validation Rules

### 8.1 Phone Validation
- **Length:** 10-20 digits (including country code)
- **Format:** Must start with + or digit, no spaces/parentheses/hyphens in output
- **Reject:**
  - All zeros: `^0{5,}`
  - All ones: `^1{5,}`
  - Sequential: `^123456`
  - Repeated: `^555555`
- **Valid Country Codes:** +1, +44, +61, +64, +49, +33, +81, +86, +91, +65

### 8.2 Email Validation
- **Format:** `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Length:** 5-254 characters
- **Reject:**
  - test@, example@, admin@localhost
  - @test., @example., @localhost
  - noreply@, no-reply@, donotreply@

### 8.3 Address Validation
- **Length:** 10-500 characters
- **Reject:**
  - PO Box patterns (PO Box, P.O. Box, Post Office Box, GPO Box)
  - Test data: ^test, ^example, ^none$, ^n/a$
- **Should contain:** Street number and street type (St, Ave, Rd, Way, etc.)

---

## 9. Test Companies & Expected Results

### 9.1 Patagonia
- **Input:** Contact page with phone, email, HQ address
- **Expected:**
  - Phone: `+18006386464`
  - Address: `259 W Santa Clara St, Ventura, CA 93001, USA`
  - Email: `customerservice@patagonia.com`

### 9.2 Atlassian
- **Input:** About page with HQ address, email (no phone)
- **Expected:**
  - Phone: `none`
  - Address: `Level 6, 341 George Street, Sydney NSW 2000, Australia`
  - Email: `info@atlassian.com`

### 9.3 Basecamp
- **Input:** Website content with all three fields
- **Expected:**
  - Phone: `+13125550123`
  - Address: `30 N Racine Ave #200, Chicago, IL 60607, USA`
  - Email: `support@basecamp.com`

### 9.4 TechStartup XYZ (Edge Case - Minimal Data)
- **Input:** Website content with no contact info
- **Expected:**
  - Phone: `none`
  - Address: `none`
  - Email: `none`

### 9.5 Global Imports Ltd (Edge Case - Invalid Data)
- **Input:** Contact page with invalid data (PO Box, test email, zeros phone)
- **Expected:**
  - Phone: `+442079460958` (valid number, not the zeros)
  - Address: `45 Industrial Way, Manchester M1 2AB, UK` (warehouse, not PO Box)
  - Email: `enquiries@globalimportsltd.co.uk` (not test@example.com)

---

## 10. Error Handling Requirements

### 10.1 Retry Logic
- **Max Retries:** 3 attempts
- **Backoff:** Exponential (2^attempt seconds: 2s, 4s, 8s)
- **Timeout:** 30 seconds per request

### 10.2 Error Types to Handle
- HubSpot API rate limits (429)
- HubSpot API errors (4xx, 5xx)
- Vertex AI timeouts
- Vertex AI quota exceeded
- PostgreSQL connection failures
- Invalid/malformed AI responses

### 10.3 Error Tracking
- Log all errors to `processing_errors` table
- Update `processing_status` table with error count
- Set `processing_status` property to "error" in HubSpot
- Store `error_message` in HubSpot

---

## 11. Metrics Dashboard Requirements

**Deployment:** Vercel (free tier)
**Framework:** User choice (Next.js recommended)
**Data Source:** Direct PostgreSQL connection

### Required Metrics:

**Volume Metrics:**
- Total companies processed (all time, 7 days, 30 days)
- Success rate (completed vs. total)
- Companies with data found vs. no data
- Processing throughput (per hour/day)

**Quality Metrics:**
- Field extraction rates (% phone, % email, % address)
- Average confidence score
- Distribution of fields_found (0, 1, 2, 3)

**Error Metrics:**
- Error count by type
- Average retry count
- Recent errors list (last 10)

**Auto-refresh:** Every 30-60 seconds

---

## 12. Success Criteria

1. ✅ Workflow imports and runs in n8n without errors
2. ✅ All 5 test companies produce expected output format
3. ✅ Invalid data correctly rejected and replaced with "none"
4. ✅ PostgreSQL tables populated with audit data
5. ✅ HubSpot records updated with extracted data
6. ✅ Error handling works (deliberately trigger and recover)
7. ✅ Metrics dashboard displays real-time data
8. ✅ Documentation complete and accurate

---

## 13. Deliverables Checklist

- [ ] `contact-extraction-workflow.json` - n8n workflow export
- [ ] `README.md` - Setup instructions, architecture, prompt design, decisions
- [ ] `schema.sql` - PostgreSQL CREATE TABLE statements
- [ ] Vercel dashboard - Live URL + source code
- [ ] Demo recording - 3-5 minute video showing:
  - Workflow execution from trigger to completion
  - Processing at least 2 test companies
  - HubSpot records updated
  - PostgreSQL audit trail
  - Error handling demonstration

---

## 14. n8n Node Selection

Based on research, these are the confirmed nodes to use:

| Component | Node Type | Purpose |
|-----------|-----------|---------|
| Trigger | `n8n-nodes-base.scheduleTrigger` | Schedule workflow execution |
| HubSpot | `n8n-nodes-base.hubspot` | Search companies, batch update |
| PostgreSQL | `n8n-nodes-base.postgres` | Deduplication, audit logging |
| Vertex AI | `@n8n/n8n-nodes-langchain.lmChatGoogleVertex` | AI extraction via Gemini |
| Code | `n8n-nodes-base.code` | Data validation, transformation |
| Control Flow | `n8n-nodes-base.if`, `n8n-nodes-base.splitInBatches` | Conditional logic, batching |

---

## 15. Confirmed Configuration Decisions

| Setting | Decision | Rationale |
|---------|----------|-----------|
| Schedule Frequency | Every 6 hours | Balance of timeliness and API usage (4x/day) |
| AI Model | gemini-2.5-pro | Higher quality extraction, better reasoning |
| Database Provider | Supabase | Free tier, easy setup, built-in connection pooling |
| Dashboard Framework | Next.js | Industry standard, excellent Vercel integration |
| Batch Size | 100 companies/run | HubSpot batch API limit |

---

## 16. Phase 1 Complete

**Status:** Requirements gathered and confirmed
**Next Phase:** Planning (Phase 2)
**Documented:** 2024 (see timestamp)
