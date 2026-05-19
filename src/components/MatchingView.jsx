import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Form, Input, DatePicker, Button, message } from 'antd';
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken } from "@utils/auth.js";
import axiosInstance from "@utils/axiosInstance.js";
import CustomModal from "@components/CustomModal.jsx";

const FilterSettings = ({ settings, setSettings }) => {
  const mbtiPairs = [['I', 'E'], ['S', 'N'], ['T', 'F'], ['P', 'J']];
  const settingKeys = ['ie', 'sn', 'tf', 'pj'];

  const handleMbtiClick = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

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
                        onClick={() => handleMbtiClick(settingKeys[idx], val)}
                        className={`py-2 text-xs font-bold transition-all ${
                            settings[settingKeys[idx]] === val
                                ? 'bg-[#007AFF] text-white'
                                : 'bg-white text-slate-300 hover:text-slate-500'
                        }`}
                    >
                      {val}
                    </button>
                ))}
              </div>
          ))}
        </div>
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100/70">
          <span className="text-xs font-bold text-slate-600">본인 흡연 여부</span>
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, allowSmoking: false }))}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    !settings.allowSmoking ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              비흡연자
            </button>
            <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, allowSmoking: true }))}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    settings.allowSmoking ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              흡연자
            </button>
          </div>
        </div>
      </div>
  );
};

const AcceptSuccessModal = ({ isOpen, onClose, meetupInfo }) => {
  if (!meetupInfo) return null;

  return (
      <CustomModal
          isOpen={isOpen}
          onClose={onClose}
          title=""
          maxWidth="max-w-[400px]"
          buttons={
            <Button
                type="primary"
                onClick={onClose}
                className="w-full h-[48px] bg-[#007AFF] hover:bg-blue-600 border-none rounded-[14px] font-black text-xs text-white shadow-md shadow-blue-100"
            >
              확인 후 닫기
            </Button>
          }
      >
        <div className="flex flex-col items-center w-full px-1 text-center">
          <div className="w-14 h-14 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-4 shadow-sm">
            <Check size={26} strokeWidth={3} />
          </div>
          <h3 className="text-lg font-black text-[#222222] mb-1">참여가 완료되었습니다!</h3>
          <p className="text-xs font-semibold text-gray-400 mb-6">선택하신 메이트와 함께 즐거운 여정을 시작해보세요.</p>
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3.5 mb-2">
            <div>
              <span className="text-[10px] font-black text-gray-400 block mb-1">방 제목</span>
              <h4 className="text-sm font-bold text-[#222222] truncate">{meetupInfo.title}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
              <div>
                <span className="text-[10px] font-black text-gray-400 block mb-0.5">지역</span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                  <MapPin size={12} className="text-[#007AFF]" />
                  <span>{meetupInfo.country || '일본'} · {meetupInfo.city || '도쿄'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 block mb-0.5">출발 시간</span>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="truncate">{meetupInfo.scheduledAt?.replace('T', ' ').slice(0, 16) || '일정 상세참조'}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <span className="text-[10px] font-black text-gray-400 block mb-1">상세 설명</span>
              <div className="flex gap-1.5 items-start bg-white border border-gray-100 rounded-xl p-2.5 min-h-[50px]">
                <FileText size={13} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-gray-600 leading-normal line-clamp-3">
                  {meetupInfo.description || '상세 설명 정보가 존재하지 않습니다.'}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <span className="text-[10px] font-black text-gray-400 block mb-1">연락용 오픈채팅 링크</span>
              <a
                  href={meetupInfo.chatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-yellow-50 hover:bg-yellow-100/70 border border-yellow-100 rounded-xl text-xs font-bold text-amber-900 transition-colors cursor-pointer break-all"
              >
                <MessageSquare size={13} className="text-amber-600 shrink-0" />
                <span className="underline truncate flex-1">{meetupInfo.chatUrl || '지정된 링크 주소가 없습니다.'}</span>
              </a>
            </div>
          </div>
        </div>
      </CustomModal>
  );
};

const CreateMatchingModal = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterSettings, setFilterSettings] = useState({ ie: null, sn: null, tf: null, pj: null, allowSmoking: false });

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setFilterSettings({ ie: null, sn: null, tf: null, pj: null, allowSmoking: false });
    }
  }, [isOpen, form]);

  const handleMbtiClick = (key, value) => {
    setFilterSettings(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const nowIsoString = new Date().toISOString().split('.')[0];
      const payload = {
        title: values.title,
        description: values.description,
        chatUrl: values.chatUrl || null,
        scheduledAt: values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DDTHH:mm:ss') : null,
        recruitedAt: nowIsoString,
        ie: filterSettings.ie,
        sn: filterSettings.sn,
        tf: filterSettings.tf,
        pj: filterSettings.pj,
        allowSmoking: filterSettings.allowSmoking,
        lat: 35.6860,
        lng: 139.7671
      };
      await axiosInstance.post("/matching", payload);
      message.success('매칭방이 성공적으로 생성되었습니다!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || '매칭방 생성 중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const mbtiPairs = [['I', 'E'], ['S', 'N'], ['T', 'F'], ['P', 'J']];
  const settingKeys = ['ie', 'sn', 'tf', 'pj'];

  return (
      <CustomModal
          isOpen={isOpen}
          onClose={onClose}
          title=""
          maxWidth="max-w-[430px]"
          buttons={
            <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
                className="w-full h-[48px] bg-blue-500 hover:bg-blue-700 border-none rounded-[14px] font-black text-xs text-white shadow-md shadow-blue-100"
            >
              생성하기
            </Button>
          }
      >
        <div className="flex flex-col items-center w-full px-1 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
          <h3 className="text-base font-bold text-[#222222] mb-5 shrink-0">매칭방 생성</h3>
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="w-full space-y-3.5 overflow-visible">
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">방 제목 <span className="text-red-500">*</span></label>
              <Form.Item name="title" className="!mb-0" rules={[{ required: true, message: '방 제목을 입력해주세요.' }]}>
                <Input placeholder="매칭방 제목을 입력하세요" className="py-3 px-4 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF]" />
              </Form.Item>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">상세 설명 <span className="text-red-500">*</span></label>
              <Form.Item name="description" className="!mb-0" rules={[{ required: true, message: '상세 설명을 입력해주세요.' }]}>
                <Input.TextArea placeholder="함께할 활동 내용을 적어주세요." rows={2} className="p-3 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF] resize-none" />
              </Form.Item>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">오픈채팅 주소 <span className="text-gray-300 font-medium">(선택)</span></label>
              <Form.Item name="chatUrl" className="!mb-0">
                <Input placeholder="카카오톡 오픈채팅 주소 (미입력 가능)" className="py-3 px-4 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF]" />
              </Form.Item>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">모집 마감 시간</label>
              <Form.Item name="scheduledAt" className="!mb-0" rules={[{ required: true, message: '모집 마감 시간을 지정해주세요' }]}>
                <DatePicker showTime placeholder="날짜 및 시간" className="w-full h-[44px] border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 focus:border-[#007AFF]" />
              </Form.Item>
            </div>
            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4 text-left">
              <p className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5"><Compass size={16} className="text-[#007AFF]" /> 생성 방 매칭 옵션 설정</p>
              <div className="grid grid-cols-4 gap-1.5">
                {mbtiPairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                      {pair.map(val => (
                          <button key={val} type="button" onClick={() => handleMbtiClick(settingKeys[idx], val)} className={`py-2 text-xs font-bold transition-all ${filterSettings[settingKeys[idx]] === val ? 'bg-[#007AFF] text-white' : 'bg-white text-slate-300 hover:text-slate-400'}`}>{val}</button>
                      ))}
                    </div>
                ))}
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100/70">
                <span className="text-xs font-bold text-slate-600">흡연 요구 조건</span>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  <button type="button" onClick={() => setFilterSettings(prev => ({ ...prev, allowSmoking: false }))} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${filterSettings.smokingOption === "NON_SMOKER" ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-500'}`}>비흡연만</button>
                  <button type="button" onClick={() => setFilterSettings(prev => ({ ...prev, allowSmoking: true }))} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${filterSettings.smokingOption === "SMOKER" ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-500'}`}>흡연자만</button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </CustomModal>
  );
};

// ==========================================
// 4. 메인 매칭 맵 뷰 컴포넌트 (스르륵 단어장 애니메이션 탑재)
// ==========================================
export const MatchingView = () => {
  const navigate = useNavigate();
  const [meetups, setMeetUps] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 현재 스트림의 성격 상태 분리 ('none' | 'guest' | 'host')
  const [currentStreamMode, setCurrentStreamMode] = useState('none');

  // 단어장 넘기기용 인덱스 상태 값 정의
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState(null);

  const [userSettings, setUserSettings] = useState({ ie: null, sn: null, tf: null, pj: null, allowSmoking: false });
  const [roomStatus, setRoomStatus] = useState('전체');

  const eventSourceRef = useRef(null);
  const streamModeRef = useRef(currentStreamMode);

  useEffect(() => {
    fetchUserSetting();
    window.addEventListener('beforeunload', disconnectSSE);
    return () => {
      window.removeEventListener('beforeunload', disconnectSSE);
    };
  }, []);



  useEffect(() => {
    streamModeRef.current = currentStreamMode;
  }, [currentStreamMode]);

  const disconnectSSE = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      message.success("매칭 탐색이 중단되었습니다.");
      if (streamModeRef.current === 'guest') {
        await axiosInstance.delete('/matching/mate/sub', {
          keepalive: true
        });
      }
      if (streamModeRef.current === 'host') {
        await axiosInstance.delete('/matching/host/sub', {
          keepalive: true
        });
      }
    }
    setMeetUps([]);
    setCurrentStreamMode('none');
    setCurrentCardIdx(0);
  };

  const fetchUserSetting = async () => {
    try {
      const response = await axiosInstance.get("/user-settings");
      if (response.data?.data) {
        setUserSettings(response.data.data);
      }
    } catch (e) {
      console.log(e);
    }
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
      setMeetUps(prev => prev.filter(item => item.matchingId !== meetupItem.matchingId));
      if (currentCardIdx > 0) setCurrentCardIdx(prev => prev - 1);
      message.success("매칭 요청 수락이 완료되었습니다.");
    } catch (e) {
      message.error("매칭 수락 처리 중 오류가 발생했습니다.");
    }
  };

  const addMatchingList = (meetUp) => {
    setMeetUps((prevState) => {
      const filteredList = prevState.filter(item => item.matchingId !== meetUp.matchingId);
      const enrichedMeetup = {
        ...meetUp,
        country: meetUp.country || (prevState.length % 2 === 0 ? '일본' : '한국'),
        city: meetUp.city || (prevState.length % 2 === 0 ? '도쿄' : '서울'),
        status: meetUp.status || '모집 중',
        chatUrl: meetUp.chatUrl || 'https://open.kakao.com/...',
        description: meetUp.description || '트립메이트 실시간 오픈 번개 코스입니다.',
        scheduledAt: meetUp.scheduledAt || new Date().toISOString()
      };
      return [...filteredList, enrichedMeetup];
    });
  };

  const startMatchingStream = (type) => {
    setIsMatchingLoading(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setMeetUps([]);
    setCurrentCardIdx(0);

      setIsMatchingLoading(false);
      setCurrentStreamMode(type);

      if (type === 'guest') {
        message.success("메이트 매칭이 시작되었습니다.");
      } else if (type === 'host') {
        message.success("호스트 매칭이 시작되었습니다.");
      }

      try {
        const lat = 35.6860, lng = 139.7671;
        const endpoint = type === 'guest' ? '/api/matching/mate/sub' : '/api/matching/host/sub';

        eventSourceRef.current = new EventSourcePolyfill(
            `${endpoint}?lat=${lat}&lng=${lng}`,
            {
              headers: { 'Authorization': `Bearer ${getAccessToken()}` },
              withCredentials: false,
            }
        );
        eventSourceRef.current.onerror = (e) => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          console.log("이벤트 스트림 에러: " , e);
          setCurrentStreamMode('none');
        };

        eventSourceRef.current.addEventListener('matching', (e) => addMatchingList(JSON.parse(e.data)));
        eventSourceRef.current.addEventListener('matching-close', () => disconnectSSE());
        
      } catch (e) {
        console.log(e);
      }
  };

  const handleTryCreateRoom = () => {
    if (currentStreamMode === 'guest') {
      message.info("진행 중인 메이트 매칭을 끊으시겠습니까? 방을 만들면 호스트 모드로 전환됩니다.");
      disconnectSSE();
      setTimeout(() => {
        setIsModalOpen(true);
      }, 400);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setMeetUps([]);
    setCurrentCardIdx(0);
    startMatchingStream('host');
  };

  const filteredMeetups = useMemo(() => {
    return meetups.filter(meetup => roomStatus === '전체' || meetup.status === roomStatus);
  }, [meetups, roomStatus]);

  // 단어장 슬라이드 이동 유틸
  const handlePrevCard = () => {
    if (currentCardIdx > 0) setCurrentCardIdx(prev => prev - 1);
  };

  const handleNextCard = () => {
    if (currentCardIdx < filteredMeetups.length - 1) setCurrentCardIdx(prev => prev + 1);
  };

  return (
      <div className="h-full px-2 bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden min-h-[600px] lg:h-[750px] flex flex-col border border-gray-100">

        {/* 상단 액션 내비바 */}
        <div className="p-6 md:px-10 md:py-6 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">지금 만나요 매칭!</h2>
            {/* HOST / GUEST 뷰 다이렉트 명시 태그 */}
            {currentStreamMode !== 'none' && (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    currentStreamMode === 'host' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {currentStreamMode === 'host' ? '👑 호스트 수신 모드 가동중' : '🔍 메이트 탐색 모드 가동중'}
              </span>
            )}
          </div>
          <button
              onClick={handleTryCreateRoom}
              className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200/60 px-5 py-2.5 rounded-2xl font-bold hover:bg-gray-100 transition-all text-gray-700 text-xs md:text-sm shadow-sm"
          >
            <Plus size={16} className="text-[#007AFF]" strokeWidth={3} />
            매칭방 생성
          </button>
        </div>

        <CreateMatchingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleCreateSuccess} />

        <AcceptSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => { setIsSuccessModalOpen(false); setSelectedMeetup(null); }}
            meetupInfo={selectedMeetup}
        />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* 왼쪽 제어 콘솔 패널 구역 */}
          <div className="w-full lg:w-[48%] border-r border-[#F3F4F6] flex flex-col bg-white p-6 md:p-8 min-h-0">

            {/* 필터 툴바 단락 */}
            <div className="flex flex-wrap items-center gap-2 mb-6 shrink-0 relative z-40">
              <button
                  onClick={() => startMatchingStream('guest')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] text-white rounded-full text-xs font-black hover:bg-[#0062CC] shadow-md transition-all whitespace-nowrap"
              >
                <Play size={13} fill="currentColor" />
                매칭 시작
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
                      <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100/70 rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.09)] p-5 z-50 animate-in fade-in slide-in-from-top-1.5 duration-200">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-50 text-slate-500">
                          <User size={14} className="text-gray-400" />
                          <span className="text-[11px] font-bold text-slate-700 tracking-tight">내 프로필 설정</span>
                        </div>
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
                  <button
                      onClick={disconnectSSE}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 rounded-full text-[11px] font-bold text-red-500 whitespace-nowrap hover:bg-red-100 border border-red-100 active:scale-95 transition-all"
                  >
                    <Square size={10} fill="currentColor" />
                    매칭 중단
                  </button>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center items-center min-h-0 relative px-2">

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
                  <div className="w-full max-w-[360px] aspect-[4/5] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] text-gray-400 bg-slate-50/50">
                    <HelpCircle className="mb-2 text-[#007AFF] opacity-50" size={32} />
                    <p className="text-xs font-bold text-gray-700">아직 탐색이 실행되지 않았습니다.</p>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">상단 '매칭 시작' 단추를 눌러 작동시키세요.</p>
                  </div>
              ) : (
                  /* 스르륵 플래시카드 슬라이더 껍데기 */
                  <div className="w-full max-w-[360px] flex flex-col items-center space-y-6">
                    <div className="w-full aspect-[4/5] relative flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        {filteredMeetups.map((meetup, idx) => {
                          if (idx !== currentCardIdx) return null;
                          return (
                              <motion.div
                                  key={meetup.matchingId}
                                  initial={{ opacity: 0, x: 100, scale: 0.95 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                                  drag="x"
                                  dragConstraints={{ left: 0, right: 0 }}
                                  onDragEnd={(_, info) => {
                                    if (info.offset.x < -60) handleNextCard();
                                    if (info.offset.x > 60) handlePrevCard();
                                  }}
                                  className={`w-full h-full bg-white border-2 rounded-[24px] p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(0,0,0,0.06)] select-none cursor-grab active:cursor-grabbing ${
                                      currentStreamMode === 'host' ? 'border-amber-200' : 'border-blue-100'
                                  }`}
                              >
                                {/* 카드 탑 구역 */}
                                <div className="space-y-4 text-left">
                                  <div className="flex items-center justify-between">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-tight ${
                                    currentStreamMode === 'host' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-[#007AFF]'
                                }`}>
                                  {meetup.status}
                                </span>
                                    <span className="text-[11px] font-bold text-gray-400">
                                  {currentCardIdx + 1} / {filteredMeetups.length}
                                </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    <h3 className="text-lg font-black text-[#222222] leading-snug tracking-tight">
                                      {meetup.title}
                                    </h3>
                                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-slate-50 px-2 py-0.5 rounded">
                                      <MapPin size={10} /> {meetup.country} · {meetup.city}
                                    </div>
                                  </div>

                                  <p className="text-xs text-gray-500 font-medium leading-relaxed min-h-[60px] line-clamp-4">
                                    {meetup.description}
                                  </p>
                                </div>

                                {/* 카드 바텀 액션 단추 구역 */}
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                  <button
                                      onClick={() => handleAcceptMatching(meetup)}
                                      className="w-full py-3.5 bg-[#007AFF] hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-md transition-all"
                                  >
                                    {currentStreamMode === 'host' ? '신청 멤버 매칭 수락' : '가이드 매칭 동행 수락'}
                                  </button>
                                </div>
                              </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    {/* 인덱스 수동 전환용 서브 인디케이터 버튼 바 */}
                    <div className="flex items-center gap-6">
                      <button
                          onClick={handlePrevCard}
                          disabled={currentCardIdx === 0}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-black text-slate-800">{currentCardIdx + 1} / {filteredMeetups.length}</span>
                      <button
                          onClick={handleNextCard}
                          disabled={currentCardIdx === filteredMeetups.length - 1}
                          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-30 hover:bg-slate-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
              )}

            </div>
          </div>

          {/* 오른쪽 맵 뷰 지표 구역 */}
          <div className="w-full lg:w-[52%] h-[320px] lg:h-auto bg-gray-50 relative shrink-0">
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1m2!1s0x0%3A0x0!2zNDDCsDQzJzM0LjIiTiA3M8KwNTYnMTIuMiJX!1m2!1m3!1m2!1s0x0%3A0x0!2zNDDCsDQzJzM0LjIiTiA3M8KwNTYnMTIuMiJX!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr" className="w-full h-full border-none opacity-80" title="Brooklyn Map" />
            <div className="absolute inset-0 bg-[#007AFF]/5 pointer-events-none" />
            <AnimatePresence>
              {filteredMeetups.map((_, idx) => (
                  <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ top: `${25 + idx * 12}%`, left: `${35 + (idx % 3) * 15}%` }}
                      className="absolute w-7 h-7 bg-red-500 rounded-full border-4 border-white shadow-md flex items-center justify-center cursor-pointer z-20"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </div>
  );
};