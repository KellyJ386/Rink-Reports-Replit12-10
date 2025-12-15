-- ==========================================
-- MFO Ice Management System - Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE user_role AS ENUM (
  'facility_manager',
  'lead_ice_tech',
  'ice_technician',
  'maintenance',
  'attendant'
);

CREATE TYPE measurement_template AS ENUM (
  '25-point',
  '35-point',
  '47-point',
  'custom'
);

CREATE TYPE measurement_method AS ENUM ('bluetooth', 'manual');
CREATE TYPE cut_type AS ENUM ('wet', 'dry');
CREATE TYPE fuel_type AS ENUM ('electric', 'gas', 'propane');
CREATE TYPE blade_change_reason AS ENUM ('scheduled', 'wear', 'damage', 'quality_issues');
CREATE TYPE checklist_item_status AS ENUM ('pass', 'fail', 'na');
CREATE TYPE rink_use AS ENUM ('hockey', 'figure_skating', 'recreational', 'multi_use');

-- ==========================================
-- TABLES
-- ==========================================

-- Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'ice_technician',
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rinks
CREATE TABLE rinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  length_ft NUMERIC NOT NULL DEFAULT 200,
  width_ft NUMERIC NOT NULL DEFAULT 85,
  primary_use rink_use NOT NULL DEFAULT 'multi_use',
  target_depth_min NUMERIC NOT NULL DEFAULT 25.4,  -- mm (1 inch)
  target_depth_max NUMERIC NOT NULL DEFAULT 44.45, -- mm (1.75 inches)
  measurement_template measurement_template NOT NULL DEFAULT '25-point',
  custom_template_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(facility_id, name)
);

-- Resurfacers
CREATE TABLE resurfacers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  fuel_type fuel_type NOT NULL,
  serial_number TEXT,
  hour_meter_reading NUMERIC NOT NULL DEFAULT 0,
  assigned_rink_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(facility_id, name)
);

-- Custom Measurement Templates
CREATE TABLE custom_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ice Depth Measurements
CREATE TABLE ice_depth_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL,
  measurements JSONB NOT NULL DEFAULT '{}',
  measurement_methods JSONB NOT NULL DEFAULT '{}',
  device_id UUID,
  air_temp_c NUMERIC,
  ice_temp_c NUMERIC,
  humidity NUMERIC,
  min_depth NUMERIC NOT NULL,
  max_depth NUMERIC NOT NULL,
  avg_depth NUMERIC NOT NULL,
  notes TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ice Make Logs
CREATE TABLE ice_make_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  resurfacer_id UUID NOT NULL REFERENCES resurfacers(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  water_used_percent INTEGER NOT NULL CHECK (water_used_percent >= 0 AND water_used_percent <= 100),
  snow_in_tank_percent INTEGER NOT NULL CHECK (snow_in_tank_percent >= 0 AND snow_in_tank_percent <= 100),
  cut_type cut_type NOT NULL,
  battery_start_percent INTEGER,
  battery_end_percent INTEGER,
  hour_meter_reading NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true
);

-- Circle Check Logs
CREATE TABLE circle_check_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  resurfacer_id UUID NOT NULL REFERENCES resurfacers(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  checklist_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  passed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true
);

-- Blade Change Logs
CREATE TABLE blade_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  resurfacer_id UUID NOT NULL REFERENCES resurfacers(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  hour_meter_reading NUMERIC NOT NULL,
  hours_since_last_change NUMERIC NOT NULL DEFAULT 0,
  reason blade_change_reason NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true
);

-- End of Day Reports
CREATE TABLE end_of_day_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  total_ice_makes INTEGER NOT NULL DEFAULT 0,
  checklist_items JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(facility_id, rink_id, date)
);

-- Bluetooth Devices
CREATE TABLE bluetooth_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'caliper',
  manufacturer TEXT,
  model TEXT,
  calibration_offset NUMERIC NOT NULL DEFAULT 0,
  last_calibrated_at TIMESTAMPTZ,
  is_paired BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Items (templates for circle checks)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_users_facility ON users(facility_id);
CREATE INDEX idx_rinks_facility ON rinks(facility_id);
CREATE INDEX idx_resurfacers_facility ON resurfacers(facility_id);
CREATE INDEX idx_ice_depth_measurements_rink ON ice_depth_measurements(rink_id);
CREATE INDEX idx_ice_depth_measurements_checked_at ON ice_depth_measurements(checked_at DESC);
CREATE INDEX idx_ice_make_logs_rink ON ice_make_logs(rink_id);
CREATE INDEX idx_ice_make_logs_created_at ON ice_make_logs(created_at DESC);
CREATE INDEX idx_circle_check_logs_resurfacer ON circle_check_logs(resurfacer_id);
CREATE INDEX idx_blade_change_logs_resurfacer ON blade_change_logs(resurfacer_id);
CREATE INDEX idx_end_of_day_reports_date ON end_of_day_reports(date DESC);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rinks_updated_at
  BEFORE UPDATE ON rinks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resurfacers_updated_at
  BEFORE UPDATE ON resurfacers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_templates_updated_at
  BEFORE UPDATE ON custom_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bluetooth_devices_updated_at
  BEFORE UPDATE ON bluetooth_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resurfacers ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_make_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blade_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE end_of_day_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bluetooth_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's facility_id
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID AS $$
  SELECT facility_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Facilities policies
CREATE POLICY "Users can view their facility"
  ON facilities FOR SELECT
  USING (id = get_user_facility_id());

CREATE POLICY "Facility managers can update their facility"
  ON facilities FOR UPDATE
  USING (id = get_user_facility_id())
  WITH CHECK (id = get_user_facility_id());

-- Users policies
CREATE POLICY "Users can view users in their facility"
  ON users FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Rinks policies
CREATE POLICY "Users can view rinks in their facility"
  ON rinks FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert rinks in their facility"
  ON rinks FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

CREATE POLICY "Users can update rinks in their facility"
  ON rinks FOR UPDATE
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can delete rinks in their facility"
  ON rinks FOR DELETE
  USING (facility_id = get_user_facility_id());

-- Resurfacers policies
CREATE POLICY "Users can view resurfacers in their facility"
  ON resurfacers FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert resurfacers in their facility"
  ON resurfacers FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

CREATE POLICY "Users can update resurfacers in their facility"
  ON resurfacers FOR UPDATE
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can delete resurfacers in their facility"
  ON resurfacers FOR DELETE
  USING (facility_id = get_user_facility_id());

-- Ice depth measurements policies
CREATE POLICY "Users can view measurements in their facility"
  ON ice_depth_measurements FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert measurements in their facility"
  ON ice_depth_measurements FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

CREATE POLICY "Users can update measurements in their facility"
  ON ice_depth_measurements FOR UPDATE
  USING (facility_id = get_user_facility_id());

-- Ice make logs policies
CREATE POLICY "Users can view ice makes in their facility"
  ON ice_make_logs FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert ice makes in their facility"
  ON ice_make_logs FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

CREATE POLICY "Users can update ice makes in their facility"
  ON ice_make_logs FOR UPDATE
  USING (facility_id = get_user_facility_id());

-- Circle check logs policies
CREATE POLICY "Users can view circle checks in their facility"
  ON circle_check_logs FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert circle checks in their facility"
  ON circle_check_logs FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

-- Blade change logs policies
CREATE POLICY "Users can view blade changes in their facility"
  ON blade_change_logs FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert blade changes in their facility"
  ON blade_change_logs FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

-- End of day reports policies
CREATE POLICY "Users can view reports in their facility"
  ON end_of_day_reports FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert reports in their facility"
  ON end_of_day_reports FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

CREATE POLICY "Users can update reports in their facility"
  ON end_of_day_reports FOR UPDATE
  USING (facility_id = get_user_facility_id());

-- Custom templates policies
CREATE POLICY "Users can view templates in their facility"
  ON custom_templates FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can insert templates in their facility"
  ON custom_templates FOR INSERT
  WITH CHECK (facility_id = get_user_facility_id());

-- Bluetooth devices policies
CREATE POLICY "Users can view devices in their facility"
  ON bluetooth_devices FOR SELECT
  USING (facility_id = get_user_facility_id());

CREATE POLICY "Users can manage devices in their facility"
  ON bluetooth_devices FOR ALL
  USING (facility_id = get_user_facility_id());

-- Checklist items policies (global + facility-specific)
CREATE POLICY "Users can view global and facility checklist items"
  ON checklist_items FOR SELECT
  USING (facility_id IS NULL OR facility_id = get_user_facility_id());
