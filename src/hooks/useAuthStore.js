import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  loading: true,

  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, userData: null, loading: false });
      return () => {};
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const { user } = await res.json();
        set({ user, userData: user, loading: false });
      } else {
        localStorage.removeItem("token");
        set({ user: null, userData: null, loading: false });
      }
    } catch (e) {
      localStorage.removeItem("token");
      set({ user: null, userData: null, loading: false });
    }
    return () => {};
  },

  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ user, userData: user });
  },

  logout: async () => {
    localStorage.removeItem("token");
    set({ user: null, userData: null });
  },
}));
