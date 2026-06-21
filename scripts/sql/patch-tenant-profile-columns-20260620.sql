-- Hotfix: tenant_settings / tenant_organization profile columns (v2.0 address & description)
-- Run when API returns 500: "column t1_0.city does not exist" on tenant-settings or tenant-organizations.
-- PostgreSQL. Safe to re-run (IF NOT EXISTS).

-- tenant_settings (legacy read fallback columns)
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS description varchar(1000);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS city varchar(255);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS address_line_1 varchar(255);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS address_line_2 varchar(255);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS state_province varchar(100);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS zip_code varchar(20);
ALTER TABLE tenant_settings ADD COLUMN IF NOT EXISTS country varchar(100);

-- tenant_organization (canonical identity columns)
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS description varchar(1000);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS address_line_1 varchar(255);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS address_line_2 varchar(255);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS city varchar(255);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS state_province varchar(255);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS zip_code varchar(20);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS country varchar(100);
ALTER TABLE tenant_organization ADD COLUMN IF NOT EXISTS website_url varchar(1024);
