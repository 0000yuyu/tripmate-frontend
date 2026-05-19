/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  UserX,
  Calendar,
  Users,
  Info,
  ChevronDown,
  Clock,
  CheckCircle2,
  Crown,
  Search,
  Ticket
} from 'lucide-react';
import { message } from 'antd';
import {useProfile} from "@hooks/userContext.jsx";

export const ManageParticipantsView = ({ planData }) => {

  const {user} = useProfile();
  const currentUserId = user.id;
  const planUnits = planData.planUnits || [];

  // 아코디언 개별 토글 상태 관리 (첫 번째 유닛 기본 오픈)
  const [openUnits, setOpenUnits] = useState(
      planUnits.length > 0 ? [planUnits[0].id] : []
  );

  // 참여자 검색어 상태
  const [searchQuery, setSearchQuery] = useState('');

  const toggleUnit = (unitId) => {
    setOpenUnits(prev =>
        prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  // 승인 상태값 스타일 매핑
  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESERVED':
        return { label: '⏳ 승인 대기', color: '#854F0B', bg: '#FAEEDA' };
      case 'APPROVED':
        return { label: '✅ 참여 확정', color: '#185FA5', bg: '#E6F1FB' };
      default:
        return { label: status, color: '#666666', bg: '#F3F4F6' };
    }
  };

  // 해당 유닛의 호스트(방장) 여부 체크
  const checkIsHostOfUnit = (participants) => {
    const hostUser = participants.find(p => p.participationRole === 'HOST');
    return hostUser && hostUser.userId === currentUserId;
  };

  // 수락/거절 핸들러
  const handleAction = (actionType, name) => {
    if (actionType === 'approve') {
      message.success(`${name} 메이트의 참여를 수락했습니다.`);
    } else {
      message.info(`${name} 메이트의 신청을 반려했습니다.`);
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 max-w-[1200px] mx-auto p-4"
      >

        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#333333] px-1">
            단위 코스별 신청자 관리
          </h3>

          {planUnits.map((unit) => {
            const isOpen = openUnits.includes(unit.id);
            const isUserHostOfThisUnit = checkIsHostOfUnit(unit.participants || []);

            // 실시간 검색 필터 적용
            const filteredParticipants = (unit.participants || []).filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // HOST(방장) 무조건 정렬 맨 앞으로 고정
            const sortedParticipants = [...filteredParticipants].sort((a, b) => {
              if (a.participationRole === 'HOST') return -1;
              if (b.participationRole === 'HOST') return 1;
              return 0;
            });

            return (
                <div
                    key={unit.id}
                    className={`bg-white border rounded-[24px] overflow-hidden transition-all duration-300 ${
                        isOpen ? 'border-[#007AFF] shadow-md' : 'border-[#E5E7EB] hover:border-gray-300 shadow-sm'
                    }`}
                >
                  {/* 유닛 아코디언 헤더 */}
                  <div
                      onClick={() => toggleUnit(unit.id)}
                      className={`p-6 cursor-pointer flex items-center justify-between gap-4 select-none transition-colors ${
                          isOpen ? 'bg-[#F0F7FF]/30' : 'hover:bg-gray-50/40'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        {/* Day와 OrderIndex 정보 결합 표시 */}
                        <span className="text-[10px] font-black text-[#007AFF] bg-white border border-blue-100 px-2.5 py-0.5 rounded-lg">
                      Day {unit.day} · 일정 {unit.orderIndex}
                    </span>
                        <h4 className="text-base font-black text-[#333333] truncate max-w-md">{unit.title}</h4>
                        {unit.isConfirmed && (
                            <span className="bg-[#E6FFF2] text-[#00C853] px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 size={11} /> 확정됨
                      </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#999999]">
                        <span className="flex items-center gap-1"><Clock size={13} /> {unit.startTime.substring(0, 5)} – {unit.endTime.substring(0, 5)}</span>
                        <span className="flex items-center gap-1"><Users size={13} /> 인원 현황 ({unit.currentCount}/{unit.maxCount}명)</span>
                        {unit.product && (
                            <span className="text-[#007AFF] bg-[#F0F7FF] px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5 max-w-xs truncate">
                        <Ticket size={11} /> {unit.product.productName}
                      </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isUserHostOfThisUnit && (
                          <span className="hidden sm:inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black rounded-lg">
                      내가 생성한 호스트 일정
                    </span>
                      )}
                      <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#999999]"
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                  </div>

                  {/* 아코디언 바디 상세 내용 */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100 bg-[#F9FAFB]/40"
                        >
                          <div className="p-6">
                            <p className="text-xs font-bold text-gray-400 mb-4 bg-white p-3 border border-slate-100 rounded-xl">
                              📝 코스 설명: {unit.description || '지정된 설명이 없습니다.'}
                            </p>

                            {sortedParticipants.length > 0 ? (
                                /* 1행 2열 그리드 배치 구조 */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {sortedParticipants.map((participant) => {
                                    const isHost = participant.participationRole === 'HOST';
                                    const statusInfo = getStatusStyle(participant.participationStatus);

                                    return (
                                        <div
                                            key={participant.id}
                                            className={`bg-white border rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm ${
                                                isHost ? 'border-amber-200 bg-amber-50/10' : 'border-[#E5E7EB] hover:border-gray-300'
                                            }`}
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            {/* 프로필 이미지 구역 대체용 이니셜 박스 */}
                                            <div className={`w-11 h-11 rounded-xl shrink-0 font-black text-xs flex items-center justify-center border ${
                                                isHost ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                              {participant.name.substring(0, 2)}
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black text-[#333333] truncate">{participant.name}</span>
                                                {isHost && (
                                                    <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                          <Crown size={9} /> 방장
                                        </span>
                                                )}
                                              </div>
                                              <span className="text-[10px] font-bold text-gray-400 mt-0.5">ID: {participant.userId.substring(0, 8)}...</span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            {/* 본인이 호스트이면서 게스트가 RESERVED(대기) 상태일 때 수락/거절 핸들러 노출 */}
                                            {isUserHostOfThisUnit && participant.participationStatus === 'RESERVED' ? (
                                                <div className="flex items-center gap-1">
                                                  <button
                                                      onClick={() => handleAction('approve', participant.name)}
                                                      className="p-1.5 bg-[#F0F7FF] text-[#007AFF] rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors"
                                                  >
                                                    <UserCheck size={14} strokeWidth={2.5} />
                                                  </button>
                                                  <button
                                                      onClick={() => handleAction('reject', participant.name)}
                                                      className="p-1.5 bg-[#FFF5F5] text-[#FF4D4D] rounded-lg hover:bg-[#FF4D4D] hover:text-white transition-colors"
                                                  >
                                                    <UserX size={14} strokeWidth={2.5} />
                                                  </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className="px-2.5 py-1 rounded-lg text-[9px] font-black"
                                                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                                                >
                                      {isHost ? '👑 마스터 호스트' : statusInfo.label}
                                    </span>
                                            )}
                                          </div>
                                        </div>
                                    );
                                  })}
                                </div>
                            ) : (
                                <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-[#999999] bg-white border border-dashed border-slate-200 rounded-xl">
                                  <Users size={32} className="opacity-20" />
                                  <p className="text-xs font-bold">조건에 일치하는 신청 인원이 없습니다.</p>
                                </div>
                            )}
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            );
          })}
        </div>
      </motion.div>
  );
};