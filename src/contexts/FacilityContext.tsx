import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Facility, Rink, Resurfacer } from '../types';

interface FacilityState {
  facilities: Facility[];
  currentFacility: Facility | null;
  rinks: Rink[];
  resurfacers: Resurfacer[];
  isLoading: boolean;
}

interface FacilityContextType extends FacilityState {
  setCurrentFacility: (facility: Facility) => void;
  refreshFacilityData: () => Promise<void>;
}

const FacilityContext = createContext<FacilityContextType | null>(null);

// Demo facilities for development
const DEMO_FACILITIES: Facility[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'MFO Ice Arena',
    address: '123 Hockey Drive',
    city: 'Edmonton',
    state: 'AB',
    zip_code: 'T5J 0N3',
    country: 'Canada',
    timezone: 'America/Edmonton',
    contact_email: 'admin@mfo-ice.com',
    contact_phone: '(780) 555-0100',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'Northside Recreation Center',
    address: '456 Skate Lane',
    city: 'Calgary',
    state: 'AB',
    zip_code: 'T2P 1J9',
    country: 'Canada',
    timezone: 'America/Edmonton',
    contact_email: 'admin@northside.com',
    contact_phone: '(403) 555-0200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_RINKS: Record<string, Rink[]> = {
  'd0000000-0000-0000-0000-000000000001': [
    {
      id: 'r1000000-0000-0000-0000-000000000001',
      facility_id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Rink A',
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
      id: 'r1000000-0000-0000-0000-000000000002',
      facility_id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Rink B',
      length_ft: 200,
      width_ft: 85,
      primary_use: 'figure_skating',
      target_depth_min: 31.75,
      target_depth_max: 38.1,
      measurement_template: '35-point',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  'd0000000-0000-0000-0000-000000000002': [
    {
      id: 'r2000000-0000-0000-0000-000000000001',
      facility_id: 'd0000000-0000-0000-0000-000000000002',
      name: 'Main Rink',
      length_ft: 200,
      width_ft: 85,
      primary_use: 'multi_use',
      target_depth_min: 25.4,
      target_depth_max: 44.45,
      measurement_template: '25-point',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

const DEMO_RESURFACERS: Record<string, Resurfacer[]> = {
  'd0000000-0000-0000-0000-000000000001': [
    {
      id: 's1000000-0000-0000-0000-000000000001',
      facility_id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Zamboni #1',
      make: 'Zamboni',
      model: '552',
      year: 2020,
      fuel_type: 'electric',
      serial_number: 'ZAM-2020-001',
      hour_meter_reading: 1250.5,
      assigned_rink_ids: ['r1000000-0000-0000-0000-000000000001'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 's1000000-0000-0000-0000-000000000002',
      facility_id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Olympia #2',
      make: 'Olympia',
      model: 'Millennium H',
      year: 2018,
      fuel_type: 'propane',
      serial_number: 'OLY-2018-002',
      hour_meter_reading: 3420.0,
      assigned_rink_ids: ['r1000000-0000-0000-0000-000000000002'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  'd0000000-0000-0000-0000-000000000002': [
    {
      id: 's2000000-0000-0000-0000-000000000001',
      facility_id: 'd0000000-0000-0000-0000-000000000002',
      name: 'Zamboni #1',
      make: 'Zamboni',
      model: '650',
      year: 2022,
      fuel_type: 'electric',
      hour_meter_reading: 450,
      assigned_rink_ids: ['r2000000-0000-0000-0000-000000000001'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FacilityState>({
    facilities: [],
    currentFacility: null,
    rinks: [],
    resurfacers: [],
    isLoading: true,
  });

  // Load facilities on mount
  useEffect(() => {
    loadFacilities();
  }, []);

  // Load rinks and resurfacers when facility changes
  useEffect(() => {
    if (state.currentFacility) {
      loadFacilityData(state.currentFacility.id);
    }
  }, [state.currentFacility?.id]);

  const loadFacilities = async () => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      const savedFacilityId = localStorage.getItem('currentFacilityId');
      const currentFacility = savedFacilityId
        ? DEMO_FACILITIES.find(f => f.id === savedFacilityId) || DEMO_FACILITIES[0]
        : DEMO_FACILITIES[0];

      setState(prev => ({
        ...prev,
        facilities: DEMO_FACILITIES,
        currentFacility,
        isLoading: false,
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) throw error;

      const facilities = (data || []) as Facility[];
      const savedFacilityId = localStorage.getItem('currentFacilityId');
      const currentFacility = savedFacilityId
        ? facilities.find(f => f.id === savedFacilityId) || facilities[0]
        : facilities[0];

      setState(prev => ({
        ...prev,
        facilities,
        currentFacility: currentFacility || null,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error loading facilities:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadFacilityData = async (facilityId: string) => {
    if (!isSupabaseConfigured()) {
      // Demo mode
      setState(prev => ({
        ...prev,
        rinks: DEMO_RINKS[facilityId] || [],
        resurfacers: DEMO_RESURFACERS[facilityId] || [],
      }));
      return;
    }

    try {
      const [rinksResult, resurfacersResult] = await Promise.all([
        supabase.from('rinks').select('*').eq('facility_id', facilityId).order('name'),
        supabase.from('resurfacers').select('*').eq('facility_id', facilityId).order('name'),
      ]);

      setState(prev => ({
        ...prev,
        rinks: (rinksResult.data || []) as Rink[],
        resurfacers: (resurfacersResult.data || []) as Resurfacer[],
      }));
    } catch (err) {
      console.error('Error loading facility data:', err);
    }
  };

  const setCurrentFacility = (facility: Facility) => {
    localStorage.setItem('currentFacilityId', facility.id);
    setState(prev => ({ ...prev, currentFacility: facility }));
  };

  const refreshFacilityData = async () => {
    if (state.currentFacility) {
      await loadFacilityData(state.currentFacility.id);
    }
  };

  return (
    <FacilityContext.Provider
      value={{
        ...state,
        setCurrentFacility,
        refreshFacilityData,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
}
