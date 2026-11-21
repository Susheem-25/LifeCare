/**
 * LifeCare Voice-to-Structured-Registration Parser
 * Extracts clinical registration fields from natural spoken transcripts (Hindi & English)
 * and packs/unpacks compact QR codes for instantaneous hospital reception intake.
 */

import type { PatientVoiceRegistration, CompactRegistrationQRPacket } from '../types';
import { sanitizeText, sanitizeIdentifier } from './security';

/**
 * Parses spoken ambulance/bystander transcript into structured registration fields
 */
export function parseSpokenRegistration(
  transcript: string,
  existing?: Partial<PatientVoiceRegistration>
): PatientVoiceRegistration {
  const clean = sanitizeText(transcript || '').trim();
  const lower = clean.toLowerCase();

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const patientId = existing?.patientId || `LC-${randomNum}`;

  // 1. Full Name extraction
  let fullName = existing?.fullName || '';
  if (!fullName) {
    const nameMatch =
      clean.match(/(?:patient(?:\s+name)?(?:\s+is)?|name\s+is|मरीज\s+का\s+नाम|नाम\s+है|patient:?)\s*([A-Za-z\u0900-\u097F\s]{2,28}?)(?=\s*(?:,|\.|age|उम्र|years|old|gender|male|female|blood|having|with|severe|complaining|\d|$))/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      fullName = nameMatch[1].trim();
    } else {
      // Fallback: check first 2-3 capitalized words or sample default
      const firstWords = clean.split(/[.,\n]/)[0]?.trim();
      if (firstWords && !/\b(emergency|patient|ambulance|sos|pain|severe|chest)\b/i.test(firstWords) && firstWords.length < 30) {
        fullName = firstWords;
      }
    }
  }

  // 2. Age extraction
  let age = existing?.age || '';
  if (!age) {
    const ageMatch = lower.match(/(?:age(?:\s+is)?|उम्र|साल|वर्ष)\s*(\d{1,3})|\b(\d{1,3})\s*(?:years?\s*old|y\/o|yr|साल|वर्ष)\b/i);
    if (ageMatch) {
      age = ageMatch[1] || ageMatch[2] || '';
    }
  }

  // 3. Gender extraction
  let gender: 'MALE' | 'FEMALE' | 'OTHER' = existing?.gender || 'MALE';
  if (/\b(female|woman|lady|girl|महिला|स्त्री|औरत)\b/i.test(lower)) {
    gender = 'FEMALE';
  } else if (/\b(other|transgender|अन्य)\b/i.test(lower)) {
    gender = 'OTHER';
  } else if (/\b(male|man|boy|gentleman|पुरुष|आदमी)\b/i.test(lower)) {
    gender = 'MALE';
  }

  // 4. Blood Group extraction
  let bloodGroup = existing?.bloodGroup || 'B+ (Positive)';
  const bloodMatch = lower.match(/\b(a|b|ab|o)\s*(\+|-|positive|negative|pos|neg)?\s*(?:positive|negative|blood|रक्त|ग्रुप)?\b/i);
  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const sign = bloodMatch[2] ? (bloodMatch[2].includes('-') || bloodMatch[2].includes('neg') ? '-' : '+') : '+';
    bloodGroup = `${type}${sign} (${sign === '+' ? 'Positive' : 'Negative'})`;
  }

  // 5. Chief Complaint extraction
  let chiefComplaint = existing?.chiefComplaint || '';
  const complaintMatch = clean.match(/(?:chief\s+complaint|complaint|suffering\s+from|symptoms?|having|शिकायत|तकलीफ|समस्या|problem)\s*(?:is|of|with)?\s*([^.\n,;]{4,100})/i);
  if (complaintMatch && complaintMatch[1]?.trim()) {
    chiefComplaint = complaintMatch[1].trim();
  } else if (!chiefComplaint) {
    // Look for clinical symptom keywords
    if (/chest\s*pain|heart\s*attack|stemi|angina/i.test(lower)) {
      chiefComplaint = 'Acute severe chest pain radiating to left arm (Suspected STEMI)';
    } else if (/breath|dyspnea|asthma|wheezing|सांस/i.test(lower)) {
      chiefComplaint = 'Acute respiratory distress / Shortness of breath';
    } else if (/accident|trauma|fracture|bleeding|चोट|दुर्घटना/i.test(lower)) {
      chiefComplaint = 'Road traffic accident / Blunt polytrauma & bleeding';
    } else if (/unconscious|fainted|coma|बेहोश/i.test(lower)) {
      chiefComplaint = 'Loss of consciousness / Syncope attack';
    } else if (/stroke|paralysis|slurred\s*speech|लकवा/i.test(lower)) {
      chiefComplaint = 'Acute stroke symptoms / Hemiparesis';
    } else {
      chiefComplaint = clean.slice(0, 80) || 'Acute emergency requiring immediate ER resuscitation';
    }
  }

  // 6. Allergies extraction
  let allergies = existing?.allergies || '';
  const allergyMatch = clean.match(/(?:allerg(?:y|ies|ic)|एलर्जी)\s*(?:to|is|are)?\s*([^.\n,;]{2,60})/i);
  if (allergyMatch && allergyMatch[1]?.trim()) {
    allergies = allergyMatch[1].trim();
  } else if (!allergies) {
    if (/penicillin/i.test(lower)) allergies = 'Penicillin (Severe anaphylaxis risk)';
    else if (/sulfa/i.test(lower)) allergies = 'Sulfa Drugs';
    else if (/nsaid|ibuprofen/i.test(lower)) allergies = 'NSAIDs / Ibuprofen';
    else if (/no\s*allerg/i.test(lower)) allergies = 'No known drug allergies (NKDA)';
    else allergies = 'None reported';
  }

  // 7. Current Medications extraction
  let currentMedications = existing?.currentMedications || '';
  const medMatch = clean.match(/(?:taking|medications?|medicines?|drugs?|दवा|दवाइयां)\s*(?:is|are)?\s*([^.\n;]{3,80})/i);
  if (medMatch && medMatch[1]?.trim()) {
    currentMedications = medMatch[1].trim();
  } else if (!currentMedications) {
    if (/aspirin|atorvastatin|statin/i.test(lower)) {
      currentMedications = 'Aspirin 75mg, Atorvastatin 40mg';
    } else if (/inhaler|budesonide/i.test(lower)) {
      currentMedications = 'Budesonide + Formoterol Inhaler';
    } else if (/insulin|metformin/i.test(lower)) {
      currentMedications = 'Metformin 500mg, Glimepiride 1mg';
    } else {
      currentMedications = 'None currently';
    }
  }

  // 8. Past Medical History extraction
  let medicalHistory = existing?.medicalHistory || '';
  const historyMatch = clean.match(/(?:history\s+of|past\s+medical\s+history|medical\s+history|पुरानी\s+बीमारी|history)\s*(?:is|of)?\s*([^.\n;]{3,80})/i);
  if (historyMatch && historyMatch[1]?.trim()) {
    medicalHistory = historyMatch[1].trim();
  } else if (!medicalHistory) {
    if (/diabetes|hypertension|stent|angioplasty|heart\s*disease/i.test(lower)) {
      medicalHistory = 'Type 2 Diabetes, Hypertension, Prior PTCA Stent (2021)';
    } else if (/asthma|copd/i.test(lower)) {
      medicalHistory = 'Bronchial Asthma (Moderate persistent)';
    } else if (/kidney|renal/i.test(lower)) {
      medicalHistory = 'Chronic Kidney Disease (Stage 2)';
    } else {
      medicalHistory = 'No prior chronic conditions recorded';
    }
  }

  // 9. Guardian Phone Number extraction
  let guardianPhone = existing?.guardianPhone || '';
  const phoneMatch = clean.match(/(?:phone|mobile|contact|फोन|नंबर)\s*(?:number|is|:)?\s*(\+?91[-\s]?)?([6-9]\d{9})/i) ||
                     clean.match(/\b([6-9]\d{9})\b/);
  if (phoneMatch) {
    guardianPhone = phoneMatch[2] ? `+91-${phoneMatch[2]}` : `+91-${phoneMatch[1]}`;
  } else if (!guardianPhone) {
    guardianPhone = '+91-98104-55678';
  }

  // 10. Optional ABHA ID extraction
  let optionalAbhaId = existing?.optionalAbhaId || '';
  const abhaMatch = clean.match(/\b(\d{2}-\d{4}-\d{4}-\d{4})\b/);
  if (abhaMatch) {
    optionalAbhaId = abhaMatch[1];
  }

  return {
    patientId,
    fullName: fullName || 'Emergency Patient',
    age: age || '52',
    gender,
    bloodGroup,
    chiefComplaint,
    allergies,
    currentMedications,
    medicalHistory,
    guardianPhone,
    optionalAbhaId: optionalAbhaId || undefined,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Packs structured registration into a compact, low-density QR payload
 */
export function packRegistrationToQR(data: PatientVoiceRegistration): string {
  const packet: CompactRegistrationQRPacket = {
    t: 'LC_REG_V1',
    pid: data.patientId,
    fn: data.fullName,
    age: data.age,
    gen: data.gender,
    bg: data.bloodGroup,
    cc: data.chiefComplaint,
    alg: data.allergies,
    med: data.currentMedications,
    mh: data.medicalHistory,
    gp: data.guardianPhone,
    abha: data.optionalAbhaId,
    ts: Date.now(),
  };

  return JSON.stringify(packet);
}

/**
 * Unpacks and validates QR payload (supports both compact and full formats)
 */
export function unpackRegistrationFromQR(raw: string): PatientVoiceRegistration | null {
  if (!raw || typeof raw !== 'string') return null;

  try {
    const parsed = JSON.parse(raw.trim());

    // Format 1: Compact QR packet
    if (parsed.t === 'LC_REG_V1' || parsed.pid) {
      return {
        patientId: sanitizeIdentifier(parsed.pid || `LC-${Math.floor(1000 + Math.random() * 9000)}`),
        fullName: sanitizeText(parsed.fn || 'Emergency Patient'),
        age: sanitizeText(String(parsed.age || '45')),
        gender: parsed.gen === 'FEMALE' ? 'FEMALE' : parsed.gen === 'OTHER' ? 'OTHER' : 'MALE',
        bloodGroup: sanitizeText(parsed.bg || 'B+ (Positive)'),
        chiefComplaint: sanitizeText(parsed.cc || 'Acute Emergency Resuscitation'),
        allergies: sanitizeText(parsed.alg || 'None reported'),
        currentMedications: sanitizeText(parsed.med || 'None'),
        medicalHistory: sanitizeText(parsed.mh || 'None reported'),
        guardianPhone: sanitizeText(parsed.gp || '+91-98104-55678'),
        optionalAbhaId: parsed.abha ? sanitizeIdentifier(parsed.abha) : undefined,
        createdAt: new Date().toISOString(),
      };
    }

    // Format 2: Direct full object format
    if (parsed.fullName || parsed.patientId) {
      return {
        patientId: sanitizeIdentifier(parsed.patientId || `LC-${Math.floor(1000 + Math.random() * 9000)}`),
        fullName: sanitizeText(parsed.fullName || 'Emergency Patient'),
        age: sanitizeText(String(parsed.age || '45')),
        gender: parsed.gender === 'FEMALE' ? 'FEMALE' : parsed.gender === 'OTHER' ? 'OTHER' : 'MALE',
        bloodGroup: sanitizeText(parsed.bloodGroup || 'B+ (Positive)'),
        chiefComplaint: sanitizeText(parsed.chiefComplaint || 'Acute Emergency Resuscitation'),
        allergies: sanitizeText(parsed.allergies || 'None reported'),
        currentMedications: sanitizeText(parsed.currentMedications || 'None'),
        medicalHistory: sanitizeText(parsed.medicalHistory || 'None reported'),
        guardianPhone: sanitizeText(parsed.guardianPhone || '+91-98104-55678'),
        optionalAbhaId: parsed.optionalAbhaId ? sanitizeIdentifier(parsed.optionalAbhaId) : undefined,
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.warn('[QR Unpack] Error decoding JSON:', err);
    return null;
  }
}
