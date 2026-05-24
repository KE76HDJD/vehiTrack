-- =============================================================================
-- VEHITRACK PRO — Database Initialization Script
-- Version: 1.0 | Mai 2026
-- Usage: psql -U postgres -f init_db.sql
--        ou étape par étape dans psql
-- =============================================================================


-- =============================================================================
-- ÉTAPE 1 — BASE DE DONNÉES & UTILISATEUR
-- =============================================================================

-- Créer la base de données
CREATE DATABASE vehitrack
    ENCODING 'UTF8'
    LC_COLLATE 'C.UTF-8'
    LC_CTYPE 'C.UTF-8'
    TEMPLATE template0;

-- Créer l'utilisateur applicatif (adapter le mot de passe)
CREATE USER vehitrack_user WITH PASSWORD 'yaokouma';

-- Accorder les droits sur la base
GRANT ALL PRIVILEGES ON DATABASE vehitrack TO vehitrack_user;

-- Se connecter à la base
\c vehitrack


-- =============================================================================
-- ÉTAPE 2 — EXTENSIONS POSTGRESQL
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
-- TimescaleDB : décommenter si installé sur le système
-- CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;


-- =============================================================================
-- ÉTAPE 3 — SCHÉMAS (namespaces)
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS access_ctrl;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Droits d'accès pour l'utilisateur applicatif
GRANT USAGE ON SCHEMA core, access_ctrl, analytics, audit TO vehitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA core        GRANT ALL ON TABLES TO vehitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA access_ctrl GRANT ALL ON TABLES TO vehitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics   GRANT ALL ON TABLES TO vehitrack_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit       GRANT ALL ON TABLES TO vehitrack_user;


-- =============================================================================
-- ÉTAPE 4 — TYPES ENUM
-- =============================================================================

-- Rôles employés
CREATE TYPE core.employee_role AS ENUM ('gardien', 'employe', 'manager', 'admin');

-- Types de véhicules
CREATE TYPE core.vehicle_type AS ENUM ('car', 'motorcycle', 'truck', 'van', 'vip', 'emergency');

-- Types et statuts de slots parking
CREATE TYPE core.slot_type   AS ENUM ('standard', 'pmr', 'vip', 'motorcycle', 'truck');
CREATE TYPE core.slot_status AS ENUM ('available', 'occupied', 'reserved', 'maintenance');

-- Statuts de session véhicule
CREATE TYPE core.session_status AS ENUM ('active', 'completed', 'force_closed', 'anomaly');

-- Statuts de réservation
CREATE TYPE core.reservation_status AS ENUM ('confirmed', 'cancelled', 'used', 'expired', 'no_show');

-- Alertes
CREATE TYPE core.alert_type AS ENUM (
    'unauthorized_access', 'overstay', 'ocr_failure',
    'iot_disconnected', 'intrusion', 'unknown_plate'
);
CREATE TYPE core.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE core.alert_status   AS ENUM ('open', 'acknowledged', 'resolved', 'escalated');

-- Rapports
CREATE TYPE core.report_status AS ENUM ('pending', 'generating', 'completed', 'failed');

-- Niveaux d'accès
CREATE TYPE access_ctrl.access_level AS ENUM ('standard', 'vip', 'temporary', 'emergency');


-- =============================================================================
-- ÉTAPE 5 — TABLES SCHÉMA core
-- =============================================================================

-- ─── EMPLOYEES ───────────────────────────────────────────────────────────────
CREATE TABLE core.employees (
    employee_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            core.employee_role NOT NULL DEFAULT 'employe',
    phone           VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_employees_email ON core.employees(email);
CREATE INDEX idx_employees_role  ON core.employees(role) WHERE is_active = TRUE;


-- ─── VEHICLES ────────────────────────────────────────────────────────────────
CREATE TABLE core.vehicles (
    vehicle_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES core.employees(employee_id) ON DELETE RESTRICT,
    plate_number  VARCHAR(20) UNIQUE NOT NULL,
    plate_country VARCHAR(5) NOT NULL DEFAULT 'TG',
    vehicle_type  core.vehicle_type NOT NULL DEFAULT 'car',
    brand         VARCHAR(50),
    model         VARCHAR(50),
    color         VARCHAR(30),
    photo_url     TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Index GIN trigramme pour correspondance floue (assist OCR)
CREATE INDEX idx_vehicles_plate_trgm ON core.vehicles USING GIN (plate_number gin_trgm_ops);
CREATE INDEX idx_vehicles_owner      ON core.vehicles(owner_id);


-- ─── ZONES ───────────────────────────────────────────────────────────────────
CREATE TABLE core.zones (
    zone_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  VARCHAR(100) UNIQUE NOT NULL,
    description           TEXT,
    capacity              INTEGER NOT NULL CHECK (capacity > 0),
    allowed_vehicle_types core.vehicle_type[] NOT NULL DEFAULT ARRAY['car']::core.vehicle_type[],
    max_duration_minutes  INTEGER DEFAULT 720,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE
);


-- ─── PARKING SLOTS ───────────────────────────────────────────────────────────
CREATE TABLE core.parking_slots (
    slot_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id     UUID NOT NULL REFERENCES core.zones(zone_id),
    slot_code   VARCHAR(20) UNIQUE NOT NULL,
    slot_type   core.slot_type   NOT NULL DEFAULT 'standard',
    slot_status core.slot_status NOT NULL DEFAULT 'available',
    pos_x       FLOAT,
    pos_y       FLOAT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_slots_zone_status ON core.parking_slots(zone_id, slot_status)
    WHERE is_active = TRUE;


-- =============================================================================
-- ÉTAPE 6 — TABLES SCHÉMA access_ctrl
-- =============================================================================

-- ─── ACCESS RIGHTS ───────────────────────────────────────────────────────────
CREATE TABLE access_ctrl.access_rights (
    right_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id    UUID NOT NULL REFERENCES core.vehicles(vehicle_id) ON DELETE CASCADE,
    zone_id       UUID NOT NULL REFERENCES core.zones(zone_id),
    access_level  access_ctrl.access_level NOT NULL DEFAULT 'standard',
    -- 1=Lun, 2=Mar, ..., 7=Dim
    allowed_days  INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
    allowed_hours JSONB NOT NULL DEFAULT '{"start": "07:00", "end": "20:00"}',
    valid_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until   TIMESTAMPTZ,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by    UUID REFERENCES core.employees(employee_id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_valid_range CHECK (valid_until IS NULL OR valid_until > valid_from)
);
CREATE INDEX idx_rights_vehicle ON access_ctrl.access_rights(vehicle_id) WHERE is_active = TRUE;
CREATE INDEX idx_rights_zone    ON access_ctrl.access_rights(zone_id)    WHERE is_active = TRUE;


-- =============================================================================
-- ÉTAPE 7 — VEHICLE SESSIONS (hypertable si TimescaleDB disponible)
-- =============================================================================

CREATE TABLE core.vehicle_sessions (
    session_id       UUID NOT NULL DEFAULT gen_random_uuid(),
    vehicle_id       UUID NOT NULL REFERENCES core.vehicles(vehicle_id),
    zone_id          UUID NOT NULL REFERENCES core.zones(zone_id),
    slot_id          UUID REFERENCES core.parking_slots(slot_id),
    entry_time       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exit_time        TIMESTAMPTZ,
    duration_minutes INTEGER,
    status           core.session_status NOT NULL DEFAULT 'active',
    ocr_confidence   FLOAT,
    entry_photo_url  TEXT,
    exit_photo_url   TEXT,
    is_anomaly       BOOLEAN NOT NULL DEFAULT FALSE,
    notes            TEXT,
    PRIMARY KEY (session_id, entry_time),
    CONSTRAINT chk_exit_after_entry  CHECK (exit_time IS NULL OR exit_time > entry_time),
    CONSTRAINT chk_duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Décommenter si TimescaleDB est installé :
-- SELECT create_hypertable('core.vehicle_sessions', 'entry_time',
--     chunk_time_interval => INTERVAL '1 week');

-- Un véhicule ne peut avoir qu'une seule session active à la fois
CREATE UNIQUE INDEX idx_sessions_active_vehicle
    ON core.vehicle_sessions(vehicle_id) WHERE status = 'active';
CREATE INDEX idx_sessions_entry_brin ON core.vehicle_sessions USING BRIN (entry_time);


-- =============================================================================
-- ÉTAPE 8 — RÉSERVATIONS (contrainte EXCLUDE anti-chevauchement)
-- =============================================================================

CREATE TABLE core.reservations (
    reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id     UUID NOT NULL REFERENCES core.vehicles(vehicle_id),
    slot_id        UUID NOT NULL REFERENCES core.parking_slots(slot_id),
    employee_id    UUID NOT NULL REFERENCES core.employees(employee_id),
    reserved_from  TIMESTAMPTZ NOT NULL,
    reserved_until TIMESTAMPTZ NOT NULL,
    status         core.reservation_status NOT NULL DEFAULT 'confirmed',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reservation_range CHECK (reserved_until > reserved_from),
    -- Empêche physiquement deux réservations confirmées qui se chevauchent sur le même slot
    CONSTRAINT excl_no_overlap EXCLUDE USING gist (
        slot_id WITH =,
        tstzrange(reserved_from, reserved_until, '[)') WITH &&
    ) WHERE (status = 'confirmed')
);


-- =============================================================================
-- ÉTAPE 9 — ALERTES & RAPPORTS
-- =============================================================================

-- ─── ALERTS ──────────────────────────────────────────────────────────────────
CREATE TABLE core.alerts (
    alert_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id       UUID,
    vehicle_id       UUID REFERENCES core.vehicles(vehicle_id),
    zone_id          UUID REFERENCES core.zones(zone_id),
    alert_type       core.alert_type     NOT NULL,
    severity         core.alert_severity NOT NULL DEFAULT 'medium',
    message          TEXT NOT NULL,
    photo_url        TEXT,
    triggered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at  TIMESTAMPTZ,
    handled_by       UUID REFERENCES core.employees(employee_id),
    resolution_notes TEXT,
    status           core.alert_status NOT NULL DEFAULT 'open'
);
CREATE INDEX idx_alerts_open ON core.alerts(severity, triggered_at)
    WHERE status IN ('open', 'acknowledged');


-- ─── REPORTS ─────────────────────────────────────────────────────────────────
CREATE TABLE core.reports (
    report_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_by  UUID REFERENCES core.employees(employee_id),
    period_from   TIMESTAMPTZ NOT NULL,
    period_until  TIMESTAMPTZ NOT NULL,
    zone_id       UUID REFERENCES core.zones(zone_id),
    status        core.report_status NOT NULL DEFAULT 'pending',
    file_url      TEXT,
    file_size_kb  INTEGER,
    generated_at  TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- ÉTAPE 10 — AUDIT LOGS (immuable, hypertable si TimescaleDB disponible)
-- =============================================================================

CREATE TABLE audit.audit_logs (
    log_id      UUID NOT NULL DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES core.employees(employee_id),
    action      VARCHAR(100) NOT NULL,
    table_name  VARCHAR(100) NOT NULL,
    record_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (log_id, created_at)
);

-- Décommenter si TimescaleDB est installé :
-- SELECT create_hypertable('audit.audit_logs', 'created_at',
--     chunk_time_interval => INTERVAL '1 month');

-- Immuabilité : bloquer toute modification ou suppression
CREATE RULE no_update_audit AS ON UPDATE TO audit.audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit.audit_logs DO INSTEAD NOTHING;


-- =============================================================================
-- ÉTAPE 11 — TRIGGERS
-- =============================================================================

-- Trigger 1 : calcul automatique de duration_minutes à la sortie du véhicule
CREATE OR REPLACE FUNCTION core.compute_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exit_time IS NOT NULL AND OLD.exit_time IS NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time)) / 60;
        NEW.status := 'completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_duration
BEFORE UPDATE ON core.vehicle_sessions
FOR EACH ROW EXECUTE FUNCTION core.compute_session_duration();


-- Trigger 2 : détection d'anomalie IQR à la fermeture de session
CREATE OR REPLACE FUNCTION core.flag_anomaly()
RETURNS TRIGGER AS $$
DECLARE
    q1  FLOAT;
    q3  FLOAT;
    iqr FLOAT;
BEGIN
    IF NEW.duration_minutes IS NOT NULL THEN
        SELECT
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY duration_minutes),
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY duration_minutes)
        INTO q1, q3
        FROM core.vehicle_sessions
        WHERE zone_id = NEW.zone_id
          AND duration_minutes IS NOT NULL
          AND entry_time >= NOW() - INTERVAL '30 days';

        iqr := q3 - q1;
        IF iqr > 0 AND (
            NEW.duration_minutes < q1 - 1.5 * iqr OR
            NEW.duration_minutes > q3 + 1.5 * iqr
        ) THEN
            NEW.is_anomaly := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flag_anomaly
BEFORE UPDATE ON core.vehicle_sessions
FOR EACH ROW EXECUTE FUNCTION core.flag_anomaly();


-- Trigger 3 : mise à jour automatique du champ updated_at sur employees
CREATE OR REPLACE FUNCTION core.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON core.employees
FOR EACH ROW EXECUTE FUNCTION core.set_updated_at();


-- =============================================================================
-- ÉTAPE 12 — VUES MATÉRIALISÉES (analytics)
-- =============================================================================

-- Heatmap 7x24 : nombre d'entrées par heure et jour de la semaine
-- Rafraîchie toutes les 15 minutes par Celery
CREATE MATERIALIZED VIEW analytics.entry_heatmap AS
SELECT
    EXTRACT(DOW  FROM entry_time)::INT AS day_of_week,   -- 0=Dim, 1=Lun, ..., 6=Sam
    EXTRACT(HOUR FROM entry_time)::INT AS hour_of_day,
    zone_id,
    COUNT(*)              AS entry_count,
    AVG(duration_minutes) AS avg_duration
FROM core.vehicle_sessions
WHERE entry_time >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2, 3;
CREATE UNIQUE INDEX ON analytics.entry_heatmap(day_of_week, hour_of_day, zone_id);


-- Statistiques journalières agrégées par zone
CREATE MATERIALIZED VIEW analytics.daily_stats AS
SELECT
    DATE_TRUNC('day', entry_time)::DATE AS stat_date,
    zone_id,
    COUNT(*)                                               AS total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed')           AS completed_sessions,
    AVG(duration_minutes)                                  AS avg_duration_minutes,
    MAX(duration_minutes)                                  AS max_duration_minutes,
    COUNT(*) FILTER (WHERE is_anomaly = TRUE)              AS anomaly_count,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_minutes) AS median_duration
FROM core.vehicle_sessions
WHERE exit_time IS NOT NULL
GROUP BY 1, 2;
CREATE UNIQUE INDEX ON analytics.daily_stats(stat_date, zone_id);


-- =============================================================================
-- ÉTAPE 13 — DONNÉES DE SEED (démo)
-- =============================================================================

-- Admin principal
-- ⚠️ Le hash bcrypt ci-dessous est un placeholder.
--    Génère le vrai hash depuis Python : 
--    from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('Admin1234!'))
INSERT INTO core.employees (email, hashed_password, first_name, last_name, role) VALUES
    ('admin@vehitrack.io',   '$2b$12$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH', 'Super',   'Admin',    'admin'),
    ('manager@vehitrack.io', '$2b$12$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH', 'Marie',   'Dupont',   'manager'),
    ('gardien@vehitrack.io', '$2b$12$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH', 'Jean',    'Kouma',    'gardien'),
    ('employe@vehitrack.io', '$2b$12$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH', 'Afi',     'Mensah',   'employe');

-- 3 zones de parking
INSERT INTO core.zones (name, description, capacity, allowed_vehicle_types, max_duration_minutes) VALUES
    ('Zone A', 'Parking principal RDC',   20, ARRAY['car','van','motorcycle']::core.vehicle_type[], 720),
    ('Zone B', 'Parking sécurisé VIP',    10, ARRAY['car','vip']::core.vehicle_type[],             480),
    ('Zone C', 'Zone logistique camions',  8, ARRAY['truck','van']::core.vehicle_type[],           1440);

-- 10 slots pour Zone A
INSERT INTO core.parking_slots (zone_id, slot_code, slot_type, pos_x, pos_y)
SELECT
    (SELECT zone_id FROM core.zones WHERE name = 'Zone A'),
    'A-' || LPAD(n::TEXT, 2, '0'),
    CASE WHEN n <= 2 THEN 'pmr' ELSE 'standard' END::core.slot_type,
    (((n - 1) % 5)) * 60.0,
    ((n - 1) / 5)   * 40.0
FROM generate_series(1, 10) n;

-- 5 slots pour Zone B
INSERT INTO core.parking_slots (zone_id, slot_code, slot_type, pos_x, pos_y)
SELECT
    (SELECT zone_id FROM core.zones WHERE name = 'Zone B'),
    'B-' || LPAD(n::TEXT, 2, '0'),
    'vip'::core.slot_type,
    (n - 1) * 70.0,
    0.0
FROM generate_series(1, 5) n;

-- 4 slots pour Zone C
INSERT INTO core.parking_slots (zone_id, slot_code, slot_type, pos_x, pos_y)
SELECT
    (SELECT zone_id FROM core.zones WHERE name = 'Zone C'),
    'C-' || LPAD(n::TEXT, 2, '0'),
    'truck'::core.slot_type,
    (n - 1) * 100.0,
    0.0
FROM generate_series(1, 4) n;

-- 2 véhicules de démonstration (owner = admin)
INSERT INTO core.vehicles (owner_id, plate_number, plate_country, vehicle_type, brand, model, color) VALUES
    (
        (SELECT employee_id FROM core.employees WHERE email = 'admin@vehitrack.io'),
        'AB-1234-TG', 'TG', 'car', 'Toyota', 'Corolla', 'Blanc'
    ),
    (
        (SELECT employee_id FROM core.employees WHERE email = 'employe@vehitrack.io'),
        'CD-5678-TG', 'TG', 'car', 'Renault', 'Clio', 'Gris'
    );

-- Droits d'accès pour les 2 véhicules sur Zone A
INSERT INTO access_ctrl.access_rights (vehicle_id, zone_id, access_level, granted_by) VALUES
    (
        (SELECT vehicle_id FROM core.vehicles WHERE plate_number = 'AB-1234-TG'),
        (SELECT zone_id    FROM core.zones     WHERE name = 'Zone A'),
        'standard',
        (SELECT employee_id FROM core.employees WHERE email = 'admin@vehitrack.io')
    ),
    (
        (SELECT vehicle_id FROM core.vehicles WHERE plate_number = 'CD-5678-TG'),
        (SELECT zone_id    FROM core.zones     WHERE name = 'Zone A'),
        'standard',
        (SELECT employee_id FROM core.employees WHERE email = 'admin@vehitrack.io')
    );


-- =============================================================================
-- ÉTAPE 14 — VÉRIFICATION FINALE
-- =============================================================================

-- Lister tous les schemas et tables créés
SELECT
    table_schema AS schema,
    table_name   AS table,
    table_type   AS type
FROM information_schema.tables
WHERE table_schema IN ('core', 'access_ctrl', 'analytics', 'audit')
ORDER BY table_schema, table_name;

-- Compter les enregistrements seed
SELECT 'employees'    AS table, COUNT(*) FROM core.employees
UNION ALL
SELECT 'zones',                  COUNT(*) FROM core.zones
UNION ALL
SELECT 'parking_slots',          COUNT(*) FROM core.parking_slots
UNION ALL
SELECT 'vehicles',               COUNT(*) FROM core.vehicles
UNION ALL
SELECT 'access_rights',          COUNT(*) FROM access_ctrl.access_rights;

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================