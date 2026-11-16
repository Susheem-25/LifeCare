import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  X, 
  TrendingUp, 
  Award, 
  Presentation, 
  Zap, 
  HeartPulse 
} from 'lucide-react';
import { LIFENET_5_STEPS, IMPACT_METRICS } from '../../data/trackMockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: 'patient' | 'ambulance' | 'hospital') => void;
}

export const HackFrontTrackModal: React.FC<Props> = ({ isOpen, onClose, onNavigateToView }) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'methodology' | 'features' | 'architecture' | 'impact'>('pitch');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-mono font-bold">
              <Award className="w-3.5 h-3.5 text-red-600" />
              <span>SYSTEM ARCHITECTURE</span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Zero-Wait Emergency OS
            </span>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              108 Emergency Grid
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            LifeCare: Zero-Wait Emergency Healthcare Operating System
          </h2>

          <p className="text-xs sm:text-sm text-slate-500">
            Autonomous Emergency Triage, sub-9ms Neo4j Atomic Bed Allocation & ABDM v3 Pre-Admission
          </p>
        </div>

        {/* Tab Navigation (5 Slides from PPTX) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === 'pitch'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Problem & Audience</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === 'methodology'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>5 Synchronized Steps</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === 'features'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Features & Innovation</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Architecture & Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer font-bold whitespace-nowrap ${
              activeTab === 'impact'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Impact & Roadmap</span>
          </button>
        </div>

        {/* TAB 1: PITCH & PROBLEM (Slide 1 & 2) */}
        {activeTab === 'pitch' && (
          <div className="space-y-5 animate-fadeIn">
            {/* The 2 AM Heart Attack Scenario */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider">
                  The Problem • What happens today at 2 AM
                </span>
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  Cardiac Arrest Crisis
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs space-y-1">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <span>1. Panic call</span>
                  </div>
                  <p className="text-slate-600">A scared family struggles to explain symptoms on a helpline in emotional distress.</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs space-y-1">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <span>2. Ambulance drives blind</span>
                  </div>
                  <p className="text-slate-600">No idea if a bed or specialist is free: <strong>50%+ get redirected</strong> mid-transit.</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs space-y-1">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <span>3. Turned away at the gate</span>
                  </div>
                  <p className="text-slate-600"><strong>35% rejected</strong> at hospital gates, costing <strong>20-45 minutes</strong> of lost golden hour.</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-red-100 shadow-2xs space-y-1">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <span>4. Forms before treatment</span>
                  </div>
                  <p className="text-slate-600">Relatives fill paper admission forms while patient waits: <strong>20-30 min lost</strong>.</p>
                </div>
              </div>

              {/* Survival Stat */}
              <div className="bg-white p-3 rounded-xl border border-red-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-slate-700 font-medium">
                    <strong className="text-red-700 font-extrabold">7-10% drop in survival</strong> for every minute of delay in cardiac arrest or severe ischemia.
                  </span>
                </div>
                <span className="text-emerald-700 font-mono font-bold shrink-0">LifeCare removes it.</span>
              </div>
            </div>

            {/* Target Users (Slide 2) */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Target Users (Who LifeCare is built for)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Callers & Families</div>
                  <div className="text-slate-500 mt-0.5">SOS in their own language; 7 Indian languages supported.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Paramedics & 108</div>
                  <div className="text-slate-500 mt-0.5">Know exactly where to take patient; zero blind driving.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Hospital ER Teams</div>
                  <div className="text-slate-500 mt-0.5">Get live vitals & ABHA records before patient arrival.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">PM-JAY Beneficiaries</div>
                  <div className="text-slate-500 mt-0.5">Cashless ₹5L eligibility pre-cleared in transit.</div>
                </div>
              </div>
            </div>

            {/* System Governance & Security */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                <span>System Governance & Standards</span>
                <span className="text-emerald-700 font-mono">ABDM v3 & ISO Compliant</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                LifeCare operates with cryptographic patient consent, sub-9ms Neo4j graph atomic locking, and zero-wait emergency bay routing to preserve the clinical golden hour.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: 5 SYNCHRONIZED STEPS (Slide 3) */}
        {activeTab === 'methodology' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                Our Methodology • 5 Synchronized Steps
              </span>
              <p className="text-xs text-slate-500">
                How LifeCare replaces chaotic, fragmented intake with an atomic zero-wait pipeline:
              </p>
            </div>

            <div className="space-y-3">
              {LIFENET_5_STEPS.map((step) => (
                <div 
                  key={step.step}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                        <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (step.step <= 3) onNavigateToView('patient');
                      else if (step.step === 4) onNavigateToView('ambulance');
                      else onNavigateToView('hospital');
                    }}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-semibold transition cursor-pointer shrink-0"
                  >
                    Try in App →
                  </button>
                </div>
              ))}
            </div>

            {/* What Makes It Work */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="font-bold text-emerald-900">Real-Time</div>
                <p className="text-emerald-700">Sub-9ms resource locking and live vitals (HR, SpO2, BP, GCS) streamed to the ER.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <div className="font-bold text-blue-900">Adaptive AI</div>
                <p className="text-blue-700">Understands regional speech, scores severity (ESI 1-5), and adapts first-aid and ER prep to each patient.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <div className="font-bold text-purple-900">Secure & Offline-Ready</div>
                <p className="text-purple-700">ABHA-verified records, encrypted SMS fallback, auto-sync after cellular dropouts.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEATURES & INNOVATION (Slide 4) */}
        {activeTab === 'features' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                Three Features That Save The Golden Minutes
              </span>
              <p className="text-xs text-slate-500">
                Core capabilities solving critical bottlenecks in emergency healthcare:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-white transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                    FEATURE 01
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">Bhashini</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Indic Voice AI SOS</h4>
                <p className="text-slate-600 leading-relaxed">
                  Regional speech converted into ICD-10 codes and an ESI 1-5 severity score, with spoken first-aid guidance.
                </p>
                <div className="pt-2 border-t border-slate-200 text-red-700 font-bold font-mono text-[11px]">
                  7 languages | ESI 1-5
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-white transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    FEATURE 02
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">ABDM v3</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">0-Second Reception Bypass</h4>
                <p className="text-slate-600 leading-relaxed">
                  ABHA history, allergy check and PM-JAY cover are ready before arrival, so no paper forms at the gate.
                </p>
                <div className="pt-2 border-t border-slate-200 text-emerald-700 font-bold font-mono text-[11px]">
                  Intake: 30 min to 0 sec
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                    FEATURE 03
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">WebSockets</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Bidirectional ER Sync</h4>
                <p className="text-slate-600 leading-relaxed">
                  Live vitals (HR, SpO2, BP, GCS) stream from the paramedic cockpit directly to the ER command dashboard.
                </p>
                <div className="pt-2 border-t border-slate-200 text-blue-700 font-bold font-mono text-[11px]">
                  Live 2-way telemetry
                </div>
              </div>
            </div>

            {/* Innovation / USP: Atomic Graph Locking */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wide">
                  INNOVATION / USP • Atomic Graph Locking
                </span>
                <span className="text-[11px] font-mono bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                  Neo4j AuraDB
                </span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed">
                One Neo4j graph transaction locks the <strong>bay</strong>, <strong>doctor</strong>, and <strong>equipment</strong> together in a single atomic Cypher query, so double-booking and gate rejection cannot physically occur.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                  <div className="text-lg font-bold font-mono text-teal-700">&lt;9ms</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Lock Time</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                  <div className="text-lg font-bold font-mono text-emerald-700">0%</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Gate Rejection</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-teal-200">
                  <div className="text-lg font-bold font-mono text-blue-700">0 sec</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Reception Intake</div>
                </div>
              </div>
            </div>

            {/* Future Innovation & Scope */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-700 uppercase text-[11px]">Future Innovation & Scope:</span>
              <span className="text-slate-600 font-mono text-[11px]">
                Offline-first PWA for rural areas • IoT: ECG/SpO2 feeds and bed sensors • Biometric specialist scrub-in
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & FLOW (Slide 5) */}
        {activeTab === 'architecture' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                System Architecture & User App Flow
              </span>
              <p className="text-xs text-slate-500">
                End-to-end data pipeline from Citizen SOS to Paramedic Cockpit to Hospital ER Command:
              </p>
            </div>

            {/* Flow Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                USER APP FLOW (SOS &gt; triage &gt; graph lock &gt; ABHA dossier &gt; live vitals to ER)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <div className="font-mono text-red-400 font-bold">1. Citizen SOS</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Caller speaks SOS in own language</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <div className="font-mono text-amber-400 font-bold">2. AI Triage</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">AI scores severity & needs (ESI 1-5)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <div className="font-mono text-teal-400 font-bold">3. Atomic Lock</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Bay, doctor, equipment locked &lt;9ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <div className="font-mono text-blue-400 font-bold">4. In-Transit</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">ABHA dossier + live vitals to ER</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                  <div className="font-mono text-emerald-400 font-bold">5. ER Direct</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">Direct admission to ready ER bay</div>
                </div>
              </div>
            </div>

            {/* Tech Stack Matrix (Slide 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Frontend</span>
                <div className="font-bold text-slate-900">React (Vite), TypeScript</div>
                <p className="text-slate-600 text-[11px]">Tailwind CSS, shadcn/ui, Leaflet GPS Maps</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Backend</span>
                <div className="font-bold text-slate-900">FastAPI, Pydantic v2</div>
                <p className="text-slate-600 text-[11px]">WebSockets real-time bidirectional telemetry</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Database</span>
                <div className="font-bold text-slate-900">Neo4j AuraDB</div>
                <p className="text-slate-600 text-[11px]">Cypher queries, Python driver (&lt;9ms atomic lock)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Voice & AI</span>
                <div className="font-bold text-slate-900">Bhashini API (STT + TTS)</div>
                <p className="text-slate-600 text-[11px]">Whisper (backup), Groq Llama 3.3 for clinical triage</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Health APIs</span>
                <div className="font-bold text-slate-900">ABDM Sandbox v3</div>
                <p className="text-slate-600 text-[11px]">ABHA health records & PM-JAY ₹5L cashless cover</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Hardware & Offline</span>
                <div className="font-bold text-slate-900">Offline PWA & IoT Hub</div>
                <p className="text-slate-600 text-[11px]">Arduino UnoQ Rev 2.0 + Encrypted SMS fallback</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: IMPACT & ROADMAP (Slide 6 & 7) */}
        {activeTab === 'impact' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Impact in Numbers (Slide 6) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-wider">
                  Impact In Numbers • Traditional vs LifeCare
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-mono">
                  Up to 30 min saved
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-3">Metric</th>
                      <th className="p-3 text-red-600">Traditional Ecosystem</th>
                      <th className="p-3 text-emerald-700">LifeCare OS</th>
                      <th className="p-3 text-slate-500">Clinical Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {IMPACT_METRICS.map((row) => (
                      <tr key={row.metric} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{row.metric}</td>
                        <td className="p-3 text-red-600 font-mono font-bold">{row.traditional}</td>
                        <td className="p-3 text-emerald-700 font-mono font-bold">{row.lifecare}</td>
                        <td className="p-3 text-slate-600">{row.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scaling Path (Slide 6) */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wide">
                Scaling Path (From City Pilot to Global Infrastructure)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-red-600">Phase 1: Pilot</div>
                  <div className="font-bold text-slate-900 mt-0.5">One City</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">108 emergency zone + partner hospitals</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-amber-600">Phase 2: State</div>
                  <div className="font-bold text-slate-900 mt-0.5">State-wide Grid</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">More hospitals & ambulances per state</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-blue-600">Phase 3: National</div>
                  <div className="font-bold text-slate-900 mt-0.5">108 Middleware</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">National middleware across India's 108 network</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-mono font-bold text-emerald-600">Phase 4: Global</div>
                  <div className="font-bold text-slate-900 mt-0.5">Global Rollout</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">South Asia, Africa, Latin America</p>
                </div>
              </div>
            </div>

            {/* 3-Phase Roadmap (Slide 7) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Roadmap & Implementation Milestones
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">Production Deployment Plan</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-red-400 font-bold">PHASE 1: PROTOTYPE (MVP)</span>
                  <div className="font-bold text-white">Core MVP (Active)</div>
                  <ul className="text-[11px] text-slate-300 list-disc pl-3.5 space-y-0.5">
                    <li>Graph schema + atomic locking</li>
                    <li>Indic voice triage (ESI + ICD-10)</li>
                    <li>ABHA pre-admission dossier</li>
                    <li>Paramedic & ER portals</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">PHASE 2: BETA PHASE</span>
                  <div className="font-bold text-white">Pilot & Hardening</div>
                  <ul className="text-[11px] text-slate-300 list-disc pl-3.5 space-y-0.5">
                    <li>Offline-first PWA + SMS fallback</li>
                    <li>Pilot with hospitals & crews</li>
                    <li>Latency & triage testing</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">PHASE 3: SCALE</span>
                  <div className="font-bold text-white">Public Rollout</div>
                  <ul className="text-[11px] text-slate-300 list-disc pl-3.5 space-y-0.5">
                    <li>108 network integration</li>
                    <li>IoT feeds & bed sensors</li>
                    <li>Rural offline-first app</li>
                    <li>Other emerging markets</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-serif italic">"Because in critical care, every second saved is a life preserved."</span>
                <span className="text-slate-400">Autonomous Emergency Healthcare OS</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-mono text-[11px]">
            LifeCare: Zero-Wait Emergency Healthcare Operating System
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs"
          >
            Explore Live Application
          </button>
        </div>
      </div>
    </div>
  );
};
