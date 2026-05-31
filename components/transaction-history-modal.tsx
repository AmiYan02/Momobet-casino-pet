"use client";

import { useMemo, useState } from "react";
import { MockModal } from "@/components/mock-modal";
import { TransactionRecord } from "@/lib/mock-app";

type TransactionHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
};

export function TransactionHistoryModal({
  isOpen,
  onClose,
  transactions,
}: TransactionHistoryModalProps) {
  const [filter, setFilter] = useState<"All" | "Claim" | "Approve" | "Deposit" | "Bet" | "Withdraw">("All");

  const filteredTransactions = useMemo(() => {
    if (filter === "All") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.type === filter);
  }, [filter, transactions]);

  return (
    <MockModal isOpen={isOpen} title="Transaction History" message="" onClose={onClose}>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", "Claim", "Approve", "Deposit", "Bet", "Withdraw"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition ${
              filter === item
                ? "border-emerald-200/25 bg-emerald-300/15 text-emerald-50"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {item === "Claim"
              ? "Claims"
              : item === "Approve"
                ? "Approvals"
                : item === "Deposit"
                  ? "Deposits"
                  : item === "Bet"
                    ? "Bets"
                    : item === "Withdraw"
                      ? "Withdrawals"
                      : "All"}
          </button>
        ))}
      </div>

      {filteredTransactions.length ? (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 fancy-scrollbar">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    {transaction.type} {transaction.amount} {transaction.currency}
                  </p>
                  <p className="mt-1 text-white/50">{transaction.network}</p>
                  {transaction.isMock ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-200/70">Mock</p>
                  ) : null}
                </div>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100/80">
                  {transaction.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-white/60 sm:grid-cols-2">
                <p>Date: {transaction.date}</p>
                <p>Tx: {transaction.txHash}</p>
                {transaction.address ? <p className="sm:col-span-2">Address: {transaction.address}</p> : null}
                {transaction.details?.length
                  ? transaction.details.map((detail) => (
                      <p key={detail} className="sm:col-span-2">
                        {detail}
                      </p>
                    ))
                  : null}
              </div>
              {transaction.isMock ? (
                <span className="mt-3 inline-block text-sm text-white/45">Local mock record</span>
              ) : (
                <a
                  href={`https://sepolia.etherscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-emerald-200 transition hover:text-white"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-sm text-white/60">
          No transactions found for this filter.
        </div>
      )}
    </MockModal>
  );
}
