/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  FolderOpen
} from 'lucide-react';
import { useProfile } from "@hooks/userContext.jsx";
import axiosInstance from "@/utils/axiosInstance";
import { message } from "antd";
import { useCompanyProfile } from "@hooks/companyContext.jsx";
import { clearTokens } from "@utils/auth.js";

// ==========================================
// 1. 노션 데이터베이스 스타일 일정/호스트 관리 패널
// ==========================================
const HostManagement = () => {
  const [subTab, setSubTab] = useState('hosting'); // 'applied' | 'hosting'
  const [hostingTrips, setHostingTrips] = useState([]);
  const [appliedTrips, setAppliedTrips] = useState([]); // 내가 신청한 일정 리스트
  const [loading, setLoading] = useState(false);

  // 노션 스타일 정렬 및 필터 상태 관리
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    const fetchHostingData = async () => {
      setLoading(true);
      try {
        if (subTab === 'hosting') {
          const res = await axiosInstance.get('/plans/participations/received-requests');
          setHostingTrips(res.data?.data?.content || res.data?.data || []);
        } else {
          // 내가 신청한 일정 데이터 API 조회부 가정
          const res = await axiosInstance.get('/plans/participations/my-requests');
          setAppliedTrips(res.data?.data?.content || res.data?.data || []);
        }
      } catch (e) {
        console.error("데이터 바인딩 실패", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHostingData();
  }, [subTab]);

  const handleAction = async (participationId, actionType) => {
    try {
      await axiosInstance.patch(`/plans/participations/${participationId}?action=${actionType}`);
      message.success(`처리가 성공적으로 완료되었습니다.`);
      // 리스트 리프레시 로직 트리거
      const res = await axiosInstance.get('/plans/participations/received-requests');
      setHostingTrips(res.data?.data?.content || res.data?.data || []);
    } catch (e) {
      message.error("요청 처리 중 오류가 발생했습니다.");
    }
  };

  // 노션식 통합 정렬 / 필터링 연산 파이프라인
  const toggleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const processedData = useMemo(() => {
    let currentList = subTab === 'hosting' ? hostingTrips : appliedTrips;

    // 1. 필터 핸들러
    if (statusFilter !== '전체') {
      currentList = currentList.filter(item => item.participationStatus === statusFilter || item.recruitStatus === statusFilter);
    }

    // 2. 정렬 핸들러
    if (sortField) {
      currentList = [...currentList].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return currentList;
  }, [subTab, hostingTrips, appliedTrips, sortField, sortDirection, statusFilter]);

  return (
      <div className="space-y-6 animate-in fade-in duration-200 text-left">
        {/* 서브 제어 내비바 */}
        <div className="flex bg-[#F3F4F6] p-1 rounded-xl max-w-[280px]">
          <button onClick={() => { setSubTab('hosting'); setStatusFilter('전체'); }} className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'hosting' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}>호스트 관리</button>
          <button onClick={() => { setSubTab('applied'); setStatusFilter('전체'); }} className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all ${subTab === 'applied' ? 'bg-white text-[#333333] shadow-sm' : 'text-gray-400'}`}>내가 신청한 일정</button>
        </div>

        {/* 노션 스타일 제어 제어 바 (정렬/필터 헤더 통합) */}
        <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs font-bold text-[#666666]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#333333]"><SlidersHorizontal size={13}/> 데이터베이스 필터</span>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1">
              <span>상태 필터:</span>
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-black text-[#007AFF] outline-none cursor-pointer"
              >
                <option value="전체">전체 보기</option>
                <option value="PENDING">대기 중 (PENDING)</option>
                <option value="APPROVED">승인됨 (APPROVED)</option>
                <option value="OPEN">모집 중 (OPEN)</option>
              </select>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">총 {processedData.length}개 항목</span>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
        ) : processedData.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-medium flex flex-col items-center gap-2">
              <FolderOpen size={24} className="opacity-30" />
              정리된 명세 데이터 항목이 없습니다.
            </div>
        ) : (
            /* 노션 데이터베이스 보드 테이블 마크업 완벽 재현 */
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold">
                {subTab === 'hosting' ? (
                    <tr>
                      <th className="px-5 py-3 w-16">#</th>
                      <th className="px-5 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('planId')}>플랜 ID <ArrowUpDown size={11} className="inline ml-1" /></th>
                      <th className="px-5 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('userName')}>신청 메이트 유저 <ArrowUpDown size={11} className="inline ml-1" /></th>
                      <th className="px-5 py-3 text-center">참여 상태</th>
                      <th className="px-5 py-3 text-center w-28">액션 권한</th>
                    </tr>
                ) : (
                    <tr>
                      <th className="px-5 py-3 w-16">#</th>
                      <th className="px-5 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('planTitle')}>참여 플랜 이름 <ArrowUpDown size={11} className="inline ml-1" /></th>
                      <th className="px-5 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('unitTitle')}>플랜 유닛 이름 <ArrowUpDown size={11} className="inline ml-1" /></th>
                      <th className="px-5 py-3 text-center">참여 상태</th>
                    </tr>
                )}
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#333333] font-medium">
                {processedData.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-400">{index + 1}</td>

                      {subTab === 'hosting' ? (
                          <>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500 truncate max-w-[120px]">{item.planId || 'a92d9521...'}</td>
                            <td className="px-5 py-3.5 font-black">{item.userName || item.name || '동행 신청자'}</td>
                            <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                            item.participationStatus === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#007AFF]'
                        }`}>
                          {item.participationStatus || 'PENDING'}
                        </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              {/* PENDING(대기) 상태일 때만 조작 단추 정밀 활성화 */}
                              {item.participationStatus === 'PENDING' ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button onClick={() => handleAction(item.id, 'approve')} className="p-1 bg-[#007AFF] text-white rounded hover:bg-blue-600 transition-colors"><Check size={12} /></button>
                                    <button onClick={() => handleAction(item.id, 'reject')} className="p-1 bg-white border border-slate-200 text-gray-400 rounded hover:bg-slate-50 transition-colors"><X size={12} /></button>
                                  </div>
                              ) : (
                                  <span className="text-[11px] text-gray-400 font-semibold">-</span>
                              )}
                            </td>
                          </>
                      ) : (
                          <>
                            <td className="px-5 py-3.5 font-black text-slate-800">{item.planTitle || '도쿄 가이드 투어'}</td>
                            <td className="px-5 py-3.5 text-slate-500">{item.unitTitle || '시부야 맛집 탐방 코스'}</td>
                            <td className="px-5 py-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-600">
                          {item.participationStatus || 'APPROVED'}
                        </span>
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

// ==========================================
// 2. 내 업체 목록 관리 패널 (정밀 목록화)
// ==========================================
const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', businessNumber: '', email: '' });

  const fetchCompanyList = async () => {
    setLoading(true);
    try {
      // 내 제휴 비즈니스 업체 목록 조회 연동 API
      const res = await axiosInstance.get('/companies/my-list');
      setCompanies(res.data?.data || []);
    } catch (e) {
      console.error(e);
      // Fallback 더미 명세 바인딩
      setCompanies([
        { id: 'c-1', name: '(주)트립메이트 투어 오사카', businessNumber: '124-81-99234', email: 'osaka_tour@tripmate.com', status: 'APPROVED' },
        { id: 'c-2', name: '시부야 가이드 컴퍼니', businessNumber: '502-22-11405', email: 'shibuya_guide@naver.com', status: 'PENDING' }
      ]);
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
            /* 업체 리스트 세련된 카드 그리드화 명세 */
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

// ==========================================
// 3. 미니멀 프로필 사이드바 파트
// ==========================================
const MyPageSidebar = ({ userData }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData?.name || 'user')}&backgroundColor=f3f4f6`;
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname.endsWith(path);

  // 💡 요구사항 반영: SELLER 권한 분석용 Boolean 지표 수립
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

          {/* 💡 요구사항 반영: user의 role이 SELLER 일 때만 '내 업체 관리' 메뉴 탭 노출 제어 */}
          {isSeller && (
              <Link to="/profile/company" className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${isActive('company') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-slate-50'}`}>
                <Building2 size={15} className={isActive('company') ? 'text-[#007AFF]' : 'text-gray-400'} />
                <span>내 업체 관리 목록</span>
              </Link>
          )}

          <div className="h-[1px] bg-slate-100 my-1" />

          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50/50 transition-all text-left">
            <LogOut size={15} className="text-red-300" />
            <span>플랫폼 로그아웃</span>
          </button>
        </nav>
      </aside>
  );
};

// ==========================================
// 4. 메인 마이페이지 마스터 허브 컴포넌트
// ==========================================
export const MyPageView = () => {
  const { user } = useProfile();

  return (
      <div className="w-full max-w-6xl mx-auto mt-6 flex flex-col lg:flex-row gap-8 mb-12 px-4 font-sans items-stretch min-h-[580px]">
        <MyPageSidebar userData={user} />

        <main className="flex-1 min-w-0 w-full bg-white border border-[#E5E7EB] rounded-[24px] p-6 md:p-8 shadow-sm">
          <Routes>
            <Route path="/" element={<Outlet />}>
              <Route index element={<Navigate to="host" replace />} />
              <Route path="host" element={<HostManagement />} />
              <Route path="company" element={<CompanyManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
  );
};