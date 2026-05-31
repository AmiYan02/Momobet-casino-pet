"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { MockModal } from "@/components/mock-modal";

type DepositModalProps = {
  allowance: number;
  availableWalletBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (amount: string) => Promise<string | null> | string | null;
  onDeposit: (amount: string) => Promise<string | null> | string | null;
  suggestedAmount?: string | null;
  txHash?: string | null;
  txPhase?: string;
};

export function DepositModal({
  allowance,
  availableWalletBalance,
  isOpen,
  onClose,
  onApprove,
  onDeposit,
  suggestedAmount,
  txHash,
  txPhase,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const numericAmount = Number(amount || "0");
  const currentStep = allowance >= numericAmount && numericAmount > 0 ? "deposit" : "approve";

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setError(null);
      return;
    }

    if (suggestedAmount) {
      setAmount(suggestedAmount);
    }
  }, [isOpen, suggestedAmount]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount.trim() || Number(amount) <= 0) {
      setError("Enter a valid deposit amount greater than 0.");
      return;
    }

    const nextError =
      currentStep === "approve"
        ? await onApprove(amount.trim())
        : await onDeposit(amount.trim());
    setError(nextError);
  };

  return (
    <MockModal isOpen={isOpen} title="Deposit" message="" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm">
          <p className="text-white/55">Currency</p>
          <p className="mt-1 font-medium text-emerald-100">MOMO</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          Available Wallet Balance: <span className="font-medium text-emerald-100">{availableWalletBalance.toFixed(2)} MOMO</span>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          Current Allowance: <span className="font-medium text-emerald-100">{allowance.toFixed(4)} MOMO</span>
        </div>

        <div>
          <label className="mb-2 block text-sm text-emerald-100/70">Amount</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            {error}
          </div>
        ) : null}

        {txPhase && txPhase !== "idle" ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
            Transaction state: <span className="font-medium text-emerald-100">{txPhase}</span>
            {txHash ? (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-emerald-200 transition hover:text-white"
              >
                {txHash}
              </a>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.35)] transition hover:brightness-110"
        >
          {currentStep === "approve" ? "Approve MOMO" : "Deposit to Casino"}
        </button>
      </form>
    </MockModal>
  );
}
