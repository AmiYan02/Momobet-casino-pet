"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleUserRound, Wallet } from "lucide-react";
import { BalanceDropdown } from "@/components/balance-dropdown";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { WalletButton } from "@/components/wallet-button";

type HeaderActionsProps = {
  onDepositClick: () => void;
  onDisconnect: () => void;
  onHistoryClick: () => void;
  onOpenWallet: () => void | Promise<void>;
  onLogout: () => void;
  onOpenHistory: () => void;
  onWithdrawClick: () => void;
  profileName: string;
  wallet: {
    casinoMomoBalance: number;
    hasDeployedContracts: boolean;
    isBalanceLoading: boolean;
    isConnected: boolean;
    isConnectPending: boolean;
    isDisconnectPending: boolean;
    isLoggedIn: boolean;
    isWrongNetwork: boolean;
    networkName: string;
    pendingBets: number;
    shortAddress: string;
    walletMomoBalance: number;
    walletBalance: string;
    walletSymbol: string;
  };
};

function DropdownShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute right-0 top-[calc(100%+12px)] w-[min(320px,calc(100vw-1.5rem))] rounded-2xl border border-emerald-400/15 bg-[#0b120f]/95 p-3 shadow-glow backdrop-blur-xl sm:min-w-[250px] sm:w-auto"
    >
      {children}
    </motion.div>
  );
}

export function HeaderActions({
  onDepositClick,
  onDisconnect,
  onHistoryClick,
  onLogout,
  onOpenHistory,
  onOpenWallet,
  onWithdrawClick,
  profileName,
  wallet,
}: HeaderActionsProps) {
  const [openMenu, setOpenMenu] = useState<"balance" | "profile" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed right-0 top-[88px] z-40 w-full md:left-[260px] md:top-0 md:w-auto">
      <div className="flex justify-end px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div
          ref={containerRef}
          className="flex w-full flex-wrap items-center justify-end gap-2 rounded-[20px] border border-emerald-400/12 bg-[#07100c]/75 p-2 shadow-card backdrop-blur-2xl sm:w-auto sm:gap-3 sm:rounded-[24px]"
        >
          <WalletButton
            isConnected={wallet.isConnected}
            isPending={wallet.isConnectPending}
            isWrongNetwork={wallet.isWrongNetwork}
            label={wallet.isConnected ? wallet.shortAddress : "Connect Wallet"}
            onClick={onOpenWallet}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => (value === "balance" ? null : "balance"))}
              className="inline-flex min-w-0 items-center gap-2 rounded-full border border-emerald-400/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:border-emerald-300/30 hover:bg-white/10 sm:px-4"
            >
              <Wallet className="h-4 w-4 text-emerald-200" />
              <span className="truncate">{wallet.isConnected ? `Balance: ${wallet.walletBalance}` : "Balance"}</span>
              <ChevronDown className="h-4 w-4 text-white/55" />
            </button>

            <AnimatePresence>
              {openMenu === "balance" ? (
                <DropdownShell>
                  <BalanceDropdown
                    casinoMomoBalance={wallet.casinoMomoBalance}
                    hasDeployedContracts={wallet.hasDeployedContracts}
                    isBalanceLoading={wallet.isBalanceLoading}
                    isConnected={wallet.isConnected}
                    isLoggedIn={wallet.isLoggedIn}
                    onDepositClick={onDepositClick}
                    onHistoryClick={onHistoryClick}
                    onWithdrawClick={onWithdrawClick}
                    pendingBets={wallet.pendingBets}
                    walletMomoBalance={wallet.walletMomoBalance}
                    walletBalance={wallet.walletBalance}
                    walletSymbol={wallet.walletSymbol}
                  />
                </DropdownShell>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onDepositClick}
            className="min-h-10 rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:px-5"
          >
            Deposit
          </button>

          <button
            type="button"
            onClick={onWithdrawClick}
            className="min-h-10 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-white sm:px-5"
          >
            Withdraw
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => (value === "profile" ? null : "profile"))}
              className="flex min-h-10 items-center gap-2 rounded-full border border-emerald-400/15 bg-white/5 px-3 py-2 text-white/80 transition hover:border-emerald-300/30 hover:bg-white/10"
            >
              <CircleUserRound className="h-5 w-5" />
              <span className="hidden max-w-[96px] truncate text-sm font-medium text-emerald-100 sm:inline">
                {profileName}
              </span>
            </button>

            <AnimatePresence>
              {openMenu === "profile" ? (
                <DropdownShell>
                  <ProfileDropdown
                    isConnected={wallet.isConnected}
                    isDisconnectPending={wallet.isDisconnectPending}
                    networkName={wallet.networkName}
                    onLogout={onLogout}
                    onOpenHistory={onOpenHistory}
                    profileName={profileName}
                    shortAddress={wallet.shortAddress}
                    onDisconnect={onDisconnect}
                  />
                </DropdownShell>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
