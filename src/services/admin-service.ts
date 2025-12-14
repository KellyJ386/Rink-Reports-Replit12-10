// ==========================================
// Admin Service - Facility, Rink, Resurfacer, User Management
// ==========================================

import type { Facility, Rink, Resurfacer, User, UserRole } from '../types';

// ----- Storage Keys -----
const STORAGE_KEYS = {
  facility: 'mfo_facility',
  rinks: 'mfo_rinks',
  resurfacers: 'mfo_resurfacers',
  users: 'mfo_users',
  thresholds: 'mfo_thresholds',
};

// ----- Threshold Settings Interface -----
export interface ThresholdSettings {
  ice_depth: {
    ideal_min_mm: number;
    ideal_max_mm: number;
    warning_min_mm: number;
    warning_max_mm: number;
  };
  blade_life: {
    target_hours: number;
    warning_hours: number;
  };
  water_usage: {
    max_per_resurface_percent: number;
  };
  battery: {
    low_warning_percent: number;
  };
}

// ----- Default Data -----
const DEFAULT_FACILITY: Facility = {
  id: 'facility-1',
  name: 'Tennity Ice Skating Pavilion',
  address: '1501 Jamesville Avenue',
  city: 'Syracuse',
  state: 'NY',
  zip_code: '13244',
  country: 'US',
  timezone: 'America/New_York',
  contact_email: 'rink@syr.edu',
  contact_phone: '(315) 443-4498',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_RINKS: Rink[] = [
  {
    id: 'rink-a',
    facility_id: 'facility-1',
    name: 'Rink A - Main Arena',
    length_ft: 200,
    width_ft: 85,
    primary_use: 'hockey',
    target_depth_min: 25.4,
    target_depth_max: 44.45,
    measurement_template: '25-point',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rink-b',
    facility_id: 'facility-1',
    name: 'Rink B - Practice Rink',
    length_ft: 200,
    width_ft: 85,
    primary_use: 'multi_use',
    target_depth_min: 25.4,
    target_depth_max: 44.45,
    measurement_template: '35-point',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_RESURFACERS: Resurfacer[] = [
  {
    id: 'z1',
    facility_id: 'facility-1',
    name: 'Zamboni #1',
    make: 'Zamboni',
    model: '552',
    year: 2020,
    fuel_type: 'electric',
    hour_meter_reading: 1245.5,
    assigned_rink_ids: ['rink-a'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'z2',
    facility_id: 'facility-1',
    name: 'Zamboni #2',
    make: 'Zamboni',
    model: '450',
    year: 2018,
    fuel_type: 'propane',
    hour_meter_reading: 2150.2,
    assigned_rink_ids: ['rink-b'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    email: 'john.smith@facility.com',
    full_name: 'John Smith',
    role: 'facility_manager',
    facility_id: 'facility-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-2',
    email: 'jane.doe@facility.com',
    full_name: 'Jane Doe',
    role: 'lead_ice_tech',
    facility_id: 'facility-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'bob.wilson@facility.com',
    full_name: 'Bob Wilson',
    role: 'ice_technician',
    facility_id: 'facility-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  ice_depth: {
    ideal_min_mm: 25.4, // 1 inch
    ideal_max_mm: 44.45, // 1.75 inches
    warning_min_mm: 19.05, // 0.75 inches
    warning_max_mm: 50.8, // 2 inches
  },
  blade_life: {
    target_hours: 25,
    warning_hours: 30,
  },
  water_usage: {
    max_per_resurface_percent: 100,
  },
  battery: {
    low_warning_percent: 20,
  },
};

// ----- Facility Functions -----

export async function getFacility(): Promise<Facility> {
  const stored = localStorage.getItem(STORAGE_KEYS.facility);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.facility, JSON.stringify(DEFAULT_FACILITY));
  return DEFAULT_FACILITY;
}

export async function saveFacility(facility: Partial<Facility>): Promise<Facility> {
  const current = await getFacility();
  const updated: Facility = {
    ...current,
    ...facility,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.facility, JSON.stringify(updated));
  return updated;
}

// ----- Rink Functions -----

export async function getRinks(): Promise<Rink[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.rinks);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.rinks, JSON.stringify(DEFAULT_RINKS));
  return DEFAULT_RINKS;
}

export async function getRinkById(id: string): Promise<Rink | null> {
  const rinks = await getRinks();
  return rinks.find((r) => r.id === id) || null;
}

export async function saveRink(rink: Partial<Rink> & { id?: string }): Promise<Rink> {
  const rinks = await getRinks();

  if (rink.id) {
    // Update existing
    const index = rinks.findIndex((r) => r.id === rink.id);
    if (index >= 0) {
      rinks[index] = {
        ...rinks[index],
        ...rink,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.rinks, JSON.stringify(rinks));
      return rinks[index];
    }
  }

  // Create new
  const newRink: Rink = {
    id: `rink-${Date.now()}`,
    facility_id: 'facility-1',
    name: rink.name || 'New Rink',
    length_ft: rink.length_ft || 200,
    width_ft: rink.width_ft || 85,
    primary_use: rink.primary_use || 'multi_use',
    target_depth_min: rink.target_depth_min || 25.4,
    target_depth_max: rink.target_depth_max || 44.45,
    measurement_template: rink.measurement_template || '25-point',
    is_active: rink.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  rinks.push(newRink);
  localStorage.setItem(STORAGE_KEYS.rinks, JSON.stringify(rinks));
  return newRink;
}

export async function deleteRink(id: string): Promise<void> {
  const rinks = await getRinks();
  const filtered = rinks.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.rinks, JSON.stringify(filtered));
}

// ----- Resurfacer Functions -----

export async function getResurfacers(): Promise<Resurfacer[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.resurfacers);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.resurfacers, JSON.stringify(DEFAULT_RESURFACERS));
  return DEFAULT_RESURFACERS;
}

export async function getResurfacerById(id: string): Promise<Resurfacer | null> {
  const resurfacers = await getResurfacers();
  return resurfacers.find((r) => r.id === id) || null;
}

export async function saveResurfacer(resurfacer: Partial<Resurfacer> & { id?: string }): Promise<Resurfacer> {
  const resurfacers = await getResurfacers();

  if (resurfacer.id) {
    // Update existing
    const index = resurfacers.findIndex((r) => r.id === resurfacer.id);
    if (index >= 0) {
      resurfacers[index] = {
        ...resurfacers[index],
        ...resurfacer,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.resurfacers, JSON.stringify(resurfacers));
      return resurfacers[index];
    }
  }

  // Create new
  const newResurfacer: Resurfacer = {
    id: `resurfacer-${Date.now()}`,
    facility_id: 'facility-1',
    name: resurfacer.name || 'New Resurfacer',
    make: resurfacer.make || '',
    model: resurfacer.model || '',
    year: resurfacer.year || new Date().getFullYear(),
    fuel_type: resurfacer.fuel_type || 'electric',
    hour_meter_reading: resurfacer.hour_meter_reading || 0,
    assigned_rink_ids: resurfacer.assigned_rink_ids || [],
    is_active: resurfacer.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  resurfacers.push(newResurfacer);
  localStorage.setItem(STORAGE_KEYS.resurfacers, JSON.stringify(resurfacers));
  return newResurfacer;
}

export async function deleteResurfacer(id: string): Promise<void> {
  const resurfacers = await getResurfacers();
  const filtered = resurfacers.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.resurfacers, JSON.stringify(filtered));
}

export async function updateResurfacerHourMeter(id: string, hours: number): Promise<void> {
  const resurfacers = await getResurfacers();
  const index = resurfacers.findIndex((r) => r.id === id);
  if (index >= 0 && hours > resurfacers[index].hour_meter_reading) {
    resurfacers[index].hour_meter_reading = hours;
    resurfacers[index].updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.resurfacers, JSON.stringify(resurfacers));
  }
}

// ----- User Functions -----

export async function getUsers(): Promise<User[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.users);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function saveUser(user: Partial<User> & { id?: string }): Promise<User> {
  const users = await getUsers();

  if (user.id) {
    // Update existing
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = {
        ...users[index],
        ...user,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      return users[index];
    }
  }

  // Create new
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: user.email || '',
    full_name: user.full_name || '',
    role: (user.role as UserRole) || 'ice_technician',
    facility_id: 'facility-1',
    is_active: user.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  return newUser;
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  const filtered = users.filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(filtered));
}

// ----- Threshold Settings Functions -----

export async function getThresholds(): Promise<ThresholdSettings> {
  const stored = localStorage.getItem(STORAGE_KEYS.thresholds);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default
  localStorage.setItem(STORAGE_KEYS.thresholds, JSON.stringify(DEFAULT_THRESHOLDS));
  return DEFAULT_THRESHOLDS;
}

export async function saveThresholds(thresholds: ThresholdSettings): Promise<ThresholdSettings> {
  localStorage.setItem(STORAGE_KEYS.thresholds, JSON.stringify(thresholds));
  return thresholds;
}

// ----- Stats Functions -----

export async function getAdminStats(): Promise<{
  activeUsers: number;
  totalRinks: number;
  activeResurfacers: number;
}> {
  const [users, rinks, resurfacers] = await Promise.all([
    getUsers(),
    getRinks(),
    getResurfacers(),
  ]);

  return {
    activeUsers: users.filter((u) => u.is_active).length,
    totalRinks: rinks.filter((r) => r.is_active).length,
    activeResurfacers: resurfacers.filter((r) => r.is_active).length,
  };
}
