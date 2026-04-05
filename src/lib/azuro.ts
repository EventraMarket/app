import { http, createConfig } from "wagmi";
import { polygonAmoy, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Azuro testnet: Polygon Amoy (80002)
// Bet token: USDT on Amoy
export const TESTNET_CHAIN = polygonAmoy;
export const TESTNET_CHAIN_ID = polygonAmoy.id; // 80002

export const wagmiConfig = createConfig({
  chains: [polygonAmoy, baseSepolia],
  connectors: [injected()],
  transports: {
    [polygonAmoy.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
