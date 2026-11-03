import React, { useState, useEffect, useRef } from 'react';
import { 
  ARDUINO_UNOQ_SKETCH_CODE, 
  SIMULATED_ARDUINO_PACKETS 
} from '../../data/trackMockData';
import type { ArduinoUnoQPacket } from '../../types';
import { 
  Cpu, 
  Activity, 
  Radio, 
  Code2, 
  Copy, 
  Check, 
  X, 
  Terminal
} from 'lucide-react';

interface Props {
  currentSpO2: number;
  currentHeartRate: number;
  onSyncVitalsFromArduino: (spo2: number, hr: number) => void;
}

export const ArduinoUnoQMonitor: React.FC<Props> = ({ 
  currentSpO2, 
  currentHeartRate,
  onSyncVitalsFromArduino 
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [autoSyncToCabin, setAutoSyncToCabin] = useState<boolean>(false);
  const [showSketchModal, setShowSketchModal] = useState<boolean>(false);
  const [copiedSketch, setCopiedSketch] = useState<boolean>(false);
  const [packets, setPackets] = useState<ArduinoUnoQPacket[]>(SIMULATED_ARDUINO_PACKETS);
  const [liveEcgVal, setLiveEcgVal] = useState<number>(1.24);
  const [simulatedVibration, setSimulatedVibration] = useState<number>(1.04);

  // Canvas ECG oscilloscope
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const drawEcg = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      // Clear with medical dark green grid background
      ctx.fillStyle = '#061c14';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#0d3827';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Lead-II P-Q-R-S-T ECG Waveform
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#34D399';
      ctx.beginPath();

      phaseRef.current = (phaseRef.current + 2.5) % 200;

      for (let x = 0; x < width; x++) {
        const t = (x + phaseRef.current) % 180;
        let y = midY;

        // P-wave
        if (t > 30 && t < 45) {
          y -= Math.sin(((t - 30) / 15) * Math.PI) * 12;
        }
        // Q-wave
        else if (t >= 50 && t < 55) {
          y += 10;
        }
        // R-wave (Tall spike)
        else if (t >= 55 && t < 65) {
          y -= 60;
        }
        // S-wave
        else if (t >= 65 && t < 72) {
          y += 18;
        }
        // T-wave
        else if (t > 90 && t < 120) {
          y -= Math.sin(((t - 90) / 30) * Math.PI) * 18;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(drawEcg);
    };

    if (isConnected) {
      drawEcg();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isConnected]);

  // Periodic simulated packet generation
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const newSpO2 = Math.min(99, Math.max(88, currentSpO2 + (Math.random() > 0.6 ? 1 : -1)));
      const newHr = Math.min(140, Math.max(90, currentHeartRate + (Math.random() > 0.5 ? 2 : -2)));
      const newEcg = Number((1.1 + Math.random() * 0.4).toFixed(2));
      const newVib = Number((0.98 + Math.random() * 0.15).toFixed(2));

      setLiveEcgVal(newEcg);
      setSimulatedVibration(newVib);

      const newPacket: ArduinoUnoQPacket = {
        timestamp: new Date().toISOString().substring(11, 23),
        rawHex: `0xAA 0x14 0x${Math.floor(Math.random() * 90 + 10)} 0x5C 0x${Math.floor(Math.random() * 90 + 10)}`,
        pulseOxSpO2: newSpO2,
        heartRateBpm: newHr,
        ecgMicrovolts: Math.floor(newEcg * 1000),
        cabinTempC: 37.0,
        cabinTempF: 98.6,
        transportVibrationG: newVib,
        packetSeq: Math.floor(Date.now() / 250) % 9999,
      };

      setPackets((prev) => [newPacket, ...prev.slice(0, 3)]);
      if (autoSyncToCabin) {
        onSyncVitalsFromArduino(newSpO2, newHr);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, autoSyncToCabin, currentSpO2, currentHeartRate, onSyncVitalsFromArduino]);

  const copySketch = () => {
    navigator.clipboard.writeText(ARDUINO_UNOQ_SKETCH_CODE);
    setCopiedSketch(true);
    setTimeout(() => setCopiedSketch(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span>FUTURE HARDWARE TRACK • ARDUINO UNOQ IoT</span>
              </span>
              <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                Arduino UnoQ Rev 2.0 (Dual-Core Roadmap)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Ambulance Biomedical IoT Sensor Hub & UART Stream
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => setShowSketchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-200 transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span>View C++ Sketch</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConnected(!isConnected)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isConnected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isConnected ? 'USB UART Online' : 'Connect COM3 (Simulator)'}</span>
          </button>
        </div>
      </div>

      {/* Future Track Architecture Callout */}
      <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900 font-mono">
        <div className="flex items-start sm:items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 sm:mt-0 shrink-0"></span>
          <span>
            <strong>Future Hardware Track:</strong> In the current prototype phase, paramedics manually enter and transmit vitals. Click &quot;Connect COM3&quot; to test the upcoming automated Arduino UnoQ hardware streaming pipeline.
          </span>
        </div>
        {isConnected && (
          <button
            type="button"
            onClick={() => setAutoSyncToCabin(!autoSyncToCabin)}
            className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer shrink-0 ${
              autoSyncToCabin
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {autoSyncToCabin ? '✓ Syncing to Cabin' : 'Apply to Cabin Vitals'}
          </button>
        )}
      </div>

      {/* Hardware Connection Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-white/70 border border-slate-200 rounded-2xl p-2.5">
          <div className="text-[10px] uppercase text-slate-400">Port & Baud Rate</div>
          <div className="font-bold text-slate-900">COM3 • 115200 bps</div>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-2xl p-2.5">
          <div className="text-[10px] uppercase text-slate-400">MAX30102 PulseOx</div>
          <div className="font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dot-pulse"></span>
            <span>SpO2: {currentSpO2}%</span>
          </div>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-2xl p-2.5">
          <div className="text-[10px] uppercase text-slate-400">AD8232 Lead-II ECG</div>
          <div className="font-bold text-red-600 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{currentHeartRate} bpm ({liveEcgVal} mV)</span>
          </div>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-2xl p-2.5">
          <div className="text-[10px] uppercase text-slate-400">MPU6050 Shock</div>
          <div className="font-bold text-slate-800">{simulatedVibration} G (Stable)</div>
        </div>
      </div>

      {/* Live ECG Oscilloscope Screen */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Live AD8232 Single-Lead ECG Cardiac Monitor (Arduino UnoQ Analog A0)</span>
          </span>
          <span className="text-[11px] text-slate-500">Sweep: 25mm/s • Gain: 10mm/mV</span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-emerald-600/40 shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={130}
            className="w-full h-[130px] block"
          />
          <div className="absolute top-2 right-3 font-mono text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            REAL-TIME ARDUINO ADC: 1024-BIT
          </div>
        </div>
      </div>

      {/* Live UART Hex / JSON Packet Monitor */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-[11px]">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>Arduino UnoQ Serial Stream (UART 115200)</span>
          </div>
          <span className="text-[10px] text-slate-400">Auto-streaming @ 4Hz</span>
        </div>

        <div className="space-y-1 text-[11px]">
          {packets.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
              <span className="text-slate-500 text-[10px]">{p.timestamp}</span>
              <span className="text-amber-400 font-bold">{p.rawHex}</span>
              <span className="text-emerald-400">SpO2: {p.pulseOxSpO2}%</span>
              <span className="text-red-400">HR: {p.heartRateBpm} BPM</span>
              <span className="text-sky-300">ECG: {p.ecgMicrovolts}uV</span>
              <span className="text-emerald-300 text-[10px]">SYNCED TO ER BAY</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arduino Sketch Code Modal */}
      {showSketchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Arduino UnoQ Ambulance IoT Firmware Sketch (`LifeCare_UnoQ.ino`)
                </h3>
              </div>
              <button
                onClick={() => setShowSketchModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This C++ firmware runs directly on the <strong>Arduino UnoQ</strong> board inside the emergency vehicle, acquiring real-time biological telemetry from the MAX30102 and AD8232 sensors and streaming serial frames to LifeCare.
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] text-emerald-300 leading-relaxed">
              <pre>{ARDUINO_UNOQ_SKETCH_CODE}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono">
              <span className="text-slate-500">Board: Arduino UnoQ • Ready to Compile</span>
              <button
                type="button"
                onClick={copySketch}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedSketch ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSketch ? 'Copied' : 'Copy Arduino C++ Sketch'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

