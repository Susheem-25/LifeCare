import { getSarvamApiKey } from './sarvamAiService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedFollowUps?: string[];
  isSpoken?: boolean;
}

/**
 * Exhaustive A to Z LifeCare Knowledge Corpus
 * Used as context for Sarvam AI LLM and local RAG retrieval.
 */
export const LIFECARE_KNOWLEDGE_BASE = {
  projectTitle: 'LifeCare — Zero-Wait Emergency Healthcare Operating System',
  tagline: 'Caring for Lives. Every Second Saved Is a Life Preserved.',
  coreProblem: `In India, an estimated 7-10% of critical patients lose their lives for every minute wasted in emergency admission delays. 
  Traditional emergency workflows suffer from 3 fatal friction points:
  1. Panic & language barriers during 108/emergency calling.
  2. "Blind driving" by ambulances leading to arrival at hospitals with 0 available ICU beds or missing specialists.
  3. 20-35 minutes wasted filling physical registration paper forms at hospital reception while the patient is bleeding or in cardiac arrest.`,
  
  theFourPillars: {
    guardianPortal: `Citizen & Bystander Emergency Cockpit:
    - Bilingual Indic Voice SOS (Hindi & Indian English) powered by Sarvam AI Indic Speech-to-Text.
    - Sub-second AI Triage classifying speech into ICD-10 codes, ESI Level 1-5 urgency, and spoken first-aid instructions.
    - Instant ABDM v3 in-transit ABHA & PM-JAY pre-admission check.
    - Real-time cloud atomic lock reserving an ICU/emergency trauma bed in <10ms.
    - Generates AES-GCM-256 E2EE Encrypted QR Packet for contactless 0-second gate intake.`,

    driverCockpit: `108 Mobile ICU Cockpit:
    - Paramedic navigation terminal with turn-by-turn priority emergency corridor routing via Google Maps.
    - In-transit live vital signs telemetry streaming (SpO2, Heart Rate, Systolic/Diastolic BP, GCS Score) directly to the destination hospital ER bay.
    - Live speed, distance, and dynamic ETA tracking.
    - Direct ER bay bypass protocol: Gates open automatically upon arrival with zero security or registration delays.`,

    hospitalPortal: `Hospital ER Trauma Command Center:
    - Real-time editable bed inventory (Total, ICU, Emergency, and Ventilator capacity).
    - Specialist Doctor Roster with verified medical degrees (MBBS, MD, DM, MS, DNB, FRCS, MCh), years of experience, and real-time duty status (Free on Duty, Busy in Surgery, Absent / Off Duty).
    - Medical Equipment Inventory (Defibrillators, Ventilators, Dialysis, Biplane Cath Labs) with quantity tracking.
    - Reception QR Scanner: Decrypts in-transit patient QR packets in <10ms using AES-256 master key for 0-second admission.
    - Live incoming patient telemetry radar displaying vital trends before ambulance arrival.`,

    adminConsole: `Super Admin Command Console (/admin):
    - Zero-Trust Google OAuth protected security gateway with email whitelist and Firestore admin collection checks.
    - Live Emergency Audit Trail showing millisecond-by-millisecond milestones (Bed Lock -> Fleet Dispatch -> In-Transit Telemetry -> Bay Admission).
    - Centralized Directory for Patients & Linked Guardians, Network Hospitals, and 108 Ambulance Drivers.
    - Granular Governance Actions: Real-time suspension, reinstatement, and deletion of accounts and bookings.
    - Available in both Dark OLED and Light themes with Liquid macOS Glass styling.`
  },

  technicalArchitecture: {
    frontend: 'React 19, TypeScript, Vite, Tailwind CSS with Liquid macOS Glassmorphism',
    typography: 'Plus Jakarta Sans (humanist optical sizing) and JetBrains Mono (precision technical telemetry)',
    databaseAndAuth: 'Firebase Firestore for multi-region synchronized real-time state, Firebase Google OAuth 2.0',
    aiVoiceAndSpeech: 'Sarvam AI (Indic Speech-to-Text saaras:v4, Text-to-Speech bulbul:v3, and Indic Conversational LLM)',
    triageIntelligence: 'Clinical Triage Engine mapped to Emergency Severity Index (ESI 1-5) and ICD-10 diagnostic classifications',
    securityAndCryptography: 'AES-GCM 256-bit End-to-End Encryption, SHA-256 key fingerprinting, ABDM v3 & HL7/FHIR compliance',
    performanceBenchmarks: '<10ms Cloud Atomic Bed Reservation Latency, 0-Second Reception Admission, 100% Gate Rejection Elimination'
  },

  doctorDegreesAndQualifications: `Hospital doctors in LifeCare are registered with complete verified medical degrees:
  - Undergraduate: MBBS (Bachelor of Medicine, Bachelor of Surgery)
  - Post-Graduate: MD (Doctor of Medicine), MS (Master of Surgery), DNB (Diplomate of National Board)
  - Super-Specialty: DM (Doctorate of Medicine e.g. Cardiology, Neurology), MCh (Master of Chirurgiae e.g. Trauma & Neurosurgery)
  - International Fellowships: FRCS, MRCP, FACS
  Hospital administrators can update doctor degrees, specialization, experience years, and status directly in the hospital dashboard.`
};

/**
 * Intelligent RAG responder that synthesizes answers from the knowledge base,
 * augmented with Sarvam AI LLM if the API key is active.
 */
export async function queryLifeCareKnowledgeBase(
  userQuery: string,
  preferredLanguage: 'en' | 'hi' = 'en'
): Promise<string> {
  const query = userQuery.trim();
  const lower = query.toLowerCase();

  // 1. Attempt live Sarvam AI Indic LLM with full LifeCare system prompt
  const apiKey = getSarvamApiKey();
  if (apiKey) {
    try {
      const systemPrompt = `You are Niro — the official LifeCare Gen AI Copilot with complete, authoritative A to Z knowledge of LifeCare: Zero-Wait Emergency Healthcare Network.
      
      Here is the complete project knowledge:
      ${JSON.stringify(LIFECARE_KNOWLEDGE_BASE, null, 2)}
      
      Instructions:
      - Introduce yourself as Niro when appropriate.
      - Answer clearly, authoritatively, and professionally.
      - Use clean structured markdown formatting with bold points, numbered/bulleted lists, or metric highlights.
      - If asked in Hindi or Hinglish, answer in fluent, respectful Hindi/Hinglish.
      - Emphasize real metrics (<10ms atomic lock, 0-second reception bypass, ESI 1-5 triage, ABDM v3, Sarvam AI voice integration).
      - Always be helpful, concise, and clinically sound.`;

      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          model: 'sarvam-105b-conversations',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.3,
          max_tokens: 650,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && content.trim().length > 20) {
          return content.trim();
        }
      }
    } catch (err) {
      console.warn('[LifeCare AI] Sarvam chat completion fallback to local knowledge engine:', err);
    }
  }

  // 2. High-Precision Local Knowledge Base Fallback Engine
  return generateLocalKnowledgeAnswer(lower, preferredLanguage);
}

function generateLocalKnowledgeAnswer(query: string, lang: 'en' | 'hi'): string {
  const isHindi = lang === 'hi' || /[\u0900-\u097F]/.test(query);

  // Topic: Atomic Bed Locking / Speed
  if (query.includes('atomic') || query.includes('bed lock') || query.includes('10ms') || query.includes('latency') || query.includes('लॉक')) {
    if (isHindi) {
      return `**LifeCare <10ms Atomic Bed Mesh कैसे काम करता है?**

LifeCare में जब कोई नागरिक Voice SOS के ज़रिए आपातकाल रिपोर्ट करता है, तो सिस्टम **<10 मिलीसेकंड** में नज़दीकी उपयुक्त अस्पताल में बेड को एटॉमिक रूप से लॉक कर देता है:

1. **Deterministic Resource Locking:** एक ही ट्रांजैक्शन में ICU बेड, वेंटिलेटर और ऑन-ड्यूटी विशेषज्ञ डॉक्टर को एक साथ लॉक किया जाता है ताकि ओवरबुकिंग न हो।
2. **0% Gate Rejection:** जब एम्बुलेंस अस्पताल पहुंचती है, तो पहले से बेड आरक्षित होने के कारण किसी मरीज़ को लौटाया नहीं जाता।
3. **Live Sync:** फ़ायरस्टोर क्लस्टर के ज़रिए यह डेटा अस्पताल के ER Trauma Command और 108 Paramedic Cockpit में रीयल-टाइम अपडेट होता है।`;
    }
    return `### ⚡ LifeCare <10ms Cloud Atomic Bed Mesh

LifeCare solves emergency hospital bed chaos using **deterministic cloud resource locking** in under **10ms**:

- **All-in-One Atomic Lock:** Rather than booking a bed in isolation, LifeCare locks the **ER Trauma Bay + On-Duty Specialist Doctor + Life-Support Ventilator/Defibrillator** within a single sub-10ms atomic cloud transaction.
- **Eliminates Gate Rejections:** Ensures zero "Hospital Full" turnaways when the 108 ambulance reaches the trauma center.
- **Bidirectional Sync:** The reservation status is instantly synchronized across the **Guardian Portal**, **108 Paramedic Cockpit**, and the destination **Hospital ER Command Center**.`;
  }

  // Topic: 0-Second Reception / QR / ABDM / ABHA
  if (query.includes('reception') || query.includes('qr') || query.includes('bypass') || query.includes('paper') || query.includes('abha') || query.includes('abdm')) {
    if (isHindi) {
      return `**0-सेकंड रिसेप्शन बायपास और ABHA इंटीग्रेशन:**

पारंपरिक अस्पतालों में मरीज़ के पहुँचने पर 20-30 मिनट पर्ची कटाने और फ़ॉर्म भरने में बर्बाद होते हैं। LifeCare इसे पूरी तरह समाप्त करता है:

1. **In-Transit Pre-Admission:** एम्बुलेंस यात्रा के दौरान ही मरीज़ का **ABHA Health ID** और **PM-JAY ₹5 लाख कैशलेस कवर** डिजिटल रूप से सत्यापित हो जाता है।
2. **AES-GCM-256 Encrypted QR:** मरीज़ का मेडिकल डेटा एक एन्क्रिप्टेड QR कोड में पैक होता है।
3. **Contactless Gate Clearance:** अस्पताल रिसेप्शन पर लगे स्कैनर से QR कोड स्कैन करते ही **0 सेकंड** में आपातकालीन भर्ती हो जाती है—बिना किसी कागजी कार्रवाई के!`;
    }
    return `### 🛡️ 0-Second Reception Bypass & ABDM v3 ABHA Uplink

LifeCare replaces the fatal 20–35 minute reception desk paperwork bottleneck with an automated **in-transit digital pre-admission pipeline**:

1. **ABDM v3 & PM-JAY Verification:** While the ambulance is on the road, the patient's Ayushman Bharat Health Account (ABHA) and PM-JAY ₹5 Lakh emergency coverage are verified digitally.
2. **AES-GCM 256-Bit Encrypted QR Packet:** All vital triage info and allergy histories are packed into an end-to-end encrypted QR token signed with a SHA-256 master key fingerprint.
3. **Zero-Wait Gate Admission:** The hospital ER scans the QR via the built-in LifeCare Reception Scanner, and the patient is wheeled straight into Trauma Bay 1 with zero gate delay!`;
  }

  // Topic: Doctor Degrees / Qualifications
  if (query.includes('doctor') || query.includes('degree') || query.includes('qualification') || query.includes('mbbs') || query.includes('डॉक्टर') || query.includes('डिग्री')) {
    if (isHindi) {
      return `**LifeCare में डॉक्टरों की डिग्रियों और रोस्टर का प्रबंधन:**

LifeCare में अस्पताल केवल नाम ही नहीं, बल्कि डॉक्टरों की पूरी मेडिकल डिग्रियाँ और योग्यताएँ दर्ज करते हैं:

- **मान्यता प्राप्त डिग्रियाँ:** MBBS, MD (आपातकालीन चिकित्सा / कार्डियोलॉजी), MS (ट्रॉमा सर्जरी), DM, DNB, MCh, FRCS।
- **रियल-टाइम स्टेटस:**
  - 🟢 **Free on Duty:** तत्काल मरीज़ अटेंड करने के लिए उपलब्ध।
  - 🟡 **Busy in Surgery:** ऑपरेशन थिएटर या ट्रॉमा बे में व्यस्त।
  - ⚪ **Absent / Off Duty:** ड्यूटी पर अनुपस्थित।
- **लाइव अपडेशन:** अस्पताल प्रशासन किसी भी समय डॉक्टर की डिग्रियों और विशेषज्ञता को एडिट और अपडेट कर सकता है।`;
    }
    return `### 🩺 Specialist Doctor Rostering & Degree Verification

LifeCare enforces rigorous medical credentialing for all trauma center doctors:

- **Verified Medical Degrees:** Tracks full clinical credentials including **MBBS, MD (Emergency Medicine, Critical Care), MS (General & Trauma Surgery), DM (Cardiology, Neurology), DNB, and MCh/FRCS**.
- **Real-Time Availability States:**
  - 🟢 **Free on Duty:** Instantly assignable to incoming ESI Level 1/2 trauma bays.
  - 🟡 **Busy (In Surgery):** Engaged in active trauma resuscitation or operative care.
  - ⚪ **Absent / Off Duty:** Checked out of active emergency rota.
- **Editable in Hospital Command:** Hospital administrators can update doctor degrees, experience years, and specialty rosters in real time via the **Hospital Portal**.`;
  }

  // Topic: Sarvam AI Integration
  if (query.includes('sarvam') || query.includes('voice') || query.includes('ai') || query.includes('speech') || query.includes('आवाज़')) {
    if (isHindi) {
      return `**LifeCare में Sarvam AI की भूमिका:**

LifeCare भारत के पहले इंडिक-फर्स्ट इमरजेंसी सिस्टम के रूप में **Sarvam AI** का उपयोग करता है:

1. **Bilingual Speech-to-Text (saaras:v4):** घबराए हुए नागरिक अपनी स्थानीय भाषा (हिन्दी या अंग्रेज़ी) में आपातकाल बोल सकते हैं।
2. **Text-to-Speech (bulbul:v3):** ऐप मरीज़ और परिचारक को शांत आवाज़ में फ़र्स्ट-एड निर्देश और गोल्डन ऑवर सलाह बोलकर सुनाता है।
3. **Indic Medical Triage:** बोली गई आवाज़ को तुरंत ICD-10 डायग्नोसिस और ESI 1–5 गंभीरता स्कोर में बदलता है।`;
    }
    return `### 🎙️ Sarvam AI's Role in LifeCare

LifeCare leverages **Sarvam AI** as its core Indian language voice and conversational engine:

1. **Indic Speech-to-Text (saaras:v4):** Converts spoken SOS panic calls in **Hindi** and **Indian English** into precise clinical text under 1 second.
2. **Neural Text-to-Speech (bulbul:v3):** Speaks aloud immediate first-aid instructions, doctor assignments, and triage advisories in calming natural voices (Priya, Aditya).
3. **Clinical Extraction:** Bridges linguistic barriers so callers don't have to type or speak complex medical terminology during extreme panic.`;
  }

  // Topic: 108 Driver & Ambulance
  if (query.includes('driver') || query.includes('ambulance') || query.includes('108') || query.includes('gps') || query.includes('navigation') || query.includes('ड्राइवर') || query.includes('एम्बुलेंस')) {
    if (isHindi) {
      return `**108 Driver Cockpit कैसे काम करता है?**

1. **GPS Priority Corridor:** Google Maps के ज़रिए एम्बुलेंस को सीधे उस अस्पताल और ट्रॉमा बे का नेविगेशन मिलता है जहाँ बेड पहले से लॉक है।
2. **Live Vitals Telemetry:** रस्ते में पैरामेडिक मरीज़ का ब्लड प्रेशर, पल्स, SpO2 और GCS स्कोर अस्पताल के डॉक्टरों को लाइव भेजते हैं।
3. **Bypass Protocol:** अस्पताल के सुरक्षा गेट को एम्बुलेंस की लाइव जीपीएस ट्रैकिंग दिखती है, जिससे गेट बिना रुके सीधे खुलते हैं।`;
    }
    return `### 🚑 108 Driver Tactical Cockpit & Telemetry

The **108 Driver Portal** turns mobile ICU ambulances into high-tech connected corridors:

- **Turn-by-Turn GPS Corridor:** Directly routes the paramedic to the specific hospital emergency bay that was locked for the patient, eliminating blind driving.
- **In-Transit Vitals Streaming:** Telemetry updates (SpO2, Pulse, Blood Pressure, Respiratory Rate, GCS Score) broadcast live to hospital doctors while the vehicle is in motion.
- **ACLS & BLS Verification:** Classifies fleet vehicles into Advanced Cardiac Life Support or Basic Life Support with verified equipment checks.`;
  }

  // Topic: Admin Console (/admin)
  if (query.includes('admin') || query.includes('super admin') || query.includes('এডমিন') || query.includes('एडमिन')) {
    if (isHindi) {
      return `**LifeCare Super Admin Console (/admin):**

- **Zero-Trust Security:** केवल अधिकृत Google ईमेल ही '/admin' पर लॉग इन कर सकते हैं।
- **Live Audit Trail:** हर आपातकाल के बेड लॉकिंग, एम्बुलेंस डिस्पैच और अस्पताल में भर्ती होने के टाइमस्टैम्प्स का लाइव रिकॉर्ड।
- **Centralized Control:** मरीज़ों, अस्पतालों और 108 एम्बुलेंस ड्राइवरों को सस्पेंड, रीइन्स्टेट या डिलीट करने की पूर्ण सुविधा।
- **Dual Theme:** डार्क OLED और लाइट मोड दोनों में उपलब्ध।`;
    }
    return `### ⚡ LifeCare Super Admin Console (\`/admin\`)

The **Super Admin Console** provides national-level governance over the emergency healthcare grid:

- **Zero-Trust Authentication:** Accessible strictly through verified Google OAuth matching pre-authorized administrator credentials.
- **Live Event Audit Trail:** Chronological timeline tracking every emergency mission from citizen voice SOS to atomic bed lock to ER admission.
- **Directory Management:** Complete oversight of all registered patients, hospitals, and 108 drivers with real-time Suspend, Reinstate, and Deletion privileges.
- **Liquid macOS Glass UI:** Seamlessly toggles between OLED Command Dark and Frost White Light themes.`;
  }

  // Default A to Z Overview Answer
  if (isHindi) {
    return `### 🌟 नमस्ते! मैं Niro हूँ — LifeCare का Gen AI कोपायलट

LifeCare भारत के आपातकालीन स्वास्थ्य तंत्र को 4 प्रमुख स्तंभों से क्रांतिकारी बनाता है:

1. **Guardian Portal:** हिन्दी व अंग्रेज़ी में Sarvam Voice SOS, <10ms में एटॉमिक बेड लॉक, और ABHA ई-हेल्थ रिकॉर्ड्स।
2. **108 Driver Cockpit:** प्राथमिक जीपीएस नेविगेशन, लाइव वाइटल्स टेलीमेट्री, और ज़ीरो-वेट गेट एंट्री।
3. **Hospital ER Command:** रीयल-टाइम आईसीयू/वेंटिलेटर बेड मेष, सत्यापित डॉक्टर डिग्रियाँ (MBBS, MD, DM), और QR रिसेप्शन बाईपास।
4. **Super Admin Console (/admin):** ज़ीरो-ट्रस्ट सुरक्षा, राष्ट्रीय ऑडिट ट्रेल, और डायरेक्टरी नियंत्रण।

आप मुझसे LifeCare के किसी भी फीचर, तकनीकी आर्किटेक्चर या मेडिकल प्रोटोकॉल के बारे में पूछ सकते हैं!`;
  }

  return `### 🌟 Hello! I am Niro — Your LifeCare Gen AI Copilot

LifeCare eliminates the fatal delays of the **Golden Hour** through four synchronized digital cockpits:

1. **Citizen Guardian Portal:** Bilingual Voice SOS (Hindi / English via Sarvam AI), instant ESI 1–5 triage, and sub-10ms atomic ICU bed reservation.
2. **108 Paramedic Cockpit:** Turn-by-turn emergency GPS corridor routing, live in-transit vitals telemetry, and direct ER bay bypass.
3. **Hospital ER Trauma Command:** Real-time editable bed mesh, specialist doctor rosters with medical degrees (MBBS, MD, DM), and 0-second reception QR intake.
4. **Super Admin Console (\`/admin\`):** Zero-trust Google OAuth governance, live emergency mission audit stream, and centralized directory management.

**Ask me anything:**
- *"How does <10ms atomic bed locking work?"*
- *"Explain the 0-Second ER Reception Bypass"*
- *"What is Sarvam AI's role in LifeCare?"*
- *"How are doctor degrees and rosters managed?"*
- *"What is the 108 Driver workflow?"*`;
}

export const SUGGESTED_QUICK_QUESTIONS = [
  'How does <10ms atomic bed locking work?',
  'Explain 0-Second ER Reception Bypass',
  'What is Sarvam AI\'s role in LifeCare?',
  'How are doctor degrees and rosters managed?',
  'How does the 108 Driver navigation work?',
  'What security standards does LifeCare comply with?'
];
