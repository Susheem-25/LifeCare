import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  HeartPulse,
  Ambulance,
  Building2,
  RotateCcw,
  PhoneCall,
  Lock,
  LogOut,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenTrackModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrackModal }) => {
  const {
    currentView,
    setCurrentView,
    activeBooking,
    resetEmergencyState,
    loggedHospital,
    loggedDriver,
    logoutHospital
  } = useEmergency();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar: Brand on Left, Desktop Tabs in Center, Actions on Right */}
        <div className="h-13 sm:h-14 flex items-center justify-between gap-2">
          {/* Brand */}
          <div
            onClick={() => setCurrentView('patient')}
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-4.5 h-4.5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-mono">
                Life<span className="text-red-600">Care</span>
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                HackFront 2026
              </span>
            </div>
          </div>

          {/* Desktop Role-Based Portal Tabs (Hidden on mobile <sm, visible on sm+) */}
          <nav className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentView('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                currentView === 'patient'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <HeartPulse className={`w-3.5 h-3.5 ${currentView === 'patient' ? 'text-white' : 'text-red-600'}`} />
              <span className="font-semibold text-xs">SOS Triage</span>
            </button>

            <button
              onClick={() => setCurrentView('ambulance')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                currentView === 'ambulance'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">
                {loggedDriver ? loggedDriver.driverName.split(' ')[0] : 'Driver'}
              </span>
              {!loggedDriver && <Lock className="w-2.5 h-2.5 text-slate-400" />}
              {activeBooking?.bookingCode && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    currentView === 'ambulance' ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {activeBooking.bookingCode}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('hospital')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                currentView === 'hospital'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {loggedHospital ? (
                <span className={currentView === 'hospital' ? 'text-white font-bold text-xs' : 'text-red-600 font-bold text-xs'}>
                  {loggedHospital.hospitalCode}
                </span>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  <span className="font-semibold text-xs">Hospital</span>
                </>
              )}
            </button>
          </nav>

          {/* Right utility buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {onOpenTrackModal && (
              <button
                type="button"
                onClick={onOpenTrackModal}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-mono text-slate-700 font-bold transition cursor-pointer shadow-2xs"
                title="View HackFront Multi-Track Architecture"
              >
                <Layers className="w-3 h-3 text-red-600" />
                <span>Tracks</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </button>
            )}

            <a
              href="tel:112"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl border border-red-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-mono text-red-700 font-bold transition cursor-pointer shadow-2xs"
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3 h-3 text-red-600" />
              <span>112</span>
            </a>

            {loggedHospital && (
              <button
                onClick={logoutHospital}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-slate-50 transition cursor-pointer"
                title="Logout Hospital"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={resetEmergencyState}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              title="Reset Simulation to Initial Clean State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Full-Width Segmented Tab Bar (Visible ONLY on mobile screens <sm) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full gap-1 shadow-2xs">
            {/* SOS Triage Tab */}
            <button
              type="button"
              onClick={() => setCurrentView('patient')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg text-xs transition cursor-pointer font-bold ${
                currentView === 'patient'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <HeartPulse className={`w-3.5 h-3.5 shrink-0 ${currentView === 'patient' ? 'text-white' : 'text-red-600'}`} />
              <span className="truncate">SOS Triage</span>
            </button>

            {/* Ambulance / Driver Tab */}
            <button
              type="button"
              onClick={() => setCurrentView('ambulance')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg text-xs transition cursor-pointer font-bold ${
                currentView === 'ambulance'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {loggedDriver ? loggedDriver.driverName.split(' ')[0] : 'Driver'}
              </span>
              {!loggedDriver && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
              {activeBooking?.bookingCode && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 ${
                    currentView === 'ambulance' ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {activeBooking.bookingCode}
                </span>
              )}
            </button>

            {/* Hospital ER Tab */}
            <button
              type="button"
              onClick={() => setCurrentView('hospital')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg text-xs transition cursor-pointer font-bold ${
                currentView === 'hospital'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {loggedHospital ? loggedHospital.hospitalCode : 'Hospital'}
              </span>
              {!loggedHospital && <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
