"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { supportedChain } from "@/lib/wagmi";
import { formatBalance, getNetworkName, parseWalletError, shortenAddress } from "@/lib/wallet";

type EthereumWindow = Window & {
  ethereum?: {
    isMetaMask?: boolean;
  };
};

export function useWalletSession() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    connect,
    connectors,
    error: connectError,
    isPending: isConnectPending,
  } = useConnect();
  const {
    disconnect,
    isPending: isDisconnectPending,
  } = useDisconnect();
  const {
    switchChainAsync,
    isPending: isSwitchPending,
  } = useSwitchChain();

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
  } = useBalance({
    address: address as Address | undefined,
    chainId: supportedChain.id,
    query: {
      enabled: Boolean(address),
    },
  });
  const [lastConnectError, setLastConnectError] = useState<string | null>(null);

  const metaMaskConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "metaMask") ??
    connectors[0];
  const isWrongNetwork = isConnected && chainId !== supportedChain.id;
  const networkName = isConnected ? getNetworkName(chainId) : "Not connected";

  const walletBalance = balanceData?.formatted ? `${formatBalance(balanceData.formatted)} ${balanceData.symbol}` : "--";
  const shortAddress = shortenAddress(address);

  useEffect(() => {
    if (connectError) {
      setLastConnectError(parseWalletError(connectError));
    }
  }, [connectError]);

  const connectWallet = async () => {
    if (typeof window !== "undefined") {
      const ethereumWindow = window as EthereumWindow;
      if (!ethereumWindow.ethereum?.isMetaMask) {
        return "MetaMask is not installed. Install MetaMask to continue.";
      }
    }

    if (!metaMaskConnector) {
      return "MetaMask connector is not available.";
    }

    try {
      setLastConnectError(null);
      connect(
        { connector: metaMaskConnector },
        {
          onError: (error) => {
            setLastConnectError(parseWalletError(error));
          },
        },
      );
      return null;
    } catch (error) {
      return parseWalletError(error);
    }
  };

  const switchToSepolia = async () => {
    try {
      await switchChainAsync({ chainId: supportedChain.id });
      return null;
    } catch (error) {
      return parseWalletError(error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  return {
    address,
    chainId,
    connectWallet,
    disconnectWallet,
    isBalanceLoading,
    isConnectPending,
    isConnected,
    isDisconnectPending,
    isSwitchPending,
    isWrongNetwork,
    lastConnectError,
    networkName,
    shortAddress,
    switchToSepolia,
    walletBalance,
    walletSymbol: balanceData?.symbol ?? "ETH",
  };
}
