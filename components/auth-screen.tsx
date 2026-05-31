"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

type AuthScreenProps = {
  onLogin: (values: { email: string; password: string }) => string | null;
  onRegister: (values: {
    email: string;
    password: string;
    confirmPassword: string;
    profileName: string;
  }) => string | null;
};

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("register");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040605] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(117,255,143,0.16),transparent_35%),radial-gradient(circle_at_20%_30%,rgba(117,255,143,0.08),transparent_18%)]" />
      <div className="absolute left-0 top-0 h-full w-40 bg-[radial-gradient(circle_at_left,rgba(117,255,143,0.12),transparent_70%)] blur-3xl" />
      <div className="absolute right-0 top-0 h-full w-40 bg-[radial-gradient(circle_at_right,rgba(117,255,143,0.12),transparent_70%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-emerald-400/15 bg-white/5 p-8 shadow-card backdrop-blur-xl sm:p-10"
          >
            <p className="text-sm uppercase tracking-[0.34em] text-emerald-300/60">Testnet casino access</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Create your MomoBet profile before entering the lobby
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">
              No real money. Testnet only. Your profile, withdrawals, and transaction history stay local for this frontend phase.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                "Premium green-black lobby access",
                "Wallet connection on Sepolia",
                "Mock deposits, claims, and withdrawals",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-emerald-400/12 bg-black/20 p-4 text-sm text-emerald-50/70">
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[36px] border border-emerald-400/15 bg-[#09100c]/90 p-7 shadow-[0_0_0_1px_rgba(117,255,143,0.08),0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex rounded-full border border-emerald-400/10 bg-black/20 p-1">
              {(["register", "login"] as const).map((item) => {
                const active = mode === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-gradient-to-r from-lime-300 to-emerald-300 text-emerald-950"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item === "register" ? "Registration" : "Login"}
                  </button>
                );
              })}
            </div>

            {mode === "register" ? (
              <RegisterForm onRegister={onRegister} onSwitch={() => setMode("login")} />
            ) : (
              <LoginForm onLogin={onLogin} onSwitch={() => setMode("register")} />
            )}
          </motion.section>
        </div>
      </div>
    </main>
  );
}
