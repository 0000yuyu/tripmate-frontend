/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 5. 주문 서비스 (order-service)
 */
export const orderService = {
  // 패키지 상품 주문 생성
  createOrder: (orderData) => axiosInstance.post('orders', orderData),

  // 주문 상세 내역 단건 조회
  getOrder: (orderId) => axiosInstance.get(`orders/${orderId}`),
};
