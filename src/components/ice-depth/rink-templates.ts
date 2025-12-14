import { type MeasurementStatus } from '../../types';

// Hockey rink dimensions (scaled to viewBox)
export const RINK_VIEWBOX = {
  width: 200,
  height: 85,
};

// Zone boundaries (in feet from left edge)
export const ZONE_BOUNDARIES = {
  goalLineLeft: 11,      // Goal line to boards
  blueLineLeft: 64,      // Left blue line
  centerLine: 100,       // Center ice
  blueLineRight: 136,    // Right blue line
  goalLineRight: 189,    // Goal line to boards
};

// Zone definitions
export type RinkZone = 'north_goal' | 'north_blue' | 'center' | 'south_blue' | 'south_goal';

export interface MeasurementPoint {
  id: string;
  x: number;
  y: number;
  zone: RinkZone;
  order: number;
}

// Get zone based on x position
export function getZoneFromX(x: number): RinkZone {
  if (x <= ZONE_BOUNDARIES.goalLineLeft + 10) return 'north_goal';
  if (x <= ZONE_BOUNDARIES.blueLineLeft) return 'north_blue';
  if (x <= ZONE_BOUNDARIES.blueLineRight) return 'center';
  if (x <= ZONE_BOUNDARIES.goalLineRight - 10) return 'south_blue';
  return 'south_goal';
}

// Standard 25-point template
export const TEMPLATE_25_POINTS: MeasurementPoint[] = [
  // Goal line left (5 points)
  { id: 'p1', x: 11, y: 12, zone: 'north_goal', order: 1 },
  { id: 'p2', x: 11, y: 28, zone: 'north_goal', order: 2 },
  { id: 'p3', x: 11, y: 42.5, zone: 'north_goal', order: 3 },
  { id: 'p4', x: 11, y: 57, zone: 'north_goal', order: 4 },
  { id: 'p5', x: 11, y: 73, zone: 'north_goal', order: 5 },
  // Blue line left (5 points) - snake pattern (right to left)
  { id: 'p6', x: 64, y: 73, zone: 'north_blue', order: 6 },
  { id: 'p7', x: 64, y: 57, zone: 'north_blue', order: 7 },
  { id: 'p8', x: 64, y: 42.5, zone: 'north_blue', order: 8 },
  { id: 'p9', x: 64, y: 28, zone: 'north_blue', order: 9 },
  { id: 'p10', x: 64, y: 12, zone: 'north_blue', order: 10 },
  // Center ice (5 points) - snake pattern (left to right)
  { id: 'p11', x: 100, y: 12, zone: 'center', order: 11 },
  { id: 'p12', x: 100, y: 28, zone: 'center', order: 12 },
  { id: 'p13', x: 100, y: 42.5, zone: 'center', order: 13 },
  { id: 'p14', x: 100, y: 57, zone: 'center', order: 14 },
  { id: 'p15', x: 100, y: 73, zone: 'center', order: 15 },
  // Blue line right (5 points) - snake pattern (right to left)
  { id: 'p16', x: 136, y: 73, zone: 'south_blue', order: 16 },
  { id: 'p17', x: 136, y: 57, zone: 'south_blue', order: 17 },
  { id: 'p18', x: 136, y: 42.5, zone: 'south_blue', order: 18 },
  { id: 'p19', x: 136, y: 28, zone: 'south_blue', order: 19 },
  { id: 'p20', x: 136, y: 12, zone: 'south_blue', order: 20 },
  // Goal line right (5 points) - snake pattern (left to right)
  { id: 'p21', x: 189, y: 12, zone: 'south_goal', order: 21 },
  { id: 'p22', x: 189, y: 28, zone: 'south_goal', order: 22 },
  { id: 'p23', x: 189, y: 42.5, zone: 'south_goal', order: 23 },
  { id: 'p24', x: 189, y: 57, zone: 'south_goal', order: 24 },
  { id: 'p25', x: 189, y: 73, zone: 'south_goal', order: 25 },
];

// Standard 35-point template
export const TEMPLATE_35_POINTS: MeasurementPoint[] = [
  // Goal line left (7 points)
  { id: 'p1', x: 11, y: 8, zone: 'north_goal', order: 1 },
  { id: 'p2', x: 11, y: 20, zone: 'north_goal', order: 2 },
  { id: 'p3', x: 11, y: 32, zone: 'north_goal', order: 3 },
  { id: 'p4', x: 11, y: 42.5, zone: 'north_goal', order: 4 },
  { id: 'p5', x: 11, y: 53, zone: 'north_goal', order: 5 },
  { id: 'p6', x: 11, y: 65, zone: 'north_goal', order: 6 },
  { id: 'p7', x: 11, y: 77, zone: 'north_goal', order: 7 },
  // Blue line left (7 points)
  { id: 'p8', x: 64, y: 77, zone: 'north_blue', order: 8 },
  { id: 'p9', x: 64, y: 65, zone: 'north_blue', order: 9 },
  { id: 'p10', x: 64, y: 53, zone: 'north_blue', order: 10 },
  { id: 'p11', x: 64, y: 42.5, zone: 'north_blue', order: 11 },
  { id: 'p12', x: 64, y: 32, zone: 'north_blue', order: 12 },
  { id: 'p13', x: 64, y: 20, zone: 'north_blue', order: 13 },
  { id: 'p14', x: 64, y: 8, zone: 'north_blue', order: 14 },
  // Center ice (7 points)
  { id: 'p15', x: 100, y: 8, zone: 'center', order: 15 },
  { id: 'p16', x: 100, y: 20, zone: 'center', order: 16 },
  { id: 'p17', x: 100, y: 32, zone: 'center', order: 17 },
  { id: 'p18', x: 100, y: 42.5, zone: 'center', order: 18 },
  { id: 'p19', x: 100, y: 53, zone: 'center', order: 19 },
  { id: 'p20', x: 100, y: 65, zone: 'center', order: 20 },
  { id: 'p21', x: 100, y: 77, zone: 'center', order: 21 },
  // Blue line right (7 points)
  { id: 'p22', x: 136, y: 77, zone: 'south_blue', order: 22 },
  { id: 'p23', x: 136, y: 65, zone: 'south_blue', order: 23 },
  { id: 'p24', x: 136, y: 53, zone: 'south_blue', order: 24 },
  { id: 'p25', x: 136, y: 42.5, zone: 'south_blue', order: 25 },
  { id: 'p26', x: 136, y: 32, zone: 'south_blue', order: 26 },
  { id: 'p27', x: 136, y: 20, zone: 'south_blue', order: 27 },
  { id: 'p28', x: 136, y: 8, zone: 'south_blue', order: 28 },
  // Goal line right (7 points)
  { id: 'p29', x: 189, y: 8, zone: 'south_goal', order: 29 },
  { id: 'p30', x: 189, y: 20, zone: 'south_goal', order: 30 },
  { id: 'p31', x: 189, y: 32, zone: 'south_goal', order: 31 },
  { id: 'p32', x: 189, y: 42.5, zone: 'south_goal', order: 32 },
  { id: 'p33', x: 189, y: 53, zone: 'south_goal', order: 33 },
  { id: 'p34', x: 189, y: 65, zone: 'south_goal', order: 34 },
  { id: 'p35', x: 189, y: 77, zone: 'south_goal', order: 35 },
];

// Standard 47-point template (adds intermediate points between lines)
const TEMPLATE_47_RAW: MeasurementPoint[] = [
  // Goal line left (5 points)
  ...TEMPLATE_25_POINTS.slice(0, 5),
  // Between goal and blue (4 points)
  { id: 'p26', x: 37.5, y: 15, zone: 'north_blue', order: 26 },
  { id: 'p27', x: 37.5, y: 35, zone: 'north_blue', order: 27 },
  { id: 'p28', x: 37.5, y: 50, zone: 'north_blue', order: 28 },
  { id: 'p29', x: 37.5, y: 70, zone: 'north_blue', order: 29 },
  // Blue line left (5 points)
  ...TEMPLATE_25_POINTS.slice(5, 10).map((p, i) => ({ ...p, order: 30 + i })),
  // Between blue and center (4 points)
  { id: 'p35', x: 82, y: 15, zone: 'center' as RinkZone, order: 35 },
  { id: 'p36', x: 82, y: 35, zone: 'center' as RinkZone, order: 36 },
  { id: 'p37', x: 82, y: 50, zone: 'center' as RinkZone, order: 37 },
  { id: 'p38', x: 82, y: 70, zone: 'center' as RinkZone, order: 38 },
  // Center ice (5 points)
  ...TEMPLATE_25_POINTS.slice(10, 15).map((p, i) => ({ ...p, order: 39 + i })),
  // Between center and blue (4 points)
  { id: 'p44', x: 118, y: 15, zone: 'center' as RinkZone, order: 44 },
  { id: 'p45', x: 118, y: 35, zone: 'center' as RinkZone, order: 45 },
  { id: 'p46', x: 118, y: 50, zone: 'center' as RinkZone, order: 46 },
  { id: 'p47', x: 118, y: 70, zone: 'center' as RinkZone, order: 47 },
  // Blue line right (5 points)
  ...TEMPLATE_25_POINTS.slice(15, 20).map((p, i) => ({ ...p, order: 48 + i })),
  // Between blue and goal (4 points)
  { id: 'p53', x: 162.5, y: 15, zone: 'south_blue' as RinkZone, order: 53 },
  { id: 'p54', x: 162.5, y: 35, zone: 'south_blue' as RinkZone, order: 54 },
  { id: 'p55', x: 162.5, y: 50, zone: 'south_blue' as RinkZone, order: 55 },
  { id: 'p56', x: 162.5, y: 70, zone: 'south_blue' as RinkZone, order: 56 },
  // Goal line right (5 points)
  ...TEMPLATE_25_POINTS.slice(20, 25).map((p, i) => ({ ...p, order: 57 + i })),
];

export const TEMPLATE_47_POINTS: MeasurementPoint[] = TEMPLATE_47_RAW.map((p, i) => ({
  id: `p${i + 1}`,
  x: p.x,
  y: p.y,
  zone: p.zone,
  order: i + 1,
}));

// Get template by name
export function getTemplate(templateName: string): MeasurementPoint[] {
  switch (templateName) {
    case '25-point':
      return TEMPLATE_25_POINTS;
    case '35-point':
      return TEMPLATE_35_POINTS;
    case '47-point':
      return TEMPLATE_47_POINTS;
    default:
      return TEMPLATE_25_POINTS;
  }
}

// Get color based on ice depth status
export function getStatusColor(status: MeasurementStatus): string {
  switch (status) {
    case 'ideal':
      return '#69BE28'; // Action Green
    case 'warning':
      return '#FFC107'; // Warning Yellow
    case 'critical':
      return '#DC3545'; // Danger Red
    default:
      return '#A5ACAF'; // Wolf Grey
  }
}

// Calculate heat map color based on depth
export function getHeatMapColor(depthMm: number): string {
  // Ideal range: 25.4mm - 44.45mm
  if (depthMm < 19.05) return '#DC3545'; // Critical low - red
  if (depthMm < 25.4) return '#FFC107';  // Warning low - yellow
  if (depthMm <= 44.45) return '#69BE28'; // Ideal - green
  if (depthMm <= 50.8) return '#FFC107';  // Warning high - yellow
  return '#DC3545'; // Critical high - red
}
