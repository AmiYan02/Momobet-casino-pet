"use client";

import { useEffect, useState } from "react";
import { createMockTransaction, initialTransactions, mockStorageKeys, type TransactionRecord } from "@/lib/mock-app";

function readStoredTransactions() {
  if (typeof window === "undefined") return initialTransactions;

  const raw = window.localStorage.getItem(mockStorageKeys.transactions);
  if (!raw) {
    window.localStorage.setItem(mockStorageKeys.transactions, JSON.stringify(initialTransactions));
    return initialTransactions;
  }

  try {
    const parsed = JSON.parse(raw) as TransactionRecord[];
    return parsed.length ? parsed : initialTransactions;
  } catch {
    return initialTransactions;
  }
}

function saveStoredTransactions(transactions: TransactionRecord[]) {
  window.localStorage.setItem(mockStorageKeys.transactions, JSON.stringify(transactions));
}

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTransactions();
    setTransactions(stored);
    setIsReady(true);
  }, []);

  const addTransaction = (entry: Omit<TransactionRecord, "id" | "date">) => {
    const nextRecord = createMockTransaction(entry);
    setTransactions((current) => {
      const next = [nextRecord, ...current];
      saveStoredTransactions(next);
      return next;
    });
    return nextRecord;
  };

  return {
    addTransaction,
    isReady,
    transactions,
  };
}
