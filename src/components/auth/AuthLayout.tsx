import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen w-full grid lg:grid-cols-2 bg-background selection:bg-primary/20 overflow-hidden">
      {/* Left Panel: Branding & Illustration */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-foreground/10 rounded-full blur-[100px] animate-pulse delay-700" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group/logo w-fit">
            <div className="bg-white/10 backdrop-blur-xl p-2.5 rounded-2xl border border-white/20 shadow-2xl group-hover/logo:bg-white group-hover/logo:text-primary transition-all duration-700 text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 22a10 10 0 1 0-10-10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
            <div className="flex flex-col drop-shadow-sm">
              <span className="text-xl font-black tracking-tight text-white font-sans leading-none">
                SamStore
              </span>
              <span className="text-[7px] font-black tracking-[0.4em] uppercase text-white/60 mt-1">
                Premium Snacks
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Typography Wall & Hero Text */}
        <div className="relative z-10 flex flex-col items-center justify-center grow overflow-hidden select-none">
          {/* Background Typography - More Subtle & Layered */}
          <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-x-8 gap-y-4 opacity-[0.07] pointer-events-none blur-[0.5px]">
            {["KERUPUK", "KERIPIK", "SAMSTORE", "SNACK", "JAJANAN", "PREMIUM", "LOCAL", "TRADITIONAL", "AUTHENTIC", "DELICIOUS", "CRUNCHY", "SWEET", "SPICY", "INDONESIA", "MARKET"].map((word, i) => {
              const textSizeClasses = ["text-3xl", "text-5xl", "text-7xl"];
              let index = 0;
              if (i % 3 === 0) {
                index = 2;
              } else if (i % 2 === 0) {
                index = 1;
              }
              const textSizeClass = textSizeClasses[index];

              return (
                <span
                  key={word}
                  className={cn(
                    "font-black tracking-tighter leading-none transition-all duration-1000",
                    i % 2 === 0 ? "text-white" : "text-primary-foreground",
                    textSizeClass
                  )}
                  style={{
                    transform: `rotate(${Math.sin(i) * 12}deg) translateY(${Math.cos(i) * 15}px)`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Centered Main Content - Premium Typography */}
          <div className="relative z-20 text-center space-y-6 max-w-lg animate-in zoom-in duration-1000">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/50 mb-2 block">
                The Art of Snacks
              </span>
              <h1 className="text-7xl font-medium tracking-tight text-white leading-[0.85] font-heading drop-shadow-2xl italic">
                Simplify store <br /> management.
              </h1>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-linear-to-r from-transparent to-white/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <div className="h-px w-12 bg-linear-to-l from-transparent to-white/40" />
            </div>

            <p className="text-lg text-white/90 font-medium leading-relaxed drop-shadow-lg max-w-sm mx-auto">
              Everything you need to scale your snack business in one intuitive, high-performance dashboard.
            </p>
          </div>
        </div>

        {/* Legal footer */}
        <div className="absolute bottom-6 right-12 z-10 text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} SamStore Market
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-95 flex flex-col items-center h-fit">
          {/* Mobile Logo / Brand Indicator */}
          <div className="mb-6 flex flex-col items-center gap-2 group cursor-pointer">
            <div className="text-primary bg-primary/5 p-3 rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 22a10 10 0 1 0-10-10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
            <span className="text-sm font-black tracking-widest text-foreground/80 uppercase">
              Auth Portal
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}



