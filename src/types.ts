export type UrgencyLevel = 'CRITICAL_RED' | 'URGENT_AMBER' | 'PRIORITY_YELLOW';

// Emergency Severity Index (ESI) 1-5 triage standard (Slide 3 & 4)
export type ESILevel = 1 | 2 | 3 | 4 | 5;

export type AppRole = 'welcome' | 'guardian' | 'driver' | 'hospital';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  status: 'AVAILABLE_AND_FREE' | 'IN_SURGERY' | 'OFF_DUTY' | 'FREE' | 'BUSY' | 'ABSENT';
  currentBay?: string;
  avatar: string;
  phone: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'IMAGING' | 'LIFE_SUPPORT' | 'SURGICAL' | 'DIAGNOSTIC';
  status: 'READY_AND_STERILIZED' | 'IN_USE' | 'MAINTENANCE';
  location: string;
  quantityAvailable: number;
  totalQuantity: number;
}

export interface DriverAccount {
  driverId: string;
  pin: string;
  driverName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
}

export interface Hospital {
  id: string;
  hospitalCode: string;
  password: string;
  name: string;
  type: 'Trauma Center Level 1' | 'Super Speciality' | 'Multispeciality ER' | 'Cardiac Center';
  address: string;
  city: string;
  distanceKm: number;
  transitTimeMins: number;
  latitude: number;
  longitude: number;
  phone: string;
  rating: number;
  beds: {
    icuTotal: number;
    icuFree: number;
    emergencyTotal: number;
    emergencyFree: number;
    ventilatorTotal: number;
    ventilatorFree: number;
  };
  doctors: Doctor[];
  equipments: Equipment[];
  traumaLevel: 1 | 2 | 3;
  accreditation: string[];
  matchScore?: number;
}

export interface AITriageAnalysis {
  detectedCondition: string;
  summary: string;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  esiLevel: ESILevel; // ESI 1-5 Severity Standard (LifeCare PPTX Slide 3 & 4)
  esiCategory: string; // e.g., 'ESI-1: Immediate Resuscitation' | 'ESI-2: Emergent'
  goldenHourWindowMinutes: number;
  recommendedSpeciality: string[];
  requiredMachinery: string[];
  firstAidImmediateInstructions: string[];
  icdCodeEstimate: string; // e.g., ICD-10 I21.9
  aiConfidenceScore: number;
  bhashiniLanguage?: string; // Bhashini STT + TTS
  groqModel?: string; // Groq Llama 3.3
  atomicLockTimeMs?: number; // <9ms Neo4j graph lock
  gateRejectionRisk?: string; // 0% Gate Rejection
  receptionWaitTime?: string; // 0 sec Reception Intake
}

export interface PatientVitals {
  heartRate: number; // bpm
  bloodPressureSys: number; // mmHg
  bloodPressureDia: number; // mmHg
  spO2: number; // %
  respiratoryRate: number; // breaths/min
  temperatureF: number;
  gcsScore: number; // Glasgow Coma Scale 3-15
  recordedAt: string;
}

export interface ABHAMedicalRecord {
  abhaId: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  photoUrl: string;
  phoneNumber: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  knownAllergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  insuranceProvider: string;
  pmjayEligible: boolean; // PM-JAY Ayushman Bharat (Slide 2, 3, 4, 5)
  pmjayCardNumber?: string;
  coverageAmountINR: number;
  verifiedWithABDM: boolean; // ABDM Sandbox v3
}

export interface EmergencyBooking {
  patientUniqueId: string;
  bookingCode: string;
  patientName: string;
  patientPhone: string;
  emergencyBrief: string;
  aiAnalysis: AITriageAnalysis;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalCoords: {
    lat: number;
    lng: number;
  };
  patientPickupCoords: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedDoctor: Doctor;
  reservedBay: string;
  reservedBedType: 'ICU' | 'Emergency Trauma Bay';
  reservedEquipments: string[];
  createdAt: string;
  expiresAt: string; // 20 min hold
  status: 'PENDING_AMBULANCE' | 'AMBULANCE_EN_ROUTE_PICKUP' | 'PATIENT_PICKED_UP' | 'IN_TRANSIT_TO_HOSPITAL' | 'ARRIVED_ER' | 'ADMITTED' | 'DISCHARGED';
  driverLoggedIn?: boolean;
  driverLoggedInAt?: string;
  ambulanceDetails: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    type: 'Advanced Cardiac Life Support (ACLS)' | 'Basic Life Support (BLS)' | 'Trauma Mobile ICU';
    currentEtaMins: number;
    currentSpeedKmh: number;
    distanceRemainingKm: number;
  };
  inTransitPaperwork: {
    isSubmitted: boolean;
    submittedAt?: string;
    abhaDetails?: ABHAMedicalRecord;
    initialVitals?: PatientVitals;
    digitalConsentSigned: boolean;
    preAdmitRegistrationNumber?: string;
  };
  securitySignature?: string;
  tokenExpiryTimestamp?: number;
}

/* ========================================================
   LIFECARE: ZERO-WAIT EMERGENCY HEALTHCARE OS
   Autonomous Emergency Triage & Resource Allocation
   ======================================================== */

export type IndicLanguageCode = 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te' | 'gu' | 'pa';
// Backward compatibility alias
export type SarvamLanguageCode = IndicLanguageCode;

export interface IndicLanguageInfo {
  code: IndicLanguageCode;
  name: string;
  nativeName: string;
  samplePrompt: string;
  audioSampleLabel: string;
}
export type SarvamLanguageInfo = IndicLanguageInfo;

export interface VoiceTriageResult {
  detectedLanguage: IndicLanguageCode;
  originalText: string;
  clinicalTranslation: string;
  confidenceScore: number;
  extractedSymptoms: string[];
  suggestedICD10: string;
  esiLevel: ESILevel;
  voiceEngine: 'Bhashini STT + TTS' | 'Whisper Backup';
  inferenceEngine: 'Groq Llama 3.3';
  processingTimeMs: number;
}
export type SarvamTranslationResult = VoiceTriageResult;

// Neo4j AuraDB Graph Engine Types (<9ms Atomic Resource Locking)
export type Neo4jNodeType = 'PATIENT' | 'HOSPITAL' | 'DOCTOR' | 'SPECIALTY' | 'EQUIPMENT' | 'BED' | 'ALLERGY';

export interface Neo4jNode {
  id: string;
  label: string;
  type: Neo4jNodeType;
  properties: Record<string, string | number | boolean>;
  x?: number;
  y?: number;
}

export interface Neo4jRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
}

export interface Neo4jGraphPayload {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
  cypherQuery: string;
  executionTimeMs: number;
  matchCount: number;
  transactionId?: string;
}

// System Metadata & Mission Standards
export const SYSTEM_INFO = {
  name: 'LifeCare',
  tagline: 'AI-powered solution for saving critical minutes during medical emergency',
  motto: 'Every Minute Saved Is a Life Preserved.',
} as const;
