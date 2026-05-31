"use client";

import { motion } from "framer-motion";
import { BadgeAlert, Flame, Joystick, Orbit, PlayCircle, Radio } from "lucide-react";
import type { GameItem } from "@/data/mock-games";

const badgeStyleMap: Record<NonNullable<GameItem["badge"]>, string> = {
  Hot: "bg-amber-400/15 text-amber-200 border-amber-300/20",
  New: "bg-sky-400/15 text-sky-100 border-sky-300/20",
  Live: "bg-rose-400/15 text-rose-100 border-rose-300/20",
  Playable: "bg-emerald-400/15 text-emerald-50 border-emerald-300/20",
};

const accentIconMap = {
  crash: Orbit,
  table: BadgeAlert,
  live: Radio,
  mini: Joystick,
  slots: Flame,
};

type GameCardProps = {
  game: GameItem;
  onPlay: (game: GameItem) => void;
};

export function GameCard({ game, onPlay }: GameCardProps) {
  const AccentIcon = accentIconMap[game.icon];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[26px] border border-emerald-400/10 bg-[#09100c]/80 p-4 shadow-card backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,255,143,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_60%)] opacity-90 transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-[26px] border border-transparent transition duration-300 group-hover:border-emerald-300/30 group-hover:shadow-[0_0_0_1px_rgba(117,255,143,0.2),0_0_36px_rgba(117,255,143,0.12)]" />
      <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl transition duration-300 group-hover:bg-emerald-300/20" />

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-black/30 text-emerald-200 shadow-[inset_0_0_20px_rgba(117,255,143,0.08)]">
            <AccentIcon className="h-6 w-6" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {game.badge ? (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${badgeStyleMap[game.badge]}`}>
                {game.badge}
              </span>
            ) : null}
            <span className="rounded-full border border-emerald-400/15 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100/70">
              {game.provider}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{game.title}</h3>
          <p className="text-sm text-emerald-50/55">{game.type}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.22em] text-white/35">
            Mock lobby card
          </span>
          <button
            type="button"
            onClick={() => onPlay(game)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15 hover:text-white"
          >
            <PlayCircle className="h-4 w-4" />
            Play
          </button>
        </div>
      </div>
    </motion.article>
  );
}
