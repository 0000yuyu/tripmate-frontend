/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 1. 회원 및 인증 서비스 (user-service)
 */
export const userService = {
  // 회원가입
  signup: (userData) => axiosInstance.post('users/signup', userData),

  // 로그인
  login: async (credentials) => await axiosInstance.post('auth/login',
      credentials),

  // 토큰 재발급
  refresh: (refreshToken) => axiosInstance.post('auth/refresh', { refreshToken }),

  // 내 정보 조회
  getMe: () => axiosInstance.get('users/me'),

  // 로그아웃
  logout: () => axiosInstance.delete('auth/logout'),

  // 회원 탈퇴
  withdraw: () => axiosInstance.delete('users/me'),

  // FCM 토큰 발급
  registerFcmTokenMe: (token) => axiosInstance.post('notifications/tokens/me', { token, deviceType: 'WEB' }),
};
