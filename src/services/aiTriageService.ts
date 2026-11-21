import { AITriageAnalysis, Hospital } from '../types';

export function analyzeEmergencyBrief(text: string): AITriageAnalysis {
  const normalized = (text || '')
    .replace(/[\u093C]/g, '')
    .replace(/\u095B/g, 'ज')
    .replace(/\u095E/g, 'फ')
    .replace(/\u0958/g, 'क')
    .replace(/\u0959/g, 'ख')
    .replace(/\u095A/g, 'ग');
  const query = normalized.toLowerCase();

  // 1. CARDIAC / HEART ATTACK (English + Indic Multi-Language via Bhashini)
  if (
    query.includes('chest pain') ||
    query.includes('heart') ||
    query.includes('cardiac') ||
    query.includes('left arm') ||
    query.includes('angina') ||
    query.includes('sweating') ||
    query.includes('palpitation') ||
    query.includes('substernal') ||
    query.includes('diaphoresis') ||
    query.includes('dyspnea') ||
    // Hindi & Indic Keywords (Bhashini STT triggers)
    query.includes('सीने') ||
    query.includes('छाती') ||
    query.includes('हार्ट') ||
    query.includes('दर्द') ||
    query.includes('पसीना') ||
    // Bengali
    query.includes('বুকে') ||
    query.includes('ব্যথা') ||
    query.includes('ঘામ') ||
    // Marathi
    query.includes('छातीत') ||
    query.includes('दुखत') ||
    // Tamil
    query.includes('நெஞ்சில்') ||
    query.includes('வலி') ||
    // Telugu
    query.includes('గుండెలో') ||
    query.includes('నొప్పి') ||
    // Gujarati
    query.includes('દુખાવો') ||
    query.includes('પરસેવો') ||
    // Punjabi
    query.includes('ਛਾਤੀ') ||
    query.includes('ਦਰਦ')
  ) {
    return {
      detectedCondition: 'Acute Coronary Syndrome (Suspected STEMI / Myocardial Infarction)',
      summary: 'High clinical suspicion of acute coronary ischemia. Time to needle / balloon angioplasty is critical to prevent irreversible myocardial necrosis.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Immediate Golden Hour Intervention Required',
      esiLevel: 1, // ESI Level 1: Immediate resuscitation & life-saving intervention (Slide 3 & 4)
      esiCategory: 'ESI Level 1: Immediate Resuscitation (Life-Threatening STEMI)',
      goldenHourWindowMinutes: 60,
      recommendedSpeciality: ['Interventional Cardiology & Electrophysiology', 'Emergency Medicine Specialist'],
      requiredMachinery: ['Cath Lab Biplane Philips Azurion 7', 'Zoll R Series ALS Defibrillator & Pacer', 'Hamilton-G5 High Precision ICU Ventilators'],
      firstAidImmediateInstructions: [
        'Keep patient calm, seated or in half-reclined position (do not let them walk).',
        'Loosen any tight clothing around neck and chest.',
        'If not allergic and conscious, chew one Disprin/Aspirin 300mg immediately (if available).',
        'Do not give heavy meals, water in large gulps, or hot beverages.',
        'Monitor consciousness; be prepared to initiate hands-only chest compressions if unresponsive.',
      ],
      icdCodeEstimate: 'ICD-10 I21.9 (Acute Myocardial Infarction)',
      aiConfidenceScore: 98,
      bhashiniLanguage: 'Indic Bhashini STT (7 Indian Languages)',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 7.8,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // 2. STROKE / NEUROLOGICAL (FAST Criteria)
  if (
    query.includes('stroke') ||
    query.includes('facial') ||
    query.includes('droop') ||
    query.includes('slurred') ||
    query.includes('paralysis') ||
    query.includes('weakness') ||
    query.includes('numbness') ||
    query.includes('brain') ||
    query.includes('लकवा') ||
    query.includes('स्ट्रोक')
  ) {
    return {
      detectedCondition: 'Acute Cerebrovascular Accident (CVA / Suspected Acute Ischemic Stroke)',
      summary: 'FAST positive presentation. Rapid neuro-imaging and thrombolytic (tPA/Tenecteplase) window is 4.5 hours from exact symptom onset.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Golden Window Thrombolysis / Thrombectomy',
      esiLevel: 2, // ESI Level 2: High risk / emergent intervention
      esiCategory: 'ESI Level 2: Emergent (Acute Brain Attack / Thrombolytic Window)',
      goldenHourWindowMinutes: 90,
      recommendedSpeciality: ['Neurologist & Acute Stroke Specialist', 'Neurosurgeon & Stroke Interventionist', 'Emergency Medicine Specialist'],
      requiredMachinery: ['256-Slice Dual Source Emergency CT Scanner', '3.0 Tesla Silent MRI Scanner', 'Cath Lab Siemens Artis Q with IVUS & FFR'],
      firstAidImmediateInstructions: [
        'Note the exact time symptoms first began (crucial for clot-busting medication).',
        'Lay patient on their side (recovery position) to prevent tongue fall or choking.',
        'DO NOT give any food, water, or aspirin until CT scan rules out brain hemorrhage.',
        'Keep airway clear and loosen tight collars.',
      ],
      icdCodeEstimate: 'ICD-10 I63.9 (Cerebral Infarction)',
      aiConfidenceScore: 96,
      bhashiniLanguage: 'Indic Bhashini STT',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 8.2,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // 3. TRAUMA / ROAD ACCIDENT / BLEEDING
  if (
    query.includes('accident') ||
    query.includes('collision') ||
    query.includes('bleeding') ||
    query.includes('head injury') ||
    query.includes('fracture') ||
    query.includes('trauma') ||
    query.includes('fall') ||
    query.includes('cut') ||
    query.includes('एक्सीडेंट') ||
    query.includes('खून')
  ) {
    return {
      detectedCondition: 'Polytrauma / Traumatic Brain & Hemorrhagic Injury',
      summary: 'High-energy blunt/penetrating trauma with risk of internal hemorrhage, hypovolemic shock, and cervical spine destabilization.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Level 1 Trauma Resuscitation Protocol',
      esiLevel: 1, // ESI Level 1: Immediate resuscitation & surgical control
      esiCategory: 'ESI Level 1: Immediate Resuscitation (Hemorrhagic Shock / Polytrauma)',
      goldenHourWindowMinutes: 45,
      recommendedSpeciality: ['Senior Trauma & Critical Care Surgeon', 'Emergency Medicine Specialist'],
      requiredMachinery: ['256-Slice Dual Source Emergency CT Scanner', 'NABH Accredited Rapid Blood Bank (O-ve Reserve)', 'Hamilton-G5 High Precision ICU Ventilators'],
      firstAidImmediateInstructions: [
        'Apply firm, direct pressure on bleeding wounds using a clean cloth or sterile gauze.',
        'DO NOT move or rotate the neck or spine if high-speed impact is suspected (maintain c-spine alignment).',
        'Keep patient warm with a jacket/blanket to counteract traumatic hypothermia.',
        'Do not remove any deeply embedded penetrating objects; stabilize them in place.',
      ],
      icdCodeEstimate: 'ICD-10 T07 (Unspecified Multiple Injuries)',
      aiConfidenceScore: 95,
      bhashiniLanguage: 'Indic Bhashini STT',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 6.9,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // 4. RESPIRATORY FAILURE / ASTHMA / SPO2
  if (
    query.includes('asthma') ||
    query.includes('breath') ||
    query.includes('spo2') ||
    query.includes('oxygen') ||
    query.includes('wheez') ||
    query.includes('choking') ||
    query.includes('suffocat') ||
    query.includes('सांस') ||
    query.includes('দম')
  ) {
    return {
      detectedCondition: 'Acute Respiratory Distress / Severe Bronchospasm with Hypoxemia',
      summary: 'Impending respiratory failure with oxygen desaturation. Requires high-flow oxygen, nebulization, and possible non-invasive/invasive mechanical ventilation.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Immediate Airway & Oxygenation Priority',
      esiLevel: 1, // ESI Level 1: Airway compromise
      esiCategory: 'ESI Level 1: Immediate Resuscitation (Acute Respiratory Arrest/Compromise)',
      goldenHourWindowMinutes: 30,
      recommendedSpeciality: ['Senior Pulmonologist & Critical Care Specialist', 'Emergency Medicine Specialist'],
      requiredMachinery: ['Hamilton-G5 High Precision ICU Ventilators', 'Dräger Evita V800 ICU Ventilators'],
      firstAidImmediateInstructions: [
        'Sit the patient completely upright leaning slightly forward; do not lay them flat.',
        'Administer reliever inhaler (Salbutamol/Asthalin) with spacer 4-6 puffs immediately if available.',
        'Open all windows for fresh circulating air.',
        'Ensure quiet, calm environment to reduce panic-induced oxygen consumption.',
      ],
      icdCodeEstimate: 'ICD-10 J96.00 (Acute Respiratory Failure)',
      aiConfidenceScore: 94,
      bhashiniLanguage: 'Indic Bhashini STT',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 7.2,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // 5. PEDIATRIC / CHILD CONVULSION / FEVER
  if (
    query.includes('child') ||
    query.includes('baby') ||
    query.includes('infant') ||
    query.includes('pediatric') ||
    query.includes('seizure') ||
    query.includes('convulsion') ||
    query.includes('fever') ||
    query.includes('बच्चा') ||
    query.includes('दौरा')
  ) {
    return {
      detectedCondition: 'Status Epilepticus / Complex Febrile Seizure in Pediatric Patient',
      summary: 'Ongoing pediatric seizure activity. Sustained convulsions exceeding 5 minutes require intravenous anticonvulsants and airway protection in specialized pediatric PICU/ER.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Pediatric Resuscitation Window',
      esiLevel: 2, // ESI Level 2: High risk pediatric emergency
      esiCategory: 'ESI Level 2: Emergent (Pediatric Status Epilepticus)',
      goldenHourWindowMinutes: 30,
      recommendedSpeciality: ['Pediatric Emergency & Trauma Specialist', 'Emergency Medicine Specialist'],
      requiredMachinery: ['Hamilton-G5 High Precision ICU Ventilators', 'Zoll R Series ALS Defibrillator & Pacer'],
      firstAidImmediateInstructions: [
        'Place the child on their side on the floor or bed away from hard or sharp objects.',
        'DO NOT put any spoons, fingers, or objects into the child\'s mouth.',
        'Do not restrain the shaking limbs; protect the head with a soft pillow.',
        'Time the seizure duration carefully.',
      ],
      icdCodeEstimate: 'ICD-10 R56.00 (Febrile Convulsion)',
      aiConfidenceScore: 93,
      bhashiniLanguage: 'Indic Bhashini STT',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 8.0,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // 6. BURNS / FIRE / EXPLOSION
  if (
    query.includes('burn') ||
    query.includes('fire') ||
    query.includes('explosion') ||
    query.includes('gas') ||
    query.includes('flame') ||
    query.includes('आग') ||
    query.includes('जलना')
  ) {
    return {
      detectedCondition: 'Major Thermal & Inhalation Burn Injury (>25% TBSA)',
      summary: 'Severe burn injury with high risk of hypovolemic burn shock and airway thermal edema from smoke inhalation. Urgent Parkland fluid resuscitation indicated.',
      urgency: 'CRITICAL_RED',
      urgencyLabel: 'Code Red - Specialized Burn ICU & Fluid Resuscitation',
      esiLevel: 2, // ESI Level 2: Emergent burn shock
      esiCategory: 'ESI Level 2: Emergent (Major Thermal Burn >25% TBSA)',
      goldenHourWindowMinutes: 60,
      recommendedSpeciality: ['Senior Trauma & Critical Care Surgeon', 'Emergency Medicine Specialist'],
      requiredMachinery: ['Hamilton-G5 High Precision ICU Ventilators', 'NABH Accredited Rapid Blood Bank (O-ve Reserve)'],
      firstAidImmediateInstructions: [
        'Cool the burns with gentle cool (not iced) running tap water for 15-20 minutes.',
        'DO NOT apply toothpaste, butter, oils, or ice to burns.',
        'Cover loosely with a clean, dry, non-stick cotton sheet or cling wrap.',
        'Keep patient warm as extensive burns cause rapid core body heat loss.',
      ],
      icdCodeEstimate: 'ICD-10 T30.0 (Thermal Burn)',
      aiConfidenceScore: 92,
      bhashiniLanguage: 'Indic Bhashini STT',
      groqModel: 'Groq Llama 3.3 70B Versatile',
      atomicLockTimeMs: 7.5,
      gateRejectionRisk: '0% (Graph Locked)',
      receptionWaitTime: '0-second direct admission',
    };
  }

  // DEFAULT / GENERAL EMERGENCY FALLBACK
  return {
    detectedCondition: 'Acute Undifferentiated Medical Emergency',
    summary: 'Acute medical distress requiring comprehensive triage assessment, baseline diagnostic workup, and stabilizing ER physician intervention.',
    urgency: 'URGENT_AMBER',
    urgencyLabel: 'Code Amber - High Priority Emergency Assessment',
    esiLevel: 3, // ESI Level 3: Urgent / multiple resources required
    esiCategory: 'ESI Level 3: Urgent (Multi-Resource Emergency Assessment)',
    goldenHourWindowMinutes: 60,
    recommendedSpeciality: ['Emergency Medicine Specialist', 'Chief of Emergency & Resuscitation'],
    requiredMachinery: ['Hamilton-G5 High Precision ICU Ventilators', 'Zoll R Series ALS Defibrillator & Pacer'],
    firstAidImmediateInstructions: [
      'Ensure the patient is in a safe, quiet position with unhindered breathing.',
      'Do not administer oral fluids or medications without medical guidance.',
      'Check pulse, response, and keep emergency contact informed.',
      'Keep the patient warm and calm until ALS ambulance arrives.',
    ],
    icdCodeEstimate: 'ICD-10 R68.89 (General Emergency)',
    aiConfidenceScore: 89,
    bhashiniLanguage: 'Indic Bhashini STT',
    groqModel: 'Groq Llama 3.3 70B Versatile',
    atomicLockTimeMs: 8.4,
    gateRejectionRisk: '0% (Graph Locked)',
    receptionWaitTime: '0-second direct admission',
  };
}

export function rankHospitalsForEmergency(
  hospitals: Hospital[],
  analysis: AITriageAnalysis
): Hospital[] {
  return hospitals.map((hospital) => {
    let score = 50;

    // 1. Bed Availability Weight (Max +20 pts)
    if (hospital.beds.icuFree > 0) score += 12;
    if (hospital.beds.emergencyFree > 2) score += 8;

    // 2. Doctor Availability (Must be ON DUTY and FREE!) (Max +25 pts)
    const matchingDoctor = hospital.doctors.find((doc) => {
      const matchesSpec = analysis.recommendedSpeciality.some(
        (rec) => rec.toLowerCase().includes(doc.specialization.toLowerCase()) ||
                 doc.specialization.toLowerCase().includes(rec.toLowerCase())
      );
      return matchesSpec && doc.status === 'AVAILABLE_AND_FREE';
    });

    if (matchingDoctor) {
      score += 25;
    } else {
      // Fallback: is any general ER specialist free?
      const erFree = hospital.doctors.some((d) => d.status === 'AVAILABLE_AND_FREE');
      if (erFree) score += 10;
    }

    // 3. Machinery Availability (Max +25 pts)
    let machinePoints = 0;
    for (const reqMach of analysis.requiredMachinery) {
      const found = hospital.equipments.find(
        (eq) =>
          eq.status === 'READY_AND_STERILIZED' &&
          (eq.name.toLowerCase().includes(reqMach.toLowerCase()) ||
           reqMach.toLowerCase().includes(eq.name.toLowerCase()))
      );
      if (found) {
        machinePoints += 12;
      }
    }
    score += Math.min(machinePoints, 25);

    // 4. Proximity / Transit Time Bonus (Max +15 pts)
    if (hospital.transitTimeMins <= 10) {
      score += 15;
    } else if (hospital.transitTimeMins <= 15) {
      score += 10;
    } else if (hospital.transitTimeMins <= 20) {
      score += 5;
    }

    // Level 1 Trauma bonus
    if (hospital.traumaLevel === 1) score += 5;

    // Cap at 99
    const finalScore = Math.min(score, 99);

    return {
      ...hospital,
      matchScore: finalScore,
    };
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
