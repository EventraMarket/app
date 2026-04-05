// Azuro game data shape (from useGames hook)
export interface GameCardData {
  id: string;
  gameId: string;
  slug: string;
  title: string;
  startsAt: string;
  state: string;
  turnover: string;
  sport: { sportId: string; slug: string; name: string };
  league: { slug: string; name: string };
  country: { slug: string; name: string };
  participants: { name: string; image?: string | null }[];
}
