"use client";

import { motion } from "framer-motion";
import { categories, type GameCategory } from "@/data/mock-games";

type CategoryTabsProps = {
  activeCategory: GameCategory;
  onChange: (category: GameCategory) => void;
};

export function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  return (
    <section className="rounded-[28px] border border-emerald-400/15 bg-white/5 p-3 shadow-card backdrop-blur-xl">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "text-emerald-950"
                  : "border border-transparent text-white/70 hover:border-emerald-400/20 hover:text-white"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-lime-300 to-emerald-300 shadow-[0_0_24px_rgba(117,255,143,0.35)]"
                />
              ) : null}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
