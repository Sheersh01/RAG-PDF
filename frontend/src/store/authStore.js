import { create } from "zustand";
import { authApi } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: async () => {
    try {
      const data = await authApi.me();
      if (data.success && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: data.message || "Login failed", isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "An error occurred during login";
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(name, email, password);
      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        set({ error: data.message || "Registration failed", isLoading: false });
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "An error occurred during registration";
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
