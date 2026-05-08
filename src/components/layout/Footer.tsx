import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { ElementType, SVGProps } from "react";

// Brand icons are not available in this version of lucide-react, so we define them as custom SVG components
const Facebook = (props: SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Twitter = (props: SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const Instagram = (props: SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const Youtube = (props: SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"/><polyline points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>;

interface SocialIcon {
  Icon: ElementType;
  label: string;
}

const socialIcons: SocialIcon[] = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "Youtube" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <span className="text-xl font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                SamStore
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Bringing the authentic taste of local Indonesian snacks to your doorstep. Quality, tradition, and the perfect crunch in every bite.
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map(({ Icon, label }, i) => (
                <Link key={i} href="#" aria-label={label} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest">Shop</h4>
            <ul className="space-y-3">
              {["All Snacks", "Best Sellers", "New Arrivals", "Special Offers"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-3">
              {["Contact Us", "Shipping Info", "Returns", "FAQ"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-foreground font-bold mb-6 text-sm uppercase tracking-widest">Join the Club</h4>
            <p className="text-muted-foreground text-sm mb-4">Subscribe to get special offers and snack news.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-muted border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full"
              />
              <button className="bg-foreground text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-foreground/90 transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-muted-foreground font-medium">
          <p>© 2026 SamStore Market. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
