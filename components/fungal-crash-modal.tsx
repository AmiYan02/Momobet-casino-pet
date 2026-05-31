"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Rocket, Volume2, VolumeX } from "lucide-react";
import type { CrashRoundRecord } from "@/lib/mock-app";

type RoundStatus = "Waiting" | "Flying" | "Cashed out" | "Crashed";
type FeedEvent = {
  id: string;
  player: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  timestamp: string;
  status: "Won" | "Cashed out";
};

type FungalCrashModalProps = {
  casinoBalance: number;
  isOpen: boolean;
  onAttemptClose: (isRoundActive: boolean) => boolean;
  onClose: () => void;
  onFinishRound: (result: {
    betAmount: number;
    crashMultiplier: number;
    payout: number;
    profit: number;
    status: "Won" | "Lost";
    cashoutMultiplier?: number;
  }) => void;
  onQuickDeposit: (amount: number) => void;
  onRequestCustomDeposit: (amount: string) => void;
  pendingBets: number;
  onStartRound: (betAmount: number) => string | null;
  profileName: string;
  realWalletBalance: number;
  recentCrashRounds: CrashRoundRecord[];
};

const demoPlayers = ["Del1ght", "Shoke", "Nikita2000Super", "maximillian", "getright"];
const quickButtons = ["10", "25", "50", "100"] as const;

function generateCrashMultiplier() {
  const roll = Math.random();

  if (roll < 0.5) return Number((1 + Math.random() * 1.15).toFixed(2));
  if (roll < 0.84) return Number((1.1 + Math.random() * 1.9).toFixed(2));
  if (roll < 0.97) return Number((3 + Math.random() * 7).toFixed(2));
  return Number((10 + Math.random() * 10).toFixed(2));
}

function createDemoEvent(player?: string): FeedEvent {
  const betAmount = Number((25 + Math.random() * 180).toFixed(2));
  const multiplier = Number((1.2 + Math.random() * 3.9).toFixed(2));
  const payout = Number((betAmount * multiplier).toFixed(2));

  return {
    id: `feed-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    player: player ?? demoPlayers[Math.floor(Math.random() * demoPlayers.length)],
    betAmount,
    multiplier,
    payout,
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    status: Math.random() > 0.4 ? "Cashed out" : "Won",
  };
}

export function FungalCrashModal({
  casinoBalance,
  isOpen,
  onAttemptClose,
  onClose,
  onFinishRound,
  onQuickDeposit,
  onRequestCustomDeposit,
  pendingBets,
  onStartRound,
  profileName,
  realWalletBalance,
  recentCrashRounds,
}: FungalCrashModalProps) {
  const [betAmount, setBetAmount] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>("Waiting");
  const [resultText, setResultText] = useState("Set your wager and ride the fungal airlane.");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [feed, setFeed] = useState<FeedEvent[]>(() =>
    Array.from({ length: 6 }, () => createDemoEvent()),
  );
  const crashMultiplierRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const roundStartRef = useRef<number | null>(null);
  const activeBetRef = useRef<number>(0);
  const scheduledTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setBetAmount("");
      setMultiplier(1);
      setRoundStatus("Waiting");
      setResultText("Set your wager and ride the fungal airlane.");
      setError(null);
      activeBetRef.current = 0;
      crashMultiplierRef.current = 1;
      roundStartRef.current = null;
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const clearScheduled = () => {
      scheduledTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
      scheduledTimeoutsRef.current = [];
    };

    const spawnBatch = () => {
      clearScheduled();
      demoPlayers.forEach((player, index) => {
        const timeout = window.setTimeout(() => {
          setFeed((current) => [createDemoEvent(player), ...current].slice(0, 12));
        }, index * 5000);
        scheduledTimeoutsRef.current.push(timeout);
      });
    };

    spawnBatch();
    const interval = window.setInterval(spawnBatch, 30000);

    return () => {
      clearScheduled();
      window.clearInterval(interval);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      scheduledTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const stopRound = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const flyProgress = useMemo(() => Math.min(100, (multiplier - 1) * 20), [multiplier]);
  const selectedBalanceLabel = "Casino Balance";
  const isRoundActive = roundStatus === "Flying";
  const showQuickDeposit = casinoBalance <= 0 && realWalletBalance > 0;
  const isBetBlocked = casinoBalance <= 0;
  const hasInsufficientCasinoBalance = Number(betAmount || "0") > casinoBalance && casinoBalance > 0;

  const recentRoundPillClasses: Record<CrashRoundRecord["status"], string> = {
    Crash: "border-rose-300/15 bg-rose-300/10 text-rose-100/80",
    "User cashout": "border-emerald-300/15 bg-emerald-300/10 text-emerald-50/85",
    "Bot cashout": "border-white/10 bg-white/5 text-white/65",
  };

  const handleStartRound = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (roundStatus === "Flying") {
      setError("Active round already in progress.");
      return;
    }

    if (!betAmount.trim() || Number(betAmount) <= 0) {
      setError("Enter a valid bet amount greater than 0.");
      return;
    }

    const nextBet = Number(betAmount);
    const nextError = onStartRound(nextBet);
    if (nextError) {
      setError(nextError);
      return;
    }

    setError(null);
    setResultText("The spores are rising...");
    setRoundStatus("Flying");
    setMultiplier(1);
    activeBetRef.current = nextBet;
    crashMultiplierRef.current = generateCrashMultiplier();
    roundStartRef.current = performance.now();

    const tick = (time: number) => {
      if (!roundStartRef.current) return;

      const elapsed = (time - roundStartRef.current) / 1000;
      const nextMultiplier = Number((1 + elapsed * 0.9 + elapsed * elapsed * 0.13).toFixed(2));

      if (nextMultiplier >= crashMultiplierRef.current) {
        stopRound();
        setMultiplier(crashMultiplierRef.current);
        setRoundStatus("Crashed");
        setResultText(`CRASHED AT ${crashMultiplierRef.current.toFixed(2)}x. You lost ${activeBetRef.current.toFixed(2)} MOMO`);
        onFinishRound({
          betAmount: activeBetRef.current,
          crashMultiplier: crashMultiplierRef.current,
          payout: 0,
          profit: -activeBetRef.current,
          status: "Lost",
        });
        activeBetRef.current = 0;
        return;
      }

      setMultiplier(nextMultiplier);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  };

  const handleCashOut = () => {
    if (roundStatus !== "Flying") {
      setError(roundStatus === "Crashed" ? "Cash out clicked after crash." : "Cannot cash out before round starts.");
      return;
    }

    stopRound();
    const payout = Number((activeBetRef.current * multiplier).toFixed(2));
    const profit = Number((payout - activeBetRef.current).toFixed(2));

    setRoundStatus("Cashed out");
    setResultText(`Cashed out at ${multiplier.toFixed(2)}x. You won ${payout.toFixed(2)} MOMO`);
    setFeed((current) => [
      {
        id: `user-feed-${Date.now()}`,
        player: profileName || "You",
        betAmount: activeBetRef.current,
        multiplier,
        payout,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        status: "Cashed out" as const,
      },
      ...current,
    ].slice(0, 12));
    onFinishRound({
      betAmount: activeBetRef.current,
      crashMultiplier: crashMultiplierRef.current,
      payout,
      profit,
      status: "Won",
      cashoutMultiplier: multiplier,
    });
    activeBetRef.current = 0;
  };

  const handleApplyQuickAmount = (value: string) => {
    setError(null);
    setBetAmount(value);
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
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/60">Testnet mock mode</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Fungal Crash</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/60">
                    House edge: 3%
                  </span>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100/85">
                    Demo live feed
                  </span>
                  <span className="rounded-full border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-100/85">
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
                  title={isRoundActive ? "Cash out or wait for crash before closing." : "Minimize game"}
                  disabled={isRoundActive}
                  onClick={() => {
                    if (!onAttemptClose(isRoundActive)) return;
                    stopRound();
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
                <div
                  className={`relative min-h-[260px] overflow-hidden rounded-[22px] border p-4 transition sm:min-h-[320px] sm:rounded-[28px] sm:p-5 md:min-h-[420px] ${
                    roundStatus === "Crashed"
                      ? "border-rose-400/25 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.16)]"
                      : roundStatus === "Cashed out"
                        ? "border-emerald-300/25 bg-emerald-400/10 shadow-[0_0_40px_rgba(117,255,143,0.16)]"
                        : "border-emerald-400/15 bg-[#06110b] shadow-[0_0_40px_rgba(117,255,143,0.08)]"
                  }`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(117,255,143,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(117,255,143,0.09)_1px,transparent_1px)] bg-[size:42px_42px]" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-400/10 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/55">Multiplier</p>
                        <div className={`mt-2 text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl ${
                          roundStatus === "Crashed" ? "text-rose-200" : "text-emerald-200"
                        }`}>
                          {multiplier.toFixed(2)}x
                        </div>
                      </div>
                      <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm sm:w-auto sm:text-right">
                        <p className="text-white/50">Round status</p>
                        <p className="mt-1 font-medium text-white">{roundStatus}</p>
                      </div>
                    </div>

                    <div className="relative h-[180px] sm:h-[240px] md:h-[320px]">
                      <div
                        className="absolute bottom-10 left-4 h-[3px] origin-left rounded-full bg-gradient-to-r from-emerald-300/35 via-emerald-200 to-lime-300 shadow-[0_0_24px_rgba(117,255,143,0.28)] transition-all duration-150 sm:left-8"
                        style={{
                          width: `${24 + flyProgress * 2.4}px`,
                          transform: `translateY(-${flyProgress * 1.6}px)`,
                        }}
                      />
                      <div
                        className="absolute bottom-7 left-2 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-100 shadow-[0_0_28px_rgba(117,255,143,0.35)] transition-all duration-150 sm:left-6 sm:h-14 sm:w-14"
                        style={{
                          transform: `translate(${flyProgress * 2.5}px, -${flyProgress * 1.6}px)`,
                        }}
                      >
                        <Rocket className="h-5 w-5 rotate-45 sm:h-6 sm:w-6" />
                      </div>
                    </div>

                    <div className={`rounded-[22px] border px-4 py-4 text-sm leading-7 ${
                      roundStatus === "Crashed"
                        ? "border-rose-300/15 bg-rose-500/10 text-rose-100"
                        : roundStatus === "Cashed out"
                          ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-50"
                          : "border-white/10 bg-black/20 text-white/70"
                    }`}>
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
                              {item.player} {item.status.toLowerCase()} {item.payout.toFixed(2)} MOMO at {item.multiplier.toFixed(2)}x
                            </p>
                            <p className="mt-1 text-white/45">
                              Bet {item.betAmount.toFixed(2)} MOMO • {item.timestamp}
                            </p>
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
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${recentRoundPillClasses[round.status]}`}>
                            {round.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 md:overflow-y-auto md:pr-1 md:fancy-scrollbar">
                <form onSubmit={handleStartRound} className="space-y-4 rounded-[24px] border border-emerald-400/15 bg-white/5 p-4 sm:rounded-[28px] sm:p-5">
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/60">Balance source</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Source: Shared MOMO Casino Balance</p>
                        <p className="mt-2 text-lg font-semibold text-white">{casinoBalance.toFixed(2)} MOMO</p>
                        <p className="mt-2 text-xs text-emerald-50/65">This is the playable in-app casino balance used by Fungal Crash.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/55">Wallet Balance</p>
                        <p className="mt-2 text-lg font-semibold text-white">{realWalletBalance.toFixed(2)} MOMO</p>
                        <p className="mt-2 text-xs text-white/45">
                          For real on-chain flow, tokens must be deposited to Casino Balance first. Wallet Balance betting is mock-only for demo.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-emerald-100/65 sm:grid-cols-2">
                      <p>Selected balance: {selectedBalanceLabel}</p>
                      <p>MOMO Casino Balance: {casinoBalance.toFixed(2)} MOMO</p>
                      <p>Pending bets: {pendingBets.toFixed(2)} MOMO</p>
                      <p>Source: Shared MOMO Casino Balance</p>
                    </div>
                  </div>

                  {casinoBalance <= 0 ? (
                    <div className="rounded-[22px] border border-emerald-300/15 bg-emerald-300/10 p-4">
                      <p className="font-medium text-emerald-50">Deposit MOMO to Casino first</p>
                      <p className="mt-2 text-sm text-emerald-50/65">
                        {showQuickDeposit
                          ? `You have ${realWalletBalance.toFixed(2)} MOMO in Wallet Balance. Move tokens to Casino Balance before playing.`
                          : "Your real vault balance is 0 MOMO. Deposit on-chain before starting a demo round."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {showQuickDeposit ? (
                          <button
                            type="button"
                            onClick={() => onQuickDeposit(Math.min(100, realWalletBalance))}
                            className="rounded-full border border-emerald-200/25 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.22)] transition hover:brightness-110"
                          >
                            Move {Math.min(100, realWalletBalance).toFixed(2)} MOMO to Casino
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onRequestCustomDeposit(realWalletBalance > 100 ? "250" : Math.max(realWalletBalance, 100).toFixed(2))}
                          className="rounded-full border border-emerald-300/15 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/10 hover:text-white"
                        >
                          Deposit custom amount
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="mb-2 block text-sm text-emerald-100/70">Bet amount</label>
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
                        onClick={() => handleApplyQuickAmount(item)}
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
                    Round status: <span className="font-medium text-emerald-100">{roundStatus}</span>
                  </div>

                  {casinoBalance <= 0 && realWalletBalance <= 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                      Claim MOMO test chips first to start playing.
                    </div>
                  ) : null}

                  {hasInsufficientCasinoBalance ? (
                    <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
                      Insufficient MOMO Casino Balance
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
                      disabled={isRoundActive || isBetBlocked || hasInsufficientCasinoBalance}
                      className="min-h-12 rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Start Round
                    </button>
                    <button
                      type="button"
                      onClick={handleCashOut}
                      disabled={!isRoundActive}
                      className="min-h-12 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Cash Out
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
