import { create } from "zustand";
import { checkBgAffiliateStatusWithToken } from '@/lib/api';
import axiosClient from "@/utils/axiosClient";

type LoginMethod = 'telegram' | 'google' | 'phantom' | null;

interface User {
  walletId: number
  solanaAddress: string
  nickName: string
  ethAddress: string
  isBgAffiliate: boolean
  telegramId?: string
  email?: string
  level?: number
  commissionPercent?: number
  code?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginMethod: LoginMethod
  login: (token?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setLoginMethod: (method: LoginMethod) => void
}

const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from localStorage
  const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const loginMethod = typeof window !== "undefined" ? localStorage.getItem("login_method") as LoginMethod : null;

  return {
    user: null,
    isAuthenticated: !!isLoggedIn,
    isLoading: true,
    loginMethod: loginMethod,

    login: async (token?: string) => {
      try {
        if (token) {
          localStorage.setItem("auth_token", token);
        } else {
          localStorage.setItem("auth_token", "true");
        }
        
        // Call BG Affiliate API to get status
        try {
          const bgData = await checkBgAffiliateStatusWithToken();
          console.log("bgData", bgData);
          
          if (bgData) {
            const userData: User = {
              walletId: bgData.currentWallet?.walletId || 0,
              solanaAddress: bgData.currentWallet?.solanaAddress || '',
              nickName: bgData.currentWallet?.nickName || 'User',
              ethAddress: bgData.currentWallet?.ethAddress || '',
              isBgAffiliate: bgData.isBgAffiliate || false,
              telegramId: undefined, // Will be set from JWT token if available
              email: undefined, // Will be set from JWT token if available
              level: bgData.bgAffiliateInfo?.level,
              commissionPercent: bgData.bgAffiliateInfo?.commissionPercent,
              code: bgData.currentWallet?.refCode
            };
            
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
          } else {
            // Fallback user data if BG API fails
            const userData: User = {
              walletId: 0,
              solanaAddress: '',
              nickName: 'User',
              ethAddress: '',
              isBgAffiliate: false
            };
            
            set({ 
              user: userData, 
              isAuthenticated: true, 
              isLoading: false 
            });
          }
        } catch (bgError) {
          console.error('BG Affiliate API error:', bgError);
          // Set basic user data if BG API fails
          const userData: User = {
            walletId: 0,
            solanaAddress: '',
            nickName: 'User',
            ethAddress: '',
            isBgAffiliate: false
          };
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Failed to login:', error);
        set({ isLoading: false });
      }
    },

    logout: () => {
      axiosClient.post("/bg-ref/logout");
      localStorage.removeItem("auth_token");
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        loginMethod: null 
      });
      window.location.href = '/login';
    },

    refreshUser: async () => {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        // Check BG Affiliate status using the token
        try {
          const bgAffiliateInfo = await checkBgAffiliateStatusWithToken();
          
          if (bgAffiliateInfo) {
            const userData: User = {
              walletId: bgAffiliateInfo.currentWallet?.walletId || 0,
              solanaAddress: bgAffiliateInfo.currentWallet?.solanaAddress || '',
              nickName: bgAffiliateInfo.currentWallet?.nickName || 'User',
              ethAddress: bgAffiliateInfo.currentWallet?.ethAddress || '',
              isBgAffiliate: bgAffiliateInfo.isBgAffiliate || false,
              telegramId: undefined, // Will be set from JWT token if available
              email: undefined, // Will be set from JWT token if available
              level: bgAffiliateInfo.bgAffiliateInfo?.level,
              commissionPercent: bgAffiliateInfo.bgAffiliateInfo?.commissionPercent,
              code: bgAffiliateInfo.currentWallet?.refCode
            };
            
            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (bgError) {
          console.error('BG Affiliate API error:', bgError);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
        get().logout();
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
