import Link from "next/link";
import { AuthBackground } from "./AuthBackground";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background selection:bg-primary/20">
      <AuthBackground />

      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="mb-12">
          <Link href="/" className="flex flex-col items-center gap-3 group">
            <div className="text-primary bg-primary/10 p-4 rounded-[2rem] border border-primary/20 shadow-lg shadow-primary/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 22a10 10 0 1 0-10-10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold tracking-tight text-foreground font-sans leading-none">
                SamStore
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mt-2">
                Snack Market
              </span>
            </div>
          </Link>
        </div>

        {children}

        <div className="mt-12 text-xs text-muted-foreground font-medium flex items-center gap-4 animate-in fade-in duration-1000 delay-500">
          <span>&copy; {new Date().getFullYear()} SamStore Market</span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <div className="w-1 h-1 rounded-full bg-border" />
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
