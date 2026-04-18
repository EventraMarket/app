import { AzuroSDKProvider } from "@azuro-org/sdk";
import type { AppProps } from "next/dist/pages/_app";
import { wagmiConfig, TESTNET_CHAIN_ID } from "@/lib/azuro";
import { WagmiProvider } from "wagmi";
import "@/styles/globals.css";




import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { WalletProvider } from "@/context/WalletContext";
const MobileTabBar = dynamic(() => import("@/components/MobileTabBar"), { ssr: false });

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AzuroSDKProvider initialChainId={TESTNET_CHAIN_ID}>
          <WalletProvider>
            <Component {...pageProps} />
            <MobileTabBar />
          </WalletProvider>
        </AzuroSDKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
