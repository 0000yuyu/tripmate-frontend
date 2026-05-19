/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from "@utils/axiosInstance.js";


/**
 * 4. 입점 및 투어 상품 서비스 (company-service)
 */
export const companyService = {
  // 회사(판매 파트너) 등록 신청
  registerCompany: (companyData) => axiosInstance.post('companies', companyData),

  // 가이드 투어 상품 등록
  createProduct: (companyId, productData) => 
    axiosInstance.post('products', productData, { headers: { 'X-Company-Id': companyId } }),

  // 상품 세부 스케줄 일정 생성
  createProductSchedule: (productId, scheduleData) => axiosInstance.post(`products/${productId}/schedules/bulk`, scheduleData),

  // 상품 세부 스케줄 목록 조회
  getProductSchedules: (productId) => axiosInstance.get(`products/${productId}/schedules`),

  // 상품 상세 조회
  getProductDetails: (productId) => axiosInstance.get(`products/${productId}`),

  // 스케줄 상세 조회
  getScheduleDetails: (productId, scheduleId) => axiosInstance.get(`products/${productId}/schedules/${scheduleId}`),

  // 이용 가능 상품 조회
  getProducts: (date) => axiosInstance.get('products'),
};
