"use client";

import { useEffect, useState } from "react";
import {
  initialBalances,
  initialRecentCrashRounds,
  mockStorageKeys,
  type CrashRoundRecord,
  type MockBalances,
} from "@/lib/mock-app";

const CLAIM_COOLDOWN_MS = 60_000;

function readJson<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useMockCasinoState() {
  const [balances, setBalances] = useState<MockBalances>(initialBalances);
  const [recentCrashRounds, setRecentCrashRounds] = useState<CrashRoundRecord[]>([]);
  const [lastClaimAt, setLastClaimAt] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedBalances = readJson(mockStorageKeys.balances, initialBalances);
    const storedRounds = readJson(mockStorageKeys.recentCrashRounds, initialRecentCrashRounds);
    const storedFaucet = readJson<{ lastClaimAt: number | null }>(mockStorageKeys.faucet, { lastClaimAt: null });

    writeJson(mockStorageKeys.balances, storedBalances);
    writeJson(mockStorageKeys.recentCrashRounds, storedRounds);
    writeJson(mockStorageKeys.faucet, storedFaucet);

    setBalances(storedBalances);
    setRecentCrashRounds(storedRounds);
    setLastClaimAt(storedFaucet.lastClaimAt);
    setIsReady(true);
  }, []);

  const updateBalances = (updater: (current: MockBalances) => MockBalances) => {
    let nextValue = balances;

    setBalances((current) => {
      nextValue = updater(current);
      writeJson(mockStorageKeys.balances, nextValue);
      return nextValue;
    });

    return nextValue;
  };

  const canClaim = !lastClaimAt || Date.now() - lastClaimAt >= CLAIM_COOLDOWN_MS;
  const claimCooldownMsRemaining = lastClaimAt
    ? Math.max(0, CLAIM_COOLDOWN_MS - (Date.now() - lastClaimAt))
    : 0;

  const claimMomo = () => {
    const timestamp = Date.now();
    updateBalances((current) => ({
      ...current,
      walletMomo: current.walletMomo + 1000,
    }));
    setLastClaimAt(timestamp);
    writeJson(mockStorageKeys.faucet, { lastClaimAt: timestamp });
  };

  const depositMomo = (amount: number) => {
    return updateBalances((current) => ({
      ...current,
      walletMomo: current.walletMomo - amount,
      casinoMomo: current.casinoMomo + amount,
    }));
  };

  const withdrawMomo = (amount: number) => {
    return updateBalances((current) => ({
      ...current,
      walletMomo: current.walletMomo + amount,
      casinoMomo: current.casinoMomo - amount,
    }));
  };

  const startPendingBet = (amount: number) => {
    return updateBalances((current) => ({
      ...current,
      casinoMomo: current.casinoMomo - amount,
      pendingBets: current.pendingBets + amount,
    }));
  };

  const settleBet = (betAmount: number, payout: number) => {
    return updateBalances((current) => ({
      ...current,
      casinoMomo: current.casinoMomo + payout,
      pendingBets: Math.max(0, current.pendingBets - betAmount),
    }));
  };

  const appendCrashRound = (crashMultiplier: number, status: CrashRoundRecord["status"] = "Crash") => {
    const nextRound: CrashRoundRecord = {
      id: `crash-${Date.now()}`,
      crashMultiplier,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status,
    };

    setRecentCrashRounds((current) => {
      const next = [nextRound, ...current].slice(0, 8);
      writeJson(mockStorageKeys.recentCrashRounds, next);
      return next;
    });
  };

  const resetMockState = () => {
    writeJson(mockStorageKeys.balances, initialBalances);
    writeJson(mockStorageKeys.recentCrashRounds, initialRecentCrashRounds);
    writeJson(mockStorageKeys.faucet, { lastClaimAt: null });
    setBalances(initialBalances);
    setRecentCrashRounds(initialRecentCrashRounds);
    setLastClaimAt(null);
  };

  return {
    balances,
    canClaim,
    claimCooldownMsRemaining,
    claimMomo,
    depositMomo,
    isReady,
    lastClaimAt,
    recentCrashRounds,
    resetMockState,
    settleBet,
    startPendingBet,
    appendCrashRound,
    withdrawMomo,
  };
}
