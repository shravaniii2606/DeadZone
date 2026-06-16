import { useMemo } from 'react';
import { getHaversineDistance } from '../utils/haversine';
import { X, MapPin, AlertOctagon, ShieldAlert, Signal, Activity, TrendingUp } from 'lucide-react';

const QUALITY_INFO = {
  excellent: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' },
  good: { color: 'bg-emerald-400', text: 'text-emerald-300', label: 'Good' },
  moderate: { color: 'bg-amber-500', text: 'text-amber-400', label: 'Moderate' },
  weak: { color: 'bg-red-500', text: 'text-red-400', label: 'Weak' },
  dead: { color: 'bg-red-800', text: 'text-red-600', label: 'Dead Zone' },
};

// Rating configurations for overall zone evaluation
const RATING_THEMES = {
  dead: {
    bg: 'bg-red-950/40 border-red-900/40',
    text: 'text-red-500',
    title: 'Critical Dead Zone',
    desc: 'High density of zero-signal or slow-2G coverage. Calls and data will drop frequently.',
    icon: AlertOctagon,
  },
  weak: {
    bg: 'bg-red-950/20 border-red-900/30',
    text: 'text-red-400',
    title: 'Weak Coverage Zone',
    desc: '2G signal predominates. Data connection is slow and unreliable.',
    icon: ShieldAlert,
  },
  moderate: {
    bg: 'bg-amber-950/20 border-amber-900/30',
    text: 'text-amber-400',
    title: 'Moderate Coverage Zone',
    desc: '3G speeds. Suitable for basic messaging and standard voice calls, but slow for media.',
    icon: Signal,
  },
  good: {
    bg: 'bg-emerald-950/15 border-emerald-900/20',
    text: 'text-emerald-300',
    title: 'Good Coverage Zone',
    desc: 'Standard 4G signal. Reliable web browsing and video streaming.',
    icon: Activity,
  },
  excellent: {
    bg: 'bg-emerald-950/30 border-emerald-500/20',
    text: 'text-emerald-400',
    title: 'Excellent Coverage Zone',
    desc: 'Strong 4G+ signal. Superb data speeds, low latency, perfect for all tasks.',
    icon: TrendingUp,
  },
};

export default function AreaReport({
  selectedLocation,
  readings,
  onClose,
  isDrawer = false,
}) {
  // 1. Calculate statistics inside 100m radius
  const stats = useMemo(() => {
    if (!selectedLocation || !readings.length) {
      return { total: 0, breakdown: {}, rating: null, percentages: {} };
    }

    let total = 0;
    const counts = { excellent: 0, good: 0, moderate: 0, weak: 0, dead: 0 };

    readings.forEach((r) => {
      const dist = getHaversineDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        r.lat,
        r.lng
      );
      
      // Within 100 meters
      if (dist <= 100) {
        total++;
        if (counts[r.quality] !== undefined) {
          counts[r.quality]++;
        }
      }
    });

    if (total === 0) {
      return { total: 0, breakdown: counts, rating: null, percentages: {} };
    }

    // Calculate percentages
    const percentages = {};
    Object.keys(counts).forEach((key) => {
      percentages[key] = (counts[key] / total) * 100;
    });

    // Solve rating: Worst category that has more than 20% share wins
    // Ordering from worst to best
    const worstToBest = ['dead', 'weak', 'moderate', 'good', 'excellent'];
    let rating = 'excellent'; // Default fallback

    for (const category of worstToBest) {
      if (percentages[category] > 20) {
        rating = category;
        break;
      }
    }

    return {
      total,
      breakdown: counts,
      percentages,
      rating,
    };
  }, [selectedLocation, readings]);

  if (!selectedLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
        <MapPin className="w-12 h-12 text-slate-600 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-300">No Location Selected</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Tap any point on the map screen or toggle GPS logging to generate an area network quality report.
        </p>
      </div>
    );
  }

  const hasData = stats.total > 0;
  const RatingIcon = stats.rating ? RATING_THEMES[stats.rating].icon : null;
  const ratingTheme = stats.rating ? RATING_THEMES[stats.rating] : null;

  const content = (
    <div className="flex flex-col h-full w-full">
      {/* Title / Anchor Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="text-lg font-bold text-slate-200">Area Network Report</h3>
            <p className="text-[10px] text-slate-400">
              Covers 100m radius around selected coordinates
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4 pr-1">
        {/* Lat Lng display */}
        <div className="text-xs text-slate-500 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-900 flex justify-between shrink-0">
          <span>LAT: {selectedLocation.lat.toFixed(6)}</span>
          <span>LNG: {selectedLocation.lng.toFixed(6)}</span>
        </div>

        {hasData ? (
          <>
            {/* Overall Rating Widget */}
            <div className={`p-4 rounded-xl border ${ratingTheme.bg} flex gap-3.5 transition-all duration-300 shrink-0`}>
              <div className={`p-2 rounded-lg bg-slate-950/50 ${ratingTheme.text} shrink-0 h-10 w-10 flex items-center justify-center`}>
                <RatingIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-wide ${ratingTheme.text}`}>
                  {ratingTheme.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {ratingTheme.desc}
                </p>
              </div>
            </div>

            {/* Total Readings count */}
            <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/30 px-3 py-2 rounded-lg shrink-0">
              <span>Sample Density</span>
              <span className="font-semibold text-slate-200">{stats.total} signal points logged</span>
            </div>

            {/* Quality breakdown progress bars */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Signal Mix Breakdown
              </h4>
              <div className="space-y-3">
                {['excellent', 'good', 'moderate', 'weak', 'dead'].map((key) => {
                  const pct = stats.percentages[key] || 0;
                  const count = stats.breakdown[key] || 0;
                  const info = QUALITY_INFO[key];

                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-slate-300">{info.label}</span>
                        <span className="text-slate-400">
                          {pct.toFixed(0)}% <span className="text-[10px] text-slate-600">({count} pts)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className={`h-full rounded-full ${info.color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center p-4">
            <AlertOctagon className="w-10 h-10 text-slate-600 mb-2" />
            <h5 className="text-sm font-semibold text-slate-300">No Coverage Data</h5>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
              We couldn't find any logged points in this 100-meter zone. Ensure you are logging and move towards this zone to automatically populate it!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // If rendering inside the map as a slide-up drawer
  if (isDrawer) {
    return (
      <div className="absolute left-4 right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 glass-panel-heavy flex max-h-[70%] flex-col rounded-2xl p-5 shadow-2xl shadow-black/80 animate-[slideUp_0.3s_ease-out]">
        {content}
      </div>
    );
  }

  // Otherwise, render as full screen page in tab layout
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-slate-950 p-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-slate-100">
      {content}
    </div>
  );
}
