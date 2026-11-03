import React, { useState } from 'react';
import { 
  Network, 
  Languages, 
  Layers, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Bed, 
  Fingerprint,
  WifiOff
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const FooterTracksSection: React.FC = () => {
  const { navigateToTrack, setCurrentView } = useEmergency();
  const [activeTab, setActiveTab] = useState<'active' | 'future'>('active');

  return (
    <section aria-label="HackFront Tracks" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 mb-6 overflow-hidden">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 w-full max-w-full overflow-hidden">
        {/* Header with 2-Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                Multi-Track Architecture
              </span>
              <span className="text-xs text-slate-500">
                HackFront India 2026
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Integrated Track Implementations
            </h2>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3 Active Tracks Live</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('future')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold flex items-center gap-1.5 ${
                activeTab === 'future'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Future Scope & PWA</span>
            </button>
          </div>
        </div>

        {/* 1. CURRENT ACTIVE TRACKS (3 CARDS) */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
            {/* TRACK 1: NEO4J TRACK */}
            <div
              onClick={() => navigateToTrack('neo4j')}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Neo4j Graph & Cypher"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <Network className="w-4 h-4 text-teal-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                    &lt;9ms Traversal
                  </span>
                </div>

                <div>
                  <span className="text-xs text-teal-700 font-bold block uppercase tracking-wide">
                    Track: Neo4j
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700">
                    Emergency Knowledge Graph
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">Neo4j Cypher 5.x</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multi-Resource:</span>
                    <strong className="text-teal-800">Bed + Doctor + Bay</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Allergy Verification:</span>
                    <strong className="text-emerald-700">Instant Check</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:text-teal-800">
                <span>Open Cypher Explorer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* TRACK 2: SARVAM TRACK */}
            <div
              onClick={() => navigateToTrack('sarvam')}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Sarvam Voice AI"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Languages className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    7 Languages
                  </span>
                </div>

                <div>
                  <span className="text-xs text-amber-700 font-bold block uppercase tracking-wide">
                    Track: Sarvam
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700">
                    Indic Multilingual Voice AI
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>ASR Model:</span>
                    <strong className="text-slate-900">Sarvam Saaras ASR</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Triage Protocol:</span>
                    <strong className="text-amber-800">ESI Acuity 1-5</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Clinical Mapping:</span>
                    <strong className="text-emerald-700 font-mono text-[11px]">ICD-10 Automatic</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                <span>Test Voice SOS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* TRACK 3: GENERAL TRACK */}
            <div
              onClick={() => navigateToTrack('general')}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Hospital ER Console"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4 text-red-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded">
                    End-to-End
                  </span>
                </div>

                <div>
                  <span className="text-xs text-red-700 font-bold block uppercase tracking-wide">
                    Track: General
                  </span>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-red-700">
                    Zero-Wait ER Orchestration
                  </h3>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>National ABDM:</span>
                    <strong className="text-emerald-700">ABHA & PM-JAY ₹5L</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GPS Navigation:</span>
                    <strong className="text-slate-900">Google Maps 1-Tap</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ambulance Telemetry:</span>
                    <strong className="text-red-700">2-Way ER Sync</strong>
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

        {/* 2. FUTURE TRACKS & PWA OFFLINE ARCHITECTURE (4 CARDS) */}
        {activeTab === 'future' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn">
            {/* FUTURE 1: ARDUINO UNOQ TELEMETRY */}
            <div
              onClick={() => navigateToTrack('arduino')}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Open Arduino UnoQ Telemetry"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Cpu className="w-4 h-4 text-blue-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    UART Stream
                  </span>
                </div>

                <div>
                  <span className="text-xs text-blue-700 font-bold block uppercase tracking-wide">
                    Future: Arduino Track
                  </span>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700">
                    Arduino UnoQ Telemetry
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
                  <div className="flex items-center justify-between">
                    <span>ECG Waveform:</span>
                    <strong className="text-emerald-700">Lead-II Canvas</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-800">
                <span>View Arduino Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FUTURE 2: PIEZOELECTRIC BED SENSOR */}
            <div
              onClick={() => {
                setCurrentView('hospital');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Inspect Bed Sensor"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Bed className="w-4 h-4 text-purple-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                    Auto-Bed Sense
                  </span>
                </div>

                <div>
                  <span className="text-xs text-purple-700 font-bold block uppercase tracking-wide">
                    Future: IoT Track
                  </span>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-purple-700">
                    Piezo Bed Sensors
                  </h4>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Transducer:</span>
                    <strong className="text-slate-900">PVDF Film Matrix</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threshold:</span>
                    <strong className="text-purple-800">&gt;15kg = Occupied</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>State Sync:</span>
                    <strong className="text-emerald-700">&lt;250ms Neo4j</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-purple-700 group-hover:text-purple-800">
                <span>View Hospital Integration</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FUTURE 3: BIOMETRIC DOCTOR TRACKING */}
            <div
              onClick={() => {
                setCurrentView('hospital');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Inspect Doctor Verification"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Fingerprint className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    Doctor Check
                  </span>
                </div>

                <div>
                  <span className="text-xs text-amber-700 font-bold block uppercase tracking-wide">
                    Future: Verification
                  </span>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-amber-700">
                    Biometric OT Tracking
                  </h4>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Hardware:</span>
                    <strong className="text-slate-900">BLE Beacons + OT Scan</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Guarantee:</span>
                    <strong className="text-amber-800">0 Blind Dispatches</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <strong className="text-emerald-700">Auto OT Scrub-in</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
                <span>View Doctor Logic</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FUTURE 4: OFFLINE-FIRST PWA (ZERO-NETWORK ZONE TRIAGE) */}
            <div
              onClick={() => {
                setCurrentView('patient');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-slate-50 hover:bg-white rounded-xl p-4 border border-indigo-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Inspect Offline PWA Scope"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <WifiOff className="w-4 h-4 text-indigo-700" />
                  </div>
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                    Zero-Net PWA
                  </span>
                </div>

                <div>
                  <span className="text-xs text-indigo-700 font-bold block uppercase tracking-wide">
                    Future: PWA Scope
                  </span>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-indigo-700">
                    Offline PWA Triage
                  </h4>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Offline Engine:</span>
                    <strong className="text-slate-900 font-mono text-[11px]">ServiceWorker + Cache</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No Network:</span>
                    <strong className="text-indigo-800">IndexedDB Queue & SMS</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stabilization:</span>
                    <strong className="text-emerald-700">Offline CPR / FAST AI</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-indigo-700 group-hover:text-indigo-800">
                <span>View Offline Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
