"use client"

import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLang } from "@/app/lang"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireBgAffiliate?: boolean
}

export default function ProtectedRoute({ children, requireBgAffiliate = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth()
  const router = useRouter()
  const { t } = useLang()

  // Refresh user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Check if user has required data for BG Affiliate
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && requireBgAffiliate) {
      if (!user.isBgAffiliate) {
        toast.error(t("messages.notBgAffiliate"))
        router.push('/unauthorized')
      }
    }
  }, [isAuthenticated, isLoading, user, requireBgAffiliate, router, t])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>{t("messages.authenticating")}</span>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Check BG Affiliate requirement
  if (requireBgAffiliate && user && !user.isBgAffiliate) {
    return null
  }

  return <>{children}</>
} 