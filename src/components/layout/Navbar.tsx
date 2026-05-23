"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, LogOut, Loader2, ChevronDown, UserCircle, Settings, Package, Heart, ShieldCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./ThemeToggle";
import { authService } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { STORE_NAVIGATION } from "@/config/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/use-cart-store";
import { CartDrawer } from "@/components/ui/cart-drawer";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isAuthenticated, logout, isHydrated, hasRole } = useAuth();
  const { itemCount, openDrawer, fetchCart } = useCartStore();
  const router = useRouter();

  const handleCartClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/shop");
      return;
    }
    openDrawer();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

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
          
          <button onClick={handleCartClick} className="relative p-2.5 hover:bg-muted rounded-xl transition-all" aria-label="Cart">
            <ShoppingCart size={20} strokeWidth={2} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
          
          <div className="h-6 w-px bg-border/50 mx-1" />

          {!isHydrated ? (
            <div className="w-24 h-9 bg-muted/50 animate-pulse rounded-2xl" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-muted rounded-2xl transition-all group outline-none">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all overflow-hidden border border-primary/20">
                      <User size={20} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col items-start hidden sm:flex">
                      <span className="text-xs font-bold leading-none">{user?.name?.split(' ')[0]}</span>
                      <span className="text-[10px] text-muted-foreground">Account</span>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-sm border-border bg-background/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                      <UserCircle size={18} className="text-muted-foreground group-hover:text-primary" />
                      <span className="font-semibold text-sm">Profile Details</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {!hasRole("Admin") && !hasRole("Seller") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                          <Package size={18} className="text-muted-foreground group-hover:text-primary" />
                          <span className="font-semibold text-sm">My Orders</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/account/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                          <Heart size={18} className="text-muted-foreground group-hover:text-primary" />
                          <span className="font-semibold text-sm">Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {(hasRole("Admin") || hasRole("Seller")) && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      {hasRole("Admin") && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                            <ShieldCheck size={18} className="text-muted-foreground group-hover:text-primary" />
                            <span className="font-semibold text-sm">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {hasRole("Seller") && (
                        <DropdownMenuItem asChild>
                          <Link href="/seller" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                            <LayoutDashboard size={18} className="text-muted-foreground group-hover:text-primary" />
                            <span className="font-semibold text-sm">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-border/50" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/account/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer hover:bg-primary/5 transition-colors group">
                      <Settings size={18} className="text-muted-foreground group-hover:text-primary" />
                      <span className="font-semibold text-sm">Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border/50" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer text-destructive hover:bg-destructive/5 transition-colors group"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )}
                    <span className="font-bold text-sm">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      <CartDrawer />
    </nav>
  );
}
