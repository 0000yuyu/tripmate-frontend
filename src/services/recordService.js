/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 7. 피드 기록 서비스 (record-service)
 */
export const recordService = {
  // 동행 기록 여행 피드(Feed) 게시물 작성
  // Use FormData for file uploads
  createFeed: (feedFormData) => axiosInstance.post('feeds', feedFormData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
