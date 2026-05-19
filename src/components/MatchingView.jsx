import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Settings,
  Plus,
  Loader2,
  Square,
  ChevronDown,
  Compass,
  Check,
  MapPin,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileText,
  User,
  HelpCircle
} from 'lucide-react';
import { Form, Input, DatePicker, Button, message } from 'antd';
import { matchingService } from '../services';
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken } from "@utils/auth.js";
import axiosInstance from "@utils/axiosInstance.js";
import CustomModal from "@components/CustomModal.jsx";

const SkeletonCard = () => (
    <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 flex flex-row items-center justify-between gap-4 animate-pulse">
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex gap-2">
          <div className="w-12 h-4 bg-slate-200 rounded-md" />
          <div className="w-16 h-4 bg-slate-200 rounded-md" />
        </div>
        <div className="w-3/4 h-5 bg-slate-200 rounded-md mt-1" />
        <div className="w-1/2 h-4 bg-slate-200 rounded-md" />
      </div>
      <div className="w-20 h-9 bg-slate-200 rounded-xl" />
    </div>
);

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
          <Compass size={16} className="text-[#007AFF]" /> 선호 성향 필터
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
          <span className="text-xs font-bold text-slate-600">흡연 여부 필터</span>
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, allowSmoking: false }))}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    !settings.allowSmoking ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              비흡연만
            </button>
            <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, allowSmoking: true }))}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    settings.allowSmoking ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              상관없음
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

// ==========================================
// 4. [업그레이드] 매칭방 생성 모달 컴포넌트 (MBTI 해제 토글 탑재)
// ==========================================
const CreateMatchingModal = ({ isOpen, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 💡 초기값 무조건 선택 해제 상태(`null`)로 대입할 수 있게 정리
  const [filterSettings, setFilterSettings] = useState({
    ie: null,
    sn: null,
    tf: null,
    pj: null,
    smokingOption: "BOTH"
  });

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setFilterSettings({ ie: null, sn: null, tf: null, pj: null, smokingOption: "BOTH" });
    }
  }, [isOpen, form]);

  const handleMbtiClick = (key, value) => {
    setFilterSettings(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 💡 현재 시점 시간 포맷팅 안정적 취득 (ISO)
      const nowIsoString = new Date().toISOString().split('.')[0];

      const payload = {
        title: values.title,
        description: values.description,
        chatUrl: values.chatUrl || null,
        scheduledAt: values.scheduledAt ? values.scheduledAt.format('YYYY-MM-DDTHH:mm:ss') : null,
        recruitedAt: nowIsoString,
        ie: filterSettings.ie ,
        sn: filterSettings.sn,
        tf: filterSettings.tf ,
        pj: filterSettings.pj,
        smokingOption: filterSettings.smokingOption,
        lat: 35.6860,
        lng: 139.7671
      };

      await axiosInstance.post("/matching", payload);
      message.success('매칭방이 성공적으로 생성되었습니다!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
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

          <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="w-full space-y-3.5 overflow-visible"
          >
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">방 제목 <span className="text-red-500">*</span></label>
              <Form.Item name="title" className="!mb-0" rules={[{ required: true, message: '방 제목을 입력해주세요.' }]}>
                <Input
                    placeholder="매칭방 제목을 입력하세요"
                    className="py-3 px-4 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF] focus:shadow-none transition-colors"
                />
              </Form.Item>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">상세 설명 <span className="text-red-500">*</span></label>
              <Form.Item name="description" className="!mb-0" rules={[{ required: true, message: '상세 설명을 입력해주세요.' }]}>
                <Input.TextArea
                    placeholder="함께할 활동 내용을 적어주세요."
                    rows={2}
                    className="p-3 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF] focus:shadow-none transition-colors resize-none"
                />
              </Form.Item>
            </div>

            {/* 3. 오픈채팅 주소 (선택 - Nullable) */}
            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">오픈채팅 주소 <span className="text-gray-300 font-medium">(선택)</span></label>
              <Form.Item name="chatUrl" className="!mb-0">
                <Input
                    placeholder="카카오톡 오픈채팅 주소 (미입력 가능)"
                    className="py-3 px-4 border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 placeholder:text-gray-300 focus:border-[#007AFF] focus:shadow-none transition-colors"
                />
              </Form.Item>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[11px] font-bold text-gray-400 px-1">모집 마감 시간</label>
              <Form.Item name="scheduledAt" className="!mb-0" rules={[{ required: true, message: '모집 마감 시간을 지정해주세요' }]}>
                <DatePicker
                    showTime
                    placeholder="날짜 및 시간"
                    className="w-full h-[44px] border border-gray-200/80 rounded-[12px] text-xs font-bold text-gray-800 focus:border-[#007AFF] transition-colors"
                />
              </Form.Item>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-3 space-y-4 text-left">
              <p className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
                <Compass size={16} className="text-[#007AFF]" /> 생성 방 매칭 옵션 설정
              </p>

              {/* MBTI Grid 선택 바 */}
              <div className="grid grid-cols-4 gap-1.5">
                {mbtiPairs.map((pair, idx) => (
                    <div key={idx} className="flex flex-col border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
                      {pair.map(val => (
                          <button
                              key={val}
                              type="button"
                              onClick={() => handleMbtiClick(settingKeys[idx], val)}
                              className={`py-2 text-xs font-bold transition-all ${
                                  filterSettings[settingKeys[idx]] === val
                                      ? 'bg-[#007AFF] text-white'
                                      : 'bg-white text-slate-300 hover:text-slate-400'
                              }`}
                          >
                            {val}
                          </button>
                      ))}
                    </div>
                ))}
              </div>

              {/* 흡연 옵션 필터 */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100/70">
                <span className="text-xs font-bold text-slate-600">흡연 요구 조건</span>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  <button
                      type="button"
                      onClick={() => setFilterSettings(prev => ({ ...prev, smokingOption: "NON_SMOKER" }))}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          filterSettings.smokingOption === "NON_SMOKER" ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-500'
                      }`}
                  >
                    비흡연만
                  </button>
                  <button
                      type="button"
                      onClick={() => setFilterSettings(prev => ({ ...prev, smokingOption: "SMOKER" }))}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          filterSettings.smokingOption === "SMOKER" ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-500'
                      }`}
                  >
                    흡연자만
                  </button>
                  <button
                      type="button"
                      onClick={() => setFilterSettings(prev => ({ ...prev, smokingOption: "BOTH" }))}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          filterSettings.smokingOption === "BOTH" ? 'bg-amber-400 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-500'
                      }`}
                  >
                    상관없음
                  </button>
                </div>
              </div>
            </div>

          </Form>
        </div>
      </CustomModal>
  );
};

// ==========================================
// 5. 메인 매칭 맵 뷰 컴포넌트
// ==========================================
export const MatchingView = () => {
  const navigate = useNavigate();
  const [meetups, setMeetUps] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [isStreamStarted, setIsStreamStarted] = useState(false);

  // 수락 완료 팝업용 상태
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedMeetup, setSelectedMeetup] = useState(null);

  // 매칭 가이드용 성향 래퍼 (선택 안한 상태 지원을 위해 null 초기화)
  const [userSettings, setUserSettings] = useState({ ie: null, sn: null, tf: null, pj: null, allowSmoking: false });

  const [roomStatus, setRoomStatus] = useState('전체');

  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchUserSetting();
    return () => disconnectSSE();
  }, []);

  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setMeetUps([]);
    setIsStreamStarted(false);
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
    } catch (e) {
      console.log(e);
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
        description: meetUp.description || '',
        scheduledAt: meetUp.scheduledAt || new Date().toISOString()
      };
      return [...filteredList, enrichedMeetup];
    });
  };

  const handleToggleActivation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isActive) {
        await matchingService.deactivateMatching();
      } else {
        await matchingService.activateMatching();
      }
      setIsActive(prev => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startMatchingStream = (type) => {
    setIsMatchingLoading(true);
    disconnectSSE();

    setTimeout(() => {
      setIsMatchingLoading(false);
      setIsStreamStarted(true);
      try {
        const lat = 35.6860, lng = 139.7671;
        const endpoint = type === 'guest' ? '/api/matching/mate/sub' : '/api/matching/host/sub';

        eventSourceRef.current = new EventSourcePolyfill(
            `${endpoint}?lat=${lat}&lng=${lng}`,
            {
              headers: { 'Authorization': `Bearer ${getAccessToken()}` },
              withCredentials: false,
              heartbeatTimeout: 120000
            }
        );

        eventSourceRef.current.addEventListener('connect', () => console.log(`${type} 연결 성공`));
        eventSourceRef.current.addEventListener('matching', (e) => addMatchingList(JSON.parse(e.data)));
        eventSourceRef.current.addEventListener('matching-close', () => disconnectSSE());
        eventSourceRef.current.onerror = (e) => console.error("SSE 에러:", e);
      } catch (e) {
        console.log(e);
      }
    }, 600);
  };

  const filteredMeetups = useMemo(() => {
    return meetups.filter(meetup => roomStatus === '전체' || meetup.status === roomStatus);
  }, [meetups, roomStatus]);

  return (
      <div className="h-full px-2 bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden min-h-[600px] lg:h-[750px] flex flex-col border border-gray-100">

        <div className="p-6 md:px-10 md:py-6 border-b border-gray-100 flex flex-row items-center justify-between bg-white shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">지금 만나요 매칭!</h2>
          <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200/60 px-5 py-2.5 rounded-2xl font-bold hover:bg-gray-100 transition-all text-gray-700 text-xs md:text-sm shadow-sm"
          >
            <Plus size={16} className="text-[#007AFF]" strokeWidth={3} />
            매칭방 생성
          </button>
        </div>

        <CreateMatchingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => startMatchingStream('host')} />

        <AcceptSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => { setIsSuccessModalOpen(false); setSelectedMeetup(null); }}
            meetupInfo={selectedMeetup}
        />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="w-full lg:w-[48%] border-r border-[#F3F4F6] flex flex-col bg-white p-6 md:p-8 min-h-0">

            {/* 필터 제어 대시보드 */}
            <div className="flex flex-wrap items-center gap-2 mb-6 shrink-0 relative z-40">
              <button
                  onClick={() => startMatchingStream('guest')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] text-white rounded-full text-xs font-black hover:bg-[#0062CC] shadow-md transition-all whitespace-nowrap"
              >
                <Play size={13} fill="currentColor" />
                매칭 시작
              </button>

              <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-full flex items-center gap-2.5 h-[38px] shrink-0 shadow-sm">
                <span className="text-[11px] font-bold text-gray-500 tracking-wide">LIVE</span>
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleToggleActivation}
                    className={`w-9 h-[18px] rounded-full relative p-0.5 transition-all duration-300 outline-none flex items-center cursor-pointer ${
                        isLoading ? 'opacity-60 pointer-events-none' : ''
                    } ${isActive ? 'bg-[#007AFF]' : 'bg-gray-200'}`}
                >
                  {isLoading ? (
                      <Loader2 size={10} className="animate-spin text-white mx-auto" />
                  ) : (
                      <span className={`w-3.5 h-3.5 bg-white rounded-full block shadow-sm transition-all duration-300 transform ${isActive ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                  )}
                </button>
              </div>

              {/* 매칭 옵션 */}
              <div className="relative">
                <button
                    onClick={() => setActiveDropdown(prev => prev === 'options' ? null : 'options')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 border ${activeDropdown === 'options' ? 'border-[#007AFF] text-[#007AFF]' : 'border-gray-200 text-gray-700'} bg-white rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-50 shadow-sm transition-all`}
                >
                  <span>매칭 옵션</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'options' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'options' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100/70 rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.09)] p-5 z-50 animate-in fade-in slide-in-from-top-1.5 duration-200">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-50 text-slate-500">
                          <User size={14} className="text-gray-400" />
                          <span className="text-[11px] font-bold text-slate-700 tracking-tight">내 가중치 매칭 성향 필터</span>
                        </div>

                        <FilterSettings settings={userSettings} setSettings={setUserSettings} />

                        <div className="flex gap-2 mt-5">
                          <button onClick={() => setActiveDropdown(null)} className="flex-1 bg-slate-50 text-slate-400 py-2.5 text-xs font-bold rounded-xl active:scale-98 transition-all">취소</button>
                          <button onClick={handleSaveSettings} className="flex-[1.8] bg-[#007AFF] text-white py-2.5 text-xs font-black rounded-xl shadow-md shadow-blue-100 active:scale-98 transition-all hover:brightness-105">저장</button>
                        </div>
                      </div>
                    </>
                )}
              </div>

              {/* 방 상태 필터 */}
              <div className="relative">
                <button
                    onClick={() => setActiveDropdown(prev => prev === 'status' ? null : 'status')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 border ${roomStatus !== '전체' ? 'border-[#007AFF] bg-[#F0F7FF] text-[#007AFF]' : 'border-gray-200 text-gray-700'} bg-white rounded-full text-xs font-bold whitespace-nowrap hover:bg-gray-50 shadow-sm`}
                >
                  <span>방 상태: {roomStatus}</span>
                  <ChevronDown size={14} />
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

              {/* 중단 */}
              {eventSourceRef.current && (
                  <button
                      onClick={disconnectSSE}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 rounded-full text-[11px] font-bold text-red-500 whitespace-nowrap hover:bg-red-100 transition-all border border-red-100 active:scale-95"
                  >
                    <Square size={10} fill="currentColor" />
                    중단
                  </button>
              )}
            </div>

            {/* 수직 리스트 렌더링 구역 */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4 scrollbar-hide min-h-0">

              {isActive && !isMatchingLoading && (
                  <div className="bg-[#F0F7FF] border border-blue-100 rounded-2xl px-5 py-3.5 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#007AFF]" />
                      <span className="text-xs font-black text-[#007AFF]">LIVE 레이더 가동 중...</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400">실시간 매칭방 수신 대기</span>
                  </div>
              )}

              {isMatchingLoading ? (
                  <div className="space-y-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
              ) : filteredMeetups.length === 0 ? (
                  !isStreamStarted ? (
                      <div className="h-full min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 bg-slate-50/30">
                        <HelpCircle className="mb-2 text-[#007AFF] opacity-60 animate-pulse" size={26} />
                        <p className="text-xs font-bold text-gray-700 mb-0.5">아직 매칭 탐색이 실행되지 않았습니다.</p>
                        <p className="text-[11px] font-medium text-gray-400">좌측 상단의 '매칭 시작' 버튼을 클릭해주세요.</p>
                      </div>
                  ) : (
                      <div className="h-full min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                        <AlertCircle className="mb-2 opacity-40 animate-bounce" size={24} />
                        <p className="text-xs font-bold text-gray-400">조건에 일치하는 매칭방이 존재하지 않습니다.</p>
                      </div>
                  )
              ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {filteredMeetups.map((meetup) => (
                          <motion.div
                              key={meetup.matchingId}
                              initial={{ opacity: 0, y: 15, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } }}
                              layout
                              className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-row items-center justify-between gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-[#007AFF]/30 transition-colors"
                          >
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-[#FFE9E9] text-[#FF4D4D] rounded-md text-[10px] font-black tracking-tight">
                                  {meetup.status}
                                </span>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold flex items-center gap-0.5">
                                  <MapPin size={10} /> {meetup.country} · {meetup.city}
                                </span>
                              </div>
                              <h3 className="text-[15px] font-black text-[#222222] truncate">
                                {meetup.title}
                              </h3>
                              <p className="text-xs text-gray-500 line-clamp-1 pr-2">
                                {meetup.description || '트립메이트와 함께 떠나는 실시간 번개 일정.'}
                              </p>
                            </div>
                            <button
                                onClick={() => handleAcceptMatching(meetup)}
                                className="bg-[#007AFF] text-white px-4.5 py-2 rounded-xl font-bold text-xs hover:bg-[#0062CC] transition-all whitespace-nowrap shadow-sm"
                            >
                              수락
                            </button>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
              )}
            </div>
          </div>

          {/* 오른쪽 지도 영역 */}
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