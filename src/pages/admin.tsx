
import { useState, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import TopNavbar from "@/components/TopNavbar";
import { useWallet } from "@/context/WalletContext";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { parseUnits, keccak256, encodePacked } from "viem";
import { getContracts, SIMPLE_RESOLVER_ABI, CONDITIONAL_TOKEN_ABI, FPMM_FACTORY_ABI, USDC_ABI, FPMM_ABI } from "@/lib/contracts";

const CATEGORIES = ["Politics", "Sports", "Crypto", "Finance", "Culture", "Esports", "Economy", "Other"];

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

interface Market {
  _id: string;
  conditionId: string;
  questionId: string;
  title: string;
  category: string;
  outcomes: string[];
  creator: string;
  resolved: boolean;
  winner: string | null;
  winnerIndex: number | null;
  blockNumber: number;
  chainId: number;
  fpmmAddress?: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolveTxHash: string | null;
}

interface AdminRecord {
  _id: string;
  wallet: string;
  addedAt: string;
  addedBy: string;
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500/20 text-green-300 border border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    red: "bg-red-500/20 text-red-300 border border-red-500/30",
    blue: "bg-[#F3B21A]/20 text-[#F3B21A] border border-[#F3B21A]/30",
    gray: "bg-gray-500/20 text-[#D9A650] border border-gray-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  );
}

export default function AdminPage() {
  const { address, isConnected, connecting, connect } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chainId } = useAccount();
  const contracts = getContracts(chainId);

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [tab, setTab] = useState<"markets" | "create" | "admins">("markets");

  // Create market form
  const [createTitle, setCreateTitle] = useState("");
  const [createCategory, setCreateCategory] = useState("Politics");
  const [createOutcomes, setCreateOutcomes] = useState(["Yes", "No"]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<{ conditionId: string; questionId: string } | null>(null);
  const [deployingFPMM, setDeployingFPMM] = useState(false);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Resolve form
  const [resolveTarget, setResolveTarget] = useState<Market | null>(null);
  const [resolveWinnerIdx, setResolveWinnerIdx] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  // Add admin form
  const [newAdminWallet, setNewAdminWallet] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addAdminMsg, setAddAdminMsg] = useState<string | null>(null);
  // Adding Initial Liquidity state
  const [funding, setFunding] = useState("0.1");  
  const checkAdmin = useCallback(async () => {
    if (!address) return;
    setCheckingAdmin(true);
    try {
      const res = await fetch("/api/admin?action=admins", {
        headers: { "x-admin-wallet": address },
      });
      setIsAdmin(res.ok);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  }, [address]);

  const fetchMarkets = useCallback(async () => {
    if (!address || !isAdmin) return;
    setLoadingMarkets(true);
    try {
      const res = await fetch("/api/admin?action=markets", {
        headers: { "x-admin-wallet": address },
      });
      const data = await res.json();
      setMarkets(data.markets ?? []);
    } catch {
      setMarkets([]);
    } finally {
      setLoadingMarkets(false);
    }
  }, [address, isAdmin]);

  const fetchAdmins = useCallback(async () => {
    if (!address || !isAdmin) return;
    setLoadingAdmins(true);
    try {
      const res = await fetch("/api/admin?action=admins", {
        headers: { "x-admin-wallet": address },
      });
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch {
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }, [address, isAdmin]);

  useEffect(() => {
    if (isConnected) checkAdmin();
  }, [isConnected, checkAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchMarkets();
      fetchAdmins();
    }
  }, [isAdmin, fetchMarkets, fetchAdmins]);

  // ── Create Market ───────────────────────────────────────────────────────────
  function deriveQuestionId(t: string): `0x${string}` {
    return keccak256(encodePacked(["string"], [t]));
  }

  async function handleCreateMarket() {
    if (!walletClient || !publicClient || !address) return;
    if (!createTitle.trim()) {
      setCreateError("Title is required.");
      return;
    }
    if (createOutcomes.some((o) => !o.trim())) {
      setCreateError("All outcome labels must be filled.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const questionId = deriveQuestionId(createTitle.trim());

       

      // 1. Prepare condition on-chain
      const hash = await walletClient.writeContract({
        address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
        abi: CONDITIONAL_TOKEN_ABI,
        functionName: "prepareCondition",
        args: [
          contracts.SIMPLE_RESOLVER as `0x${string}`,
          questionId,
          BigInt(createOutcomes.length),
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const conditionId = keccak256(
        encodePacked(
          ["address", "bytes32", "uint256"],
          [contracts.SIMPLE_RESOLVER as `0x${string}`, questionId, BigInt(createOutcomes.length)]
        )
      );

      // 2. Save market to DB
      const saveRes = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionId,
          questionId,
          title: createTitle.trim(),
          category: createCategory,
          outcomes: createOutcomes,
          outcomeSlotCount: createOutcomes.length,
          creator: address,
          resolver: contracts.SIMPLE_RESOLVER,
          txHash: hash,
          blockNumber: Number(receipt.blockNumber),
          chainId: Number(chainId),
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save market to database");
      }

      // 3. Deploy FPMM for this market
      setDeployingFPMM(true);
      // try {
        // const fpmmRes = await fetch("/api/fpmm", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     conditionId,
        //     collateralToken: contracts.USDC,
        //     conditionalTokens: contracts.CONDITIONAL_TOKEN,
        //     fee: "10000000000000000", // 1%
        //   }),
        // });

        // if (!fpmmRes.ok) {
        //   const errorData = await fpmmRes.json();
        //   console.warn("FPMM deployment failed:", errorData);
        //   setCreateError(
        //     `Market created but FPMM deployment failed: ${errorData.error || "Unknown error"}`
        //   );
        const { result: fpmmAddress } = await publicClient.simulateContract({
        address: contracts.FPMMFACTORY as `0x${string}`,
        abi: FPMM_FACTORY_ABI,
        functionName: "createFixedProductMarketMaker",
        args: [
          contracts.CONDITIONAL_TOKEN as `0x${string}`,
          contracts.USDC as `0x${string}`,
          [conditionId as `0x${string}`],
          BigInt(10000000000000000), // 1% fee
        ],
        account: address, // the connected admin wallet
      });
      console.log("✅ FPMM will be deployed at:", fpmmAddress);
          const fpmmTxHash = await walletClient.writeContract({
               address: contracts.FPMMFACTORY as `0x${string}`,
               abi: FPMM_FACTORY_ABI,
               functionName: "createFixedProductMarketMaker",
               args: [
                 contracts.CONDITIONAL_TOKEN as `0x${string}`,
                 contracts.USDC as `0x${string}`,
                 [conditionId as `0x${string}`],
                 BigInt(10000000000000000), // 1% fee
               ],
             });
         
               const fpmmReceipt = await publicClient.waitForTransactionReceipt({ hash: fpmmTxHash });
               console.log("✅ FPMM deployed, transaction receipt:", fpmmReceipt);
          setCreateSuccess({ conditionId, questionId });
        //   return;
        // }

        // const { fpmmAddress } = await fpmmRes.json();
        // console.log("✅ FPMM deployed at:", fpmmAddress);
      await fetch("/api/markets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditionId, fpmmAddress }),
    });

       const seedAmount = parseUnits(funding, 6); // 0.1 USDT
        // Approve FPMM to spend USDC
        await walletClient.writeContract({
          address: contracts.USDC as `0x${string}`,
          abi: USDC_ABI,
          functionName: "approve",
          args: [fpmmAddress as `0x${string}`, seedAmount],
        });
        // Add funding
        await walletClient.writeContract({
          address: fpmmAddress as `0x${string}`,
          abi: FPMM_ABI,
          functionName: "addFunding",
          args: [seedAmount, []],
        });
        // Refresh markets to show the new FPMM address
        fetchMarkets();

        setCreateSuccess({ conditionId, questionId });
      } catch (fpmmErr) {
        console.error("FPMM deployment error:", fpmmErr);
        setCreateError("Market created but FPMM deployment failed. Please retry.");
        // setCreateSuccess({ conditionId, questionId });
      } finally {
        setDeployingFPMM(false);
      }
   
  }

  // ── Resolve Market ──────────────────────────────────────────────────────────
  async function handleResolve() {
    if (!resolveTarget || !walletClient || !publicClient || !address) return;

    setResolving(true);
    setResolveError(null);
    setResolveSuccess(null);

    try {
      // Use simple [0,1] payouts (1 = winning outcome)
      const payouts: bigint[] = resolveTarget.outcomes.map((_, i) =>
        i === resolveWinnerIdx ? 1n : 0n
      );

      const hash = await walletClient.writeContract({
        address: contracts.SIMPLE_RESOLVER as `0x${string}`,
        abi: SIMPLE_RESOLVER_ABI,
        functionName: "resolve",
        args: [resolveTarget.questionId as `0x${string}`, payouts],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Save to DB
      await fetch("/api/admin?action=resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-wallet": address,
        },
        body: JSON.stringify({
          conditionId: resolveTarget.conditionId,
          winnerIndex: resolveWinnerIdx,
          winner: resolveTarget.outcomes[resolveWinnerIdx],
          txHash: hash,
          blockNumber: Number(receipt.blockNumber),
        }),
      });

      setResolveSuccess(`Market resolved! Winner: ${resolveTarget.outcomes[resolveWinnerIdx]}`);
      setResolveTarget(null);
      fetchMarkets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Resolve failed";
      setResolveError(msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setResolving(false);
    }
  }

  // ── Add Admin ───────────────────────────────────────────────────────────────
  async function handleAddAdmin() {
    if (!newAdminWallet.trim() || !address) return;
    setAddingAdmin(true);
    setAddAdminMsg(null);
    try {
      const res = await fetch("/api/admin?action=admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-wallet": address,
        },
        body: JSON.stringify({ wallet: newAdminWallet.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddAdminMsg(`Admin added: ${newAdminWallet.trim()}`);
      setNewAdminWallet("");
      fetchAdmins();
    } catch (err: unknown) {
      setAddAdminMsg(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setAddingAdmin(false);
    }
  }

  // ── Remove Admin ─────────────────────────────────────────────────────────────
  async function handleRemoveAdmin(wallet: string) {
    if (!address) return;
    await fetch("/api/admin?action=admins", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-wallet": address,
      },
      body: JSON.stringify({ wallet }),
    });
    fetchAdmins();
  }

  return (
    <div className={`${geistSans.className} min-h-screen text-white bg-transparent`}>
      <TopNavbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
            <p className="text-[#D9A650] text-sm mt-1">Resolve markets · Manage admins</p>
          </div>
          <Link href="/dashboard" className="text-sm text-[#F3B21A] hover:underline">
            ← Dashboard
          </Link>
        </div>

        {!isConnected && (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl p-8 text-center">
            <p className="text-[#D9A650] mb-4">Connect your wallet to access the admin panel.</p>
            <button
              onClick={connect}
              disabled={connecting}
              className="px-6 py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        {isConnected && checkingAdmin && (
          <div className="text-[#D9A650] text-sm">Checking admin status...</div>
        )}

        {isConnected && !checkingAdmin && !isAdmin && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400 font-semibold mb-2">Access Denied</p>
            <p className="text-[#D9A650] text-sm">
              <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span> is not an admin.
              Ask an existing admin to grant you access.
            </p>
          </div>
        )}

        {isConnected && !checkingAdmin && isAdmin && (
          <>
            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <Badge color="green">Admin</Badge>
              <span className="font-mono text-sm text-[#DED5A8]">{address}</span>
            </div>

            {resolveSuccess && (
              <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm text-green-400">
                {resolveSuccess}
              </div>
            )}
            {resolveError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                {resolveError}
              </div>
            )}

            <div className="flex gap-1 mb-6 bg-black border border-[#D9A650]/50 rounded-xl p-1 w-fit">
              {(["markets", "create", "admins"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                    tab === t ? "bg-[#F3B21A] text-white" : "text-[#D9A650] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* ── TAB: MARKETS ─────────────────────────────────────────────── */}
            {tab === "markets" && (
              <div>
                {resolveTarget && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-black border border-[#D9A650]/50 rounded-2xl p-6 w-full max-w-md mx-4">
                      <h3 className="font-bold text-lg mb-1">Resolve Market</h3>
                      <p className="text-sm text-[#D9A650] mb-4 truncate">{resolveTarget.title}</p>

                      <label className="block text-xs text-[#D9A650]/80 mb-2">Select winning outcome</label>
                      <div className="space-y-2 mb-6">
                        {resolveTarget.outcomes.map((o, i) => (
                          <button
                            key={i}
                            onClick={() => setResolveWinnerIdx(i)}
                            className={`w-full py-2.5 px-4 rounded-lg border text-sm font-semibold text-left transition-colors ${
                              resolveWinnerIdx === i
                                ? "border-[#F3B21A] bg-[#F3B21A]/20 text-white"
                                : "border-[#D9A650]/50 text-[#D9A650] hover:border-[#F3B21A]"
                            }`}
                          >
                            {i + 1}. {o}
                          </button>
                        ))}
                      </div>

                      {resolveError && (
                        <p className="text-xs text-red-400 mb-3">{resolveError}</p>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setResolveTarget(null);
                            setResolveError(null);
                          }}
                          className="flex-1 py-2.5 border border-[#D9A650]/50 text-[#D9A650] rounded-lg text-sm hover:text-white transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResolve}
                          disabled={resolving}
                          className="flex-1 py-2.5 bg-[#F3B21A] text-white font-bold rounded-lg text-sm hover:brightness-110 transition disabled:opacity-50"
                        >
                          {resolving ? "Resolving..." : "Confirm Resolve"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-black border border-[#D9A650]/50 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#D9A650]/50 flex items-center justify-between">
                    <h3 className="font-semibold">All Markets ({markets.length})</h3>
                    <button onClick={fetchMarkets} className="text-xs text-[#F3B21A] hover:underline">
                      Refresh
                    </button>
                  </div>

                  {loadingMarkets ? (
                    <div className="p-8 text-center text-[#D9A650]/80 text-sm">Loading markets...</div>
                  ) : markets.length === 0 ? (
                    <div className="p-8 text-center text-[#D9A650]/80 text-sm">
                      No markets in database yet.{" "}
                      <button
                        onClick={() => setTab("create")}
                        className="text-[#F3B21A] hover:underline"
                      >
                        Create one →
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#D9A650]/30">
                      {markets.map((m) => (
                        <div key={m._id} className="px-4 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge color={m.resolved ? "green" : "yellow"}>
                                  {m.resolved ? "Resolved" : "Active"}
                                </Badge>
                                <Badge color="blue">{m.category}</Badge>
                                {m.fpmmAddress ? (
                                  <Badge color="green">FPMM ✓</Badge>
                                ) : (
                                  <Badge color="yellow">No FPMM</Badge>
                                )}
                                <span className="text-xs text-[#D9A650]/60">Block #{m.blockNumber}</span>
                              </div>
                              <p className="font-semibold text-sm text-white mb-1 truncate">{m.title}</p>
                              <p className="font-mono text-xs text-[#D9A650]/60 truncate mb-1">
                                {m.conditionId}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {m.outcomes.map((o, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs px-2 py-0.5 rounded border ${
                                      m.resolved && m.winnerIndex === i
                                        ? "border-green-500/50 text-green-400 bg-green-500/10"
                                        : "border-[#D9A650]/50 text-[#D9A650]/80"
                                    }`}
                                  >
                                    {o}
                                    {m.resolved && m.winnerIndex === i && " ✓"}
                                  </span>
                                ))}
                              </div>
                              {m.resolved && m.resolvedAt && (
                                <p className="text-xs text-[#D9A650]/60 mt-1">
                                  Resolved {new Date(m.resolvedAt).toLocaleDateString()} by{" "}
                                  <span className="font-mono">{m.resolvedBy?.slice(0, 8)}...</span>
                                </p>
                              )}
                              {m.fpmmAddress && (
                                <p className="text-xs text-[#D9A650]/60 mt-1 font-mono truncate">
                                  FPMM: {m.fpmmAddress}
                                </p>
                              )}
                            </div>
                            {!m.resolved && (
                              <button
                                onClick={() => {
                                  setResolveTarget(m);
                                  setResolveWinnerIdx(0);
                                  setResolveError(null);
                                }}
                                className="px-4 py-2 bg-[#D9A650] hover:bg-[#D9A650] text-white text-xs font-semibold rounded-lg transition shrink-0"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: CREATE MARKET ───────────────────────────────────────── */}
            {tab === "create" && (
              <div className="space-y-5 max-w-2xl">
                {createSuccess ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 space-y-3">
                    <p className="text-green-400 font-semibold">
                      Market created on-chain!
                      {deployingFPMM && " Deploying FPMM..."}
                    </p>
                    <p className="text-xs text-[#D9A650] font-mono break-all">conditionId: {createSuccess.conditionId}</p>
                    <p className="text-xs text-[#D9A650] font-mono break-all">questionId: {createSuccess.questionId}</p>
                    <div className="flex gap-4 pt-1">
                      <button
                        onClick={() => {
                          setCreateSuccess(null);
                          setCreateTitle("");
                          setCreateOutcomes(["Yes", "No"]);
                          setCreateCategory("Politics");
                        }}
                        className="text-sm text-[#F3B21A] hover:underline"
                      >
                        Create another
                      </button>
                      <button onClick={() => setTab("markets")} className="text-sm text-[#D9A650] hover:underline">
                        View markets →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Title */}
                    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
                      <label className="block text-sm font-semibold mb-2 text-[#f7f7fa]">
                        Question / Market Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={createTitle}
                        onChange={(e) => setCreateTitle(e.target.value)}
                        placeholder="e.g. Will Bitcoin hit $200k by end of 2026?"
                        className="w-full px-4 py-3 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm placeholder-[#D9A650]/50 focus:outline-none focus:border-[#F3B21A] transition"
                        disabled={creating}
                      />
                      {createTitle && (
                        <p className="mt-2 text-xs text-[#D9A650]/80 font-mono break-all">
                          questionId: {deriveQuestionId(createTitle.trim())}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
                      <label className="block text-sm font-semibold mb-3 text-[#f7f7fa]">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => setCreateCategory(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              createCategory === c
                                ? "bg-[#F3B21A] text-white"
                                : "bg-black/80 text-[#D9A650] border border-[#D9A650]/50 hover:border-[#F3B21A]"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-[#f7f7fa]">
                          Outcomes <span className="text-[#D9A650]/80 font-normal">(2–8)</span>
                        </label>
                        {createOutcomes.length < 8 && (
                          <button
                            onClick={() => setCreateOutcomes([...createOutcomes, ""])}
                            className="text-xs text-[#F3B21A] hover:underline"
                          >
                            + Add outcome
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {createOutcomes.map((o, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs text-[#D9A650]/80 w-5">{idx + 1}.</span>
                            <input
                              type="text"
                              value={o}
                              onChange={(e) => {
                                const next = [...createOutcomes];
                                next[idx] = e.target.value;
                                setCreateOutcomes(next);
                              }}
                              placeholder={`Outcome ${idx + 1}`}
                              className="flex-1 px-3 py-2 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm placeholder-[#D9A650]/50 focus:outline-none focus:border-[#F3B21A] transition"
                              disabled={creating}
                            />
                            {createOutcomes.length > 2 && (
                              <button
                                onClick={() => setCreateOutcomes(createOutcomes.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-300 text-xs px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Funding */}
                    <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
  <label className="block text-sm font-semibold mb-2 text-[#f7f7fa]">
    Initial Liquidity (USDT)
    <span className="text-[#D9A650]/80 font-normal ml-2">(seeds the FPMM)</span>
  </label>
  <input
    type="number"
    value={funding}
    onChange={(e) => setFunding(e.target.value)}
    placeholder="e.g. 100"
    className="w-full px-4 py-3 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm placeholder-[#D9A650]/50 focus:outline-none focus:border-[#F3B21A] transition"
    disabled={creating}
    min="1"
    step="1"
  />
</div>

                    {/* Info */}
                    <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 text-xs text-yellow-300 space-y-1">
                      <p>
                        <strong>Resolver:</strong>{" "}
                        <span className="font-mono break-all">{contracts.SIMPLE_RESOLVER}</span>
                      </p>
                      <p>
                        <strong>ConditionalTokens:</strong>{" "}
                        <span className="font-mono break-all">{contracts.CONDITIONAL_TOKEN}</span>
                      </p>
                      <p className="text-yellow-400/60">An FPMM will be automatically deployed after market creation.</p>
                    </div>

                    {createError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                        {createError}
                      </div>
                    )}

                    <button
                      onClick={handleCreateMarket}
                      disabled={creating || !createTitle.trim()}
                      className="w-full py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? "Creating Market..." : "Create Market"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── TAB: ADMINS ──────────────────────────────────────────────── */}
            {tab === "admins" && (
              <div className="space-y-6">
                <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Add Admin</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newAdminWallet}
                      onChange={(e) => setNewAdminWallet(e.target.value)}
                      placeholder="0x wallet address..."
                      className="flex-1 px-3 py-2 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm font-mono placeholder-[#D9A650]/40 focus:outline-none focus:border-[#F3B21A] transition"
                    />
                    <button
                      onClick={handleAddAdmin}
                      disabled={addingAdmin || !newAdminWallet.trim()}
                      className="px-4 py-2 bg-[#F3B21A] text-white text-sm font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
                    >
                      {addingAdmin ? "Adding..." : "Add"}
                    </button>
                  </div>
                  {addAdminMsg && (
                    <p className="text-xs mt-2 text-[#D9A650]">{addAdminMsg}</p>
                  )}
                </div>

                <div className="bg-black border border-[#D9A650]/50 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#D9A650]/50 flex items-center justify-between">
                    <h3 className="font-semibold">Admins ({admins.length})</h3>
                    <button onClick={fetchAdmins} className="text-xs text-[#F3B21A] hover:underline">
                      Refresh
                    </button>
                  </div>
                  {loadingAdmins ? (
                    <div className="p-6 text-center text-[#D9A650]/80 text-sm">Loading...</div>
                  ) : admins.length === 0 ? (
                    <div className="p-6 text-center text-[#D9A650]/80 text-sm">
                      No admins in DB (seed admin from .env.local is always active).
                    </div>
                  ) : (
                    <div className="divide-y divide-[#D9A650]/30">
                      {admins.map((a) => (
                        <div key={a._id} className="px-4 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm text-white">{a.wallet}</p>
                            <p className="text-xs text-[#D9A650]/80">
                              Added {new Date(a.addedAt).toLocaleDateString()} by{" "}
                              <span className="font-mono">{a.addedBy.slice(0, 8)}...</span>
                            </p>
                          </div>
                          {a.wallet.toLowerCase() !== address?.toLowerCase() && (
                            <button
                              onClick={() => handleRemoveAdmin(a.wallet)}
                              className="text-xs text-red-400 hover:text-red-300 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}