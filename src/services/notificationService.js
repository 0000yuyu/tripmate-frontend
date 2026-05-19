/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 8. 알림 인프라 서비스 (notification-service)
 */
export const notificationService = {
  // FCM 디바이스 토큰 등록 및 갱신
  registerToken: (tokenData) => axiosInstance.post('notifications/tokens', tokenData),

  // 유저 개인 수신 알림 히스토리 이력 조회
  getHistories: (page = 0, size = 20) => 
    axiosInstance.get('notifications/histories', { params: { page, size } }),
};
