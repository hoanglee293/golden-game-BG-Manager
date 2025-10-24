"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

function GoogleCallbackContent() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      toast.error("Đăng nhập Google thất bại")
      router.push('/login')
      return
    }

    if (code && !isProcessing) {
      setIsProcessing(true)
      handleGoogleCallback(code)
    }
  }, [searchParams, isProcessing, router])

  const handleGoogleCallback = async (code: string) => {
    try {
      // Call your backend API to exchange code for token
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.token) {
          await login(data.token)
          toast.success("Đăng nhập Google thành công!")
          router.push('/')
        } else {
          throw new Error("No token received")
        }
      } else {
        throw new Error("Failed to authenticate")
      }
    } catch (error) {
      console.error('Google callback error:', error)
      toast.error("Đăng nhập Google thất bại - Vui lòng thử lại")
      router.push('/login')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03a7a7b3]/70 to-[#006cdfb3]/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-blue-50/70 to-indigo-100/70 rounded-xl">
        <div className="shadow-xl w-full h-full rounded-xl bg-theme-blue-300 p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center mb-4">
            <img src="/logo.png" alt="logo" className="rounded-lg" />
          </div>
          <h2 className="text-2xl font-bold mb-4 uppercase">BG Affiliate</h2>
          
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm">Đang xử lý đăng nhập Google...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <img
                  src="https://img.icons8.com/color/48/google-logo.png"
                  alt="google"
                  className="h-6 w-6"
                />
                <span className="text-sm">Kết nối Google</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vui lòng chờ trong khi chúng tôi xác thực thông tin của bạn...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-r from-[#03a7a7b3]/70 to-[#006cdfb3]/70 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-blue-50/70 to-indigo-100/70 rounded-xl">
          <div className="shadow-xl w-full h-full rounded-xl bg-theme-blue-300 p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center mb-4">
              <img src="/logo.png" alt="logo" className="rounded-lg" />
            </div>
            <h2 className="text-2xl font-bold mb-4 uppercase">BG Affiliate</h2>
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
} 