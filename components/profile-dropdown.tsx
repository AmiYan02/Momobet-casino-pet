"use client";

import { LogOut, Settings, Wallet } from "lucide-react";

type ProfileDropdownProps = {
  isConnected: boolean;
  isDisconnectPending: boolean;
  networkName: string;
  onLogout: () => void;
  onOpenHistory: () => void;
  profileName: string;
  shortAddress: string;
  onDisconnect: () => void;
};

export function ProfileDropdown({
  isConnected,
  isDisconnectPending,
  networkName,
  onLogout,
  onOpenHistory,
  profileName,
  shortAddress,
  onDisconnect,
}: ProfileDropdownProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="rounded-xl border border-white/5 bg-white/5 p-3">
        <p className="text-white/55">Profile name</p>
        <p className="mt-1 font-medium text-emerald-100">{profileName}</p>
        <p className="mt-3 text-white/55">Wallet</p>
        <p className="mt-1 font-medium text-emerald-100">{isConnected ? shortAddress : "Not connected"}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/35">{networkName}</p>
      </div>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/75 transition hover:bg-white/5 hover:text-white"
      >
        <Settings className="h-4 w-4 text-emerald-200" />
        Settings
      </button>
      <button
        type="button"
        onClick={onOpenHistory}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/75 transition hover:bg-white/5 hover:text-white"
      >
        <Wallet className="h-4 w-4 text-emerald-200" />
        Transaction History
      </button>
      {isConnected ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-100/85 transition hover:bg-rose-300/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 text-rose-200" />
          {isDisconnectPending ? "Disconnecting..." : "Disconnect"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-100/85 transition hover:bg-rose-300/10 hover:text-white"
      >
        <LogOut className="h-4 w-4 text-rose-200" />
        Logout
      </button>
    </div>
  );
}
