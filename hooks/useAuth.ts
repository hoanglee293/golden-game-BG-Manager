import { create } from "zustand";
import axiosClient from "@/utils/axiosClient";

type LoginMethod = 'telegram' | 'google' | 'manual' | null;

interface User {
  username: string
  email: string
  telegram_id?: string
  referral_code: string
  fullname: string
  avatar?: string
  birthday?: string
  sex?: string
  is_master: boolean
  wallet_id: number
  wallet_address: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginMethod: LoginMethod
  login: (credentials?: LoginCredentials) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setLoginMethod: (method: LoginMethod) => void
}

interface LoginCredentials {
  username?: string
  password?: string
  telegram_id?: string
  code?: string
  google_code?: string
}

const useAuthStore = create<AuthState>((set, get) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    loginMethod: null,

    login: async (credentials?: LoginCredentials) => {
      try {
        let endpoint = '/bg-ref/auth/login';
        let payload: any = {};

        if (credentials?.username && credentials?.password) {
          // Manual login - BG Affiliate System API
          payload = {
            username: credentials.username,
            password: credentials.password
          };
          set({ loginMethod: 'manual' });
        } else if (credentials?.telegram_id && credentials?.code) {
          // Telegram login - BG Affiliate System API
          endpoint = '/bg-ref/auth/telegram-login';
          payload = {
            telegram_id: credentials.telegram_id,
            code: credentials.code
          };
          set({ loginMethod: 'telegram' });
        } else if (credentials?.google_code) {
          // Google login - BG Affiliate System API
          endpoint = '/bg-ref/auth/google-login';
          payload = {
            code: credentials.google_code
          };
          set({ loginMethod: 'google' });
        } else {
          throw new Error('Invalid login credentials');
        }

        // Call login API - cookies will be set automatically
        await axiosClient.post(endpoint, payload, { withCredentials: true });
        
        // Get user info after successful login
        await get().refreshUser();
        
      } catch (error) {
        console.error('Failed to login:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    logout: () => {
      axiosClient.post("/bg-ref/auth/logout", {}, { withCredentials: true });
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        loginMethod: null 
      });
      window.location.href = '/login';
    },

    refreshUser: async () => {
      try {
        // BG Affiliate System API - Get BG info
        const response = await axiosClient.get('/bg-ref/me', { withCredentials: true });
        // Response format: { success, message, user, bg_affiliate_info, wallet_info }
        const userData: User = response.data.user;
        
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } catch (error) {
        console.error('Failed to refresh user:', error);
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    setLoginMethod: (method: LoginMethod) => {
      localStorage.setItem("login_method", method || '');
      set({ loginMethod: method });
    }
  };
});

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    loginMethod, 
    login, 
    logout, 
    refreshUser, 
    setLoginMethod 
  } = useAuthStore();

  return { 
    user, 
    isAuthenticated, 
    isLoading, 
    loginMethod, 
    login, 
    logout, 
    refreshUser, 
    setLoginMethod 
  };
};
