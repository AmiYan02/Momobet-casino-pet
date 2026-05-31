type BalanceDropdownProps = {
  casinoMomoBalance: number;
  hasDeployedContracts: boolean;
  isBalanceLoading: boolean;
  isConnected: boolean;
  isLoggedIn: boolean;
  onDepositClick: () => void;
  onHistoryClick: () => void;
  onWithdrawClick: () => void;
  pendingBets: number;
  walletMomoBalance: number;
  walletBalance: string;
  walletSymbol: string;
};

export function BalanceDropdown({
  casinoMomoBalance,
  hasDeployedContracts,
  isBalanceLoading,
  isConnected,
  isLoggedIn,
  onDepositClick,
  onHistoryClick,
  onWithdrawClick,
  pendingBets,
  walletMomoBalance,
  walletBalance,
  walletSymbol,
}: BalanceDropdownProps) {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl border border-white/5 bg-white/5 p-3">
        <p className="text-white/55">Sepolia ETH Balance</p>
        <p className="mt-1 font-medium text-emerald-100">
          {!isLoggedIn
            ? "Login required"
            : isConnected
              ? isBalanceLoading
                ? `Loading ${walletSymbol}...`
                : walletBalance
              : "Wallet not connected"}
        </p>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/5 p-3">
        <p className="text-white/55">MOMO Wallet Balance</p>
        <p className="mt-1 font-medium text-emerald-100">
          {isLoggedIn ? (hasDeployedContracts ? `${walletMomoBalance.toFixed(4)} MOMO` : "Contract not deployed") : "Login required"}
        </p>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/5 p-3">
        <p className="text-white/55">MOMO Casino Balance</p>
        <p className="mt-1 font-medium text-emerald-100">
          {isLoggedIn ? (hasDeployedContracts ? `${casinoMomoBalance.toFixed(4)} MOMO` : "Contract not deployed") : "Login required"}
        </p>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/5 p-3">
        <p className="text-white/55">Pending Bets</p>
        <p className="mt-1 font-medium text-emerald-100">{isLoggedIn ? `${pendingBets.toFixed(2)} MOMO` : "Login required"}</p>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onDepositClick}
          className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/15 hover:text-white"
        >
          Deposit
        </button>
        <button
          type="button"
          onClick={onWithdrawClick}
          className="rounded-full border border-emerald-300/15 bg-white/5 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/10 hover:text-white"
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={onHistoryClick}
          className="rounded-full border border-emerald-300/15 bg-white/5 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/10 hover:text-white"
        >
          Transaction History
        </button>
      </div>
    </div>
  );
}
