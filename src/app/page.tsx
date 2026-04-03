import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 dashboard-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] pointer-events-none" />
      
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <section className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-500">
                Pencatat Wang / Alpha Core
              </p>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1] bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                Control your <br /> cashflow in one <br /> simple chat.
              </h1>
              <p className="max-w-md text-lg text-slate-400 font-medium leading-relaxed">
                CatatWang transforms WhatsApp messages into high-fidelity financial intelligence
                with autonomous parsing and real-time visualization.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                className="group relative rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                href="/sign-up"
              >
                DAFTAR SEKARANG
              </Link>
              <Link
                className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95"
                href="/sign-in"
              >
                LOGIN
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-500/5 blur-[80px] rounded-full" />
            <div className="relative rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-2xl shadow-2xl glow-card">
              <div className="space-y-4 rounded-[2rem] bg-slate-950 p-6 border border-slate-800/50 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Interface / WhatsApp_v2</p>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-500/50" />
                    <div className="h-2 w-2 rounded-full bg-amber-500/50" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="inline-block rounded-2xl rounded-tl-none bg-slate-800 px-5 py-3 border border-slate-700">
                      <p className="text-sm text-slate-200 font-medium">jajan 25k bakso urat</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
                    <div className="inline-block rounded-2xl rounded-tr-none bg-emerald-600 px-5 py-3 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <p className="text-sm font-semibold">Tercatat: Rp 25.000 / Bakso Urat</p>
                      <p className="text-[10px] mt-1 opacity-70 font-mono">STATUS: TERSEDIA</p>
                    </div>
                  </div>

                  <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-1000">
                    <div className="inline-block rounded-2xl rounded-tl-none bg-slate-800 px-5 py-3 border border-slate-700">
                      <p className="text-sm text-slate-200 font-medium">gaji masuk 15m</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500 delay-[1300ms]">
                    <div className="inline-block rounded-2xl rounded-tr-none bg-emerald-600 px-5 py-3 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <p className="text-sm font-semibold">Tercatat: Rp 15.000.000 / Gaji</p>
                      <p className="text-[10px] mt-1 opacity-70 font-mono">STATUS: BERHASIL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
