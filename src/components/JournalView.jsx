/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Heart, MessageCircle, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { message } from 'antd';
import { StoryDetailModal } from './StoryDetailModal.jsx';
import { CreateFeedModal } from './CreateFeedModal.jsx';
import axiosInstance from "@utils/axiosInstance.js";

export const JournalView = ({ selectedUnit }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  const unitData = selectedUnit || {};

  // 데이터 로더 함수 정의
  const fetchFeeds = async () => {
    if (!selectedUnit?.id) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/feeds/${selectedUnit.id}`);
      // 백엔드 통상 응답 랩핑 구조(response.data.data)에 따른 안전한 데이터 추출
      const resContent = response.data?.data?.content || response.data?.data || [];
      setFeeds(resContent);
    } catch (error) {
      console.error("피드 로딩 실패:", error);
      message.error("해당 코스의 피드 기록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 및 선택 유닛 변경 시 자동 호출
  useEffect(() => {
    fetchFeeds();
  }, [selectedUnit?.id]);

  return (
      <div className="max-w-[935px] mx-auto space-y-8 pb-20 px-4 md:px-0">

        {/* 1. 상단 미니멀 코스 정보 헤더 (인스타그램 프로필 구역 스타일 레이아웃) */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-black text-[#007AFF] bg-[#F0F7FF] border border-blue-100 px-2.5 py-0.5 rounded-lg">
              Day {unitData.day} · 코스 {unitData.orderIndex}
            </span>
              <h2 className="text-xl md:text-2xl font-black text-[#333333] tracking-tight">{unitData.title}</h2>
            </div>

            <p className="text-xs md:text-sm text-[#666666] font-medium leading-relaxed">
              {unitData.description || '이 코스에 등록된 요약 가이드가 없습니다.'}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#999999] pt-1">
              <span className="flex items-center gap-1"><Clock size={14} /> {unitData.startTime?.substring(0, 5)} ~ {unitData.endTime?.substring(0, 5)}</span>
              <span className="w-1 h-1 bg-[#E5E7EB] rounded-full" />
              <span className="flex items-center gap-1"><MapPin size={14} /> 등록된 기록 {feeds.length}개</span>
            </div>
          </div>

          {/* 새 추억 피드 기록하기 단추 */}
          <button
              onClick={() => setIsNewStoryModalOpen(true)}
              className="w-full md:w-auto shrink-0 bg-[#007AFF] text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-[#007AFF]/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} /> 이 코스에 기록 더하기
          </button>
        </div>

        {/* 2. 하단 구역: 인스타그램 3열 피드 그리드 레이아웃 */}
        {loading ? (
            <div className="flex flex-col justify-center items-center py-24 gap-3 text-gray-400">
              <Loader2 className="animate-spin text-[#007AFF]" size={32} />
              <p className="text-xs font-bold">추억 조각들을 불러오는 중...</p>
            </div>
        ) : feeds.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-7">
              {feeds.map((story) => (
                  <motion.div
                      key={story.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedStory(story)}
                      className="relative aspect-square bg-slate-100 rounded-sm md:rounded-[16px] overflow-hidden cursor-pointer border border-slate-100 group shadow-sm"
                  >
                    {/* 이미지 썸네일 (이미지가 없을 시 일관된 플레이스홀더 렌더링) */}
                    {story.images && story.images[0] ? (
                        <img
                            src={story.images[0]}
                            alt={story.title || '여행 기록 사진'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 bg-white">
                          <ImageIcon size={20} className="opacity-30" />
                          <span className="text-[10px] font-bold opacity-40">No Image</span>
                        </div>
                    )}

                    {/* 인스타그램 마우스 오버 시 상호작용 레이어 오버레이 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-6 text-white text-xs md:text-sm font-black">
                <span className="flex items-center gap-1.5">
                  <Heart size={16} fill="currentColor" /> {story.likesCount || 0}
                </span>
                      <span className="flex items-center gap-1.5">
                  <MessageCircle size={16} fill="currentColor" /> {story.comments?.length || 0}
                </span>
                    </div>
                  </motion.div>
              ))}
            </div>
        ) : (
            /* 피드 데이터 공백 처리 구획 */
            <div className="text-center py-24 bg-white border border-dashed border-[#E5E7EB] rounded-[32px] flex flex-col items-center justify-center text-[#999999]">
              <ImageIcon size={44} className="opacity-20 mb-3" />
              <h4 className="text-sm font-black text-[#333333]">아직 공유된 추억이 없습니다</h4>
              <p className="text-[11px] font-bold text-gray-400 mt-1">첫 번째 여행의 순간을 인스타 피드 형태로 인증해보세요.</p>
              <button
                  onClick={() => setIsNewStoryModalOpen(true)}
                  className="mt-5 border border-[#007AFF] text-[#007AFF] text-[11px] font-black px-4 py-2 rounded-xl hover:bg-[#F0F7FF] transition-colors"
              >
                기록 남기기
              </button>
            </div>
        )}

        {/* 3. 모달 레이어 제어 단락 */}
        <AnimatePresence>
          {selectedStory && (
              <StoryDetailModal
                  story={selectedStory}
                  onClose={() => setSelectedStory(null)}
              />
          )}
        </AnimatePresence>

        <CreateFeedModal
            isOpen={isNewStoryModalOpen}
            onClose={() => setIsNewStoryModalOpen(false)}
            planUnitId={unitData.id}
            onSuccess={() => {
              setIsNewStoryModalOpen(false);
              message.success("새로운 여행 추억 피드가 성공적으로 공유되었습니다! ✨");
              fetchFeeds();
            }}
            onFail={(e)=>{
              message.error(e.message);
            }}
        />
      </div>
  );
};