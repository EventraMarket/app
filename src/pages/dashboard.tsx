import { useState, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import TopNavbar from "@/components/TopNavbar";
import { useWallet } from "@/context/WalletContext";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import type { AnalyticsResponse } from "./api/analytics";
import { CONTRACT_ADDRESSES, USDC_ABI } from "@/lib/contracts";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-5">
      <p className="text-xs text-[#D9A650]/80 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
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

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [tab, setTab] = useState<"overview" | "markets" | "activity">("overview");
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const url = address
        ? `/api/analytics?address=${address}`
        : "/api/analytics";
      const res = await fetch(url);
      const data: AnalyticsResponse = await res.json();
      setAnalytics(data);
    } catch {
      // silently fail
    } finally {
      setLoadingAnalytics(false);
    }
  }, [address]);

  const fetchUsdcBalance = useCallback(async () => {
    if (!publicClient || !address) return;
    try {
      const bal = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDC as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setUsdcBalance(formatUnits(bal as bigint, 6));
    } catch {
      setUsdcBalance("—");
    }
  }, [publicClient, address]);

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
  }, [fetchAnalytics]);

  useEffect(() => {
    if (isConnected) { fetchUsdcBalance(); checkAdmin(); }
  }, [isConnected, fetchUsdcBalance, checkAdmin]);

  const wallet = analytics?.wallet;

  return (
    <div className={`${geistSans.className} min-h-screen text-white bg-transparent`}>
      <TopNavbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-[#D9A650] text-sm mt-1">Protocol analytics &amp; wallet activity — Base Sepolia</p>
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
          <h2 className="text-xs uppercase tracking-widest text-[#D9A650]/80 mb-3">Protocol Overview</h2>
          {loadingAnalytics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-black border border-[#D9A650]/50 rounded-xl p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Total Markets" value={String(analytics?.totalMarkets ?? 0)} sub="On-chain conditions" />
              <StatCard label="Total Volume" value={`$${Number(analytics?.totalVolume ?? 0).toLocaleString()}`} sub="mUSDC split" />
              <StatCard label="Total Splits" value={String(analytics?.totalSplits ?? 0)} sub="Position splits" />
              <StatCard label="Redemptions" value={String(analytics?.totalRedemptions ?? 0)} sub="Payouts claimed" />
              <StatCard label="Active Users" value={String(analytics?.totalUniqueWallets ?? 0)} sub="Unique wallets" />
              <StatCard label="Transactions" value={String(analytics?.totalTransactions ?? 0)} sub="All-time total" />
            </div>
          )}
        </section>

        {/* Wallet Stats (only when connected) */}
        {isConnected && address && (
          <section className="mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#D9A650]/80 mb-3">Your Wallet</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="mUSDC Balance"
                value={`$${Number(usdcBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                sub="Mock USDC"
              />
              <StatCard
                label="Your Volume"
                value={`$${Number(wallet?.splitVolume ?? 0).toLocaleString()}`}
                sub="mUSDC wagered"
              />
              <StatCard
                label="Redeemed"
                value={`$${Number(wallet?.redemptionVolume ?? 0).toLocaleString()}`}
                sub="Claimed payouts"
              />
              <StatCard
                label="Address"
                value={`${address.slice(0, 6)}...${address.slice(-4)}`}
                sub="Base Sepolia"
              />
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black border border-[#D9A650]/50 rounded-xl p-1 w-fit">
          {(["overview", "markets", "activity"] as const).map((t) => (
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

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-[#f7f7fa]">Contract Addresses</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "ConditionalTokens", addr: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN },
                { label: "mUSDC (Collateral)", addr: CONTRACT_ADDRESSES.USDC },
                { label: "CTF Exchange", addr: CONTRACT_ADDRESSES.CTF_EXCHANGE },
                { label: "SimpleResolver", addr: CONTRACT_ADDRESSES.SIMPLE_RESOLVER },
              ].map(({ label, addr }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-[#D9A650]/80 w-44 shrink-0">{label}</span>
                  <a
                    href={`https://sepolia.basescan.org/address/${addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[#F3B21A] hover:underline break-all"
                  >
                    {addr}
                  </a>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#D9A650]/50 text-xs text-[#D9A650]/80">
              Chain: Base Sepolia (84532) · Block explorer:{" "}
              <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="text-[#F3B21A] hover:underline">
                sepolia.basescan.org
              </a>
            </div>
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
                          href={`https://sepolia.basescan.org/address/${m.conditionId}`}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ACTIVITY_BADGE[a.type]}`}>
                      {a.type}
                    </span>
                    <span className="font-mono text-xs text-[#D9A650]/80 flex-1 truncate">{a.conditionId}</span>
                    <span className="text-xs font-semibold text-white">${Number(a.amount).toFixed(2)} mUSDC</span>
                    <span className="text-xs text-[#D9A650]/60 shrink-0">#{a.blockNumber}</span>
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
