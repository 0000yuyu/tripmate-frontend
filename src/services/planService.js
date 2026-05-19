/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from '@utils/axiosInstance.js';

/**
 * 3. 여행 일정 서비스 (plan-service)
 */
export const planService = {
  // 여행 일정 방 등록
  createPlan: (planData) => axiosInstance.post('plans', planData),

  // 세부 단위 일정 추가
  addUnitPlan: (planId, unitPlanData) => axiosInstance.post(`plans/${planId}/unit-plans`, unitPlanData),

  // 단위 일정 참여 신청
  applyToUnitPlan: (planId, unitPlanId) => axiosInstance.post(`plans/${planId}/unit-plans/${unitPlanId}/participations`),

  // 참여 요청 상태 변경 (수락/거절)
  updateParticipationStatus: (planId, unitPlanId, participationId, status) => 
    axiosInstance.patch(`plans/${planId}/unit-plans/${unitPlanId}/participations/${participationId}/status`, { status }),

  // 단위 일정 최종 확정
  confirmUnitPlan: (planId, unitPlanId) => axiosInstance.patch(`plans/${planId}/unit-plans/${unitPlanId}`),

  // 여행 일정 상세 조회
  getPlanDetails: (planId) => axiosInstance.get(`plans/${planId}`),

  // 일정 목록 조회
  getPlans: () => axiosInstance.get('plans'),

  // 여행 일정 수정
  updatePlan: (planId, planData) => axiosInstance.put(`plans/${planId}`, planData),

  // 여행 일정 삭제
  deletePlan: (planId) => axiosInstance.delete(`plans/${planId}`),
};
