import type { Address } from "viem";

export function shortenAddress(address?: Address | string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance?: string | null) {
  if (!balance) return "--";

  const value = Number(balance);
  if (Number.isNaN(value)) return balance;
  if (value === 0) return "0.0000";
  if (value < 0.0001) return "<0.0001";
  if (value < 1) return value.toFixed(4);
  if (value < 100) return value.toFixed(3);
  return value.toFixed(2);
}

export function getNetworkName(chainId?: number) {
  if (!chainId) return "Not connected";
  if (chainId === 11155111) return "Sepolia";
  if (chainId === 1) return "Ethereum Mainnet";
  if (chainId === 17000) return "Holesky";
  return `Unsupported (${chainId})`;
}

export function parseWalletError(error: unknown) {
  const fallback = "Wallet request failed. Please try again.";

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const walletError = error as {
    code?: number;
    message?: string;
    shortMessage?: string;
    cause?: { code?: number; message?: string };
  };

  const code = walletError.code ?? walletError.cause?.code;
  const message = walletError.shortMessage ?? walletError.message ?? walletError.cause?.message ?? "";
  const normalized = message.toLowerCase();

  if (code === 4001 || normalized.includes("user rejected")) {
    return "Wallet connection request was rejected.";
  }

  if (normalized.includes("connector not found") || normalized.includes("provider not found")) {
    return "MetaMask is not installed. Install MetaMask to continue.";
  }

  if (normalized.includes("switch chain")) {
    return "Unable to switch networks automatically. Open MetaMask and switch to Sepolia.";
  }

  return message || fallback;
}
