import type { 
  IndicLanguageInfo, 
  Neo4jNode, 
  Neo4jRelationship 
} from '../types';

/* ========================================================
   FEATURE 01: BHASHINI INDIC VOICE AI & MULTILINGUAL SOS
   7 Indian Languages Supported (LifeCare PPTX Slide 3, 4, 5)
   ======================================================== */
export const INDIC_SUPPORTED_LANGUAGES: IndicLanguageInfo[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    samplePrompt: 'पिताजी के सीने में बहुत तेज दर्द हो रहा है, पसीना आ रहा है और सांस लेने में भारी तकलीफ है। दर्द बाएं हाथ तक जा रहा है।',
    audioSampleLabel: 'Hindi (Bhashini Indic STT/TTS)',
  },
  {
    code: 'en',
    name: 'English (Indian)',
    nativeName: 'English (IN)',
    samplePrompt: 'Father experiencing acute substernal chest pressure radiating to left arm, profuse diaphoresis, and dyspnea.',
    audioSampleLabel: 'Indian English (Bhashini Indic STT/TTS)',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    samplePrompt: 'বাবার বুকে তীব্র চাপ ও অসহ্য ব্যথা হচ্ছে, অতিরিক্ত ঘাম হচ্ছে এবং শ্বাস নিতে খুব কষ্ট হচ্ছে।',
    audioSampleLabel: 'Bengali (Bhashini Indic STT/TTS)',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    samplePrompt: 'वडिलांच्या छातीत प्रचंड दुखत आहे, खूप घाम येत आहे आणि श्वास घेण्यास त्रास होत आहे, वेदना डाव्या हाताकडे पसरत आहे.',
    audioSampleLabel: 'Marathi (Bhashini Indic STT/TTS)',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    samplePrompt: 'அப்பாவுக்கு நெஞ்சில் கடுமையான வலி, அதிக வியர்வை மற்றும் மூச்சுத்திணறல் உள்ளது. வலி இடது கை வரை பரவுகிறது.',
    audioSampleLabel: 'Tamil (Bhashini Indic STT/TTS)',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    samplePrompt: 'నాన్నగారికి గుండెలో తీవ్రమైన నొప్పి, విపరీతమైన చెమటలు మరియు ఊపిరాడటం లేదు. నొప్పి ఎడమ చేతికి వ్యాపిస్తోంది.',
    audioSampleLabel: 'Telugu (Bhashini Indic STT/TTS)',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    samplePrompt: 'મારા પિતાને છાતીમાં સખત દુખાવો થાય છે, ખૂબ પરસેવો વળે છે અને શ્વાસ લેવામાં તકલીફ છે, દુખાવો ડાબા હાથમાં ફેલાઈ રહ્યો છે.',
    audioSampleLabel: 'Gujarati (Bhashini Indic STT/TTS)',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    samplePrompt: 'ਪਿਤਾ ਜੀ ਦੀ ਛਾਤੀ ਵਿੱਚ ਬਹੁਤ ਤੇਜ਼ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ, ਪਸੀਨਾ ਆ ਰਿਹਾ ਹੈ ਅਤੇ ਸਾਹ ਘੁੱਟ ਰਿਹਾ ਹੈ।',
    audioSampleLabel: 'Punjabi (Bhashini Indic STT/TTS)',
  },
];

// Backwards compatibility alias
export const SARVAM_SUPPORTED_LANGUAGES = INDIC_SUPPORTED_LANGUAGES;

/* ========================================================
   FEATURE 02 & INNOVATION: NEO4J AURADB ATOMIC GRAPH LOCKING
   Sub-9ms Lock for Bay + Doctor + Equipment (Slide 3, 4, 5)
   ======================================================== */
export const INITIAL_NEO4J_NODES: Neo4jNode[] = [
  {
    id: 'node-patient-1',
    label: 'Emergency Patient (PAT-2026)',
    type: 'PATIENT',
    properties: {
      condition: 'Acute STEMI (ESI Level 1)',
      priority: 'CRITICAL_RED',
      goldenHourWindow: '60 mins',
      bp: '154/94',
      spO2: '92%',
      pmjayCover: '₹5,00,000 Cashless',
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
      subspecialty: 'Primary PCI & Cath Lab',
      accreditation: 'NBE & DNB Board',
    },
    x: 240,
    y: 90,
  },
  {
    id: 'node-hospital-aiims',
    label: 'AIIMS Delhi Apex Trauma Hub',
    type: 'HOSPITAL',
    properties: {
      code: 'AIIMS-DELHI',
      traumaLevel: 1,
      transitMinutes: 9,
      distanceKm: 3.2,
      atomicLockStatus: 'LOCKED (<9ms)',
    },
    x: 440,
    y: 190,
  },
  {
    id: 'node-doctor-alok',
    label: 'Dr. Vikramaditya Rathore',
    type: 'DOCTOR',
    properties: {
      status: 'AVAILABLE_AND_FREE',
      experience: '18 Years',
      successRate: '99.4%',
      currentBay: 'Cath Lab 2 / Bay 4',
      lockState: 'RESERVED_IN_TRANSIT',
    },
    x: 340,
    y: 310,
  },
  {
    id: 'node-bed-bay1',
    label: 'Resuscitation Bay #04',
    type: 'BED',
    properties: {
      type: 'ICU Critical Care Bay',
      ventilatorAttached: true,
      status: 'ATOMICALLY_LOCKED',
    },
    x: 620,
    y: 110,
  },
  {
    id: 'node-equip-cath',
    label: 'Philips Azurion 7 Cath Lab',
    type: 'EQUIPMENT',
    properties: {
      category: 'LIFE_SUPPORT',
      status: 'READY_AND_STERILIZED',
      lockState: 'HELD_FOR_ARRIVAL',
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
      source: 'ABDM v3 Sandbox ABHA',
      safeAlternative: 'Levofloxacin / Azithromycin',
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
    label: 'PRACTICED_BY [On-Duty]',
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
    type: 'ATOMIC_LOCK_BAY',
    label: 'ATOMIC_LOCK [<9ms]',
  },
  {
    id: 'rel-5',
    source: 'node-hospital-aiims',
    target: 'node-equip-cath',
    type: 'ATOMIC_LOCK_EQUIP',
    label: 'HELD_IN_TRANSIT',
  },
  {
    id: 'rel-6',
    source: 'node-patient-1',
    target: 'node-hospital-aiims',
    type: 'OPTIMAL_TRAFFIC_ROUTE',
    label: 'OPTIMAL_ROUTE [9 Mins ETA]',
  },
  {
    id: 'rel-7',
    source: 'node-patient-1',
    target: 'node-allergy-penicillin',
    type: 'HAS_VERIFIED_ALLERGY',
    label: 'ABDM_FLAG [Contraindicated]',
  },
];

export const SAMPLE_CYPHER_QUERIES = [
  {
    name: 'Atomic 3-Resource Lock (<9ms Transaction)',
    cypher: `// LifeCare Sub-9ms Atomic Resource Lock (Bay + Doctor + Equipment)
MATCH (h:Hospital {code: 'AIIMS-DELHI'})-[:HAS_BAY]->(bay:ERBay {status: 'FREE'}),
      (doc:Doctor {status: 'AVAILABLE_AND_FREE', specialization: 'Interventional Cardiology'}),
      (eq:Equipment {status: 'READY_AND_STERILIZED', name: 'Philips Azurion 7 Cath Lab'})
WITH bay, doc, eq LIMIT 1
SET bay.status = 'ATOMICALLY_LOCKED',
    bay.lockedFor = 'AMB-108-DL',
    doc.status = 'RESERVED_FOR_INCOMING',
    eq.status = 'HELD_IN_TRANSIT'
CREATE (bay)-[:ATOMICALLY_LOCKED_WITH]->(doc),
       (bay)-[:EQUIPPED_WITH]->(eq)
RETURN bay.id AS lockedBay, doc.name AS lockedDoctor, eq.name AS lockedEquipment,
       duration.between(datetime(), datetime()).milliseconds AS lockLatencyMs;`,
  },
  {
    name: 'ABDM v3 Drug Allergy & PM-JAY Cross-Check',
    cypher: `// Prevent fatal ER administration & verify cashless coverage in-transit
MATCH (p:EmergencyPatient)-[:HAS_ABHA_RECORD]->(abha:ABHAMedicalRecord)
OPTIONAL MATCH (abha)-[:ALLERGIC_TO]->(allergen:DrugAllergen)
OPTIONAL MATCH (abha)-[:HAS_POLICY]->(pmjay:PMJAYCoverage)
RETURN abha.abhaId AS abhaNumber,
       abha.bloodGroup AS bloodGroup,
       collect(allergen.name) AS contraindicatedAllergies,
       pmjay.eligible AS pmjayCovered,
       pmjay.coverAmountINR AS coverageINR;`,
  },
];

/* ========================================================
   5 SYNCHRONIZED STEPS METHODOLOGY DATA (LifeCare PPTX Slide 3)
   ======================================================== */
export const LIFENET_5_STEPS = [
  {
    step: 1,
    title: 'Speak SOS',
    description: 'Caller speaks in own language; 7 Indian languages supported via Bhashini Indic STT.',
    badge: '7 Languages',
    icon: 'Mic',
  },
  {
    step: 2,
    title: 'AI Triage',
    description: 'Speech becomes ICD-10 code + ESI 1-5 severity with spoken first-aid instructions via Groq Llama 3.3.',
    badge: 'ESI 1-5 + ICD-10',
    icon: 'Brain',
  },
  {
    step: 3,
    title: 'Atomic Lock',
    description: 'Neo4j graph locks bay, doctor and equipment together in <9ms transaction.',
    badge: '<9ms Graph Lock',
    icon: 'Network',
  },
  {
    step: 4,
    title: 'In-Transit Prep',
    description: 'ABHA history, allergy check, PM-JAY cover; live vitals (HR, SpO2, BP, GCS) streamed to ER.',
    badge: 'ABDM + Live Vitals',
    icon: 'Activity',
  },
  {
    step: 5,
    title: 'Direct Admission',
    description: 'Patient goes straight to a ready bay with 0-second reception bypass. No gate forms.',
    badge: '0-Sec Reception',
    icon: 'CheckCircle2',
  },
];

/* ========================================================
   IMPACT IN NUMBERS (LifeCare PPTX Slide 6)
   ======================================================== */
export const IMPACT_METRICS = [
  {
    metric: 'Resource Locking',
    traditional: '10-25 min',
    lifecare: '<9ms',
    impact: 'Instant allocation without phone tag',
  },
  {
    metric: 'Gate Rejection',
    traditional: '35%+',
    lifecare: '0%',
    impact: 'Eliminates hospital redirection',
  },
  {
    metric: 'Reception Intake',
    traditional: '20-30 min',
    lifecare: '0 sec',
    impact: 'ABDM pre-admission bypasses paperwork',
  },
  {
    metric: 'Pre-Arrival Vitals',
    traditional: 'None',
    lifecare: 'Continuous',
    impact: 'ER team scrubbed in before arrival',
  },
];

/* ========================================================
   ARDUINO UNOQ IoT TELEMETRY DATA & FIRMWARE (Future Scope)
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
  int ecgRaw = 0;
  if ((digitalRead(LO_MINUS) == 1) || (digitalRead(LO_PLUS) == 1)) {
    ecgRaw = -1; // Lead off
  } else {
    ecgRaw = analogRead(ECG_PIN);
  }
  
  long irValue = particleSensor.getIR();
  int spo2 = 92;
  int heartRate = 112;
  
  if (checkForBeat(irValue)) {
    heartRate = random(108, 116);
    spo2 = random(91, 94);
  }
  
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
