export type UrgencyLevel = 'CRITICAL_RED' | 'URGENT_AMBER' | 'PRIORITY_YELLOW';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  status: 'AVAILABLE_AND_FREE' | 'IN_SURGERY' | 'OFF_DUTY';
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
  goldenHourWindowMinutes: number;
  recommendedSpeciality: string[];
  requiredMachinery: string[];
  firstAidImmediateInstructions: string[];
  icdCodeEstimate: string;
  aiConfidenceScore: number;
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
  pmjayEligible: boolean;
  pmjayCardNumber?: string;
  coverageAmountINR: number;
  verifiedWithABDM: boolean;
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
  status: 'PENDING_AMBULANCE' | 'AMBULANCE_EN_ROUTE_PICKUP' | 'PATIENT_PICKED_UP' | 'IN_TRANSIT_TO_HOSPITAL' | 'ARRIVED_ER' | 'ADMITTED';
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
}

/* ========================================================
   HACKFRONT INDIA MULTI-TRACK DATA STRUCTURES
   ======================================================== */

// 1. Sarvam Track Types
export type SarvamLanguageCode = 'hi' | 'en' | 'bn' | 'mr' | 'ta' | 'te' | 'pa';

export interface SarvamLanguageInfo {
  code: SarvamLanguageCode;
  name: string;
  nativeName: string;
  samplePrompt: string;
  audioSampleLabel: string;
}

export interface SarvamTranslationResult {
  detectedLanguage: SarvamLanguageCode;
  originalText: string;
  clinicalTranslation: string;
  confidenceScore: number;
  extractedSymptoms: string[];
  suggestedICD10: string;
  sarvamModel: 'sarvam-1-indic' | 'sarvam-saaras-speech';
  processingTimeMs: number;
}

// 2. Neo4j Track Types
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
}

// 3. Arduino Track Types
export interface ArduinoUnoQPacket {
  timestamp: string;
  rawHex: string;
  pulseOxSpO2: number;
  heartRateBpm: number;
  ecgMicrovolts: number;
  cabinTempC: number;
  cabinTempF: number;
  transportVibrationG: number;
  packetSeq: number;
}

export interface ArduinoUnoQDeviceState {
  boardModel: 'Arduino UnoQ Rev 2.0 (Dual-Core IoT)';
  firmwareVersion: 'v2.4-LifeCare-UnoQ';
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'STREAMING';
  serialPort: 'COM3 (USB-Serial)' | '/dev/ttyACM0';
  baudRate: 115200;
  connectedSensors: {
    max30102: boolean; // SpO2 & Heart Rate
    ad8232: boolean;   // Lead-II ECG Heart Monitor
    bmp280: boolean;   // Cabin temp & pressure
    mpu6050: boolean;  // 6-DOF transport stability accelerometer
  };
}


