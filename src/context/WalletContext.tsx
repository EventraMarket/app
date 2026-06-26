import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, injected } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { Address } from "viem";

interface WalletContextValue {
  address: Address | undefined;
  isConnected: boolean;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
  isMiniPay: boolean;
}

const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  isConnected: false,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
  isMiniPay: false,
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Safe checks for the injected window context provider flags
  const isMiniPay = typeof window !== "undefined" && !!(window.ethereum as any)?.isMiniPay;

  useEffect(() => {
    // If running within MiniPay, bypass buttons and run immediate background auto-connection
    if (isMiniPay && !isConnected) {
      connect({ connector: injected() });
    }
  }, [isMiniPay, isConnected, connect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connecting: isConnecting || isReconnecting,
        connect: isMiniPay ? () => {} : (openConnectModal || (() => {})),
        disconnect,
        isMiniPay,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}