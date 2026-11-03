import React, { useState } from 'react';
import { 
  Network, 
  Languages, 
  Layers, 
  Cpu, 
  X, 
  ArrowRight,
  WifiOff
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: 'patient' | 'ambulance' | 'hospital') => void;
}

export const HackFrontTrackModal: React.FC<Props> = ({ isOpen, onClose, onNavigateToView }) => {
  const [activeTrackTab, setActiveTrackTab] = useState<'overview' | 'neo4j' | 'sarvam' | 'general' | 'arduino'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
            <span>HACKFRONT INDIA 2026 • TRACKS USED & ROADMAP</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tracks Used
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Overview of the active tracks used in LifeCare: <strong>Neo4j Graph Database</strong>, <strong>Sarvam Indic AI</strong>, and the <strong>General Track</strong>, along with the <strong>Arduino UnoQ</strong> hardware integration as a future track to be added.
          </p>
        </div>

        {/* Track Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTrackTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium whitespace-nowrap ${
              activeTrackTab === 'overview'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Tracks Used Overview
          </button>

          <button
            onClick={() => setActiveTrackTab('neo4j')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium whitespace-nowrap ${
              activeTrackTab === 'neo4j'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Track: Neo4j (Used)</span>
          </button>

          <button
            onClick={() => setActiveTrackTab('sarvam')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium whitespace-nowrap ${
              activeTrackTab === 'sarvam'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Track: Sarvam (Used)</span>
          </button>

          <button
            onClick={() => setActiveTrackTab('general')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium whitespace-nowrap ${
              activeTrackTab === 'general'
                ? 'bg-red-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Track: General (Used)</span>
          </button>

          <button
            onClick={() => setActiveTrackTab('arduino')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer font-medium whitespace-nowrap ${
              activeTrackTab === 'arduino'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Future: Arduino UnoQ</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTrackTab === 'overview' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Neo4j Card */}
              <div 
                onClick={() => setActiveTrackTab('neo4j')}
                className="bg-white p-5 rounded-2xl border border-teal-500/30 hover:border-teal-500 hover:shadow-lg transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                    <Network className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-extrabold uppercase">
                    Active Track Used
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700">
                    Track: Neo4j Knowledge Graph
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Multi-hop Cypher queries traversals linking (Patient) ➔ (Specialist) ➔ (Hospital) ➔ (Locked Bay) in &lt;9ms with drug allergy cross-referencing.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-teal-600 font-bold flex items-center gap-1">
                  <span>Explore Neo4j Track</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Sarvam AI Card */}
              <div 
                onClick={() => setActiveTrackTab('sarvam')}
                className="bg-white p-5 rounded-2xl border border-amber-500/30 hover:border-amber-500 hover:shadow-lg transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Languages className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold uppercase">
                    Active Track Used
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700">
                    Track: Sarvam Indic Multilingual AI
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Voice SOS in 7+ Indian languages (Hindi, Tamil, Bengali, Telugu, Marathi, Punjabi) translated into clinical ICD-10 triage via Sarvam-1 Indic LLM.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-600 font-bold flex items-center gap-1">
                  <span>Explore Sarvam Track</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* General Track Card */}
              <div 
                onClick={() => setActiveTrackTab('general')}
                className="bg-white p-5 rounded-2xl border border-red-500/30 hover:border-red-500 hover:shadow-lg transition cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-extrabold uppercase">
                    Active Track Used
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-700">
                    Track: General Track
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Full zero-wait orchestration: Turn-by-Turn Google Maps Navigation, ABDM/ABHA pre-admission, and interactive ER command console.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-red-600 font-bold flex items-center gap-1">
                  <span>Explore General Track</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Future Track: Arduino UnoQ */}
            <div 
              onClick={() => setActiveTrackTab('arduino')}
              className="bg-gradient-to-r from-blue-50/80 to-indigo-50/70 p-4 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Future Track to be Added
                    </span>
                    <strong className="text-slate-900 text-xs">Arduino Track (Arduino UnoQ IoT Telemetry)</strong>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Hardware integration planned: Arduino UnoQ board reading MAX30102 pulse oximeter & AD8232 ECG in ambulance cabins.
                  </p>
                </div>
              </div>

              <div className="text-blue-700 font-bold flex items-center gap-1 shrink-0">
                <span>View Prototype Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Future Scope: Offline-First PWA for Zero-Network Zones */}
            <div 
              className="bg-gradient-to-r from-indigo-50/80 to-purple-50/70 p-4 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                  <WifiOff className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      Future Scope to be Added
                    </span>
                    <strong className="text-slate-900 text-xs">Offline-First PWA (No-Network Emergency Triage)</strong>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    ServiceWorker cache + IndexedDB offline triage engine. Ensures life-critical CPR/FAST guidance and distress dispatch queueing with automatic SMS/sync in zero-connectivity dead zones.
                  </p>
                </div>
              </div>

              <div className="text-indigo-700 font-bold flex items-center gap-1 shrink-0">
                <span className="text-[10px] bg-indigo-100 px-2 py-1 rounded-md">PWA Roadmap</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Neo4j Track */}
        {activeTrackTab === 'neo4j' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
                <Network className="w-4 h-4 text-teal-600" />
                <span>Track Used: Neo4j Knowledge Graph & Cypher</span>
              </div>
              <p className="text-teal-950 leading-relaxed">
                Emergency hospital triage cannot be efficiently solved with relational SQL tables because traversing multi-constraint paths in real time requires 6+ expensive relational JOINs.
              </p>
              <p className="text-teal-950 leading-relaxed">
                LifeCare models the emergency healthcare domain as a <strong>Neo4j Knowledge Graph</strong>:
              </p>
              <div className="bg-white/80 p-3 rounded-xl border border-teal-200/80 font-mono text-[11px] text-teal-900 space-y-1">
                <div>{'(EmergencyPatient)-[:REQUIRES_SPECIALTY]->(Specialty)'}</div>
                <div>{"(Doctor {status: 'FREE'})-[:SPECIALIZES_IN]->(Specialty)"}</div>
                <div>{'(Doctor)-[:ON_DUTY_AT]->(Hospital)'}</div>
                <div>{"(Hospital)-[:HAS_BED {type: 'ICU', status: 'VACANT'}]->(Bed)"}</div>
                <div>{"(Hospital)-[:HAS_EQUIPMENT {status: 'READY'}]->(Equipment)"}</div>
                <div>{'(EmergencyPatient)-[:HAS_ABHA_RECORD]->(ABHA)-[:ALLERGIC_TO]->(Drug)'}</div>
              </div>
              <p className="text-[11px] text-teal-800">
                Neo4j executes this 5-hop path traversal in <strong>8.4ms</strong> using Cypher index-free adjacency.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-slate-500">Inspect the interactive Neo4j Graph Explorer on the SOS page.</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToView('patient');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View Neo4j Graph & Cypher Runner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Sarvam Track */}
        {activeTrackTab === 'sarvam' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <Languages className="w-4 h-4 text-amber-600" />
                <span>Track Used: Sarvam Indic Multilingual AI</span>
              </div>
              <p className="text-amber-950 leading-relaxed">
                In real-world medical emergencies in India, patients and distressed family members frantically speak in their mother tongue (Hindi, Bengali, Marathi, Tamil, Telugu, Punjabi).
              </p>
              <p className="text-amber-950 leading-relaxed">
                LifeCare utilizes <strong>Sarvam AI</strong> sovereign models:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-900 text-xs pl-1">
                <li><strong>Sarvam Saaras ASR:</strong> Multilingual speech-to-text accurately capturing panic-stricken vernacular speech in Hindi, Tamil, Telugu, Bengali, Marathi, etc.</li>
                <li><strong>Sarvam-1 Indic LLM:</strong> Translates regional conversational emergency accounts into standardized clinical triage summaries with ICD-10 medical coding.</li>
                <li><strong>Zero Nuance Loss:</strong> Accurately interprets cultural phrases (e.g., "सीने में भारीपन", "छातीत धडधड", "நெஞ்சில் பாரम") into clinical cardiac protocols.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500">Test voice SOS in 7 Indic languages on the patient search intake.</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToView('patient');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Try Sarvam Indic Voice SOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: General Track */}
        {activeTrackTab === 'general' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Track Used: General Track (Zero-Wait Emergency Orchestration)</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                LifeCare delivers an end-to-end mission-critical platform designed to solve the <strong>Golden Hour mortality crisis</strong> in Indian emergency healthcare:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-red-700">1. Pre-Reservation Lock</div>
                  <div className="text-slate-500">Simultaneously reserves ICU Bed, on-duty specialist doctor, and machinery.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-red-700">2. Google Maps Navigation</div>
                  <div className="text-slate-500">Ambulance driver enters booking code to launch live GPS turn-by-turn routing.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-red-700">3. In-Transit ABHA Admission</div>
                  <div className="text-slate-500">ABDM health records & PM-JAY ₹5L cashless cover attach before arrival.</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-red-700">4. Hospital ER Console</div>
                  <div className="text-slate-500">Real-time doctor roster, editable bay assignments, and telemetry monitor.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                Close & Return to App
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Future Hardware Tracks */}
        {activeTrackTab === 'arduino' && (
          <div className="space-y-4 animate-fadeIn text-xs">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Future Tracks to be Added: Smart Hospital & Ambulance Hardware Ecosystem</span>
              </div>
              <p className="text-blue-950 leading-relaxed font-normal">
                To eliminate all human delays and data entry errors during emergencies, LifeCare is architected for 3 physical IoT hardware systems:
              </p>

              <div className="space-y-2.5">
                <div className="bg-white p-3 rounded-xl border border-blue-200">
                  <strong className="text-blue-800 block text-xs">1. Arduino UnoQ Ambulance IoT Telemetry Hub</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Microcontroller unit inside the ambulance cabin acquiring real-time Lead-II cardiac waveforms via AD8232 (analog A0) and optical SpO2/pulse via MAX30102, streaming high-frequency UART packets to the ER bay.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-purple-200">
                  <strong className="text-purple-800 block text-xs">2. Piezoelectric Automatic Bed Availability Updating Sensor</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Under-mattress pressure transducers automatically detect patient weight (&gt;15 kg = Occupied, &lt;5 kg = Vacant) with instant &lt;250ms zero-touch auto-updates directly into the bed allocator.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-200">
                  <strong className="text-rose-800 block text-xs">3. Biometric & BLE Turnstile Doctor Availability System</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Optical biometric fingerprint & BLE proximity beacons at OT scrub rooms automatically verify physical on-duty presence, auto-marking doctors 'In Surgery' or 'Available & Free' in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-mono text-slate-500">Live hardware prototypes and C++ sketches are viewable in the app.</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToView('ambulance');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open Ambulance Cockpit & Arduino Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
