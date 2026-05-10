import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// All contracts deployed on Base Sepolia (chainId 84532)
export const TESTNET_CHAIN = baseSepolia;
export const TESTNET_CHAIN_ID = baseSepolia.id;

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
