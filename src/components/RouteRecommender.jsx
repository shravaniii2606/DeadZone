import { useState } from 'react';
import { Flag, LocateFixed, Route, Sparkles } from 'lucide-react';

const routes = [
  {
    name: 'Route A',
    corridor: 'Western Express Highway',
    score: '94%',
    badge: 'RECOMMENDED',
    badgeIcon: '✓',
    border: 'border-emerald-400/70',
    glow: 'shadow-emerald-500/15',
    scoreColor: 'text-emerald-300',
    badgeStyle: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    tags: ['Excellent', 'Good', 'Moderate'],
    tagStyles: [
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
      'border-amber-500/30 bg-amber-500/10 text-amber-300',
    ],
    detail: 'Strong 4G coverage throughout. Ideal for video calls and navigation.',
    prominent: true,
  },
  {
    name: 'Route B',
    corridor: 'SV Road',
    score: '61%',
    badge: 'AVOID',
    badgeIcon: '!',
    border: 'border-red-500/60',
    glow: 'shadow-red-500/10',
    scoreColor: 'text-red-300',
    badgeStyle: 'border-red-500/40 bg-red-500/10 text-red-300',
    tags: ['Dead Zone', 'Weak', 'Moderate'],
    tagStyles: [
      'border-red-500/30 bg-red-500/10 text-red-300',
      'border-orange-500/30 bg-orange-500/10 text-orange-300',
      'border-amber-500/30 bg-amber-500/10 text-amber-300',
    ],
    detail: 'Frequent signal drops near Borivali and Kandivali stretch.',
    prominent: false,
  },
];

const tagDots = ['bg-emerald-400', 'bg-emerald-300', 'bg-amber-400'];
const avoidDots = ['bg-red-500', 'bg-orange-400', 'bg-amber-400'];

export default function RouteRecommender() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('idle');

  const handleAnalyze = () => {
    setStatus('loading');
    window.setTimeout(() => {
      setStatus('results');
    }, 2000);
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-y-auto bg-slate-950 p-5 pb-[calc(7rem+env(safe-area-inset-bottom))] text-slate-100">
      <div className="pointer-events-none absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight">Route Recommender</h2>
          <p className="text-xs text-slate-400">Compare demo signal quality across common routes</p>
        </div>

        <section className="glass-panel mx-auto w-full max-w-md rounded-2xl border-slate-800/80 p-4 shadow-xl shadow-black/20">
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 focus-within:border-cyan-400/70">
              <LocateFixed className="h-5 w-5 shrink-0 text-cyan-300" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">From</span>
                <input
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  placeholder="Type start location..."
                  className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600"
                />
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 focus-within:border-cyan-400/70">
              <Flag className="h-5 w-5 shrink-0 text-emerald-300" />
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">To</span>
                <input
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  placeholder="Type destination..."
                  className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600"
                />
              </div>
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={status === 'loading'}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-4 text-sm font-extrabold tracking-wide text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:bg-cyan-300 active:scale-[0.98] disabled:cursor-wait disabled:bg-cyan-500/60"
          >
            <Sparkles className="h-4 w-4" />
            ANALYZE SIGNAL QUALITY
          </button>
        </section>

        {status === 'loading' && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5">
              <div className="absolute h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-cyan-300" />
              <Route className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">Analyzing routes...</p>
              <p className="mt-1 text-xs text-slate-500">Scoring signal stability, drops, and coverage density</p>
            </div>
          </div>
        )}

        {status === 'results' && (
          <div className="mt-5 grid gap-4 md:grid-cols-[1.12fr_0.88fr] md:items-stretch">
            {routes.map((route) => {
              const dots = route.prominent ? tagDots : avoidDots;

              return (
                <article
                  key={route.name}
                  className={`rounded-2xl border bg-slate-900/60 ${route.border} ${route.glow} ${
                    route.prominent ? 'p-5 shadow-2xl' : 'p-4 opacity-90 shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{route.name}</p>
                      <h3 className={`${route.prominent ? 'text-xl' : 'text-lg'} mt-1 font-extrabold tracking-tight text-white`}>
                        {route.corridor}
                      </h3>
                    </div>
                    <div className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${route.badgeStyle}`}>
                      <span className="mr-1">{route.badgeIcon}</span>
                      {route.badge}
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Signal Score</span>
                      <div className={`${route.prominent ? 'text-5xl' : 'text-4xl'} font-black leading-none ${route.scoreColor}`}>
                        {route.score}
                      </div>
                    </div>
                    {route.prominent && (
                      <div className="hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-right min-[380px]:block">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Best Route</p>
                        <p className="text-[10px] text-slate-400">Lowest drop risk</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {route.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${route.tagStyles[index]}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${dots[index]}`} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className={`${route.prominent ? 'mt-4 text-sm' : 'mt-3 text-xs'} leading-relaxed text-slate-300`}>
                    {route.detail}
                  </p>
                </article>
              );
            })}

            <p className="pt-1 text-center text-[11px] font-medium text-slate-500 md:col-span-2">
              Based on 2,847 signal readings along these routes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
