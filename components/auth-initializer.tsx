"use client"

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/app/lang'

interface AuthInitializerProps {
  children: React.ReactNode
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { refreshUser, isLoading } = useAuth()
  const { t } = useLang()

  useEffect(() => {
    // Initialize auth state when app starts
    refreshUser()
  }, [refreshUser])

  // Show loading while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>{t('auth.initializing')}</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 