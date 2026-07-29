CREATE INDEX IF NOT EXISTS idx_network_code ON clipboards(network_hash, code);
CREATE INDEX IF NOT EXISTS idx_expiry ON clipboards(expires_at);

