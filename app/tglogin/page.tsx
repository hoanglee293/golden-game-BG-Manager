"use client"
import { useAuth } from '@/hooks/useAuth';
import { TelegramWalletService } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, Suspense, useState, useRef } from 'react'
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLang } from '@/app/lang';

function TelegramLoginContent() {
    const { isAuthenticated, login } = useAuth();
    const { t } = useLang();
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasCalledLogin = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const telegramId = searchParams.get("id");
    const code = searchParams.get("code");

    console.log("isAuthenticated", isAuthenticated);
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        } else if (telegramId && code && !hasCalledLogin.current) {
            hasCalledLogin.current = true;
            handleLogin();
        } else if (!telegramId || !code) {
            toast.error(t("auth.telegramMissingInfo"));
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    }, [isAuthenticated, telegramId, code, router]);

    const handleLogin = async () => {
        setIsProcessing(true);
        try {
            await login({
                telegram_id: telegramId!,
                code: code!
            });
            
            toast.success(t("auth.telegramSuccess"));
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } catch (error: any) {
            console.error('Telegram login error:', error);
            
            if (error.response?.data?.message === 'Invalid or expired verification code') {
                toast.error('Mã xác thực không hợp lệ hoặc đã hết hạn');
            } else if (error.response?.data?.message === 'Verification code has expired') {
                toast.error('Mã xác thực đã hết hạn');
            } else if (error.response?.data?.message === 'User not found') {
                toast.error('Không tìm thấy người dùng');
            } else {
                toast.error(t("auth.telegramConnectionError"));
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
                    <div className="mx-auto h-16 w-16 rounded-lg flex items-center justify-center mb-4">
                        <img src="/logo.png" alt="logo" className="rounded-lg" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 uppercase">BG Affiliate</h2>
                    
                    {isProcessing ? (
                        <div className="space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="text-sm">{t("auth.telegramProcessing")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                                <img
                                    src="https://img.icons8.com/color/48/telegram-app.png"
                                    alt="telegram"
                                    className="h-6 w-6"
                                />
                                <span className="text-sm">{t("auth.telegramConnecting")}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t("auth.telegramVerifying")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function TelegramLogin() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <TelegramLoginContent />
        </Suspense>
    )
}
