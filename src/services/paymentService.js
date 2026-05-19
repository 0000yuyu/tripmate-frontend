/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 6. 결제 서비스 (payment-service)
 */
export const paymentService = {
  // 결제 객체 인스턴스 초기 생성
  createPayment: (paymentData) => axiosInstance.post('payments', paymentData),

  // PG사(Toss) 승인 정보 최종 확정 처리
  confirmPayment: (confirmData) => axiosInstance.post('payments/confirm', confirmData),

  // 결제 단건 조회
  getPayment: (paymentId) => axiosInstance.get(`payments/${paymentId}`),
};
