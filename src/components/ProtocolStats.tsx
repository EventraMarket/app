import { useChainId } from "wagmi";

export default function ProtocolStats() {
  const chainId = useChainId();

  const items = [
    { label: "Network", value: "Polygon Amoy" },
    { label: "Bet Token", value: "USDC" },
    { label: "Chain ID", value: chainId.toString() },
    { label: "Environment", value: "Testnet" },
    { label: "Protocol", value: "CTF" },
  ];

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="bg-black border border-[#D9A650]/50 rounded-xl p-4 md:p-5 text-center hover:border-[#F3B21A]/30 transition-colors"
            >
              <p className="text-lg md:text-2xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-[10px] md:text-xs text-[#D9A650]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
