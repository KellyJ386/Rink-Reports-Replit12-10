-- ==========================================
-- MFO Ice Management System - Seed Data
-- ==========================================

-- Default Checklist Items (for Circle Checks)
-- These are global items (facility_id IS NULL)

INSERT INTO checklist_items (id, facility_id, text, sort_order, fuel_type) VALUES
-- Electric resurfacer checklist
('c1000000-0000-0000-0000-000000000001', NULL, 'Battery charge level adequate (above 30%)', 1, 'electric'),
('c1000000-0000-0000-0000-000000000002', NULL, 'Charging cable disconnected and stored', 2, 'electric'),
('c1000000-0000-0000-0000-000000000003', NULL, 'No visible damage to battery housing', 3, 'electric'),

-- Gas/Propane resurfacer checklist
('c2000000-0000-0000-0000-000000000001', NULL, 'Fuel level adequate', 1, 'gas'),
('c2000000-0000-0000-0000-000000000002', NULL, 'Check for fuel leaks', 2, 'gas'),
('c2000000-0000-0000-0000-000000000003', NULL, 'Propane tank secure (if applicable)', 3, 'propane'),

-- Common checklist items (all fuel types)
('c3000000-0000-0000-0000-000000000001', NULL, 'Water tank filled', 1, 'all'),
('c3000000-0000-0000-0000-000000000002', NULL, 'Conditioner functioning', 2, 'all'),
('c3000000-0000-0000-0000-000000000003', NULL, 'Blade in good condition', 3, 'all'),
('c3000000-0000-0000-0000-000000000004', NULL, 'Snow tank empty', 4, 'all'),
('c3000000-0000-0000-0000-000000000005', NULL, 'Wash water system working', 5, 'all'),
('c3000000-0000-0000-0000-000000000006', NULL, 'Towel clean and properly installed', 6, 'all'),
('c3000000-0000-0000-0000-000000000007', NULL, 'Lights functioning', 7, 'all'),
('c3000000-0000-0000-0000-000000000008', NULL, 'Horn working', 8, 'all'),
('c3000000-0000-0000-0000-000000000009', NULL, 'Mirrors clean and adjusted', 9, 'all'),
('c3000000-0000-0000-0000-000000000010', NULL, 'Tires in good condition', 10, 'all'),
('c3000000-0000-0000-0000-000000000011', NULL, 'No visible fluid leaks', 11, 'all'),
('c3000000-0000-0000-0000-000000000012', NULL, 'Emergency stop functioning', 12, 'all');

-- ==========================================
-- SAMPLE DEVELOPMENT DATA
-- (Only run this in development environments)
-- ==========================================

-- Sample Facility
INSERT INTO facilities (id, name, address, city, state, zip_code, country, timezone, contact_email, contact_phone)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'MFO Ice Arena',
  '123 Hockey Drive',
  'Edmonton',
  'AB',
  'T5J 0N3',
  'Canada',
  'America/Edmonton',
  'admin@mfo-ice.com',
  '(780) 555-0100'
);

-- Sample Rinks
INSERT INTO rinks (id, facility_id, name, length_ft, width_ft, primary_use, target_depth_min, target_depth_max, measurement_template)
VALUES
(
  'r1000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Rink A',
  200, 85, 'hockey',
  25.4, 44.45, '25-point'
),
(
  'r1000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  'Rink B',
  200, 85, 'figure_skating',
  31.75, 38.1, '35-point'
);

-- Sample Resurfacers
INSERT INTO resurfacers (id, facility_id, name, make, model, year, fuel_type, serial_number, hour_meter_reading, assigned_rink_ids)
VALUES
(
  's1000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Zamboni #1',
  'Zamboni',
  '552',
  2020,
  'electric',
  'ZAM-2020-001',
  1250.5,
  ARRAY['r1000000-0000-0000-0000-000000000001']::UUID[]
),
(
  's1000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  'Olympia #2',
  'Olympia',
  'Millennium H',
  2018,
  'propane',
  'OLY-2018-002',
  3420.0,
  ARRAY['r1000000-0000-0000-0000-000000000002']::UUID[]
);
