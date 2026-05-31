"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Coins,
  Dices,
  Headset,
  House,
  Orbit,
  Trophy,
} from "lucide-react";

type SidebarProps = {
  isHomeExpanded: boolean;
  onToggleHome: () => void;
  onSupportClick: () => void;
};

const subMenuItems = [
  { label: "Casino", icon: Dices },
  { label: "Sportsbook", icon: Trophy },
  { label: "Mini Games", icon: Orbit },
];

export function Sidebar({
  isHomeExpanded,
  onToggleHome,
  onSupportClick,
}: SidebarProps) {
  return (
    <aside className="fixed inset-x-0 top-0 z-50 border-b border-emerald-400/10 bg-[#07100c]/90 px-4 py-4 shadow-card backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:w-[260px] md:border-b-0 md:border-r">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-emerald-400/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-4 md:p-5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-12 h-52 w-44 rounded-full border border-emerald-300/10 border-l-transparent border-b-transparent blur-[1px]" />
          <div className="absolute bottom-16 left-6 h-48 w-px rotate-[24deg] bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent" />
          <div className="absolute right-0 top-28 h-64 w-36 rounded-full border border-lime-300/10 border-r-transparent blur-[1px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/15 bg-black/30 shadow-[0_0_30px_rgba(117,255,143,0.08)]">
            <Coins className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="text-lg font-semibold tracking-[0.18em] text-white sm:text-[1.15rem]">MomoBet</p>
        </div>

        <nav className="relative z-10 mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onToggleHome}
            className="flex items-center justify-between rounded-2xl border border-emerald-400/15 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-300/25 hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              <House className="h-5 w-5 text-emerald-200" />
              <span className="font-medium text-white">Home</span>
            </span>
            <motion.span animate={{ rotate: isHomeExpanded ? 180 : 0 }}>
              <ChevronDown className="h-4 w-4 text-white/55" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {isHomeExpanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 rounded-2xl border border-emerald-400/8 bg-black/15 p-3">
                  {subMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <item.icon className="h-4 w-4 text-emerald-200/80" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </nav>

        <div className="relative z-10 mt-4 hidden md:block" />

        <div className="relative z-10 mt-4 md:mt-auto">
          <button
            type="button"
            onClick={onSupportClick}
            className="flex w-full items-center gap-3 rounded-2xl border border-emerald-400/12 bg-gradient-to-r from-white/5 to-emerald-300/5 px-4 py-3 text-left transition hover:border-emerald-300/22 hover:from-white/10 hover:to-emerald-300/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/12 bg-black/20">
              <Headset className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Contact support agent</p>
              <p className="text-xs text-white/45">Assistance and issue tracking</p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
