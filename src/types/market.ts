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
export interface Market {
  _id: string;
  title: string;
  description?: string;
  outcomes: string[];
  endTime: string | Date;
  category: string;
  chainId: number;
  questionId: string;
  resolved: boolean;
  volume: number;
  outcomeSlotCount: number; // Added to match the dashboard analytics response mapping
  winner: string | null;
  blockNumber: number;
  createdAt: string;
}