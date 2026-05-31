"use client";

import { useMemo, useState } from "react";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import type { Address, Hex } from "viem";
import { decodeEventLog, formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { supportedChain } from "@/lib/wagmi";
import { parseWalletError } from "@/lib/wallet";
import {
  CASINO_VAULT_ABI,
  CASINO_VAULT_ADDRESS,
  CREDITS_PER_ETH,
  hasDeployedContracts,
} from "@/src/lib/contracts";

export type TxPhase =
  | "idle"
  | "waiting-wallet"
  | "submitted"
  | "confirming"
  | "completed"
  | "failed";

export type TxState = {
  action: "deposit" | "withdraw" | "play" | null;
  error: string | null;
  hash: Hex | null;
  phase: TxPhase;
};

export type PlayOutcome = {
  betAmount: number;
  payout: number;
  randomValue: number;
  txHash: Hex;
  won: boolean;
};

function formatMomo(value?: bigint) {
  return Number(formatUnits(value ?? BigInt(0), 18));
}

function getFriendlyError(error: unknown) {
  const message = parseWalletError(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("insufficient funds")) {
    return "Insufficient Sepolia ETH for gas or deposit.";
  }

  if (normalized.includes("liquidity")) {
    return "Contract has insufficient ETH liquidity for this withdrawal or payout.";
  }

  return message;
}

export function ethToMomoCredits(ethAmount: number) {
  return ethAmount * CREDITS_PER_ETH;
}

export function momoCreditsToEth(momoAmount: number) {
  return momoAmount / CREDITS_PER_ETH;
}

export function useOnchainMomoState(address?: Address) {
  const publicClient = usePublicClient({ chainId: supportedChain.id });
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxState>({
    action: null,
    error: null,
    hash: null,
    phase: "idle",
  });

  const canRead = Boolean(address && hasDeployedContracts);

  const { data: casinoBalanceRaw = BigInt(0), refetch: refetchCasinoBalance } = useReadContract({
    abi: CASINO_VAULT_ABI,
    address: hasDeployedContracts ? (CASINO_VAULT_ADDRESS as Address) : undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: supportedChain.id,
    query: {
      enabled: canRead,
      refetchInterval: 10000,
    },
  });

  const { data: contractEthLiquidityRaw = BigInt(0), refetch: refetchLiquidity } = useReadContract({
    abi: CASINO_VAULT_ABI,
    address: hasDeployedContracts ? (CASINO_VAULT_ADDRESS as Address) : undefined,
    functionName: "creditsToEth",
    args: [casinoBalanceRaw],
    chainId: supportedChain.id,
    query: {
      enabled: hasDeployedContracts,
      refetchInterval: 10000,
    },
  });

  const casinoMomoBalance = useMemo(() => formatMomo(casinoBalanceRaw), [casinoBalanceRaw]);
  const contractEthLiquidity = useMemo(
    () => Number(formatEther(contractEthLiquidityRaw)),
    [contractEthLiquidityRaw],
  );

  const refetchAll = async () => {
    await Promise.all([refetchCasinoBalance(), refetchLiquidity()]);
  };

  const runWrite = async (params: {
    action: NonNullable<TxState["action"]>;
    args?: readonly unknown[];
    functionName: "deposit" | "withdraw" | "play";
    value?: bigint;
  }) => {
    if (!publicClient) {
      return { error: "Public client unavailable for Sepolia.", hash: null as Hex | null };
    }

    try {
      setTxState({
        action: params.action,
        error: null,
        hash: null,
        phase: "waiting-wallet",
      });

      const hash = await writeContractAsync({
        abi: CASINO_VAULT_ABI as any,
        address: CASINO_VAULT_ADDRESS as Address,
        functionName: params.functionName as any,
        args: params.args as any,
        chainId: supportedChain.id,
        value: params.value,
      });

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "submitted",
      });

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "confirming",
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      await refetchAll();

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "completed",
      });

      return { error: null, hash, receipt };
    } catch (error) {
      const message = getFriendlyError(error);
      setTxState({
        action: params.action,
        error: message,
        hash: null,
        phase: "failed",
      });
      return { error: message, hash: null as Hex | null, receipt: null };
    }
  };

  const deposit = async (amountEth: string) =>
    runWrite({
      action: "deposit",
      functionName: "deposit",
      value: parseEther(amountEth),
    });

  const withdraw = async (amountMomo: string) =>
    runWrite({
      action: "withdraw",
      functionName: "withdraw",
      args: [parseUnits(amountMomo, 18)],
    });

  const play = async (amountMomo: string) => {
    const result = await runWrite({
      action: "play",
      functionName: "play",
      args: [parseUnits(amountMomo, 18)],
    });

    if (result.error || !result.hash || !result.receipt) {
      return { error: result.error ?? "Bet failed.", hash: result.hash, outcome: null as PlayOutcome | null };
    }

    const gameResolvedLog = result.receipt.logs.find((log) => {
      try {
        const decoded = decodeEventLog({
          abi: CASINO_VAULT_ABI,
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === "GameResolved";
      } catch {
        return false;
      }
    });

    if (!gameResolvedLog) {
      return { error: "Game result event not found.", hash: result.hash, outcome: null as PlayOutcome | null };
    }

    const decoded = decodeEventLog({
      abi: CASINO_VAULT_ABI,
      data: gameResolvedLog.data,
      topics: gameResolvedLog.topics,
    });

    if (decoded.eventName !== "GameResolved") {
      return { error: "Unexpected game event returned.", hash: result.hash, outcome: null as PlayOutcome | null };
    }

    const outcome: PlayOutcome = {
      betAmount: Number(formatUnits(decoded.args.betAmount, 18)),
      payout: Number(formatUnits(decoded.args.payout, 18)),
      randomValue: Number(decoded.args.randomValue),
      txHash: result.hash,
      won: decoded.args.won,
    };

    return { error: null, hash: result.hash, outcome };
  };

  return {
    casinoMomoBalance,
    casinoMomoRaw: casinoBalanceRaw,
    contractAddress: CASINO_VAULT_ADDRESS,
    contractEthLiquidity,
    deposit,
    hasDeployedContracts,
    play,
    refetchAll,
    txState,
    withdraw,
  };
}
