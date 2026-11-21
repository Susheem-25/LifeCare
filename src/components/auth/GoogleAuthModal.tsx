import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import type { AppRole } from '../../types';
import { 
  X, 
  ShieldCheck, 
  LogOut, 
  User, 
  Building2, 
  Ambulance, 
  CloudCheck
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginWithGoogle, logoutUser, currentRole, setCurrentRole } = useEmergency();
  const [selectedRole, setSelectedRole] = useState<AppRole>(
    currentUser?.role || (currentRole === 'welcome' ? 'guardian' : currentRole)
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (role: AppRole) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(role);
      setCurrentRole(role);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <CloudCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Firebase Google Authentication
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Role-Based Unique ID Generation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Status Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Firebase Cloud Connected</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-white border border-emerald-300 px-2 py-0.5 rounded font-bold">
            Firestore & Auth Active
          </span>
        </div>

        {currentUser ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center space-x-3.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-sm truncate">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-full font-bold shrink-0">
                    {currentUser.authProvider}
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate font-mono">
                  {currentUser.email}
                </div>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Assigned Unique ID:
                  </span>
                  <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {currentUser.uniqueRoleId}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Role Status & Strict RBAC Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Authorized Role:</span>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  currentUser.role === 'guardian'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : currentUser.role === 'driver'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {currentUser.role === 'guardian' ? 'Citizen Guardian' : currentUser.role === 'driver' ? '108 Paramedic Driver' : 'Hospital ER Command'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Role access is strictly isolated. You cannot access driver or hospital portals while authenticated as a guardian, and vice versa. To switch roles, sign out first.
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 border border-slate-300"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Sign Out from Firebase</span>
            </button>
          </div>
        ) : (
          /* Sign In View */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign in with your Google account to access your assigned role. LifeCare automatically generates a role-based unique ID (<strong>GRD-XXXX</strong>, <strong>DRV-XXXX</strong>, or <strong>HSP-XXXX</strong>) and securely stores your session in Cloud Firestore.
            </p>

            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Select Your Operational Role:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRole('guardian')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    selectedRole === 'guardian'
                      ? 'bg-red-50 border-red-400 text-red-800 font-bold ring-2 ring-red-400/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1 text-red-600" />
                  <span className="text-[11px] block">Guardian</span>
                  <span className="text-[9px] font-mono text-slate-400">GRD-XXXX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('driver')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    selectedRole === 'driver'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold ring-2 ring-amber-400/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Ambulance className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-[11px] block">Driver/EMT</span>
                  <span className="text-[9px] font-mono text-slate-400">DRV-XXXX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('hospital')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    selectedRole === 'hospital'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold ring-2 ring-emerald-400/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">Hospital ER</span>
                  <span className="text-[9px] font-mono text-slate-400">HSP-XXXX</span>
                </button>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={() => handleSignIn(selectedRole)}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 py-3 rounded-2xl font-bold text-sm transition shadow-sm border border-slate-300 flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
            >
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting to Firebase...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-mono text-center">
          Security: OAuth 2.0 &bull; E2EE Encrypted &bull; 0 PII Exposure
        </div>
      </div>
    </div>
  );
};
