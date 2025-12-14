import { z } from 'zod';

// ==========================================
// Form Validation Schemas
// ==========================================

// ----- Auth Schemas -----

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ----- Ice Depth Schemas -----

export const iceDepthMeasurementSchema = z.object({
  rink_id: z.string().min(1, 'Please select a rink'),
  template_id: z.string().min(1, 'Please select a measurement template'),
  air_temp_c: z.number().min(-50).max(50),
  ice_temp_c: z.number().min(-20).max(10),
  humidity: z.number().min(0).max(100),
  notes: z.string().optional(),
});

export type IceDepthMeasurementFormData = z.infer<typeof iceDepthMeasurementSchema>;

// ----- Ice Make Log Schemas -----

export const iceMakeLogSchema = z.object({
  rink_id: z.string().min(1, 'Please select a rink'),
  resurfacer_id: z.string().min(1, 'Please select a resurfacer'),
  water_used_percent: z.number().min(0).max(100),
  snow_in_tank_percent: z.number().min(0).max(100),
  cut_type: z.enum(['wet', 'dry']),
  battery_start_percent: z.number().min(0).max(100).optional(),
  battery_end_percent: z.number().min(0).max(100).optional(),
  hour_meter_reading: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type IceMakeLogFormData = z.infer<typeof iceMakeLogSchema>;

// ----- Circle Check Schemas -----

export const circleCheckSchema = z.object({
  resurfacer_id: z.string().min(1, 'Please select a resurfacer'),
  checklist_type: z.enum(['electric', 'gas_propane']),
  items: z.record(z.string(), z.enum(['pass', 'fail', 'na'])),
  notes: z.string().optional(),
});

export type CircleCheckFormData = z.infer<typeof circleCheckSchema>;

// ----- Blade Change Schemas -----

export const bladeChangeSchema = z.object({
  resurfacer_id: z.string().min(1, 'Please select a resurfacer'),
  hour_meter_reading: z.number().positive('Hour meter reading must be positive'),
  reason: z.enum(['scheduled', 'wear', 'damage', 'quality_issues']),
  notes: z.string().optional(),
});

export type BladeChangeFormData = z.infer<typeof bladeChangeSchema>;

// ----- End of Day Report Schemas -----

export const endOfDayReportSchema = z.object({
  rink_id: z.string().min(1, 'Please select a rink'),
  total_ice_makes: z.number().min(0),
  checklist_items: z.record(z.string(), z.boolean()),
  notes: z.string().optional(),
});

export type EndOfDayReportFormData = z.infer<typeof endOfDayReportSchema>;

// ----- Admin Schemas -----

export const facilitySettingsSchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  contact_email: z.string().email('Please enter a valid email'),
  contact_phone: z.string().optional(),
});

export type FacilitySettingsFormData = z.infer<typeof facilitySettingsSchema>;

export const rinkSettingsSchema = z.object({
  name: z.string().min(1, 'Rink name is required'),
  length_ft: z.number().positive('Length must be positive'),
  width_ft: z.number().positive('Width must be positive'),
  primary_use: z.enum(['hockey', 'figure_skating', 'recreational', 'multi_use']),
  target_depth_min: z.number().positive(),
  target_depth_max: z.number().positive(),
  measurement_template: z.enum(['25-point', '35-point', '47-point', 'custom']),
});

export type RinkSettingsFormData = z.infer<typeof rinkSettingsSchema>;

export const resurfacerSettingsSchema = z.object({
  name: z.string().min(1, 'Resurfacer name is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  fuel_type: z.enum(['electric', 'gas', 'propane']),
  serial_number: z.string().optional(),
  assigned_rink_ids: z.array(z.string()).optional(),
});

export type ResurfacerSettingsFormData = z.infer<typeof resurfacerSettingsSchema>;

export const userSettingsSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['facility_manager', 'lead_ice_tech', 'ice_technician', 'maintenance', 'attendant']),
  is_active: z.boolean(),
});

export type UserSettingsFormData = z.infer<typeof userSettingsSchema>;
