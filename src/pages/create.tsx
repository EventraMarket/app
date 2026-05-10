import { useState, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { useWalletClient, usePublicClient } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { CONTRACT_ADDRESSES, CONDITIONAL_TOKEN_ABI } from "@/lib/contracts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const CATEGORIES = ["Politics", "Sports", "Crypto", "Finance", "Culture", "Esports", "Economy", "Other"];

export default function CreateMarketPage() {
  const router = useRouter();
  const { address, isConnected, connecting, connect } = useWallet();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Politics");
  const [outcomes, setOutcomes] = useState(["Yes", "No"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ conditionId: string; questionId: string } | null>(null);

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

  useEffect(() => {
    if (isConnected) checkAdmin();
    else setIsAdmin(false);
  }, [isConnected, checkAdmin]);

  // Derive a deterministic questionId from the title
  function deriveQuestionId(questionTitle: string): `0x${string}` {
    return keccak256(encodePacked(["string"], [questionTitle]));
  }

  async function handleCreate() {
    if (!walletClient || !publicClient || !address) return;
    if (!title.trim()) { setError("Question title is required."); return; }
    if (outcomes.some((o) => !o.trim())) { setError("All outcome labels must be filled."); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const questionId = deriveQuestionId(title.trim());

      // prepareCondition(oracle, questionId, outcomeSlotCount)
      // oracle = SimpleResolver address (you call resolve() later to settle the market)
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN as `0x${string}`,
        abi: CONDITIONAL_TOKEN_ABI,
        functionName: "prepareCondition",
        args: [
          CONTRACT_ADDRESSES.SIMPLE_RESOLVER as `0x${string}`,
          questionId,
          BigInt(outcomes.length),
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // conditionId = keccak256(resolver ++ questionId ++ outcomeCount)
      const conditionId = keccak256(
        encodePacked(
          ["address", "bytes32", "uint256"],
          [
            CONTRACT_ADDRESSES.SIMPLE_RESOLVER as `0x${string}`,
            questionId,
            BigInt(outcomes.length),
          ]
        )
      );

      // Save market metadata to MongoDB
      await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditionId,
          questionId,
          title: title.trim(),
          category,
          outcomes,
          outcomeSlotCount: outcomes.length,
          creator: address,
          resolver: CONTRACT_ADDRESSES.SIMPLE_RESOLVER,
          txHash: hash,
          blockNumber: Number(receipt.blockNumber),
        }),
      });

      setSuccess({ conditionId, questionId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg.length > 120 ? msg.slice(0, 120) + "..." : msg);
    } finally {
      setLoading(false);
    }
  }

  function addOutcome() {
    if (outcomes.length < 8) setOutcomes([...outcomes, ""]);
  }

  function removeOutcome(idx: number) {
    if (outcomes.length > 2) setOutcomes(outcomes.filter((_, i) => i !== idx));
  }

  function setOutcome(idx: number, val: string) {
    const next = [...outcomes];
    next[idx] = val;
    setOutcomes(next);
  }

  return (
    <div className={`${geistSans.className} min-h-screen text-white bg-transparent`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-[#D9A650]/80 mb-6">
          <Link href="/markets" className="hover:text-[#F3B21A] transition-colors">Markets</Link>
          <span>/</span>
          <span className="text-[#DED5A8]">Create Market</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Create a Prediction Market</h1>
        <p className="text-[#D9A650] mb-8 text-sm">
          Calls <code className="text-yellow-400 bg-black/40 px-1 rounded">prepareCondition()</code> on
          ConditionalTokens. The market is resolved later by calling{" "}
          <code className="text-yellow-400 bg-black/40 px-1 rounded">resolve()</code> on SimpleResolver.
        </p>

        {!isConnected ? (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl p-8 text-center">
            <p className="text-[#D9A650] mb-4">Connect your wallet to create a market.</p>
            <button
              onClick={connect}
              disabled={connecting}
              className="px-6 py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : checkingAdmin ? (
          <div className="bg-black border border-[#D9A650]/50 rounded-xl p-8 text-center text-[#D9A650]/80 text-sm">
            Checking admin status...
          </div>
        ) : !isAdmin ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center space-y-3">
            <p className="text-red-400 font-semibold">Access Denied</p>
            <p className="text-[#D9A650] text-sm">
              Only admins can create markets.{" "}
              <span className="font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span> is not an admin.
            </p>
            <Link href="/markets" className="inline-block text-sm text-[#F3B21A] hover:underline">
              ← Browse Markets
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
              <label className="block text-sm font-semibold mb-2 text-[#f7f7fa]">
                Question / Market Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Will Bitcoin hit $200k by end of 2026?"
                className="w-full px-4 py-3 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm placeholder-[#D9A650]/50 focus:outline-none focus:border-[#F3B21A] transition"
                disabled={loading}
              />
              {title && (
                <p className="mt-2 text-xs text-[#D9A650]/80 font-mono break-all">
                  questionId: {deriveQuestionId(title.trim())}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="bg-black border border-[#D9A650]/50 rounded-xl p-6">
              <label className="block text-sm font-semibold mb-2 text-[#f7f7fa]">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      category === c
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
                {outcomes.length < 8 && (
                  <button onClick={addOutcome} className="text-xs text-[#F3B21A] hover:underline">
                    + Add outcome
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {outcomes.map((o, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-[#D9A650]/80 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={o}
                      onChange={(e) => setOutcome(idx, e.target.value)}
                      placeholder={`Outcome ${idx + 1}`}
                      className="flex-1 px-3 py-2 bg-black/80 border border-[#D9A650]/50 rounded-lg text-white text-sm placeholder-[#D9A650]/50 focus:outline-none focus:border-[#F3B21A] transition"
                      disabled={loading}
                    />
                    {outcomes.length > 2 && (
                      <button
                        onClick={() => removeOutcome(idx)}
                        className="text-red-400 hover:text-red-300 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#D9A650]/80 mt-3">
                Index set encoding: outcome 1 = <code className="text-yellow-400">0b01 (1)</code>, outcome 2 = <code className="text-yellow-400">0b10 (2)</code>, etc.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 text-xs text-yellow-300 space-y-1">
              <p><strong>Resolver:</strong> <span className="font-mono break-all">{CONTRACT_ADDRESSES.SIMPLE_RESOLVER}</span></p>
              <p><strong>ConditionalTokens:</strong> <span className="font-mono break-all">{CONTRACT_ADDRESSES.CONDITIONAL_TOKEN}</span></p>
              <p className="text-[#D9A650] pt-1">After creating, go to your Dashboard to resolve it once the event happens.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm space-y-2">
                <p className="text-green-400 font-semibold">Market created on-chain!</p>
                <p className="text-xs text-[#D9A650] font-mono break-all">conditionId: {success.conditionId}</p>
                <p className="text-xs text-[#D9A650] font-mono break-all">questionId: {success.questionId}</p>
                <div className="flex gap-3 pt-2">
                  <Link href="/dashboard" className="text-xs text-[#F3B21A] hover:underline">
                    View Dashboard →
                  </Link>
                  <button
                    onClick={() => { setSuccess(null); setTitle(""); setOutcomes(["Yes", "No"]); }}
                    className="text-xs text-[#D9A650] hover:underline"
                  >
                    Create another
                  </button>
                </div>
              </div>
            )}

            {!success && (
              <button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
                className="w-full py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:bg-[#D9A650] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Market..." : "Create Market"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
