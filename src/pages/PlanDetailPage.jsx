/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import {ArrowLeft, ChevronRight, Loader2} from 'lucide-react';
import axiosInstance from "@/utils/axiosInstance.js";

// 하위 서브 뷰 컴포넌트 스펙 유지
import { PostDetailSidebar } from "@components/PostDetailView/PostDetailSidebar.jsx";
import { ItemDetailView } from "@components/PostDetailView/ItemDetailView.jsx";
import { ParticipationView } from "@components/PostDetailView/ParticipationView.jsx";
import {
  PlanFormView
} from "@components/PostDetailView/PlanFormView.jsx";
import { ManageParticipantsView } from "@components/PostDetailView/ManageParticipantsView.jsx";
import { JournalView } from "@components/JournalView.jsx";
import { ProductManagementView } from "@components/ProductManagementView.jsx";
import { ItineraryView } from "@components/PostDetailView/ItineraryView.jsx";
import {message} from "antd";
import {useProfile} from "@hooks/userContext.jsx";

export default function PlanDetailPage(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState( null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const {user} = useProfile();
  useEffect(() => {
    if (id) {
      const loadPost = async () => {
        try {
          const response = await axiosInstance.get(`/plans/${id}`);
          setPost(response.data?.data || response.data);
        } catch (error) {
        }
      };
      loadPost();
    }
  }, [id]);

  if (!post) {
    return (
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 size={36} className="animate-spin text-[#007AFF]" />
        </div>
    );
  }

  const onBack = () => navigate('/plans');

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedMenuItem('unit_detail');
  };

  const handleMenuClick = (item) => {
    if (item === 'all') return;
    if (item === 'edit') {
      message.info("일정 수정하기 페이지는 준비 중입니다.");
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

      if (!hostUserId || hostUserId !== user.id) {
        message.error("🔒 관리자 페이지는 호스트만 접근할 수 있습니다.");
        return;
      }
      if (!isHost) {
        message.error("관리자 페이지는 호스트만 접근할 수 있습니다.");
        return;
      }
    }
    setSelectedMenuItem(item);
  };

  const handleUpdate = async (payload) => {
    try {
      const response = await axiosInstance.put(`/plans/${id}`, payload);
      console.log(response);
      message.success("✈️ 투어 패키지 변경사항이 반영되었습니다.");
      navigate('/plans');
    } catch (e) {
      message.error("수정 요청 중 통신 오류가 발생했습니다.");
      throw e;
    }
  };

  // 내비게이션 상단 경로 문자열 맵
  const menuTitleMap = {
    unit_detail: `일정 > ${post.title} > ${selectedItem?.title || ''}`,
    participation: `일정 > ${post.title} > 참여`,
    edit: `일정 > ${post.title} > 수정`,
    manage: `일정 > ${post.title} > 관리`,
    record: `일정 > ${post.title} > 기록`,
    all: `일정 > ${post.title}`
  };

  const handleOrder = async () => {
    const planUnitId = selectedItem.id;
    const productId = selectedItem.product.productId;
    const quantity = 1;
    const scheduleId = selectedItem.product.scheduleId;
    const orderData = {
      orderItems : [{
        planUnitId,
        productId,
        quantity,
        scheduleId
      }]
    }
    const response = await axiosInstance.post("/orders", orderData);

    console.log(response)
    const orderId = response.data.data.orderId;
    const amount = response.data.data.orderItems[0].price;
    console.log(orderId,amount);
    navigate(`/payment?backOrderId=${orderId}&amount=${amount}`);
  }
  return (
      // 💡 [변경]: 스크롤 싱크를 위해 브라우저 뷰포트 높이 기준(h-[calc(100vh-100px)]) 뼈대 구조 정의
      <div className="w-full mx-auto mt-6 mb-6 font-sans h-[calc(100vh-100px)] flex flex-col gap-4">
        <div className="text-xs md:text-sm font-medium text-[#999999] mb-2 md:mb-4 overflow-hidden px-1 flex items-center gap-2 py-1 px-1 text-left select-none shrink-0 w-full">
          <span className="cursor-pointer hover:text-[#333333] shrink-0" onClick={onBack}>일정</span>
          <ChevronRight size={14} className="shrink-0" />
          <span className="cursor-pointer hover:text-[#333333] truncate" onClick={() => setSelectedItem(null)}>{post.title}</span>
        </div>
        {/* 2. 메인 스플릿 바디 (사이드바와 본문 높이를 수평 일치시키는 items-stretch 지정) */}
        <div className="w-full flex flex-col lg:flex-row gap-10 items-stretch flex-1 min-h-0">

          {/* 왼쪽 분할 세그먼트: 프로필 요약 카드 & 사이드바 메뉴 */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col overflow-y-auto scrollbar-hide">
            <PostDetailSidebar
                post={post}
                selectedMenuItem={selectedMenuItem}
                setMenuItem={handleMenuClick}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onBack={onBack}
            />
          </div>

          <div className="flex-1 min-w-0 w-full h-full">
            <div className="bg-white rounded-[10px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] w-full h-full flex flex-col overflow-hidden">

              <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto min-h-0 text-left scrollbar-hide">
                <AnimatePresence mode="wait">
                  {selectedMenuItem === 'unit_detail' ? (
                      <ItemDetailView
                          key="unit"
                          item={selectedItem}
                          onBack={() => handleMenuClick('all')}
                          onViewRecord={() => handleMenuClick('record')}
                          onViewProduct={() => navigate(`/products/${selectedItem?.product?.productId}`)}
                          onOrderProduct={()=>handleOrder()}
                      />
                  ) : selectedMenuItem === 'participation' ? (
                      <ParticipationView key="participation" selectedUnit={selectedItem} />
                  ) : selectedMenuItem === 'edit' ? (
                      <PlanFormView mode="edit" initialData={post}
                                    onSave={handleUpdate} />
                  ) : selectedMenuItem === 'manage' ? (
                      <ManageParticipantsView planData={post} />
                  ) : selectedMenuItem === 'record' ? (
                      <JournalView key="record" selectedUnit={selectedItem} onViewPlan={() => handleMenuClick('all')} hideHeader={true} />
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