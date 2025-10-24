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
        await axios.post(`${apiUrl}/api/v1/bg-ref/refresh-token`, {}, { withCredentials: true })
      } catch (refreshError) {
        console.warn('Không thể refresh token:', refreshError)
      }
      console.warn('Lỗi 401: Unauthorized');
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
        localStorage.removeItem('user')
      }
    }else if(error.code === "ERR_NETWORK"){
      console.warn("Máy chủ đang gặp sự cố !");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;