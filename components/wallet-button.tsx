"use client";

import { Wallet } from "lucide-react";

type WalletButtonProps = {
  isConnected: boolean;
  isPending: boolean;
  isWrongNetwork: boolean;
  label: string;
  onClick: () => void | Promise<void>;
};

export function WalletButton({
  isConnected,
  isPending,
  isWrongNetwork,
  label,
  onClick,
}: WalletButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        isConnected
          ? "border-emerald-300/20 bg-white/5 text-white/85 hover:border-emerald-300/35 hover:bg-white/10"
          : "border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.35)] hover:brightness-110"
      }`}
    >
      <Wallet className={`h-4 w-4 ${isConnected ? "text-emerald-200" : "text-emerald-950"}`} />
      <span>{isPending ? "Connecting..." : label}</span>
      {isConnected ? (
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isWrongNetwork ? "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.75)]" : "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.75)]"
          }`}
        />
      ) : null}
    </button>
  );
}
