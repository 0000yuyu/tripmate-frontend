/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { JournalView } from '../JournalView.jsx';
import { ParticipationView } from "@components/PostDetailView/ParticipationView.jsx";
import { useProfile } from "@hooks/userContext.jsx";

export const ItemDetailView = ({
  item,
  activeSubTab,
  setActiveSubTab,
  onBack,
  onJoinUnit,
  onConfirmUnit,
  onViewProduct,
  onOrderProduct
}) => {
  const { user } = useProfile();

  if (!item) return null;

  const currentUserId = user?.id;
  const hostUser = item.participants?.find(p => p.participationRole === 'HOST');
  const isHost = hostUser && hostUser.userId === currentUserId;

  return (
      <div className="w-full space-y-8 animate-in fade-in duration-300">
        {/* 상단 헤더: 유닛 타이틀 강조 */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6">
          <div className="space-y-1">
          <span className="text-[11px] font-black text-[#007AFF] uppercase tracking-wider">
            Day {item.day} · 일정 {item.orderIndex}
          </span>
            <h3 className="text-3xl font-black text-[#111111] tracking-tight">{item.title}</h3>
          </div>
          <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#999999] hover:text-[#007AFF] transition-all pt-2"
          >
            <ArrowLeft size={14} /> 목록으로
          </button>
        </div>

        {/* 정보 카드: 가로 100% 와이드 레이아웃 */}
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6 flex-1 w-full">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-400">코스 설명</p>
                <p className="text-base font-medium text-[#333333] leading-relaxed">
                  {item.description || '등록된 상세 설명이 없습니다.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-xs font-bold text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  {item.startTime?.substring(0, 5)} ~ {item.endTime?.substring(0, 5)}
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg text-xs font-bold text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  모집 현황: {item.currentCount} / {item.maxCount}명
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold ${item.isConfirmed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {item.isConfirmed ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {item.isConfirmed ? '일정 확정됨' : '일정 확정 대기중'}
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-col gap-3 min-w-[160px] w-full md:w-auto">
              {isHost ? (
                  <button
                      onClick={onConfirmUnit}
                      disabled={item.isConfirmed}
                      className={`w-full px-6 py-3.5 text-xs font-black rounded-[8px] transition-all border ${
                          item.isConfirmed
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[#007AFF] text-white hover:bg-blue-600 shadow-lg shadow-blue-200"
                      }`}
                  >
                    {item.isConfirmed ? "확정 완료" : "일정 확정하기"}
                  </button>
              ) : (
                  <button
                      onClick={onJoinUnit}
                      className="w-full px-6 py-3.5 bg-[#111111] text-white hover:bg-[#333333] text-xs font-black rounded-[8px] transition-all shadow-lg"
                  >
                    참여하기
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-8 border-b border-gray-200 text-sm font-bold">
          {[
            { id: 'participation', label: '참여 관리' },
            { id: 'product', label: '상품 연동' },
            { id: 'record', label: '여행 기록' }
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`pb-4 border-b-2 transition-all ${
                      activeSubTab === tab.id
                          ? 'border-[#333333] text-[#333333] font-black'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab.label}
              </button>
          ))}
        </div>

        {/* 하단 서브 뷰 */}
        <div className="pt-2">
          {activeSubTab === 'participation' ? (
              <ParticipationView selectedUnit={item} />
          ) : activeSubTab === 'record' ? (
              <JournalView selectedUnit={item} />
          ) : (
              <div className="space-y-4">
                {item.product ? (
                    <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-1 space-y-2">
                        <h4 className="text-lg font-black text-slate-800">{item.product.productName}</h4>
                        <p className="text-sm font-bold text-[#007AFF]">{item.product.price?.toLocaleString()}원</p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onViewProduct} className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-50">상세보기</button>
                        <button onClick={onOrderProduct} className="flex-1 sm:flex-none px-6 py-3 bg-[#007AFF] text-white text-xs font-bold rounded-lg hover:bg-blue-600">구매하기</button>
                      </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 text-xs font-bold bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      연동된 상품 정보가 없습니다.
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
};