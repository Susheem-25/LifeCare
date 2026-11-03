# LifeCare — AI Emergency Triage & Zero-Wait Hospital Orchestration Platform

[![Live Prototype](https://img.shields.io/badge/Live%20Prototype-lifecare--prototype.netlify.app-00C7B7?style=for-the-badge&logo=netlify)](https://lifecare-prototype.netlify.app)
[![HackFront India 2026](https://img.shields.io/badge/HackFront%20India-2026%20by%20whereuelevate.com-DC2626?style=for-the-badge)](https://whereuelevate.com)
[![Team](https://img.shields.io/badge/Team-BuilderBeings-10B981?style=for-the-badge)](#-hackathon-attribution--team)
[![React 19](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Build Speed](https://img.shields.io/badge/Vite%208-478ms%20Build-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Linter](https://img.shields.io/badge/Oxlint-0%20Warnings-green?style=for-the-badge)](https://oxc.rs)

> 🌐 **Live Deployed Prototype:** [https://lifecare-prototype.netlify.app](https://lifecare-prototype.netlify.app)
>
> **LifeCare** is a synchronized emergency healthcare operating system connecting **Distress Callers**, **Ambulance Cockpits**, and **Hospital Emergency Departments** in real time. By uniting **Sarvam Indic Voice AI & Web Speech Engine**, a **Neo4j Cypher Knowledge Graph Engine**, and an **ABDM-Compliant Zero-Wait Emergency Highway** (complemented by an **Arduino UnoQ & Autonomous Sensor Hardware Roadmap**), LifeCare replaces chaotic, fragmented hospital intake with guaranteed **Zero-Wait Golden Hour Admissions**.

### 👥 Team: BuilderBeings
- **Susheem Kumar Maurya** — Team Lead & Full-Stack Architect
- **Stuti Jain** — Healthcare Systems & Clinical UX Lead

*Engineered for HackFront India 2026 by whereuelevate.com*

---

## 📑 Table of Contents
1. [HackFront Multi-Track Alignment Matrix](#-hackfront-multi-track-alignment-matrix)
2. [The Critical Problem: India's Golden Hour Crisis](#-the-critical-problem-indias-golden-hour-crisis)
3. [The LifeCare Solution: 4 Synchronized Pillars](#-the-lifecare-solution-4-synchronized-pillars)
4. [Prototype Telemetry Workflow vs. Future Hardware Tracks](#-prototype-telemetry-workflow-vs-future-hardware-tracks)
5. [Interactive Demo Walkthrough (Judge's Guide)](#-interactive-demo-walkthrough-judges-guide)
6. [System Architecture & Data Flow](#-system-architecture--data-flow)
7. [Repository Organization & File Structure](#-repository-organization--file-structure)
8. [Visual Identity: Apple OS Liquid Glass & Mobile Responsiveness](#-visual-identity-apple-os-liquid-glass--mobile-responsiveness)
9. [Local Setup & Verification](#-local-setup--verification)
10. [Hackathon Attribution & Team](#-hackathon-attribution--team)

---

## 🏆 HackFront Multi-Track Alignment Matrix

LifeCare is architected to reflect the exact state of the prototype: **3 Active Tracks** implemented end-to-end, complemented by **3 Future Hardware Tracks** with working simulation models, C++ Arduino sketch code, and engineering specifications:

### 1. Active Tracks Used (Live in Prototype)

| Track | Problem Solved | LifeCare Implementation | Code Location | Status |
|---|---|---|---|---|
| **Neo4j Track**<br>*(Knowledge Graph)* | Finding hospitals with simultaneously available Bed + on-duty Specialist + operational Equipment. | Graph schema: `(:Hospital)-[:HAS_BAY]->(:ERBay)-[:RESERVES_DOCTOR]->(:Doctor)`. Sub-9ms index-free Cypher traversals for zero-conflict atomic resource locks (`AMB-xxxx` & `PAT-2026-xxxx`). Includes interactive query visualizer with 1-click Cypher query copying. | `src/components/patient/Neo4jGraphExplorer.tsx`<br>`src/data/trackMockData.ts` | **Active Track** |
| **Sarvam Track**<br>*(Indic Voice AI & Speech)* | Distress callers in panic cannot articulate complex medical symptoms in English or type long text on phones. | Native Web Speech API Voice SOS microphone integration & Sarvam Indic AI models supporting 7 Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, English) with clinical Acuity scoring (ESI 1-5), ICD-10 triage classification, and Text-to-Speech (TTS) voice guidance. | `src/components/patient/EmergencySearch.tsx`<br>`src/utils/speechService.ts`<br>`src/services/aiTriageService.ts` | **Active Track** |
| **General Track**<br>*(Zero-Wait ER)* | Fragmented emergency workflows across dispatchers, ambulances, and hospital ER desks. | Complete end-to-end synchronized platform: 2-tier responsive mobile navigation, 1-tap Google Maps GPS turn-by-turn routing, ABDM In-Transit ABHA Pre-Admission modal with 1-click Aadhaar mock verification, live 2-way ER vitals sync, and hospital bed/doctor capacity controllers. | `src/App.tsx`<br>`src/components/hospital/HospitalPortal.tsx`<br>`src/components/patient/AbhaIntakeModal.tsx`<br>`src/context/EmergencyContext.tsx` | **Active Track** |

### 2. Future Tracks & Architectural Roadmap (Hardware IoT & Offline-First PWA)

| System / Roadmap | Target Stack & Sensors | Architectural Purpose | Working Component | Status |
|---|---|---|---|---|
| **1. Arduino UnoQ Ambulance IoT** | Arduino UnoQ Rev 2.0, MAX30102 (SpO2/HR), AD8232 Lead-II ECG, UART @ 115200 bps | Continuous automated biosensor streaming from transit directly to the hospital cath lab. *(Currently previewed in Standby mode with working C++ `.ino` sketch and UART simulator).* | `src/components/ambulance/ArduinoUnoQMonitor.tsx` | **Future Track Simulator** |
| **2. Piezoelectric Auto-Bed Sensor** | PVDF Piezoelectric Film Matrix under ER mattresses | Continuous weight & presence sensing (>15 kg = Occupied / <5 kg = Free), updating Neo4j graph in <250ms without nurse data entry. | `src/components/tracks/FooterTracksSection.tsx`<br>`src/components/hospital/HospitalPortal.tsx` | **Future Hardware Track** |
| **3. Biometric Doctor Tracking** | Optical Fingerprint + BLE Proximity Turnstiles at OT/ER scrub | Physical on-duty verification ensuring patients are only dispatched to hospitals with verified on-site specialists. | `src/components/tracks/FooterTracksSection.tsx`<br>`src/components/hospital/HospitalPortal.tsx` | **Future Hardware Track** |
| **4. Offline-First PWA (Zero-Network Zone)** | ServiceWorker Cache API, IndexedDB Emergency Queue, Web Speech Offline Models & SMS Fallback | Ensures LifeCare remains fully operational when victims or drivers encounter remote highway dead zones, tunnels, or cellular dropouts. Provides offline CPR/FAST first-aid instructions, local triage scoring, and queues distress dispatches that automatically broadcast or fall back to encrypted SMS the instant a single bar of cellular signal is detected. | `src/components/tracks/FooterTracksSection.tsx`<br>`src/components/tracks/HackFrontTrackModal.tsx` | **Future PWA Scope** |

---

## 🚨 The Critical Problem: India's Golden Hour Crisis

In acute medical emergencies—myocardial infarction (heart attacks), ischemic strokes, and severe road trauma—**the first 60 minutes ("The Golden Hour") decide survival**. Every minute delayed decreases survival rates by **7% to 10%**.

Today's emergency response ecosystem in India suffers from **four systemic bottlenecks**:

```
[Distress Caller] ──(Blind Routing)──► [Nearest Hospital] ──(Full Bay Rejection)──► [Secondary Hospital]
        │                                                                                     │
   Panic barrier                                                                        Fatal delay
  Language barrier                                                                     (20-45 mins)
```

1. **Blind Ambulance Transits:** Dispatchers and drivers navigate blindly to the nearest facility without knowing if an ICU bed, cath lab, or neurosurgeon is actually available.
2. **Fatal ER Diverts & Rejections:** Up to 35% of critical trauma patients arrive at emergency facilities only to face hospital rejections because trauma bays are full or specialists are off-site.
3. **In-Transit Telemetry Void:** Paramedics lack real-time digital sync with trauma centers; receiving teams only begin prepping *after* the patient physically wheels into the bay.
4. **Manual Intake Paperwork:** 20 to 30 minutes of the precious Golden Hour are lost at hospital desks filling paper admission sheets, hunting for blood types, and verifying insurance policies.

---

## 💡 The LifeCare Solution: 4 Synchronized Pillars

LifeCare replaces this fragmented process with an **interlocked 4-pillar digital emergency network**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │          Pillar 1: Sarvam Indic Voice AI SOS           │
                       │    (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada)   │
                       └───────────────────────────┬────────────────────────────┘
                                                   │
                                                   ▼
                       ┌────────────────────────────────────────────────────────┐
                       │         Pillar 2: Neo4j Knowledge Graph Engine         │
                       │    (Simultaneous Bed + Specialist + Machinery Lock)    │
                       └─────────────────────┬───────────────────┬──────────────┘
                                             │                   │
                                             ▼                   ▼
    ┌───────────────────────────────────────────────┐  ┌───────────────────────────────────────────────┐
    │     Pillar 3: In-Transit ABHA Pre-Admission   │  │     Pillar 4: Smart ER & Ambulance Telemetry  │
    │ - ABDM Health ID Lookup & Verification        │  │ - Paramedic Manual Vitals Entry (Prototype)   │
    │ - Prior Allergies & Chronic History Pre-Sync  │  │ - 2-Way Real-Time Sync to ER Cath Lab        │
    │ - 0-Second ER Reception: Direct Bay Admission │  │ - Arduino UnoQ Edge IoT Roadmap (Future)      │
    └───────────────────────────────────────────────┘  └───────────────────────────────────────────────┘
```

### Pillar 1: Multilingual Voice SOS & Speech Engine (Sarvam Indic AI)
- Designed for panic scenarios where typing or speaking English is difficult or impossible.
- Supports **7 Indian Languages**:
  - **Hindi (हिन्दी):** *"सीने में बहुत तेज दर्द है और सांस लेने में तकलीफ हो रही है"*
  - **Tamil (தமிழ்):** *"நெஞ்சு வலி அதிகமாக உள்ளது, இடது கை மரத்துப்போனது"*
  - **Telugu (తెలుగు):** *"తీవ్రమైన రోడ్డు ప్రమాదం, తలకు గాయమై స్పృह కోల్పోయారు"*
  - **Bengali (বাংলা):** *"বুকে প্রচণ্ড ব্যথা ও শ্বাসকষ্ট হচ্ছে, বাঁ হাত অবশ"*
  - **Marathi (मराठी):** *"अचानक तोल गेला, बोलताना अडखळत आहे आणि डावी बाजू काम करत नाही"*
  - **Kannada (ಕನ್ನಡ):** *"ಎದೆ ನೋವು ತೀವ್ರವಾಗಿದೆ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ"*
  - **English:** Voice & text clinical intake with instant phonetic recognition.
- Integrated **Web Speech API**: Real-time microphone audio speech-to-text recording with live audio pulse animation and Text-to-Speech (TTS) audio narration for triage advice.
- Automatically calculates **Acuity Level (ESI 1-5)**, assigns ICD-10 diagnostic codes, and flags required clinical specialists in sub-400ms.

### Pillar 2: Dynamic Knowledge Graph Matching (Neo4j Cypher Engine)
- Instead of naive distance-only lookups, Neo4j traversals query simultaneous multi-resource availability:
  - Is an **ER / ICU Trauma Bay** free?
  - Is the required **Specialist Doctor** physically on duty?
  - Is the necessary **Machinery** (Cath Lab, 128-Slice CT, Ventilator) operational and sterilized?
- Generates a **unique Driver Lock Code** (`AMB-xxxx`) and unique Patient ID (`PAT-2026-xxxx`), executing atomic reservation to eliminate race conditions.

### Pillar 3: In-Transit ABHA Digital Pre-Admission (ABDM Compliant)
- Pre-loads verified ABDM health records via patient ABHA ID (`91-4820-9182-3921`) during the ambulance journey.
- Features an interactive **ABHA Intake Modal** allowing callers to proceed with verified ABHA credentials, 1-click mock Aadhaar authentication, or skip directly in urgent life-critical scenarios.
- Synchronizes blood group (`B+`), chronic conditions, and critical drug allergies (`Penicillin - Anaphylaxis`) directly to the receiving trauma bay.
- Patient bypasses hospital billing and reception desks completely: **True Zero-Wait ER Admission**.

### Pillar 4: Smart Ambulance Cockpit & Paramedic Telemetry
- Dedicated **Driver Authentication Portal** with Driver Badge & PIN security.
- Provides 1-tap **Google Maps turn-by-turn GPS navigation** with live distance and traffic ETA.
- Features real-time **2-way synchronized vitals transmission** between the ambulance and the ER triage console.
- Previews the **Arduino UnoQ Rev 2.0** edge unit with full C++ sketch code, UART serial packet stream, and Lead-II P-Q-R-S-T ECG oscilloscope.

---

## 🔬 Prototype Telemetry Workflow vs. Future Hardware Tracks

To ensure complete clarity for HackFront evaluators, the prototype clearly delineates current working capabilities from future roadmap hardware:

### Current Prototype Working Phase
1. **Pristine Zero-Booking State**: The prototype initializes cleanly with **zero pre-loaded bookings**. Evaluators can follow the natural patient SOS journey or use 1-click test simulation dispatchers.
2. **Paramedic In-Cabin Vitals Entry**: Paramedics manually enter and adjust vitals (SpO2, Heart Rate, Blood Pressure, Respiratory Rate, GCS Score) using tactile sliders and steppers.
3. **2-Way Real-Time Sync**: Clicking **"Transmit Paramedic Vitals to Hospital ER Bay"** immediately updates the hospital triage screen via cross-tab/channel synchronization. Hospital ER doctors can also adjust vitals or bay assignments with instant round-trip sync.
4. **Interlinked Multi-Role Portals**: Role-based authentication separates Citizen/Patient, Ambulance Driver, and Hospital Staff portals while maintaining unified reactive telemetry state.

### Future Tracks Roadmap (Hardware IoT & Offline PWA)
1. **Automated Arduino UnoQ IoT**: Replaces manual entry with automated streaming via MAX30102 pulse oximetry, AD8232 ECG electrodes, and NIBP transducers over UART.
2. **Piezoelectric Auto-Bed Sensors**: Under-mattress pressure film matrix detecting patient weight shifts (>15 kg occupied / <5 kg vacant), updating Neo4j availability within <250ms without nurse input.
3. **Biometric Doctor Tracking**: Optical fingerprint scanners and BLE proximity beacons at OT scrub-in rooms verifying on-duty presence to eliminate paper roster lag.
4. **Offline-First PWA (Zero-Network Zone Emergency Triage)**: Progressive Web App architecture caching essential clinical triage logic, CPR/FAST stabilization walkthroughs, and queuing distress dispatches locally in IndexedDB with background sync and emergency SMS fallback when traveling through zero-connectivity dead zones or remote highways.

---

## 🕹️ Interactive Demo Walkthrough (Judge's Guide)

Follow this 5-minute interactive test script to verify all features:

### Step 1: Pristine Initial State & Voice SOS Intake (Citizen View)
1. Launch the interactive prototype: Open [https://lifecare-prototype.netlify.app](https://lifecare-prototype.netlify.app). Notice that the top navigation reads **"Ready for SOS"** and starts with zero pre-existing bookings.
2. Under **"Emergency Medical Intake"**, select any language (e.g. **Hindi**, **Tamil**, or **Telugu**).
3. Click the **Voice SOS (🎤)** microphone button to speak aloud, or click a quick prompt chip: *"Heart Attack"*, *"Road Accident"*, or *"Stroke"*.
4. Notice:
   - AI computes **Acuity Level 1 (Critical)** in red.
   - Clinical summary identifies **Acute Coronary Syndrome (STEMI)**.
   - Mandatory specialists flag **Interventional Cardiology & Electrophysiology**.
   - Mandatory machinery flags **Cath Lab (Bi-Plane DSA) & Invasive Ventilator**.
   - Text-to-Speech (TTS) speaks aloud triage recommendations.

### Step 2: Zero-Wait Hospital ER Locking
1. Review the ranked hospital match list. The top recommendation (*AIIMS New Delhi*) displays live beds, free specialists, and sterilized machinery.
2. Click **"Reserve Bed & Dispatch Ambulance"**.
3. The **ABHA Intake Modal** prompts for optional digital health ID intake with 1-click Aadhaar mock verification or immediate skip.
4. Audio chime plays; a confetti celebration triggers.
5. The **Emergency Bed & Slot Confirmed Pass** opens with:
   - **Unique Patient ID:** `PAT-2026-xxxx`
   - **Driver Booking Code:** `AMB-xxxx`
   - **Reserved Bay:** `Trauma Bay #03 (Cath Lab 2)`
   - 20-minute reservation countdown hold timer.

### Step 3: Ambulance Cockpit & Paramedic Telemetry
1. Switch to **"Driver"** in the navigation bar.
2. Log in using pre-filled demo driver credentials (`DRV-401` / PIN `108`).
3. Observe:
   - **1-Tap Google Maps GPS Button:** Click to open driving directions to AIIMS New Delhi.
   - **Trip Status Stepper:** Click through *En Route Pickup*, *Patient Onboard*, *En Route ER Bay*, and *Arrived at Hospital*.
   - **Paramedic Vitals Console:** Adjust Heart Rate and SpO2 sliders, then click **"Transmit Paramedic Vitals to Hospital ER Bay"**.
   - **Arduino UnoQ Hardware Monitor:** Click *View C++ Sketch (.ino)* to view embedded code, or click *Connect COM3* to inspect simulated UART packet streaming and canvas ECG waveform.
   - **In-Transit ABHA Paperwork:** Verify pre-loaded ABHA ID `91-4820-9182-3921` with patient blood group, allergies, and signed digital consent.

### Step 4: Hospital ER Command Center
1. Switch to **"Hospital"** in the navigation bar.
2. Select **AIIMS-DELHI** using the pre-filled demo credentials (`AIIMS-ER-01` / `aiims@er2026`).
3. Observe:
   - Sound alert chime sounds on arrival/intake.
   - The incoming ambulance queue displays the active mission (`AMB-xxxx`) and Patient ID (`PAT-2026-xxxx`).
   - The vitals transmitted by the paramedic appear with live bidirectional sync.
   - Pre-arrival ABHA dossier displays verified blood group (`B+`) and allergy warnings (`⚠️ Penicillin`).
   - **Live Beds Capacity Controller (Tab 2):** Edit ICU or ER bed counts using direct number inputs or +/- buttons to verify instant reactivity.
   - **Doctor & Equipment Management (Tabs 3 & 4):** Add or toggle doctor duty status and sterilized machinery.

### Step 5: Neo4j Cypher Knowledge Graph Explorer
1. Return to the Emergency SOS view and explore the **"Neo4j Knowledge Graph & Cypher Engine"** panel.
2. Filter graph nodes by `PATIENT`, `HOSPITAL`, `DOCTOR`, `SPECIALTY`, `BED`, `EQUIPMENT`, or `ALLERGY`.
3. Click any pre-built Cypher query, click **"Execute Cypher Query"** (benchmark latency ~8.4ms), and click **"Copy Cypher"** to copy production Cypher code.

---

## 🏛️ System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Distress Caller (Patient)
    participant Sarvam as Sarvam Indic Voice AI & Web Speech
    participant Neo4j as Neo4j Graph Engine
    participant Amb as Ambulance Cockpit
    participant ABDM as ABHA Health Registry
    participant ER as Hospital ER Command

    Patient->>Sarvam: Multilingual Voice SOS (Hindi, Tamil, Telugu, etc.)
    Sarvam-->>Patient: Acuity Score (ESI 1-5), ICD-10 Code & Required Specialty
    Patient->>Neo4j: Query hospitals (Free Bay + Specialist + Equipment)
    Neo4j-->>Patient: Ranked Hospitals with Simultaneous Free Resources
    Patient->>Neo4j: 1-Click Bed Reservation & ABHA Intake
    Neo4j->>Neo4j: Atomic Lock (AMB-xxxx & PAT-2026-xxxx)
    Neo4j-->>Amb: Dispatch Route & GPS Navigation
    Neo4j-->>ER: Bay Locked Alert & Incoming ETA

    par Paramedic Telemetry & 2-Way Sync
        Amb->>Amb: Paramedic Updates In-Transit Vitals
        Amb->>ER: Transmits Live Vitals to ER Cath Lab
        ER-->>Amb: ER Bay Assigned & Prepped
    and ABHA Pre-Admission
        Amb->>ABDM: Query ABHA ID (91-4820-9182-3921)
        ABDM-->>Amb: Clinical History, Allergies & Emergency Contacts
        Amb->>ER: In-Transit Pre-Admission Dossier Synced
    end

    Amb->>ER: Ambulance Arrives at Trauma Bay
    ER->>Patient: Zero-Wait Immediate Clinical Admission
```

---

## 📁 Repository Organization & File Structure

```
LifeCare/
├── public/                               # Favicon and SVG vector icons
│   ├── favicon.svg                       # LifeCare heartbeat pulse brand icon
│   └── icons.svg                         # Standalone SVG symbols
├── src/
│   ├── components/
│   │   ├── ambulance/                    # Ambulance cockpit & hardware telemetry
│   │   │   ├── AmbulancePortal.tsx       # Live transit, paramedic vitals, PIN auth & ABHA sync
│   │   │   └── ArduinoUnoQMonitor.tsx    # Arduino UnoQ hardware telemetry preview & C++ sketch
│   │   ├── common/                       # Shared reusable components
│   │   │   └── LiveGpsTracker.tsx        # High-contrast live GPS radar & turn-by-turn map
│   │   ├── hospital/                     # Hospital ER triage command
│   │   │   └── HospitalPortal.tsx        # ER command station, auth & bed/doctor capacity
│   │   ├── patient/                      # Citizen emergency intake & triage
│   │   │   ├── AbhaIntakeModal.tsx       # ABHA intake dialog with 1-click Aadhaar verification
│   │   │   ├── BookingConfirmedModal.tsx # Driver dispatch code, Patient ID & ABHA pass modal
│   │   │   ├── EmergencySearch.tsx       # Web Speech Voice SOS, TTS & clinical triage
│   │   │   ├── HospitalMatchList.tsx     # Hospital zero-wait ranking & bed reservation
│   │   │   └── Neo4jGraphExplorer.tsx    # Interactive Cypher graph canvas & query copier
│   │   ├── tracks/                       # HackFront hackathon multi-track showcase
│   │   │   ├── FooterTracksSection.tsx   # Persistent tracks & hardware roadmap cards
│   │   │   └── HackFrontTrackModal.tsx   # Deep-dive track breakdown & code mapping modal
│   │   └── Navbar.tsx                    # 2-Tier responsive mobile header & role navigation
│   ├── context/
│   │   └── EmergencyContext.tsx          # Reactive global state (Locks, Vitals, Beds, Bookings)
│   ├── data/
│   │   ├── mockData.ts                   # Realistic hospitals, ER bays, doctors, drivers & ABHA
│   │   └── trackMockData.ts              # Cypher queries, graph nodes & Arduino telemetry packets
│   ├── services/
│   │   └── aiTriageService.ts            # Clinical acuity scoring & specialty matching
│   ├── utils/
│   │   ├── audio.ts                      # Web Audio API procedural sound engine & alerts
│   │   ├── scrollHelper.ts               # Smooth UX fast-scroll helper
│   │   └── speechService.ts              # Web Speech API recognition & speech synthesis engine
│   ├── App.tsx                           # Master layout, view switcher & responsive shell
│   ├── index.css                         # Apple Liquid Glass styling, layout guards & animations
│   ├── main.tsx                          # React 19 entry point
│   └── types.ts                          # Strictly typed TypeScript interfaces
├── LifeCare_Presentation.pptx            # 10-Slide Widescreen (16:9) HackFront Pitch Deck
├── LifeCare_Winning_Pitch_Deck.pptx      # Synced 10-Slide HackFront Presentation Deck
├── index.html                            # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                          # Clean dependencies (React 19, Tailwind CSS 4, Lucide)
├── tsconfig.json                         # TypeScript strict compiler configuration
└── vite.config.ts                        # Vite 8 build pipeline
```

---

## 🎨 Visual Identity: Apple OS Liquid Glass & Mobile Responsiveness

LifeCare is styled with an **Apple OS Liquid Glass (White & Red Healthcare)** aesthetic and full mobile optimization:

- **Strict Mobile Responsiveness:** Enforces zero horizontal scroll (`overflow-x: hidden` and `max-width: 100%`) across all Android and iOS viewports.
- **2-Tier Segmented Header:** Separates brand identity and emergency helpline in Row 1 from a full-width 3-tab segmented control (`SOS Triage`, `Driver`, `Hospital`) in Row 2, preventing tab overlap on narrow phone screens.
- **Liquid Glass Cards:** Multi-surface frosted glass cards (`backdrop-filter: blur(28px) saturate(190%)`) with hairline translucent borders (`rgba(255, 255, 255, 0.85)`) and specular top-edge light highlights.
- **Liquid Red Glossy Buttons:** Tactile pill design with specular top reflection gradients (`linear-gradient(180deg, #F87171 0%, #EF4444 32%, #DC2626 100%)`) and spring-like active compression (`active:scale-[0.975]`).
- **Auditory Feedback:** Procedural sound synthesis via browser Web Audio API — synthesizes clinical heart monitor pulses, driver lock chimes, and emergency alerts without external audio assets.

---

## ⚡ Local Setup & Verification

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Install Dependencies
```bash
cd LifeCare
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open the running local application address displayed in your terminal.

### 3. Production Build Verification
```bash
npm run build
```
Compiles TypeScript with 0 errors and bundles via Vite:
```
✓ 2045 modules transformed.
dist/index.html                   1.84 kB
dist/assets/index.css            85.71 kB
dist/assets/index.js            496.12 kB
✓ built in 478ms
```

### 4. Lint Verification
```bash
npm run lint
```
Output:
```
Found 0 warnings and 0 errors.
```

---

## 👥 Hackathon Attribution & Team

- **Competition:** HackFront India 2026
- **Host / Platform:** whereuelevate.com
- **Team Name:** **BuilderBeings**
- **Team Members:**
  - **Susheem Kumar Maurya** — Team Lead & Full-Stack Architect
  - **Stuti Jain** — Healthcare Systems & Clinical UX Lead
- **Repository Name:** LifeCare
- **Live Deployed Prototype:** [https://lifecare-prototype.netlify.app](https://lifecare-prototype.netlify.app)
- **Project Name:** LifeCare — AI Emergency Triage & Zero-Wait Hospital Orchestration
- **Status:** Complete, tested, fully functional prototype ready for jury evaluation.
