"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { MockModal } from "@/components/mock-modal";

type WithdrawModalProps = {
  availableCasinoBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    currency: "MOMO" | "USDT";
    network: "ERC20" | "TRC20";
    amount: string;
  }) => Promise<string | null> | string | null;
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
  const [currency, setCurrency] = useState<"MOMO" | "USDT">("MOMO");
  const [network, setNetwork] = useState<"ERC20" | "TRC20">("ERC20");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrency("MOMO");
      setNetwork("ERC20");
      setAmount("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currency) {
      setError("Select a currency.");
      return;
    }

    if (!network) {
      setError("Select a network.");
      return;
    }

    if (!amount.trim() || Number(amount) <= 0) {
      setError("Enter a valid withdrawal amount greater than 0.");
      return;
    }

    const nextError = await onSubmit({
      currency,
      network,
      amount: amount.trim(),
    });

    setError(nextError);
  };

  return (
    <MockModal isOpen={isOpen} title="Withdraw" message="" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-emerald-100/70">Currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as "MOMO" | "USDT")}
              className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="MOMO">MOMO</option>
              <option value="USDT">USDT mock</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-emerald-100/70">Network</label>
            <select
              value={network}
              onChange={(event) => setNetwork(event.target.value as "ERC20" | "TRC20")}
              className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="ERC20">ERC20</option>
              <option value="TRC20" disabled>
                TRC20 (Coming soon)
              </option>
            </select>
          </div>
        </div>

        <p className="rounded-2xl border border-emerald-400/10 bg-black/20 px-4 py-3 text-sm text-emerald-50/60">
          TRC20 is shown as a future option. Current testnet flow supports ERC20/Sepolia only.
        </p>

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          Withdraw sends MOMO back to your connected wallet.
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

        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/60">
          Available Casino Balance: <span className="font-medium text-emerald-100">{availableCasinoBalance.toFixed(2)} MOMO</span>
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
          className="w-full rounded-full border border-emerald-200/25 bg-emerald-300/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/15 hover:text-white"
        >
          Withdraw
        </button>
      </form>
    </MockModal>
  );
}
