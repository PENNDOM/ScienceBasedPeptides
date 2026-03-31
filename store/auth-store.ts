import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  loyaltyPoints: number;
  referralCode: string;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    void fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
