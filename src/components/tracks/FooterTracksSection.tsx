import React, { useState } from 'react';
import { 
  Network, 
  Languages, 
  Layers, 
  CheckCircle2, 
  Zap, 
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  Bed,
  Fingerprint,
  WifiOff
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { LIFENET_5_STEPS, IMPACT_METRICS } from '../../data/trackMockData';

export const FooterTracksSection: React.FC = () => {
  const { navigateToTrack } = useEmergency();
  const [activeTab, setActiveTab] = useState<'methodology' | 'pillars' | 'impact' | 'future'>('methodology');
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);

  return (
    <section aria-label="Emergency Healthcare Architecture" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 mb-6 overflow-hidden">
      <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/90 shadow-xs space-y-5 w-full max-w-full overflow-hidden">
        {/* Header with Segmented Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                EMERGENCY HEALTHCARE OS
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Autonomous Zero-Wait Triage & Bed Allocation
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              LifeCare Operating System Architecture & Methodology
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 font-bold text-xs cursor-pointer transition shadow-2xs self-start sm:self-center"
          >
            <span>{isSectionOpen ? 'Hide Architecture' : 'Explore Architecture (5 Steps & Pillars)'}</span>
            {isSectionOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        {isSectionOpen && (
          <div className="space-y-5 animate-fadeIn">
            {/* Segmented Tab Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'methodology'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>5 Steps Methodology</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pillars')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'pillars'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Core Features & USP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'impact'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Impact in Numbers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('future')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'future'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Future Scope & PWA</span>
            </button>
          </div>

        {/* 1. METHODOLOGY: 5 SYNCHRONIZED STEPS (Slide 3) */}
        {activeTab === 'methodology' && (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 animate-fadeIn">
            {LIFENET_5_STEPS.map((s) => (
              <div 
                key={s.step}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:bg-white transition flex flex-col justify-between space-y-2 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                      0{s.step}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] font-mono font-semibold text-slate-400 flex items-center justify-between">
                  <span>Step 0{s.step} of 05</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. CORE FEATURES & USP (Slide 4) */}
        {activeTab === 'pillars' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
            {/* NEO4J ATOMIC GRAPH LOCKING */}
            <div
              onClick={() => navigateToTrack('neo4j')}
              className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Neo4j Graph & Cypher"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Network className="w-4 h-4 text-teal-700" />
                  </div>
                  <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-mono">
                    &lt;9ms Lock
                  </span>
                </div>

                <div>
                  <span className="text-xs text-teal-700 font-bold block uppercase tracking-wide">
                    Innovation / USP
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700">
                    Atomic Graph Locking
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">Neo4j AuraDB Cypher</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Atomic Lock:</span>
                    <strong className="text-teal-800">Bay + Doctor + Equipment</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gate Rejection:</span>
                    <strong className="text-emerald-700">0% Guaranteed</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:text-teal-800">
                <span>Inspect Cypher Graph</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BHASHINI INDIC VOICE AI SOS */}
            <div
              onClick={() => navigateToTrack('sarvam')}
              className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Bhashini Voice AI"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Languages className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono">
                    7 Languages
                  </span>
                </div>

                <div>
                  <span className="text-xs text-amber-700 font-bold block uppercase tracking-wide">
                    Feature 01
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700">
                    Indic Voice AI SOS
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>STT & TTS Engine:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">Bhashini API + Whisper</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Triage Inference:</span>
                    <strong className="text-amber-800">Groq Llama 3.3</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Severity Protocol:</span>
                    <strong className="text-emerald-700 font-mono text-[11px]">ESI 1-5 + ICD-10</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                <span>Test Voice SOS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 0-SECOND RECEPTION BYPASS & BIDIRECTIONAL SYNC */}
            <div
              onClick={() => navigateToTrack('general')}
              className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Hospital ER Console"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4 text-red-700" />
                  </div>
                  <span className="text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono">
                    0-Sec Intake
                  </span>
                </div>

                <div>
                  <span className="text-xs text-red-700 font-bold block uppercase tracking-wide">
                    Features 02 & 03
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-red-700">
                    0-Sec Bypass & ER Sync
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>ABDM v3 Sandbox:</span>
                    <strong className="text-emerald-700">ABHA & PM-JAY ₹5L</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Live Telemetry:</span>
                    <strong className="text-slate-900">FastAPI + WebSockets</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gate Intake Delay:</span>
                    <strong className="text-red-700 font-mono text-[11px]">30 min &rarr; 0 sec</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-red-700 group-hover:text-red-800">
                <span>Open ER Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* 3. IMPACT IN NUMBERS (Slide 6) */}
        {activeTab === 'impact' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-3">Emergency Metric</th>
                    <th className="p-3 text-red-600">Traditional Ecosystem</th>
                    <th className="p-3 text-emerald-700">LifeCare Operating System</th>
                    <th className="p-3 text-slate-500">Golden Hour Impact</th>
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

            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800">
              <span><strong>Key Clinician Stat:</strong> 7-10% drop in survival for every minute of delay in cardiac arrest or severe ischemia.</span>
              <span className="font-mono font-bold text-emerald-700">LifeCare eliminates gate delay completely.</span>
            </div>
          </div>
        )}

        {/* 4. FUTURE SCOPE & PWA (Slide 4 & 7) */}
        {activeTab === 'future' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn">
            {/* ARDUINO TELEMETRY */}
            <div
              onClick={() => navigateToTrack('arduino')}
              className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-blue-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Arduino UnoQ Telemetry"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    UART Stream
                  </span>
                </div>
                <div>
                  <span className="text-xs text-blue-700 font-bold block uppercase tracking-wide">
                    Future: IoT Sensor Feed
                  </span>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700">
                    Arduino UnoQ Hub
                  </h4>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Sensors:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">MAX30102 + AD8232</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Streaming:</span>
                    <strong className="text-blue-800 font-mono text-[11px]">115200 bps Serial</strong>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                <span>View Sketch Code</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* PIEZOELECTRIC BED SENSOR */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Bed className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <span className="text-xs text-purple-700 font-bold block uppercase tracking-wide">
                    Future: Bed Sensors
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">
                    Piezoelectric Sensor
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  PVDF film matrix under mattress detecting patient weight (&gt;15kg occupied) to update Neo4j in &lt;250ms without nurse typing.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Roadmap Phase 3</span>
            </div>

            {/* BIOMETRIC SCRUB-IN */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Fingerprint className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <span className="text-xs text-emerald-700 font-bold block uppercase tracking-wide">
                    Future: OT Security
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">
                    Biometric Scrub-In
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  Optical fingerprint + BLE turnstile at scrub sink verifying surgeon is on-site before dispatching ambulance.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Roadmap Phase 3</span>
            </div>

            {/* OFFLINE PWA & SMS FALLBACK */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-indigo-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <WifiOff className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <span className="text-xs text-indigo-700 font-bold block uppercase tracking-wide">
                    Future: Rural PWA
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">
                    Offline PWA + SMS
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  Full CPR/triage instructions offline in IndexedDB; encrypted SMS dispatch fallback in zero-network highway zones.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-600 font-semibold">Roadmap Phase 2</span>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</section>
  );
};
