/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { EventSourcePolyfill } from "event-source-polyfill";
import { getAccessToken } from "@utils/auth.js";
import axiosInstance from "@utils/axiosInstance.js";
import { message } from "antd";
import CustomModal from "@components/CustomModal.jsx";
// 💡 작성해주신 CustomModal 컴포넌트 임포트 (경로는 프로젝트 구조에 맞게 조절하세요)

const MatchingStreamContext = createContext();

export const MatchingStreamProvider = ({ children }) => {
  const eventSourceRef = useRef(null);

  const [meetups, setMeetUps] = useState([]);
  const [currentStreamMode, setCurrentStreamMode] = useState('none');
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // 💡 [추가]: 매칭 성공 모달 관리를 위한 상태값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchedData, setMatchedData] = useState(null);

  const streamModeRef = useRef('none');

  useEffect(() => {
    streamModeRef.current = currentStreamMode;
  }, [currentStreamMode]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (streamModeRef.current === 'none') return;
      e.preventDefault();
      const warningMessage = "진행 중인 매칭 탐색 혹은 호스트 수신 연결이 유실될 수 있습니다. 정말 페이지를 이동하시겠습니까?";
      e.returnValue = warningMessage;
      return warningMessage;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addMatchingList = (meetUp) => {
    setMeetUps((prevState) => {
      const filteredList = prevState.filter(item => item.matchingId !== meetUp.matchingId);
      const enrichedMeetup = {
        ...meetUp,
        country: meetUp.country || (prevState.length % 2 === 0 ? '일본' : '한국'),
        city: meetUp.city || (prevState.length % 2 === 0 ? '도쿄' : '서울'),
        status: meetUp.status || '모집 중',
        description: meetUp.description || '트립메이트 실시간 오픈 번개 코스입니다.',
        scheduledAt: meetUp.scheduledAt || new Date().toISOString()
      };
      return [...filteredList, enrichedMeetup];
    });
  };

  const disconnectSSE = async () => {
    const previousMode = streamModeRef.current;
    setCurrentStreamMode('none');
    streamModeRef.current = 'none';

    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch (e) {
        console.error("SSE close error:", e);
      }
      eventSourceRef.current = null;

      message.success("매칭 탐색이 중단되었습니다.");

      if (previousMode === 'guest') {
        try {
          await axiosInstance.delete('/matching/mate/sub', { keepalive: true });
        } catch (err) {
          console.error("게스트 세션 종료 실패:", err);
        }
      }
      if (previousMode === 'host') {
        try {
          await axiosInstance.delete('/matching/host/sub', { keepalive: true });
        } catch (err) {
          console.error("호스트 세션 종료 실패:", err);
        }
      }
    }
    setMeetUps([]);
  };

  const connectSSE = async (type) => {
    setIsMatchingLoading(true);
    setMeetUps([]);

    if (eventSourceRef.current || streamModeRef.current !== 'none') {
      console.log(`[SSE] 기존 가동 중인 ${streamModeRef.current} 스트림 세션을 먼저 안전하게 제거합니다.`);
      await disconnectSSE();
    }

    setCurrentStreamMode(type);
    streamModeRef.current = type;

    setTimeout(() => {
      setIsMatchingLoading(false);
      if (type === 'guest') message.success("메이트 매칭 탐색이 시작되었습니다.");
      else if (type === 'host') message.success("호스트 수신 대기가 시작되었습니다.");

      try {
        const lat = 35.6860, lng = 139.7671;
        const endpoint = type === 'guest' ? '/api/matching/mate/sub' : '/api/matching/host/sub';

        const eventSource = new EventSourcePolyfill(
            `${endpoint}?lat=${lat}&lng=${lng}`,
            {
              headers: { 'Authorization': `Bearer ${getAccessToken()}` },
              withCredentials: false,
              heartbeatTimeout: 120000
            }
        );
        eventSourceRef.current = eventSource;

        eventSourceRef.current.onerror = () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          setCurrentStreamMode('none');
          streamModeRef.current = 'none';
          message.error("매칭 서버와의 실시간 연결이 끊어졌습니다.");
        };

        eventSourceRef.current.addEventListener('matching', (e) => addMatchingList(JSON.parse(e.data)));

        // 💡 [수정]: matching-closed 수신 시 데이터 파싱 및 모달 오픈
        eventSourceRef.current.addEventListener('matching-closed', (e) => {
          try {
            const data = e.data ? JSON.parse(e.data) : null;
            setMatchedData(data); // 매칭 데이터 저장 (채팅방 URL, 타이틀 등 활용 목적)
          } catch (err) {
            console.error("매칭 결과 데이터 파싱 에러:", err);
          }

          setIsModalOpen(true); // 커스텀 모달 오픈
          disconnectSSE();      // 세션 안전 해제
        });

      } catch (e) {
        console.error("SSE 신규 커넥션 초기화 중 예외 에러:", e);
        setCurrentStreamMode('none');
        streamModeRef.current = 'none';
        setIsMatchingLoading(false);
      }
    }, 600);
  };

  // 💡 [추가]: 만나러 가기 버튼 클릭 시 핸들러
  const handleGoToMeet = () => {
    setIsModalOpen(false);

    // 백엔드에서 내려준 chatUrl이 있거나, 없으면 기본 경로(예: /chat)로 이동
    const targetUrl = matchedData?.chatUrl || '/';
    window.location.href = targetUrl; // 혹은 react-router의 navigate(targetUrl) 사용 가능
  };

  return (
      <MatchingStreamContext.Provider value={{
        meetups,
        setMeetUps,
        currentStreamMode,
        isMatchingLoading,
        connectSSE,
        disconnectSSE
      }}>
        {children}

        {/* 💡 [추가]: 글로벌 매칭 성사 커스텀 모달 배치 */}
        <CustomModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="🎉 실시간 매칭 성사!"
            buttons={
              <button
                  type="button"
                  onClick={handleGoToMeet}
                  className="w-full py-3 bg-[#222222] text-white text-sm font-bold rounded-2xl transition-all hover:bg-black active:scale-[0.98] shadow-md"
              >
                메이트 만나러 가기
              </button>
            }
        >
          <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
            <span className="text-3xl">🤝</span>
            <p className="text-sm font-bold text-[#222222] mt-2">
              축하합니다! 메칭이 완료되었습니다.
            </p>
            <p className="text-xs text-gray-500 leading-normal">
              [{matchedData?.title || "오전 번개 코스"}]<br />
              지금 바로 메이트와 대화를 시작해보세요!
            </p>
          </div>
        </CustomModal>
      </MatchingStreamContext.Provider>
  );
};

export const useMatchingStream = () => useContext(MatchingStreamContext);