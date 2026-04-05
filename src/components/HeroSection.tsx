import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-24 md:pt-32 pb-16 md:pb-20 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0d1529] to-[#0a0e1a]" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#1e3a8a]/20 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-2">
        {/* Logo */}
        <div className="mb-6 md:mb-8">
          <Image
            src="/logo-predict.png"
            alt="Prediction Market Logo"
            width={200}
            height={200}
            className="w-32 h-32 md:w-[200px] md:h-[200px]"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wider text-white mb-3 md:mb-4">
          PREDICTION MARKET
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-base md:text-lg mb-8 md:mb-10 max-w-sm md:max-w-md">
          Trade on the outcome of real-world sports &amp; esports events — powered by Azuro Protocol
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link href="/markets" className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25 text-center">
            Start Trading
          </Link>
          <Link href="/how-it-works" className="w-full sm:w-auto px-8 py-3 border border-gray-500 text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors text-center">
            Learn More
          </Link>
        </div>
      </div>

      {/* Bottom wave / divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120 L0 80 Q360 20 720 60 Q1080 100 1440 40 L1440 120 Z"
            fill="url(#waveGrad)"
          />
          <defs>
            <linearGradient
              id="waveGrad"
              x1="0"
              y1="0"
              x2="1440"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0a0e1a" />
              <stop offset="0.5" stopColor="#111d3a" />
              <stop offset="1" stopColor="#0a0e1a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
