import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#111d3a] to-[#0c1428] border border-[#1e3a5f] rounded-2xl p-6 md:p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1e3a8a]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3b82f6]/10 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Make Your Predictions?</h2>
            <p className="text-gray-400 mb-6 md:mb-8 max-w-lg mx-auto text-sm md:text-base">
              Join a growing community of traders making informed predictions on the world&apos;s biggest sporting events. No sign-up required — just connect your wallet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/markets"
                className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25 text-center"
              >
                Browse Markets
              </Link>
              <Link
                href="/faq"
                className="w-full sm:w-auto px-10 py-3 border border-gray-500 text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-colors text-center"
              >
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
