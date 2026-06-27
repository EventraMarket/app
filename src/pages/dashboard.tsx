

import { useState, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import TopNavbar from "@/components/TopNavbar";
import { useWallet } from "@/context/WalletContext";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import type { AnalyticsResponse } from "./api/analytics";
import { getContracts, CONTRACT_ADDRESSES, USDC_ABI } from "@/lib/contracts";
import {getChainName} from "@/lib/useMarkets";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

function StatCard({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-5 min-w-0">
      <p className="text-xs text-[#D9A650]/80 mb-1">{label}</p>
      <p className={mono ? "font-mono text-sm font-semibold text-white break-all" : "text-2xl font-bold text-white"}>{value}</p>
      {sub && <p className="text-xs text-[#D9A650]/80 mt-1">{sub}</p>}
    </div>
  );
}

const ACTIVITY_BADGE: Record<string, string> = {
  split: "bg-[#F3B21A]/20 text-[#F3B21A] border border-[#F3B21A]/30",
  merge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  redeem: "bg-green-500/20 text-green-300 border border-green-500/30",
};

export default function DashboardPage() {
  const { address, isConnected, connecting, connect } = useWallet();
  const publicClient = usePublicClient();
  const { chainId } = useAccount();
  const contracts = getContracts(chainId);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [tab, setTab] = useState<"history" | "markets" | "activity">("history");
  const [isAdmin, setIsAdmin] = useState(false);
  const [historyTxs, setHistoryTxs] = useState<{
    txHash: string; type: string; wallet: string;
    conditionId: string | null; amount: string; blockNumber: number; timestamp: string;
  }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Forced strictly to Celo Mainnet settings for analytical layers
  const CELO_MAINNET_ID = 42220;
  // const currentNetworkName = "Celo Mainnet";
  const currentNetworkName = getChainName(chainId || CELO_MAINNET_ID);
  const explorerBaseUrl = "https://celoscan.io";


const fetchHistory = useCallback(async (page = 1) => {
  setLoadingHistory(true);
  try {
    const targetChain = chainId || 42220; // Default to Celo Mainnet
    const res = await fetch(`/api/transactions?limit=20&page=${page}&chainId=${targetChain}`);
    const data = await res.json();
    setHistoryTxs(data.transactions ?? []);
    setHistoryTotal(data.total ?? 0);
    setHistoryPage(page);
  } catch {
    // silently fail
  } finally {
    setLoadingHistory(false);
  }
}, [chainId]); // Added chainId dependency parameter

const fetchAnalytics = useCallback(async () => {
  setLoadingAnalytics(true);
  try {
    const targetChain = chainId || 42220; // Default to Celo Mainnet
    let url = `/api/analytics?chainId=${targetChain}`;
    if (address) {
      url += `&address=${address.toLowerCase()}`;
    }
    const res = await fetch(url);
    const data: AnalyticsResponse = await res.json();
    setAnalytics(data);
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
  } finally {
    setLoadingAnalytics(false);
  }
}, [address, chainId]); // Added chainId dependency parameter


  const fetchUsdcBalance = useCallback(async () => {
    if (!publicClient || !address || !contracts.USDC) return;
    try {
      const bal = await publicClient.readContract({
        address: contracts.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setUsdcBalance(formatUnits(bal as bigint, 6));
    } catch {
      setUsdcBalance("—");
    }
  }, [publicClient, address, contracts.USDC]);

  const checkAdmin = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch("/api/admin?action=admins", {
        headers: { "x-admin-wallet": address },
      });
      setIsAdmin(res.ok);
    } catch {
      setIsAdmin(false);
    }
  }, [address]);

  useEffect(() => {
    fetchAnalytics();
    fetchHistory(1);
  }, [fetchAnalytics, fetchHistory, chainId]); 

  // Trades happen on the market detail page, a separate route with no
  // shared state — so the dashboard never hears about them. Refetch
  // whenever this tab regains focus (e.g. coming back from a trade) so
  // numbers don't look stale without requiring a hard refresh.
  useEffect(() => {
    function handleFocus() {
      fetchAnalytics();
      fetchHistory(historyPage);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAnalytics, fetchHistory, historyPage]);

  useEffect(() => {
    if (isConnected) { fetchUsdcBalance(); checkAdmin(); }
  }, [isConnected, fetchUsdcBalance, checkAdmin, chainId]);

  const wallet = analytics?.wallet;

  return (
    <div className={`${geistSans.className} min-h-screen text-white bg-transparent`}>
      <TopNavbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-black/70 text-sm mt-1 font-medium">Protocol analytics &amp; wallet activity — {currentNetworkName}</p>
          </div>
          {isConnected && (
            <div className="flex gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D9A650]/50 text-[#DED5A8] text-sm font-semibold rounded-lg hover:bg-black transition"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F3B21A] text-white text-sm font-bold rounded-lg hover:brightness-110 transition"
              >
                + Create Market
              </Link>
            </div>
          )}
        </div>

        {/* Connect prompt */}
        {!isConnected && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl p-8 text-center mb-8">
            <p className="text-[#D9A650] mb-4">Connect your wallet to see your personal analytics.</p>
            <button
              onClick={connect}
              disabled={connecting}
              className="px-6 py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        {/* Protocol Stats */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-white font-bold mb-3">Protocol Overview</h2>
          {loadingAnalytics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-black border border-[#D9A650]/50 rounded-xl p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Total Markets" value={String(analytics?.totalMarkets ?? 0)} sub="On-chain conditions" />
              <StatCard label="Total Volume" value={`$${Number(analytics?.totalVolume ?? 0).toLocaleString()}`} sub="USDT split" />
              <StatCard label="Total Splits" value={String(analytics?.totalSplits ?? 0)} sub="Position splits" />
              <StatCard label="Active Users" value={String(analytics?.totalUniqueWallets ?? 0)} sub="Unique wallets" />
              <StatCard label="Transactions" value={String(analytics?.totalTransactions ?? 0)} sub="All-time total" />
            </div>
          )}
        </section>

        {/* Wallet Stats (only when connected) */}
        {isConnected && address && (
          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#D9A650]/80 mb-3">Your Wallet</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="USDT Balance"
                value={`$${Number(usdcBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                sub="USDT"
              />
              <StatCard
                label="Your Volume"
                value={`$${Number(wallet?.splitVolume ?? 0).toLocaleString()}`}
                sub="USDT wagered"
              />
              <StatCard
                label="Address"
                value={address}
                sub={currentNetworkName}
                mono
              />
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black border border-[#D9A650]/50 rounded-xl p-1 w-fit">
          {(["history", "markets", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-[#F3B21A] text-white"
                  : "text-[#D9A650] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: History */}
        {tab === "history" && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#D9A650]/50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#f7f7fa]">Platform Transaction History</h3>
                <p className="text-xs text-[#D9A650]/60 mt-0.5">{historyTotal.toLocaleString()} total transactions across all wallets</p>
              </div>
              <button
                onClick={() => { fetchHistory(historyPage); fetchAnalytics(); }}
                className="text-xs text-[#F3B21A] hover:underline"
              >
                Refresh
              </button>
            </div>
            {loadingHistory ? (
              <div className="divide-y divide-[#D9A650]/30">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="px-4 py-3 animate-pulse flex gap-3 items-center">
                    <div className="h-5 w-12 bg-[#D9A650]/20 rounded-full" />
                    <div className="h-4 flex-1 bg-[#D9A650]/10 rounded" />
                    <div className="h-4 w-20 bg-[#D9A650]/10 rounded" />
                  </div>
                ))}
              </div>
            ) : historyTxs.length === 0 ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">No transactions recorded yet.</div>
            ) : (
              <>
                <div className="divide-y divide-[#D9A650]/30">
                  {historyTxs.map((tx, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-[#D9A650]/5 transition-colors">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${
                        ACTIVITY_BADGE[tx.type] ?? "bg-[#D9A650]/20 text-[#D9A650] border border-[#D9A650]/30"
                      }`}>
                        {tx.type}
                      </span>
                      <span className="font-mono text-xs text-[#D9A650]/60 shrink-0 hidden sm:block">
                        {tx.wallet ? `${tx.wallet.slice(0, 10)}…${tx.wallet.slice(-6)}` : "—"}
                      </span>
                      <span className="font-mono text-xs text-[#D9A650]/40 flex-1 truncate">
                        {tx.conditionId ?? "—"}
                      </span>
                      <span className="text-xs font-semibold text-white shrink-0">
                        ${Number(tx.amount).toFixed(2)}
                      </span>
                      <span className="text-xs text-[#D9A650]/50 shrink-0 hidden md:block">
                        #{tx.blockNumber?.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#D9A650]/40 shrink-0 hidden lg:block">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : ""}
                      </span>
                      {tx.txHash && !tx.txHash.startsWith("fake") && (
                        <a
                          href={`${explorerBaseUrl}/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#F3B21A] hover:underline shrink-0"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {historyTotal > 20 && (
                  <div className="p-4 border-t border-[#D9A650]/30 flex items-center justify-between">
                    <button
                      disabled={historyPage <= 1}
                      onClick={() => fetchHistory(historyPage - 1)}
                      className="text-xs px-3 py-1.5 rounded border border-[#D9A650]/40 text-[#D9A650] disabled:opacity-30 hover:border-[#F3B21A] hover:text-[#F3B21A] transition"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-[#D9A650]/60">
                      Page {historyPage} of {Math.ceil(historyTotal / 20)}
                    </span>
                    <button
                      disabled={historyPage >= Math.ceil(historyTotal / 20)}
                      onClick={() => fetchHistory(historyPage + 1)}
                      className="text-xs px-3 py-1.5 rounded border border-[#D9A650]/40 text-[#D9A650] disabled:opacity-30 hover:border-[#F3B21A] hover:text-[#F3B21A] transition"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Markets */}
        {tab === "markets" && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#D9A650]/50 flex items-center justify-between">
              <h3 className="font-semibold text-[#f7f7fa]">Recent On-chain Markets</h3>
              <button onClick={fetchAnalytics} className="text-xs text-[#F3B21A] hover:underline">
                Refresh
              </button>
            </div>
            {loadingAnalytics ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">Loading...</div>
            ) : analytics?.recentMarkets.length === 0 ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">
                No markets on-chain yet.{" "}
                <Link href="/create" className="text-[#F3B21A] hover:underline">
                  Create one →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#D9A650]/30">
                {analytics?.recentMarkets.map((m, i) => (
                  <div key={i} className="px-4 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            m.resolved
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          }`}>{m.resolved ? "Resolved" : "Active"}</span>
                          <span className="text-xs bg-black/80 border border-[#D9A650]/50 rounded px-2 py-0.5 text-[#D9A650]">{m.category}</span>
                          <span className="text-xs text-[#D9A650]/60">{m.outcomeSlotCount} outcomes</span>
                        </div>
                        <p className="text-sm font-semibold text-white truncate mb-0.5">{m.title || "Untitled Market"}</p>
                        <p className="font-mono text-xs text-[#D9A650]/60 truncate">conditionId: {m.conditionId}</p>
                        {m.resolved && m.winner && (
                          <p className="text-xs text-green-400 mt-0.5">Winner: {m.winner}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#D9A650]/60">block #{m.blockNumber}</span>
                        <a
                          href={`${explorerBaseUrl}/address/${m.conditionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#F3B21A] hover:underline"
                        >
                          Explorer ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Activity */}
        {tab === "activity" && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#D9A650]/50">
              <h3 className="font-semibold text-[#f7f7fa]">Your Transaction Activity</h3>
            </div>
            {!isConnected ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">Connect wallet to view activity.</div>
            ) : loadingAnalytics ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">Loading...</div>
            ) : !wallet?.recentActivity.length ? (
              <div className="p-8 text-center text-[#D9A650]/80 text-sm">No on-chain activity yet for this wallet.</div>
            ) : (
              <div className="divide-y divide-[#D9A650]/30">
                {wallet.recentActivity.map((a, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ACTIVITY_BADGE[a.type] || "bg-zinc-800 text-zinc-400"}`}>
                      {a.type}
                    </span>
                    <span className="font-mono text-xs text-[#D9A650]/80 flex-1 truncate">{a.conditionId}</span>
                    <span className="text-xs font-semibold text-white">${Number(a.amount).toFixed(2)} USDT</span>
                    <span className="text-xs text-[#D9A650]/60 shrink-0">#{a.blockNumber}</span>
                    {a.txHash && (
                      <a
                        href={`${explorerBaseUrl}/tx/${a.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#F3B21A] hover:underline shrink-0"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}