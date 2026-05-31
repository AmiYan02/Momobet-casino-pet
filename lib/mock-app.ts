export const mockStorageKeys = {
  balances: "momobet.mockBalances",
  faucet: "momobet.mockFaucet",
  recentCrashRounds: "momobet.mockRecentCrashRounds",
  user: "momobet.mockUser",
  transactions: "momobet.mockTransactions",
} as const;

export type MockUser = {
  email: string;
  profileName: string;
  password?: string;
  isLoggedIn: boolean;
};

export type TransactionType = "Claim" | "Deposit" | "Bet" | "Withdraw" | "Approve";

export type TransactionRecord = {
  id: string;
  type: TransactionType;
  currency: string;
  amount: string;
  network: string;
  status: string;
  date: string;
  txHash: string;
  address?: string;
  details?: string[];
  isMock?: boolean;
};

export type MockBalances = {
  walletMomo: number;
  casinoMomo: number;
  pendingBets: number;
};

export type CrashRoundRecord = {
  id: string;
  crashMultiplier: number;
  date: string;
  status: "Crash" | "User cashout" | "Bot cashout";
};

export const initialBalances: MockBalances = {
  walletMomo: 0,
  casinoMomo: 0,
  pendingBets: 0,
};

export const initialRecentCrashRounds: CrashRoundRecord[] = [
  {
    id: "crash-seed-1",
    crashMultiplier: 1.42,
    date: "May 30, 09:18 PM",
    status: "Crash",
  },
  {
    id: "crash-seed-2",
    crashMultiplier: 2.11,
    date: "May 30, 09:16 PM",
    status: "Bot cashout",
  },
  {
    id: "crash-seed-3",
    crashMultiplier: 1.09,
    date: "May 30, 09:15 PM",
    status: "Crash",
  },
  {
    id: "crash-seed-4",
    crashMultiplier: 4.86,
    date: "May 30, 09:14 PM",
    status: "User cashout",
  },
];

export const initialTransactions: TransactionRecord[] = [
  {
    id: "seed-claim",
    type: "Claim",
    currency: "MOMO",
    amount: "1,000",
    network: "ERC20 / Sepolia",
    status: "Completed",
    date: "2026-05-28 19:45",
    txHash: "0xclaimseed0001",
    isMock: true,
  },
  {
    id: "seed-deposit",
    type: "Deposit",
    currency: "MOMO",
    amount: "250",
    network: "ERC20 / Sepolia",
    status: "Mock",
    date: "2026-05-29 11:20",
    txHash: "0xdepositseed0002",
    isMock: true,
  },
  {
    id: "seed-bet",
    type: "Bet",
    currency: "MOMO",
    amount: "50",
    network: "Casino ledger",
    status: "Lost",
    date: "2026-05-30 00:12",
    txHash: "0xbetseed0003",
    details: ["Game: Fungal Crash", "Crash: 1.31x", "Payout: 0 MOMO", "Profit: -50 MOMO"],
    isMock: true,
  },
  {
    id: "seed-withdraw",
    type: "Withdraw",
    currency: "MOMO",
    amount: "100",
    network: "ERC20 / Sepolia",
    status: "Completed",
    date: "2026-05-30 09:08",
    txHash: "0xwithdrawseed0004",
    address: "0xA1b2...91F3",
    isMock: true,
  },
];

export function createMockTransaction(
  entry: Omit<TransactionRecord, "id" | "date">,
): TransactionRecord {
  const stamp = Date.now();

  return {
    ...entry,
    id: `tx-${stamp}`,
    date: new Date(stamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    txHash: entry.txHash || `0x${stamp.toString(16).padEnd(12, "0")}`,
  };
}
