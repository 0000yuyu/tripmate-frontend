/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Loader2,
  Square,
  Compass,
  Check,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  User,
  HelpCircle,
} from 'lucide-react';
import { Form, Input, DatePicker, Button, message } from 'antd';
import axiosInstance from "@utils/axiosInstance.js";
import CustomModal from "@components/CustomModal.jsx";
import { useMatchingStream } from "@hooks/useStreamContext.jsx";
import {CreateMatchingModal} from "@components/CreateMatchingModal.jsx"; // 💡 실제 파일 경로에 맞게 점검 필요

// ==========================================
// 1. 성향 및 프로필 필터 설정 서브 컴포넌트
// ==========================================
const FilterSettings = ({ settings, setSettings }) => {
  const mbtiPairs = [['I', 'E'], ['S', 'N'], ['T', 'F'], ['P', 'J']];
  const settingKeys = ['ie', 'sn', 'tf', 'pj'];
  return (
      <div className="space-y-4">
        <p className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5 mt-1">
          <Compass size={16} className="text-[#007AFF]" /> 내 성향 및 프로필 설정
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {mbtiPairs.map((pair, idx) => (
              <div key={idx} className="flex flex-col border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                {pair.map(val => (
                    <button
                        key={val}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, [settingKeys[idx]]: prev[settingKeys[idx]] === val ? null : val }))}
                        className={`py-2 text-xs font-bold transition-all ${settings[settingKeys[idx]] === val ? 'bg-[#007AFF] text-white' : 'bg-white text-slate-300 hover:text-slate-500'}`}
                    >
                      {val}
                    </button>
                ))}
              </div>
          ))}
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


// ==========================================
// 4. 메인 매칭 뷰 컴포넌트
// ==========================================
export const MatchingView = () => {
  const navigate = useNavigate();

  // 전역 컨텍스트 매칭 리소스 실시간 구독
  const {
    meetups,
    setMeetUps,
    currentStreamMode,
    isMatchingLoading,
    connectSSE,
    disconnectSSE
  } = useMatchingStream();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState(null);
  const [userSettings, setUserSettings] = useState({ ie: null, sn: null, tf: null, pj: null, allowSmoking: false });
  const [roomStatus, setRoomStatus] = useState('전체');

  // 커스텀 수평 트랙 인디케이터용 타겟 노드 레프 및 수치 상태
  const scrollContainerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMeetupsLengthRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const totalScrollable = scrollWidth - clientWidth;
    setScrollProgress(totalScrollable <= 0 ? 0 : (scrollLeft / totalScrollable) * 100);
  };

  const handleSaveSettings = async () => {
    try {
      await axiosInstance.put("/user-settings", userSettings);
      setActiveDropdown(null);
      message.success("필터 설정이 저장되었습니다.");
    } catch (e) {
      console.log(e);
    }
  };

  const handleAcceptMatching = async (meetupItem) => {
    try {
      await axiosInstance.patch(`matching/${meetupItem.matchingId}/approval`);
      setSelectedMeetup(meetupItem);
      setIsSuccessModalOpen(true);

      setMeetUps([]);
      message.success("매칭 요청 수락이 완료되었습니다.");
    } catch (e) {
      message.error("매칭 수락 처리 중 오류가 발생했습니다.");
    }
  };

  const handleTryCreateRoom = () => {
    if (currentStreamMode === 'guest') {
      message.info("진행 중인 메이트 매칭을 끊으시겠습니까? 방을 만들면 호스트 모드로 전환됩니다.");
      disconnectSSE();
      setTimeout(() => setIsModalOpen(true), 400);
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredMeetups = useMemo(() => {
    return meetups.filter(meetup => roomStatus === '전체' || meetup.status === roomStatus);
  }, [meetups, roomStatus]);

  useEffect(() => {
    setTimeout(handleScroll, 100);
  }, [filteredMeetups]);

  useEffect(() => {
    if (filteredMeetups.length > prevMeetupsLengthRef.current) {
      setActiveIndex(filteredMeetups.length - 1);
    }

    prevMeetupsLengthRef.current = filteredMeetups.length;
  }, [filteredMeetups.length]);
  useEffect(() => {
    if (activeIndex >= filteredMeetups.length) {
      setActiveIndex(Math.max(0, filteredMeetups.length - 1));
    }
  }, [filteredMeetups.length, activeIndex]);

  return (
      <div className="h-full px-2 bg-[#F8FAFC] rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden min-h-[650px] lg:h-[780px] flex flex-col border border-gray-100">

        {/* 상단 액션 내비바 */}
        <div className="p-6 md:px-10 md:py-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white shrink-0 z-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">지금 만나요 매칭!</h2>
            {currentStreamMode !== 'none' && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black animate-pulse ${currentStreamMode === 'host' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  {currentStreamMode === 'host' ? '👑 호스트 수신 모드 가동중' : '🔍 메이트 탐색 모드 가동중'}
                </span>
            )}
          </div>
          <button onClick={handleTryCreateRoom} className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#007AFF] text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-blue-600 text-xs md:text-sm shadow-md">
            <Plus size={16} strokeWidth={3} /> 매칭방 생성
          </button>
        </div>

        <CreateMatchingModal isOpen={isModalOpen}
                             onClose={() => setIsModalOpen(false)}
                             onSuccess={() => connectSSE('host')} />
        <AcceptSuccessModal isOpen={isSuccessModalOpen} onClose={() => { setIsSuccessModalOpen(false); setSelectedMeetup(null); }} meetupInfo={selectedMeetup} />

        {/* 메인 콘텐츠 바디 */}
        <div className="flex-1 flex flex-col p-4 md:p-8 min-h-0 overflow-hidden">

          {/* 제어 컨트롤 툴바 */}
          <div className="flex flex-wrap items-center gap-2 mb-6 shrink-0 relative z-30 justify-center lg:justify-start">
            <button onClick={() => connectSSE('guest')} className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-full text-xs font-black hover:bg-black shadow-md transition-all">
              <Play size={13} fill="currentColor" /> 매칭 탐색 시작
            </button>

            <div className="relative">
              <button
                  onClick={() => setActiveDropdown(prev => prev === 'options' ? null : 'options')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border ${activeDropdown === 'options' ? 'border-[#007AFF] text-[#007AFF]' : 'border-gray-200 text-gray-700'} bg-white rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-50 shadow-sm`}
              >
                <span>내 성향 설정</span>
              </button>
              {activeDropdown === 'options' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100/70 rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.09)] p-5 z-50">
                      <FilterSettings settings={userSettings} setSettings={setUserSettings} />
                      <div className="flex gap-2 mt-5">
                        <button onClick={() => setActiveDropdown(null)} className="flex-1 bg-slate-50 text-slate-400 py-2.5 text-xs font-bold rounded-xl">취소</button>
                        <button onClick={handleSaveSettings} className="flex-[1.8] bg-[#007AFF] text-white py-2.5 text-xs font-black rounded-xl shadow-md">저장</button>
                      </div>
                    </div>
                  </>
              )}
            </div>

            <div className="relative">
              <button
                  onClick={() => setActiveDropdown(prev => prev === 'status' ? null : 'status')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border ${roomStatus !== '전체' ? 'border-[#007AFF] bg-[#F0F7FF] text-[#007AFF]' : 'border-gray-200 text-gray-700'} bg-white rounded-full text-xs font-bold whitespace-nowrap`}
              >
                <span>방 상태: {roomStatus}</span>
              </button>
              {activeDropdown === 'status' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 w-28 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                      {['전체', '모집 중', '매칭 완료'].map(status => (
                          <button
                              key={status}
                              type="button"
                              onClick={() => { setRoomStatus(status); setActiveDropdown(null); }}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold block ${roomStatus === status ? 'text-[#007AFF] bg-[#F0F7FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {status}
                          </button>
                      ))}
                    </div>
                  </>
              )}
            </div>

            {currentStreamMode !== 'none' && (
                <button onClick={disconnectSSE} className="flex items-center gap-1 px-3 py-2 bg-red-50 rounded-full text-[11px] font-bold text-red-500 hover:bg-red-100 border border-red-100 transition-all">
                  <Square size={10} fill="currentColor" /> 매칭 중단
                </button>
            )}
          </div>

          {/* 카드 및 슬라이더 배치 전용 컨테이너 레이아웃 */}
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full relative">
            {isMatchingLoading || (currentStreamMode !== 'none' && filteredMeetups.length === 0) ? (
                <div className="w-full max-w-[360px] aspect-[4/5] border border-blue-100 bg-[#F4F9FF] rounded-[24px] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-inner">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 bg-[#007AFF]/10 rounded-full animate-ping" />
                    <Loader2 size={36} className="animate-spin text-[#007AFF] relative z-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#007AFF]">실시간 레이더 가동 중</p>
                    <p className="text-xs font-bold text-slate-400">조건에 일치하는 최적의 매칭방을 찾고 있습니다...</p>
                  </div>
                </div>
            ) : filteredMeetups.length === 0 ? (
                <div className="w-full max-w-[360px] aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[24px] text-gray-400 bg-white shadow-sm">
                  <HelpCircle className="mb-2 text-[#007AFF] opacity-70" size={36} />
                  <p className="text-xs font-bold text-gray-700">현재 대기 중인 매칭방이 없습니다.</p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">탐색을 가동하거나 방을 직접 개설해보세요.</p>
                </div>
            ) : (
                <div className="w-full flex flex-col items-center min-h-0">

                  {/* 🚀 정방향 수평 타로 스프레드 뷰 구조 (.hide-scroll 적용) */}
                  <div className="w-full flex flex-col items-center py-8 overflow-visible">
                    <div className="relative w-[310px] sm:w-[340px] h-[440px] sm:h-[460px]">


                      {/* 이전 카드 */}
                      {activeIndex > 0 && (
                          <div className="absolute left-[-22px] top-5 w-full h-full scale-[0.94] opacity-40 rounded-[24px] bg-white border border-slate-100 shadow-md z-0" />
                      )}

                      {/* 다음 카드 */}
                      {activeIndex < filteredMeetups.length - 1 && (
                          <div className="absolute right-[-22px] top-5 w-full h-full scale-[0.94] opacity-40 rounded-[24px] bg-white border border-slate-100 shadow-md z-0" />
                      )}

                      {/* 현재 카드 */}
                      <AnimatePresence mode="wait">
                        {filteredMeetups[activeIndex] && (
                            <motion.div
                                key={filteredMeetups[activeIndex].matchingId}
                                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -40, scale: 0.96 }}
                                transition={{ duration: 0.2 }}

                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.18}

                                onDragStart={() => {
                                  isDraggingRef.current = false;
                                }}
                                onDrag={(event, info) => {
                                  if (isDraggingRef.current) return;

                                  if (info.offset.x < -60 && activeIndex < filteredMeetups.length - 1) {
                                    isDraggingRef.current = true;
                                    setActiveIndex(prev => prev + 1);
                                  }

                                  if (info.offset.x > 60 && activeIndex > 0) {
                                    isDraggingRef.current = true;
                                    setActiveIndex(prev => prev - 1);
                                  }
                                }}
                                className="absolute inset-0 z-10 bg-white border border-slate-100/90 rounded-[24px] p-5 flex flex-col justify-between shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
                            >
                              <div className="space-y-4 text-left">
                                <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-tight bg-blue-50 text-[#007AFF]">
                                  {filteredMeetups[activeIndex].status}
                                </span>

                                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                                  No.{activeIndex + 1}
                                </span>
                                </div>

                                <div className="space-y-2">
                                  <h3 className="text-base font-black text-[#222222] leading-snug tracking-tight line-clamp-2">
                                    {filteredMeetups[activeIndex].title}
                                  </h3>

                                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-slate-50 px-2 py-1 rounded-lg">
                                    <MapPin size={11} className="text-[#007AFF]" />
                                    {filteredMeetups[activeIndex].country} · {filteredMeetups[activeIndex].city}
                                  </div>
                                </div>

                                <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100/50">
                                  <p className="text-xs text-gray-500 font-medium leading-relaxed h-[85px] line-clamp-4 overflow-hidden">
                                    {filteredMeetups[activeIndex].description}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                                  <Calendar size={12} />
                                  <span className="truncate">
                                  {filteredMeetups[activeIndex].scheduledAt
                                  ?.replace('T', ' ')
                                  .slice(0, 16)}
                                </span>
                                </div>

                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAcceptMatching(filteredMeetups[activeIndex]);
                                    }}
                                    className="w-full py-3 text-white font-black text-xs rounded-xl shadow-md transition-all bg-[#007AFF] hover:bg-blue-600 shadow-blue-100 active:scale-[0.98]"
                                >
                                  동행 참여하기
                                </button>
                              </div>
                            </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* 하단 트랙 프로그레스 핸들 바 */}
                  {filteredMeetups.length > 1 && (
                      <div className="w-[180px] h-[5px] bg-gray-200/60 rounded-full overflow-hidden mt-2 relative">
                        <div
                            className="h-full bg-[#007AFF] rounded-full transition-all duration-75"
                            style={{
                              width: `${100 / filteredMeetups.length}%`,
                              transform: `translateX(${activeIndex * 100}%)`
                            }}
                        />
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};