import axiosClient from "@/utils/axiosClient";

// Manual login interface - BG Affiliate System API
export const manualLogin = async (data: { username: string; password: string }) => {
    try {
        const response = await axiosClient.post(`/bg-ref/auth/login`, data, { withCredentials: true });
        return {
            status: 200,
            data: response.data
        };
    } catch (error: any) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Login failed',
            data: error.response?.data
        };
    }
}

// Google OAuth login interface - BG Affiliate System API
export const googleLogin = async (code: string) => {
    try {
        const response = await axiosClient.post(`/bg-ref/auth/google-login`, { code }, { withCredentials: true });
        return {
            status: 200,
            data: response.data
        };
    } catch (error: any) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Google login failed',
            data: error.response?.data
        };
    }
}