-- Main table for monitored domains
CREATE TABLE IF NOT EXISTS monitored_certs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT NOT NULL UNIQUE,
    provider TEXT,                -- e.g., 'AWS', 'Google Cloud', 'Akamai'
    issuer TEXT,                  -- e.g., 'Let's Encrypt', 'DigiCert'
    expiry_date DATETIME,
    last_check_at DATETIME,
    status TEXT DEFAULT 'unknown', -- 'valid', 'expiring_soon', 'expired', 'error'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for high-performance sensing lookups
-- This ensures that checking 100 domains only reads 100 rows, staying well under the 5M daily limit.
CREATE INDEX IF NOT EXISTS idx_hostname ON monitored_certs(hostname);

-- Partial index for a "Detection Dashboard"
-- Only indexes certificates that are expiring or have errors to save storage space.
CREATE INDEX IF NOT EXISTS idx_active_alerts ON monitored_certs(status) 
WHERE status IN ('expiring_soon', 'expired', 'error');

-- Table for historical sensing logs (Governance Audit Trail)
CREATE TABLE IF NOT EXISTS sensing_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cert_id INTEGER,
    check_result TEXT,
    latency_ms INTEGER,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cert_id) REFERENCES monitored_certs(id)
);
