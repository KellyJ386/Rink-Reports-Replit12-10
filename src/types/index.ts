// ==========================================
// MFO Ice Management System - Type Definitions
// ==========================================

// ----- Core Enums -----

export type MeasurementTemplate = '25-point' | '35-point' | '47-point' | 'custom';
export type MeasurementMethod = 'bluetooth' | 'manual';
export type MeasurementStatus = 'ideal' | 'warning' | 'critical';
export type CutType = 'wet' | 'dry';
export type FuelType = 'electric' | 'gas' | 'propane';
export type BladeChangeReason = 'scheduled' | 'wear' | 'damage' | 'quality_issues';

export type UserRole =
  | 'facility_manager'
  | 'lead_ice_tech'
  | 'ice_technician'
  | 'maintenance'
  | 'attendant';

export type ChecklistItemStatus = 'pass' | 'fail' | 'na';

// ----- User & Auth -----

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  facility_id: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

// ----- Facility & Rink -----

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  timezone: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Rink {
  id: string;
  facility_id: string;
  name: string;
  length_ft: number;
  width_ft: number;
  primary_use: 'hockey' | 'figure_skating' | 'recreational' | 'multi_use';
  target_depth_min: number;  // in mm
  target_depth_max: number;  // in mm
  measurement_template: MeasurementTemplate;
  custom_template_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resurfacer {
  id: string;
  facility_id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  serial_number?: string;
  hour_meter_reading: number;
  assigned_rink_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----- Ice Depth Measurement -----

export interface MeasurementPoint {
  id: string;
  x: number;  // SVG x coordinate (0-100%)
  y: number;  // SVG y coordinate (0-100%)
  zone: 'north_goal' | 'north_blue' | 'center' | 'south_blue' | 'south_goal';
  order: number;
}

export interface CustomTemplate {
  id: string;
  facility_id: string;
  name: string;
  points: MeasurementPoint[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IceDepthMeasurement {
  id: string;
  facility_id: string;
  rink_id: string;
  technician_id: string;
  template_id: MeasurementTemplate | string;
  measurements: Record<string, number>;  // { point_id: depth_value_mm }
  measurement_methods: Record<string, MeasurementMethod>;  // { point_id: method }
  device_id?: string;
  air_temp_c: number;
  ice_temp_c: number;
  humidity: number;
  min_depth: number;
  max_depth: number;
  avg_depth: number;
  notes?: string;
  checked_at: string;
  synced: boolean;
  created_at: string;
}

// ----- Ice Operations -----

export interface IceMakeLog {
  id: string;
  facility_id: string;
  rink_id: string;
  resurfacer_id: string;
  operator_id: string;
  water_used_percent: number;
  snow_in_tank_percent: number;
  cut_type: CutType;
  battery_start_percent?: number;  // Electric only
  battery_end_percent?: number;    // Electric only
  hour_meter_reading?: number;
  notes?: string;
  created_at: string;
  synced: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  order: number;
  fuel_type: FuelType | 'all';
  is_active: boolean;
}

export interface CircleCheckLog {
  id: string;
  facility_id: string;
  resurfacer_id: string;
  operator_id: string;
  checklist_type: 'electric' | 'gas_propane';
  items: Record<string, ChecklistItemStatus>;  // { item_id: status }
  notes?: string;
  passed: boolean;
  created_at: string;
  synced: boolean;
}

export interface BladeChangeLog {
  id: string;
  facility_id: string;
  resurfacer_id: string;
  operator_id: string;
  hour_meter_reading: number;
  hours_since_last_change: number;
  reason: BladeChangeReason;
  notes?: string;
  created_at: string;
  synced: boolean;
}

export interface EndOfDayReport {
  id: string;
  facility_id: string;
  rink_id: string;
  operator_id: string;
  date: string;
  total_ice_makes: number;
  checklist_items: Record<string, boolean>;
  notes?: string;
  created_at: string;
  synced: boolean;
}

// ----- Environmental Data -----

export interface EnvironmentalReading {
  air_temp_c: number;
  ice_temp_c: number;
  humidity: number;
  recorded_at: string;
}

// ----- Bluetooth Device -----

export interface BluetoothDevice {
  id: string;
  facility_id: string;
  name: string;
  device_type: 'caliper';
  manufacturer: string;
  model: string;
  calibration_offset: number;
  last_calibrated_at?: string;
  is_paired: boolean;
  created_at: string;
  updated_at: string;
}

// ----- Form Builder -----

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'toggle'
  | 'file'
  | 'section_header'
  | 'instruction_text'
  | 'signature';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
}

export interface FormFieldCondition {
  field_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  help_text?: string;
  default_value?: string | number | boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  conditions?: FormFieldCondition[];
  order: number;
}

export interface CustomForm {
  id: string;
  facility_id: string;
  name: string;
  module: 'ice_maintenance' | 'refrigeration' | 'daily_reports' | 'air_quality' | 'incident_reports' | 'communications';
  fields: FormField[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ----- Offline Sync -----

export interface SyncQueueItem {
  id: string;
  table_name: string;
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  created_at: string;
  retry_count: number;
}

// ----- API Response Types -----

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
