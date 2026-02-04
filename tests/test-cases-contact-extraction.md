# Contact Extraction Workflow - Test Cases

## Test Environment

| Component | Details |
|-----------|---------|
| Workflow | `contact-extraction-workflow.json` |
| AI Model | Google Vertex AI - gemini-2.5-pro |
| Project | chrystalesia |
| Database | PostgreSQL (Supabase) |
| CRM | HubSpot |

---

## TC-01: Patagonia (Full Contact Info)

**Category:** Happy Path
**Input:** Contact page with phone, email, HQ address

### Input Data

```
Company: Patagonia
CRM Record ID: test-patagonia-001
scraped_contact_page: Contains customer service phone number 1-800-638-6464,
  headquarters at 259 W Santa Clara St, Ventura, CA 93001, USA,
  and customer service email customerservice@patagonia.com
```

### Expected Output

| Field | Expected Value |
|-------|---------------|
| extracted_phone | `+18006386464` |
| extracted_address | `259 W Santa Clara St, Ventura, CA 93001, USA` |
| extracted_email | `customerservice@patagonia.com` |
| fields_found | `3` |
| status | `complete` |
| confidence_score | `>= 0.8` |
| validation_passed | `true` |

### Validation Checks

- [x] Phone starts with valid country code (+1)
- [x] Phone has no formatting characters
- [x] Phone length 10-20 digits
- [x] Email matches regex pattern
- [x] Email is not a rejected pattern (noreply, test, etc.)
- [x] Address contains street number and type
- [x] Address is not a PO Box
- [x] Status is `complete` (3 fields found)

---

## TC-02: Atlassian (Missing Phone)

**Category:** Partial Data
**Input:** About page with HQ address, email, no phone number

### Input Data

```
Company: Atlassian
CRM Record ID: test-atlassian-001
scraped_about_page: Atlassian is headquartered at Level 6, 341 George Street,
  Sydney NSW 2000, Australia. For general inquiries contact info@atlassian.com.
  No phone number listed on public pages.
```

### Expected Output

| Field | Expected Value |
|-------|---------------|
| extracted_phone | `none` |
| extracted_address | `Level 6, 341 George Street, Sydney NSW 2000, Australia` |
| extracted_email | `info@atlassian.com` |
| fields_found | `2` |
| status | `partial` |
| confidence_score | `>= 0.6` |
| validation_passed | `true` |

### Validation Checks

- [x] Phone correctly returned as `none` (not fabricated)
- [x] Email matches regex pattern
- [x] Address contains street information
- [x] Status is `partial` (2 of 3 fields found)
- [x] fields_found is 2

---

## TC-03: Basecamp (All Three Fields)

**Category:** Happy Path
**Input:** Website content with all three fields

### Input Data

```
Company: Basecamp
CRM Record ID: test-basecamp-001
scraped_website_content: Basecamp LLC, 30 N Racine Ave #200, Chicago, IL 60607, USA.
  Phone: +1-312-555-0123. Email: support@basecamp.com.
```

### Expected Output

| Field | Expected Value |
|-------|---------------|
| extracted_phone | `+13125550123` |
| extracted_address | `30 N Racine Ave #200, Chicago, IL 60607, USA` |
| extracted_email | `support@basecamp.com` |
| fields_found | `3` |
| status | `complete` |
| confidence_score | `>= 0.8` |
| validation_passed | `true` |

### Validation Checks

- [x] Phone starts with valid country code (+1)
- [x] Phone formatting removed (no hyphens)
- [x] Email matches regex pattern
- [x] Address contains street number and type
- [x] Status is `complete` (3 fields found)

---

## TC-04: TechStartup XYZ (No Contact Info)

**Category:** Edge Case - Minimal Data
**Input:** Website content with no contact information

### Input Data

```
Company: TechStartup XYZ
CRM Record ID: test-techstartup-001
scraped_website_content: TechStartup XYZ builds innovative AI solutions.
  Our platform leverages machine learning to automate business processes.
  Join our waitlist for early access.
```

### Expected Output

| Field | Expected Value |
|-------|---------------|
| extracted_phone | `none` |
| extracted_address | `none` |
| extracted_email | `none` |
| fields_found | `0` |
| status | `partial` |
| confidence_score | `<= 0.3` |
| validation_passed | `true` |

### Validation Checks

- [x] All three fields returned as `none`
- [x] AI did not fabricate/hallucinate contact info
- [x] fields_found is 0
- [x] Status is `partial` (0 < 3 fields)
- [x] No error thrown despite no data

---

## TC-05: Global Imports Ltd (Invalid Data Mixed with Valid)

**Category:** Edge Case - Invalid Data
**Input:** Contact page with mix of invalid and valid data (PO Box, test email, all-zeros phone alongside valid alternatives)

### Input Data

```
Company: Global Imports Ltd
CRM Record ID: test-globalimports-001
scraped_contact_page: Global Imports Ltd.
  Phone: 00000000000 | Warehouse Phone: +44 207 946 0958
  Mailing: PO Box 12345, Manchester, UK
  Warehouse: 45 Industrial Way, Manchester M1 2AB, UK
  Email: test@example.com | Business: enquiries@globalimportsltd.co.uk
```

### Expected Output

| Field | Expected Value |
|-------|---------------|
| extracted_phone | `+442079460958` |
| extracted_address | `45 Industrial Way, Manchester M1 2AB, UK` |
| extracted_email | `enquiries@globalimportsltd.co.uk` |
| fields_found | `3` |
| status | `complete` |
| confidence_score | `>= 0.7` |
| validation_passed | `true` |

### Validation Checks

- [x] Phone: All-zeros number rejected, valid +44 number selected
- [x] Phone: Country code +44 is in valid list
- [x] Address: PO Box rejected, physical warehouse address selected
- [x] Email: test@example.com rejected, business email selected
- [x] Status is `complete` (3 valid fields after filtering)

---

## Validation Rule Test Cases

### VR-01: Phone Validation

| Test | Input | Expected | Rule |
|------|-------|----------|------|
| Valid US | `+18006386464` | Pass | Valid +1 country code, 11 digits |
| Valid UK | `+442079460958` | Pass | Valid +44 country code |
| All zeros | `00000000000` | Reject -> `none` | Matches `^0{5,}` |
| All ones | `11111111111` | Reject -> `none` | Matches `^1{5,}` |
| Sequential | `12345678901` | Reject -> `none` | Matches `^123456` |
| Repeated | `55555555555` | Reject -> `none` | Matches `^555555` |
| Too short | `+1234` | Reject -> `none` | < 10 digits |
| Too long | `+1234567890123456789012` | Reject -> `none` | > 20 digits |
| With formatting | `+1 (800) 638-6464` | Strip to `+18006386464` | Remove non-digits (keep +) |

### VR-02: Email Validation

| Test | Input | Expected | Rule |
|------|-------|----------|------|
| Valid generic | `info@atlassian.com` | Pass | Valid format |
| Valid support | `support@basecamp.com` | Pass | Valid format |
| test@ prefix | `test@example.com` | Reject -> `none` | Rejected prefix |
| noreply@ | `noreply@company.com` | Reject -> `none` | Rejected prefix |
| no-reply@ | `no-reply@company.com` | Reject -> `none` | Rejected prefix |
| @localhost | `admin@localhost` | Reject -> `none` | Rejected domain |
| @example. | `user@example.com` | Reject -> `none` | Rejected domain |
| Too short | `a@b` | Reject -> `none` | < 5 characters |
| Invalid format | `not-an-email` | Reject -> `none` | No @ sign |

### VR-03: Address Validation

| Test | Input | Expected | Rule |
|------|-------|----------|------|
| Valid street | `259 W Santa Clara St, Ventura, CA 93001` | Pass | Has street number + type |
| PO Box | `PO Box 12345, City, ST` | Reject -> `none` | PO Box pattern |
| P.O. Box | `P.O. Box 999, City, ST` | Reject -> `none` | PO Box pattern |
| GPO Box | `GPO Box 100, Sydney` | Reject -> `none` | GPO Box pattern |
| Test data | `test address` | Reject -> `none` | Starts with test |
| Too short | `123 Main` | Reject -> `none` | < 10 characters |
| None literal | `none` | Pass as `none` | Already none |

---

## Error Handling Test Cases

### EH-01: AI Response Parse Failure

**Scenario:** AI returns unstructured response that doesn't match `Phone:/Address:/Email:` format
**Expected:**
- `parse_success` = `false`
- Route to error branch
- Error logged to `processing_errors` table
- `processing_status` set to `error`

### EH-02: AI Timeout

**Scenario:** Vertex AI request exceeds 30-second timeout
**Expected:**
- Retry up to 3 times with exponential backoff (2s, 4s, 8s)
- If all retries fail, log error as `ai_timeout` type
- Update `error_count` in `processing_status`

### EH-03: HubSpot Rate Limit (429)

**Scenario:** HubSpot API returns 429 Too Many Requests
**Expected:**
- Retry up to 3 times with backoff
- If persistent, log error as `hubspot_rate_limit` type
- Remaining companies still processed

### EH-04: Deduplication Skip

**Scenario:** Company was processed within last 30 days
**Expected:**
- Company filtered out by PostgreSQL deduplication check
- Not sent to AI extraction
- No error logged (normal skip behavior)

### EH-05: Error Cooldown

**Scenario:** Company had an error within last 24 hours
**Expected:**
- Company filtered out by error cooldown check
- Not reprocessed until 24h passed
- No additional error logged

### EH-06: Max Retries Exceeded

**Scenario:** Company has 5+ errors in processing_status
**Expected:**
- Company filtered out by max retries check
- Not reprocessed until manual intervention
- Existing errors preserved

---

## Database Verification Queries

### After successful run (TC-01 through TC-05):

```sql
-- Verify extraction results stored
SELECT crm_record_id, company_name, status, fields_found, confidence_score,
       extracted_phone, extracted_email, extracted_address
FROM contact_extraction_results
WHERE processing_run_id = '<run_id>'
ORDER BY crm_record_id;

-- Verify processing_status updated
SELECT crm_record_id, last_status, processing_count, error_count
FROM processing_status
WHERE crm_record_id IN (
  'test-patagonia-001', 'test-atlassian-001', 'test-basecamp-001',
  'test-techstartup-001', 'test-globalimports-001'
);

-- Verify workflow_runs tracked
SELECT run_id, status, companies_processed, companies_successful,
       companies_failed, companies_skipped
FROM workflow_runs
WHERE run_id = '<run_id>';

-- Check for errors
SELECT crm_record_id, error_type, error_message
FROM processing_errors
WHERE processing_run_id = '<run_id>';
```

### Expected database state after TC-01 through TC-05:

| crm_record_id | status | fields_found |
|----------------|--------|-------------|
| test-patagonia-001 | complete | 3 |
| test-atlassian-001 | partial | 2 |
| test-basecamp-001 | complete | 3 |
| test-techstartup-001 | partial | 0 |
| test-globalimports-001 | complete | 3 |

---

## HubSpot Verification

After batch update, verify these properties on each company record:

| Property | TC-01 | TC-02 | TC-03 | TC-04 | TC-05 |
|----------|-------|-------|-------|-------|-------|
| extracted_phone | +18006386464 | none | +13125550123 | none | +442079460958 |
| extracted_email | customerservice@patagonia.com | info@atlassian.com | support@basecamp.com | none | enquiries@globalimportsltd.co.uk |
| extracted_address | 259 W Santa Clara St... | Level 6, 341 George St... | 30 N Racine Ave #200... | none | 45 Industrial Way... |
| processing_status | complete | partial | complete | partial | complete |
| fields_found_count | 3 | 2 | 3 | 0 | 3 |
| extraction_model | gemini-2.5-pro | gemini-2.5-pro | gemini-2.5-pro | gemini-2.5-pro | gemini-2.5-pro |
| extraction_confidence | >= 0.8 | >= 0.6 | >= 0.8 | <= 0.3 | >= 0.7 |

---

## Status Logic Verification

| fields_found | parse_success | Expected Status | Route |
|-------------|---------------|-----------------|-------|
| 3 | true | `complete` | Success branch |
| 2 | true | `partial` | Success branch |
| 1 | true | `partial` | Success branch |
| 0 | true | `partial` | Success branch |
| - | false | `error` | Error branch |
