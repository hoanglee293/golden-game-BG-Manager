'use client'

import React, { useState, useEffect } from 'react';
import { manualLogin } from '@/services/api/GoogleService';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from "@/app/lang"
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/ui/checkbox';

const Connect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Resend cooldown state
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    nick_name: '',
    country: 'kr',
    bittworld_uid: '',
    refCode: '',
    password: '',
    email: '',
    verificationCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await manualLogin({ username: loginData.username, password: loginData.password });
      console.log("response", response);

      // Check if login was successful (status 200)
      if (response.status === 200 && (response.data?.user)) {
        // Extract token from response
        login({ username: loginData.username, password: loginData.password });
        toast.success(t('connectPage.messages.loginSuccess', { name: response.data?.user?.nickName || t('connectPage.login.title') }));
        const timeout = setTimeout(() => {
          router.push('/');
        }, 1000);
        return () => clearTimeout(timeout);
      } else {
        // Handle error responses from manualLogin
        console.log("Error response:", response);

        // Check specific error messages
        if (response.message === 'Invalid password') {
          toast.error(t('connectPage.messages.invalidPassword'));
        } else if (response.data?.message === 'User is not part of BG affiliate program') {
          router.push('/unauthorized');
        } else {
          toast.error(response.message || response.data?.message || t('connectPage.messages.loginError'));
        }
      }
    } catch (error: any) {
      console.log("error", error);
      if (error.response?.data?.message === 'Invalid password') {
        toast.error(t('connectPage.messages.invalidPassword'));
      } else if (error.response?.data?.message === 'User is not part of BG affiliate program') {
        router.push('/unauthorized');
      } else {
        toast.error(error.response?.data?.message || t('connectPage.messages.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline`
    console.log("handleGoogleSignIn")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4eab099] to-[#FDDA15]/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto max-w-[200px] h-auto rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="logo" className="rounded-lg" />
          </div>
          <CardDescription className="text-black text-sm">
            {t("auth.connectWalletToAccess")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);

          }} className="w-full max-h-[570px] overflow-y-auto p-6 pt-0">


            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('connectPage.login.username')}</Label>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder={t('connectPage.login.usernamePlaceholder')}
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="text-xs font-normal"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('connectPage.login.password')}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t('connectPage.login.passwordPlaceholder')}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="text-xs font-normal"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1FC16B]/80 hover:bg-[#1FC16B]" >
                  {isLoading ? t('connectPage.login.loggingIn') : t('connectPage.login.loginButton')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className='w-full px-4 pb-5 flex justify-center items-center'>
            <div className='w-full flex flex-col gap-4'>
              <button
                onClick={handleGoogleSignIn}
                className={`text-center text-gray-900 min-w-48 text-sm font-normal leading-tight flex  flex-col items-center w-full gap-2 justify-center rounded-md bg-theme-primary-500 dark:text-white`}
              >
                <div className="w-8 h-8 overflow-hidden cursor-pointer rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" onClick={handleGoogleSignIn}>
                  <img
                    src="https://img.icons8.com/color/48/google-logo.png"
                    alt="google"
                    className="w-6 h-6 object-cover"
                  />
                </div>
                Google
              </button>
            </div>
            <div className='text-base text-center mx-auto dark:text-white text-black mb-3'>{t('or')}</div>
            <div>
              <button
                className={`text-center text-gray-900 min-w-48 text-sm font-normal leading-tight flex flex-col items-center w-full gap-2 justify-center rounded-md bg-theme-primary-500 dark:text-white`}
              >
                <div className="w-8 h-8 overflow-hidden cursor-pointer rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" onClick={() =>
                  window.open(
                    `${
                      process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL
                    }`,
                    "_blank"
                  )
                }>
                  <img
                    src="/telegram.png"
                    alt="telegram"
                    className="w-5 h-5 object-cover"
                  />
                </div>
                Telegram
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connect;