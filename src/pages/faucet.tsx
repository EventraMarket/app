import { useState, useEffect } from "react";
import { Geist } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const FAUCET_CONTRACT = "0xCf1b86ceD971b88C042C64A9c099377e2738073C" as const;
const MINT_AMOUNT = "100"; // 100 USDT per claim

const FAUCET_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function FaucetPage() {
  const { address, isConnected, connecting, connect } = useWallet();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [balance, setBalance] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(6);
  const [tokenSymbol, setTokenSymbol] = useState<string>("USDT");
  const [minting, setMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fetch token info and balance
  useEffect(() => {
    if (!publicClient || !address) return;

    async function fetchTokenInfo() {
      try {
        const [dec, sym, bal] = await Promise.all([
          publicClient!.readContract({
            address: FAUCET_CONTRACT,
            abi: FAUCET_ABI,
            functionName: "decimals",
          }),
          publicClient!.readContract({
            address: FAUCET_CONTRACT,
            abi: FAUCET_ABI,
            functionName: "symbol",
          }),
          publicClient!.readContract({
            address: FAUCET_CONTRACT,
            abi: FAUCET_ABI,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          }),
        ]);
        setDecimals(dec);
        setTokenSymbol(sym);
        setBalance(formatUnits(bal, dec));
      } catch (err) {
        console.error("Failed to fetch token info:", err);
      }
    }

    fetchTokenInfo();
  }, [publicClient, address, mintSuccess]);

  async function handleMint() {
    if (!walletClient || !publicClient || !address) return;

    setMinting(true);
    setMintError(null);
    setMintSuccess(false);
    setTxHash(null);

    try {
      const amount = parseUnits(MINT_AMOUNT, decimals);

      const hash = await walletClient.writeContract({
        address: FAUCET_CONTRACT,
        abi: FAUCET_ABI,
        functionName: "mint",
        args: [amount],
      });

      setTxHash(hash);

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      setMintSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      // Simplify long error messages
      if (errorMessage.includes("User rejected")) {
        setMintError("Transaction rejected by user");
      } else if (errorMessage.includes("insufficient funds")) {
        setMintError("Insufficient MATIC for gas fees. Get testnet MATIC from a Polygon Amoy faucet first.");
      } else {
        setMintError(errorMessage.length > 100 ? errorMessage.slice(0, 100) + "..." : errorMessage);
      }
    } finally {
      setMinting(false);
    }
  }

  return (
    <div className={`${geistSans.className} min-h-screen text-white`}>
      <Navbar />

      <main className="pt-20 md:pt-24 pb-20 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Testnet Faucet</h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Claim free testnet {tokenSymbol} to start trading on prediction markets
          </p>
        </div>

        {/* Faucet Card */}
        <div className="bg-[var(--color-card)] border border-[var(--color-accent2)] rounded-2xl p-8">
          {/* Token Info */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-accent2)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                <span className="text-lg font-bold text-[#22c55e]">$</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{tokenSymbol}</h3>
                <p className="text-xs text-gray-500">Polygon Amoy Testnet</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Amount per claim</p>
              <p className="text-xl font-bold text-[var(--color-accent2)]">{MINT_AMOUNT} {tokenSymbol}</p>
            </div>
          </div>

          {/* Balance Display */}
          {isConnected && (
            <div className="bg-[var(--color-card)] border border-[var(--color-accent2)] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Balance</p>
                  <p className="text-lg font-semibold text-white">
                    {parseFloat(balance).toFixed(2)} {tokenSymbol}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Wallet</p>
                  <p className="text-sm font-mono text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Area */}
          {!isConnected ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-4">Connect your wallet to claim testnet tokens</p>
              <button
                onClick={connect}
                disabled={connecting}
                className="px-8 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] text-black font-semibold rounded-lg hover:from-[var(--color-accent2)] hover:to-[var(--color-accent)] transition-all shadow-lg shadow-[var(--color-accent2)]/25 disabled:opacity-50"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleMint}
                disabled={minting}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] text-black font-bold rounded-lg hover:from-[var(--color-accent2)] hover:to-[var(--color-accent)] transition-all shadow-lg shadow-[var(--color-accent2)]/25 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {minting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Minting...
                  </span>
                ) : (
                  `Claim ${MINT_AMOUNT} ${tokenSymbol}`
                )}
              </button>

              {/* Success Message */}
              {mintSuccess && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-400 font-medium">
                    Successfully minted {MINT_AMOUNT} {tokenSymbol}!
                  </p>
                  {txHash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-400/70 hover:text-green-400 underline mt-1 inline-block"
                    >
                      View transaction on PolygonScan &rarr;
                    </a>
                  )}
                </div>
              )}

              {/* Error Message */}
              {mintError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-400">{mintError}</p>
                </div>
              )}
            </div>
          )}

          {/* Contract Info */}
          <div className="mt-8 pt-6 border-t border-[var(--color-accent2)]">
            <p className="text-xs text-gray-500 mb-2">Contract Address</p>
            <a
              href={`https://amoy.polygonscan.com/address/${FAUCET_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[var(--color-accent2)] hover:text-[var(--color-accent)] transition-colors break-all"
            >
              {FAUCET_CONTRACT}
            </a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-[var(--color-card)] border border-[var(--color-accent2)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Need Testnet MATIC?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              You need a small amount of MATIC for gas fees. Get free testnet MATIC from the{" "}
              <a
                href="https://faucet.polygon.technology/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent2)] hover:text-[var(--color-accent)] underline"
              >
                Polygon Faucet
              </a>.
            </p>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-accent2)] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">What can I do with {tokenSymbol}?</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use your testnet {tokenSymbol} to trade on prediction markets.{" "}
              <Link href="/markets" className="text-[var(--color-accent2)] hover:text-[var(--color-accent)] underline">
                Browse markets
              </Link>{" "}
              and start making predictions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
