"use client";

import Link from "next/link";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { FOOTER_NAVIGATION } from "@/config/navigation";

const socialIcons = [
  { name: "Instagram", label: "Instagram" },
  { name: "Twitter", label: "Twitter" },
  { name: "Facebook", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-8 group" aria-label="SamStore Home">
              <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all border border-primary/20">
                <span className="text-2xl font-bold font-sans">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground font-sans">
                  SamStore
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-primary mt-0.5">
                  Market
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
              Bringing the authentic taste of local Indonesian snacks to your doorstep. Quality, tradition, and the perfect crunch.
            </p>
            <div className="flex items-center gap-4">
              {socialIcons.map(({ name, label }) => (
                <Link 
                  key={name} 
                  href="#" 
                  aria-label={`Follow us on ${label}`}
                  className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all group shadow-sm"
                >
                  <DynamicIcon name={name} className="w-4 h-4 transition-transform group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-foreground font-bold mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/40" />
              Shop
            </h4>
            <ul className="space-y-4">
              {FOOTER_NAVIGATION.shop.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-primary transition-all group-hover:w-3 rounded-full" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground font-bold mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary/40"/>
              Support
            </h4>
            <ul className="space-y-4">
              {FOOTER_NAVIGATION.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-all text-sm font-medium flex items-center gap-2 group">
                    <span className="w-0 h-0.5 bg-secondary transition-all group-hover:w-3 rounded-full" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-foreground font-bold mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/40" />
              Join the Club
            </h4>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Subscribe to get special offers and snack news.</p>
            <form 
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-3"
            >
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  aria-label="Email address for newsletter"
                  required
                  className="bg-muted/50 border border-border/50 rounded-xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none w-full transition-all"
                />
              </div>
              <button 
                type="submit"
                className="bg-foreground text-background px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-foreground/90 transition-all shadow-xl shadow-foreground/5 active:scale-95"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-8 text-[13px] text-muted-foreground font-medium">
          <p>© 2026 SamStore Market. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
