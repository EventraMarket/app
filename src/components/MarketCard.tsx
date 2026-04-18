import Link from "next/link";
import { formatDate } from "@/lib/rain";

interface GameCardProps {
  game: {
    gameId: string;
    title: string;
    startsAt: string;
    sport: { name: string };
    league: { name: string };
    participants: { name: string; image?: string | null }[];
  };
}

export default function MarketCard({ game }: GameCardProps) {
  const isLive = Number(game.startsAt) * 1000 < Date.now();

  return (
    <div className="card relative flex flex-col gap-4 group transition-shadow transform-gpu duration-200 hover:scale-[1.03] hover:shadow-2xl">
      <div className="absolute inset-0 rounded-[var(--radius-lg)] bg-gradient-to-b from-[var(--color-accent2)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Status + Sport badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
              isLive
                ? "text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success)]/10"
                : "text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10"
            }`}
          >
            {isLive ? "Live" : "Upcoming"}
          </span>
          <span className="text-xs text-muted">{game.sport.name}</span>
        </div>

        {/* Game title / participants */}
        <h3 className="text-[var(--color-foreground)] font-semibold text-base leading-snug min-h-[48px]">
          {game.title ||
            game.participants.map((p) => p.name).join(" vs ")}
        </h3>

        {/* League + time */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{game.league.name}</span>
          <span>{formatDate(Number(game.startsAt))}</span>
        </div>

        {/* Participants */}
        {game.participants.length >= 2 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[var(--color-background)] rounded-[var(--radius-md)] px-3 py-2 border border-[var(--color-border)] text-center">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {game.participants[0]?.name}
              </span>
            </div>
            <span className="text-xs text-muted font-bold">VS</span>
            <div className="flex-1 bg-[var(--color-background)] rounded-[var(--radius-md)] px-3 py-2 border border-[var(--color-border)] text-center">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {game.participants[1]?.name}
              </span>
            </div>
          </div>
        )}

        {/* Trade Now button */}
        <Link
          href={`/market/${game.gameId}`}
          className="mt-2 w-full btn text-center block"
        >
          Trade Now
        </Link>
      </div>
    </div>
  );
}
