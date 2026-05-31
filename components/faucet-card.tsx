"use client";

import { Gift } from "lucide-react";

type FaucetCardProps = {
  claimCooldownLabel: string | null;
  etherscanTokenUrl: string | null;
  isClaimDisabled: boolean;
  isDeployed: boolean;
  momoCasinoBalance: number;
  momoWalletBalance: number;
  onClaim: () => void;
  profileName: string;
  tokenAddress: string;
};

export function FaucetCard({
  claimCooldownLabel,
  etherscanTokenUrl,
  isClaimDisabled,
  isDeployed,
  momoCasinoBalance,
  momoWalletBalance,
  onClaim,
  profileName,
  tokenAddress,
}: FaucetCardProps) {
  return (
    <section className="rounded-[28px] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 via-white/5 to-transparent p-6 shadow-card backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">Faucet</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-black/20 text-emerald-200">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">MOMO Test Chips</h2>
              <p className="text-sm text-white/60">
                Claim test tokens for the Sepolia casino. MOMO has no real value.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClaim}
          disabled={isClaimDisabled || !isDeployed}
          className="rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!isDeployed
            ? "Deploy MOMO contracts first"
            : claimCooldownLabel
              ? `Claim ready in ${claimCooldownLabel}`
              : "Claim 1,000 MOMO"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/55">Profile</p>
          <p className="mt-2 text-sm text-white">{profileName}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/55">MOMO token address</p>
          {isDeployed ? (
            <a
              href={etherscanTokenUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-sm text-emerald-200 transition hover:text-white"
            >
              {tokenAddress}
            </a>
          ) : (
            <p className="mt-2 text-sm text-white/65">Contract not deployed yet</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/55">Wallet MOMO balance</p>
          <p className="mt-2 text-sm text-white/85">{momoWalletBalance.toFixed(2)} MOMO</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/55">Casino MOMO balance</p>
          <p className="mt-2 text-sm text-white/85">{momoCasinoBalance.toFixed(2)} MOMO</p>
        </div>
      </div>
    </section>
  );
}
