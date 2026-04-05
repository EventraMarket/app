import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useGame, useActiveConditions, useOdds, useBet, useChain } from "@azuro-org/sdk";
import { useWallet } from "@/context/WalletContext";
import { formatDate } from "@/lib/rain";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const AFFILIATE = (process.env.NEXT_PUBLIC_AFFILIATE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

interface SelectedOutcome {
  conditionId: string;
  outcomeId: string;
  selectionName: string;
}

export default function MarketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const gameId = typeof id === "string" ? id : "";
  const { address, isConnected, connecting, connect } = useWallet();
  const chain = useChain();

  // Fetch game details
  const { data: game, isFetching: gameLoading, error: gameError } = useGame({ gameId });

  // Fetch active conditions (includes core.address needed for betting)
  const { data: conditions, isFetching: conditionsLoading } = useActiveConditions({ gameId });

  // Betting state
  const [betAmount, setBetAmount] = useState("10");
  const [selected, setSelected] = useState<SelectedOutcome | null>(null);
  const [betSuccess, setBetSuccess] = useState(false);

  // Build selection for useOdds
  const selections = useMemo(() => {
    if (!selected) return [];
    return [{ conditionId: selected.conditionId, outcomeId: selected.outcomeId }];
  }, [selected]);

  const { data: oddsData } = useOdds({ selections });

  const odds = oddsData?.odds ?? {};
  const totalOdds = oddsData?.totalOdds ?? 0;

  // useBet hook
  const {
    isAllowanceLoading,
    isApproveRequired,
    submit,
    approveTx,
    betTx,
  } = useBet({
    betAmount,
    slippage: 10,
    affiliate: AFFILIATE,
    selections: selected
      ? [{ conditionId: selected.conditionId, outcomeId: selected.outcomeId }]
      : [],
    odds,
    totalOdds,
    onSuccess: () => {
      setBetSuccess(true);
      setSelected(null);
    },
    onError: (err) => {
      console.error("Bet error:", err);
    },
  });

  const isLoading = gameLoading || conditionsLoading;
  const isBetting = approveTx?.isPending || approveTx?.isProcessing || betTx?.isPending || betTx?.isProcessing;

  function selectOutcome(conditionId: string, outcomeId: string, selectionName: string) {
    setBetSuccess(false);
    if (selected?.conditionId === conditionId && selected?.outcomeId === outcomeId) {
      setSelected(null);
    } else {
      setSelected({ conditionId, outcomeId, selectionName });
    }
  }

  const stateColor = (state: string) => {
    const map: Record<string, string> = {
      Prematch: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
      Live: "text-green-400 border-green-400/30 bg-green-400/10",
      Finished: "text-red-400 border-red-400/30 bg-red-400/10",
      Canceled: "text-gray-400 border-gray-400/30 bg-gray-400/10",
      Stopped: "text-orange-400 border-orange-400/30 bg-orange-400/10",
    };
    return map[state] || "text-gray-400 border-gray-400/30 bg-gray-400/10";
  };

  const title = game?.title || game?.participants?.map((p) => p.name).join(" vs ") || "Loading...";

  return (
    <div className={`${geistSans.className} min-h-screen bg-[#060a14] text-white`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/markets" className="hover:text-[#3b82f6] transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{title}</span>
        </div>

        {isLoading && !game && (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-[#1e3a5f] rounded w-2/3" />
            <div className="h-4 bg-[#1e3a5f] rounded w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="h-64 bg-[#111d3a] border border-[#1e3a5f] rounded-xl" />
              <div className="h-64 bg-[#111d3a] border border-[#1e3a5f] rounded-xl" />
            </div>
          </div>
        )}

        {gameError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">Failed to load game details. Please try again.</p>
            <button
              onClick={() => router.reload()}
              className="px-6 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {game && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">{title}</h1>
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${stateColor(game.state)}`}>
                      {game.state}
                    </span>
                    <span className="text-xs text-gray-500">{game.sport?.name}</span>
                    <span className="text-xs text-gray-500">• {game.league?.name}</span>
                    {game.country?.name && (
                      <span className="text-xs text-gray-500">• {game.country.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-8">
              {[
                { label: "Sport", value: game.sport?.name || "—" },
                { label: "League", value: game.league?.name || "—" },
                { label: "Starts At", value: formatDate(Number(game.startsAt)) },
                { label: "Turnover", value: game.turnover ? `$${parseFloat(game.turnover).toFixed(2)}` : "$0.00" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-sm font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Participants */}
            {game.participants && game.participants.length >= 2 && (
              <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-4 md:p-6 mb-8">
                <div className="flex items-center justify-around gap-2">
                  <div className="text-center">
                    {game.participants[0]?.image && (
                      <img src={game.participants[0].image} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#111d3a]" />
                    )}
                    <p className="font-bold text-lg">{game.participants[0]?.name}</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">VS</span>
                  <div className="text-center">
                    {game.participants[1]?.image && (
                      <img src={game.participants[1].image} alt="" className="w-16 h-16 rounded-full mx-auto mb-2 bg-[#111d3a]" />
                    )}
                    <p className="font-bold text-lg">{game.participants[1]?.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Markets / Conditions */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Markets</h2>

              {conditionsLoading && (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-[#111d3a] border border-[#1e3a5f] rounded-xl" />
                  ))}
                </div>
              )}

              {conditions && conditions.length === 0 && (
                <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-8 text-center">
                  <p className="text-gray-500">No active markets available for this game.</p>
                </div>
              )}

              {conditions && conditions.map((condition) => (
                <div
                  key={condition.conditionId}
                  className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-5 mb-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500 font-mono">
                      Condition #{condition.conditionId.slice(-8)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      condition.state === "Active"
                        ? "text-green-400 bg-green-400/10 border border-green-400/30"
                        : "text-gray-400 bg-gray-400/10 border border-gray-400/30"
                    }`}>
                      {condition.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {condition.outcomes.map((outcome) => {
                      const isSelected =
                        selected?.conditionId === condition.conditionId &&
                        selected?.outcomeId === outcome.outcomeId;
                      const oddsValue = parseFloat(outcome.odds);

                      return (
                        <button
                          key={`${condition.conditionId}-${outcome.outcomeId}`}
                          onClick={() =>
                            selectOutcome(
                              condition.conditionId,
                              outcome.outcomeId,
                              outcome.title || outcome.outcomeId
                            )
                          }
                          disabled={condition.state !== "Active"}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-[#3b82f6] bg-[#3b82f6]/10 shadow-lg shadow-blue-500/10"
                              : "border-[#1e3a5f] hover:border-[#3b82f6]/40"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          <p className="text-xs text-gray-400 mb-1 truncate">
                            {outcome.title || `Outcome ${outcome.outcomeId}`}
                          </p>
                          <p className="text-xl font-bold text-[#3b82f6]">
                            {oddsValue.toFixed(2)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Trade Panel */}
            <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-6 mb-8">
              <h2 className="text-lg font-bold mb-4">Place Trade</h2>

              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-3">Connect your wallet to trade on this game</p>
                  <button
                    onClick={connect}
                    disabled={connecting}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all disabled:opacity-50 text-sm"
                  >
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>

                  {selected ? (
                    <>
                      <div className="bg-[#111d3a] border border-[#1e3a5f] rounded-lg px-4 py-3">
                        <p className="text-xs text-gray-500 mb-1">Selected Outcome</p>
                        <p className="text-sm font-semibold">
                          Condition #{selected.conditionId.slice(-8)} → Outcome {selected.outcomeId}
                        </p>
                        <p className="text-xs text-[#3b82f6] mt-1">
                          Odds: {totalOdds > 0 ? totalOdds.toFixed(2) : "Calculating..."}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Trade Amount</label>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          min={0.1}
                          step={0.1}
                          className="w-full px-4 py-2.5 bg-[#111d3a] border border-[#1e3a5f] rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6] transition-colors"
                        />
                        {totalOdds > 0 && parseFloat(betAmount) > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Potential return: ${(parseFloat(betAmount) * totalOdds).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={submit}
                        disabled={isBetting || isAllowanceLoading || !totalOdds}
                        className="w-full py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-bold rounded-lg hover:from-[#1d4ed8] hover:to-[#60a5fa] transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAllowanceLoading
                          ? "Checking allowance..."
                          : approveTx?.isPending || approveTx?.isProcessing
                          ? "Approving..."
                          : betTx?.isPending || betTx?.isProcessing
                          ? "Placing trade..."
                          : isApproveRequired
                          ? "Approve & Trade"
                          : "Place Trade"}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      Select an outcome above to place a trade
                    </p>
                  )}

                  {betSuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                      <p className="text-sm text-green-400">Trade placed successfully!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Game info */}
            <div className="bg-[#0c1428] border border-[#1e3a5f] rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Game Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Game ID</span>
                  <span className="text-sm text-gray-300 font-mono">{game.gameId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">State</span>
                  <span className="text-sm text-gray-300">{game.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Conditions</span>
                  <span className="text-sm text-gray-300">{conditions?.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Network</span>
                  <span className="text-sm text-gray-300">{chain?.appChain?.name || "Polygon Amoy"} (Testnet)</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
