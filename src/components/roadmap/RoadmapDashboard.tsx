import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Mic,
  Brain,
  Network,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Activity,
  Zap,
  Radio,
  Sparkles,
  Building2,
  Ambulance,
  HeartPulse
} from 'lucide-react';

interface Props {
  onStepClick?: (step: number) => void;
}

export const RoadmapDashboard: React.FC<Props> = ({ onStepClick }) => {
  const {
    currentTriage,
    activeBooking,
    currentView,
    setCurrentView,
    resetEmergencyState
  } = useEmergency();

  // Determine current active step (1 to 5)
  let currentStep = 1;
  if (activeBooking) {
    if (activeBooking.status === 'ARRIVED_ER' || activeBooking.status === 'ADMITTED') {
      currentStep = 5;
    } else if (activeBooking.inTransitPaperwork?.isSubmitted || activeBooking.status === 'IN_TRANSIT_TO_HOSPITAL') {
      currentStep = 4;
    } else {
      currentStep = 3;
    }
  } else if (currentTriage) {
    currentStep = 2;
  }

  const [selectedPreviewStep, setSelectedPreviewStep] = useState<number | null>(null);
  const activeDisplayStep = selectedPreviewStep || currentStep;
  const isInspectingDifferentStep = selectedPreviewStep !== null && selectedPreviewStep !== currentStep;

  const steps = [
    {
      step: 1,
      title: 'Speak SOS',
      shortLabel: 'Voice Input',
      tech: 'Bhashini Indic STT',
      badge: '7 Languages',
      icon: Mic,
      description: 'Caller speaks distress in their native language without literacy or typing barriers.',
    },
    {
      step: 2,
      title: 'AI Triage',
      shortLabel: 'ESI 1-5 + ICD-10',
      tech: 'Groq Llama 3.3',
      badge: 'Clinical Acuity',
      icon: Brain,
      description: 'Real-time symptom mapping into ICD-10 and Emergency Severity Index with spoken first-aid.',
    },
    {
      step: 3,
      title: 'Atomic Lock',
      shortLabel: '<9ms Graph Lock',
      tech: 'Neo4j AuraDB',
      badge: '<9ms Latency',
      icon: Network,
      description: 'Atomic ACID lock simultaneously reserving ER bay, on-duty specialist doctor, and machinery.',
    },
    {
      step: 4,
      title: 'In-Transit Prep',
      shortLabel: 'ABDM & PM-JAY',
      tech: 'ABDM v3 Sandbox',
      badge: '₹5L Cashless',
      icon: ShieldCheck,
      description: 'Patient ABHA history, allergy contraindication check, and PM-JAY cover verified in transit.',
    },
    {
      step: 5,
      title: 'Direct Admission',
      shortLabel: '0-Sec Bypass',
      tech: 'ER Zero-Wait Desk',
      badge: '0s Intake',
      icon: CheckCircle2,
      description: 'Zero reception queues or admission forms; patient wheels straight into the prepped bay.',
    },
  ];

  const handleStepSelect = (stepNumber: number) => {
    setSelectedPreviewStep(stepNumber);
    if (onStepClick) {
      onStepClick(stepNumber);
    }
  };

  const navigateToCitizenSos = () => {
    if (currentView !== 'patient') {
      setCurrentView('patient');
    }
    setTimeout(() => {
      const el = document.getElementById('citizen-sos-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('ring-4', 'ring-red-500/40', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-red-500/40');
        }, 1500);
      }
      const input = document.getElementById('emergency-search-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    }, 60);
  };

  const navigateToParamedic = () => {
    if (currentView !== 'ambulance') {
      setCurrentView('ambulance');
    }
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 60);
  };

  const navigateToHospital = () => {
    if (currentView !== 'hospital') {
      setCurrentView('hospital');
    }
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 60);
  };

  // Completion calculation
  const progressPercent = currentStep === 1 ? 20 : currentStep === 2 ? 40 : currentStep === 3 ? 60 : currentStep === 4 ? 80 : 100;

  // Live status descriptions based on currentStep
  const getStatusSummary = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Standby • Awaiting Citizen Distress Voice/Text SOS',
          subtitle: '7 Indic languages connected via Bhashini STT. Speak or enter symptoms below to activate AI clinical triage.',
          acuity: 'Standby',
          acuityColor: 'text-slate-600 bg-slate-100 border-slate-200',
          bayStatus: 'Ready to Lock (<9ms)',
          abdmStatus: 'v3 Pre-Connected',
          intakeSla: '0-Sec Bypass Ready',
          actionText: 'Citizen SOS Input Ready',
          targetView: 'patient' as const,
        };
      case 2:
        return {
          title: `AI Clinical Triage Active: ${currentTriage?.detectedCondition || 'Analyzing Acuity'}`,
          subtitle: `Acuity determined as ESI Level ${currentTriage?.esiLevel} • ICD-10: ${currentTriage?.icdCodeEstimate} • Golden Window < ${currentTriage?.goldenHourWindowMinutes} mins.`,
          acuity: `ESI Level ${currentTriage?.esiLevel} (${currentTriage?.esiLevel === 1 ? 'Immediate' : 'Emergent'})`,
          acuityColor: currentTriage?.esiLevel === 1 ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200',
          bayStatus: 'Hospital Selection Pending',
          abdmStatus: 'v3 Pre-Connected',
          intakeSla: '30m → 0s Gate Bypass',
          actionText: 'Select Hospital to Lock Bay',
          targetView: 'patient' as const,
        };
      case 3:
        return {
          title: `Neo4j Atomic Lock Confirmed: ${activeBooking?.hospitalName}`,
          subtitle: `ER Bay ${activeBooking?.reservedBay} locked in <9ms with ${activeBooking?.assignedDoctor.name}. Zero rejection guaranteed.`,
          acuity: `ESI Level ${activeBooking?.aiAnalysis?.esiLevel || currentTriage?.esiLevel || 1}`,
          acuityColor: 'text-red-700 bg-red-50 border-red-200',
          bayStatus: `${activeBooking?.reservedBay} Locked (<9ms)`,
          abdmStatus: 'Awaiting Paramedic Sync',
          intakeSla: `Pass: ${activeBooking?.bookingCode}`,
          actionText: 'Open Paramedic Cockpit',
          targetView: 'ambulance' as const,
        };
      case 4:
        return {
          title: 'In-Transit Paperwork Active: ABDM v3 & PM-JAY Cashless Verified',
          subtitle: `Patient ${activeBooking?.patientName} (${activeBooking?.patientUniqueId}). Dossier sent to ER bay to eliminate reception intake.`,
          acuity: `En Route • ${activeBooking?.hospitalName.split(' ')[0]}`,
          acuityColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          bayStatus: `${activeBooking?.reservedBay} Prepped & Staffed`,
          abdmStatus: '₹5L PM-JAY Cashless Cleared',
          intakeSla: 'Intake Queues Eliminated',
          actionText: 'Open Paramedic Cockpit',
          targetView: 'ambulance' as const,
        };
      case 5:
        return {
          title: 'Direct Bay Admission Complete: 0-Second Reception Bypass',
          subtitle: `Patient admitted directly to ${activeBooking?.reservedBay} without filling registration forms or waiting in queue.`,
          acuity: 'Patient Admitted',
          acuityColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          bayStatus: `${activeBooking?.reservedBay} Occupied`,
          abdmStatus: 'Cashless PM-JAY Settled',
          intakeSla: '0 Seconds (Direct Entry)',
          actionText: 'Open ER Command Center',
          targetView: 'hospital' as const,
        };
      default:
        return {
          title: 'Emergency Care Lifecycle Active',
          subtitle: 'LifeCare Zero-Wait Synchronized Healthcare OS',
          acuity: 'Standby',
          acuityColor: 'text-slate-600 bg-slate-100 border-slate-200',
          bayStatus: 'Ready',
          abdmStatus: 'Connected',
          intakeSla: '0s Ready',
          actionText: 'View Dashboard',
          targetView: 'patient' as const,
        };
    }
  };

  const status = getStatusSummary();

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
      {/* 1. HIGH-VISIBILITY CURRENT DASHBOARD STATUS BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50/70 via-white to-emerald-50/50 border-2 border-red-100 p-4 sm:p-5 shadow-xs">
        {/* Soft decorative accent */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-red-100/40 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3.5">
          {/* Top row: Status tag, Live pulse, Pipeline progress, and Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide bg-red-600 text-white shadow-2xs">
                <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>CURRENT DASHBOARD STATUS: STEP {currentStep} OF 5</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span>Live 108 Emergency Pipeline</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                Pipeline Progress: <strong className="text-red-600">{progressPercent}%</strong>
              </div>

              <button
                type="button"
                onClick={resetEmergencyState}
                className="p-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                title="Reset lifecycle to Step 1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                <span>Reset Workflow</span>
              </button>
            </div>
          </div>

          {/* Active Status Headline & Explanation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="space-y-1 max-w-3xl">
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                <span>{status.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {status.subtitle}
              </p>
            </div>

            {/* Quick Action Button for the Current Step */}
            <button
              type="button"
              onClick={() => {
                if (status.targetView === 'patient') {
                  navigateToCitizenSos();
                } else if (status.targetView === 'ambulance') {
                  navigateToParamedic();
                } else if (status.targetView === 'hospital') {
                  navigateToHospital();
                }
              }}
              className="self-start md:self-center shrink-0 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-tight shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{status.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Progress Bar with 5 Connected Stages */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono font-semibold text-slate-500 px-0.5">
              <span>01. Speak SOS</span>
              <span>02. AI Triage</span>
              <span>03. Atomic Lock</span>
              <span>04. In-Transit ABDM</span>
              <span>05. Direct Admission</span>
            </div>
          </div>

          {/* Real-Time Live Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 block font-bold">
                1. Clinical Acuity
              </span>
              <strong className={`inline-block px-2 py-0.5 rounded-md font-mono text-xs font-bold mt-1 border ${status.acuityColor}`}>
                {status.acuity}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 block font-bold">
                2. Bay & Specialist Lock
              </span>
              <strong className="text-slate-900 font-mono text-xs font-bold block mt-1 truncate">
                {status.bayStatus}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 block font-bold">
                3. ABDM v3 & PM-JAY
              </span>
              <strong className="text-emerald-700 font-mono text-xs font-bold block mt-1 truncate">
                {status.abdmStatus}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 block font-bold">
                4. Admission Wait Queue
              </span>
              <strong className="text-red-700 font-mono text-xs font-bold block mt-1 truncate">
                {status.intakeSla}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 5-STEP ROADMAP TIMELINE NODES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>Interactive 5-Step Pipeline (Click any step to inspect):</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Active: Step {currentStep} of 5
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-2">
          {steps.map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            const isSelected = s.step === activeDisplayStep;
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => handleStepSelect(s.step)}
                className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${isSelected
                    ? 'bg-red-50/90 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                    : isCurrent
                      ? 'bg-white border-red-400 shadow-xs'
                      : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-300 hover:bg-emerald-50/70'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
              >
                {/* Header: Step Number & Status Icon */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {isCompleted ? 'DONE' : isCurrent ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>

                {/* Title & Short Label */}
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate group-hover:text-red-700 transition">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {s.shortLabel}
                  </div>
                </div>

                {/* Bottom Tech Badge */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="truncate">{s.tech.split(' ')[0]}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LIGHT, BEAUTIFUL STAGE DETAIL & PAYLOAD CARD (REPLACED DARK BLACK UI) */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-rose-50/30 border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-xs animate-fadeIn">
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              0{activeDisplayStep}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  {steps[activeDisplayStep - 1].title}: {steps[activeDisplayStep - 1].shortLabel}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {steps[activeDisplayStep - 1].tech}
                </span>

                {activeDisplayStep === currentStep ? (
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Current Active Stage</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    Inspecting Step {activeDisplayStep} Preview
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {steps[activeDisplayStep - 1].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isInspectingDifferentStep && (
              <button
                type="button"
                onClick={() => setSelectedPreviewStep(null)}
                className="text-xs text-red-600 hover:text-red-700 underline font-semibold cursor-pointer mr-1"
              >
                Back to Active Step ({currentStep})
              </button>
            )}

            <div className="text-right text-xs font-mono bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider block text-slate-500 font-bold">Target SLA</span>
              <strong className="text-emerald-700 font-bold">{steps[activeDisplayStep - 1].badge}</strong>
            </div>
          </div>
        </div>

        {/* 3 Information Columns in Light Clinical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Box 1: Operational Status */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Activity className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[10px] uppercase font-mono tracking-wider block font-bold">
                Operational Status
              </span>
            </div>

            {activeDisplayStep === 1 && (
              <p className="text-slate-700 leading-relaxed">
                Awaiting caller voice SOS or symptom text. 7 regional Indic languages active via Bhashini STT (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, English IN).
              </p>
            )}
            {activeDisplayStep === 2 && (
              <p className="text-slate-700 leading-relaxed">
                {currentTriage ? (
                  <>Analyzed: <strong className="text-slate-900 font-semibold">{currentTriage.detectedCondition}</strong>. Golden window under <strong className="text-red-700">{currentTriage.goldenHourWindowMinutes} mins</strong>.</>
                ) : (
                  'Type or speak emergency symptoms below to trigger clinical triage.'
                )}
              </p>
            )}
            {activeDisplayStep === 3 && (
              <p className="text-slate-700 leading-relaxed">
                {activeBooking ? (
                  <>Bay locked at <strong className="text-slate-900 font-semibold">{activeBooking.hospitalName.split(' ')[0]}</strong> in &lt;9ms with doctor <strong className="text-slate-900">{activeBooking.assignedDoctor.name}</strong>.</>
                ) : (
                  'Select a verified hospital below to trigger the sub-9ms atomic Neo4j graph reservation.'
                )}
              </p>
            )}
            {activeDisplayStep === 4 && (
              <p className="text-slate-700 leading-relaxed">
                {activeBooking?.inTransitPaperwork?.isSubmitted ? (
                  <>ABHA verified: <strong className="text-emerald-700 font-mono font-bold">{activeBooking.inTransitPaperwork.abhaDetails?.abhaId}</strong>. PM-JAY ₹5L cashless clearance active.</>
                ) : (
                  'Ambulance en route. In-transit ABHA dossier and cashless coverage pre-clearing.'
                )}
              </p>
            )}
            {activeDisplayStep === 5 && (
              <p className="text-slate-700 leading-relaxed">
                {activeBooking ? (
                  <>0-second reception bypass granted. Direct entry into <strong className="text-emerald-700 font-bold">{activeBooking.reservedBay}</strong> with zero paperwork waiting.</>
                ) : (
                  'Patient admitted directly to ready bay with no gate paperwork.'
                )}
              </p>
            )}
          </div>

          {/* Box 2: Live Verified Data Stream */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] uppercase font-mono tracking-wider block font-bold">
                Live Data Stream
              </span>
            </div>

            {activeDisplayStep === 1 && (
              <div className="text-slate-700 space-y-1">
                <div>Engine: <strong className="text-slate-900">Bhashini STT + TTS</strong></div>
                <div>Support: <strong className="text-slate-900">Hindi, Bengali, Tamil, Telugu...</strong></div>
                <div>Latency: <strong className="text-emerald-700">Instant audio streaming</strong></div>
              </div>
            )}
            {activeDisplayStep === 2 && (
              <div className="text-slate-700 space-y-1">
                <div>ICD-10: <strong className="text-amber-700 bg-amber-50 px-1 rounded">{currentTriage?.icdCodeEstimate || 'I21.9 Pending'}</strong></div>
                <div>Acuity: <strong className="text-red-700 font-bold">ESI Level {currentTriage?.esiLevel || 1}</strong></div>
                <div>Inference: <strong className="text-slate-900">Groq Llama 3.3 (&lt;1s)</strong></div>
              </div>
            )}
            {activeDisplayStep === 3 && (
              <div className="text-slate-700 space-y-1">
                <div>Lock Latency: <strong className="text-emerald-700">&lt;9ms ACID Tx</strong></div>
                <div>Bay: <strong className="text-slate-900">{activeBooking?.reservedBay || 'Cath Lab / Bay 3'}</strong></div>
                <div>Rejection Risk: <strong className="text-emerald-700 font-bold">0% Guaranteed</strong></div>
              </div>
            )}
            {activeDisplayStep === 4 && (
              <div className="text-slate-700 space-y-1">
                <div>ABDM Sandbox: <strong className="text-emerald-700">v3 Verified</strong></div>
                <div>Cashless: <strong className="text-emerald-700">₹5,00,000 Ayushman PM-JAY</strong></div>
                <div>Contraindications: <strong className="text-slate-900">Checked</strong></div>
              </div>
            )}
            {activeDisplayStep === 5 && (
              <div className="text-slate-700 space-y-1">
                <div>Intake Delay: <strong className="text-emerald-700 font-bold">0 Seconds (30m → 0s)</strong></div>
                <div>Gate Pass: <strong className="text-red-700">{activeBooking?.bookingCode || 'AMB-7492'}</strong></div>
                <div>Admit Mode: <strong className="text-slate-900">Direct Scrub-In</strong></div>
              </div>
            )}
          </div>

          {/* Box 3: Suggested Next Action & Navigation */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between space-y-2.5 shadow-2xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                Suggested Next Action
              </span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {activeDisplayStep === 1 && 'Describe or speak patient symptoms below to run clinical triage.'}
                {activeDisplayStep === 2 && 'Review ESI acuity and select a verified hospital bed.'}
                {activeDisplayStep === 3 && 'Click "Atomic Lock Bay" to secure hospital resources in <9ms.'}
                {activeDisplayStep === 4 && 'Switch to Paramedic Cockpit to inspect in-transit dossier.'}
                {activeDisplayStep === 5 && 'Switch to Hospital ER Command to admit patient.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeDisplayStep <= 3 && (
                <button
                  type="button"
                  onClick={navigateToCitizenSos}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Go to Citizen SOS</span>
                </button>
              )}
              {activeDisplayStep === 4 && (
                <button
                  type="button"
                  onClick={navigateToParamedic}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Ambulance className="w-3.5 h-3.5" />
                  <span>Open Paramedic Cockpit</span>
                </button>
              )}
              {activeDisplayStep === 5 && (
                <button
                  type="button"
                  onClick={navigateToHospital}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Open ER Command</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
