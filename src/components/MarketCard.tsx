import { useRouter } from "next/router";
import { formatDate } from "@/lib/rain";

interface GameCardProps {
  game: {
    gameId: string;
    title: string;
    startsAt: string;
    sport: { name: string };
    league: { name: string };
    participants: { name: string; image?: string | null }[];
    category?: string;
    outcomes?: string[];
    resolved?: boolean;
  };
  highlight?: boolean;
}

export default function MarketCard({ game, highlight }: GameCardProps) {
  const router = useRouter();
  const isLive = Number(game.startsAt) * 1000 < Date.now();
  const outcomes = game.outcomes ?? game.participants.map((p) => p.name);
  const yesLabel = outcomes[0] ?? "Yes";
  const noLabel = outcomes[1] ?? "No";

  return (
    <div
      className={`card relative flex flex-col gap-2.5 cursor-pointer group transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:border-[#F3B21A]/60${highlight ? " mic-effect-highlight" : ""}`}
      onClick={() => router.push(`/market/${game.gameId}`)}
    >
      {/* Status + Category */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
            game.resolved
              ? "text-green-400 border-green-400/30 bg-green-400/10"
              : isLive
              ? "text-[#F3B21A] border-[#F3B21A]/30 bg-[#F3B21A]/10"
              : "text-[#D9A650] border-[#D9A650]/30 bg-[#D9A650]/10"
          }`}
        >
          {game.resolved ? "Resolved" : isLive ? "● Live" : "Upcoming"}
        </span>
        <span className="text-[10px] font-medium text-[#D9A650]/60 truncate">
          {game.category ?? game.sport.name}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-sm leading-snug flex-1">
        {game.title || game.participants.map((p) => p.name).join(" vs ")}
      </h3>

      {/* Yes / No outcome buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/market/${game.gameId}?outcome=${encodeURIComponent(yesLabel.toLowerCase())}`);
          }}
          className="flex-1 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-xs font-semibold text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all"
        >
          {yesLabel} <span className="font-normal opacity-70">50¢</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/market/${game.gameId}?outcome=${encodeURIComponent(noLabel.toLowerCase())}`);
          }}
          className="flex-1 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all"
        >
          {noLabel} <span className="font-normal opacity-70">50¢</span>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-[#D9A650]/40 border-t border-[#D9A650]/10 pt-1.5">
        <span>{game.league.name}</span>
        <span>{formatDate(Number(game.startsAt))}</span>
      </div>
    </div>
  );
}
