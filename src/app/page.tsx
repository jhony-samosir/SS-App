import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Reviews } from "@/components/home/Reviews";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TrustSignals />
        <Categories />
        <FeaturedProducts />
        <SpecialOffers />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}