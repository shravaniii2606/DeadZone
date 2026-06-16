import { MapPin, Play, Radio } from 'lucide-react';
import heroImage from '../assets/hero.png';

export default function LandingScreen({ onStart }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />

      <section className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-slate-950/70 text-emerald-300 shadow-lg shadow-black/30">
            <Radio className="h-6 w-6" />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.24em] text-slate-200">
            Signal Mapper
          </span>
        </div>

        <div className="w-full max-w-xl pb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            <MapPin className="h-4 w-4" />
            Live coverage tracking
          </div>

          <h1 className="text-5xl font-extrabold leading-none text-white sm:text-6xl">
            DEADZONE
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-200">
            Map weak network spots, reliable areas, and signal changes as you move.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-4 text-base font-bold text-slate-950 shadow-xl shadow-emerald-950/40 transition hover:bg-emerald-300 active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Start</span>
          </button>
        </div>
      </section>
    </main>
  );
}
