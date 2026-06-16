import { Play, Square, Radio, Info } from 'lucide-react';

const QUALITY_STYLES = {
  excellent: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    label: 'Excellent',
    description: '4G+ High-speed network connection.',
    badge: 'bg-emerald-950 text-emerald-300 border border-emerald-900',
  },
  good: {
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-400/5',
    label: 'Good',
    description: 'Stable 4G connection, reliable speeds.',
    badge: 'bg-emerald-950/50 text-emerald-400 border border-emerald-950',
  },
  moderate: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    label: 'Moderate',
    description: '3G Connection. Browsing may feel slow.',
    badge: 'bg-amber-950 text-amber-300 border border-amber-900',
  },
  weak: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/10',
    label: 'Weak',
    description: '2G connection. Expect delays and drops.',
    badge: 'bg-red-950 text-red-300 border border-red-900',
  },
  dead: {
    color: 'text-red-600',
    bg: 'bg-red-950/20',
    border: 'border-red-900/40',
    glow: 'shadow-red-950/20',
    label: 'Dead Zone',
    description: 'Offline or extremely poor connection.',
    badge: 'bg-red-950/80 text-red-400 border border-red-900/50',
  },
};

export default function StatsScreen({
  isLogging,
  onToggleLogging,
  sessionReadingsCount,
  currentQuality,
  gpsAccuracy,
  currentSpeed,
  currentConnectionDetails,
}) {
  const style = QUALITY_STYLES[currentQuality] || QUALITY_STYLES.dead;
  const speedKmh = currentSpeed ? (currentSpeed * 3.6).toFixed(1) : '0.0';

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-y-auto bg-slate-950 p-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-100">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-900 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between z-10 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-sans">Dashboard</h2>
          <p className="text-xs text-slate-400">Real-time status & contribution stats</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge} flex items-center gap-1.5`}>
          <Radio className="w-3.5 h-3.5" />
          <span className="capitalize">{currentQuality}</span>
        </div>
      </div>

      {/* Signal Ring Visual Indicator */}
      <div className="flex flex-col items-center justify-center py-6 z-10 shrink-0">
        <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 ${style.border} ${style.bg} ${style.glow} shadow-xl transition-all duration-500`}>
          {/* Internal Pulse Ring for logs active */}
          {isLogging && (
            <div className="absolute inset-2 border-2 border-dashed border-slate-700/60 rounded-full animate-[spin_40s_linear_infinite]"></div>
          )}

          <div className="flex flex-col items-center text-center px-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Signal Status</span>
            <span className={`text-3xl font-extrabold tracking-tight mt-1 capitalize ${style.color}`}>
              {style.label}
            </span>
            <span className="text-xs text-slate-400 mt-1.5 px-2 line-clamp-2 leading-relaxed">
              {style.description}
            </span>
          </div>

          {/* Mini pulsing beacon inside ring */}
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              {isLogging && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentQuality === 'dead' || currentQuality === 'weak' ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${currentQuality === 'dead' || currentQuality === 'weak' ? 'bg-red-600' : 'bg-emerald-500'}`}></span>
            </span>
          </div>
        </div>
      </div>

      {/* Start/Stop Logging Toggle Button */}
      <div className="w-full max-w-md mx-auto mb-6 z-10 shrink-0">
        <button
          onClick={onToggleLogging}
          className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg active:scale-[0.98] ${
            isLogging
              ? 'bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-500/20 shadow-red-950/10'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/10'
          }`}
        >
          {isLogging ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>STOP LOGGING SESSION</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>START LOGGING SESSION</span>
            </>
          )}
        </button>
      </div>

      {/* Analytics Telemetry Cards Grid */}
      <div className="z-10 mx-auto grid w-full max-w-md grid-cols-1 gap-4 min-[380px]:grid-cols-2">
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Contribution</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-400">{sessionReadingsCount}</span>
            <span className="text-xs text-slate-400">points</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            Logged coordinates during this active map session.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GPS Accuracy</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-sky-400">
              {gpsAccuracy !== null ? gpsAccuracy.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">meters</span>
          </div>
          {gpsAccuracy !== null ? (
            <div className={`mt-2 text-[10px] font-semibold leading-relaxed ${gpsAccuracy <= 15 ? 'text-emerald-400' : gpsAccuracy <= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {gpsAccuracy <= 15 ? 'Excellent Accuracy' : gpsAccuracy <= 50 ? 'Moderate Accuracy' : 'Poor (skipped >50m)'}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Waiting for GPS coordinates...
            </p>
          )}
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connection Downlink</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-indigo-400">
              {currentConnectionDetails?.downlink ? currentConnectionDetails.downlink.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400">Mbps</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            Type: <span className="text-slate-200 font-semibold">{currentConnectionDetails?.effectiveType || 'Offline'}</span>
            {currentConnectionDetails?.rtt && ` | Latency: ${currentConnectionDetails.rtt}ms`}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Velocity</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-teal-400">{speedKmh}</span>
            <span className="text-xs text-slate-400">km/h</span>
          </div>
          <div className={`mt-2 text-[10px] font-semibold leading-relaxed ${currentSpeed > 20 ? 'text-red-400' : 'text-slate-400'}`}>
            {currentSpeed > 20 ? 'Driving Mode (>20m/s ignored)' : 'Pedestrian Speed'}
          </div>
        </div>
      </div>

      {/* Passive Logger Help Info */}
      <div className="mt-6 w-full max-w-md mx-auto z-10 glass-panel p-4 rounded-2xl border-slate-900/60 bg-slate-950/20 flex gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-200">Passive Tracking Rules</span>: Readings are automatically recorded when moving at least <span className="font-semibold text-slate-200">10 meters</span>. High-speed driving (&gt; 20 m/s) and poor GPS accuracy (&gt; 50m) are automatically skipped.
        </div>
      </div>
    </div>
  );
}
