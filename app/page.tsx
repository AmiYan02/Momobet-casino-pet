"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
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
import { momoCreditsToEth, useOnchainMomoState } from "@/hooks/use-onchain-momo";
import { useMockCasinoState } from "@/hooks/use-mock-casino-state";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import { useWalletSession } from "@/hooks/use-wallet-session";

type ModalState =
  | { title: string; message: string }
  | null;

const policyCopy = {
  terms: "MomoBet is a testnet-only casino MVP built for hackathon demonstration. Sepolia ETH and MOMO Casino Balance have no real-world value. By using this demo, you understand that it is not a real-money gambling product.",
  kyc: "This MVP does not process real-money transactions and does not require KYC. In a production environment, KYC, AML, sanctions screening and responsible gaming controls would be required before launch.",
  privacy: "This demo does not collect personal data. Connected wallet addresses may be displayed in the interface and are publicly visible on-chain through Sepolia block explorers.",
  responsible: "MomoBet is a testnet demo only. Casino mechanics are shown for product and technical demonstration purposes. Do not use this product for real gambling.",
} as const;

function getCrashBalanceStorageKey(address?: Address, chainId?: number) {
  if (!address || !chainId) return null;
  return `momobet.fungalCrashDelta.${address.toLowerCase()}.${chainId}`;
}

function readCrashDelta(key: string | null) {
  if (!key || typeof window === "undefined") return 0;

  const raw = window.localStorage.getItem(key);
  if (!raw) return 0;

  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function writeCrashDelta(key: string | null, value: number) {
  if (!key || typeof window === "undefined") return;
  window.localStorage.setItem(key, value.toString());
}

function rollCrashMultiplier() {
  const roll = Math.random();

  if (roll < 0.55) return Number((1.08 + Math.random() * 1.05).toFixed(2));
  if (roll < 0.82) return Number((2.15 + Math.random() * 2.35).toFixed(2));
  if (roll < 0.96) return Number((4.5 + Math.random() * 4.5).toFixed(2));
  return Number((9 + Math.random() * 9).toFixed(2));
}

type CrashStartResult = {
  betAmount: number;
  crashMultiplier: number;
};

type CrashCashOutResult = {
  betAmount: number;
  payout: number;
  multiplier: number;
};

type CrashLossResult = {
  betAmount: number;
  crashMultiplier: number;
};

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
  const [pendingBets, setPendingBets] = useState(0);
  const [crashBalanceDelta, setCrashBalanceDelta] = useState(0);
  const toastTimerRef = useRef<number | null>(null);
  const previousAddressRef = useRef<string | undefined>(undefined);
  const previousConnectedRef = useRef(false);

  const wallet = useWalletSession();
  const auth = useAuthSession();
  const history = useTransactionHistory();
  const demoCasino = useMockCasinoState();
  const casino = useOnchainMomoState(wallet.address);

  const filteredGames = useMemo(() => {
    if (activeCategory === "All Games") return mockGames;
    return mockGames.filter((game) => game.categories.includes(activeCategory));
  }, [activeCategory]);
  const crashBalanceStorageKey = useMemo(
    () => getCrashBalanceStorageKey(wallet.address, wallet.chainId),
    [wallet.address, wallet.chainId],
  );
  const sharedCasinoBalance = useMemo(
    () => Math.max(0, casino.casinoMomoBalance + crashBalanceDelta),
    [casino.casinoMomoBalance, crashBalanceDelta],
  );

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
    setCrashBalanceDelta(readCrashDelta(crashBalanceStorageKey));
  }, [crashBalanceStorageKey]);

  useEffect(() => {
    writeCrashDelta(crashBalanceStorageKey, crashBalanceDelta);
  }, [crashBalanceDelta, crashBalanceStorageKey]);

  useEffect(() => {
    if (casino.txState.phase === "completed" && casino.txState.hash) {
      const verb =
        casino.txState.action === "deposit"
          ? "Deposit completed"
          : casino.txState.action === "withdraw"
            ? "Withdraw completed"
            : casino.txState.action === "play"
              ? "Game resolved on-chain"
              : "Transaction completed";
      showToast(verb);
    }
  }, [casino.txState.action, casino.txState.hash, casino.txState.phase]);

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
    if (!casino.hasDeployedContracts) {
      setModal({
        title: "Casino contract not deployed",
        message: "Set the Sepolia casino contract address to activate ETH deposits, gameplay, and withdrawals.",
      });
      return false;
    }
    return true;
  };

  const openDepositModal = (suggestedAmount?: string | null) => {
    if (
      !requireWalletAndSepolia({
        noWallet: "Connect MetaMask before opening the deposit flow.",
        wrongNetwork: "Please switch your wallet to Ethereum Sepolia before opening the deposit flow.",
      }) ||
      !ensureContractsReady()
    ) {
      return;
    }

    setDepositSuggestedAmount(suggestedAmount ?? null);
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

  const handleDepositSubmit = async (amountEth: string) => {
    const amount = Number(amountEth);
    if (amount <= 0 || Number.isNaN(amount)) return "Enter a valid ETH deposit amount greater than 0.";
    if (wallet.walletBalanceValue <= 0) return "You have 0 Sepolia ETH available.";
    if (amount > wallet.walletBalanceValue) return "Deposit amount is higher than available ETH balance.";

    const result = await casino.deposit(amountEth);
    if (result.error || !result.hash) return result.error ?? "Deposit failed.";

    history.addTransaction({
      type: "Deposit",
      currency: "ETH",
      amount: amount.toFixed(6),
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: [
        `Credited ${(amount * 100000).toFixed(2)} MOMO`,
        "Deposit Sepolia ETH to receive MOMO casino credits.",
      ],
    });
    setIsDepositOpen(false);
    setDepositSuggestedAmount(null);
    showToast(`Deposit successful. Received ${(amount * 100000).toFixed(2)} MOMO.`);
    return null;
  };

  const handleWithdrawSubmit = async (amountMomo: string) => {
    const amount = Number(amountMomo);
    if (amount <= 0 || Number.isNaN(amount)) return "Enter a valid MOMO withdrawal amount greater than 0.";
    if (amount > sharedCasinoBalance) return "MOMO Casino Balance is too low for this withdrawal.";

    const result = await casino.withdraw(amountMomo);
    if (result.error || !result.hash) return result.error ?? "Withdraw failed.";

    history.addTransaction({
      type: "Withdraw",
      currency: "MOMO",
      amount: amount.toFixed(2),
      network: "Sepolia",
      status: "Completed",
      txHash: result.hash,
      details: [`Returned ${momoCreditsToEth(amount).toFixed(6)} ETH to MetaMask`],
    });
    setIsWithdrawOpen(false);
    showToast(`Withdraw completed. Returned ${momoCreditsToEth(amount).toFixed(6)} ETH.`);
    return null;
  };

  const handlePlay = (game: GameItem) => {
    if (game.title === "Fungal Crash") {
      setIsFungalCrashOpen(true);
      return;
    }
    showToast("This game is coming soon.");
  };

  const handleStartFungalCrashRound = async (betAmount: number) => {
    if (!requireWalletAndSepolia({
      noWallet: "Connect wallet before placing a bet.",
      wrongNetwork: "Switch to Sepolia before placing a bet.",
    }) || !ensureContractsReady()) {
      return { error: "Wallet and Sepolia are required.", round: null as CrashStartResult | null };
    }

    if (betAmount <= 0 || Number.isNaN(betAmount)) {
      return { error: "Enter a valid bet amount greater than 0.", round: null as CrashStartResult | null };
    }

    if (sharedCasinoBalance <= 0) {
      return { error: "Deposit Sepolia ETH to receive MOMO casino credits first.", round: null as CrashStartResult | null };
    }

    if (betAmount > sharedCasinoBalance) {
      return { error: "MOMO Casino Balance is too low for this bet.", round: null as CrashStartResult | null };
    }

    const crashMultiplier = rollCrashMultiplier();

    setCrashBalanceDelta((current) => Number((current - betAmount).toFixed(4)));
    setPendingBets((current) => current + betAmount);

    return {
      error: null,
      round: {
        betAmount,
        crashMultiplier,
      },
    };
  };

  const handleCashOutFungalCrashRound = ({ betAmount, multiplier, payout }: CrashCashOutResult) => {
    setPendingBets((current) => Math.max(0, current - betAmount));
    setCrashBalanceDelta((current) => Number((current + payout).toFixed(4)));

    history.addTransaction({
      type: "Bet",
      currency: "MOMO",
      amount: betAmount.toFixed(2),
      network: "Demo mode",
      status: "Won",
      txHash: `0xdemo${Date.now().toString(16)}`,
      details: [
        "Game: Fungal Crash",
        `Multiplier: ${multiplier.toFixed(2)}x`,
        `Payout: ${payout.toFixed(2)} MOMO`,
        `Profit: ${(payout - betAmount).toFixed(2)} MOMO`,
        "Demo mode - game logic is not on-chain yet",
      ],
      isMock: true,
    });

    demoCasino.appendCrashRound(multiplier, "User cashout");
  };

  const handleCrashLossFungalCrashRound = ({ betAmount, crashMultiplier }: CrashLossResult) => {
    setPendingBets((current) => Math.max(0, current - betAmount));

    history.addTransaction({
      type: "Bet",
      currency: "MOMO",
      amount: betAmount.toFixed(2),
      network: "Demo mode",
      status: "Lost",
      txHash: `0xdemo${Date.now().toString(16)}`,
      details: [
        "Game: Fungal Crash",
        `Multiplier: ${crashMultiplier.toFixed(2)}x`,
        "Payout: 0.00 MOMO",
        `Profit: ${(-betAmount).toFixed(2)} MOMO`,
        "Demo mode - game logic is not on-chain yet",
      ],
      isMock: true,
    });

    demoCasino.appendCrashRound(crashMultiplier, "Crash");
  };

  const handleAttemptCloseCrash = (isRoundActive: boolean) => {
    if (isRoundActive) {
      showToast("Wait for the round to resolve before closing.");
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
    setPendingBets(0);
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
              casinoMomoBalance: sharedCasinoBalance,
              hasDeployedContracts: casino.hasDeployedContracts,
              isBalanceLoading: wallet.isBalanceLoading,
              isConnected: wallet.isConnected,
              isConnectPending: wallet.isConnectPending,
              isDisconnectPending: wallet.isDisconnectPending,
              isLoggedIn: auth.isLoggedIn,
              isWrongNetwork: wallet.isWrongNetwork,
              networkName: wallet.networkName,
              pendingBets,
              shortAddress: wallet.shortAddress,
              walletBalance: wallet.walletBalance,
            }}
          />

          <div className="relative z-10 px-4 pb-14 pt-[10.5rem] sm:px-6 sm:pt-[11rem] md:pt-24 lg:px-8">
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

              <section className="rounded-[28px] border border-emerald-400/18 bg-[linear-gradient(135deg,rgba(117,255,143,0.12),rgba(255,255,255,0.04)_38%,rgba(0,0,0,0.22))] px-5 py-4 shadow-card backdrop-blur-xl sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.34em] text-emerald-300/60">VIP CLUB</p>
                    <p className="mt-2 text-base font-medium text-white">Cashback and rewards for active players</p>
                  </div>
                  <div className="inline-flex w-fit items-center rounded-full border border-emerald-300/20 bg-black/25 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_0_22px_rgba(117,255,143,0.18)]">
                    Up to 30% FTD
                  </div>
                </div>
              </section>

              <FaucetCard
                contractAddress={casino.hasDeployedContracts ? casino.contractAddress : null}
                contractExplorerUrl={casino.hasDeployedContracts ? `https://sepolia.etherscan.io/address/${casino.contractAddress}` : null}
                ethBalance={wallet.walletBalance}
                isConnected={wallet.isConnected}
                isDeployed={casino.hasDeployedContracts}
                momoCasinoBalance={sharedCasinoBalance}
                onDepositClick={() => openDepositModal()}
                profileName={auth.profileName}
              />

              <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">Featured games</p>
                    <h2 className="text-2xl font-semibold text-white">Scroll the underground lobby</h2>
                  </div>
                  <p className="max-w-2xl text-sm text-emerald-50/55">
                    Deposit Sepolia ETH to receive MOMO casino credits. Bets are placed using MOMO Casino Balance, and withdrawals return ETH to your MetaMask wallet.
                  </p>
                </div>

                <GameGrid games={filteredGames} onPlay={handlePlay} />
              </section>

              <section className="rounded-[28px] border border-emerald-400/12 bg-white/5 p-5 shadow-card backdrop-blur-xl sm:p-6">
                <div className="grid gap-6">
                  <div className="grid gap-3 md:grid-cols-2 md:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/55">Business</p>
                      <p className="mt-2 text-sm leading-7 text-white/68">
                        For partnerships or business inquiries -{" "}
                        <a
                          href="mailto:business@momobet.gg"
                          className="text-emerald-200 transition hover:text-white"
                        >
                          business@momobet.gg
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/55">Affiliates</p>
                      <p className="mt-2 text-sm leading-7 text-white/68">
                        Affiliate Program -{" "}
                        <a
                          href="mailto:partners@momobet.gg"
                          className="text-emerald-200 transition hover:text-white"
                        >
                          partners@momobet.gg
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-emerald-400/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setModal({ title: "Terms and Conditions", message: policyCopy.terms })}
                      className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:border-emerald-300/30 hover:bg-white/10 hover:text-white"
                    >
                      Terms and Conditions
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ title: "KYC Policy", message: policyCopy.kyc })}
                      className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:border-emerald-300/30 hover:bg-white/10 hover:text-white"
                    >
                      KYC Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ title: "Privacy Notice", message: policyCopy.privacy })}
                      className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:border-emerald-300/30 hover:bg-white/10 hover:text-white"
                    >
                      Privacy Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ title: "Responsible Gaming Policy", message: policyCopy.responsible })}
                      className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm text-white/78 transition hover:border-emerald-300/30 hover:bg-white/10 hover:text-white"
                    >
                      Responsible Gaming Policy
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-emerald-400/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/40">
                      Testnet only. No real money. Sepolia ETH backs MOMO Casino Balance.
                    </p>
                    <div className="flex justify-start sm:justify-end">
                      <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-black/20 px-4 py-2.5 text-sm text-white/78">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f6851b,#fcb54a)] text-sm font-black text-white shadow-[0_0_18px_rgba(246,133,27,0.25)]">
                          M
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Payment method</p>
                          <p className="mt-0.5 font-medium text-white">MetaMask</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
        availableEthBalance={wallet.walletBalanceValue}
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDepositSubmit}
        suggestedAmount={depositSuggestedAmount}
        txHash={casino.txState.hash}
        txPhase={prettifyPhase(casino.txState.phase)}
      />

      <WithdrawModal
        availableCasinoBalance={sharedCasinoBalance}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSubmit={handleWithdrawSubmit}
        txHash={casino.txState.hash}
        txPhase={prettifyPhase(casino.txState.phase)}
      />

      <TransactionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={history.transactions}
      />

      <FungalCrashModal
        casinoBalance={sharedCasinoBalance}
        isOpen={isFungalCrashOpen}
        onAttemptClose={handleAttemptCloseCrash}
        onCashOutRound={handleCashOutFungalCrashRound}
        onClose={() => setIsFungalCrashOpen(false)}
        onCrashRound={handleCrashLossFungalCrashRound}
        onQuickDeposit={(amount) => {
          openDepositModal((amount / 100000).toFixed(6));
        }}
        onRequestCustomDeposit={(amount) => {
          openDepositModal((Number(amount) / 100000).toFixed(6));
        }}
        onStartRound={handleStartFungalCrashRound}
        pendingBets={pendingBets}
        profileName={auth.profileName || wallet.shortAddress}
        realWalletBalance={wallet.walletBalanceValue}
        recentCrashRounds={demoCasino.recentCrashRounds}
      />

      {renderToast}
    </main>
  );
}
