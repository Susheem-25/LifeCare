import { Hospital, ABHAMedicalRecord, EmergencyBooking, DriverAccount } from '../types';

/**
 * Pure Clean Architecture: No mock, dummy, or pre-seeded data.
 * All hospitals, drivers, and patient bookings are dynamically created
 * and persisted to Cloud Firestore based on real user accounts.
 */

export const INITIAL_HOSPITALS: Hospital[] = [];

export const PRESET_EMERGENCIES: Array<{
  id: string;
  label: string;
  icon: string;
  brief: string;
  category: string;
  suggestedUrgency: string;
}> = [];

export const SAMPLE_ABHA_PROFILES: ABHAMedicalRecord[] = [];

export const DEFAULT_ACTIVE_BOOKING: EmergencyBooking | null = null;

export const SAMPLE_DRIVERS: DriverAccount[] = [];
