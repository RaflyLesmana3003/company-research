# Dashboard Technical Requirements Document (TRD)
# Contact Extraction Metrics Dashboard

## Deployment & Stack

| Component | Specification |
|-----------|--------------|
| Hosting | Vercel (free tier) |
| Framework | Next.js (recommended) |
| Data Source | Direct PostgreSQL connection (Supabase) |
| Auto-refresh | Every 30-60 seconds |

---

## 1. Volume Metrics

| Metric | Source | Query Basis |
|--------|--------|-------------|
| Total companies processed (all time) | `contact_extraction_results` | `COUNT(*)` |
| Total processed (last 7 days) | `contact_extraction_results` | `WHERE extraction_timestamp > NOW() - INTERVAL '7 days'` |
| Total processed (last 30 days) | `contact_extraction_results` | `WHERE extraction_timestamp > NOW() - INTERVAL '30 days'` |
| Success rate | `v_daily_summary` | `successful / total_processed * 100` |
| Data found vs no data | `v_daily_summary` | `successful + partial` vs entries with 0 fields |
| Daily throughput (chart) | `v_daily_summary` | `total_processed` per `processing_date` |

---

## 2. Quality Metrics

| Metric | Source | Query Basis |
|--------|--------|-------------|
| Phone extraction rate | `v_field_extraction_rates` | `phone_rate` (%) |
| Email extraction rate | `v_field_extraction_rates` | `email_rate` (%) |
| Address extraction rate | `v_field_extraction_rates` | `address_rate` (%) |
| Average confidence score | `v_field_extraction_rates` | `avg_confidence` |
| Average fields found | `v_field_extraction_rates` | `avg_fields_found` |
| Fields found distribution | `contact_extraction_results` | `GROUP BY fields_found` (0, 1, 2, 3) |

---

## 3. Error Metrics

| Metric | Source | Query Basis |
|--------|--------|-------------|
| Error count by type | `v_error_summary` | `error_type`, `error_count` (last 30 days) |
| Average retry count | `v_error_summary` | `avg_retries` per error type |
| Recent errors (last 10) | `processing_errors` | `ORDER BY error_timestamp DESC LIMIT 10` |
| Error rate trend | `v_daily_summary` | `failed / total_processed` per day |

---

## 4. CRM Write-Back Metrics

| Metric | Source | Query Basis |
|--------|--------|-------------|
| CRM confirmed writes | `v_crm_update_status` | `crm_confirmed` per day |
| CRM pending writes | `v_crm_update_status` | `crm_pending` per day |
| CRM write-back rate | `v_crm_update_status` | `crm_write_rate` (%) |

---

## 5. Workflow Run Metrics

| Metric | Source | Query Basis |
|--------|--------|-------------|
| Recent runs | `workflow_runs` | `ORDER BY started_at DESC` |
| Run status breakdown | `workflow_runs` | `GROUP BY status` |
| Avg duration per run | `workflow_runs` | `AVG(total_duration_seconds)` |
| Companies per run | `workflow_runs` | `companies_processed`, `companies_successful`, `companies_failed`, `companies_skipped` |

---

## Pre-Built Database Views

The schema already has 4 views ready for the dashboard to query directly:

1. **`v_daily_summary`** - Daily processing counts, success/fail/partial, avg confidence, field counts
2. **`v_error_summary`** - Error type breakdown with counts and avg retries (last 30 days)
3. **`v_field_extraction_rates`** - Phone/email/address extraction percentages (last 30 days)
4. **`v_crm_update_status`** - CRM write-back confirmation rates per day (last 30 days)

---

## Suggested Dashboard Layout

1. **Top row** - KPI cards: Total Processed, Success Rate, Avg Confidence, CRM Write Rate
2. **Middle row** - Daily throughput line chart + Field extraction rate bar chart
3. **Bottom left** - Error summary table (by type)
4. **Bottom right** - Recent runs table with status indicators
