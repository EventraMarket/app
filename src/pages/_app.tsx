import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AzuroSDKProvider } from "@azuro-org/sdk";
import { wagmiConfig, TESTNET_CHAIN_ID } from "@/lib/azuro";
import { WalletProvider } from "@/context/WalletContext";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AzuroSDKProvider initialChainId={TESTNET_CHAIN_ID}>
          <WalletProvider>
            <Component {...pageProps} />
          </WalletProvider>
        </AzuroSDKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
