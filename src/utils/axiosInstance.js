import axios from 'axios'
import {getHeaders} from "./auth";

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: getHeaders(),
  withCredentials: true,
});

export default axiosInstance;
