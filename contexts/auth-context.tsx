"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import * as TelegramWalletService from '@/services/api/TelegramWalletService'
import { checkBgAffiliateStatusWithToken } from '@/lib/api'

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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async () => {
    try {
      // const decoded = jwtDecode(token) as any
      localStorage.setItem('isAuth', 'true')
      
      // Extract user info from JWT token
      // const userData: User = {
      //   walletId: decoded.walletId || 0,
      //   solanaAddress: decoded.solanaAddress || '',
      //   nickName: decoded.nickName || 'User',
      //   ethAddress: decoded.ethAddress || '',
      //   isBgAffiliate: false, // Will be updated below
      //   telegramId: decoded.telegramId,
      //   email: decoded.email
      // }
      
      // Call BG Affiliate API to get status
      try {
        const bgData = await checkBgAffiliateStatusWithToken();
        console.log("bgData", bgData);
        if (bgData) {
          // userData.isBgAffiliate = bgData.isBgAffiliate || false;
          
          // // Update wallet info from BG Affiliate response if available
          // if (bgData.currentWallet) {
          //   userData.walletId = bgData.currentWallet.walletId || userData.walletId;
          //   userData.solanaAddress = bgData.currentWallet.solanaAddress || userData.solanaAddress;
          //   userData.nickName = bgData.currentWallet.nickName || userData.nickName;
          //   userData.ethAddress = bgData.currentWallet.ethAddress || userData.ethAddress;
          // }
          
          // // Update BG Affiliate info if available
          // if (bgData.bgAffiliateInfo) {
          //   userData.level = bgData.bgAffiliateInfo.level;
          //   userData.commissionPercent = bgData.bgAffiliateInfo.commissionPercent;
          // }
        }
      } catch (bgError) {
        // Error calling BG Affiliate API in login
      }
      
      // setUser(userData)
    } catch (error) {
      console.error('Failed to decode token:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('isAuth')
    sessionStorage.removeItem('isAuth')
    setUser(null)
    window.location.href = '/login'
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('isAuth')
    
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      // Verify token is valid by decoding
      const decoded = jwtDecode(token) as any
      const currentTime = Date.now() / 1000
      
      if (decoded.exp && decoded.exp < currentTime) {
        // Token expired
        logout()
        return
      }

      // Extract user info from JWT token
      const userData: User = {
        walletId: decoded.walletId || 0,
        solanaAddress: decoded.solanaAddress || '',
        nickName: decoded.nickName || 'User',
        ethAddress: decoded.ethAddress || '',
        isBgAffiliate: false, // Will be updated below
        telegramId: decoded.telegramId,
        email: decoded.email
      }

      // Check BG Affiliate status using the token
      try {
        const bgAffiliateInfo = await checkBgAffiliateStatusWithToken()
        
        if (bgAffiliateInfo) {
          userData.isBgAffiliate = bgAffiliateInfo.isBgAffiliate || false
          
          // Update wallet info from BG Affiliate response if available
          if (bgAffiliateInfo.currentWallet) {
            userData.walletId = bgAffiliateInfo.currentWallet.walletId || userData.walletId
            userData.solanaAddress = bgAffiliateInfo.currentWallet.solanaAddress || userData.solanaAddress
            userData.nickName = bgAffiliateInfo.currentWallet.nickName || userData.nickName
            userData.ethAddress = bgAffiliateInfo.currentWallet.ethAddress || userData.ethAddress
          }
          
          // Update BG Affiliate info if available
          if (bgAffiliateInfo.bgAffiliateInfo) {
            userData.level = bgAffiliateInfo.bgAffiliateInfo.level
            userData.commissionPercent = bgAffiliateInfo.bgAffiliateInfo.commissionPercent
          }
        }
      } catch (bgError) {
        // BG Affiliate API not available or user not BG Affiliate
      }
      
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 