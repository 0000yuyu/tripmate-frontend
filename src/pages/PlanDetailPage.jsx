/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Loader2 } from 'lucide-react';
import axiosInstance from "@/utils/axiosInstance";
import { message } from "antd";
import { useProfile } from "@hooks/userContext.jsx";
import { planService } from "@/services/index.js";

// 컴포넌트 임포트
import { PostDetailSidebar } from "@components/PostDetailView/PostDetailSidebar.jsx";
import { ItemDetailView } from "@components/PostDetailView/ItemDetailView.jsx";
import { PlanFormView } from "@components/PostDetailView/PlanFormView.jsx";
import { ManageParticipantsView } from "@components/PostDetailView/ManageParticipantsView.jsx";
import { ItineraryView } from "@components/PostDetailView/ItineraryView.jsx";

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useProfile();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [unitSubTab, setUnitSubTab] = useState('participation');

  const refreshData = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/plans/${id}`);
      const freshPost = response.data?.data || response.data;
      setPost(freshPost);

      if (selectedItem) {
        const updatedItem = freshPost.planUnits?.find(unit => unit.id === selectedItem.id);
        if (updatedItem) setSelectedItem(updatedItem);
      }
    } catch (error) {
      message.error("데이터 동기화 실패");
    } finally {
      setLoading(false);
    }
  }, [id, selectedItem]);

  useEffect(() => {
    refreshData();
  }, [id]);

  if (loading && !post) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 size={36} className="animate-spin text-[#007AFF]" />
        </div>
    );
  }

  const handleMenuClick = (menu) => {
    if (menu === 'all') { setSelectedItem(null); setSelectedMenuItem('all'); }
    else if (menu === 'edit') setSelectedMenuItem('edit');
    else if (menu === 'manage') {
      const isHost = post.planUnits?.some(unit =>
          unit.participants?.some(p => p.participationRole === 'HOST' && p.userId === user?.id)
      );
      if (!isHost) { message.error("🔒 호스트만 접근 가능합니다."); return; }
      setSelectedMenuItem('manage');
    }
  };

  return (
      <div className="max-w-[1200px] w-full h-screen flex flex-col mx-auto md:p-10 overflow-hidden">

        {/* 1. 상단 브레드크럼 (PlanListPage와 동일한 규격) */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-6 shrink-0">
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigate('/plans')}>함께 떠나는 일정</span>
          <ChevronRight size={12} />
          <span className="text-[#333333] font-semibold">{post?.title}</span>
        </div>

        {/* 2. 메인 컨텐츠 영역 (좌측 사이드바 + 우측 디테일 뷰) */}
        <div className="flex-1 flex gap-8 min-h-0">

          {/* 사이드바 영역 */}
          <div className="w-[280px] shrink-0 hidden lg:block h-full">
            <PostDetailSidebar
                post={post}
                selectedMenuItem={selectedMenuItem}
                setMenuItem={handleMenuClick}
                onBack={() => navigate('/plans')}
            />
          </div>

          {/* 메인 상세 뷰 (일정 피드 뷰와 동일한 화이트 카드 디자인) */}
          <div className="flex-1 h-full bg-white border border-gray-100 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide">
              <AnimatePresence mode="wait">
                {selectedMenuItem === 'unit_view' ? (
                    <ItemDetailView
                        key="unit_view"
                        item={selectedItem}
                        activeSubTab={unitSubTab}
                        setActiveSubTab={setUnitSubTab}
                        onBack={() => setSelectedMenuItem('all')}
                        onJoinUnit={() => planService.applyToUnitPlan(id, selectedItem.id).then(refreshData)}
                        onConfirmUnit={() => axiosInstance.patch(`/plans/${id}/unit-plans/${selectedItem.id}`).then(refreshData)}
                        onViewProduct={() => navigate(`/products/${selectedItem?.product?.productId}`)}
                        onOrderProduct={() => {}}
                    />
                ) : selectedMenuItem === 'edit' ? (
                    <PlanFormView mode="edit" initialData={post} onSave={(p) => axiosInstance.put(`/plans/${id}`, p).then(refreshData)} />
                ) : selectedMenuItem === 'manage' ? (
                    <ManageParticipantsView planData={post} />
                ) : (
                    <ItineraryView key="itinerary" plan={post} onUnitClick={(item) => { setSelectedItem(item); setSelectedMenuItem('unit_view'); }} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
  );
}