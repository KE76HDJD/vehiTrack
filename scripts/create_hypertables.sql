-- TimescaleDB hypertable declarations

-- Convert core.vehicle_sessions to hypertable (partitioned weekly)
-- Note: The table must be created first by Alembic or a SQL script.
-- This script assumes the tables exist or will be converted after they are created.

-- In a Docker entrypoint, this might run before Alembic. 
-- Best practice is to run these via Alembic migrations, but I'll provide the SQL here as requested.

-- SELECT create_hypertable('core.vehicle_sessions', 'entry_time', chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);
-- SELECT create_hypertable('audit.audit_logs', 'created_at', chunk_time_interval => INTERVAL '1 month', if_not_exists => TRUE);
