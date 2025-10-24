'use client'

import React, { useState, useEffect } from 'react';
import { manualRegister, manualLogin, sendVerificationCode, sendForgotPasswordCode, changePassword } from '@/services/api/GoogleService';
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
  const [registrationStep, setRegistrationStep] = useState<'email' | 'form'>('email');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const { login } = useAuth();
  const router = useRouter();
  const [isForgot, setIsForgot] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { t } = useLang();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Email verification state
  const [emailForVerification, setEmailForVerification] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordCode, setForgotPasswordCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const handleCheckboxClick = () => {
    setShowTermsModal(true);
  };


  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendVerificationCode({ email: emailForVerification });
      toast.success(t('connectPage.messages.verificationCodeSent'));
      setRegistrationStep('form');
      setRegisterData({ ...registerData, email: emailForVerification });
    } catch (error: any) {
      if (error.response?.data?.message === 'Email already exists. Please use a different email or try to login') {
        toast.error(t('connectPage.messages.emailAlreadyExists'));
      } else {
        toast.error(t('connectPage.messages.verificationCodeError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      await sendVerificationCode({ email: emailForVerification });
      toast.success(t('connectPage.messages.verificationCodeResent'));
    } catch (error: any) {
      if (error.response?.data?.message === 'Email already exists. Please use a different email or try to login') {
        toast.error(t('connectPage.messages.emailAlreadyExists'));
      } else {
        toast.error(t('connectPage.messages.verificationCodeError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await manualLogin(loginData);
      console.log("response", response);
      
      // Check if response has the expected structure
      if (response && (response.walletInfo || response.token || response.data?.token)) {
        // Extract token from response
        const token = response.token || response.data?.token;
        
        if (token) {
          login(token);
          toast.success(t('connectPage.messages.loginSuccess', { name: response.walletInfo?.nickName || t('connectPage.login.title') }));
          const timeout = setTimeout(() => {
            router.push('/');
          }, 1000);
          return () => clearTimeout(timeout);
        } else {
          // If no token but response exists, still consider it successful
          login();
          toast.success(t('connectPage.messages.loginSuccess', { name: response.walletInfo.nickName || t('connectPage.login.title') }));
          const timeout = setTimeout(() => {
            router.push('/');
          }, 1000);
          return () => clearTimeout(timeout);
        }
      } else {
        // Response exists but doesn't have expected structure
        console.log("Unexpected response structure:", response);
        toast.error(t('connectPage.messages.loginError'));
      }
    } catch (error: any) {
      console.log("error", error);
      if (error.response?.data?.message === 'Invalid password') {
        toast.error(t('connectPage.messages.invalidPassword'));
      } else if (error.response?.data?.message === 'Login failed: Wallet does not belong to BG affiliate system') {
        toast.error(t('connectPage.messages.invalidWallet'));
      } else {
        toast.error(error.response?.data?.message || t('connectPage.messages.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await manualRegister({
        ...registerData,
        name: registerData.nick_name.trim(),
        country: 'kr',
        verificationCode: verificationCode
      });

      toast.success(t('connectPage.messages.registerSuccess'));

      // Switch to login tab after successful registration
      setActiveTab('login');
      setLoginData({
        email: registerData.email,
        password: registerData.password
      });

      // Reset registration state
      setRegistrationStep('email');
      setEmailForVerification('');
      setVerificationCode('');
      setRegisterData({
        name: '',
        nick_name: '',
        country: 'kr',
        bittworld_uid: '',
        refCode: '',
        password: '',
        email: '',
        verificationCode: ''
      });
      router.push('/');
    } catch (error: any) {
      if (error.response?.data?.message === 'Invalid or expired verification code') {
        toast.error(t('connectPage.messages.invalidVerificationCode'));
      } else {
        toast.error(error.response?.data?.message || t('connectPage.messages.registerError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setRegistrationStep('email');
    setVerificationCode('');
  };

  // Forgot password handlers
  const handleSendForgotPasswordCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendForgotPasswordCode({ email: forgotPasswordEmail });
      toast.success(t('connectPage.messages.verificationCodeSent'));
      setForgotPasswordStep('code');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('connectPage.messages.verificationCodeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendForgotPasswordCode = async () => {
    setIsLoading(true);

    try {
      await sendForgotPasswordCode({ email: forgotPasswordEmail });
      toast.success(t('connectPage.messages.verificationCodeResent'));
      // Start 30-second cooldown
      setResendCooldown(30);
    } catch (error: any) {
      if (error.response?.data?.message === 'Invalid verification code') {
        toast.error(t('connectPage.messages.invalidVerificationCode'));
      } else {
        toast.error(t('connectPage.messages.verificationCodeError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await changePassword({
        email: forgotPasswordEmail,
        code: forgotPasswordCode,
        newPassword: newPassword
      });

      toast.success(t('connectPage.messages.passwordChangeSuccess'));

      // Reset forgot password state and switch to login
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setForgotPasswordCode('');
      setNewPassword('');
      setActiveTab('login');
      setIsForgot(false);
    } catch (error: any) {
      if (error.response?.data?.message === 'Invalid verification code') {
        toast.error(t('connectPage.messages.invalidVerificationCode'));
      } else {
        toast.error(t('connectPage.messages.passwordChangeError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForgotPasswordEmail = () => {
    setForgotPasswordStep('email');
    setForgotPasswordCode('');
  };

  const handleGoogleSignIn = async () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile&access_type=offline`
    console.log("handleGoogleSignIn")
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#03a7a7b3]/70 to-[#079325b3]/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto max-w-[200px] h-auto rounded-lg flex items-center justify-center">
            <img src="/bitworld-logo-light.png" alt="logo" className="rounded-lg" />
          </div>
          <CardTitle className="text-2xl pt-4 uppercase">BG Affiliate</CardTitle>
          <CardDescription className="text-black text-sm">
            {t("auth.connectWalletToAccess")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            if (value === 'register') {
              setRegistrationStep('email');
              setEmailForVerification('');
              setVerificationCode('');
            }
            if (value === 'forgotPassword') {
              setForgotPasswordStep('email');
              setForgotPasswordEmail('');
              setForgotPasswordCode('');
              setNewPassword('');
            }
          }} className="w-full max-h-[570px] overflow-y-auto p-6 pt-0">
            

            {/* Login Tab */}
            {!isForgot && <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('connectPage.login.email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('connectPage.login.emailPlaceholder')}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1FC16B]/80 hover:bg-[#1FC16B]" >
                  {isLoading ? t('connectPage.login.loggingIn') : t('connectPage.login.loginButton')}
                </Button>
              </form>
            </TabsContent>}

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              {registrationStep === 'email' ? (
                // Email verification step
                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-email">{t('connectPage.register.email')}</Label>
                    <Input
                      id="verification-email"
                      type="email"
                      placeholder={t('connectPage.register.emailPlaceholder')}
                      value={emailForVerification}
                      onChange={(e) => setEmailForVerification(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-theme-primary-500/80 hover:bg-theme-primary-500" disabled={isLoading}>
                    {isLoading ? t('connectPage.register.sendingCode') : t('connectPage.register.sendCode')}
                  </Button>
                </form>
              ) : (
                // Full registration form
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-white">
                      {t('connectPage.register.emailDisplay', { email: emailForVerification })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBackToEmail}
                      className="text-xs"
                    >
                      {t('connectPage.register.changeEmail')}
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="verification-code">{t('connectPage.register.verificationCode')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder={t('connectPage.register.verificationCodePlaceholder')}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="whitespace-nowrap"
                      >
                        {t('connectPage.register.resendCode')}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="register-nickname">{t('connectPage.register.nickname')}</Label>
                    <Input
                      id="register-nickname"
                      type="text"
                      placeholder={t('connectPage.register.nicknamePlaceholder')}
                      value={registerData.nick_name}
                      onChange={(e) => setRegisterData({ ...registerData, nick_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-uid">{t('connectPage.register.bitworldUid')}</Label>
                    <Input
                      id="register-uid"
                      type="text"
                      minLength={6}
                      placeholder={t('connectPage.register.bitworldUidPlaceholder')}
                      value={registerData.bittworld_uid}
                      onChange={(e) => setRegisterData({ ...registerData, bittworld_uid: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-password">{t('connectPage.register.password')}</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder={t('connectPage.register.passwordPlaceholder')}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-refcode">{t('connectPage.register.referralCode')}</Label>
                    <Input
                      id="register-refcode"
                      type="text"
                      placeholder={t('connectPage.register.referralCodePlaceholder')}
                      value={registerData.refCode}
                      onChange={(e) => setRegisterData({ ...registerData, refCode: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-theme-primary-500/80 hover:bg-theme-primary-500" disabled={isLoading}>
                    {isLoading ? t('connectPage.register.registering') : t('connectPage.register.registerButton')}
                  </Button>
                </form>
              )}
            </TabsContent>

            {/* Forgot Password Tab */}
            {isForgot && <TabsContent value="login" className="space-y-2">
              <div className='flex items-center justify-between mt-3 mb-1'>
                <div className='text-theme-primary-500 text-lg font-bold'>
                  {t('connectPage.forgotPassword.title')}
                </div>
                <div className='dark:text-white text-black text-sm cursor-pointer hover:text-blue-600' onClick={() => setIsForgot(false)}>{t('connectPage.login.backToLogin')}</div>
              </div>
              {forgotPasswordStep === 'email' && (
                <form onSubmit={handleSendForgotPasswordCode} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-password-email">{t('connectPage.forgotPassword.email')}</Label>
                    <Input
                      id="forgot-password-email"
                      type="email"
                      placeholder={t('connectPage.forgotPassword.emailPlaceholder')}
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#1FC16B]/80 hover:bg-[#1FC16B]" disabled={isLoading}>
                    {isLoading ? t('connectPage.forgotPassword.sendingCode') : t('connectPage.forgotPassword.sendCode')}
                  </Button>
                </form>
              )}

              {forgotPasswordStep === 'code' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 dark:text-white">
                      {t('connectPage.register.emailDisplay', { email: forgotPasswordEmail })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBackToForgotPasswordEmail}
                      className="text-xs"
                    >
                      {t('connectPage.register.changeEmail')}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-password-code">{t('connectPage.forgotPassword.verificationCode')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="forgot-password-code"
                        type="text"
                        placeholder={t('connectPage.forgotPassword.verificationCodePlaceholder')}
                        value={forgotPasswordCode}
                        onChange={(e) => setForgotPasswordCode(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendForgotPasswordCode}
                        disabled={isLoading || resendCooldown > 0}
                        className="whitespace-nowrap"
                      >
                        {resendCooldown > 0 ? t('connectPage.register.resendCodeWithTimer', { seconds: resendCooldown }) : t('connectPage.register.resendCode')}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('connectPage.forgotPassword.newPassword')}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder={t('connectPage.forgotPassword.newPasswordPlaceholder')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-[#1FC16B]/80 hover:bg-[#1FC16B]">
                    {isLoading ? t('connectPage.forgotPassword.changingPassword') : t('connectPage.forgotPassword.changePassword')}
                  </Button>
                </form>
              )}
            </TabsContent>}
          </Tabs>
          {/* <div className='w-full px-4 pb-5 flex flex-col gap-4'>
                        <div className='text-xs text-center mx-auto dark:text-white text-black'>{t('or')}</div>
                        <button
                            onClick={handleGoogleSignIn}
                            className={`text-center text-gray-900 h-10 min-w-48 text-sm font-normal leading-tight flex items-center w-full gap-2 justify-center rounded-md bg-theme-primary-500 dark:text-white`}
                        >
                            {t('modalSignin.loginWithGoogle')} <div className="w-8 h-8 overflow-hidden cursor-pointer rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" onClick={handleGoogleSignIn}>
                                <img
                                    src="https://img.icons8.com/color/48/google-logo.png"
                                    alt="google"
                                    className="w-6 h-6 object-cover"
                                />
                            </div>
                        </button>
                    </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Connect;