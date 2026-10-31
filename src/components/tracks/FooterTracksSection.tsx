import React from 'react';
import { 
  Network, 
  Languages, 
  Layers, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Bed, 
  Fingerprint
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const FooterTracksSection: React.FC = () => {
  const { navigateToTrack, setCurrentView } = useEmergency();

  return (
    <section aria-label="HackFront Tracks" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-6">
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-red-500/20 shadow-2xl space-y-6 oled-glow-red">
        {/* Header - Strictly "Tracks Used" (No awards mentioned) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-red-700 bg-red-100/90 border border-red-200 px-3 py-1 rounded-full font-black">
                Tracks Used
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Live & Clickable
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Tracks Used & Integrated Architecture
            </h2>
            <p className="text-xs text-slate-600">
              Click any track card below to immediately jump into its live running implementation.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            <span>HackFront India 2026 • Where U Elevate</span>
          </div>
        </div>

        {/* 1. CURRENT TRACKS USED (3 ACTIVE CARDS) */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Tracks Used (Click to Explore):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TRACK 1: NEO4J TRACK */}
            <div
              onClick={() => navigateToTrack('neo4j')}
              className="bg-white/90 rounded-2xl p-5 border border-teal-500/30 hover:border-teal-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to open Neo4j Knowledge Graph & Cypher Engine"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                    <Network className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Active Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-teal-700 font-extrabold">
                    Track: Neo4j
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700">
                    Emergency Knowledge Graph
                  </h3>
                </div>

                <div className="space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Engine:</span>
                    <strong className="text-slate-900">Neo4j Cypher 5.x</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Adjacency:</span>
                    <strong className="text-teal-700">Index-Free Pointer</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Query Latency:</span>
                    <strong className="text-emerald-600">8.4ms (&lt;12ms avg)</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Multi-hop pointer traversals across <code>(Patient)➔(Specialty)➔(Doctor)➔(Hospital)➔(Bay)</code> in &lt;9ms with drug allergy cross-referencing.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-teal-700 group-hover:text-teal-800">
                <span>Open Neo4j Graph & Cypher</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* TRACK 2: SARVAM TRACK */}
            <div
              onClick={() => navigateToTrack('sarvam')}
              className="bg-white/90 rounded-2xl p-5 border border-amber-500/30 hover:border-amber-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to open Sarvam Indic Voice SOS"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Languages className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Active Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-amber-700 font-extrabold">
                    Track: Sarvam
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700">
                    Indic Multilingual Voice AI
                  </h3>
                </div>

                <div className="space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Clinical LLM:</span>
                    <strong className="text-slate-900">sarvam-1-indic</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Speech Engine:</span>
                    <strong className="text-amber-700">Sarvam Saaras ASR</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Mother Tongues:</span>
                    <strong className="text-slate-900">हिन्दी, தமிழ், বাংলা...</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Voice SOS in 7+ native Indic dialects translated without nuance loss into standardized clinical ICD-10 triage codes.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-amber-700 group-hover:text-amber-800">
                <span>Test Sarvam Voice SOS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* TRACK 3: GENERAL TRACK */}
            <div
              onClick={() => navigateToTrack('general')}
              className="bg-white/90 rounded-2xl p-5 border border-red-500/30 hover:border-red-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to open Hospital ER Command Center"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Active Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-red-700 font-extrabold">
                    Track: General
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-red-700">
                    Zero-Wait ER Orchestration
                  </h3>
                </div>

                <div className="space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Golden Window:</span>
                    <strong className="text-red-700">&lt;60 mins to Care</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>GPS Navigation:</span>
                    <strong className="text-slate-900">Google Maps 1-Tap</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>National Cover:</span>
                    <strong className="text-emerald-600">ABHA & PM-JAY ₹5L</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Locks ICU beds, free specialists, and sterilized machinery simultaneously before arrival with in-transit ABHA digital admission.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-bold text-red-700 group-hover:text-red-800">
                <span>Open Hospital ER Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. FUTURE TRACKS TO BE ADDED (HARDWARE IoT ECOSYSTEM) */}
        <div className="space-y-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Future Tracks to be Added (Hardware IoT Roadmap & Prototypes):</span>
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              3 Hardware Systems Planned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FUTURE 1: ARDUINO UNOQ TELEMETRY */}
            <div
              onClick={() => navigateToTrack('arduino')}
              className="bg-gradient-to-br from-blue-50/70 to-indigo-50/60 rounded-2xl p-5 border-2 border-dashed border-blue-400 hover:border-blue-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to view Arduino UnoQ Ambulance Telemetry & C++ Sketch"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5 text-blue-600 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black uppercase">
                    Future: Arduino Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-blue-700 font-extrabold">
                    1. Arduino UnoQ Ambulance IoT
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                    In-Cabin Biomedical Telemetry
                  </h4>
                </div>

                <div className="space-y-1 font-mono text-[10px] bg-white/80 p-2.5 rounded-xl border border-blue-200 text-slate-700">
                  <div>Board: <strong>Arduino UnoQ Rev 2.0 (Dual-Core IoT)</strong></div>
                  <div>Sensors: <strong>MAX30102 (SpO2) + AD8232 ECG</strong></div>
                  <div>UART Serial: <strong>COM3 @ 115200 bps (4Hz)</strong></div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Microcontroller acquisition of analog Lead-II P-Q-R-S-T ECG potentials and blood oxygenation streamed directly from transit to hospital ER bays.
                </p>
              </div>

              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs font-mono font-bold text-blue-700 group-hover:text-blue-800">
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
              className="bg-gradient-to-br from-violet-50/70 to-purple-50/60 rounded-2xl p-5 border-2 border-dashed border-purple-400 hover:border-purple-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to inspect Piezoelectric Bed Sensor Integration in Hospital Portal"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                    <Bed className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-[9px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black uppercase">
                    Future Hardware Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-purple-700 font-extrabold">
                    2. Piezoelectric Auto-Bed Sensor
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-700">
                    Automatic Bed Availability Sensor
                  </h4>
                </div>

                <div className="space-y-1 font-mono text-[10px] bg-white/80 p-2.5 rounded-xl border border-purple-200 text-slate-700">
                  <div>Hardware: <strong>Under-Mattress Piezo Grid (PVDF)</strong></div>
                  <div>Threshold: <strong>&gt;15 kg = Occupied | &lt;5 kg = Free</strong></div>
                  <div>Sync Delay: <strong>Instant Auto-Update (&lt;250ms)</strong></div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Eliminates manual human error: pressure-sensitive piezoelectric transducers under ICU mattresses instantly toggle bed status without nurses logging in.
                </p>
              </div>

              <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs font-mono font-bold text-purple-700 group-hover:text-purple-800">
                <span>Inspect Bed Manager</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FUTURE 3: BIOMETRIC DOCTOR TRACKING */}
            <div
              onClick={() => {
                setCurrentView('hospital');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="bg-gradient-to-br from-rose-50/70 to-pink-50/60 rounded-2xl p-5 border-2 border-dashed border-rose-400 hover:border-rose-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              title="Click to inspect Biometric Doctor Tracking in Hospital Portal"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                    <Fingerprint className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-[9px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-black uppercase">
                    Future Hardware Track
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-rose-700 font-extrabold">
                    3. Biometric Doctor Tracking
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-700">
                    Automatic Doctor Availability System
                  </h4>
                </div>

                <div className="space-y-1 font-mono text-[10px] bg-white/80 p-2.5 rounded-xl border border-rose-200 text-slate-700">
                  <div>Hardware: <strong>BLE Turnstile + Optical Biometrics</strong></div>
                  <div>Locations: <strong>OT Scrub-In, ER Bay, Trauma Wing</strong></div>
                  <div>Roster Update: <strong>Auto-marks 'In Surgery' / 'Free'</strong></div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Optical biometric fingerprint & BLE proximity beacons at OT scrub rooms automatically verify physical on-duty presence, preventing dispatch to absent specialists.
                </p>
              </div>

              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-xs font-mono font-bold text-rose-700 group-hover:text-rose-800">
                <span>Inspect Doctor Roster</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
