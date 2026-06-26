import { useRouter } from "next/router";
import { formatDate } from "@/lib/rain";
import { getChainName } from "@/lib/useMarkets";

interface GameCardProps {
  game: {
    gameId?: string;
    conditionId?: string;
    title: string;
    startsAt?: string;
    createdAt?: string;
    chainId?: number;
    chainName?: string;
    sport?: { name: string };
    league?: { name: string };
    participants?: { name: string; image?: string | null }[];
    category?: string;
    outcomes?: string[];
    resolved?: boolean;
  };
  highlight?: boolean;
  onClick?: () => void;
}

export default function MarketCard({ game, highlight, onClick }: GameCardProps) {
  const router = useRouter();
  const timestamp: number = game.startsAt ? Number(game.startsAt) * 1000 : (game.createdAt ? new Date(game.createdAt).getTime() : Date.now());
  const isLive = timestamp < Date.now();
  // conditionId first — it's the canonical on-chain identifier the market
  // detail page actually looks up by. gameId here is really m.questionId
  // (see useMarkets.ts), so using it as a fallback-first ID was sending
  // people to /market/<questionId>, which legitimately doesn't exist.
  const marketId = game.conditionId ?? game.gameId;
  const outcomes = game.outcomes ?? game.participants?.map((p) => p.name) ?? ["Yes", "No"];
  const yesLabel = outcomes[0] ?? "Yes";
  const noLabel = outcomes[1] ?? "No";
  const chainName = game.chainName || game.league?.name || getChainName(game.chainId);

  const handleClick = () => {
    if (onClick) {
      // Let the parent (e.g. markets.tsx) decide navigation when it
      // explicitly provides a handler.
      onClick();
    } else if (marketId) {
      router.push(`/market/${marketId}?chainId=${game.chainId || 84532}`);
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full rounded-lg border border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm overflow-hidden ${marketId ? "cursor-pointer group" : "cursor-not-allowed opacity-50"} transition-all duration-300 ${marketId ? "hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-1" : ""}`}
      onClick={handleClick}
    >
      {/* Chain badge - top right */}
      <div className="absolute top-2 right-2 z-10">
        <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 text-xs font-bold text-blue-200">
          {chainName}
        </div>
      </div>

      {/* Card content padding */}
      <div className="flex flex-col h-full p-4 gap-3">
        {/* Header with status and category */}
        <div className="flex items-start justify-between gap-2 pr-20">
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  game.resolved
                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                    : isLive
                    ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                    : "text-gray-400 border-gray-400/30 bg-gray-400/10"
                }`}
              >
                {game.resolved ? "✓ Resolved" : isLive ? "● LIVE" : "Upcoming"}
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-400">
              {game.category ?? game.sport?.name ?? "Prediction"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-h-[3.5rem]">
          <h3 className="text-white font-bold text-sm leading-tight">
            {game.title || game.participants?.map((p) => p.name).join(" vs ") || "Untitled Market"}
          </h3>
        </div>

        {/* Outcome buttons - Polymarket style */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (marketId) router.push(`/market/${marketId}?outcome=${encodeURIComponent(yesLabel.toLowerCase())}&chainId=${game.chainId || 84532}`);
            }}
            className="flex-1 py-2.5 bg-green-500/15 border border-green-500/40 rounded text-xs font-semibold text-green-300 hover:bg-green-500/25 hover:border-green-400/60 transition-all duration-200"
          >
            <div className="font-bold">{yesLabel}</div>
            <div className="text-[10px] opacity-75">50¢</div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (marketId) router.push(`/market/${marketId}?outcome=${encodeURIComponent(noLabel.toLowerCase())}&chainId=${game.chainId || 84532}`);
            }}
            className="flex-1 py-2.5 bg-red-500/15 border border-red-500/40 rounded text-xs font-semibold text-red-300 hover:bg-red-500/25 hover:border-red-400/60 transition-all duration-200"
          >
            <div className="font-bold">{noLabel}</div>
            <div className="text-[10px] opacity-75">50¢</div>
          </button>
        </div>

        {/* Footer with date */}
        <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-700/50">
          <span>{formatDate(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}