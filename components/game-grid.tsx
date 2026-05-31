"use client";

import { AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/game-card";
import type { GameItem } from "@/data/mock-games";

type GameGridProps = {
  games: GameItem[];
  onPlay: (game: GameItem) => void;
};

export function GameGrid({ games, onPlay }: GameGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {games.map((game) => (
          <GameCard key={game.title} game={game} onPlay={onPlay} />
        ))}
      </AnimatePresence>
    </div>
  );
}
