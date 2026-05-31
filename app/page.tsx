"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthScreen } from "@/components/auth-screen";
import { BackgroundRoots } from "@/components/background-roots";
import { CategoryTabs } from "@/components/category-tabs";
import { DepositModal } from "@/components/deposit-modal";
import { FaucetCard } from "@/components/faucet-card";
import { FungalCrashModal } from "@/components/fungal-crash-modal";
import { GameGrid } from "@/components/game-grid";
import { HeaderActions } from "@/components/header-actions";
import { HeroBanner } from "@/components/hero-banner";
import { MockModal } from "@/components/mock-modal";
import { Sidebar } from "@/components/sidebar";
import { TransactionHistoryModal } from "@/components/transaction-history-modal";
import { WalletStatus } from "@/components/wallet-status";
import { WithdrawModal } from "@/components/withdraw-modal";
import { WrongNetworkBanner } from "@/components/wrong-network-banner";
import { mockGames, type GameCategory, type GameItem } from "@/data/mock-games";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMockCasinoState } from "@/hooks/use-mock-casino-state";
import { useOnchainMomoState } from "@/hooks/use-onchain-momo";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { useWalletSession } from "@/hooks/use-wallet-session";

type ModalState =
  | { title: string; message: string }
  | null;

function formatCooldown(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function prettifyPhase(phase: string) {
  if (phase === "waiting-wallet") return "Waiting for wallet confirmation";
  if (phase === "confirming") return "Waiting for confirmation";
  if (phase === "submitted") return "Transaction submitted";
  if (phase === "completed") return "Completed";
  if (phase === "failed") return "Failed";
  return "Idle";
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<GameCategory>("All Games");
  const [isHomeExpanded, setIsHomeExpanded] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFungalCrashOpen, setIsFungalCrashOpen] = useState(false);
  const [depositSuggestedAmount, setDepositSuggestedAmount] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const previousAddressRef = useRef<string | undefined>(undefined);
  const previousConnectedRef = useRef(false);

  const wallet = useWalletSession();
  const auth = useAuthSession();
  const history = useTransactionHistory();
  const demoCasino = useMockCasinoState();
  const momo = useOnchainMomoState(wallet.address);

  const filteredGames = useMemo(() => {
    if (activeCategory === "All Games") return mockGames;
    return mockGames.filter((game) => game.categories.includes(activeCategory));
  }, [activeCategory]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    if (previousAddressRef.current && wallet.address && previousAddressRef.current !== wallet.address) {
      showToast(`Account changed to ${wallet.shortAddress}.`);
    }
    previousAddressRef.current = wallet.address;
  }, [wallet.address, wallet.shortAddress]);

  useEffect(() => {
    if (previousConnectedRef.current && !wallet.isConnected) {
      showToast("Wallet disconnected.");
    }
    previousConnectedRef.current = wallet.isConnected;
  }, [wallet.isConnected]);

  useEffect(() => {
    if (wallet.lastConnectError) {
      showToast(wallet.lastConnectError);
    }
  }, [wallet.lastConnectError]);

  useEffect(() => {
    if (momo.txState.phase === "completed" && momo.txState.hash) {
      const verb =
        momo.txState.action === "claim"
          ? "Claim completed"
          : momo.txState.action === "approve"
            ? "Approval completed"
            : momo.txState.action === "deposit"
              ? "Deposit completed"
              : momo.txState.action === "withdraw"
                ? "Withdraw completed"
                : "Transaction completed";
      showToast(`${verb}.`);
    }
  }, [momo.txState.action, momo.txState.hash, momo.txState.phase]);

  if (!auth.isReady || !history.isReady || !demoCasino.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040605] text-white">
        <div className="rounded-3xl border border-emerald-400/12 bg-white/5 px-6 py-4 text-sm text-emerald-100/70 backdrop-blur-xl">
          Loading MomoBet...
        </div>
      </main>
    );
  }

  const renderToast = (
    <AnimatePresence>
      {toastMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-2xl border border-emerald-400/20 bg-[#0b120f]/95 px-4 py-3 text-sm text-emerald-50 shadow-glow backdrop-blur-xl"
        >
          {toastMessage}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (!auth.isLoggedIn) {
    return (
      <>
        <AuthScreen
          onLogin={(values) => {
            const error = auth.login(values);
            if (!error) showToast("Welcome back to MomoBet.");
            return error;
          }}
          onRegister={(values) => {
            const error = auth.register(values);
            if (!error) showToast(`Profile created. Welcome, ${values.profileName}.`);
            return error;
          }}
        />
        {renderToast}
      </>
    );
  }

  const requireWalletAndSepolia = (messages: { noWallet: string; wrongNetwork: string }) => {
    if (!wallet.isConnected) {
      setModal({ title: "Connect wallet first", message: messages.noWallet });
      return false;
    }
    if (wallet.isWrongNetwork) {
      setModal({ title: "Wrong network", message: messages.wrongNetwork });
      return false;
    }
    return true;
  };

  const ensureContractsReady = () => {
    if (!momo.hasDeployedContracts) {
      setModal({
        title: "Contracts not deployed",
        message: "Set the Sepolia MOMO token and vault addresses after deployment to activate claim, deposit, and withdraw.",
      });
      return false;
    }
    return true;
  };

  const openDepositModal = () => {
    if (
      !requireWalletAndSepolia({
        noWallet: "Connect MetaMask before opening the deposit flow.",
        wrongNetwork: "Please switch your wallet to Ethereum Sepolia before opening the deposit flow.",
      }) ||
      !ensureContractsReady()
    ) {
      return;
    }

    setDepositSuggestedAmount(null);
    setIsDepositOpen(true);
  };

  const openWithdrawModal = () => {
    if (
      !requireWalletAndSepolia({
        noWallet: "Connect wallet before requesting a withdrawal.",
        wrongNetwork: "Switch to Sepolia before requesting a withdrawal.",
      }) ||
      !ensureContractsReady()
    ) {
      return;
    }

    setIsWithdrawOpen(true);
  };

  const handleClaim = async () => {
    if (
      !requireWalletAndSepolia({
        noWallet: "Connect wallet to claim MOMO test chips.",
        wrongNetwork: "Switch to Sepolia to claim test chips.",
      }) ||
      !ensureContractsReady()
    ) {
      return;
    }

    if (!momo.canClaim) {
      showToast(`Faucet cooling down. Claim again in ${formatCooldown(momo.claimCooldownRemainingMs)}.`);
      return;
    }

    const result = await momo.claim();
    if (result.error || !result.hash) {
      showToast(result.error ?? "Claim failed.");
      return;
    }

    history.addTransaction({
      type: "Claim",
      currency: "MOMO",
      amount: "1000",
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: ["On-chain faucet claim", "Claimed from CasinoToken.claim()"],
    });
  };

  const handleApprove = async (amount: string) => {
    if (!ensureContractsReady()) return "Contract not deployed.";
    const result = await momo.approve(amount);
    if (result.error || !result.hash) return result.error ?? "Approval failed.";

    history.addTransaction({
      type: "Approve",
      currency: "MOMO",
      amount,
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: ["Approved MomoCasinoVault to transfer MOMO"],
    });
    return null;
  };

  const handleDepositSubmit = async (amountRaw: string) => {
    const amount = Number(amountRaw);
    if (amount <= 0 || Number.isNaN(amount)) return "Enter a valid deposit amount greater than 0.";
    if (amount > momo.walletMomoBalance) return "Insufficient MOMO wallet balance.";

    const result = await momo.deposit(amountRaw);
    if (result.error || !result.hash) return result.error ?? "Deposit failed.";

    history.addTransaction({
      type: "Deposit",
      currency: "MOMO",
      amount: amount.toFixed(4),
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: ["Deposited MOMO into MomoCasinoVault"],
    });
    setIsDepositOpen(false);
    setDepositSuggestedAmount(null);
    showToast("Deposit successful. MOMO moved on-chain to your casino balance.");
    return null;
  };

  const handleWithdrawSubmit = async (values: {
    currency: "MOMO" | "USDT";
    network: "ERC20" | "TRC20";
    amount: string;
  }) => {
    if (values.currency !== "MOMO") return "USDT mock withdrawals are coming soon. MOMO is supported for this phase.";
    const amount = Number(values.amount);
    if (amount <= 0 || Number.isNaN(amount)) return "Enter a valid withdrawal amount greater than 0.";
    if (amount > momo.casinoMomoBalance) return "Insufficient on-chain casino balance.";

    const result = await momo.withdraw(values.amount);
    if (result.error || !result.hash) return result.error ?? "Withdraw failed.";

    history.addTransaction({
      type: "Withdraw",
      currency: "MOMO",
      amount: amount.toFixed(4),
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: ["Withdrawn from MomoCasinoVault back to connected wallet"],
    });
    setIsWithdrawOpen(false);
    showToast("Withdrawal completed. MOMO returned to your connected wallet.");
    return null;
  };

  const handlePlay = (game: GameItem) => {
    if (game.title === "Fungal Crash") {
      setIsFungalCrashOpen(true);
      return;
    }
    showToast("This game is coming soon.");
  };

  const handleStartFungalCrashRound = (betAmount: number) => {
    if (betAmount <= 0 || Number.isNaN(betAmount)) return "Enter a valid bet amount.";
    if (demoCasino.balances.casinoMomo <= 0 && demoCasino.balances.walletMomo > 0) {
      return "Your demo MOMO is in Wallet Balance. Move tokens to Demo Casino Balance before playing.";
    }
    if (demoCasino.balances.casinoMomo <= 0 && demoCasino.balances.walletMomo <= 0) {
      return "Demo mode - game logic is not on-chain yet. Use your saved demo balance to play.";
    }
    if (betAmount > demoCasino.balances.casinoMomo) return "Bet amount exceeds available Demo Casino Balance.";
    if (demoCasino.balances.pendingBets > 0) return "Active round already in progress.";

    demoCasino.startPendingBet(betAmount);
    return null;
  };

  const handleFinishFungalCrashRound = (result: {
    betAmount: number;
    crashMultiplier: number;
    payout: number;
    profit: number;
    status: "Won" | "Lost";
    cashoutMultiplier?: number;
  }) => {
    demoCasino.settleBet(result.betAmount, result.payout);
    demoCasino.appendCrashRound(
      result.cashoutMultiplier ?? result.crashMultiplier,
      result.status === "Won" ? "User cashout" : "Crash",
    );

    history.addTransaction({
      type: "Bet",
      currency: "MOMO",
      amount: result.betAmount.toFixed(2),
      network: "Demo mode",
      status: result.status,
      txHash: `demo-${Date.now()}`,
      isMock: true,
      details: [
        "Game: Fungal Crash",
        "Demo mode - game logic is not on-chain yet",
        result.cashoutMultiplier
          ? `Cashout: ${result.cashoutMultiplier.toFixed(2)}x`
          : `Crash: ${result.crashMultiplier.toFixed(2)}x`,
        `Payout: ${result.payout.toFixed(2)} MOMO`,
        `Profit: ${result.profit.toFixed(2)} MOMO`,
      ],
    });
  };

  const handleAttemptCloseCrash = (isRoundActive: boolean) => {
    if (isRoundActive) {
      showToast("Cash out or wait for crash before closing.");
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    auth.logout();
    setIsHistoryOpen(false);
    setIsWithdrawOpen(false);
    setIsDepositOpen(false);
    setIsFungalCrashOpen(false);
    setDepositSuggestedAmount(null);
    showToast("User logged out.");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040605] text-white">
      <BackgroundRoots />

      <div className="relative flex min-h-screen">
        <Sidebar
          isHomeExpanded={isHomeExpanded}
          onToggleHome={() => setIsHomeExpanded((current) => !current)}
          onSupportClick={() =>
            setModal({
              title: "Support",
              message: "A live support workflow will be connected in a later release.",
            })
          }
        />

        <div className="flex min-h-screen w-full flex-1 flex-col md:pl-[260px]">
          <HeaderActions
            onDepositClick={openDepositModal}
            onDisconnect={wallet.disconnectWallet}
            onHistoryClick={() => setIsHistoryOpen(true)}
            onLogout={handleLogout}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenWallet={async () => {
              if (wallet.isConnected) return;
              const message = await wallet.connectWallet();
              if (message) showToast(message);
            }}
            onWithdrawClick={openWithdrawModal}
            profileName={auth.profileName}
            wallet={{
              casinoMomoBalance: momo.casinoMomoBalance,
              hasDeployedContracts: momo.hasDeployedContracts,
              isBalanceLoading: wallet.isBalanceLoading,
              isConnected: wallet.isConnected,
              isConnectPending: wallet.isConnectPending,
              isDisconnectPending: wallet.isDisconnectPending,
              isLoggedIn: auth.isLoggedIn,
              isWrongNetwork: wallet.isWrongNetwork,
              networkName: wallet.networkName,
              pendingBets: demoCasino.balances.pendingBets,
              shortAddress: wallet.shortAddress,
              walletMomoBalance: momo.walletMomoBalance,
              walletBalance: wallet.walletBalance,
              walletSymbol: wallet.walletSymbol,
            }}
          />

          <div className="relative z-10 px-4 pb-14 pt-24 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
              {wallet.isConnected && wallet.isWrongNetwork ? (
                <WrongNetworkBanner
                  isPending={wallet.isSwitchPending}
                  onSwitch={async () => {
                    const message = await wallet.switchToSepolia();
                    if (message) showToast(message);
                  }}
                />
              ) : null}

              <HeroBanner
                onPrimaryClick={() => setIsFungalCrashOpen(true)}
                onSecondaryClick={() => setActiveCategory("All Games")}
              />

              <WalletStatus
                isBalanceLoading={wallet.isBalanceLoading}
                isConnected={wallet.isConnected}
                networkName={wallet.networkName}
                shortAddress={wallet.shortAddress}
                walletBalance={wallet.walletBalance}
              />

              <FaucetCard
                claimCooldownLabel={momo.canClaim ? null : formatCooldown(momo.claimCooldownRemainingMs)}
                etherscanTokenUrl={momo.hasDeployedContracts ? `https://sepolia.etherscan.io/token/${momo.tokenAddress}` : null}
                isClaimDisabled={!momo.canClaim || momo.txState.phase === "waiting-wallet" || momo.txState.phase === "confirming"}
                isDeployed={momo.hasDeployedContracts}
                momoCasinoBalance={momo.casinoMomoBalance}
                momoWalletBalance={momo.walletMomoBalance}
                onClaim={handleClaim}
                profileName={auth.profileName}
                tokenAddress={momo.tokenAddress}
              />

              <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">Featured games</p>
                    <h2 className="text-2xl font-semibold text-white">Scroll the underground lobby</h2>
                  </div>
                  <p className="max-w-2xl text-sm text-emerald-50/55">
                    MOMO claim, deposit, and withdraw are wired for Sepolia now. Fungal Crash remains in demo mode until the game contract exists.
                  </p>
                </div>

                <GameGrid games={filteredGames} onPlay={handlePlay} />
              </section>
            </div>
          </div>
        </div>
      </div>

      <MockModal
        isOpen={Boolean(modal)}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        onClose={() => setModal(null)}
      />

      <DepositModal
        allowance={momo.allowance}
        availableWalletBalance={momo.walletMomoBalance}
        isOpen={isDepositOpen}
        onApprove={handleApprove}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDepositSubmit}
        suggestedAmount={depositSuggestedAmount}
        txHash={momo.txState.hash}
        txPhase={prettifyPhase(momo.txState.phase)}
      />

      <WithdrawModal
        availableCasinoBalance={momo.casinoMomoBalance}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSubmit={handleWithdrawSubmit}
        txHash={momo.txState.hash}
        txPhase={prettifyPhase(momo.txState.phase)}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={history.transactions}
      />

      <FungalCrashModal
        availableCasinoBalance={demoCasino.balances.casinoMomo}
        availableWalletBalance={demoCasino.balances.walletMomo}
        isOpen={isFungalCrashOpen}
        onAttemptClose={handleAttemptCloseCrash}
        onClose={() => setIsFungalCrashOpen(false)}
        onFinishRound={handleFinishFungalCrashRound}
        onQuickDeposit={(amount) => {
          if (amount > demoCasino.balances.walletMomo) {
            showToast("Not enough demo Wallet Balance to move that amount.");
            return;
          }
          demoCasino.depositMomo(amount);
          history.addTransaction({
            type: "Deposit",
            currency: "MOMO",
            amount: amount.toFixed(2),
            network: "Demo mode",
            status: "Mock",
            txHash: `demo-${Date.now()}`,
            isMock: true,
            details: ["Source: Fungal Crash quick deposit", "Demo mode - not on-chain"],
          });
          showToast(`Moved ${amount.toFixed(2)} demo MOMO to Demo Casino Balance.`);
        }}
        onRequestCustomDeposit={(amount) => {
          setDepositSuggestedAmount(amount);
          setIsFungalCrashOpen(false);
          setModal({
            title: "Demo mode notice",
            message: "Fungal Crash uses demo-only balances until the game contract is implemented. Real on-chain deposit remains available from the header.",
          });
        }}
        onStartRound={handleStartFungalCrashRound}
        profileName={auth.profileName || wallet.shortAddress}
        recentCrashRounds={demoCasino.recentCrashRounds}
      />

      {renderToast}
    </main>
  );
}
