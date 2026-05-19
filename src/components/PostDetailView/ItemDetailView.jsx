/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { JournalView } from '../JournalView.jsx';
import { ParticipationView } from "@components/PostDetailView/ParticipationView.jsx";
import { useProfile } from "@hooks/userContext.jsx"; // 유저 프로필 훅 추가

export const ItemDetailView = ({
  item,
  activeSubTab,
  setActiveSubTab,
  onBack,
  onJoinUnit,
  onConfirmUnit, // 호스트 전용 확정하기 핸들러 추가
  onViewProduct,
  onOrderProduct
}) => {
  const { user } = useProfile();

  if (!item) return null;

  // 호스트 여부 판별 (참여자 목록 중 'HOST' 역할을 가진 유저의 ID와 현재 유저 ID 비교)
  const currentUserId = user?.id;
  const hostUser = item.participants?.find(p => p.participationRole === 'HOST');
  const isHost = hostUser && hostUser.userId === currentUserId;

  return (
      <div className="space-y-8">
        {/* 상단 타이틀 구역 */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-black text-[#333333] tracking-tight">{item.title}</h3>
          <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#999999] hover:text-[#007AFF] transition-all"
          >
            <ArrowLeft size={14} /> 목록으로
          </button>
        </div>

        {/* [스케치 반영]: 대형 레이아웃 요약 상단 블록 */}
        <div className="border border-[#E5E7EB] rounded-[12px] p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex flex-col md:flex-row gap-6 flex-1">
            {/* 상품 사진 그레이존 */}
            <div className="w-full md:w-[220px] h-[130px] bg-[#EAECEF] rounded-[6px] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">
              상품 사진
            </div>
            {/* 세부 명세 */}
            <div className="space-y-1.5 py-0.5">
              <p className="text-sm font-bold text-slate-700">{item.day}일차 일지</p>
              <p className="text-sm font-bold text-slate-500">{item.description || '여행 설명이 없습니다.'}</p>
              <p className="text-xs font-medium text-gray-400">일시: {item.startTime?.substring(0,5)} ~ {item.endTime?.substring(0,5)}</p>
              <p className="text-xs font-black text-[#007AFF]">{item.currentCount || 1}명 / {item.maxCount || 6}명 모집 중</p>
            </div>
          </div>

          {/* 우측 상단 배치: 호스트 여부에 따른 버튼 조건부 렌더링 */}
          {isHost ? (
              <button
                  onClick={onConfirmUnit}
                  disabled={item.isConfirmed}
                  className={`w-full md:w-auto px-6 py-2.5 text-xs font-bold rounded-[4px] transition-all shrink-0 border ${
                      item.isConfirmed
                          ? "bg-[#E6FFF2] border-[#00C853] text-[#00C853] cursor-not-allowed"
                          : "border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF] hover:text-white"
                  }`}
              >
                {item.isConfirmed ? "확정 완료" : "일정 확정하기"}
              </button>
          ) : (
              <button
                  onClick={onJoinUnit}
                  className="w-full md:w-auto px-6 py-2.5 border border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white text-xs font-bold rounded-[4px] transition-all shrink-0"
              >
                참여하기
              </button>
          )}
        </div>

        <div className="flex gap-8 border-b border-gray-200 text-sm font-bold">
          {[
            { id: 'participation', label: '참여' },
            { id: 'product', label: '상품' },
            { id: 'record', label: '기록' }
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`pb-3 border-b-2 transition-all ${
                      activeSubTab === tab.id
                          ? 'border-[#333333] text-[#333333] font-black'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab.label}
              </button>
          ))}
        </div>

        {/* 하단 서브 뷰 컴포넌트 마운트 파트 */}
        <div className="pt-2">
          {activeSubTab === 'participation' ? (
              <ParticipationView selectedUnit={item} />
          ) : activeSubTab === 'record' ? (
              <JournalView selectedUnit={item} />
          ) : (
              /* 상품 연동 내역 탭 */
              <div className="space-y-4 max-w-xl">
                {item.product ? (
                    <div className="border border-[#E5E7EB] rounded-[12px] p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="w-[100px] h-[70px] bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">상품 사진</div>
                        <div>
                          <h4 className="text-base font-black text-slate-800">{item.product.productName}</h4>
                          <p className="text-xs font-bold text-[#007AFF] mt-1">{item.product.price?.toLocaleString()}원</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-50">
                        <button onClick={onViewProduct} className="flex-1 py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded">상세보기</button>
                        <button onClick={onOrderProduct} className="flex-1 py-2 bg-[#007AFF] text-xs font-bold text-white rounded">구매하기</button>
                      </div>
                    </div>
                ) : (
                    <div className="text-left py-10 text-gray-400 text-xs font-bold">연동된 패키지 상품 이용권 정보가 없습니다.</div>
                )}
              </div>
          )}
        </div>
      </div>
  );
};