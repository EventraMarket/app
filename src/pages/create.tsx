import { useState, useEffect, useCallback } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { keccak256, encodePacked, parseAbiItem, decodeEventLog, parseUnits } from "viem";
import { getContracts, CONTRACT_ADDRESSES, FPMM_ABI,  USDC_ABI, CONDITIONAL_TOKEN_ABI, FPMM_FACTORY_ABI} from "@/lib/contracts";

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
const { chainId } = useAccount();
const contracts = getContracts(chainId);
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
        // address: CONTRACT_ADDRESSES.CONDITIONAL_TOKEN as `0x${string}`,
         address: contracts.CONDITIONAL_TOKEN as `0x${string}`,
        abi: CONDITIONAL_TOKEN_ABI,
        functionName: "prepareCondition",
        args: [
          contracts.SIMPLE_RESOLVER as `0x${string}`,
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
            contracts.SIMPLE_RESOLVER as `0x${string}`,
            questionId,
            BigInt(outcomes.length),
          ]
        )
      );

      // Save market metadata to MongoDB
    //  const dbPayload =  await fetch("/api/markets", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
       const dbPayload = {
          conditionId,
          questionId,
          title: title.trim(),
          category,
          outcomes,
          outcomeSlotCount: outcomes.length,
          creator: address,
          resolver: contracts.SIMPLE_RESOLVER,
          txHash: hash,
          blockNumber: Number(receipt.blockNumber),
          chainId: Number(chainId),
        }
    
     console.log("databas Payload", dbPayload);
      const res = await fetch("/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPayload),
    });
    console.log("databas response", res);
    if (!res.ok) {
      throw new Error("Failed to save market to database.");
    }
     
    // 3. Deploy FPMM for this market

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

//console.log("✅ FPMM will be deployed at:", fpmmAddress);

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
    // // Decode the event to get the new FPMM address
    // const event = parseAbiItem(
    //   'event FixedProductMarketMakerCreation(address indexed creator, address fixedProductMarketMaker, address indexed conditionalTokens, address indexed collateralToken, bytes32[] conditionIds, uint256 fee)'
    // );
    
    // const log = fpmmReceipt.logs.find((l) => l.topics[0] === event.topic);
    // if (!log) throw new Error("FPMM creation event not found");

    // const decoded = decodeEventLog({
    //   abi: [event],
    //   data: log.data,
    //   topics: log.topics,
    // });
    // console.log("log checking", decoded);
    // const fpmmAddress = decoded.args.fixedProductMarketMaker as string;

    // console.log("✅ FPMM deployed at:", fpmmAddress);
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
    // // console.log("fpmm response", fpmmRes);
    // if (!fpmmRes.ok) {
    //   console.warn("FPMM deployment failed, but market was created.");
    //   // Still show success, but warn the user
    //   setSuccess({ conditionId, questionId });
    //   setError("Market created, but FPMM deployment failed. Please try again later.");
    //   setLoading(false);
    //   return;
    // }

    // const { fpmmAddress } = await fpmmRes.json();
    // console.log("✅ FPMM deployed at:", fpmmAddress);

    // Optionally update the market record with the fpmmAddress (you can call PATCH)
    await fetch("/api/markets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditionId, fpmmAddress }),
    });

     const seedAmount = parseUnits("1", 6); // 100 USDC
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

  console.log("✅ FPMM will be deployed at:", fpmmAddress);
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
            <div className="bg-black border border-[#D9A650]/50 rounded-xl p-4 text-xs space-y-1.5">
              <p className="text-white"><strong className="text-[#F3B21A]">Resolver:</strong> <span className="font-mono break-all text-[#D9A650]">{contracts.SIMPLE_RESOLVER}</span></p>
              <p className="text-white"><strong className="text-[#F3B21A]">ConditionalTokens:</strong> <span className="font-mono break-all text-[#D9A650]">{contracts.CONDITIONAL_TOKEN}</span></p>
              <p className="text-white/70 pt-1 border-t border-[#D9A650]/20">After creating, go to your Dashboard to resolve it once the event happens.</p>
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


// import { useState, useEffect, useCallback } from "react";
// import { Geist } from "next/font/google";
// import Link from "next/link";
// import { useRouter } from "next/router";
// import Navbar from "@/components/Navbar";
// import { useWallet } from "@/context/WalletContext";
// import { useWalletClient, usePublicClient, useAccount } from "wagmi";
// import { keccak256, encodePacked } from "viem";
// import { getContracts, CONTRACT_ADDRESSES, CONDITIONAL_TOKEN_ABI } from "@/lib/contracts";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const CATEGORIES = ["Politics", "Sports", "Crypto", "Finance", "Culture", "Esports", "Economy", "Other"];

// export default function CreateMarketPage() {
//   const router = useRouter();
//   const { address, isConnected, connecting, connect } = useWallet();
//   const { data: walletClient } = useWalletClient();
//   const publicClient = usePublicClient();
//   const { chainId } = useAccount();
//   const contracts = getContracts(chainId);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [checkingAdmin, setCheckingAdmin] = useState(false);

//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("Politics");
//   const [outcomes, setOutcomes] = useState(["Yes", "No"]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<{ conditionId: string; questionId: string } | null>(null);
//   const [description, setDescription] = useState("");

//   const checkAdminStatus = useCallback(async () => {
//     if (!address) return;
//     setCheckingAdmin(true);
//     try {
//       // /api/admin only recognizes ?action=admins (auth via the
//       // x-admin-wallet header) and responds with res.ok for an admin,
//       // 403 otherwise. There is no ?address= route and no `isAdmin`
//       // field in the response — that mismatch was causing every wallet,
//       // including real admins, to be denied.
//       const res = await fetch("/api/admin?action=admins", {
//         headers: { "x-admin-wallet": address },
//       });
//       setIsAdmin(res.ok);
//     } catch (err) {
//       console.error(err);
//       setIsAdmin(false);
//     } finally {
//       setCheckingAdmin(false);
//     }
//   }, [address]);

//   useEffect(() => {
//     if (isConnected && address) {
//       checkAdminStatus();
//     } else {
//       setIsAdmin(false);
//     }
//   }, [isConnected, address, checkAdminStatus]);

//   const handleOutcomeChange = (index: number, value: string) => {
//     const updated = [...outcomes];
//     updated[index] = value;
//     setOutcomes(updated);
//   };

//   const addOutcomeSlot = () => {
//     if (outcomes.length >= 4) return;
//     setOutcomes([...outcomes, ""]);
//   };

//   const removeOutcomeSlot = (index: number) => {
//     if (outcomes.length <= 2) return;
//     setOutcomes(outcomes.filter((_, i) => i !== index));
//   };

//   const handleCreate = async () => {
//     if (!walletClient || !publicClient) {
//       setError("Wallet connection missing or invalid.");
//       return;
//     }
//     if (!title.trim()) {
//       setError("Market title cannot be blank.");
//       return;
//     }
//     if (outcomes.some(o => !o.trim())) {
//       setError("All outcome slots must be completely filled out.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     // try {
//     //   // Read the chain ID directly from the connected wallet client instead of
//     //   // trusting wagmi's useAccount() React state, which can be stale right
//     //   // after a network switch (the tx itself goes through fine via
//     //   // walletClient since that's tied to the live provider, but a stale
//     //   // React chainId was silently mislabeling which chain the market got
//     //   // saved under in the DB).
//     //   const activeChainId = await walletClient.getChainId();
//     //   const activeContracts = getContracts(activeChainId);

//     //   const nonce = Date.now().toString();
//     //   const questionId = keccak256(encodePacked(["string"], [title + nonce]));

//     //   // 1. Core Smart Contract Call Interacting with target active network deployment addresses
//     //   const hash = await walletClient.writeContract({
//     //     address: activeContracts.CONDITIONAL_TOKEN as `0x${string}`,
//     //     abi: CONDITIONAL_TOKEN_ABI,
//     //     functionName: "prepareCondition",
//     //     args: [
//     //       activeContracts.SIMPLE_RESOLVER as `0x${string}`,
//     //       questionId,
//     //       BigInt(outcomes.length),
//     //     ],
//     //   });

//     //   const receipt = await publicClient.waitForTransactionReceipt({ hash });

//     //   const conditionId = await publicClient.readContract({
//     //     address: activeContracts.CONDITIONAL_TOKEN as `0x${string}`,
//     //     abi: CONDITIONAL_TOKEN_ABI,
//     //     functionName: "getConditionId",
//     //     args: [
//     //       activeContracts.SIMPLE_RESOLVER as `0x${string}`,
//     //       questionId,
//     //       BigInt(outcomes.length),
//     //     ],
//     //   }) as string;

//     //   // 2. Database payload uses the SAME activeChainId read above, so the
//     //   // on-chain call, the contract addresses, and the DB record can never
//     //   // disagree about which chain this market lives on.
//     //   const dbPayload = {
//     //     title,
//     //     description,
//     //     outcomes,
//     //     outcomeSlotCount: outcomes.length,
//     //     category,
//     //     questionId,
//     //     conditionId,
//     //     creator: address,
//     //     resolver: activeContracts.SIMPLE_RESOLVER,
//     //     txHash: hash,
//     //     blockNumber: Number(receipt.blockNumber),
//     //     chainId: activeChainId,
//     //   };

//     //   const res = await fetch("/api/markets", {
//     //     method: "POST",
//     //     headers: { "Content-Type": "application/json" },
//     //     body: JSON.stringify(dbPayload),
//     //   });

//     //   if (!res.ok) {
//     //     throw new Error("On-chain call succeeded but backend indexing registry record insertion failed.");
//     //   }

//     //   setSuccess({ conditionId, questionId });
//     // } catch (err: any) {
//     //   console.error(err);
//     //   setError(err.message || "An unexpected error disrupted market creation cycles.");
//     // } finally {
//     //   setLoading(false);
//     // }

//   try {
//     const activeChainId = await walletClient.getChainId();
//     const activeContracts = getContracts(activeChainId);

//     const nonce = Date.now().toString();
//     const questionId = keccak256(encodePacked(["string"], [title + nonce]));

//     // 1. Prepare condition on-chain
//     const hash = await walletClient.writeContract({
//       address: activeContracts.CONDITIONAL_TOKEN as `0x${string}`,
//       abi: CONDITIONAL_TOKEN_ABI,
//       functionName: "prepareCondition",
//       args: [
//         activeContracts.SIMPLE_RESOLVER as `0x${string}`,
//         questionId,
//         BigInt(outcomes.length),
//       ],
//     });

//     const receipt = await publicClient.waitForTransactionReceipt({ hash });

//     const conditionId = await publicClient.readContract({
//       address: activeContracts.CONDITIONAL_TOKEN as `0x${string}`,
//       abi: CONDITIONAL_TOKEN_ABI,
//       functionName: "getConditionId",
//       args: [
//         activeContracts.SIMPLE_RESOLVER as `0x${string}`,
//         questionId,
//         BigInt(outcomes.length),
//       ],
//     }) as string;

//     // 2. Save market to DB
//     const dbPayload = {
//       title,
//       description,
//       outcomes,
//       outcomeSlotCount: outcomes.length,
//       category,
//       questionId,
//       conditionId,
//       creator: address,
//       resolver: activeContracts.SIMPLE_RESOLVER,
//       txHash: hash,
//       blockNumber: Number(receipt.blockNumber),
//       chainId: activeChainId,
//     };

//     const res = await fetch("/api/markets", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(dbPayload),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to save market to database.");
//     }

//     // 3. Deploy FPMM for this market
//     const fpmmRes = await fetch("/api/fpmm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         conditionId,
//         collateralToken: activeContracts.USDC,
//         conditionalTokens: activeContracts.CONDITIONAL_TOKEN,
//         fee: "10000000000000000", // 1%
//       }),
//     });

//     if (!fpmmRes.ok) {
//       console.warn("FPMM deployment failed, but market was created.");
//       // Still show success, but warn the user
//       setSuccess({ conditionId, questionId });
//       setError("Market created, but FPMM deployment failed. Please try again later.");
//       setLoading(false);
//       return;
//     }

//     const { fpmmAddress } = await fpmmRes.json();
//     console.log("✅ FPMM deployed at:", fpmmAddress);

//     // Optionally update the market record with the fpmmAddress (you can call PATCH)
//     await fetch("/api/markets", {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ conditionId, fpmmAddress }),
//     });

//     setSuccess({ conditionId, questionId });
//     setError(null);
//   } catch (err: any) {
//     console.error(err);
//     setError(err.message || "An unexpected error occurred.");
//   } finally {
//     setLoading(false);
//   }
// };
//   };

//   if (connecting || checkingAdmin) {
//     return (
//       <div className={`${geistSans.variable} min-h-screen bg-black text-white font-sans flex items-center justify-center`}>
//         <p className="text-[#D9A650] text-sm animate-pulse">Verifying network administration nodes...</p>
//       </div>
//     );
//   }

//   if (!isConnected || !isAdmin) {
//     return (
//       <div className={`${geistSans.variable} min-h-screen bg-black text-white font-sans flex flex-col`}>
//         <Navbar />
//         <div className="flex-1 flex flex-col items-center justify-center p-4">
//           <div className="max-w-md w-full text-center border border-red-500/30 bg-red-500/5 rounded-2xl p-8 space-y-4">
//             <h2 className="text-xl font-bold text-red-400">Access Restricted</h2>
//             <p className="text-sm text-zinc-400">
//               {!isConnected 
//                 ? "Please establish an authorized wallet connection session to proceed." 
//                 : "Your connected wallet address does not retain protocol admin privileges."}
//             </p>
//             {!isConnected && (
//               <button onClick={connect} className="px-6 py-2 bg-[#F3B21A] hover:bg-[#D9A650] text-white font-semibold rounded-lg transition text-sm">
//                 Connect Wallet
//               </button>
//             )}
//             <Link href="/" className="block text-xs text-[#D9A650] hover:underline pt-2">
//               ← Return Home
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`${geistSans.variable} min-h-screen bg-black text-white font-sans flex flex-col pb-12`}>
//       <Navbar />
//       <div className="max-w-2xl w-full mx-auto px-4 mt-8 flex-1">
//         <div className="space-y-2 mb-6">
//           <h1 className="text-2xl font-bold tracking-tight">Create Prediction Market</h1>
//           <p className="text-xs text-[#D9A650]/80">
//             Target Chain Path: <span className="text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{chainId === 11142220 ? "Celo Sepolia" : "Base Sepolia"}</span>
//           </p>
//         </div>

//         <div className="bg-zinc-950 border border-[#D9A650]/30 rounded-2xl p-6 space-y-5 shadow-xl">
//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-[#D9A650]">Market Title / Proposal Question</label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g. Will ETH break above $5000 before end of Q3?"
//               className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A650] placeholder-zinc-600"
//             />
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-xs font-semibold text-[#D9A650]">Description / Context</label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Provide exact rules and resolution details here..."
//               rows={3}
//               className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A650] placeholder-zinc-600 resize-none"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-[#D9A650]">Category</label>
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A650]"
//               >
//                 {CATEGORIES.map((cat) => (
//                   <option key={cat} value={cat}>{cat}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <label className="text-xs font-semibold text-[#D9A650]">Outcome Choices</label>
//               {outcomes.length < 4 && (
//                 <button onClick={addOutcomeSlot} className="text-[11px] text-[#F3B21A] hover:underline">
//                   + Add Option
//                 </button>
//               )}
//             </div>
//             <div className="space-y-2">
//               {outcomes.map((outcome, idx) => (
//                 <div key={idx} className="flex gap-2 items-center">
//                   <input
//                     type="text"
//                     value={outcome}
//                     onChange={(e) => handleOutcomeChange(idx, e.target.value)}
//                     placeholder={`Option ${idx + 1}`}
//                     className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D9A650] placeholder-zinc-700"
//                   />
//                   {outcomes.length > 2 && (
//                     <button onClick={() => removeOutcomeSlot(idx)} className="text-zinc-500 hover:text-red-400 text-xs px-2">
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">
//               {error}
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm space-y-2">
//               <p className="text-green-400 font-semibold">Market created on-chain!</p>
//               <p className="text-xs text-[#D9A650] font-mono break-all">conditionId: {success.conditionId}</p>
//               <p className="text-xs text-[#D9A650] font-mono break-all">questionId: {success.questionId}</p>
//               <div className="flex gap-3 pt-2">
//                 <Link href="/dashboard" className="text-xs text-[#F3B21A] hover:underline">
//                   View Dashboard →
//                 </Link>
//                 <button
//                   onClick={() => { setSuccess(null); setTitle(""); setDescription(""); setOutcomes(["Yes", "No"]); }}
//                   className="text-xs text-[#D9A650] hover:underline"
//                 >
//                   Create another
//                 </button>
//               </div>
//             </div>
//           )}

//           {!success && (
//             <button
//               onClick={handleCreate}
//               disabled={loading || !title.trim()}
//               className="w-full py-3 bg-[#F3B21A] text-white font-bold rounded-lg hover:bg-[#D9A650] transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Creating Market..." : "Deploy Market"}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }