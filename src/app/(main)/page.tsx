import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Reviews } from "@/components/home/Reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustSignals />
      <Categories />
      <FeaturedProducts />
      <SpecialOffers />
      <Reviews />
    </>
  );
}
