import { createContext, useContext, useCallback, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import type { Address } from "viem";

interface WalletContextValue {
  address: Address | undefined;
  isConnected: boolean;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  isConnected: false,
  connecting: false,
  connect: () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect: wagmiConnect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const connect = useCallback(() => {
    wagmiConnect({ connector: injected() });
  }, [wagmiConnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connecting: isConnecting || isReconnecting,
        connect,
        disconnect: wagmiDisconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
