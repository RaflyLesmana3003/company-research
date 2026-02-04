-- Contact Extraction Workflow - PostgreSQL Schema
-- Version: 1.2
-- Purpose: Support deduplication, audit logging, and metrics for n8n contact extraction workflow

-- =============================================================================
-- TABLE 1: contact_extraction_results
-- Main table for storing extraction results and audit trail
-- =============================================================================
CREATE TABLE IF NOT EXISTS contact_extraction_results (
    id SERIAL PRIMARY KEY,
    crm_record_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    domain VARCHAR(255),

    -- Extracted data
    extracted_phone VARCHAR(50),
    extracted_address TEXT,
    extracted_email VARCHAR(255),

    -- Metadata
    extraction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    processing_run_id UUID,
    model_version VARCHAR(50),
    extraction_time_seconds DECIMAL(10,2),

    -- Status
    status VARCHAR(20),
    error_message TEXT,
    crm_updated_at TIMESTAMP WITH TIME ZONE,

    -- Context
    data_sources_used JSONB,
    raw_ai_response TEXT,
    confidence_score DECIMAL(3,2),
    fields_found INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_crm_record_id ON contact_extraction_results(crm_record_id);
CREATE INDEX IF NOT EXISTS idx_processing_run ON contact_extraction_results(processing_run_id);
CREATE INDEX IF NOT EXISTS idx_extraction_date ON contact_extraction_results(extraction_timestamp);
CREATE INDEX IF NOT EXISTS idx_status ON contact_extraction_results(status);

-- =============================================================================
-- TABLE 2: processing_status
-- Tracks processing state per company for deduplication and error management
-- =============================================================================
CREATE TABLE IF NOT EXISTS processing_status (
    crm_record_id VARCHAR(50) PRIMARY KEY,
    last_trigger_timestamp TIMESTAMP WITH TIME ZONE,
    last_processed_timestamp TIMESTAMP WITH TIME ZONE,
    last_error_timestamp TIMESTAMP WITH TIME ZONE,
    processing_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_status VARCHAR(20),
    last_run_id UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TABLE 3: processing_errors
-- Detailed error logging for debugging and monitoring
-- =============================================================================
CREATE TABLE IF NOT EXISTS processing_errors (
    id SERIAL PRIMARY KEY,
    crm_record_id VARCHAR(50) NOT NULL,
    error_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    error_type VARCHAR(50),
    error_message TEXT,
    error_details JSONB,
    processing_run_id UUID,
    retry_count INTEGER DEFAULT 0
);

-- Indexes for error queries
CREATE INDEX IF NOT EXISTS idx_error_crm_id ON processing_errors(crm_record_id);
CREATE INDEX IF NOT EXISTS idx_error_time ON processing_errors(error_timestamp);
CREATE INDEX IF NOT EXISTS idx_error_type ON processing_errors(error_type);

-- =============================================================================
-- TABLE 4: workflow_runs
-- Tracks each workflow execution for dashboard metrics
-- =============================================================================
CREATE TABLE IF NOT EXISTS workflow_runs (
    id SERIAL PRIMARY KEY,
    run_id UUID UNIQUE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'running',
    companies_processed INTEGER DEFAULT 0,
    companies_successful INTEGER DEFAULT 0,
    companies_failed INTEGER DEFAULT 0,
    companies_skipped INTEGER DEFAULT 0,
    total_duration_seconds DECIMAL(10,2),
    trigger_type VARCHAR(20) DEFAULT 'schedule'
);

CREATE INDEX IF NOT EXISTS idx_run_started ON workflow_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_run_status ON workflow_runs(status);

-- =============================================================================
-- VIEWS: For Dashboard Metrics
-- =============================================================================

-- View: Daily processing summary
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
    DATE(extraction_timestamp) as processing_date,
    COUNT(*) as total_processed,
    COUNT(*) FILTER (WHERE status = 'complete') as successful,
    COUNT(*) FILTER (WHERE status = 'error') as failed,
    COUNT(*) FILTER (WHERE status = 'partial') as partial,
    AVG(confidence_score) as avg_confidence,
    AVG(fields_found) as avg_fields_found,
    COUNT(*) FILTER (WHERE extracted_phone IS NOT NULL AND extracted_phone != 'none') as with_phone,
    COUNT(*) FILTER (WHERE extracted_email IS NOT NULL AND extracted_email != 'none') as with_email,
    COUNT(*) FILTER (WHERE extracted_address IS NOT NULL AND extracted_address != 'none') as with_address
FROM contact_extraction_results
GROUP BY DATE(extraction_timestamp)
ORDER BY processing_date DESC;

-- View: Error summary by type
CREATE OR REPLACE VIEW v_error_summary AS
SELECT
    error_type,
    COUNT(*) as error_count,
    MAX(error_timestamp) as last_occurrence,
    AVG(retry_count) as avg_retries
FROM processing_errors
WHERE error_timestamp > NOW() - INTERVAL '30 days'
GROUP BY error_type
ORDER BY error_count DESC;

-- View: Field extraction rates
CREATE OR REPLACE VIEW v_field_extraction_rates AS
SELECT
    COUNT(*) as total_extractions,
    ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_phone IS NOT NULL AND extracted_phone != 'none') / NULLIF(COUNT(*), 0), 2) as phone_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_email IS NOT NULL AND extracted_email != 'none') / NULLIF(COUNT(*), 0), 2) as email_rate,
    ROUND(100.0 * COUNT(*) FILTER (WHERE extracted_address IS NOT NULL AND extracted_address != 'none') / NULLIF(COUNT(*), 0), 2) as address_rate,
    ROUND(AVG(confidence_score), 3) as avg_confidence,
    ROUND(AVG(fields_found), 2) as avg_fields_found
FROM contact_extraction_results
WHERE extraction_timestamp > NOW() - INTERVAL '30 days';

-- View: CRM update verification
-- Shows which records have been confirmed written back to HubSpot
CREATE OR REPLACE VIEW v_crm_update_status AS
SELECT
    DATE(extraction_timestamp) as processing_date,
    COUNT(*) as total_extracted,
    COUNT(*) FILTER (WHERE crm_updated_at IS NOT NULL) as crm_confirmed,
    COUNT(*) FILTER (WHERE crm_updated_at IS NULL AND status != 'error') as crm_pending,
    COUNT(*) FILTER (WHERE status = 'error') as errors,
    ROUND(100.0 * COUNT(*) FILTER (WHERE crm_updated_at IS NOT NULL) / NULLIF(COUNT(*), 0), 2) as crm_write_rate
FROM contact_extraction_results
WHERE extraction_timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(extraction_timestamp)
ORDER BY processing_date DESC;

-- =============================================================================
-- MIGRATION: If upgrading from v1.0, run this to add crm_updated_at index
-- =============================================================================
-- CREATE INDEX IF NOT EXISTS idx_crm_updated ON contact_extraction_results(crm_updated_at);
