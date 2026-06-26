// import type { AppProps } from "next/dist/pages/_app";
// import { wagmiConfig } from "@/lib/networkConfig";
// import { WagmiProvider } from "wagmi";
// import "@/styles/globals.css";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import dynamic from "next/dynamic";
// import { WalletProvider } from "@/context/WalletContext";

// const MobileTabBar = dynamic(() => import("@/components/MobileTabBar"), { ssr: false });

// const queryClient = new QueryClient();

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <WalletProvider>
//           <Component {...pageProps} />
//           <MobileTabBar />
//         </WalletProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }


import type { AppProps } from "next/dist/pages/_app";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { celo, celoSepolia, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css"; // Required CSS
import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { WalletProvider } from "@/context/WalletContext";

const MobileTabBar = dynamic(() => import("@/components/MobileTabBar"), { ssr: false });

// Configure RainbowKit with your chains
const config = getDefaultConfig({
  appName: "Eventra",
  projectId: "YOUR_PROJECT_ID", // Get this from WalletConnect Cloud
  chains: [celo, celoSepolia, baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: '#F3B21A', accentColorForeground: 'black' })}>
          <WalletProvider>
            <Component {...pageProps} />
            <MobileTabBar />
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}