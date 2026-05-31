"use client";

import { useMemo, useState } from "react";
import { usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import type { Address, Hex } from "viem";
import { formatUnits, parseUnits } from "viem";
import { supportedChain } from "@/lib/wagmi";
import { parseWalletError } from "@/lib/wallet";
import {
  CASINO_VAULT_ABI,
  CASINO_VAULT_ADDRESS,
  hasDeployedContracts,
  MOMO_TOKEN_ABI,
  MOMO_TOKEN_ADDRESS,
} from "@/src/lib/contracts";

export type TxPhase =
  | "idle"
  | "waiting-wallet"
  | "submitted"
  | "confirming"
  | "completed"
  | "failed";

export type TxState = {
  action: "claim" | "approve" | "deposit" | "withdraw" | null;
  error: string | null;
  hash: Hex | null;
  phase: TxPhase;
};

function formatMomo(value?: bigint) {
  return Number(formatUnits(value ?? BigInt(0), 18));
}

function getFriendlyError(error: unknown) {
  const message = parseWalletError(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("insufficient funds")) {
    return "Insufficient Sepolia ETH for gas.";
  }

  if (normalized.includes("claim cooldown")) {
    return "Claim cooldown is still active.";
  }

  return message;
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

  const { data: contractReads, refetch: refetchOnchainBalances } = useReadContracts({
    allowFailure: false,
    contracts: canRead
      ? [
          {
            abi: MOMO_TOKEN_ABI,
            address: MOMO_TOKEN_ADDRESS as Address,
            functionName: "balanceOf",
            args: [address as Address],
          },
          {
            abi: CASINO_VAULT_ABI,
            address: CASINO_VAULT_ADDRESS as Address,
            functionName: "balanceOf",
            args: [address as Address],
          },
          {
            abi: MOMO_TOKEN_ABI,
            address: MOMO_TOKEN_ADDRESS as Address,
            functionName: "allowance",
            args: [address as Address, CASINO_VAULT_ADDRESS as Address],
          },
        ]
      : [],
    query: {
      enabled: canRead,
      refetchInterval: 10000,
    },
  });

  const { data: rawLastClaimAt, refetch: refetchClaimWindow } = useReadContract({
    abi: MOMO_TOKEN_ABI,
    address: hasDeployedContracts ? (MOMO_TOKEN_ADDRESS as Address) : undefined,
    functionName: "lastClaimAt",
    args: address ? [address] : undefined,
    chainId: supportedChain.id,
    query: {
      enabled: canRead,
      refetchInterval: 5000,
    },
  });

  const walletMomoRaw = (contractReads?.[0] as bigint | undefined) ?? BigInt(0);
  const casinoMomoRaw = (contractReads?.[1] as bigint | undefined) ?? BigInt(0);
  const allowanceRaw = (contractReads?.[2] as bigint | undefined) ?? BigInt(0);
  const lastClaimAt = Number(rawLastClaimAt ?? BigInt(0));
  const claimCooldownRemainingMs = lastClaimAt
    ? Math.max(0, (lastClaimAt + 60) * 1000 - Date.now())
    : 0;

  const walletMomoBalance = useMemo(() => formatMomo(walletMomoRaw), [walletMomoRaw]);
  const casinoMomoBalance = useMemo(() => formatMomo(casinoMomoRaw), [casinoMomoRaw]);
  const allowance = useMemo(() => formatMomo(allowanceRaw), [allowanceRaw]);

  const refetchAll = async () => {
    await Promise.all([refetchOnchainBalances(), refetchClaimWindow()]);
  };

  const runWrite = async (params: {
    action: NonNullable<TxState["action"]>;
    args?: readonly unknown[];
    contract: Address;
    abi: typeof MOMO_TOKEN_ABI | typeof CASINO_VAULT_ABI;
    functionName: string;
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
        abi: params.abi as any,
        address: params.contract,
        functionName: params.functionName as any,
        args: params.args as any,
        chainId: supportedChain.id,
      });

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "submitted",
      });

      await Promise.resolve();

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "confirming",
      });

      await publicClient.waitForTransactionReceipt({ hash });
      await refetchAll();

      setTxState({
        action: params.action,
        error: null,
        hash,
        phase: "completed",
      });

      return { error: null, hash };
    } catch (error) {
      const message = getFriendlyError(error);
      setTxState({
        action: params.action,
        error: message,
        hash: null,
        phase: "failed",
      });
      return { error: message, hash: null as Hex | null };
    }
  };

  const claim = async () =>
    runWrite({
      action: "claim",
      abi: MOMO_TOKEN_ABI,
      contract: MOMO_TOKEN_ADDRESS as Address,
      functionName: "claim",
    });

  const approve = async (amount: string) =>
    runWrite({
      action: "approve",
      abi: MOMO_TOKEN_ABI,
      contract: MOMO_TOKEN_ADDRESS as Address,
      functionName: "approve",
      args: [CASINO_VAULT_ADDRESS as Address, parseUnits(amount, 18)],
    });

  const deposit = async (amount: string) =>
    runWrite({
      action: "deposit",
      abi: CASINO_VAULT_ABI,
      contract: CASINO_VAULT_ADDRESS as Address,
      functionName: "deposit",
      args: [parseUnits(amount, 18)],
    });

  const withdraw = async (amount: string) =>
    runWrite({
      action: "withdraw",
      abi: CASINO_VAULT_ABI,
      contract: CASINO_VAULT_ADDRESS as Address,
      functionName: "withdraw",
      args: [parseUnits(amount, 18)],
    });

  return {
    allowance,
    allowanceRaw,
    canClaim: claimCooldownRemainingMs === 0,
    casinoMomoBalance,
    casinoMomoRaw,
    claim,
    claimCooldownRemainingMs,
    deposit,
    hasDeployedContracts,
    refetchAll,
    tokenAddress: MOMO_TOKEN_ADDRESS,
    txState,
    vaultAddress: CASINO_VAULT_ADDRESS,
    walletMomoBalance,
    walletMomoRaw,
    approve,
    withdraw,
  };
}
