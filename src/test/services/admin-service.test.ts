import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFacility,
  saveFacility,
  getRinks,
  saveRink,
  deleteRink,
  getResurfacers,
  saveResurfacer,
  deleteResurfacer,
  getUsers,
  saveUser,
  deleteUser,
  getThresholds,
  saveThresholds,
  getAdminStats,
} from '../../services/admin-service';

describe('Admin Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Facility', () => {
    it('should return default facility when none exists', async () => {
      const facility = await getFacility();
      expect(facility).toBeDefined();
      expect(facility.name).toBe('Tennity Ice Skating Pavilion');
      expect(facility.city).toBe('Syracuse');
    });

    it('should save facility changes', async () => {
      const facility = await getFacility();
      const updated = await saveFacility({ ...facility, name: 'Test Facility' });
      expect(updated.name).toBe('Test Facility');

      const retrieved = await getFacility();
      expect(retrieved.name).toBe('Test Facility');
    });
  });

  describe('Rinks', () => {
    it('should return default rinks when none exist', async () => {
      const rinks = await getRinks();
      expect(rinks).toBeDefined();
      expect(rinks.length).toBeGreaterThan(0);
      expect(rinks[0].name).toContain('Rink A');
    });

    it('should save a new rink', async () => {
      const newRink = await saveRink({
        name: 'Test Rink',
        length_ft: 200,
        width_ft: 85,
        primary_use: 'hockey',
        target_depth_min: 25.4,
        target_depth_max: 44.45,
        measurement_template: '25-point',
        is_active: true,
      });

      expect(newRink.id).toBeDefined();
      expect(newRink.name).toBe('Test Rink');

      const rinks = await getRinks();
      const found = rinks.find((r) => r.name === 'Test Rink');
      expect(found).toBeDefined();
    });

    it('should update an existing rink', async () => {
      const rinks = await getRinks();
      const firstRink = rinks[0];

      const updated = await saveRink({
        ...firstRink,
        name: 'Updated Rink Name',
      });

      expect(updated.name).toBe('Updated Rink Name');
    });

    it('should delete a rink', async () => {
      const rinks = await getRinks();
      const countBefore = rinks.length;
      const firstRink = rinks[0];

      await deleteRink(firstRink.id);

      const rinksAfter = await getRinks();
      expect(rinksAfter.length).toBe(countBefore - 1);
    });
  });

  describe('Resurfacers', () => {
    it('should return default resurfacers', async () => {
      const resurfacers = await getResurfacers();
      expect(resurfacers).toBeDefined();
      expect(resurfacers.length).toBeGreaterThan(0);
    });

    it('should save a new resurfacer', async () => {
      const newResurfacer = await saveResurfacer({
        name: 'Test Zamboni',
        make: 'Zamboni',
        model: '650',
        year: 2024,
        fuel_type: 'electric',
        hour_meter_reading: 0,
        assigned_rink_ids: [],
        is_active: true,
      });

      expect(newResurfacer.id).toBeDefined();
      expect(newResurfacer.name).toBe('Test Zamboni');
    });

    it('should delete a resurfacer', async () => {
      const resurfacers = await getResurfacers();
      const countBefore = resurfacers.length;

      await deleteResurfacer(resurfacers[0].id);

      const resurfacersAfter = await getResurfacers();
      expect(resurfacersAfter.length).toBe(countBefore - 1);
    });
  });

  describe('Users', () => {
    it('should return default users', async () => {
      const users = await getUsers();
      expect(users).toBeDefined();
      expect(users.length).toBeGreaterThan(0);
    });

    it('should save a new user', async () => {
      const newUser = await saveUser({
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'ice_technician',
        is_active: true,
      });

      expect(newUser.id).toBeDefined();
      expect(newUser.full_name).toBe('Test User');
    });

    it('should delete a user', async () => {
      const users = await getUsers();
      const countBefore = users.length;

      await deleteUser(users[0].id);

      const usersAfter = await getUsers();
      expect(usersAfter.length).toBe(countBefore - 1);
    });
  });

  describe('Thresholds', () => {
    it('should return default thresholds', async () => {
      const thresholds = await getThresholds();
      expect(thresholds).toBeDefined();
      expect(thresholds.ice_depth).toBeDefined();
      expect(thresholds.blade_life).toBeDefined();
    });

    it('should save threshold changes', async () => {
      const thresholds = await getThresholds();
      thresholds.ice_depth.ideal_min_mm = 30;

      await saveThresholds(thresholds);

      const retrieved = await getThresholds();
      expect(retrieved.ice_depth.ideal_min_mm).toBe(30);
    });
  });

  describe('Admin Stats', () => {
    it('should return correct stats', async () => {
      const stats = await getAdminStats();
      expect(stats.activeUsers).toBeGreaterThan(0);
      expect(stats.totalRinks).toBeGreaterThan(0);
      expect(stats.activeResurfacers).toBeGreaterThan(0);
    });
  });
});
