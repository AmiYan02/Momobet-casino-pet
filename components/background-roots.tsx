"use client";

import { motion } from "framer-motion";

const spores = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  size: 3 + (index % 4) * 2,
  left: `${4 + index * 5}%`,
  top: `${8 + (index * 13) % 78}%`,
  delay: index * 0.35,
  duration: 6 + (index % 5),
}));

export function BackgroundRoots() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 bg-[radial-gradient(circle_at_left,rgba(117,255,143,0.2),transparent_60%)] blur-2xl" />
      <div className="absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_right,rgba(117,255,143,0.15),transparent_60%)] blur-2xl" />

      <div className="absolute inset-y-0 left-0 w-56 opacity-50">
        <div className="absolute left-6 top-16 h-[70%] w-px bg-gradient-to-b from-transparent via-emerald-300/35 to-transparent" />
        <div className="absolute left-8 top-28 h-40 w-40 rounded-full border border-emerald-300/10 border-l-transparent border-t-transparent blur-[1px]" />
        <div className="absolute bottom-24 left-4 h-48 w-52 rounded-full border border-emerald-300/10 border-r-transparent blur-[1px]" />
        <div className="absolute left-14 top-1/3 h-44 w-px rotate-[28deg] bg-gradient-to-b from-transparent via-emerald-200/30 to-transparent" />
      </div>

      <div className="absolute inset-y-0 right-0 w-56 opacity-40">
        <div className="absolute right-7 top-20 h-[68%] w-px bg-gradient-to-b from-transparent via-lime-300/25 to-transparent" />
        <div className="absolute right-6 top-1/4 h-44 w-44 rounded-full border border-l-transparent border-emerald-200/10 blur-[1px]" />
        <div className="absolute bottom-16 right-4 h-52 w-56 rounded-full border border-r-transparent border-emerald-300/10 blur-[1px]" />
        <div className="absolute right-14 top-1/2 h-36 w-px -rotate-[30deg] bg-gradient-to-b from-transparent via-emerald-200/20 to-transparent" />
      </div>

      {spores.map((spore) => (
        <motion.span
          key={spore.id}
          className="absolute rounded-full bg-emerald-300/40 shadow-[0_0_16px_rgba(117,255,143,0.45)]"
          style={{
            width: spore.size,
            height: spore.size,
            left: spore.left,
            top: spore.top,
          }}
          animate={{
            y: [-8, 10, -8],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.25, 1],
          }}
          transition={{
            delay: spore.delay,
            duration: spore.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
