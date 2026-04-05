import { Geist } from "next/font/google";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendingMarkets from "@/components/TrendingMarkets";
import ProtocolStats from "@/components/ProtocolStats";
import HowItWorksPreview from "@/components/HowItWorksPreview";
import WhyChooseUs from "@/components/WhyChooseUs";
import SupportedMarkets from "@/components/SupportedMarkets";
import CTASection from "@/components/CTASection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}
    >
      <Navbar />
      <HeroSection />
      <ProtocolStats />
      <TrendingMarkets />
      <HowItWorksPreview />
      <WhyChooseUs />
      <SupportedMarkets />
      <CTASection />
    </div>
  );
}
