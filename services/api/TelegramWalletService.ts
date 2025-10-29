import axiosClient from "@/utils/axiosClient";

// Telegram login interface - BG Affiliate System API
export const login = async (item: { id: string; code: string }) => {
    try {
        const response = await axiosClient.post(`/bg-ref/auth/telegram-login`, {
            telegram_id: item.id,
            code: item.code
        }, { withCredentials: true });
        return {
            status: 200,
            data: response.data
        };
    } catch (error: any) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Telegram login failed',
            data: error.response?.data
        };
    }
}