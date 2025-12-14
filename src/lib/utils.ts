import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MeasurementStatus } from '../types';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert millimeters to inches
 */
export function mmToInches(mm: number): number {
  return mm / 25.4;
}

/**
 * Convert inches to millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * 25.4;
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Get ice depth status based on measurement (in mm)
 * Ideal: 25.4mm - 44.45mm (1" - 1.75")
 * Warning: 19.05mm - 25.4mm OR 44.45mm - 50.8mm
 * Critical: Under 19.05mm OR over 50.8mm
 */
export function getIceDepthStatus(depthMm: number): MeasurementStatus {
  if (depthMm >= 25.4 && depthMm <= 44.45) {
    return 'ideal';
  }
  if ((depthMm >= 19.05 && depthMm < 25.4) || (depthMm > 44.45 && depthMm <= 50.8)) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Format ice depth for display
 */
export function formatDepth(depthMm: number, unit: 'mm' | 'in' = 'mm'): string {
  if (unit === 'in') {
    return `${mmToInches(depthMm).toFixed(2)}"`;
  }
  return `${depthMm.toFixed(1)}mm`;
}

/**
 * Format temperature for display
 */
export function formatTemperature(tempC: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(tempC).toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format time for display
 */
export function formatTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Calculate statistical values from an array of numbers
 */
export function calculateStats(values: number[]): {
  min: number;
  max: number;
  avg: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, stdDev: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return { min, max, avg, stdDev };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
