"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type MockModalProps = {
  children?: ReactNode;
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function MockModal({ children, isOpen, title, message, onClose }: MockModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="relative w-full max-w-md rounded-[28px] border border-emerald-300/20 bg-[#09100d]/95 p-6 shadow-[0_0_0_1px_rgba(117,255,143,0.14),0_18px_60px_rgba(0,0,0,0.5)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300/60">Mock action</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
            {message ? <p className="mt-3 text-sm leading-7 text-white/65">{message}</p> : null}
            {children ? <div className="mt-4">{children}</div> : null}

            {children ? null : (
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/15 hover:text-white"
              >
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
