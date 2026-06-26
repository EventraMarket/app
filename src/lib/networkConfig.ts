import { http, createConfig } from "wagmi";
import { celo, celoSepolia,baseSepolia, } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// All contracts deployed on Base Sepolia (chainId 84532)
// export const TESTNET_CHAIN = baseSepolia;
// export const TESTNET_CHAIN_ID = baseSepolia.id;

export const wagmiConfig = createConfig({
  chains: [celo,baseSepolia, celoSepolia],
  connectors: [injected()],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
