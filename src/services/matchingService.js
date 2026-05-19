/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 2. 매칭 서비스 (matching-service)
 */
export const matchingService = {
  // 매칭 생성 (방 개설)
  createMatching: (matchingData) => axiosInstance.post('matching', matchingData),

  // 매칭 최종 수락 및 승인
  approveMatching: (matchingId) => axiosInstance.patch(`matching/${matchingId}/approval`),

  // 내 매칭 환경 설정 조회
  getSettings: () => axiosInstance.get('user-settings'),

  // 매칭 환경 설정 수정
  updateSettings: (settingsData) => axiosInstance.put('user-settings', settingsData),

  // 매칭 가능 상태 변경 (활성화)
  activateMatching: () => axiosInstance.patch('matching/activation'),

  // 매칭 가능 상태 변경 (비활성화)
  deactivateMatching: () => axiosInstance.patch('matching/deactivation'),

  // 매칭 시작하기 (SSE 구독 URL)
  getMatchingSubUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `matching/sub${query ? `?${query}` : ''}`;
  },

  // SSE 구독 URL들 (Legacy / Specific)
  getMateSubUrl: (lat, lng) => `matching/mate/sub?latitude=${lat}&longitude=${lng}`,
  getHostSubUrl: () => `matching/host/sub`,
};
