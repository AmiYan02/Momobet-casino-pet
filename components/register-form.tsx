"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type RegisterFormProps = {
  onRegister: (values: {
    email: string;
    password: string;
    confirmPassword: string;
    profileName: string;
  }) => string | null;
  onSwitch: () => void;
};

export function RegisterForm({ onRegister, onSwitch }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileName, setProfileName] = useState("");
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

    if (!confirmPassword.trim()) {
      setError("Password confirmation is required.");
      return;
    }

    if (!profileName.trim()) {
      setError("Profile name is required.");
      return;
    }

    const nextError = onRegister({
      email: email.trim(),
      password,
      confirmPassword,
      profileName: profileName.trim(),
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
        <label className="mb-2 block text-sm text-emerald-100/70">Profile name</label>
        <input
          type="text"
          value={profileName}
          onChange={(event) => setProfileName(event.target.value)}
          className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30 focus:bg-black/30"
          placeholder="Ami"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-emerald-100/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30 focus:bg-black/30"
          placeholder="Choose a password"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-emerald-100/70">Confirm password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-emerald-400/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-emerald-300/30 focus:bg-black/30"
          placeholder="Re-enter your password"
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
        Create profile
      </button>

      <button
        type="button"
        onClick={onSwitch}
        className="w-full text-sm text-emerald-100/70 transition hover:text-white"
      >
        Already registered? Login
      </button>
    </form>
  );
}
