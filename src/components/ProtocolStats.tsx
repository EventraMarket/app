import { useChain } from "@azuro-org/sdk";

export default function ProtocolStats() {
  const { appChain, betToken } = useChain();

  const items = [
    { label: "Network", value: appChain.name },
    { label: "Bet Token", value: betToken.symbol },
    { label: "Chain ID", value: appChain.id.toString() },
    { label: "Environment", value: "Testnet" },
    { label: "Protocol", value: "Azuro" },
  ];

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-4 md:p-5 text-center hover:border-[#3b82f6]/30 transition-colors"
            >
              <p className="text-lg md:text-2xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-[10px] md:text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
