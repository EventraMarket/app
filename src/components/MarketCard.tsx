import Link from "next/link";
import { formatDate } from "@/lib/rain";

interface GameCardProps {
  game: {
    gameId: string;
    title: string;
    startsAt: string;
    sport: { name: string };
    league: { name: string };
    participants: { name: string; image?: string }[];
  };
}

export default function MarketCard({ game }: GameCardProps) {
  const isLive = Number(game.startsAt) * 1000 < Date.now();

  return (
    <div className="relative bg-gradient-to-b from-[#111d3a] to-[#0c1428] border border-[#1e3a5f] rounded-xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 hover:border-[#3b82f6]/50 transition-colors group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Status + Sport badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
              isLive
                ? "text-green-400 border-green-400/30 bg-green-400/10"
                : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
            }`}
          >
            {isLive ? "Live" : "Upcoming"}
          </span>
          <span className="text-xs text-gray-500">{game.sport.name}</span>
        </div>

        {/* Game title / participants */}
        <h3 className="text-white font-semibold text-base leading-snug min-h-[48px]">
          {game.title ||
            game.participants.map((p) => p.name).join(" vs ")}
        </h3>

        {/* League + time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{game.league.name}</span>
          <span>{formatDate(Number(game.startsAt))}</span>
        </div>

        {/* Participants */}
        {game.participants.length >= 2 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0a1628] rounded-lg px-3 py-2 border border-[#1e3a5f] text-center">
              <span className="text-sm font-semibold text-white">
                {game.participants[0]?.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-bold">VS</span>
            <div className="flex-1 bg-[#0a1628] rounded-lg px-3 py-2 border border-[#1e3a5f] text-center">
              <span className="text-sm font-semibold text-white">
                {game.participants[1]?.name}
              </span>
            </div>
          </div>
        )}

        {/* Trade Now button */}
        <Link
          href={`/market/${game.gameId}`}
          className="mt-2 w-full py-2.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/20 text-sm text-center block"
        >
          Trade Now
        </Link>
      </div>
    </div>
  );
}
