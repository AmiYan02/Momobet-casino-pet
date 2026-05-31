"use client";

import { AlertTriangle } from "lucide-react";

type WrongNetworkBannerProps = {
  isPending: boolean;
  onSwitch: () => void | Promise<void>;
};

export function WrongNetworkBanner({ isPending, onSwitch }: WrongNetworkBannerProps) {
  return (
    <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 shadow-[0_0_0_1px_rgba(252,211,77,0.08),0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-2 text-amber-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-amber-50">Wrong network. Please switch to Sepolia.</p>
            <p className="mt-1 text-sm text-amber-50/65">
              Deposit and gameplay actions stay locked until the wallet is on Ethereum Sepolia.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitch}
          className="rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-amber-200/15"
        >
          {isPending ? "Switching..." : "Switch to Sepolia"}
        </button>
      </div>
    </div>
  );
}
