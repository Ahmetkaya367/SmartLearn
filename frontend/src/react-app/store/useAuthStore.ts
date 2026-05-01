import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/data/seed";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("chat_history");
                set({ user: null, token: null, isAuthenticated: false });
            },
            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),
        }),
        {
            name: "auth-storage",
        }
    )
);
