/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Crown } from 'lucide-react';

export const ParticipationView = ({ selectedUnit }) => {
  const participants = selectedUnit?.participants || [];

  // 💡 [비즈니스 명세]: 8가지 백엔드 상태 상태별 한글 매핑 및 톤앤매너 컬러 칩 구축
  const statusConfig = {
    REQUESTED: { text: '승인 대기', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    APPROVED: { text: '참여 승인', className: 'bg-[#E6FFF2] text-[#00C853] border-[#ccffd9]' },
    REJECTED: { text: '거절됨', className: 'bg-red-50 text-red-500 border-red-100' },
    RESERVED: { text: '예약 완료', className: 'bg-blue-50 text-[#007AFF] border-blue-100' },
    PAID: { text: '결제 완료', className: 'bg-purple-50 text-purple-600 border-purple-100' },
    CONFIRMED: { text: '참여 확정', className: 'bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-100' },
    RESERVED_CANCELLED: { text: '예약 취소', className: 'bg-gray-100 text-gray-400 border-gray-200' },
    PAYMENT_CANCELLED: { text: '결제 취소', className: 'bg-rose-50 text-rose-400 border-rose-100' },
  };

  return (
      <div className="space-y-4">
        {participants.length > 0 ? (
            /* TripMate 전용 4열 그리드 배치 레이아웃 */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {participants.map((member, i) => {
                const isHost = member.participationRole === 'HOST';

                // 상태값 안전 마크업 (정의되지 않은 값이 들어올 경우 일반 회원 칩 처리)
                const currentStatus = statusConfig[member.participationStatus] || {
                  text: member.participationStatus || '일반 참여',
                  className: 'bg-gray-50 text-gray-500 border-gray-200',
                };

                // Dicebear 기반 동적 벡터 일러스트 프로필 주소 빌드
                const avatarUrl =
                    member.avatar ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                        member.name || i
                    )}&backgroundColor=f3f4f6`;

                return (
                    <div
                        key={member.id || i}
                        className={`flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all text-left group ${
                            isHost
                                ? 'border-[#007AFF] shadow-[0_4px_20px_rgba(0,122,255,0.06)] ring-1 ring-[#007AFF]/20'
                                : 'border-gray-200/80 hover:border-slate-400 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md'
                        }`}
                    >
                      {/* 좌측: 원형 아바타 프레임 */}
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white border border-gray-100 shadow-sm relative">
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {isHost && (
                            <div className="absolute -top-0.5 -right-0.5 bg-amber-500 p-0.5 rounded-full text-white">
                              <Crown size={8} fill="currentColor" />
                            </div>
                        )}
                      </div>

                      {/* 우측: 정보 배정 보드 구역 */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          {/* 이름 및 호스트 강조 강조 타이포 */}
                          <p className={`text-sm font-black truncate ${isHost ? 'text-[#007AFF]' : 'text-[#222222]'}`}>
                            {member.name}
                          </p>

                          {/* 호스트 전용 명예 태그 추가 수립 */}
                          {isHost && (
                              <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md font-black shrink-0 tracking-wider">
                        HOST
                      </span>
                          )}
                        </div>

                        {/* 하단: 역할 구분선 및 스케줄 상태 매칭 대형 바 */}
                        <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-gray-400">
                      {isHost ? '개설자 호스트' : '참여 메이트'}
                    </span>

                          {/* 8종 상태칩 시각적 강조 피드백 */}
                          <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-tight shrink-0 ${currentStatus.className}`}
                          >
                      {currentStatus.text}
                    </span>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        ) : (
            /* 빈 화면 방어 가이드 코드 */
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold flex flex-col items-center justify-center gap-2.5">
              <Users size={24} className="opacity-30 text-gray-400" />
              <span>현재 이 코스 일정 유닛에 배정된 동행 참가자 명세가 비어있습니다.</span>
            </div>
        )}
      </div>
  );
};