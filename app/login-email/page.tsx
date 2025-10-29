"use client"
import React, { useEffect, useRef, Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useLang } from "@/app/lang"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function LoginEmailContent() {
  const {isAuthenticated, login } = useAuth();
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasCalledLogin = useRef(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { t } = useLang()

  const code = searchParams.get('code')

  const handleReturnHome = () => {
    router.push('/login')
  }

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    } else if (code && !hasCalledLogin.current) {
      hasCalledLogin.current = true;
      handleLogin();
    } else if (!code) {
      toast.error(t("auth.emailMissingInfo"));
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [isAuthenticated, code, router]);

  const handleLogin = async () => {
    setIsProcessing(true);
    try {
      await login({
        google_code: code!
      });
      
      toast.success(t("auth.emailSuccess"));
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error: any) {
      console.error('Email login error:', error);
      
      if (error.response?.data?.message === 'Failed to exchange code for token') {
        toast.error('Không thể trao đổi mã xác thực');
      } else if (error.response?.data?.message === 'Invalid token issuer') {
        toast.error('Token không hợp lệ');
      } else if (error.response?.data?.message === 'Email not verified') {
        toast.error('Email chưa được xác thực');
      } else if (error.response?.data?.message === 'Invalid Google token') {
        toast.error('Token Google không hợp lệ');
      } else {
        toast.error(t("auth.emailConnectionError"));
      }
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03a7a7b3]/70 to-[#006cdfb3]/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-blue-50/70 to-indigo-100/70 rounded-xl">
        <div className="shadow-xl w-full h-full rounded-xl bg-theme-blue-300 p-8 text-center">
          <div className="mx-auto max-w-[200px] h-auto rounded-lg flex items-center justify-center mb-4">
            <img src="/logo.png" alt="logo" className="rounded-lg" />
          </div>
          <h2 className="text-2xl font-bold mb-4 uppercase">BG Affiliate</h2>
          
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-sm">{t("auth.emailProcessing")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <img
                  src="https://img.icons8.com/color/48/google-logo.png"
                  alt="google"
                  className="h-6 w-6"
                />
                <span className="text-sm">{t("auth.emailConnecting")}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("auth.emailVerifying")}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-[425px] p-0 border-none border-transparent">
          <div className="bg-gradient-to-t from-theme-purple-100 to-theme-gradient-linear-end p-[1px] relative w-full rounded-xl">
            <div className="w-full px-3 py-2 bg-theme-black-200 rounded-xl text-neutral-100">
              <DialogHeader className="p-2">
                <DialogTitle className="text-xl font-semibold text-indigo-500 backdrop-blur-sm boxShadow linear-200-bg mb-2 text-fill-transparent bg-clip-text">
                  {t('login.error')}
                </DialogTitle>
                <DialogDescription className="text-neutral-100 text-sm">
                  {t('login.notActive')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-center mt-4">
                <Button 
                  onClick={handleReturnHome}
                  className="w-full sm:w-auto h-[30px] px-4 py-1.5 bg-gradient-to-l from-blue-950 to-purple-600 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-indigo-500 backdrop-blur-sm flex justify-center items-center gap-3"
                >
                  <span className="text-xs sm:text-sm font-medium leading-none dark:text-white">
                    {t('login.returnHome')}
                  </span>
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginEmailContent />
    </Suspense>
  )
}
