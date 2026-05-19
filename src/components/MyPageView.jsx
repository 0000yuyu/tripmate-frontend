

import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import {
  User,
  Building2,
  CalendarDays,
  Loader2,
  Check,
  X,
  ClipboardList,
} from 'lucide-react';
import { useProfile } from "@hooks/userContext.jsx";
import axiosInstance from "@/utils/axiosInstance";
import {message} from "antd";
import {useCompanyProfile} from "@hooks/companyContext.jsx";

const HostManagement = () => {
  const [subTab, setSubTab] = useState('hosting');
  const [hostingTrips, setHostingTrips] = useState([]); // 💡 백엔드 데이터를 담을 상태
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHostingTrips = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/plans/participations/received-requests');
        console.log(res);
        setHostingTrips(res.data?.data?.content || []);
      } catch (e) {
        console.error("일정 목록을 가져오는데 실패했습니다.", e);
      } finally {
        setLoading(false);
      }
    };

    if (subTab === 'hosting') {
      fetchHostingTrips();
    }
  }, [subTab]);

  // 모집 상태 한글 바인딩 맵
  const statusMap = {
    OPEN: { text: "모집 중", className: "bg-[#E6FFF2] text-[#00C853]" },
    CLOSE: { text: "모집 마감", className: "bg-gray-100 text-gray-500" }
  };

  return (
      <section className="bg-white rounded-[28px] border border-gray-100 p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.03)] animate-in fade-in duration-200 min-h-[530px] text-left">
        {/* 상단 탭 스위처 */}
        <div className="flex bg-gray-50 p-1 rounded-xl mb-6 max-w-[340px]">
          <button onClick={() => setSubTab('applied')} className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${subTab === 'applied' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-400'}`}>내가 신청한 일정</button>
          <button onClick={() => setSubTab('hosting')} className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${subTab === 'hosting' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-400'}`}>호스트 관리</button>
        </div>

        {/* 로딩 인디케이터 */}
        {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-[#007AFF]" size={24} />
            </div>
        ) :
            subTab === 'hosting' ? (
            hostingTrips.length === 0 ? (
                // 일정이 없을 때 화면 예외 처리
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 text-xs font-medium">
                  <div className="text-3xl mb-3">📅</div>
                  등록된 가이드 호스팅 일정이 없습니다.
                </div>
            ) : (
                <div className="space-y-6">
                  {hostingTrips.map(trip => {
                    const statusInfo = statusMap[trip.recruitStatus] || { text: trip.recruitStatus, className: "bg-gray-100 text-gray-600" };
                    return (
                        <div key={trip.PlanId} className="border border-gray-200/80 rounded-[24px] p-5 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white">
                          <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                            <div>
                              <h3 className="font-black text-base md:text-lg text-[#222222]">{trip.title}</h3>
                              <p className="text-gray-400 font-bold text-[11px] mt-1.5">{trip.description}</p>
                              <p className="text-xs text-gray-400 font-medium mt-1">
                                📅 {trip.startDate} {trip.startDate !== trip.endDate && `~ ${trip.endDate}`}
                              </p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${statusInfo.className}`}>
                              {statusInfo.text}
                            </span>
                          </div>

                          {/* 참여 메이트/대기 그룹 구역 - 데이터 명세가 고도화되기 전까지 안전하게 방어막 처리(null check) 및 하드코딩 제거 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-slate-50/70 rounded-[20px] p-4 border border-slate-100">
                              <p className="text-[11px] font-bold text-[#007AFF] mb-2 flex items-center gap-1">
                                <ClipboardList size={14} /> 대기 인원 ({(trip.waitlist || []).length})
                              </p>
                              {trip.waitlist && trip.waitlist.length > 0 ? (
                                  trip.waitlist.map(person => (
                                      <div key={person.id} className="flex justify-between items-center bg-white p-3 rounded-xl mb-2 border border-gray-100 shadow-sm">
                                        <div className="flex flex-col"><span className="text-xs font-bold text-gray-700">{person.name}</span></div>
                                        <div className="flex gap-1">
                                          <button className="p-1 bg-[#007AFF] text-white rounded-md"><Check size={12} /></button>
                                          <button className="p-1 bg-white border border-gray-200 text-gray-400 rounded-md"><X size={12} /></button>
                                        </div>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-[10px] text-gray-400 py-4 text-center font-medium">현재 예약 대기 중인 메이트가 없습니다.</p>
                              )}
                            </div>

                            <div className="bg-white border border-gray-200/80 rounded-[20px] p-4">
                              <p className="text-[11px] font-bold text-gray-400 mb-2">
                                확정된 메이트 ({(trip.approved || []).length})
                              </p>
                              {trip.approved && trip.approved.length > 0 ? (
                                  trip.approved.map(person => (
                                      <div key={person.id} className="flex justify-between items-center p-2.5 bg-gray-50/40 rounded-xl mb-1.5">
                                        <span className="text-xs font-bold text-gray-700">{person.name}</span>
                                        <span className="text-[10px] text-[#007AFF] font-bold bg-[#F0F7FF] px-2 py-0.5 rounded-md">확정됨</span>
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-[10px] text-gray-400 py-4 text-center font-medium">확정된 참여 인원이 없습니다.</p>
                              )}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
            )
        ) : (
            <div className="text-center py-16 text-gray-400 text-xs font-medium">내가 신청한 패키지 내역 고도화 구역</div>
        )}
      </section>
  );
};

const CompanyManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', businessNumber: '', email: '', phone: '', description: '' });

  const {company} = useCompanyProfile();
  const handleCreateCompany = (e) => {
    e.preventDefault();
    alert("업체 등록 신청이 완료되었습니다.");
    setCompany({ name: formData.name, email: formData.email });
    setIsCreating(false);
  };

  return (
      <section className="bg-white rounded-[28px] border border-gray-100 p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.02)] animate-in fade-in duration-200 text-left min-h-[530px] flex flex-col justify-between">
        <div className="w-full">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-5 mb-8">
            <span className="bg-[#007AFF] w-1 h-4 rounded-full"></span>
            <h3 className="text-lg font-bold text-[#222222] tracking-tight">내 업체 관리</h3>
          </div>

          {company === null && !isCreating ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-gray-100/50">🏢</div>
                <h2 className="text-base font-bold text-[#222222] mb-1">등록된 업체 정보가 없습니다</h2>
                <p className="text-xs text-gray-400 mb-6">TripMate 비즈니스 파트너 계정을 등록해 보세요.</p>
                <button onClick={() => setIsCreating(true)} className="px-6 py-2.5 bg-[#007AFF] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#0062CC] transition-colors">업체 파트너 등록하기</button>
              </div>
          ) : isCreating ? (
              <form onSubmit={handleCreateCompany} className="w-full max-w-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 ml-1">업체명 *</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="shadow-sm border border-gray-200 rounded-[12px] py-[12px] px-4 w-full text-sm font-bold text-[#333333] focus:outline-none focus:border-[#007AFF] transition" placeholder="상호명 입력" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-500 ml-1">사업자 등록번호 *</label>
                    <input required value={formData.businessNumber} onChange={e => setFormData({ ...formData, businessNumber: e.target.value })} className="shadow-sm border border-gray-200 rounded-[12px] py-[12px] px-4 w-full text-sm font-bold text-[#333333] focus:outline-none focus:border-[#007AFF] transition" placeholder="000-00-00000" />
                  </div>
                </div>
                <div className="flex gap-2 pt-6">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">취소</button>
                  <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-sm">업체 등록 완료</button>
                </div>
              </form>
          ) : (
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 max-w-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#F0F7FF] rounded-2xl flex items-center justify-center text-xl border border-blue-100/30">🏢</div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">{company?.name}</h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{company?.email}</p>
                  </div>
                </div>
              </div>
          )}
        </div>
      </section>
  );
};

const MyPageSidebar = ({ userData }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData.name || i)}&backgroundColor=f3f4f6`;
  const location = useLocation();
  const isActive = (path) => location.pathname.endsWith(path);

  return (
      <aside className="w-full lg:w-72 flex flex-col gap-5 shrink-0">
        <section className="p-6 bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col items-center">
          <div className="relative mb-3.5">
            <img className="w-20 h-20 rounded-full object-cover border border-gray-50 bg-gray-50"
                 src={avatarUrl} alt="프로필 아바타" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#007AFF] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-sm">✓</div>
          </div>
          <h2 className="text-base font-bold text-[#222222] tracking-tight">{userData?.name}</h2>
          <p className="text-[11px] text-gray-400 font-medium mt-1 truncate max-w-full px-2">{userData?.email}</p>
        </section>

        <nav className="bg-white rounded-[28px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden p-2 flex flex-col gap-1">
          <button
              onClick={()=>message.info("프로필 수정 기능을 준비중입니다.")}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all 
          ${isActive('profile-manage') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <User size={16} className={isActive('profile-manage') ? 'text-[#007AFF]' : 'text-gray-400'} />
            <span>내 정보 관리</span>
          </button>
          <Link to="/profile/company" className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all 
          ${isActive('company') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Building2 size={16} className={isActive('company') ? 'text-[#007AFF]' : 'text-gray-400'} />
            <span>내 업체 관리</span>
          </Link>
          <Link to="/profile/host" className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all ${isActive('host') ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <CalendarDays size={16} className={isActive('host') ? 'text-[#007AFF]' : 'text-gray-400'} />
            <span>일정 관리</span>
          </Link>
        </nav>
      </aside>
  );
};

export const MyPageView = () => {

  const {user} = useProfile();


  return (
      <div className="w-full max-w-6xl mx-auto mt-6 flex flex-col lg:flex-row gap-8 mb-12 px-4 font-sans items-stretch">
        <MyPageSidebar userData={user} />
        <main className="flex-1 min-w-0 w-full">
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