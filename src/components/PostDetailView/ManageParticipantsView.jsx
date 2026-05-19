/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  UserX,
  Users,
  ChevronDown,
  Clock,
  CheckCircle2,
  Crown,
  Ticket
} from 'lucide-react';
import { message } from 'antd';
import { useProfile } from "@hooks/userContext.jsx";

export const ManageParticipantsView = ({ planData, onUnitConfirmStateChange }) => {
  const { user } = useProfile();
  const currentUserId = user?.id;
  const planUnits = planData.planUnits || [];

  const [openUnits, setOpenUnits] = useState(
      planUnits.length > 0 ? [planUnits[0].id] : []
  );

  const toggleUnit = (unitId) => {
    setOpenUnits(prev =>
        prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const checkIsHostOfUnit = (participants) => {
    const hostUser = participants.find(p => p.participationRole === 'HOST');
    return hostUser && hostUser.userId === currentUserId;
  };

  const handleAction = (actionType, name) => {
    if (actionType === 'approve') {
      message.success(`${name} 메이트의 참여를 수락했습니다.`);
    } else {
      message.info(`${name} 메이트의 신청을 반려했습니다.`);
    }
  };

  // 코스별 자체 확정 프로세스 핸들러
  const handleUnitConfirm = (e, unitId, title) => {
    e.stopPropagation(); // 아코디언 트리거 방지
    message.success(`"${title}" 코스 인원 및 일정이 최종 확정되었습니다.`);
    if (onUnitConfirmStateChange) onUnitConfirmStateChange(unitId, true);
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
            const participants = unit.participants || [];

            // 노션 DB 스타일 칸반 구분을 위한 필터 분리
            const waitingList = participants.filter(p => p.participationStatus === 'RESERVED' && p.participationRole !== 'HOST');
            const approvedList = participants.filter(p => p.participationStatus === 'APPROVED' || p.participationRole === 'HOST');

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
                      className={`p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none transition-colors ${
                          isOpen ? 'bg-[#F0F7FF]/30' : 'hover:bg-gray-50/40'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
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

                    {/* 우측 상단 액션 제어 구역 */}
                    <div className="flex items-center justify-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isUserHostOfThisUnit && !unit.isConfirmed && (
                          <button
                              onClick={(e) => handleUnitConfirm(e, unit.id, unit.title)}
                              className="px-3 py-1.5 bg-[#007AFF] text-white hover:bg-blue-600 text-[11px] font-black rounded-xl transition-all shadow-sm"
                          >
                            ⚡ 코스 확정하기
                          </button>
                      )}
                      {isUserHostOfThisUnit && (
                          <span className="hidden md:inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black rounded-lg">
                            👑 호스트 권한
                          </span>
                      )}
                      <div
                          onClick={() => toggleUnit(unit.id)}
                          className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#999999] cursor-pointer"
                      >
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={16} />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* 아코디언 바디 - 노션 DB 구조식 매핑 */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100 bg-[#F9FAFB]/40"
                        >
                          <div className="p-6 space-y-6">
                            <p className="text-xs font-bold text-gray-400 bg-white p-3 border border-slate-100 rounded-xl">
                              📝 코스 설명: {unit.description || '지정된 설명이 없습니다.'}
                            </p>

                            {/* 노션 칸반 스타일 2열 레이아웃 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                              {/* 1열: 승인 대기 명단 (RESERVED) */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  <h5 className="text-xs font-black text-slate-700">승인 대기 메이트 ({waitingList.length})</h5>
                                </div>
                                {waitingList.length > 0 ? (
                                    waitingList.map(participant => (
                                        <div key={participant.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-black text-xs flex items-center justify-center shrink-0">
                                              {participant.name.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-xs font-black text-[#333333] truncate">{participant.name}</span>
                                              <span className="text-[9px] font-bold text-gray-400">ID: {participant.userId.substring(0, 6)}...</span>
                                            </div>
                                          </div>
                                          {isUserHostOfThisUnit && (
                                              <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleAction('approve', participant.name)} className="p-1.5 bg-[#F0F7FF] text-[#007AFF] rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors">
                                                  <UserCheck size={13} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => handleAction('reject', participant.name)} className="p-1.5 bg-[#FFF5F5] text-[#FF4D4D] rounded-lg hover:bg-[#FF4D4D] hover:text-white transition-colors">
                                                  <UserX size={13} strokeWidth={2.5} />
                                                </button>
                                              </div>
                                          )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[11px] font-bold text-gray-400 text-center py-6 bg-white rounded-xl border border-dashed">대기 중인 신청자가 없습니다.</p>
                                )}
                              </div>

                              {/* 2열: 참여 확정 명단 (APPROVED & HOST) */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                  <h5 className="text-xs font-black text-slate-700">참여 확정 명단 ({approvedList.length})</h5>
                                </div>
                                {approvedList.map(participant => {
                                  const isHost = participant.participationRole === 'HOST';
                                  return (
                                      <div key={participant.id} className={`bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm ${isHost ? 'border-amber-200 bg-amber-50/10' : 'border-[#E5E7EB]'}`}>
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center border shrink-0 ${isHost ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {participant.name.substring(0, 2)}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-xs font-black text-[#333333] truncate">{participant.name}</span>
                                              {isHost && (
                                                  <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <Crown size={8} /> 방장
                                                  </span>
                                              )}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400">ID: {participant.userId.substring(0, 6)}...</span>
                                          </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${isHost ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                          {isHost ? 'Master' : '✓ 확정'}
                                        </span>
                                      </div>
                                  );
                                })}
                              </div>

                            </div>
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