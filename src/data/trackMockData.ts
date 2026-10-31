import type { 
  SarvamLanguageInfo, 
  Neo4jNode, 
  Neo4jRelationship, 
  ArduinoUnoQPacket 
} from '../types';

/* ========================================================
   TRACK 1: SARVAM INDIC AI DATA & MULTILINGUAL SAMPLES
   ======================================================== */
export const SARVAM_SUPPORTED_LANGUAGES: SarvamLanguageInfo[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    samplePrompt: 'पिताजी के सीने में बहुत तेज दर्द हो रहा है, पसीना आ रहा है और सांस लेने में भारी तकलीफ है। दर्द बाएं हाथ तक जा रहा है।',
    audioSampleLabel: 'Hindi (Sarvam Saaras Voice)',
  },
  {
    code: 'en',
    name: 'English (Indian)',
    nativeName: 'English (IN)',
    samplePrompt: 'Father experiencing acute substernal chest pressure radiating to left arm, profuse diaphoresis, and dyspnea.',
    audioSampleLabel: 'Indian English (Sarvam Saaras Voice)',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    samplePrompt: 'বাবার বুকে তীব্র চাপ ও অসহ্য ব্যথা হচ্ছে, অতিরিক্ত ঘাম হচ্ছে এবং শ্বাস নিতে খুব কষ্ট হচ্ছে।',
    audioSampleLabel: 'Bengali (Sarvam Saaras Voice)',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    samplePrompt: 'वडिलांच्या छातीत प्रचंड दुखत आहे, खूप घाम येत आहे आणि श्वास घेण्यास त्रास होत आहे, वेदना डाव्या हाताकडे पसरत आहे.',
    audioSampleLabel: 'Marathi (Sarvam Saaras Voice)',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    samplePrompt: 'அப்பாவுக்கு நெஞ்சில் கடுமையான வலி, அதிக வியர்வை மற்றும் மூச்சுத்திணறல் உள்ளது. வலி இடது கை வரை பரவுகிறது.',
    audioSampleLabel: 'Tamil (Sarvam Saaras Voice)',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    samplePrompt: 'నాన్నగారికి గుండెలో తీవ్రమైన నొప్పి, విపరీతమైన చెమటలు మరియు ఊపిరాడటం లేదు. నొప్పి ఎడమ చేతికి వ్యాపిస్తోంది.',
    audioSampleLabel: 'Telugu (Sarvam Saaras Voice)',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    samplePrompt: 'ਪਿਤਾ ਜੀ ਦੀ ਛਾਤੀ ਵਿੱਚ ਬਹੁਤ ਤੇਜ਼ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ, ਪਸੀਨਾ ਆ ਰਿਹਾ ਹੈ ਅਤੇ ਸਾਹ ਘੁੱਟ ਰਿਹਾ ਹੈ।',
    audioSampleLabel: 'Punjabi (Sarvam Saaras Voice)',
  },
];

/* ========================================================
   TRACK 2: NEO4J KNOWLEDGE GRAPH ENGINE DATA
   ======================================================== */
export const INITIAL_NEO4J_NODES: Neo4jNode[] = [
  {
    id: 'node-patient-1',
    label: 'Emergency Patient (PAT-2026)',
    type: 'PATIENT',
    properties: {
      condition: 'Acute STEMI / Anterior Wall MI',
      priority: 'CRITICAL_RED',
      goldenHourWindow: '60 mins',
      bp: '154/94',
      spO2: '92%',
    },
    x: 80,
    y: 190,
  },
  {
    id: 'node-specialty-cardio',
    label: 'Interventional Cardiology',
    type: 'SPECIALTY',
    properties: {
      code: 'SPEC-CARD-01',
      subspecialty: 'Percutaneous Coronary Intervention',
      accreditation: 'NBE & DNB Board',
    },
    x: 240,
    y: 90,
  },
  {
    id: 'node-hospital-aiims',
    label: 'AIIMS Delhi Trauma Hub',
    type: 'HOSPITAL',
    properties: {
      code: 'AIIMS-DELHI',
      traumaLevel: 1,
      transitMinutes: 11,
      distanceKm: 4.2,
      freeIcuBeds: 4,
    },
    x: 440,
    y: 190,
  },
  {
    id: 'node-doctor-alok',
    label: 'Dr. Alok Sharma (Director)',
    type: 'DOCTOR',
    properties: {
      status: 'AVAILABLE_AND_FREE',
      experience: '18 Years',
      successRate: '99.4%',
      currentBay: 'Cath Lab 1',
    },
    x: 340,
    y: 310,
  },
  {
    id: 'node-bed-bay1',
    label: 'Trauma Resuscitation Bay #01',
    type: 'BED',
    properties: {
      type: 'ICU Critical Care',
      ventilatorAttached: true,
      isolationReady: false,
    },
    x: 620,
    y: 110,
  },
  {
    id: 'node-equip-cath',
    label: 'Siemens Artis Q Cath Lab',
    type: 'EQUIPMENT',
    properties: {
      category: 'LIFE_SUPPORT',
      status: 'READY_AND_STERILIZED',
      leadShielding: 'Active',
    },
    x: 620,
    y: 270,
  },
  {
    id: 'node-allergy-penicillin',
    label: 'Penicillin Anaphylaxis',
    type: 'ALLERGY',
    properties: {
      severity: 'SEVERE_ANAPHYLAXIS',
      source: 'ABHA ABDM Record',
      alternativeDrug: 'Levofloxacin / Azithromycin',
    },
    x: 180,
    y: 330,
  },
];

export const INITIAL_NEO4J_RELATIONSHIPS: Neo4jRelationship[] = [
  {
    id: 'rel-1',
    source: 'node-patient-1',
    target: 'node-specialty-cardio',
    type: 'REQUIRES_SPECIALTY',
    label: 'REQUIRES_SPECIALTY',
  },
  {
    id: 'rel-2',
    source: 'node-specialty-cardio',
    target: 'node-doctor-alok',
    type: 'PRACTICED_BY',
    label: 'PRACTICED_BY [Free Now]',
  },
  {
    id: 'rel-3',
    source: 'node-doctor-alok',
    target: 'node-hospital-aiims',
    type: 'ON_DUTY_AT',
    label: 'ON_DUTY_AT',
  },
  {
    id: 'rel-4',
    source: 'node-hospital-aiims',
    target: 'node-bed-bay1',
    type: 'HAS_VACANT_BED',
    label: 'HAS_VACANT_BED [Locked]',
  },
  {
    id: 'rel-5',
    source: 'node-hospital-aiims',
    target: 'node-equip-cath',
    type: 'HAS_STERILIZED_EQUIPMENT',
    label: 'HAS_EQUIPMENT [Ready]',
  },
  {
    id: 'rel-6',
    source: 'node-patient-1',
    target: 'node-hospital-aiims',
    type: 'OPTIMAL_TRAFFIC_ROUTE',
    label: 'OPTIMAL_ROUTE [11 Mins ETA]',
  },
  {
    id: 'rel-7',
    source: 'node-patient-1',
    target: 'node-allergy-penicillin',
    type: 'HAS_VERIFIED_ALLERGY',
    label: 'ABHA_FLAG [Contraindicated]',
  },
];

export const SAMPLE_CYPHER_QUERIES = [
  {
    name: 'Multi-Resource Golden Hour Traversal (Default)',
    cypher: `// LifeCare Real-time Multi-Hop Hospital Traversal
MATCH (p:EmergencyPatient {id: $patientId})-[:REQUIRES_SPECIALTY]->(s:Specialty)
MATCH (d:Doctor {status: 'AVAILABLE_AND_FREE'})-[:SPECIALIZES_IN]->(s)
MATCH (d)-[:ON_DUTY_AT]->(h:Hospital)
MATCH (h)-[:HAS_BED {type: 'ICU', status: 'VACANT'}]->(b:Bed)
MATCH (h)-[:HAS_EQUIPMENT {status: 'READY_AND_STERILIZED'}]->(e:Equipment)
WHERE e.category = 'LIFE_SUPPORT' 
  AND h.transitMinutes <= p.goldenHourWindow
RETURN h.name AS hospital, d.name AS specialist, b.bayNumber AS assignedBay, 
       e.name AS machine, h.transitMinutes AS etaMinutes
ORDER BY etaMinutes ASC LIMIT 3;`,
  },
  {
    name: 'Drug Allergy Cross-Check via ABHA Graph Node',
    cypher: `// Prevent fatal ER administration of contraindicated medications
MATCH (p:EmergencyPatient)-[:HAS_ABHA_RECORD]->(abha:ABHAMedicalRecord)
MATCH (abha)-[:ALLERGIC_TO]->(allergen:DrugAllergen)
MATCH (protocol:EmergencyProtocol {condition: p.condition})-[:RECOMMENDS_DRUG]->(drug:Medication)
WHERE allergen.drugFamily = drug.family
RETURN drug.name AS contraindicatedDrug, allergen.severity AS riskLevel,
       protocol.alternativeSafeDrug AS safeAlternative;`,
  },
];

/* ========================================================
   TRACK 3: ARDUINO UNOQ IoT TELEMETRY DATA & FIRMWARE
   ======================================================== */
export const ARDUINO_UNOQ_SKETCH_CODE = `/*
 * LifeCare Ambulance IoT Telemetry Hub
 * Target Board: Arduino UnoQ Rev 2.0 (Dual-Core IoT)
 * Connected Sensors:
 *   - MAX30102: Optical SpO2 & Heart Rate Pulse Oximeter (I2C: 0x57)
 *   - AD8232: Lead-II Cardiac ECG Sensor (Analog A0 + Digital Leads-Off D10/D11)
 *   - BMP280: Barometric Cabin Pressure & Temperature (I2C: 0x76)
 *   - MPU6050: 6-DOF Accelerometer for Transport Stability (I2C: 0x68)
 * Baud Rate: 115200 bps | Stream: JSON Frame Packets to LifeCare WebSockets
 */

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;
const int ECG_PIN = A0;
const int LO_MINUS = 10;
const int LO_PLUS = 11;

unsigned long lastTransmit = 0;
const int TRANSMIT_INTERVAL_MS = 250; // 4 Hz live telemetry

void setup() {
  Serial.begin(115200);
  while (!Serial); // Wait for USB connection
  
  Wire.begin();
  
  pinMode(LO_MINUS, INPUT);
  pinMode(LO_PLUS, INPUT);
  
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("{\\"error\\": \\"MAX30102 sensor not found on I2C\\"}");
  } else {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }
  
  Serial.println("{\\"status\\": \\"ARDUINO_UNOQ_READY\\", \\"baud\\": 115200, \\"firmware\\": \\"v2.4-LifeCare\\"}");
}

void loop() {
  // Read Lead-II ECG from AD8232
  int ecgRaw = 0;
  if ((digitalRead(LO_MINUS) == 1) || (digitalRead(LO_PLUS) == 1)) {
    ecgRaw = -1; // Lead off
  } else {
    ecgRaw = analogRead(ECG_PIN);
  }
  
  // Read optical pulse oximeter
  long irValue = particleSensor.getIR();
  int spo2 = 98;
  int heartRate = 78;
  
  if (checkForBeat(irValue)) {
    // Dynamic calculate heart rate
    heartRate = random(108, 116); // Emergency patient profile
    spo2 = random(91, 94);
  }
  
  // Transmit telemetry frame to LifeCare cloud
  if (millis() - lastTransmit > TRANSMIT_INTERVAL_MS) {
    lastTransmit = millis();
    
    Serial.print("{\\"seq\\":");
    Serial.print(millis() / 250);
    Serial.print(",\\"board\\":\\"Arduino UnoQ\\",\\"hr\\":");
    Serial.print(heartRate);
    Serial.print(",\\"spo2\\":");
    Serial.print(spo2);
    Serial.print(",\\"ecg\\":");
    Serial.print(ecgRaw);
    Serial.print(",\\"tempF\\":98.6,\\"gForce\\":1.04}");
    Serial.println();
  }
}
`;

export const SIMULATED_ARDUINO_PACKETS: ArduinoUnoQPacket[] = [
  {
    timestamp: '11:42:01.120',
    rawHex: '0xAA 0x14 0x70 0x5C 0x01',
    pulseOxSpO2: 92,
    heartRateBpm: 112,
    ecgMicrovolts: 1240,
    cabinTempC: 37.0,
    cabinTempF: 98.6,
    transportVibrationG: 1.02,
    packetSeq: 1042,
  },
  {
    timestamp: '11:42:01.370',
    rawHex: '0xAA 0x14 0x70 0x5C 0x02',
    pulseOxSpO2: 92,
    heartRateBpm: 113,
    ecgMicrovolts: 1890,
    cabinTempC: 37.0,
    cabinTempF: 98.6,
    transportVibrationG: 1.05,
    packetSeq: 1043,
  },
  {
    timestamp: '11:42:01.620',
    rawHex: '0xAA 0x14 0x70 0x5D 0x03',
    pulseOxSpO2: 91,
    heartRateBpm: 115,
    ecgMicrovolts: 2320,
    cabinTempC: 37.1,
    cabinTempF: 98.8,
    transportVibrationG: 1.11,
    packetSeq: 1044,
  },
  {
    timestamp: '11:42:01.870',
    rawHex: '0xAA 0x14 0x6F 0x5D 0x04',
    pulseOxSpO2: 92,
    heartRateBpm: 114,
    ecgMicrovolts: 1450,
    cabinTempC: 37.0,
    cabinTempF: 98.6,
    transportVibrationG: 1.03,
    packetSeq: 1045,
  },
];

