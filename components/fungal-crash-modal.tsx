"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Rocket, Volume2, VolumeX } from "lucide-react";
import type { CrashRoundRecord } from "@/lib/mock-app";

type RoundStatus = "Waiting" | "Running" | "Cashed Out" | "Crashed";
type CrashRound = {
  betAmount: number;
  crashMultiplier: number;
};
type FeedEvent = {
  id: string;
  player: string;
  payout: number;
  timestamp: string;
};

type FungalCrashModalProps = {
  casinoBalance: number;
  isOpen: boolean;
  onAttemptClose: (isRoundActive: boolean) => boolean;
  onCashOutRound: (result: { betAmount: number; multiplier: number; payout: number }) => void;
  onClose: () => void;
  onCrashRound: (result: { betAmount: number; crashMultiplier: number }) => void;
  onQuickDeposit: (amount: number) => void;
  onRequestCustomDeposit: (amount: string) => void;
  onStartRound: (betAmount: number) => Promise<{ error: string | null; round: CrashRound | null }>;
  pendingBets: number;
  profileName: string;
  realWalletBalance: number;
  recentCrashRounds: CrashRoundRecord[];
};

const demoPlayers = ["Del1ght", "Shoke", "Nikita2000Super", "maximillian", "getright"];
const quickButtons = ["10", "25", "50", "100"] as const;

function createDemoEvent(player?: string): FeedEvent {
  const payout = Number((35 + Math.random() * 260).toFixed(2));

  return {
    id: `feed-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    player: player ?? demoPlayers[Math.floor(Math.random() * demoPlayers.length)],
    payout,
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export function FungalCrashModal({
  casinoBalance,
  isOpen,
  onAttemptClose,
  onCashOutRound,
  onClose,
  onCrashRound,
  onQuickDeposit,
  onRequestCustomDeposit,
  onStartRound,
  pendingBets,
  profileName,
  realWalletBalance,
  recentCrashRounds,
}: FungalCrashModalProps) {
  const [betAmount, setBetAmount] = useState("");
  const [status, setStatus] = useState<RoundStatus>("Waiting");
  const [resultText, setResultText] = useState("Place a Fungal Crash bet using MOMO Casino Balance.");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const [activeRound, setActiveRound] = useState<CrashRound | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>(() => Array.from({ length: 6 }, () => createDemoEvent()));

  useEffect(() => {
    if (!isOpen) {
      setBetAmount("");
      setStatus("Waiting");
      setResultText("Place a Fungal Crash bet using MOMO Casino Balance.");
      setError(null);
      setDisplayMultiplier(1);
      setActiveRound(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = window.setInterval(() => {
      setFeed((current) => [createDemoEvent(), ...current].slice(0, 12));
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || status !== "Running" || !activeRound) return;

    const interval = window.setInterval(() => {
      setDisplayMultiplier((current) => {
        const next = Number((current < 2 ? current + 0.03 : current * 1.035).toFixed(2));

        if (next >= activeRound.crashMultiplier) {
          window.clearInterval(interval);
          setStatus("Crashed");
          setDisplayMultiplier(activeRound.crashMultiplier);
          setResultText(`Crashed at ${activeRound.crashMultiplier.toFixed(2)}x. Lost: ${activeRound.betAmount.toFixed(2)} MOMO`);
          onCrashRound({
            betAmount: activeRound.betAmount,
            crashMultiplier: activeRound.crashMultiplier,
          });
          setActiveRound(null);
          return activeRound.crashMultiplier;
        }

        return next;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [activeRound, isOpen, onCrashRound, status]);

  const isRoundActive = status === "Running";
  const showQuickDeposit = casinoBalance <= 0 && realWalletBalance > 0;
  const hasInsufficientCasinoBalance = Number(betAmount || "0") > casinoBalance && casinoBalance > 0;
  const currentPayout = useMemo(
    () => (activeRound ? Number((activeRound.betAmount * displayMultiplier).toFixed(2)) : 0),
    [activeRound, displayMultiplier],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!betAmount.trim() || Number(betAmount) <= 0) {
      setError("Enter a valid bet amount greater than 0.");
      return;
    }

    setError(null);
    setDisplayMultiplier(1);
    setStatus("Running");
    setResultText("Spreading spores through the tunnel...");

    const result = await onStartRound(Number(betAmount));
    if (result.error || !result.round) {
      setStatus("Waiting");
      setError(result.error ?? "Bet failed.");
      return;
    }

    setActiveRound(result.round);
  };

  const handleCashOut = () => {
    if (!activeRound || status !== "Running") return;

    const payout = Number((activeRound.betAmount * displayMultiplier).toFixed(2));
    onCashOutRound({
      betAmount: activeRound.betAmount,
      multiplier: displayMultiplier,
      payout,
    });
    setStatus("Cashed Out");
    setResultText(`Cashed out at ${displayMultiplier.toFixed(2)}x. Payout: ${payout.toFixed(2)} MOMO`);
    setFeed((current) => [
      {
        id: `user-feed-${Date.now()}`,
        player: profileName || "You",
        payout,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
      ...current,
    ].slice(0, 12));
    setActiveRound(null);
  };

  const handleHalf = () => {
    if (Number(betAmount) > 0) {
      setBetAmount((Number(betAmount) / 2).toFixed(2));
      return;
    }
    setBetAmount((casinoBalance / 2).toFixed(2));
  };

  const handleMax = () => {
    setBetAmount(casinoBalance.toFixed(2));
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md md:p-6"
        >
          <motion.section
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="relative flex h-[92vh] w-full max-w-[1440px] flex-col overflow-hidden rounded-[26px] border border-emerald-300/20 bg-[#07100c]/95 shadow-[0_0_0_1px_rgba(117,255,143,0.12),0_24px_100px_rgba(0,0,0,0.55)] sm:h-[88vh] sm:w-[94vw] sm:rounded-[30px] xl:w-[90vw]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(117,255,143,0.14),transparent_28%),radial-gradient(circle_at_70%_25%,rgba(117,255,143,0.08),transparent_20%)]" />
            <div className="relative z-10 flex flex-col gap-4 border-b border-emerald-300/10 px-4 py-4 sm:px-5 md:flex-row md:items-start md:justify-between md:px-7">
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">Testnet only</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Fungal Crash</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
                    48% win chance
                  </span>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100/85">
                    Demo mode - game logic is not on-chain yet
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted((current) => !current)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">Sound</span>
                </button>
                <button
                  type="button"
                  title={isRoundActive ? "Wait for the round to resolve before closing." : "Minimize game"}
                  disabled={isRoundActive}
                  onClick={() => {
                    if (!onAttemptClose(isRoundActive)) return;
                    onClose();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative z-10 grid flex-1 gap-4 overflow-y-auto p-3 sm:p-4 md:grid-cols-[1.45fr_0.95fr] md:overflow-hidden md:p-6">
              <div className="grid min-h-0 gap-4">
                <div className="relative min-h-[260px] overflow-hidden rounded-[22px] border border-emerald-400/15 bg-[#06110b] p-4 shadow-[0_0_40px_rgba(117,255,143,0.08)] transition sm:min-h-[320px] sm:rounded-[28px] sm:p-5 md:min-h-[420px]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(117,255,143,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(117,255,143,0.09)_1px,transparent_1px)] bg-[size:42px_42px]" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-400/10 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/55">Resolution</p>
                        <div className={`mt-2 text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl ${
                          status === "Crashed" ? "text-rose-200" : "text-emerald-200"
                        }`}>
                          {displayMultiplier.toFixed(2)}x
                        </div>
                      </div>
                      <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm sm:w-auto sm:text-right">
                        <p className="text-white/50">Round status</p>
                        <p className="mt-1 font-medium text-white">{status}</p>
                      </div>
                    </div>

                    <div className="relative h-[180px] sm:h-[240px] md:h-[320px]">
                      <div className="absolute bottom-10 left-4 h-[3px] w-[42%] rounded-full bg-gradient-to-r from-emerald-300/35 via-emerald-200 to-lime-300 shadow-[0_0_24px_rgba(117,255,143,0.28)] sm:left-8 sm:w-[55%]" />
                      <div className="absolute bottom-7 left-[42%] flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-100 shadow-[0_0_28px_rgba(117,255,143,0.35)] sm:h-14 sm:w-14">
                        <Rocket className="h-5 w-5 rotate-45 sm:h-6 sm:w-6" />
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white/70">
                      {resultText}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-emerald-400/15 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/60">Live Wins</p>
                      <span className="text-xs text-white/45">Demo live feed</span>
                    </div>
                    <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1 fancy-scrollbar">
                      <AnimatePresence initial={false}>
                        {feed.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: index > 8 ? 0.45 : 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-2xl border border-emerald-300/10 bg-black/20 px-4 py-3 text-sm"
                          >
                            <p className="font-medium leading-6 text-emerald-50">
                              {item.player} won {item.payout.toFixed(2)} MOMO
                            </p>
                            <p className="mt-1 text-white/45">{item.timestamp}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-emerald-400/15 bg-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/60">Recent rounds</p>
                    <div className="mt-4 space-y-3">
                      {recentCrashRounds.map((round) => (
                        <div key={round.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-white">{round.crashMultiplier.toFixed(2)}x</p>
                            <p className="mt-1 text-white/45">{round.date}</p>
                          </div>
                          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100/80">
                            {round.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 md:overflow-y-auto md:pr-1 md:fancy-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-emerald-400/15 bg-white/5 p-4 sm:rounded-[28px] sm:p-5">
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/60">Balance source</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">ETH</p>
                        <p className="mt-2 text-lg font-semibold text-white">{realWalletBalance.toFixed(4)} ETH</p>
                        <p className="mt-2 text-xs text-emerald-50/65">Sepolia balance from MetaMask</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/55">MOMO Casino Balance</p>
                        <p className="mt-2 text-lg font-semibold text-white">{casinoBalance.toFixed(2)} MOMO</p>
                        <p className="mt-2 text-xs text-white/45">Bets are placed using MOMO Casino Balance.</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-emerald-100/65 sm:grid-cols-2">
                      <p>Source: Shared MOMO Casino Balance ({casinoBalance.toFixed(2)} MOMO)</p>
                      <p>Pending bets: {pendingBets.toFixed(2)} MOMO</p>
                    </div>
                  </div>

                  {casinoBalance <= 0 ? (
                    <div className="rounded-[22px] border border-emerald-300/15 bg-emerald-300/10 p-4">
                      <p className="font-medium text-emerald-50">Deposit MOMO to Casino first</p>
                      <p className="mt-2 text-sm text-emerald-50/65">
                        Deposit Sepolia ETH to receive MOMO casino credits.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {showQuickDeposit ? (
                          <button
                            type="button"
                            onClick={() => onQuickDeposit(Math.min(100, realWalletBalance * 100000))}
                            className="rounded-full border border-emerald-200/25 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.22)] transition hover:brightness-110"
                          >
                            Deposit ETH
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onRequestCustomDeposit("500")}
                          className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/10 hover:text-white"
                        >
                          Open cashier
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-sm text-emerald-100/70">Bet amount (MOMO)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={betAmount}
                      onChange={(event) => setBetAmount(event.target.value)}
                      className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30"
                      placeholder="100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {quickButtons.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setBetAmount(item)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleHalf}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      1/2
                    </button>
                    <button
                      type="button"
                      onClick={handleMax}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      Max
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                    <p className="text-white/55">MOMO Casino Balance</p>
                    <p className="mt-1 font-medium text-emerald-100">{casinoBalance.toFixed(2)} MOMO</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                    You will risk <span className="font-medium text-emerald-100">{Number(betAmount || "0").toFixed(2)} MOMO</span> and may receive a higher MOMO payout if the round clears before the crash.
                  </div>

                  {hasInsufficientCasinoBalance ? (
                    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
                      MOMO Casino Balance is too low for this bet.
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="submit"
                      disabled={isRoundActive || casinoBalance <= 0 || hasInsufficientCasinoBalance || Number(betAmount || "0") <= 0}
                      className="min-h-12 rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Start round
                    </button>
                    <button
                      type="button"
                      onClick={handleCashOut}
                      disabled={!isRoundActive || !activeRound}
                      className="min-h-12 rounded-full border border-emerald-300/20 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRoundActive && activeRound ? `Cash out ${currentPayout.toFixed(2)} MOMO` : "Cash out"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
