-- Clean up migration history
-- This script removes all migration records except the initial schema
-- Run this in the Supabase Dashboard SQL Editor

-- Delete all migration records except the initial schema
DELETE FROM supabase_migrations.schema_migrations
WHERE version != '20250713182420';

-- Verify only the initial schema migration remains
SELECT version, name FROM supabase_migrations.schema_migrations
ORDER BY version;
