import { create } from "zustand";

export type UserRole = "sender" | "rider" | "";

interface UserState {
  wallet: string;
  role: UserRole;
  setWallet: (wallet: string) => void;
  setRole: (role: UserRole) => void;
  reset: () => void;
  referrer?: string;
  referrals?: string[];
  rewards?: Array<{ type: string; amount: number; details?: string }>;
  setReferrer: (referrer: string) => void;
  addReferral: (wallet: string) => void;
  addReward: (type: string, amount: number, details?: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  wallet: "",
  role: "",
  setWallet: (wallet) => set({ wallet }),
  setRole: (role) => set({ role }),
  reset: () => set({ wallet: "", role: "" }),
  referrer: undefined,
  referrals: [],
  rewards: [],
  setReferrer: (referrer) => set({ referrer }),
  addReferral: (wallet) => set((state) => ({ referrals: [...(state.referrals || []), wallet] })),
  addReward: (type, amount, details) =>
    set((state) => ({ rewards: [...(state.rewards || []), { type, amount, details }] })),
}));