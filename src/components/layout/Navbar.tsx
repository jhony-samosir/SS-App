"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { authService } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { STORE_NAVIGATION } from "@/config/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isAuthenticated, logout, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
      setIsLoggingOut(false);
      router.refresh();
      router.push("/login");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get("q");
    if (query) {
      router.push(`/shop?search=${encodeURIComponent(query.toString())}`);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 bg-background/80 backdrop-blur-md border-b border-border/50",
        isScrolled ? "py-3 shadow-lg shadow-primary/5" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="SamStore Home">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-primary bg-primary/10 p-2 rounded-xl border border-primary/20"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 22a10 10 0 1 0-10-10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground font-sans leading-none">
              SamStore
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-primary mt-1">
              Snack Market
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {STORE_NAVIGATION.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hover:text-primary transition-colors py-2 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="hidden md:flex flex-grow max-w-md relative group"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
            <Search size={18} />
          </div>
          <input 
            name="q"
            type="text" 
            placeholder="Search for snacks..." 
            aria-label="Search snacks"
            className="w-full bg-muted/50 border border-border/50 focus:border-primary/20 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none"
          />
        </form>

        {/* Icons */}
        <div className="flex items-center gap-2 text-foreground">
          <ThemeToggle />
          
          <Link href="/cart" className="relative p-2.5 hover:bg-muted rounded-xl transition-all" aria-label="Cart">
            <ShoppingCart size={20} strokeWidth={2} />
            <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
              3
            </span>
          </Link>
          
          <div className="h-6 w-px bg-border/50 mx-1" />

          {!isHydrated ? (
            <div className="w-24 h-9 bg-muted/50 animate-pulse rounded-2xl" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/account/profile"
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-muted rounded-2xl transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-primary/20">
                  <User size={20} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium hidden sm:inline-block">Account</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2.5 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all group"
                title="Logout"
              >
                {isLoggingOut ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <LogOut size={20} strokeWidth={2} />
                )}
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 p-1.5 pr-3 hover:bg-muted rounded-2xl transition-all group">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-primary/20">
                <User size={20} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">Sign In</span>
            </Link>
          )}

          <button className="md:hidden p-2 hover:bg-muted rounded-xl">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

