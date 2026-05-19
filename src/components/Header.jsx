/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoRowImg from "../assets/images/logo_row.png";
import { CiUser } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Square } from 'lucide-react';
import {useMatchingStream} from "@hooks/useStreamContext.jsx"; // 미니 중단 버튼용 아이콘 추가

const TABS = ["홈", "일정", "상품", "매칭"];
const tapMap = {
  "홈": "/",
  "일정": "/plans",
  "상품": "/products",
  "매칭": "/matching",
};

export default function Header({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  // 💡 전역 매칭 스트림 상태 및 중단 액션 함수 구독
  const { currentStreamMode, disconnectSSE } = useMatchingStream();

  return (
      <header className="bg-white h-[60px] sticky top-0 z-40 shadow-sm font-sans select-none">
        <div className="h-full px-4 py-[5px] flex items-center justify-between">

          {/* 1. 로고 영역 */}
          <div className="h-full flex justify-center items-center px-[30px] gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img className="w-[100px] h-full py-[10px] object-contain" src={LogoRowImg} alt="TripMate" />
          </div>

          {/* 2. 네비게이션 탭 영역 */}
          <div className="flex-1 h-full gap-[10px] items-center px-[10px] py-[20px] flex">
            {TABS.map((t) => (
                <button
                    key={t}
                    onClick={() => {
                      onTabChange(t);
                      navigate(tapMap[t]);
                    }}
                    className={`tab-btn flex px-[15px] py-[10px] text-sm font-medium text-gray-500 transition-all ${
                        activeTab === t ? "active text-[#007AFF] font-bold" : "hover:text-gray-800"
                    }`}
                >
                  {t}
                </button>
            ))}
          </div>

          {/* 3. 우측 액션 아이콘 랙 & 실시간 매칭 라이브 제어 배너 */}
          <div className="flex h-full px-[30px] items-center gap-4">

            {/* 🚀 실시간 매칭 레이더 서치 가동 상태 컨트롤러 바 추가 */}
            {currentStreamMode !== 'none' && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full pl-3 pr-1.5 py-1 text-[11px] animate-in fade-in slide-in-from-right duration-200 shadow-sm">
                  <div className="relative flex items-center justify-center w-2 h-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${currentStreamMode === 'host' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStreamMode === 'host' ? 'bg-amber-500' : 'bg-[#007AFF]'}`}></span>
                  </div>
                  <span className="font-bold text-slate-700 tracking-tight">
                    {currentStreamMode === 'host' ? '호스트 서치중' : '매칭 탐색중'}
                  </span>
                  <button
                      onClick={disconnectSSE}
                      className="flex items-center justify-center p-1 bg-red-50 hover:bg-red-100 border border-red-100/60 rounded-full text-red-500 transition-colors"
                      title="매칭 강제 중단하기"
                  >
                    <Square size={10} fill="currentColor" />
                  </button>
                </div>
            )}

            <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-600 hover:text-blue-500"
            >
            </button>

            {/* 마이페이지 프로필 버튼 */}
            <button className="text-gray-600 hover:text-blue-500 flex items-center justify-center"
                    onClick={() => navigate("/profile")}>
              <CiUser color={"black"} strokeWidth={0.5} size={24}/>
            </button>

            {/* 알림 센터 버튼 */}
            <button className="text-gray-600 hover:text-blue-500 flex items-center justify-center"
                    onClick={() => navigate("/notifications")}>
              <IoIosNotificationsOutline strokeWidth={2} color={"black"} size={24}/>
            </button>
          </div>
        </div>
      </header>
  );
}