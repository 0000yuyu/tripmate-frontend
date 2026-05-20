/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import axiosInstance from "@/utils/axiosInstance.js";

import { PostDetailSidebar } from "@components/PostDetailView/PostDetailSidebar.jsx";
import { ItemDetailView } from "@components/PostDetailView/ItemDetailView.jsx";
import { PlanFormView } from "@components/PostDetailView/PlanFormView.jsx";
import { ManageParticipantsView } from "@components/PostDetailView/ManageParticipantsView.jsx";
import { ProductManagementView } from "@components/ProductManagementView.jsx";
import { ItineraryView } from "@components/PostDetailView/ItineraryView.jsx";
import { message } from "antd";
import { useProfile } from "@hooks/userContext.jsx";
import { planService } from "@/services/index.js";

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true); // 👍 처음부터 로딩 상태를 true로 시작합니다.

  // 'all' | 'edit' | 'manage' | 'product_manage' | 'unit_view'
  const [selectedMenuItem, setSelectedMenuItem] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  // 유닛 상세 내부 내비게이션 탭 상태 ('participation' | 'product' | 'record')
  const [unitSubTab, setUnitSubTab] = useState('participation');

  const { user } = useProfile();

  // 🔄 데이터를 새로고침하는 함수
  const refreshData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true); // 🚀 데이터 로드 시작 시 로딩 상태를 켭니다.
      const response = await axiosInstance.get(`/plans/${id}`);
      const freshPost = response.data?.data || response.data;
      setPost(freshPost);

      // 현재 유닛 상세보기를 하고 있다면, 유닛의 최신 데이터도 함께 동기화
      if (selectedItem) {
        const updatedItem = freshPost.planUnits?.find(unit => unit.id === selectedItem.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      }
    } catch (error) {
      console.error("데이터 로드 실패", error);
      message.error("최신 데이터를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, selectedItem]);

  // 첫 로드시 데이터 로킹
  useEffect(() => {
    refreshData();
  }, [id]); // 첫 렌더링 및 ID 변경시에만 작동

  // 💡 로딩 중이거나 데이터가 아직 들어오지 않았을 때 스피너를 보여주어 에러를 방지합니다.
  if (loading || !post) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 size={36} className="animate-spin text-[#007AFF]" />
        </div>
    );
  }

  const onBack = () => navigate('/plans');

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setUnitSubTab('participation'); // 스케치안에 맞춰 기본 탭을 '참여'로 고정
    setSelectedMenuItem('unit_view');
  };

  const handleMenuClick = (item) => {
    if (item === 'all') {
      setSelectedItem(null);
      setSelectedMenuItem('all');
      return;
    }
    if (item === 'edit') {
      setSelectedMenuItem('edit');
      return;
    }
    if (item === 'manage') {
      let hostUserId = null;
      for (const unit of (post.planUnits || [])) {
        const host = unit.participants?.find(p => p.participationRole === 'HOST');
        if (host) {
          hostUserId = host.userId;
          break;
        }
      }
      console.log("user", user?.id, "host", hostUserId)

      if (!hostUserId || hostUserId !== user?.id) {
        message.error("🔒 관리자 페이지는 호스트만 접근할 수 있습니다.");
        return;
      }
      setSelectedMenuItem('manage');
    }
  };

  // 1. 투어 패키지 수정 완료 후
  const handleUpdate = async (payload) => {
    try {
      await axiosInstance.put(`/plans/${id}`, payload);
      message.success("✈️ 투어 패키지 변경사항이 반영되었습니다.");
      refreshData();
      navigate('/plans');
    } catch (e) {
      message.error("수정 요청 중 통신 오류가 발생했습니다.");
    }
  };

  // 2. 코스 참여 신청 완료 후
  const handleJoinUnit = async () => {
    try {
      await planService.applyToUnitPlan(id, selectedItem.id);
      refreshData();
      message.success("코스 참여 신청이 완료되었습니다.");
    } catch (e) {
      message.error("참여 신청 중 오류가 발생했습니다.");
    }
  };

  // 3. 주문 생성 완료 후
  const handleOrder = async () => {
    if (!selectedItem?.product) return;
    try {
      const orderData = {
        orderItems: [{
          planUnitId: selectedItem.id,
          productId: selectedItem.product.productId,
          quantity: 1,
          scheduleId: selectedItem.product.scheduleId
        }]
      };
      const response = await axiosInstance.post("/orders", orderData);
      const orderId = response.data?.data?.orderId;
      const amount = response.data?.data?.orderItems[0]?.price;

      navigate(`/payment?backOrderId=${orderId}&amount=${amount}`);
    } catch (e) {
      message.error("주문 생성 중 통신 에러가 발생했습니다.");
    }
  };

  // 4. 단위 일정 확정 완료 후
  const handleConfirmUnit = async () => {
    if (!selectedItem) return;
    try {
      const response = await axiosInstance.patch(`/plans/${id}/unit-plans/${selectedItem.id}`);
      console.log(response);
      refreshData();
      message.success("일정이 확정되었습니다.");
    } catch (e) {
      console.error(e);
      message.error("일정 확정 처리 중 오류가 발생했습니다.");
    }
  };

  return (
      <div className="w-full mx-auto mt-6 mb-6 font-sans h-[calc(100vh-100px)] flex flex-col gap-4">
        {/* 상단 브레드크럼 배정 */}
        <div className="text-xs md:text-sm font-medium text-[#999999] overflow-hidden px-1 flex items-center gap-2 py-1 text-left select-none shrink-0 w-full">
          <span className="cursor-pointer hover:text-[#333333] shrink-0" onClick={onBack}>일정</span>
          <ChevronRight size={14} className="shrink-0" />
          <span className="cursor-pointer hover:text-[#333333] truncate" onClick={() => handleMenuClick('all')}>{post.title}</span>
          {selectedItem && (
              <>
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-[#333333] font-bold truncate">{selectedItem.title}</span>
              </>
          )}
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-10 items-stretch flex-1 min-h-0">

          {/* 왼쪽 사이드바 */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col overflow-y-auto scrollbar-hide">
            <PostDetailSidebar
                post={post}
                selectedMenuItem={selectedMenuItem}
                setMenuItem={handleMenuClick}
                selectedItem={selectedItem}
                setSelectedItem={handleItemClick}
                onBack={onBack}
            />
          </div>

          {/* 오른쪽 컨텐츠 디스플레이 본문 */}
          <div className="flex-1 min-w-0 w-full h-full">
            <div className="bg-white rounded-[10px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] w-full h-full flex flex-col overflow-hidden">
              <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto min-h-0 text-left scrollbar-hide">
                <AnimatePresence mode="wait">

                  {selectedMenuItem === 'unit_view' ? (
                      <ItemDetailView
                          key="unit_view"
                          item={selectedItem}
                          activeSubTab={unitSubTab}
                          setActiveSubTab={setUnitSubTab}
                          onBack={() => handleMenuClick('all')}
                          onJoinUnit={handleJoinUnit}
                          onViewProduct={() => navigate(`/products/${selectedItem?.product?.productId}`)}
                          onOrderProduct={handleOrder}
                          onConfirmUnit={handleConfirmUnit}
                      />
                  ) : selectedMenuItem === 'edit' ? (
                      <PlanFormView mode="edit" initialData={post} onSave={handleUpdate} />
                  ) : selectedMenuItem === 'manage' ? (
                      <ManageParticipantsView planData={post} />
                  ) : selectedMenuItem === 'product_manage' ? (
                      <ProductManagementView key="product_manage" />
                  ) : (
                      <ItineraryView key="itinerary" plan={post} onUnitClick={handleItemClick} />
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
}