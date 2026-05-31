"use client";

import { useEffect, useState } from "react";
import { MockUser, mockStorageKeys } from "@/lib/mock-app";

type LoginValues = {
  email: string;
  password: string;
};

type RegisterValues = {
  email: string;
  password: string;
  confirmPassword: string;
  profileName: string;
};

function readStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(mockStorageKeys.user);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

function saveStoredUser(user: MockUser) {
  window.localStorage.setItem(mockStorageKeys.user, JSON.stringify(user));
}

export function useAuthSession() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = readStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsReady(true);
  }, []);

  const login = ({ email, password }: LoginValues) => {
    const storedUser = readStoredUser();

    if (!storedUser || storedUser.email.toLowerCase() !== email.toLowerCase()) {
      return "No profile found for this email. Register first.";
    }

    if (storedUser.password && storedUser.password !== password) {
      return "Incorrect password for this mock profile.";
    }

    const nextUser = { ...storedUser, isLoggedIn: true };
    saveStoredUser(nextUser);
    setUser(nextUser);
    return null;
  };

  const register = ({ confirmPassword, email, password, profileName }: RegisterValues) => {
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    const nextUser: MockUser = {
      email,
      profileName,
      password,
      isLoggedIn: true,
    };

    saveStoredUser(nextUser);
    setUser(nextUser);
    return null;
  };

  const logout = () => {
    const storedUser = readStoredUser();
    if (!storedUser) {
      setUser(null);
      return;
    }

    const nextUser = { ...storedUser, isLoggedIn: false };
    saveStoredUser(nextUser);
    setUser(nextUser);
  };

  return {
    isLoggedIn: Boolean(user?.isLoggedIn),
    isReady,
    login,
    logout,
    profileName: user?.profileName ?? "",
    register,
    user,
  };
}
