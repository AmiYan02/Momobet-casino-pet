"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { MockModal } from "@/components/mock-modal";
import { momoCreditsToEth } from "@/hooks/use-onchain-momo";

type WithdrawModalProps = {
  availableCasinoBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amountMomo: string) => Promise<string | null> | string | null;
  txHash?: string | null;
  txPhase?: string;
};

export function WithdrawModal({
  availableCasinoBalance,
  isOpen,
  onClose,
  onSubmit,
  txHash,
  txPhase,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const expectedEth = useMemo(
    () => (Number(amount || "0") > 0 ? momoCreditsToEth(Number(amount || "0")) : 0),
    [amount],
  );

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount.trim() || Number(amount) <= 0) {
      setError("Enter a valid MOMO withdrawal amount greater than 0.");
      return;
    }

    if (Number(amount) > availableCasinoBalance) {
      setError("MOMO Casino Balance is too low for this withdrawal.");
      return;
    }

    const nextError = await onSubmit(amount.trim());
    setError(nextError);
  };

  return (
    <MockModal
      isOpen={isOpen}
      title="Withdraw to MetaMask"
      message="Withdraw MOMO casino credits back to Sepolia ETH in your MetaMask wallet. Testnet only."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm">
          <p className="text-white/55">Currency</p>
          <p className="mt-1 font-medium text-emerald-100">MOMO</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          Available MOMO Casino Balance: <span className="font-medium text-emerald-100">{availableCasinoBalance.toFixed(2)} MOMO</span>
        </div>

        <div>
          <label className="mb-2 block text-sm text-emerald-100/70">Amount (MOMO)</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="500"
            className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30"
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          You will receive: <span className="font-medium text-emerald-100">{expectedEth.toFixed(6)} ETH</span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            {error}
          </div>
        ) : null}

        {txPhase && txPhase !== "Idle" ? (
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
          className="w-full rounded-full border border-emerald-200/25 bg-emerald-300/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/15 hover:text-white"
        >
          Withdraw to MetaMask
        </button>
      </form>
    </MockModal>
  );
}
