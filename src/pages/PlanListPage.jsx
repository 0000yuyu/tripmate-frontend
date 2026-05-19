/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import axiosInstance from "@/utils/axiosInstance.js";

export default function PlanListPage() {
  const [loading, setLoading] = useState(true);
  const [planListData, setPlanListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recruitmentFilter, setRecruitmentFilter] = useState("OPEN");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();

  const recruitmentStatus = [
    { "label": "모집 중", "value": "OPEN" },
    { "label": "모집 완료", "value": "CLOSE" }
  ];

  const participationStatus = [
    { "label": "참여 가능", "value": "AVAILABLE" },
    { "label": "참여 불가", "value": "FULL" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const { RangePicker } = DatePicker;

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/plans");
      const resData = response.data?.data?.content || response.data?.data || [];

      // 서버 데이터가 비어있을 시 기획서 시안 마크업 목데이터 배치
      setPlanListData(resData);
    } catch (e) {
      console.error("데이터 로딩 실패", e);
    } finally {
      setLoading(false);
    }
  }
  const filteredData = planListData.filter((item) => {
    const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = item.recruitStatus === recruitmentFilter;

    let matchesDate = true;
    if (item.startDate && item.endDate) {
      const itemStart = new Date(item.startDate.replace(/\./g, '-'));
      const itemEnd = new Date(item.endDate.replace(/\./g, '-'));

      if (startDate && itemStart < new Date(startDate)) matchesDate = false;
      if (endDate && itemEnd > new Date(endDate)) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
      <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#007AFF',
              borderRadius: 16,
            },
          }}
      >
        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 md:p-10 min-h-[800px] flex flex-col border border-gray-100">

          {/* 1. 상단 타이틀 & 새로운 일정 만들기 버튼 (기획안 규격 일치) */}
          <div className="flex flex-row items-center justify-between mb-8 px-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">함께 떠나는 일정</h2>
            <button
                onClick={() => navigate('/plans/create')}
                className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 px-5 py-2.5 rounded-2xl font-bold hover:bg-gray-50 transition-all text-gray-700 shadow-sm text-xs md:text-sm"
            >
              <Plus size={16} className="text-[#007AFF]" strokeWidth={3} />
              새로운 일정 만들기
            </button>
          </div>

          {/* 2. 기획안 인라인 필터 3종 바 및 가로형 서치 필드 제어바 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-3 relative">
            <div className="flex flex-wrap items-center gap-2">

              {/* 안트디 날짜 가상 래퍼 커스텀 드롭다운 */}
              <div className="relative">
                <button
                    onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                    className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border ${activeDropdown === 'date' ? 'border-[#007AFF] text-[#007AFF]' : 'border-gray-200 text-gray-600'} rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm`}
                >
                  <span>{startDate && endDate ? `${startDate} ~ ${endDate}` : '날짜'}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {activeDropdown === 'date' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute top-full left-0 mt-2 z-50 p-2 bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                        <RangePicker
                            open
                            getPopupContainer={(trigger) => trigger.parentNode}
                            className="!border-none !shadow-none !p-0"
                            onChange={(values) => {
                              if (values) {
                                setStartDate(values[0] ? values[0].format('YYYY.MM.DD') : null);
                                setEndDate(values[1] ? values[1].format('YYYY.MM.DD') : null);
                              } else {
                                setStartDate(null);
                                setEndDate(null);
                              }
                              setActiveDropdown(null);
                            }}
                        />
                      </div>
                    </>
                )}
              </div>

              {/* 모집 상태 커스텀 버튼 */}
              <div className="relative">
                <button
                    onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border ${activeDropdown === 'status' ? 'border-[#007AFF] text-[#007AFF]' : 'border-gray-200 text-gray-600'} rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm`}
                >
                  <span>{recruitmentStatus.find(opt => opt.value === recruitmentFilter)?.label || '모집 상태'}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {activeDropdown === 'status' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute top-full left-0 mt-2 z-50 w-36 bg-white border border-gray-100 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {recruitmentStatus.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setRecruitmentFilter(opt.value);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                    recruitmentFilter === opt.value
                                        ? 'bg-[#F0F7FF] text-[#007AFF]'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {opt.label}
                            </button>
                        ))}
                      </div>
                    </>
                )}
              </div>

              {/* 참여 상태 추가 커스텀 버튼 (시안 요구사항 일치) */}
              <div className="relative">
                <button
                    onClick={() => setActiveDropdown(activeDropdown === 'participation' ? null : 'participation')}
                    className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border ${activeDropdown === 'participation' ? 'border-[#007AFF] text-[#007AFF]' : 'border-gray-200 text-gray-600'} rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm`}
                >
                  <span>참여 상태</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {activeDropdown === 'participation' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute top-full left-0 mt-2 z-50 w-36 bg-white border border-gray-100 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {participationStatus.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setActiveDropdown(null)}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              {opt.label}
                            </button>
                        ))}
                      </div>
                    </>
                )}
              </div>

            </div>

            {/* 시안 전용 와이드형 서치 필드 (일정을 검색해보세요 명세 적용) */}
            <div className="w-full sm:max-w-[340px] md:max-w-[400px] relative">
              <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="일정을 검색해보세요"
                  className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-full text-xs font-semibold focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/5 transition-all placeholder:text-gray-400 shadow-sm"
              />
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 3. 메인 인라인 피드 리스트 (시안 감성 100% 동동기화) */}
          {loading ? (
              <div className="flex-1 flex items-center justify-center py-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
              </div>
          ) : (
              <div className="flex flex-col overflow-hidden">
                {filteredData.map((schedule, i) => (
                    <motion.div
                        key={schedule.PlanId || i}
                        whileHover={{ scale: 1.002 }}
                        onClick={() => navigate(`/plans/${schedule.PlanId}`)}
                        className="flex flex-row gap-5 md:gap-6 group cursor-pointer py-5 border-b border-gray-100 last:border-0 items-center bg-white"
                    >
                      {/* 미니 썸네일 박스 (시안의 컴팩트한 연회색 정비율 박스 구현) */}
                      <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-2xl overflow-hidden
                      shrink-0 border border-gray-50 flex items-center justify-center">
                        {schedule.imageUrl ? (
                            <img
                                src={schedule.imageUrl}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                                alt="일정 이미지"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100" />
                        )}
                      </div>

                      {/* 우측 텍스트 설명 및 연분홍 모집 메타데이터 레이아웃 */}
                      <div className="flex flex-col gap-1 md:gap-1.5 min-w-0 flex-1 px-1">
                        <span className="px-2.5 py-0.5 bg-[#FFE9E9] text-[#FF4D4D] rounded-md text-[10px] font-bold self-start tracking-tight">
                          {schedule.recruitStatus === 'OPEN' ? '모집 중' : '모집 완료'}
                        </span>

                        <h3 className="text-base md:text-lg font-bold text-[#222222] tracking-tight leading-snug group-hover:text-[#007AFF] transition-colors truncate">
                          {schedule.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed pr-4">
                          {schedule.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-gray-400 mt-1 border-t border-gray-50 pt-2 w-full">
                          <CalendarIcon size={14} className="text-gray-400" />
                          <span className="text-[11px] font-medium tracking-tight text-gray-500">
                            {schedule.startDate} ~ {schedule.endDate}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                ))}

                {/* 데이터가 없을 때의 대체 화면 */}
                {filteredData.length === 0 && (
                    <div className="py-32 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
                      <Search size={32} className="opacity-40 animate-pulse" />
                      <p className="text-xs font-semibold">조건에 맞는 일정 검색 결과가 존재하지 않습니다.</p>
                    </div>
                )}
              </div>
          )}
        </div>
      </ConfigProvider>
  );
}