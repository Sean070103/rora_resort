-- ====================================================================
-- RORA RESORT: NFC GUEST IDENTIFICATION & CHECK-IN/OUT MANAGEMENT SCHEMA
-- Supabase PostgreSQL Migration
-- ====================================================================

-- 1. Create User Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'management');
CREATE TYPE guest_category AS ENUM ('Regular', 'VIP', 'Day Guest', 'Overnight Guest');
CREATE TYPE reservation_status AS ENUM ('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled');
CREATE TYPE payment_status AS ENUM ('Pending', 'Partial', 'Paid', 'Refunded');
CREATE TYPE wristband_status AS ENUM ('Available', 'Assigned', 'Lost', 'Disabled', 'Retired');
CREATE TYPE wristband_condition AS ENUM ('Good', 'Fair', 'Damaged');
CREATE TYPE action_type AS ENUM ('Check In', 'Check Out', 'Wristband Assigned', 'Wristband Replaced', 'Wristband Disabled', 'Manual Verification');
CREATE TYPE verification_method AS ENUM ('NFC', 'QR_CODE', 'MANUAL');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Staff & Accounts)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'receptionist',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY DEFAULT ('gst_' || lower(substr(md5(random()::text), 1, 10))),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    category guest_category NOT NULL DEFAULT 'Regular',
    notes TEXT,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Resort Settings Table
CREATE TABLE IF NOT EXISTS resort_settings (
    id TEXT PRIMARY KEY DEFAULT 'resort_config',
    resort_name TEXT NOT NULL DEFAULT 'Rora Haven Resort & Spa',
    timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
    default_check_in_time TEXT NOT NULL DEFAULT '14:00',
    default_check_out_time TEXT NOT NULL DEFAULT '12:00',
    require_deposit BOOLEAN NOT NULL DEFAULT TRUE,
    nfc_encryption_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    max_resort_capacity INTEGER NOT NULL DEFAULT 350,
    contact_email TEXT NOT NULL DEFAULT 'frontdesk@roraresort.com',
    contact_phone TEXT NOT NULL DEFAULT '+63 917 888 7672',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Wristbands Table (Contains OPAQUE random NFC token)
CREATE TABLE IF NOT EXISTS wristbands (
    id TEXT PRIMARY KEY DEFAULT ('wb_' || lower(substr(md5(random()::text), 1, 10))),
    wristband_code TEXT UNIQUE NOT NULL, -- Human-readable identifier like WB-101
    nfc_token TEXT UNIQUE NOT NULL,      -- Opaque secure random token programmed on tag NDEF
    status wristband_status NOT NULL DEFAULT 'Available',
    condition wristband_condition NOT NULL DEFAULT 'Good',
    assigned_guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
    assigned_reservation_id TEXT, -- circular FK solved below
    assigned_at TIMESTAMPTZ,
    last_scanned_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY DEFAULT ('res_' || lower(substr(md5(random()::text), 1, 10))),
    reference_number TEXT UNIQUE NOT NULL, -- e.g. RR-84910
    guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_or_accommodation TEXT NOT NULL,
    accommodation_type TEXT NOT NULL DEFAULT 'VILLA',
    adults_count INTEGER NOT NULL DEFAULT 2,
    children_count INTEGER NOT NULL DEFAULT 0,
    status reservation_status NOT NULL DEFAULT 'Confirmed',
    payment_status payment_status NOT NULL DEFAULT 'Paid',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    special_requests TEXT,
    assigned_wristband_id TEXT REFERENCES wristbands(id) ON DELETE SET NULL,
    actual_check_in_time TIMESTAMPTZ,
    actual_check_out_time TIMESTAMPTZ,
    checked_in_by TEXT,
    checked_out_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Link circular FK from wristbands to reservations
ALTER TABLE wristbands 
    ADD CONSTRAINT fk_wristband_reservation 
    FOREIGN KEY (assigned_reservation_id) 
    REFERENCES reservations(id) ON DELETE SET NULL;

-- 7. Guest Access Logs Table (Audit and access history)
CREATE TABLE IF NOT EXISTS guest_access_logs (
    id TEXT PRIMARY KEY DEFAULT ('log_' || lower(substr(md5(random()::text), 1, 12))),
    guest_id TEXT NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    reservation_id TEXT REFERENCES reservations(id) ON DELETE SET NULL,
    wristband_id TEXT REFERENCES wristbands(id) ON DELETE SET NULL,
    action_type action_type NOT NULL,
    verification_method verification_method NOT NULL DEFAULT 'NFC',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    receptionist_id TEXT NOT NULL,
    receptionist_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Audit Logs Table (Administrative actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('aud_' || lower(substr(md5(random()::text), 1, 12))),
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- INDEXES FOR HIGH-CONCURRENCY SCANNING & LOOKUPS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_wristbands_nfc_token ON wristbands(nfc_token);
CREATE INDEX IF NOT EXISTS idx_wristbands_status ON wristbands(status);
CREATE INDEX IF NOT EXISTS idx_wristbands_assigned_guest ON wristbands(assigned_guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reference ON reservations(reference_number);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_guest ON guest_access_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_res ON guest_access_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON guest_access_logs(timestamp DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resort_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated staff members full read access to operational tables
CREATE POLICY "Staff can view profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view guests" ON guests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view reservations" ON reservations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view wristbands" ON wristbands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view logs" ON guest_access_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view audit" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can view settings" ON resort_settings FOR ALL USING (auth.role() = 'authenticated');

-- ====================================================================
-- ATOMIC STORED PROCEDURES (RACE CONDITION & CONCURRENCY SAFE)
-- ====================================================================

-- Atomic Check-in Stored Procedure
CREATE OR REPLACE FUNCTION confirm_check_in_atomic(
    p_reservation_id TEXT,
    p_wristband_token TEXT,
    p_staff_id TEXT,
    p_staff_name TEXT,
    p_method verification_method DEFAULT 'NFC',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_res RECORD;
    v_wb RECORD;
    v_log_id TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    -- 1. Lock reservation row to prevent simultaneous double check-ins
    SELECT * INTO v_res
    FROM reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'RESERVATION_NOT_FOUND', 'message', 'Reservation does not exist.');
    END IF;

    -- 2. Validate Reservation Status
    IF v_res.status = 'Checked In' THEN
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_CHECKED_IN', 'message', 'Guest is already checked in for this reservation.');
    END IF;

    IF v_res.status = 'Checked Out' THEN
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_CHECKED_OUT', 'message', 'This reservation is already completed and checked out.');
    END IF;

    IF v_res.status = 'Cancelled' THEN
        RETURN jsonb_build_object('success', false, 'code', 'RESERVATION_CANCELLED', 'message', 'Cannot check in a cancelled reservation.');
    END IF;

    -- 3. Lock and validate Wristband
    IF p_wristband_token IS NOT NULL AND p_wristband_token <> '' THEN
        SELECT * INTO v_wb
        FROM wristbands
        WHERE nfc_token = p_wristband_token
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'code', 'UNKNOWN_WRISTBAND', 'message', 'Scanned NFC wristband is not registered in the system.');
        END IF;

        IF v_wb.status = 'Disabled' THEN
            RETURN jsonb_build_object('success', false, 'code', 'WRISTBAND_DISABLED', 'message', 'This wristband has been disabled and cannot authorize access.');
        END IF;

        IF v_wb.status = 'Lost' THEN
            RETURN jsonb_build_object('success', false, 'code', 'WRISTBAND_LOST', 'message', 'This wristband was reported lost.');
        END IF;

        IF v_wb.status = 'Retired' THEN
            RETURN jsonb_build_object('success', false, 'code', 'WRISTBAND_RETIRED', 'message', 'This wristband is retired.');
        END IF;

        -- Verify wristband matches or assign if available
        IF v_wb.assigned_reservation_id IS NOT NULL AND v_wb.assigned_reservation_id <> p_reservation_id THEN
            RETURN jsonb_build_object('success', false, 'code', 'WRISTBAND_ASSIGNED_TO_OTHER', 'message', 'Wristband is actively assigned to another reservation.');
        END IF;

        -- Update wristband record
        UPDATE wristbands
        SET status = 'Assigned',
            assigned_guest_id = v_res.guest_id,
            assigned_reservation_id = v_res.id,
            last_scanned_at = v_now,
            updated_at = v_now
        WHERE id = v_wb.id;
    END IF;

    -- 4. Update reservation status atomically
    UPDATE reservations
    SET status = 'Checked In',
        actual_check_in_time = v_now,
        checked_in_by = p_staff_name,
        assigned_wristband_id = COALESCE(v_wb.id, assigned_wristband_id),
        updated_at = v_now
    WHERE id = v_res.id;

    -- 5. Create immutable Guest Access Log
    v_log_id := 'log_' || lower(substr(md5(random()::text), 1, 12));
    INSERT INTO guest_access_logs (
        id, guest_id, reservation_id, wristband_id, action_type, verification_method, timestamp, receptionist_id, receptionist_name, notes, created_at
    ) VALUES (
        v_log_id, v_res.guest_id, v_res.id, v_wb.id, 'Check In', p_method, v_now, p_staff_id, p_staff_name, p_notes, v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Guest checked in successfully.',
        'reservation_id', v_res.id,
        'guest_id', v_res.guest_id,
        'wristband_id', v_wb.id,
        'check_in_time', v_now
    );
END;
$$;

-- Atomic Check-out Stored Procedure
CREATE OR REPLACE FUNCTION confirm_check_out_atomic(
    p_reservation_id TEXT,
    p_wristband_token TEXT,
    p_staff_id TEXT,
    p_staff_name TEXT,
    p_release_wristband BOOLEAN DEFAULT TRUE,
    p_method verification_method DEFAULT 'NFC',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_res RECORD;
    v_wb RECORD;
    v_log_id TEXT;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
    -- 1. Lock reservation row
    SELECT * INTO v_res
    FROM reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'RESERVATION_NOT_FOUND', 'message', 'Reservation does not exist.');
    END IF;

    IF v_res.status = 'Checked Out' THEN
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_CHECKED_OUT', 'message', 'Guest is already checked out.');
    END IF;

    IF v_res.status <> 'Checked In' THEN
        RETURN jsonb_build_object('success', false, 'code', 'NOT_CHECKED_IN', 'message', 'Guest cannot check out before checking in.');
    END IF;

    -- 2. Find and lock wristband
    IF p_wristband_token IS NOT NULL AND p_wristband_token <> '' THEN
        SELECT * INTO v_wb
        FROM wristbands
        WHERE nfc_token = p_wristband_token
        FOR UPDATE;
    ELSIF v_res.assigned_wristband_id IS NOT NULL THEN
        SELECT * INTO v_wb
        FROM wristbands
        WHERE id = v_res.assigned_wristband_id
        FOR UPDATE;
    END IF;

    -- 3. Release or keep wristband
    IF v_wb.id IS NOT NULL THEN
        IF p_release_wristband THEN
            UPDATE wristbands
            SET status = 'Available',
                assigned_guest_id = NULL,
                assigned_reservation_id = NULL,
                last_scanned_at = v_now,
                updated_at = v_now
            WHERE id = v_wb.id;
        ELSE
            UPDATE wristbands
            SET last_scanned_at = v_now,
                updated_at = v_now
            WHERE id = v_wb.id;
        END IF;
    END IF;

    -- 4. Update reservation status
    UPDATE reservations
    SET status = 'Checked Out',
        actual_check_out_time = v_now,
        checked_out_by = p_staff_name,
        updated_at = v_now
    WHERE id = v_res.id;

    -- 5. Create immutable log
    v_log_id := 'log_' || lower(substr(md5(random()::text), 1, 12));
    INSERT INTO guest_access_logs (
        id, guest_id, reservation_id, wristband_id, action_type, verification_method, timestamp, receptionist_id, receptionist_name, notes, created_at
    ) VALUES (
        v_log_id, v_res.guest_id, v_res.id, v_wb.id, 'Check Out', p_method, v_now, p_staff_id, p_staff_name, p_notes, v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Guest checked out successfully.',
        'reservation_id', v_res.id,
        'guest_id', v_res.guest_id,
        'check_out_time', v_now
    );
END;
$$;
