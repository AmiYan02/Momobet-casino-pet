"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

type HeroBannerProps = {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

export function HeroBanner({ onPrimaryClick, onSecondaryClick }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-emerald-400/15 bg-hero-radial p-8 shadow-card backdrop-blur-xl sm:p-10 lg:p-14">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(87,255,140,0.08)_100%)]" />
      <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-full w-1/2">
        <div className="absolute right-8 top-10 h-48 w-48 rounded-full border border-emerald-200/10 blur-[1px]" />
        <div className="absolute right-24 top-14 h-64 w-px rotate-[24deg] bg-gradient-to-b from-transparent via-emerald-200/35 to-transparent" />
        <div className="absolute bottom-8 right-4 h-56 w-56 rounded-full border border-lime-300/10 border-l-transparent border-b-transparent blur-[1px]" />
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-[0.35em] text-emerald-300/65"
          >
            Premium casino lobby concept
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            Enter the MomoBet Casino
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-base leading-8 text-white/65 sm:text-lg"
          >
            Dark rooms. Green lights. Provably fair games coming soon.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={onPrimaryClick}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_28px_rgba(117,255,143,0.28)] transition hover:brightness-110"
            >
              <Play className="h-4 w-4" />
              Start Playing
            </button>
            <button
              type="button"
              onClick={onSecondaryClick}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-white/5 px-5 py-3 text-sm font-medium text-white/85 transition hover:border-emerald-300/35 hover:bg-white/10"
            >
              Explore Games
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          className="relative mx-auto flex w-full max-w-md items-center justify-center"
        >
          <div className="relative h-[280px] w-full overflow-hidden rounded-[30px] border border-emerald-300/15 bg-black/30 shadow-[inset_0_0_90px_rgba(117,255,143,0.12)]">
            <div className="absolute inset-6 rounded-[24px] border border-emerald-300/10" />
            <div className="absolute left-1/2 top-1/2 h-40 w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-emerald-200/45 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-px w-40 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-200/35 to-transparent" />
            <div className="absolute left-10 top-14 h-24 w-24 rounded-full border border-emerald-200/20 border-l-transparent blur-[1px]" />
            <div className="absolute bottom-10 right-10 h-28 w-28 rounded-full border border-lime-300/15 border-b-transparent blur-[1px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(117,255,143,0.18),transparent_30%),radial-gradient(circle_at_70%_35%,rgba(151,255,93,0.18),transparent_18%)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
