-- ====================================================================
-- RORA RESORT: SEED DATA
-- Supabase PostgreSQL Seed
-- ====================================================================

-- 1. Resort Settings
INSERT INTO resort_settings (
    id, resort_name, timezone, default_check_in_time, default_check_out_time, require_deposit, nfc_encryption_enabled, max_resort_capacity, contact_email, contact_phone
) VALUES (
    'resort_config',
    'Rora Haven Resort & Spa',
    'Asia/Manila',
    '14:00',
    '12:00',
    TRUE,
    TRUE,
    350,
    'frontdesk@roraresort.ph',
    '+63 917 888 7672'
) ON CONFLICT (id) DO UPDATE SET resort_name = EXCLUDED.resort_name;

-- 2. Staff Profiles
INSERT INTO profiles (id, email, full_name, role, phone) VALUES
('b3c10a40-4221-4d37-97d8-cf48a1012301', 'admin@roraresort.ph', 'Elena Rostova', 'admin', '+63 917 111 0001'),
('b3c10a40-4221-4d37-97d8-cf48a1012302', 'receptionist@roraresort.ph', 'Marco Valerio', 'receptionist', '+63 917 222 0002'),
('b3c10a40-4221-4d37-97d8-cf48a1012303', 'management@roraresort.ph', 'Sofia Alcantara', 'management', '+63 917 333 0003')
ON CONFLICT (email) DO NOTHING;

-- 3. Guests
INSERT INTO guests (id, full_name, email, phone, address, category, notes, registration_date) VALUES
('gst_vip_01', 'Alexander Vance', 'alexander.vance@solaris.io', '+63 917 999 1234', 'Makati City, Metro Manila', 'VIP', 'VIP Founder guest. Prefers high-floor garden villa. Complimentary champagne.', '2026-01-10T09:00:00Z'),
('gst_reg_02', 'Camila Rodriguez', 'camila.r@outlook.com', '+63 918 888 2345', 'BGC, Taguig City', 'Regular', 'Anniversary getaway. Requested early check-in if possible.', '2026-01-15T10:30:00Z'),
('gst_day_03', 'David Benjamin', 'dbenjamin@innovate.co', '+63 920 777 3456', 'Angeles City, Pampanga', 'Day Guest', 'Day pass access to lagoon pool and seaside cabana #4.', '2026-02-01T08:15:00Z'),
('gst_ovn_04', 'Isabella Soriano', 'isabella.soriano@gmail.com', '+63 917 666 4567', 'Quezon City, Metro Manila', 'Overnight Guest', 'Family trip with 2 kids. Extra towels and cot provided.', '2026-02-05T14:20:00Z'),
('gst_vip_05', 'Dr. Julian Morales', 'jmorales@cardio.med', '+63 919 555 5678', 'Cebu City, Central Visayas', 'VIP', 'Repeat VIP guest. Frequent wellness spa patron.', '2026-02-10T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4. Wristbands (With OPAQUE random NFC tokens)
INSERT INTO wristbands (id, wristband_code, nfc_token, status, condition, notes) VALUES
('wb_801', 'WB-801', 'nfc_tok_a1b2c3d4e5f601', 'Assigned', 'Good', 'Assigned to Alexander Vance (VIP)'),
('wb_802', 'WB-802', 'nfc_tok_f7e8d9c0b1a202', 'Assigned', 'Good', 'Assigned to Camila Rodriguez'),
('wb_803', 'WB-803', 'nfc_tok_3c4d5e6f7a8b03', 'Available', 'Good', 'Ready for incoming arrivals'),
('wb_804', 'WB-804', 'nfc_tok_9e8d7c6b5a4f04', 'Available', 'Good', 'Ready for incoming arrivals'),
('wb_805', 'WB-805', 'nfc_tok_11223344556605', 'Available', 'Good', 'Cleaned and sanitized in dock'),
('wb_806', 'WB-806', 'nfc_tok_778899aabbcc06', 'Disabled', 'Damaged', 'Disabled due to chipped casing and antenna check'),
('wb_807', 'WB-807', 'nfc_tok_ddeeff00112207', 'Lost', 'Good', 'Reported lost by guest at pool bar; deactivated')
ON CONFLICT (id) DO NOTHING;

-- 5. Reservations
INSERT INTO reservations (
    id, reference_number, guest_id, check_in_date, check_out_date, room_or_accommodation, accommodation_type, adults_count, children_count, status, payment_status, total_amount, amount_paid, special_requests, assigned_wristband_id, actual_check_in_time, checked_in_by
) VALUES
('res_2026_01', 'RR-84910', 'gst_vip_01', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'Royal Palm Villa 101', 'VILLA', 2, 0, 'Checked In', 'Paid', 28500.00, 28500.00, 'Ocean view, late checkout, champagne on arrival', 'wb_801', timezone('utc'::text, now()) - INTERVAL '2 hours', 'Marco Valerio'),
('res_2026_02', 'RR-84911', 'gst_reg_02', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'Seaside Horizon Suite 204', 'ROOM', 2, 0, 'Confirmed', 'Paid', 14200.00, 14200.00, 'King size bed, non-smoking floor', 'wb_802', NULL, NULL),
('res_2026_03', 'RR-84912', 'gst_day_03', CURRENT_DATE, CURRENT_DATE, 'Cabana Azure 04', 'CABANA', 1, 0, 'Confirmed', 'Paid', 3500.00, 3500.00, 'All-day lagoon pool towel and cocktail service', NULL, NULL, NULL),
('res_2026_04', 'RR-84913', 'gst_ovn_04', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE, 'Family Bungalow 302', 'COTTAGE', 2, 2, 'Checked In', 'Paid', 19800.00, 19800.00, 'Crib request for toddler, poolside location', NULL, timezone('utc'::text, now()) - INTERVAL '22 hours', 'Marco Valerio'),
('res_2026_05', 'RR-84914', 'gst_vip_05', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 'Presidential Lotus Suite', 'VILLA', 2, 0, 'Checked Out', 'Paid', 34000.00, 34000.00, 'Private butler, airport transfer', NULL, timezone('utc'::text, now()) - INTERVAL '3 days', 'Elena Rostova')
ON CONFLICT (id) DO NOTHING;

-- Link wristband assignment
UPDATE wristbands SET assigned_guest_id = 'gst_vip_01', assigned_reservation_id = 'res_2026_01', assigned_at = now() - INTERVAL '2 hours' WHERE id = 'wb_801';
UPDATE wristbands SET assigned_guest_id = 'gst_reg_02', assigned_reservation_id = 'res_2026_02', assigned_at = now() - INTERVAL '1 day' WHERE id = 'wb_802';

-- 6. Initial Guest Access Logs
INSERT INTO guest_access_logs (
    id, guest_id, reservation_id, wristband_id, action_type, verification_method, timestamp, receptionist_id, receptionist_name, notes
) VALUES
('log_seed_01', 'gst_vip_01', 'res_2026_01', 'wb_801', 'Wristband Assigned', 'NFC', timezone('utc'::text, now()) - INTERVAL '2 hours 5 minutes', 'b3c10a40-4221-4d37-97d8-cf48a1012302', 'Marco Valerio', 'Initial wristband pairing at welcome desk'),
('log_seed_02', 'gst_vip_01', 'res_2026_01', 'wb_801', 'Check In', 'NFC', timezone('utc'::text, now()) - INTERVAL '2 hours', 'b3c10a40-4221-4d37-97d8-cf48a1012302', 'Marco Valerio', 'NFC scan check-in verified. Welcome drink served.'),
('log_seed_03', 'gst_ovn_04', 'res_2026_04', NULL, 'Check In', 'QR_CODE', timezone('utc'::text, now()) - INTERVAL '22 hours', 'b3c10a40-4221-4d37-97d8-cf48a1012302', 'Marco Valerio', 'Checked in via confirmation voucher QR code')
ON CONFLICT (id) DO NOTHING;
