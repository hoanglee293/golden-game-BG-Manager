import axiosClient from "@/utils/axiosClient";

export const login = async (item: any) => {
    try {
        const response = await axiosClient.post(`/bg-ref/connect-telegram`, item);
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