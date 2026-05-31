"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type LoginFormProps = {
  onLogin: (values: { email: string; password: string }) => string | null;
  onSwitch: () => void;
};

export function LoginForm({ onLogin, onSwitch }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    const nextError = onLogin({
      email: email.trim(),
      password,
    });

    setError(nextError);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm text-emerald-100/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30 focus:bg-black/30"
          placeholder="you@momobet.test"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-emerald-100/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30 focus:bg-black/30"
          placeholder="Enter your password"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-full border border-emerald-200/30 bg-gradient-to-r from-lime-300 via-emerald-300 to-green-400 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_24px_rgba(117,255,143,0.35)] transition hover:brightness-110"
      >
        Enter lobby
      </button>

      <button
        type="button"
        onClick={onSwitch}
        className="w-full text-sm text-emerald-100/70 transition hover:text-white"
      >
        Need a profile? Create one
      </button>
    </form>
  );
}
