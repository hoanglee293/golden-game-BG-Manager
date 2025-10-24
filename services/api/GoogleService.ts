import axiosClient from "@/utils/axiosClient";

// Manual registration interface
interface ManualRegisterData {
    name: string;
    nick_name: string;
    country: string;
    bittworld_uid: string;
    refCode?: string;
    password: string;
    email: string;
    verificationCode: string;
}

// Manual login interface
interface ManualLoginData {
    email: string;
    password: string;
}

// Send verification code interface
interface SendVerificationCodeData {
    email: string;
}

// Forgot password interface
interface ForgotPasswordData {
    email: string;
}

// Change password interface
interface ChangePasswordData {
    email: string;
    code: string;
    newPassword: string;
}

export const login = async (code: string) => {
    try {
        const response = await axiosClient.post(`/bg-ref/login-email`, { code });
        return {
            status: 200,
            token: response.data.token,
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

// Send verification code API
export const sendVerificationCode = async (data: SendVerificationCodeData) => {
    try {
        const response = await axiosClient.post(`/login-email/send-verification-code`, data);
        return response.data;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

// Manual registration API
export const manualRegister = async (data: ManualRegisterData) => {
    try {
        const response = await axiosClient.post(`/login-email/manual-register`, data);
        return response.data;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

// Manual login API
export const manualLogin = async (data: ManualLoginData) => {
    try {
        const response = await axiosClient.post(`/bg-ref/manual-login`, data);
        return response.data;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

// Send forgot password code API
export const sendForgotPasswordCode = async (data: ForgotPasswordData) => {
    try {
        const response = await axiosClient.post(`/login-email/forgot-password`, data);
        return response.data;
    } catch (e) {
        console.log(e)
        throw e;
    }
}

// Change password API
export const changePassword = async (data: ChangePasswordData) => {
    try {
        const response = await axiosClient.post(`/login-email/change-password`, data);
        return response.data;
    } catch (e) {
        console.log(e)
        throw e;
    }
}