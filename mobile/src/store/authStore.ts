import { create } from 'zustand';
import authService from '../services/auth.service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profile?: any;
}

interface AuthState {
  user: User | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, profile: any) => void;
  setProfile: (profile: any) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, profile) =>
    set({
      user,
      profile,
      isAuthenticated: true,
      isLoading: false,
    }),

  setProfile: (profile) =>
    set((state) => ({
      profile,
      user: state.user ? { ...state.user, profile } : null,
    })),

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getStoredUser();
        set({
          user,
          profile: user?.profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

