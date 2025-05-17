import { create } from "zustand";

export type UserRole = "sender" | "rider" | "";

interface UserState {
  wallet: string;
  role: UserRole;
  setWallet: (wallet: string) => void;
  setRole: (role: UserRole) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  wallet: "",
  role: "",
  setWallet: (wallet) => set({ wallet }),
  setRole: (role) => set({ role }),
  reset: () => set({ wallet: "", role: "" }),
}));
