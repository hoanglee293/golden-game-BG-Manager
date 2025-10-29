import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const axiosClient = axios.create({
  baseURL: `${apiUrl}/api/v1`,
    withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Try to refresh token using BG Affiliate System API endpoint
        await axiosClient.post('/bg-ref/auth/refresh-token', {}, { withCredentials: true });
        // Retry the original request
        return axiosClient.request(error.config);
      } catch (refreshError) {
        console.warn('Không thể refresh token:', refreshError);
        // Redirect to login if refresh fails
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
      }
    } else if (error.code === "ERR_NETWORK") {
      console.warn("Máy chủ đang gặp sự cố !");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;