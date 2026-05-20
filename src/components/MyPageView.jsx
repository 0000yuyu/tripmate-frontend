/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Loader2,
  Check,
  X,
  LogOut,
  SlidersHorizontal,
  FolderOpen,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShoppingBag,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useProfile } from "@hooks/userContext.jsx";
import axiosInstance from "@/utils/axiosInstance";
import { message, Form, Input } from "antd";
import { clearTokens } from "@utils/auth.js";
import CustomModal from "@components/CustomModal.jsx";

// =========================================================================
// [커스텀 훅] 🌐 백엔드 서버 사이드 페이징 API 실시간 연동형 노션 테이블 엔진
// =========================================================================
const useNotionTable = (rawData, defaultPageSize = 5, serverTotalPages = 1, serverTotalCount = 0, onPageChange = () => {}) => {
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const dropdownRef = useRef(null);

  // 외부(컴포넌트)로 현재 페이지와 사이즈 변경 이벤트를 동기화하여 API를 새로 부르게 만듭니다.
  useEffect(() => {
    onPageChange(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 필터나 정렬 기준이 바뀔 때만 첫 페이지(0)로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [filters, sortConfig]);

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

  // 💡 백엔드가 이미 보낸 데이터를 가공(정렬/필터)하되 슬라이싱은 서버가 하므로 우회합니다.
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
    totalCount: serverTotalCount,
    sortConfig,
    filters,
    activeDropdown,
    setActiveDropdown,
    toggleSort,
    handleFilterSelect,
    clearFilter,
    getUniqueValues,
    dropdownRef,
    currentPage,
    setCurrentPage,
    totalPages: serverTotalPages,
    pageSize,
    setPageSize
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

const orderStatusConfig = {
  PENDING: { text: '결제 대기', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  COMPLETED: { text: '결제 완료', className: 'bg-emerald-50 text-[#00C853] border-emerald-100' },
  CANCELLED: { text: '주문 취소', className: 'bg-red-50 text-red-400 border-red-100' },
  REFUNDED: { text: '환불 완료', className: 'bg-gray-100 text-gray-400 border-gray-200' }
};

// =========================================================================
// [공통 컴포넌트] 상단 보기 개수 설정 가젯 컴포넌트
// =========================================================================
const TopViewSizeSelector = ({ tableContext }) => {
  const { pageSize, setPageSize, totalCount } = tableContext;
  return (
      <div className="flex items-center gap-2 text-gray-400 font-medium text-xs select-none">
        <span>보기 세팅:</span>
        <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="py-1 px-1.5 border border-gray-200 rounded-lg bg-white text-[#333333] font-bold focus:outline-none focus:ring-1 focus:ring-[#007AFF] cursor-pointer"
        >
          <option value={2}>2개씩 보기</option>
          <option value={4}>4개씩 보기</option>
          <option value={5}>5개씩 보기</option>
          <option value={10}>10개씩 보기</option>
          <option value={20}>20개씩 보기</option>
          <option value={50}>50개씩 보기</option>
        </select>
        <span className="font-bold text-[#333333] ml-1">총 {totalCount}건</span>
      </div>
  );
};

// =========================================================================
// 1. 일정 / 호스트 명세 관리 패널
// =========================================================================
const HostManagement = () => {
  const [subTab, setSubTab] = useState('hosting');
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 });

  // 💡 현재 페이지와 규격을 추적하여 쿼리에 자동 연동하기 위한 내부 기동 상태
  const [queryState, setQueryState] = useState({ page: 0, size: 5 });

  const fetchTableData = async (targetPage = queryState.page, targetSize = queryState.size) => {
    setLoading(true);
    try {
      const url = subTab === 'hosting'
          ? `/plans/participations/received-requests?page=${targetPage}&size=${targetSize}`
          : `/plans/participations/my-requests?page=${targetPage}&size=${targetSize}`;

      const res = await axiosInstance.get(url);
      const contentList = res.data?.data?.content || res.data?.data || [];

      setPageMeta({
        totalPages: res.data?.data?.totalPages || 1,
        totalElements: res.data?.data?.totalElements !== undefined ? res.data.data.totalElements : contentList.length
      });

      if (subTab === 'hosting') {
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
      console.error(e);
      setRawData([]);
      setPageMeta({ totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 탭 변환 제어
  useEffect(() => {
    fetchTableData(0, queryState.size);
  }, [subTab]);

  // 💡 가젯 조작 감지 시 리턴형 동기 쿼리 전송 파트
  const table = useNotionTable(rawData, 5, pageMeta.totalPages, pageMeta.totalElements, (p, s) => {
    setQueryState({ page: p, size: s });
    fetchTableData(p, s);
  });

  const handleAction = async (planId, unitPlanId, participationId, actionType) => {
    try {
      await axiosInstance.patch(`/plans/${planId}/unit-plans/${unitPlanId}/participations/${participationId}/status`, {
        status: actionType
      });
      message.success(`신청 건에 대해 ${actionType === 'APPROVED' ? '수락' : '거절'} 처리가 완료되었습니다.`);
      fetchTableData(table.currentPage, table.pageSize);
    } catch (e) {
      message.error("요청 처리 조작 중 예외가 발생했습니다.");
    }
  };

  return (
      <div className="space-y-4 animate-in fade-in duration-200 text-left h-full flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">

          <div className="flex flex-row items-center justify-between gap-2 shrink-0">
            <div className="flex bg-[#F3F4F6] p-1 rounded-xl max-w-[300px] flex-1">
              <button onClick={() => setSubTab('hosting')} className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'hosting' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}>호스트 권한 관리 (수신)</button>
              <button onClick={() => setSubTab('applied')} className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'applied' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}>내가 참여한 일정 (발신)</button>
            </div>
            {rawData.length > 0 && <TopViewSizeSelector tableContext={table} />}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 shrink-0">
            <span className="font-semibold flex items-center gap-1"><SlidersHorizontal size={11}/> 헤더를 클릭해 개별 필터링을 조작하세요.</span>
          </div>

          {loading ? (
              <div className="flex justify-center py-20 flex-1 items-center"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
          ) : table.processedData.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2 bg-white flex-1 justify-center">
                <FolderOpen size={24} className="opacity-30" /> 정리된 실시간 명세 항목이 존재하지 않습니다.
              </div>
          ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-auto relative flex-1 min-h-0 scrollbar-hide">
                <table className="w-full text-left text-xs min-w-[850px] table-fixed">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold select-none sticky top-0 z-10">
                  {subTab === 'hosting' ? (
                      <tr>
                        <th className="px-4 py-3 w-12 text-center bg-[#F9FAFB]">#</th>
                        <th className="px-4 py-3 relative overflow-visible w-1/4 bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'planTitle' ? null : 'planTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>플랜 이름</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'planTitle' && <HeaderFilterDrawer columnKey="planTitle" tableContext={table} title="플랜 필터" />}
                        </th>
                        <th className="px-4 py-3 relative overflow-visible w-1/4 bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'unitTitle' ? null : 'unitTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>연동 유닛 일정</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'unitTitle' && <HeaderFilterDrawer columnKey="unitTitle" tableContext={table} title="유닛 코스 필터" />}
                        </th>
                        <th className="px-4 py-3 relative overflow-visible w-1/5 bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'applicantName' ? null : 'applicantName')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>이용자 목록</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'applicantName' && <HeaderFilterDrawer columnKey="applicantName" tableContext={table} title="이용자 검색" />}
                        </th>
                        <th className="px-4 py-3 relative overflow-visible w-28 text-center bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'participationStatus' ? null : 'participationStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>승인 상태</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'participationStatus' && <HeaderFilterDrawer columnKey="participationStatus" tableContext={table} title="상태 분기" />}
                        </th>
                        <th className="px-4 py-3 text-center w-28 bg-[#F9FAFB]">액션 조작</th>
                      </tr>
                  ) : (
                      <tr>
                        <th className="px-4 py-3 w-12 text-center bg-[#F9FAFB]">#</th>
                        <th className="px-4 py-3 relative overflow-visible w-1/3 bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'planTitle' ? null : 'planTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>참여 플랜 명세</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'planTitle' && <HeaderFilterDrawer columnKey="planTitle" tableContext={table} title="플랜 필터" />}
                        </th>
                        <th className="px-4 py-3 relative overflow-visible w-1/3 bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'unitTitle' ? null : 'unitTitle')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>매핑 유닛 상세</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'unitTitle' && <HeaderFilterDrawer columnKey="unitTitle" tableContext={table} title="유닛 코스 필터" />}
                        </th>
                        <th className="px-4 py-3 relative overflow-visible w-32 text-center bg-[#F9FAFB]">
                          <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'participationStatus' ? null : 'participationStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>내 상태</span> <ChevronDown size={12}/></div>
                          {table.activeDropdown === 'participationStatus' && <HeaderFilterDrawer columnKey="participationStatus" tableContext={table} title="상태 분기" />}
                        </th>
                        <th className="px-4 py-3 text-center w-24 bg-[#F9FAFB]">링크 이동</th>
                      </tr>
                  )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#333333] font-medium">
                  {table.processedData.map((item, index) => (
                      <tr key={item.participationId || index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-gray-400">{table.currentPage * table.pageSize + index + 1}</td>
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
                                      <button onClick={() => handleAction(item.planId, item.planUnitId, item.participationId, 'APPROVED')} className="p-1 bg-[#007AFF] text-white rounded hover:bg-blue-600 transition-colors" title="수락하기"><Check size={11} strokeWidth={3} /></button>
                                      <button onClick={() => handleAction(item.planId, item.planUnitId, item.participationId, 'REJECTED')} className="p-1 bg-white border border-slate-200 text-gray-400 rounded hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors" title="거절하기"><X size={11} strokeWidth={3} /></button>
                                    </div>
                                ) : <span className="text-[11px] text-gray-300 font-bold">-</span>}
                              </td>
                            </>
                        ) : (
                            <>
                              <td className="px-4 py-3.5 font-black text-slate-800 truncate">{item.planTitle}</td>
                              <td className="px-4 py-3.5 text-slate-500 truncate">{item.unitTitle}</td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.participationStatus === 'APPROVED' ? 'bg-blue-50 text-[#007AFF]' : 'bg-amber-50 text-amber-600'}`}>{item.participationStatus}</span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <Link to={`/plans/${item.planId || 'view'}`} className="inline-flex items-center justify-center gap-1 text-[11px] font-bold text-[#007AFF] hover:underline"><span>이동</span><ExternalLink size={10} /></Link>
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
        {rawData.length > 0 && (
            <div className="pt-2 border-t border-slate-50 shrink-0">
              <PaginationBar tableContext={table} />
            </div>
        )}
      </div>
  );
};

// =========================================================================
// 2. 주문 결제 내역 명세 보드 패널
// =========================================================================
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderMeta, setOrderMeta] = useState({ totalPages: 1, totalElements: 0 });
  const [queryState, setQueryState] = useState({ page: 0, size: 5 });

  // 💡 GET 요청 시 page, size 쿼리 스트링 바인딩 처리
  const fetchOrders = async (targetPage = queryState.page, targetSize = queryState.size) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/orders?page=${targetPage}&size=${targetSize}`);
      const contentList = res.data?.data?.content || res.data?.data || [];
      setOrders(contentList);

      setOrderMeta({
        totalPages: res.data?.data?.totalPages || 1,
        totalElements: res.data?.data?.totalElements !== undefined ? res.data.data.totalElements : contentList.length
      });
    } catch (e) {
      console.error(e);
      setOrders([]);
      setOrderMeta({ totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 💡 변경 트리거 수신 시 API 재수집 발동
  const table = useNotionTable(orders, 5, orderMeta.totalPages, orderMeta.totalElements, (p, s) => {
    setQueryState({ page: p, size: s });
    fetchOrders(p, s);
  });

  const formatCurrency = (value) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);

  return (
      <div className="space-y-4 animate-in fade-in duration-200 text-left h-full flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">

          <div className="border-b border-gray-100 pb-3 flex items-center justify-between gap-4 shrink-0">
            <h3 className="text-base font-black text-[#333333]">주문 및 결제 확인 명세</h3>
            {orders.length > 0 && <TopViewSizeSelector tableContext={table} />}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 shrink-0">
            <span className="font-semibold flex items-center gap-1"><SlidersHorizontal size={12}/> 헤더 필드를 클릭해 정렬 및 예약 필터를 구성하세요.</span>
          </div>

          {loading ? (
              <div className="flex justify-center py-20 flex-1 items-center"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
          ) : table.processedData.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2 bg-white flex-1 justify-center">
                <ShoppingBag size={24} className="opacity-30" /> 결제 혹은 예약 처리 완료된 주문 내역서가 없습니다.
              </div>
          ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-auto relative flex-1 min-h-0 scrollbar-hide">
                <table className="w-full text-left text-xs min-w-[900px] table-fixed">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold select-none sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center bg-[#F9FAFB]">#</th>
                    <th className="px-4 py-3 relative overflow-visible w-1/3 bg-[#F9FAFB]">
                      <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'productName' ? null : 'productName')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>상품 및 투어 코스명</span> <ChevronDown size={12}/></div>
                      {table.activeDropdown === 'productName' && <HeaderFilterDrawer columnKey="productName" tableContext={table} title="상품 필터" />}
                    </th>
                    <th className="px-4 py-3 relative overflow-visible w-28 text-center bg-[#F9FAFB]">
                      <div onClick={() => table.setActiveDropdown(table.experienceDate === 'experienceDate' ? null : 'experienceDate')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>예약 체험일</span> <ChevronDown size={12}/></div>
                      {table.experienceDate === 'experienceDate' && <HeaderFilterDrawer columnKey="experienceDate" tableContext={table} title="날짜 필터" />}
                    </th>
                    <th className="px-4 py-3 relative overflow-visible w-20 text-center bg-[#F9FAFB]">
                      <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'totalQuantity' ? null : 'totalQuantity')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>인원/수량</span> <ChevronDown size={12}/></div>
                      {table.activeDropdown === 'totalQuantity' && <HeaderFilterDrawer columnKey="totalQuantity" tableContext={table} title="수량 필터" />}
                    </th>
                    <th className="px-4 py-3 relative overflow-visible w-32 text-right pr-6 bg-[#F9FAFB]">
                      <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'totalPrice' ? null : 'totalPrice')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors justify-end gap-1"><span>결제 총액</span> <ChevronDown size={12}/></div>
                      {table.activeDropdown === 'totalPrice' && <HeaderFilterDrawer columnKey="totalPrice" tableContext={table} title="결제액 필터" />}
                    </th>
                    <th className="px-4 py-3 relative overflow-visible w-28 text-center bg-[#F9FAFB]">
                      <div onClick={() => table.setActiveDropdown(table.activeDropdown === 'orderStatus' ? null : 'orderStatus')} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"><span>주문 상태</span> <ChevronDown size={12}/></div>
                      {table.activeDropdown === 'orderStatus' && <HeaderFilterDrawer columnKey="orderStatus" tableContext={table} title="상태 필터" />}
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#333333] font-medium">
                  {table.processedData.map((order, index) => (
                      <tr key={order.orderId || index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-gray-400">{table.currentPage * table.pageSize + index + 1}</td>
                        <td className="px-4 py-3.5 font-black text-slate-800 truncate">
                          <div className="flex flex-col gap-0.5">
                            <span>{order.productName}</span>
                            <span className="text-[10px] font-mono text-gray-300 font-normal tracking-tight">{order.orderId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-slate-500">{order.experienceDate}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-600">{order.totalQuantity}개</td>
                        <td className="px-4 py-3.5 text-right pr-6 font-mono font-black text-slate-900">{formatCurrency(order.totalPrice)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${orderStatusConfig[order.orderStatus]?.className || 'bg-gray-50 text-gray-500 border-gray-100'}`}>{orderStatusConfig[order.orderStatus]?.text || order.orderStatus}</span>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
        {orders.length > 0 && (
            <div className="pt-2 border-t border-slate-50 shrink-0">
              <PaginationBar tableContext={table} />
            </div>
        )}
      </div>
  );
};

// =========================================================================
// [공통 하위 레이어] 노션 스타일 헤더 드롭다운 모달 가젯 패널
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
            {uniqueOptions.length === 0 ? <span className="text-gray-300 block px-2 py-1 text-[10px]">지정 가능한 상태 없음</span> : (
                uniqueOptions.map(option => {
                  const isChecked = currentActiveFilters.includes(option);
                  return (
                      <label key={option} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50 cursor-pointer w-full select-none">
                        <input type="checkbox" checked={isChecked} onChange={() => handleFilterSelect(columnKey, option)} className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-3 h-3" />
                        <span className="truncate flex-1">{columnKey === 'orderStatus' ? (orderStatusConfig[option]?.text || option) : option}</span>
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
// [공통 하위 레이어] UI는 1-indexed / 데이터는 0-indexed로 싱크 맞춘 하단 버튼 바
// =========================================================================
const PaginationBar = ({ tableContext }) => {
  const { currentPage, setCurrentPage, totalPages } = tableContext;

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 0; i < totalPages; i++) {
      nums.push(i);
    }
    return nums;
  }, [totalPages]);

  return (
      <div className="flex flex-row items-center justify-between pt-3 px-1 text-xs select-none shrink-0 bg-white">
        <div className="text-gray-400 font-medium">
          현재 페이지 <span className="text-gray-700 font-bold">{currentPage + 1}</span> / {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="flex items-center gap-0.5">
            {pageNumbers.map(num => (
                <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                        currentPage === num
                            ? "bg-[#007AFF] text-white shadow-sm"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  {num + 1}
                </button>
            ))}
          </div>

          <button
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
  );
};

// =========================================================================
// 3. 내 업체 목록 관리 패널
// =========================================================================
const CompanyManagement = () => {
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyMeta, setCompanyMeta] = useState({ totalPages: 1, totalElements: 0 });
  const [queryState, setQueryState] = useState({ page: 0, size: 4 });

  // 💡 GET 요청 시 page, size 쿼리 스트링 바인딩 처리
  const fetchCompanyList = async (targetPage = queryState.page, targetSize = queryState.size) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/companies?page=${targetPage}&size=${targetSize}`);
      const contentList = res.data?.data?.content || res.data?.data || [];
      setCompanies(contentList);

      setCompanyMeta({
        totalPages: res.data?.data?.totalPages || 1,
        totalElements: res.data?.data?.totalElements !== undefined ? res.data.data.totalElements : contentList.length
      });
    } catch (e) {
      console.error(e);
      setCompanyMeta({ totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 💡 가젯 제어 싱크 연동
  const table = useNotionTable(companies, 4, companyMeta.totalPages, companyMeta.totalElements, (p, s) => {
    setQueryState({ page: p, size: s });
    fetchCompanyList(p, s);
  });

  const handleCreateCompanySubmit = async (values) => {
    setModalLoading(true);
    try {
      const response = await axiosInstance.post('/companies', values);
      if (response.data?.success || response.status === 200) {
        message.success("업체 파트너 제휴 신청이 성공적으로 제출되었습니다.");
        setIsModalOpen(false);
        form.resetFields();
        fetchCompanyList(table.currentPage, table.pageSize);
      }
    } catch (error) {
      console.error(error);
      message.error("업체 신청 처리 중 시스템 오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
      <div className="w-full h-full flex flex-col text-left overflow-hidden">

        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-[#333333]">제휴 파트너 업체 목록</h3>
            {companies.length > 0 && <TopViewSizeSelector tableContext={table} />}
          </div>
          <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#333333] text-white text-xs font-bold rounded-xl hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={13} strokeWidth={2.5} /> 새 업체 등록
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto py-4 scrollbar-hide">
          {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#007AFF]" size={20} /></div>
          ) : table.processedData.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-[20px] text-gray-400 text-xs font-bold bg-white">
                등록 완료 승인된 제휴 업체 비즈니스 카드가 존재하지 않습니다.
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {table.processedData.map((comp) => (
                    <Link to={`/companies/${comp.id}`} key={comp.id} className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-4 hover:border-slate-400 transition-all shadow-sm flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-lg shrink-0">🏢</div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-[#333333] truncate">{comp.name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">{comp.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                              comp.status === 'ACTIVE' ? 'bg-blue-50 text-[#007AFF]' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {comp.status === 'ACTIVE' ? '승인완료' : '검토 심사중'}
                          </span>
                        </div>
                        {comp.description && (
                            <p className="text-[11px] text-gray-500 font-medium line-clamp-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100/60 leading-relaxed">
                              {comp.description}
                            </p>
                        )}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-gray-400 bg-slate-50 p-2 rounded-lg border border-slate-100/60 truncate select-all">
                        사업자번호: {comp.businessNumber}
                      </div>
                    </Link>
                ))}
              </div>
          )}
        </div>

        {companies.length > 0 && (
            <div className="pt-3 border-t border-slate-100 shrink-0 bg-white">
              <PaginationBar tableContext={table} />
            </div>
        )}

        <CustomModal
            isOpen={isModalOpen}
            onClose={() => {
              if (!modalLoading) {
                setIsModalOpen(false);
                form.resetFields();
              }
            }}
            title="TripMate 비즈니스 파트너 등록 신청"
            maxWidth="max-w-[440px]"
            buttons={
              <div className="flex gap-2 w-full">
                <button
                    type="button"
                    disabled={modalLoading}
                    onClick={() => { setIsModalOpen(false); form.resetFields(); }}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-[14px] text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                    type="button"
                    disabled={modalLoading}
                    onClick={() => form.submit()}
                    className="flex-[2] py-3 bg-blue-600 text-white rounded-[14px] text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {modalLoading && <Loader2 size={12} className="animate-spin" />}
                  등록 신청 제출
                </button>
              </div>
            }
        >
          <Form form={form} layout="vertical" onFinish={handleCreateCompanySubmit} requiredMark={false} className="space-y-1">
            <Form.Item name="name" label={<span className="text-xs font-black text-slate-700">상호명 / 업체명</span>} rules={[{ required: true, message: '상호명(업체명)을 필수 입력하세요.' }]}>
              <Input placeholder="예: (주)상호명" className="py-2.5 rounded-[12px] text-xs font-medium bg-gray-50" />
            </Form.Item>
            <Form.Item name="description" label={<span className="text-xs font-black text-slate-700">업체 서비스 상세 설명</span>} rules={[{ required: true, message: '운영하시는 서비스 및 업체 소개를 필수 입력하세요.' }]}>
              <Input.TextArea placeholder="예: 시부야 지역의 엑티비티 및 공연 예약 티켓 서비스를 총괄 공급하는 전문 파트너사입니다." rows={3} className="rounded-[12px] text-xs font-medium bg-gray-50" />
            </Form.Item>
            <Form.Item name="businessNumber" label={<span className="text-xs font-black text-slate-700">사업자 등록번호</span>} rules={[{ required: true, message: '사업자 등록 번호를 필수 입력하세요.' }]}>
              <Input placeholder="예: JP-13-6612849" className="py-2.5 rounded-[12px] text-xs font-mono font-medium bg-gray-50" />
            </Form.Item>
            <Form.Item name="email" label={<span className="text-xs font-black text-slate-700">대표 정산 이메일</span>} rules={[{ required: true, message: '이메일 주소를 입력하세요.' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }]}>
              <Input placeholder="company@domain.com" className="py-2.5 rounded-[12px] text-xs font-medium bg-gray-50" />
            </Form.Item>
            <Form.Item name="phone" label={<span className="text-xs font-black text-slate-700">대표 전화번호</span>} rules={[{ required: true, message: '대표 연락처를 필수 입력하세요.' }]}>
              <Input placeholder="예: +81-3-5489-2210" className="py-2.5 rounded-[12px] text-xs font-medium bg-gray-50" />
            </Form.Item>
          </Form>
        </CustomModal>
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
      <div className="w-full mt-6 flex flex-col lg:flex-row gap-8 mb-12 px-4 font-sans items-stretch min-h-[580px] h-[calc(100vh-160px)]">
        <MyPageSidebar userData={user} />

        <main className="flex-1 min-w-0 w-full bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-8 shadow-sm flex flex-col justify-between overflow-hidden">
          <Routes>
            <Route path="/" element={<Outlet />}>
              <Route index element={<Navigate to="host" replace />} />
              <Route path="host" element={<HostManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="company" element={<CompanyManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
  );
};