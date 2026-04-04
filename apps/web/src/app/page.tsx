import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "./sections/hero-section";
import { FeaturedHotels } from "./sections/featured-hotels";
import { PopularDestinations } from "./sections/popular-destinations";
import { WhyChooseUs } from "./sections/why-choose-us";
import { Testimonials } from "./sections/testimonials";
import { CTASection } from "./sections/cta-section";

/**
 * Homepage Metadata for SEO
 */
export const metadata: Metadata = {
  title: "Book Your Stay — Best Rates Direct",
  description:
    "Browse rooms, check availability, and book your stay at the best prices. Direct booking with the hotel.",
  keywords: [
    "hotel",
    "book rooms",
    "direct booking",
    "hotel booking",
    "accommodation",
  ],
  openGraph: {
    title: "Book Your Stay — Best Rates Direct",
    description:
      "Browse rooms, check availability, and book your stay at the best prices.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Book Your Stay",
      },
    ],
  },
};

/**
 * Homepage Component
 * 
 * Main landing page featuring:
 * - Hero section with search widget
 * - Featured hotels carousel
 * - Popular destinations grid
 * - Why choose us section
 * - Testimonials
 * - CTA for hotel partners
 */
export default function HomePage() {
  return (
    <>
      <Header />
      
      <main>
        {/* Hero with search */}
        <HeroSection />
        
        {/* Featured Hotels */}
        <FeaturedHotels />
        
        {/* Popular Destinations */}
        <PopularDestinations />
        
        {/* Why Choose Us */}
        <WhyChooseUs />
        
        {/* Guest Testimonials */}
        <Testimonials />
        
        {/* Partner CTA */}
        <CTASection />
      </main>
      
      <Footer />
    </>
  );
}
