/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  CalendarDays,
  Loader2,
  Check,
  X,
  ArrowUpDown,
  Filter,
  LogOut,
  SlidersHorizontal,
  FolderOpen,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useProfile } from "@hooks/userContext.jsx";
import axiosInstance from "@/utils/axiosInstance";
import { message } from "antd";
import { clearTokens } from "@utils/auth.js";

// =========================================================================
// [커스텀 훅] 노션 스타일 열(Column)별 독립 정렬 및 다중 필터링 엔진
// =========================================================================
const useNotionTable = (rawData) => {
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [filters, setFilters] = useState({}); // { fieldName: ['값1', '값2'] } 형태로 다중 축적
  const [activeDropdown, setActiveDropdown] = useState(null); // 현재 열려있는 필터 헤더 Key
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기 인터셉터
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 특정 열의 고유한 유니크 상태 목록 추출 (드롭다운 옵션 자동 생성용)
  const getUniqueValues = (field) => {
    const values = rawData.map(item => item[field]).filter(val => val !== undefined && val !== null);
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

  // 정렬 및 다중 필터가 결합된 실시간 데이터 가공 연산 파이프라인
  const processedData = useMemo(() => {
    let result = [...rawData];

    // 1. 다중 필터 검사 구역
    Object.keys(filters).forEach(field => {
      const allowedValues = filters[field];
      if (allowedValues && allowedValues.length > 0) {
        result = result.filter(item => allowedValues.includes(item[field]));
      }
    });

    // 2. 단일 정렬 처리 구역
    if (sortConfig.field) {
      result.sort((a, b) => {
        let valA = a[sortConfig.field];
        let valB = b[sortConfig.field];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'string') {
          return sortConfig.direction === 'asc'
              ? valA.localeCompare(valB)
              : valB.localeCompare(valA);
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

// 💡 [추가] 주문/영수증 도메인 특화 공통 상태 맵핑 설정
const orderStatusConfig = {
  PENDING: { text: '결제 대기', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  COMPLETED: { text: '결제 완료', className: 'bg-emerald-50 text-[#00C853] border-emerald-100' },
  CANCELLED: { text: '주문 취소', className: 'bg-red-50 text-red-400 border-red-100' },
  REFUNDED: { text: '환불 완료', className: 'bg-gray-100 text-gray-400 border-gray-200' }
};

// =========================================================================
// 1. 노션 데이터베이스 스타일 일정 / 호스트 명세 관리 패널
// =========================================================================
const HostManagement = () => {
  const [subTab, setSubTab] = useState('hosting'); // 'hosting' | 'applied'
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      if (subTab === 'hosting') {
        const res = await axiosInstance.get('/plans/participations/received-requests');
        const contentList = res.data?.data?.content || res.data?.data || [];

        const flattened = [];
        contentList.forEach(plan => {
          if (plan.planUnits && plan.planUnits.length > 0) {
            plan.planUnits.forEach(unit => {
              if (unit.applicants && unit.applicants.length > 0) {
                unit.applicants.forEach(applicant => {
                  flattened.push({
                    participationId: applicant.participationId,
                    planUnitId: unit.planUnitId,
                    planId: plan.planId,
                    planTitle: plan.planTitle || '도쿄 투어 코스',
                    unitTitle: unit.title || '시부야 유닛 일정',
                    applicantName: applicant.userName || applicant.name || '동행 신청자',
                    participationStatus: applicant.status || 'PENDING',
                    recruitStatus: plan.recruitStatus || 'OPEN'
                  });
                });
              }
            });
          }
        });
        setRawData(flattened);
      } else {
        const res = await axiosInstance.get('/plans/participations/my-requests');
        const contentList = res.data?.data?.content || res.data?.data || [];

        const flattenedApplied = contentList.map(item => ({
          participationId: item.participationId || item.id,
          planId: item.planId,
          planTitle: item.planTitle || '참여 가이드 플랜',
          planUnitId: item.planUnitId,
          unitTitle: item.unitTitle || '상세 연동 코스 일정',
          participationStatus: item.participationStatus || 'APPROVED'
        }));
        setRawData(flattenedApplied);
      }
    } catch (e) {
      console.error("데이터 구조 바인딩 실패", e);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [subTab]);

  const handleAction = async (planId, unitPlanId, participationId, actionType) => {
    try {
      await axiosInstance.patch(`/plans/${planId}/unit-plans/${unitPlanId}/participations/${participationId}/status`, {
        status: actionType
      });
      message.success(`신청 건에 대해 ${actionType === 'APPROVED' ? '수락' : '거절'} 처리가 완료되었습니다.`);
      fetchTableData();
    } catch (e) {
      message.error("요청 처리 조작 중 예외가 발생했습니다.");
    }
  };

  const table = useNotionTable(rawData);

  return (
      <div className="space-y-5 animate-in fade-in duration-200 text-left">
        <div className="flex bg-[#F3F4F6] p-1 rounded-xl max-w-[300px]">
          <button
              onClick={() => setSubTab('hosting')}
              className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'hosting' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}
          >
            호스트 권한 관리 (수신)
          </button>
          <button
              onClick={() => setSubTab('applied')}
              className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'applied' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}
          >
            내가 참여한 일정 (발신)
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-semibold flex items-center gap-1"><SlidersHorizontal size={12}/> 각 열 헤더를 클릭하여 정렬 및 독립 필터를 지정하세요.</span>
          <span className="font-bold text-[#333333]">정렬 결과: {table.processedData.length}건 산출</span>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
        ) : table.processedData.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2 bg-white">
              <FolderOpen size={24} className="opacity-30" />
              정리된 실시간 명세 항목이 존재하지 않습니다.
            </div>
        ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-visible overflow-x-auto relative">
              <table className="w-full text-left text-xs min-w-[850px] table-fixed">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold select-none">
                {subTab === 'hosting' ? (
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3 relative overflow-visible w-1/4">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'planTitle' ? null : 'planTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>플랜 이름</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'planTitle' && (
                            <HeaderFilterDrawer columnKey="planTitle" tableContext={table} title="플랜 필터" />
                        )}
                      </th>
                      <th className="px-4 py-3 relative overflow-visible w-1/4">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'unitTitle' ? null : 'unitTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>연동 유닛 일정</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'unitTitle' && (
                            <HeaderFilterDrawer columnKey="unitTitle" tableContext={table} title="유닛 코스 필터" />
                        )}
                      </th>
                      <th className="px-4 py-3 relative overflow-visible w-1/5">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'applicantName' ? null : 'applicantName')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>이용자 목록</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'applicantName' && (
                            <HeaderFilterDrawer columnKey="applicantName" tableContext={table} title="이용자 검색" />
                        )}
                      </th>
                      <th className="px-4 py-3 relative overflow-visible w-28 text-center">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'participationStatus' ? null : 'participationStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>승인 상태</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'participationStatus' && (
                            <HeaderFilterDrawer columnKey="participationStatus" tableContext={table} title="상태 분기" />
                        )}
                      </th>
                      <th className="px-4 py-3 text-center w-28">액션 조작</th>
                    </tr>
                ) : (
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3 relative overflow-visible w-1/3">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'planTitle' ? null : 'planTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>참여 플랜 명세</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'planTitle' && (
                            <HeaderFilterDrawer columnKey="planTitle" tableContext={table} title="플랜 필터" />
                        )}
                      </th>
                      <th className="px-4 py-3 relative overflow-visible w-1/3">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'unitTitle' ? null : 'unitTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>매핑 유닛 상세</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'unitTitle' && (
                            <HeaderFilterDrawer columnKey="unitTitle" tableContext={table} title="유닛 코스 필터" />
                        )}
                      </th>
                      <th className="px-4 py-3 relative overflow-visible w-32 text-center">
                        <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'participationStatus' ? null : 'participationStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                          <span>내 상태</span> <ChevronDown size={12}/>
                        </div>
                        {table.activeDropdown === 'participationStatus' && (
                            <HeaderFilterDrawer columnKey="participationStatus" tableContext={table} title="상태 분기" />
                        )}
                      </th>
                      <th className="px-4 py-3 text-center w-24">링크 이동</th>
                    </tr>
                )}
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#333333] font-medium">
                {table.processedData.map((item, index) => (
                    <tr key={item.participationId || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                      {subTab === 'hosting' ? (
                          <>
                            <td className="px-4 py-3.5 font-black text-slate-800 truncate">{item.planTitle}</td>
                            <td className="px-4 py-3.5 text-slate-500 truncate">{item.unitTitle}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-700 truncate">{item.applicantName}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${statusConfig[item.participationStatus]?.className || 'bg-gray-50'}`}>
                                {statusConfig[item.participationStatus]?.text || item.participationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {item.participationStatus === 'REQUESTED' ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={() => handleAction(item.planId, item.planUnitId, item.participationId, 'APPROVED')}
                                        className="p-1 bg-[#007AFF] text-white rounded hover:bg-blue-600 transition-colors"
                                        title="수락하기"
                                    >
                                      <Check size={11} strokeWidth={3} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(item.planId, item.planUnitId, item.participationId, 'REJECTED')}
                                        className="p-1 bg-white border border-slate-200 text-gray-400 rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                                        title="거절하기"
                                    >
                                      <X size={11} strokeWidth={3} />
                                    </button>
                                  </div>
                              ) : (
                                  <span className="text-[11px] text-gray-300 font-bold">-</span>
                              )}
                            </td>
                          </>
                      ) : (
                          <>
                            <td className="px-4 py-3.5 font-black text-slate-800 truncate">{item.planTitle}</td>
                            <td className="px-4 py-3.5 text-slate-500 truncate">{item.unitTitle}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  item.participationStatus === 'APPROVED' ? 'bg-blue-50 text-[#007AFF]' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {item.participationStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <Link
                                  to={`/plans/${item.planId || 'view'}`}
                                  className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-[#007AFF] hover:underline"
                              >
                                <span>이동</span>
                                <ExternalLink size={10} />
                              </Link>
                            </td>
                          </>
                      )}
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};

// =========================================================================
// 💡 [신규 추가] 2. 주문 결제 내역 명세 보드 패널 (마이페이지 연동용)
// =========================================================================
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 💡 실제 통합 통신용 API 바인딩 구조 채택
      const res = await axiosInstance.get('/orders');
      setOrders(res.data?.data?.content || []);
    } catch (e) {
      console.error("주문 목록 로딩 익셉션", e);
      // Fallback 혹은 에러 대응 메시지
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const table = useNotionTable(orders);

  // 국가/도시별 화폐 출력 단위를 반영하는 정밀 가격 포맷터 함수
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  return (
      <div className="space-y-5 animate-in fade-in duration-200 text-left">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-base font-black text-[#333333]">주문 및 결제 확인 명세</h3>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span className="font-semibold flex items-center gap-1">
            <SlidersHorizontal size={12}/> 헤더 필드를 클릭해 동적 정렬 및 예약 필터를 구성하세요.
          </span>
          <span className="font-bold text-[#333333]">조회 내역: {table.processedData.length}건</span>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
        ) : table.processedData.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2 bg-white">
              <ShoppingBag size={24} className="opacity-30" />
              결제 혹은 예약 처리 완료된 주문 내역서가 없습니다.
            </div>
        ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-visible overflow-x-auto relative">
              <table className="w-full text-left text-xs min-w-[900px] table-fixed">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold select-none">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  {/* 상품명 필드 헤더 */}
                  <th className="px-4 py-3 relative overflow-visible w-1/3">
                    <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'productName' ? null : 'productName')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                      <span>상품 및 투어 코스명</span> <ChevronDown size={12}/>
                    </div>
                    {table.activeDropdown === 'productName' && (
                        <HeaderFilterDrawer columnKey="productName" tableContext={table} title="상품 필터" />
                    )}
                  </th>
                  {/* 체험일 필드 헤더 */}
                  <th className="px-4 py-3 relative overflow-visible w-28 text-center">
                    <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'experienceDate' ? null : 'experienceDate')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                      <span>예약 체험일</span> <ChevronDown size={12}/>
                    </div>
                    {table.activeDropdown === 'experienceDate' && (
                        <HeaderFilterDrawer columnKey="experienceDate" tableContext={table} title="날짜 필터" />
                    )}
                  </th>
                  {/* 수량 필드 헤더 */}
                  <th className="px-4 py-3 relative overflow-visible w-20 text-center">
                    <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'totalQuantity' ? null : 'totalQuantity')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                      <span>인원/수량</span> <ChevronDown size={12}/>
                    </div>
                    {table.activeDropdown === 'totalQuantity' && (
                        <HeaderFilterDrawer columnKey="totalQuantity" tableContext={table} title="수량 필터" />
                    )}
                  </th>
                  {/* 총액 필드 헤더 */}
                  <th className="px-4 py-3 relative overflow-visible w-32 text-right pr-6">
                    <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'totalPrice' ? null : 'totalPrice')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors justify-end gap-1">
                      <span>결제 총액</span> <ChevronDown size={12}/>
                    </div>
                    {table.activeDropdown === 'totalPrice' && (
                        <HeaderFilterDrawer columnKey="totalPrice" tableContext={table} title="결제액 필터" />
                    )}
                  </th>
                  {/* 주문 결제 상태 헤더 */}
                  <th className="px-4 py-3 relative overflow-visible w-28 text-center">
                    <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'orderStatus' ? null : 'orderStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                      <span>주문 상태</span> <ChevronDown size={12}/>
                    </div>
                    {table.activeDropdown === 'orderStatus' && (
                        <HeaderFilterDrawer columnKey="orderStatus" tableContext={table} title="상태 필터" />
                    )}
                  </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#333333] font-medium">
                {table.processedData.map((order, index) => (
                    <tr key={order.orderId || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3.5 font-black text-slate-800 truncate">
                        <div className="flex flex-col gap-0.5">
                          <span>{order.productName}</span>
                          <span className="text-[10px] font-mono text-gray-300 font-normal tracking-tight">{order.orderId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500">{order.experienceDate}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-600">{order.totalQuantity}개</td>
                      <td className="px-4 py-3.5 text-right pr-6 font-mono font-black text-slate-900">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${orderStatusConfig[order.orderStatus]?.className || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                          {orderStatusConfig[order.orderStatus]?.text || order.orderStatus}
                        </span>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};

// =========================================================================
// [공통 하위 레이어] 노션 스타일 헤더 드롭다운 모달 가젯 패널
// =========================================================================
const HeaderFilterDrawer = ({ columnKey, tableContext, title }) => {
  const {
    sortConfig,
    toggleSort,
    filters,
    handleFilterSelect,
    clearFilter,
    getUniqueValues,
    dropdownRef
  } = tableContext;

  const uniqueOptions = getUniqueValues(columnKey);
  const currentActiveFilters = filters[columnKey] || [];

  return (
      <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1.5 w-[210px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 text-left font-sans font-medium text-[#333333]"
      >
        <div className="space-y-1 pb-2 border-b border-gray-100 text-[11px]">
          <button
              onClick={() => toggleSort(columnKey)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 ${sortConfig.field === columnKey && sortConfig.direction === 'asc' ? 'bg-blue-50 font-black text-[#007AFF]' : ''}`}
          >
            <ArrowUp size={11} /> 오름차순 정렬
          </button>
          <button
              onClick={() => toggleSort(columnKey)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 ${sortConfig.field === columnKey && sortConfig.direction === 'desc' ? 'bg-blue-50 font-black text-[#007AFF]' : ''}`}
          >
            <ArrowDown size={11} /> 내림차순 정렬
          </button>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{title}</span>
            {currentActiveFilters.length > 0 && (
                <button onClick={() => clearFilter(columnKey)} className="text-[9px] font-black text-red-500 hover:underline">초기화</button>
            )}
          </div>
          <div className="max-h-[140px] overflow-y-auto space-y-0.5 pr-1 text-[11px]">
            {uniqueOptions.length === 0 ? (
                <span className="text-gray-300 block px-2 py-1 text-[10px]">지정 가능한 상태 없음</span>
            ) : (
                uniqueOptions.map(option => {
                  const isChecked = currentActiveFilters.includes(option);
                  return (
                      <label
                          key={option}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer w-full select-none"
                      >
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleFilterSelect(columnKey, option)}
                            className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-3 h-3"
                        />
                        <span className="truncate flex-1">
                          {columnKey === 'orderStatus' ? (orderStatusConfig[option]?.text || option) : option}
                        </span>
                      </label>
                  );
                })
            )}
          </div>
        </div>
      </div>
  );
};

// =========================================================================
// 3. 내 업체 목록 관리 패널
// =========================================================================
const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', businessNumber: '', email: '' });

  const fetchCompanyList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/companies/me');
      setCompanies(res.data?.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyList();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/companies', formData);
      message.success("업체 파트너 제휴 신청이 성공적으로 제출되었습니다.");
      setIsCreating(false);
      fetchCompanyList();
    } catch (error) {
      message.error("업체 신청 처리 중 통신 에러가 발생했습니다.");
    }
  };

  return (
      <div className="space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-base font-black text-[#333333]">제휴 파트너 업체 목록</h3>
          {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="px-4 py-2 bg-[#333333] text-white text-xs font-bold rounded-xl hover:bg-black transition-all">
                + 새 업체 등록
              </button>
          )}
        </div>

        {isCreating ? (
            <form onSubmit={handleCreateCompany} className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 space-y-4 max-w-xl animate-in fade-in duration-150">
              <h4 className="text-sm font-black text-slate-800">TripMate 비즈니스 파트너 정보 등록</h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 px-0.5">상호명 / 업체명 *</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="border border-gray-200 rounded-xl py-2.5 px-4 w-full text-xs font-bold text-[#333333] focus:border-[#007AFF] outline-none" placeholder="예: (주)트립가이드 재팬" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 px-0.5">사업자 등록번호 *</label>
                  <input required value={formData.businessNumber} onChange={e => setFormData({ ...formData, businessNumber: e.target.value })} className="border border-gray-200 rounded-xl py-2.5 px-4 w-full text-xs font-bold font-mono text-[#333333] focus:border-[#007AFF] outline-none" placeholder="000-00-00000" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 px-0.5">대표 정산 이메일 *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border border-gray-200 rounded-xl py-2.5 px-4 w-full text-xs font-bold text-[#333333] focus:border-[#007AFF] outline-none" placeholder="partner@company.com" />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-50 justify-end">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">취소</button>
                <button type="submit" className="px-5 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-black shadow-sm hover:bg-blue-600">등록 신청 제출</button>
              </div>
            </form>
        ) : loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#007AFF]" size={20} /></div>
        ) : companies.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-[20px] text-gray-400 text-xs font-bold">
              등록 완료 승인된 제휴 업체 비즈니스 카드가 존재하지 않습니다.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {companies.map((comp) => (
                  <div key={comp.id} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-4 hover:border-slate-400 transition-all shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-lg">🏢</div>
                        <div>
                          <h4 className="text-xs font-black text-[#333333]">{comp.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{comp.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          comp.status === 'APPROVED' ? 'bg-blue-50 text-[#007AFF]' : 'bg-amber-50 text-amber-600'
                      }`}>
                  {comp.status === 'APPROVED' ? '파트너 승인완료' : '검토 심사중'}
                </span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-gray-400 bg-slate-50 p-2 rounded-lg border border-slate-100/60">
                      사업자번호: {comp.businessNumber}
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

// =========================================================================
// 4. 미니멀 프로필 사이드바 파트
// =========================================================================
const MyPageSidebar = ({ userData }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData?.name || 'user')}&backgroundColor=f3f4f6`;
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.endsWith(path);
  const isSeller = userData?.role === 'SELLER';

  const handleLogout = async () => {
    await clearTokens();
    message.success("로그아웃되었습니다.");
    navigate('/');
    window.location.reload();
  };

  return (
      <aside className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
        <section className="p-5 bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm flex flex-col items-center">
          <div className="relative mb-3">
            <img className="w-16 h-16 rounded-full object-cover border border-gray-50 bg-gray-50" src={avatarUrl} alt="" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#007AFF] rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-sm">✓</div>
          </div>
          <h2 className="text-sm font-black text-[#222222] tracking-tight">{userData?.name || '사용자'}</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate max-w-full px-1">{userData?.email}</p>
          <span className="mt-2.5 px-2.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-wider">
          {userData?.role || '일반 회원'}
        </span>
        </section>

        <nav className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-1.5 flex flex-col gap-0.5">
          <Link to="/profile/host" className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${isActive('host') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-slate-50'}`}>
            <CalendarDays size={15} className={isActive('host') ? 'text-[#007AFF]' : 'text-gray-400'} />
            <span>일정 및 호스트 관리</span>
          </Link>

          {/* 💡 [사이드바 링크 추가] 주문 및 결제 내역 라우터 링크 */}
          <Link to="/profile/orders" className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${isActive('orders') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-slate-50'}`}>
            <ShoppingBag size={15} className={isActive('orders') ? 'text-[#007AFF]' : 'text-gray-400'} />
            <span>주문 및 결제 내역</span>
          </Link>

          {isSeller && (
              <Link to="/profile/company" className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${isActive('company') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-slate-50'}`}>
                <Building2 size={15} className={isActive('company') ? 'text-[#007AFF]' : 'text-gray-400'} />
                <span>내 업체 관리 목록</span>
              </Link>
          )}

          <div className="h-[1px] bg-slate-100 my-1" />

          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50/50 transition-all text-left">
            <LogOut size={15} className="text-red-300" />
            <span>로그아웃</span>
          </button>
        </nav>
      </aside>
  );
};

export const MyPageView = () => {
  const { user } = useProfile();

  return (
      <div className="w-full mx-auto mt-6 flex flex-col lg:flex-row gap-8 mb-12 px-4 font-sans items-stretch min-h-[580px]">
        <MyPageSidebar userData={user} />

        <main className="flex-1 min-w-0 w-full bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-8 shadow-sm">
          <Routes>
            <Route path="/" element={<Outlet />}>
              <Route index element={<Navigate to="host" replace />} />
              <Route path="host" element={<HostManagement />} />
              {/* 💡 [라우트 추가] 주문내역 컴포넌트 맵핑 */}
              <Route path="orders" element={<OrderManagement />} />
              <Route path="company" element={<CompanyManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
  );
};