import axios from 'axios'
import { clearTokens, getHeaders, setTokens } from "./auth";
import { getRefreshToken } from "@/utils/auth.js";

// 1. 인스턴스 생성 시점에는 동적 헤더를 넣지 않습니다.
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
      // 기존 getHeaders()를 활용하거나, 직접 localStorage에서 꺼내어 주입합니다.
      const headers = getHeaders();

      // 기존 헤더와 합성 (Authorization 토큰 등이 동적으로 반영됨)
      config.headers = {
        ...config.headers,
        ...headers,
      };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (기존 코드 유지 및 주소 보완)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = getRefreshToken();

        if (refreshToken) {
          try {
            // 💡 만약 토큰 재발급 API 경로가 /api/auth/refresh 라면 앞의 baseURL을 확인하세요.
            // 여기서는 인스턴스가 아닌 기본 axios를 쓰므로 전체 경로를 다 적어주는 것이 안전합니다.
            const response = await axios.post('/api/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            setTokens(accessToken, newRefreshToken);

            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          clearTokens();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'; // 주석을 풀어서 로그아웃 처리 시 이동되도록 하는 것이 좋습니다.
          }
        }
      }

      return Promise.reject(error);
    }
);

export default axiosInstance;