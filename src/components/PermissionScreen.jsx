import React, { useState } from 'react';
import { MapPin, Shield, Radio, Activity, AlertTriangle } from 'lucide-react';

export default function PermissionScreen({ onRequestPermission }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          onRequestPermission(true);
        },
        (err) => {
          setLoading(false);
          console.error(err);
          let message = 'Location access is required to run DeadZone.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Permission denied. Please enable location access in your browser settings to use DeadZone.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            message = 'Location information is unavailable. Please check your GPS signal.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Permission request timed out. Please try again.';
          }
          setError(message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (e) {
      setLoading(false);
      setError('An unexpected error occurred while requesting permission.');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Logo */}
      <div className="w-full max-w-md mt-8 flex flex-col items-center text-center z-10">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 shadow-xl mb-4 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Radio className="w-10 h-10 text-emerald-400 animate-pulse" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-600"></div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight font-sans bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-slate-100 to-red-400">
          DEADZONE
        </h1>
        <p className="text-sm text-slate-400 font-medium tracking-wide uppercase mt-1">
          Signal Quality Heatmap Tracker
        </p>
      </div>

      {/* Content Cards */}
      <div className="w-full max-w-md my-auto flex flex-col gap-4 z-10">
        <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all hover:border-slate-700 duration-300">
          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-200">Passive Coverage Mapping</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Log network coverage details like latency, downlink speeds, and tech generation (4G/3G) in the background.
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all hover:border-slate-700 duration-300">
          <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-900/50 text-sky-400 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-200">Live Local Heatmap</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Visualize reliable signal spots and dead zones interactively with real-time mapping.
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all hover:border-slate-700 duration-300">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-200">Privacy First</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              No registration or user logins required. Readings are strictly anonymous signal strength statistics.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-sm flex items-start gap-3 animate-headShake">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-normal">{error}</p>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-md mb-8 flex flex-col items-center gap-4 z-10">
        <button
          onClick={handleRequest}
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] transition-all duration-200 text-slate-950 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              <span>Enable Location Logging</span>
            </>
          )}
        </button>
        <p className="text-xs text-slate-500 text-center leading-normal px-4">
          To build a useful map, location access must be set to "Always Allow" or "While Using App" with Precise Location enabled.
        </p>
      </div>
    </div>
  );
}
