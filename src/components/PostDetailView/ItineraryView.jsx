import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Maximize2, Users, Clock, Compass } from 'lucide-react';
import {planService} from "@/services/index.js";



export const ItineraryView = ({ plan, onUnitClick }) => {
  const [activeDay, setActiveDay] = useState(1);
  const currentUserId = "3a6d8972-0e0c-4f32-874e-57ba61fae6d5";
  const planUnits = plan?.planUnits || [];

  async function handleParticipate(planUnitId) {
    try {
      const response = await planService.applyToUnitPlan(plan.id,planUnitId);
      console.log(response);
    }catch (e) {
      console.log(e);
    }
  }

  const dayTabs = useMemo(() => {
    if (planUnits.length === 0) return [1];
    const maxDay = Math.max(...planUnits.map(unit => unit.day || 1));
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [planUnits]);

  const currentDayData = useMemo(() => {
    return planUnits
    .filter(unit => unit.day === activeDay)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [planUnits, activeDay]);

  const displayDate = useMemo(() => {
    if (!plan?.startDate) return '';
    const start = new Date(plan.startDate.replace(/\./g, '-'));
    const current = new Date(start.getTime() + (activeDay - 1) * 24 * 60 * 60 * 1000);
    return `${current.getFullYear()}. ${current.getMonth() + 1}. ${current.getDate()}.`;
  }, [plan?.startDate, activeDay]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '00:00';
    const parts = timeStr.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  };

  const getParticipationButtonState = (participants = []) => {
    const myRegistration = participants.find(p => p.userId === currentUserId);

    if (!myRegistration) {
      return {
        text: '이 코스만 참여',
        disabled: false,
        className: 'bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-sm shadow-[#007AFF]/10 active:scale-97'
      };
    }

    if (myRegistration.participationStatus === 'PARTICIPANT') {
      return {
        text: '참여 완료됨',
        disabled: true,
        className: 'bg-emerald-50 text-[#00C853] border border-emerald-200 cursor-not-allowed'
      };
    }

    return {
      text: '참여 대기 중',
      disabled: true,
      className: 'bg-gray-100 text-gray-400 border border-gray-200/40 cursor-not-allowed'
    };
  };

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
          {dayTabs.map(day => (
              <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                      activeDay === day
                          ? 'bg-[#007AFF] text-white shadow-sm shadow-[#007AFF]/10'
                          : 'bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {day}일차
              </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200/80 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-gray-400">{displayDate}</span>
            <h2 className="text-lg font-black text-[#222222]">{activeDay}일차</h2>
            <p className="text-xs text-gray-500 font-semibold">총 {currentDayData.length}개 코스 진행</p>
          </div>

          <div className="w-full aspect-[2.3/1] bg-slate-50 border border-gray-100 rounded-[18px] relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover grayscale opacity-30 select-none pointer-events-none" alt="" />
            <div className="absolute top-3 left-3 bg-white border border-gray-200/80 rounded-lg p-0.5 shadow-sm flex gap-0.5 scale-90 origin-top-left">
              <button type="button" className="px-3 py-1 bg-gray-900 text-white font-bold text-[10px] rounded-md">지도</button>
              <button type="button" className="px-3 py-1 text-gray-400 font-bold text-[10px]">위성</button>
            </div>
            <button type="button" className="absolute top-3 right-3 p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 shadow-sm hover:text-gray-700">
              <Maximize2 size={12} />
            </button>

            {currentDayData.length > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1.5 border border-gray-200/80 rounded-full shadow-md flex items-center gap-1.5 animate-bounce">
                  <span className="w-4 h-4 bg-[#007AFF] text-white font-black text-[9px] rounded-full flex items-center justify-center">1</span>
                  <span className="text-[10px] font-black text-gray-800">
                {currentDayData[0].title.length > 7 ? `${currentDayData[0].title.slice(0, 7)}...` : currentDayData[0].title}
              </span>
                </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="bg-[#007AFF] w-1 h-3.5 rounded-full" />
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">코스 일정</h3>
          </div>

          {currentDayData.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/30">
                <Compass size={24} className="opacity-40" />
                <p className="text-xs font-semibold">해당 일차에 등록된 세부 일정이 없습니다.</p>
              </div>
          ) : (
              <div className="relative pl-6 space-y-4 ml-1">
                <div className="absolute left-[9px] top-4 bottom-4 w-[1.5px] bg-gray-100" />

                {currentDayData.map((item, idx) => {
                  const btnState = getParticipationButtonState(item.participants);

                  return (
                      <div key={item.id || idx} className="relative group">
                        <span className="absolute left-[-21px] top-1.5 w-3.5 h-3.5 bg-[#007AFF] rounded-full border-2 border-white shadow-sm z-10" />

                        <div onClick={() => onUnitClick(item)} className="bg-white border border-gray-200/80 hover:border-[#007AFF]/30 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-2.5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                        <span className="text-[11px] font-black text-[#007AFF] tracking-tight flex items-center gap-1">
                          <Clock size={12} /> {formatTime(item.startTime)} ~ {formatTime(item.endTime)}
                        </span>
                              <h4 className="text-sm font-bold text-[#222222] group-hover:text-[#007AFF] transition-colors leading-snug mt-1.5">
                                {item.title}
                              </h4>
                              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                {item.product?.productName ? '액티비티 협력 상품' : '일반 관광지'}
                              </p>
                            </div>
                            <span className="px-2.5 py-0.5 bg-slate-50 border border-gray-100 text-gray-500 rounded-md text-[9px] font-black tracking-wider uppercase">
                        {plan?.recruitStatus || 'OPEN'}
                      </span>
                          </div>

                          <p className="text-xs text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">
                            {item.description}
                          </p>

                          <div className="mt-2 pt-3 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1 max-w-xs">
                              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                                <span className="flex items-center gap-1"><Users size={12} /> 메이트 모집 현황</span>
                                <span>
                            <span className="text-[#007AFF] font-black">{item.currentCount || 0}</span> / {item.maxCount || 10}명
                          </span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#007AFF] transition-all duration-300" style={{ width: `${Math.min(((item.currentCount || 0) / (item.maxCount || 10)) * 100, 100)}%` }} />
                              </div>
                            </div>

                            <button
                                type="button"
                                disabled={btnState.disabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleParticipate(item.id);
                                }}
                                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all text-center ${btnState.className}`}
                            >
                              {btnState.text}
                            </button>
                          </div>

                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </motion.div>
  );
};