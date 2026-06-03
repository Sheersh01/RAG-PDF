import { create } from "zustand";
import { authApi } from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        set({
          user: data.user,
          token: data.token,
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

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
