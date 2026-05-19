/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle2, Clock, Crown, User, Calendar } from 'lucide-react';

export const ParticipationView = ({ selectedUnit }) => {
  // 단일 유닛 내부의 participants 배열 매핑
  const participants = selectedUnit?.participants || [];

  // 실시간 이름 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState('');

  // 검색어 필터링 적용
  const filteredParticipants = participants.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 호스트(방장)와 게스트(참여자) 분리 구획
  const hostUser = participants.find(p => p.participationRole === 'HOST');
  const guestUsers = filteredParticipants.filter(p => p.participationRole !== 'HOST');

  // 승인 상태값 뱃지 라벨 매퍼
  const getStatusLabel = (status) => {
    return status === 'APPROVED' ? '참여 확정' : status === 'RESERVED' ? '대기 중' : status;
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 max-w-[1140px] mx-auto p-4"
      >
        {/* 상단 타이틀 및 일정 리스트 스타일 검색 바 구역 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#333333]">코스 참여자 목록</h2>
            <span className="bg-[#F3F4F6] px-3 py-1 rounded-full text-xs font-black text-[#666666]">
             총 {participants.length}명
           </span>
          </div>

          {/* 첨부 이미지의 알약 모양 검색 바 스타일 완벽 구현 */}
          <div className="relative w-full md:w-[360px]">
            <input
                type="text"
                placeholder="일정을 검색해보세요 (참여자 이름 입력)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-2.5 bg-white border border-[#CCCCCC] rounded-full text-xs font-bold focus:outline-none focus:border-[#007AFF] transition-all placeholder:text-gray-400"
            />
            <Search size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#333333] cursor-pointer" />
          </div>
        </div>

        {/* 1. 최상단: 총괄 가이드 방장 단독 코너 */}
        {hostUser && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[#999999] uppercase tracking-widest px-1 block">
                👑 코스 가이드 방장
              </label>

              {/* 첨부 이미지 카드 비율 및 레이아웃 그대로 반영 */}
              <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex gap-5 max-w-[540px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                {/* 좌측 스퀘어 미디어 영역 -> 방장 이니셜 박스로 치환 */}
                <div className="w-[110px] h-[110px] bg-gradient-to-br from-amber-400 to-amber-500 rounded-[12px] flex items-center justify-center text-white font-black text-xl shrink-0 border border-amber-200">
                  {hostUser.name.substring(0, 2)}
                </div>

                {/* 우측 명세 영역 */}
                <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                  <div className="space-y-1">
                    {/* 상단 뱃지 */}
                    <span className="inline-block bg-[#FFF0D4] text-[#E5A93C] text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  방장 / 개설자
                </span>
                    {/* 타이틀 명칭 */}
                    <h4 className="text-lg font-black text-[#333333] tracking-tight truncate flex items-center gap-1.5 mt-1">
                      {hostUser.name}
                    </h4>
                    {/* 상세 설명 구획 */}
                    <p className="text-xs font-bold text-[#666666] line-clamp-1">
                      ID: {hostUser.userId}
                    </p>
                  </div>

                  {/* 하단 아이콘 정보 블록 */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#666666] mt-2">
                    <Crown size={12} className="text-amber-500" />
                    <span>총괄 호스트 메이트</span>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* 2. 하단: 동행 메이트 목록 (1행 2열 Grid 적용 + 리스트 카드 컴포넌트 복제) */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-[#999999] uppercase tracking-widest px-1 block">
            👥 코스 동행 메이트 ({guestUsers.length}명)
          </label>

          {guestUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guestUsers.map((guest) => {
                  const isApproved = guest.participationStatus === 'APPROVED';

                  return (
                      <div
                          key={guest.id}
                          className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#007AFF]/40 hover:shadow-[0_6px_24px_rgba(0,122,255,0.04)] transition-all"
                      >
                        {/* 좌측 스퀘어 썸네일 박스 스타일 완벽 일치 */}
                        <div className="w-[110px] h-[110px] bg-[#EAECEF] rounded-[12px] flex items-center justify-center text-[#777777] font-black text-lg shrink-0">
                          {guest.name.substring(0, 2)}
                        </div>

                        {/* 우측 메타 데이터 서술 구역 */}
                        <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                          <div className="space-y-1">
                            {/* 상단 모집태그 폰트 및 라운딩 그대로 커스텀 */}
                            <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                                isApproved ? 'bg-[#E6FFF2] text-[#00C853]' : 'bg-[#FFF9E6] text-[#F9BF00]'
                            }`}>
                        {getStatusLabel(guest.participationStatus)}
                      </span>

                            {/* 이름 대제목 명세 */}
                            <h4 className="text-lg font-black text-[#333333] tracking-tight truncate mt-1">
                              {guest.name}
                            </h4>

                            {/* 본문 요약 */}
                            <p className="text-xs font-bold text-[#666666] truncate">
                              ID: {guest.userId.substring(0, 18)}...
                            </p>
                          </div>

                          {/* 하단 아이콘 정보 타임스탬프 구역 변형 블록 */}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#666666] mt-2">
                            {isApproved ? (
                                <CheckCircle2 size={12} className="text-[#00C853]" />
                            ) : (
                                <Clock size={12} className="text-[#F9BF00]" />
                            )}
                            <span>역할: {guest.participationRole === 'GUEST' ? '일반 참여자' : guest.participationRole}</span>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          ) : (
              <div className="text-center py-20 bg-white border border-dashed border-[#E5E7EB] rounded-[24px] flex flex-col items-center justify-center text-[#999999]">
                <User size={36} className="opacity-20 mb-2" />
                <p className="text-xs font-bold">이 코스에 참여 신청한 게스트 메이트가 없습니다.</p>
              </div>
          )}
        </div>
      </motion.div>
  );
};