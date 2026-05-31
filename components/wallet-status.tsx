type WalletStatusProps = {
  isBalanceLoading: boolean;
  isConnected: boolean;
  networkName: string;
  shortAddress: string;
  walletBalance: string;
};

export function WalletStatus({
  isBalanceLoading,
  isConnected,
  networkName,
  shortAddress,
  walletBalance,
}: WalletStatusProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[24px] border border-emerald-400/15 bg-white/5 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/55">Connected address</p>
        <p className="mt-3 text-lg font-medium text-white">{isConnected ? shortAddress : "Not connected"}</p>
      </div>
      <div className="rounded-[24px] border border-emerald-400/15 bg-white/5 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/55">Current network</p>
        <p className="mt-3 text-lg font-medium text-white">{networkName}</p>
      </div>
      <div className="rounded-[24px] border border-emerald-400/15 bg-white/5 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/55">Sepolia ETH balance</p>
        <p className="mt-3 text-lg font-medium text-white">
          {isConnected ? (isBalanceLoading ? "Loading..." : walletBalance) : "--"}
        </p>
      </div>
    </section>
  );
}
