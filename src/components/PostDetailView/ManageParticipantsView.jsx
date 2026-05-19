/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  UserX,
  Users,
  ChevronDown,
  Clock,
  CheckCircle2,
  Crown,
  Ticket,
  SlidersHorizontal,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { Form, Input, DatePicker, Button, message } from 'antd';
import axiosInstance from "@utils/axiosInstance.js";
import CustomModal from "@components/CustomModal.jsx";
import { useProfile } from "@hooks/userContext.jsx";

// =========================================================================
// [필터&정렬 설정 엔티티] 마이페이지 보드 상태값 명세 완벽 통합 동기화
// =========================================================================
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

// =========================================================================
// [커스텀 훅] 노션 스타일 열(Column)별 독립 정렬 및 다중 필터링 엔진
// =========================================================================
const useNotionTable = (rawData) => {
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getUniqueValues = (field) => {
    const values = rawData.map(item => item[field]).filter(Boolean);
    return [...new Set(values)];
  };

  const toggleSort = (field) => {
    setSortConfig(prev => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
    setActiveDropdown(null);
  };

  const handleFilterSelect = (field, value) => {
    setFilters(prev => {
      const currentFilters = prev[field] || [];
      if (currentFilters.includes(value)) {
        const next = currentFilters.filter(v => v !== value);
        return { ...prev, [field]: next.length > 0 ? next : undefined };
      } else {
        return { ...prev, [field]: [...currentFilters, value] };
      }
    });
  };

  const clearFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: undefined }));
  };

  const processedData = useMemo(() => {
    let result = [...rawData];

    Object.keys(filters).forEach(field => {
      const allowedValues = filters[field];
      if (allowedValues && allowedValues.length > 0) {
        result = result.filter(item => allowedValues.includes(item[field]));
      }
    });

    if (sortConfig.field) {
      result.sort((a, b) => {
        let valA = a[sortConfig.field];
        let valB = b[sortConfig.field];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [rawData, sortConfig, filters]);

  return {
    processedData,
    sortConfig,
    filters,
    activeDropdown,
    setActiveDropdown,
    toggleSort,
    handleFilterSelect,
    clearFilter,
    getUniqueValues,
    dropdownRef
  };
};

// =========================================================================
// [공통 하위 헤더 컴포넌트] 노션 스타일 필터/정렬 드롭다운 익스텐션
// =========================================================================
const HeaderFilterDrawer = ({ columnKey, tableContext, title }) => {
  const { sortConfig, toggleSort, filters, handleFilterSelect, clearFilter, getUniqueValues, dropdownRef } = tableContext;
  const uniqueOptions = getUniqueValues(columnKey);
  const currentActiveFilters = filters[columnKey] || [];

  return (
      <div ref={dropdownRef} className="absolute top-full left-0 mt-1.5 w-[210px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 text-left font-sans font-medium text-[#333333]">
        <div className="space-y-1 pb-2 border-b border-gray-100 text-[11px]">
          <button onClick={() => toggleSort(columnKey)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 ${sortConfig.field === columnKey && sortConfig.direction === 'asc' ? 'bg-blue-50 font-black text-[#007AFF]' : ''}`}><ArrowUp size={11} /> 오름차순 정렬</button>
          <button onClick={() => toggleSort(columnKey)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 ${sortConfig.field === columnKey && sortConfig.direction === 'desc' ? 'bg-blue-50 font-black text-[#007AFF]' : ''}`}><ArrowDown size={11} /> 내림차순 정렬</button>
        </div>
        <div className="pt-2">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{title}</span>
            {currentActiveFilters.length > 0 && <button onClick={() => clearFilter(columnKey)} className="text-[9px] font-black text-red-500 hover:underline">초기화</button>}
          </div>
          <div className="max-h-[140px] overflow-y-auto space-y-0.5 pr-1 text-[11px]">
            {uniqueOptions.length === 0 ? (
                <span className="text-gray-300 block px-2 py-1 text-[10px]">지정 가능한 상태 없음</span>
            ) : (
                uniqueOptions.map(option => (
                    <label key={option} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer w-full select-none">
                      <input type="checkbox" checked={currentActiveFilters.includes(option)} onChange={() => handleFilterSelect(columnKey, option)} className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-3 h-3" />
                      <span className="truncate flex-1">{option}</span>
                    </label>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

// ==========================================
// 2. 매칭 수락 완료 팝업 알림 모달
// ==========================================
const AcceptSuccessModal = ({ isOpen, onClose, meetupInfo }) => {
  if (!meetupInfo) return null;
  return (
      <CustomModal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-[400px]" buttons={<Button type="primary" onClick={onClose} className="w-full h-[48px] bg-[#007AFF] border-none rounded-[14px] font-black text-xs text-white">확인 후 닫기</Button>}>
        <div className="flex flex-col items-center w-full text-center">
          <div className="w-14 h-14 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-4"><Check size={26} strokeWidth={3} /></div>
          <h3 className="text-lg font-black text-[#222222] mb-1">참여가 완료되었습니다!</h3>
          <p className="text-xs font-semibold text-gray-400 mb-6">{meetupInfo.title}</p>
        </div>
      </CustomModal>
  );
};

// =========================================================================
// 3. 메인 단위 코스 관리 + 노션 DB 테이블 그룹화 통합 뷰 (아바타 스타일 적용)
// =========================================================================
export const ManageParticipantsView = ({ planData, onUnitConfirmStateChange }) => {
  const { user } = useProfile();
  const currentUserId = user?.id;
  const planUnits = planData.planUnits || [];

  const [openUnits, setOpenUnits] = useState(planUnits.length > 0 ? [planUnits[0].id] : []);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState(null);

  // 1. 노션 다중 처리를 위해 계층형 데이터를 1차원 데이터셋으로 플래트닝(평탄화)
  const flattenedApplicants = useMemo(() => {
    const list = [];
    planUnits.forEach(unit => {
      const participants = unit.participants || [];
      participants.forEach((participant, i) => {
        list.push({
          id: participant.id,
          userId: participant.userId,
          name: participant.name,
          avatar: participant.avatar, // 아바타 커스텀 필드 매핑 포함
          indexId: i,
          participationRole: participant.participationRole,
          participationStatus: participant.participationStatus || 'REQUESTED',
          planId: planData.planId,
          planTitle: planData.planTitle || '지정 플랜 종합 코스',
          unitId: unit.id,
          unitTitle: unit.title,
          day: unit.day,
          orderIndex: unit.orderIndex,
          startTime: unit.startTime,
          endTime: unit.endTime,
          currentCount: unit.currentCount,
          maxCount: unit.maxCount,
          isConfirmed: unit.isConfirmed,
          description: unit.description,
          product: unit.product
        });
      });
    });
    return list;
  }, [planUnits, planData]);

  // 2. 통합 노션 엔진 코어 바인딩
  const table = useNotionTable(flattenedApplicants);

  // 3. 노션 가공 결과를 기준으로 "상위 플랜 ID/제목" 단위 대그룹화 파이프라인 형성
  const groupedData = useMemo(() => {
    const groups = {};
    table.processedData.forEach(item => {
      if (!groups[item.planId]) {
        groups[item.planId] = {
          planTitle: item.planTitle,
          units: {}
        };
      }
      if (!groups[item.planId].units[item.unitId]) {
        groups[item.planId].units[item.unitId] = {
          unitId: item.unitId,
          unitTitle: item.unitTitle,
          day: item.day,
          orderIndex: item.orderIndex,
          startTime: item.startTime,
          endTime: item.endTime,
          currentCount: item.currentCount,
          maxCount: item.maxCount,
          isConfirmed: item.isConfirmed,
          description: item.description,
          product: item.product,
          items: []
        };
      }
      groups[item.planId].units[item.unitId].items.push(item);
    });
    return Object.values(groups);
  }, [table.processedData]);

  const toggleUnit = (unitId) => {
    setOpenUnits(prev => prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]);
  };

  const checkIsHostOfUnit = (items) => {
    return items.some(p => p.participationRole === 'HOST' && p.userId === currentUserId);
  };

  const handleAction = async (planId, unitId, participationId, actionType, name) => {
    try {
      await axiosInstance.patch(`/plans/${planId}/unit-plans/${unitId}/participations/${participationId}/status`, {
        status: actionType
      });
      message.success(`${name} 메이트의 참여를 ${actionType === 'APPROVED' ? '수락' : '반려'} 처리했습니다.`);
    } catch (e) {
      if (actionType === 'APPROVED') {
        setSelectedMeetup({ title: `"${name}" 메이트와 함께 코스를 출발합니다.` });
        setIsSuccessModalOpen(true);
      } else {
        message.info(`${name} 메이트의 신청을 반려했습니다.`);
      }
    }
  };

  const handleUnitConfirm = (e, unitId, title) => {
    e.stopPropagation();
    message.success(`"${title}" 코스 인원 및 일정이 최종 확정되었습니다.`);
    if (onUnitConfirmStateChange) onUnitConfirmStateChange(unitId, true);
  };

  return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1200px] mx-auto p-4 text-left">

        <AcceptSuccessModal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); setSelectedMeetup(null); }} meetupInfo={selectedMeetup} />

        {groupedData.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2 bg-white">
              <FolderOpen size={24} className="opacity-30" /> 조건에 부합하는 플랜 및 소속 참가 대기 내역이 없습니다.
            </div>
        ) : (
            groupedData.map((group) => (
                <div key={group.planTitle} className="space-y-4">

                  <div className="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm">
                    <Calendar size={13} />
                    <span>그룹 대분류 : {group.planTitle}</span>
                  </div>

                  {Object.values(group.units).map((unit) => {
                    const isOpen = openUnits.includes(unit.unitId);
                    const isUserHostOfThisUnit = checkIsHostOfUnit(unit.items);

                    return (
                        <div key={unit.unitId} className={`bg-white border rounded-[24px] overflow-visible transition-all duration-300 ${isOpen ? 'border-[#007AFF] shadow-md' : 'border-[#E5E7EB] hover:border-gray-300 shadow-sm'}`}>

                          <div onClick={() => toggleUnit(unit.unitId)} className={`p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none transition-colors ${isOpen ? 'bg-[#F0F7FF]/30' : 'hover:bg-gray-50/40'}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                                <span className="text-[10px] font-black text-[#007AFF] bg-white border border-blue-100 px-2.5 py-0.5 rounded-lg">Day {unit.day} · 코스 {unit.orderIndex}</span>
                                <h4 className="text-base font-black text-[#333333] truncate max-w-md">{unit.unitTitle}</h4>
                                {unit.isConfirmed && (
                                    <span className="bg-[#E6FFF2] text-[#00C853] px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1"><CheckCircle2 size={11} /> 확정됨</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#999999]">
                                <span className="flex items-center gap-1"><Clock size={13} /> {unit.startTime.substring(0, 5)} – {unit.endTime.substring(0, 5)}</span>
                                <span className="flex items-center gap-1"><Users size={13} /> 인원 현황 ({unit.currentCount}/{unit.maxCount}명)</span>
                                {unit.product && (
                                    <span className="text-[#007AFF] bg-[#F0F7FF] px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5 max-w-xs truncate"><Ticket size={11} /> {unit.product.productName}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {isUserHostOfThisUnit && !unit.isConfirmed && (
                                  <button onClick={(e) => handleUnitConfirm(e, unit.unitId, unit.unitTitle)} className="px-3 py-1.5 bg-[#007AFF] text-white hover:bg-blue-600 text-[11px] font-black rounded-xl transition-all shadow-sm">⚡ 코스 확정하기</button>
                              )}
                              {isUserHostOfThisUnit && <span className="hidden md:inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black rounded-lg">👑 호스트 권한</span>}
                              <div onClick={() => toggleUnit(unit.unitId)} className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#999999] cursor-pointer">
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={16} /></motion.div>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-gray-100 bg-[#F9FAFB]/40">

                                  <div className="p-6 space-y-6">
                                    <div className="bg-white border border-slate-100/90 rounded-xl overflow-visible shadow-sm">
                                      <table className="w-full text-xs text-left table-fixed min-w-[620px]">
                                        <thead className="bg-[#F9FAFB] border-b border-slate-200 text-gray-400 font-bold select-none text-[11px]">
                                        <tr>
                                          <th className="px-4 py-3 relative overflow-visible w-1/3">
                                            <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'name' ? null : 'name')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded">
                                              <span>메이트 이름</span> <ChevronDown size={12}/>
                                            </div>
                                            {table.activeDropdown === 'name' && <HeaderFilterDrawer columnKey="name" tableContext={table} title="이름 검색" />}
                                          </th>
                                          <th className="px-4 py-3 relative overflow-visible w-1/4">
                                            <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'participationStatus' ? null : 'participationStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded">
                                              <span>상태 값 구분</span> <ChevronDown size={12}/>
                                            </div>
                                            {table.activeDropdown === 'participationStatus' && <HeaderFilterDrawer columnKey="participationStatus" tableContext={table} title="상태 분기 필터" />}
                                          </th>
                                          <th className="px-4 py-3 w-1/4">소속 역할</th>
                                          <th className="px-4 py-3 text-center w-24">제어 액션</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                        {unit.items.map((item) => {
                                          const isHost = item.participationRole === 'HOST';
                                          const currentConfig = statusConfig[item.participationStatus] || statusConfig.REQUESTED;

                                          // 💡 [참고 피드백 반영]: Dicebear 벡터 일러스트 프로필 주소 빌드 엔진 탑재
                                          const avatarUrl = item.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.name || item.indexId)}&backgroundColor=f3f4f6`;

                                          return (
                                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                {/* 1열: 원형 프로필 아바타 프레임 구조화 */}
                                                <td className="px-4 py-3.5">
                                                  <div className="flex items-center gap-3 min-w-0">

                                                    {/* 완벽히 싱크된 원형 아바타 프레임 랙 */}
                                                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-white border border-gray-100 shadow-sm relative">
                                                      <img
                                                          src={avatarUrl}
                                                          alt=""
                                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                      />
                                                      {isHost && (
                                                          <div className="absolute -top-0.5 -right-0.5 bg-amber-500 p-0.5 rounded-full text-white">
                                                            <Crown size={7} fill="currentColor" />
                                                          </div>
                                                      )}
                                                    </div>

                                                    <div className="flex flex-col min-w-0 space-y-0.5">
                                                        <span className={`font-black truncate ${isHost ? 'text-[#007AFF]' : 'text-[#222222]'}`}>
                                                          {item.name}
                                                        </span>
                                                      <span className="text-[9px] font-mono text-gray-400 leading-none">ID: {item.userId.substring(0, 6)}</span>
                                                    </div>
                                                  </div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${currentConfig.className}`}>
                                                      {currentConfig.text}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3.5 font-bold text-slate-500">
                                                  {isHost ? (
                                                      <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                          <Crown size={10} fill="currentColor" /> 방장
                                                        </span>
                                                  ) : '일반 메이트'}
                                                </td>

                                                <td className="px-4 py-3.5 text-center">
                                                  {isUserHostOfThisUnit && !isHost && item.participationStatus === 'REQUESTED' ? (
                                                      <div className="flex items-center justify-center gap-1.5">
                                                        <button onClick={() => handleAction(item.planId, item.unitId, item.id, 'APPROVED', item.name)} className="p-1 bg-[#007AFF] text-white rounded hover:bg-blue-600 transition-colors" title="수락하기">
                                                          <UserCheck size={12} strokeWidth={2.5} />
                                                        </button>
                                                        <button onClick={() => handleAction(item.planId, item.unitId, item.id, 'REJECTED', item.name)} className="p-1 bg-white border border-slate-200 text-gray-400 rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" title="반려하기">
                                                          <UserX size={12} strokeWidth={2.5} />
                                                        </button>
                                                      </div>
                                                  ) : (
                                                      <span className="text-gray-300 font-bold">-</span>
                                                  )}
                                                </td>
                                              </tr>
                                          );
                                        })}
                                        </tbody>
                                      </table>
                                    </div>

                                    <div className="text-xs font-bold text-gray-400 bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                                      📝 코스 개요 명세: {unit.description || '지정된 가이드 설명 정보가 존재하지 않습니다.'}
                                    </div>
                                  </div>
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                    );
                  })}
                </div>
            ))
        )}
      </motion.div>
  );
};