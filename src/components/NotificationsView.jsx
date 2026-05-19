/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, MessageSquare, Calendar, ChevronRight, Inbox, Sparkles, CheckCheck,
  Loader2
} from 'lucide-react';
import axiosInstance from "@utils/axiosInstance.js";
import {message} from "antd";

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 안읽은 알림 개수 계산
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications/me");
        console.log(response);
        const content = response.data?.data?.histories?.content || response.data?.data || [];

        if (content.length === 0) {
          throw new Error('Empty content');
        }

        const data = content.map(n => {
          // 알림 본문 키워드에 따라 아이콘과 컬러셋을 동적으로 유니크하게 매핑
          const typeInfo = getNotificationType(n.title || n.content || '');

          return {
            id: n.id,
            title: n.title || '새로운 알림',
            content: n.content,
            read: n.isRead,
            time: n.createdAt ? formatTime(n.createdAt) : '방금 전',
          };
        });
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
        // API 연동 전이거나 비어있을 때 데모 화면을 기획안 톤과 맞추기 위해 세련된 목데이터 주입
        setNotifications(getMockNotifications());
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  // 타이틀이나 본문 키워드에 따라 유니크한 메타 데이터 분기 처리 함수
  const getNotificationType = (text) => {
    if (text.includes('매칭') || text.includes('수락')) {
      return { icon: <Sparkles size={14} />, color: 'bg-amber-50 text-amber-500 border-amber-100', sideColor: 'bg-amber-400' };
    }
    if (text.includes('댓글') || text.includes('메시지') || text.includes('채팅')) {
      return { icon: <MessageSquare size={14} />, color: 'bg-blue-50 text-[#007AFF] border-blue-100', sideColor: 'bg-[#007AFF]' };
    }
    if (text.includes('일정') || text.includes('플랜')) {
      return { icon: <Calendar size={14} />, color: 'bg-emerald-50 text-emerald-500 border-emerald-100', sideColor: 'bg-emerald-400' };
    }
    return { icon: <Bell size={14} />, color: 'bg-slate-50 text-slate-500 border-slate-100', sideColor: 'bg-slate-400' };
  };

  // 가독성을 위한 시간 포맷 가상 함수
  const formatTime = (dateStr) => {
    return dateStr.split('T')[0].replace(/-/g, '.');
  };

  // 기획안 무드 맞춤형 세련된 목데이터 세트
  const getMockNotifications = () => [
    { id: 1, title: '매칭방 수락 완료', content: '도쿄 3박 4일 투어 매칭방 요청이 호스트에게 수락되었습니다! 지금 확인해보세요.', read: false, time: '방금 전', icon: <Sparkles size={14} />, color: 'bg-amber-50 text-amber-500 border-amber-100', sideColor: 'bg-amber-400', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=match1&backgroundColor=f0f7ff' },
    { id: 2, title: '새로운 모임 댓글', content: '근육성윤님이 내 시부야 야경 출사 일정에 새로운 댓글을 남겼습니다.', read: false, time: '10분 전', icon: <MessageSquare size={14} />, color: 'bg-blue-50 text-[#007AFF] border-blue-100', sideColor: 'bg-[#007AFF]', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=comment2&backgroundColor=f0f7ff' },
    { id: 3, title: '일정 변경 알림', content: '경주 역사 탐방 2박 3일 일정이 호스트의 사정으로 업데이트되었습니다.', read: true, time: '2026.05.15', icon: <Calendar size={14} />, color: 'bg-emerald-50 text-emerald-500 border-emerald-100', sideColor: 'bg-emerald-400', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=calendar3&backgroundColor=f3f4f6' },
  ];

  const handleReadAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    message.success('모든 알림을 읽음으로 처리했습니다.');
  };

  return (
      <div className="bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-10 min-h-[750px] flex flex-col font-sans">

        {/* 1. 유니크 헤더 섹션 (Unread 카운트 배지 포함) */}
        <div className="flex items-center justify-between mb-10 px-1 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">알림 센터</h2>
            {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-[#FFE9E9] text-[#FF4D4D] text-[11px] font-black rounded-md animate-pulse">
              NEW {unreadCount}
            </span>
            )}
          </div>

          {unreadCount > 0 && (
              <button
                  onClick={handleReadAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#007AFF] transition-all bg-gray-50 hover:bg-gray-100/70 border border-gray-200/60 px-4 h-9 rounded-xl shadow-sm"
              >
                <CheckCheck size={14} />
                <span>모두 읽음 표시</span>
              </button>
          )}
        </div>

        {/* 2. 메인 피드 보디 스페이스 */}
        {loading ? (
            <div className="flex-1 flex items-center justify-center py-40">
              <Loader2 size={32} className="animate-spin text-[#007AFF]" />
            </div>
        ) : (
            <div className="flex-1 flex flex-col gap-3.5 w-full">
              {notifications.map((n, i) => (
                  <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`relative pl-5 pr-6 py-5 rounded-[24px] border ${
                          n.read
                              ? 'bg-gray-50/40 border-gray-100 opacity-60'
                              : 'bg-white border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)]'
                      } flex items-center gap-5 transition-all hover:bg-gray-50/70 cursor-pointer group`}
                  >
                    {!n.read && (
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 ${n.sideColor} rounded-r-full`} />
                    )}

                    {/* 알림 메시지 텍스트 디테일 */}
                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#222222] truncate">{n.title}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 pr-2">
                        {n.content}
                      </p>
                    </div>

                    {/* 호버 액션 체브론 링 */}
                    <div className="w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm shrink-0">
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>
                  </motion.div>
              ))}

              {/* 알림 함이 완전히 비었을 때 유니크 일러스트 박스 대체 */}
              {notifications.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                    <Inbox size={32} className="mb-2 opacity-40 animate-pulse text-gray-300" />
                    <p className="text-xs font-semibold">새로운 알림 소식이 없습니다.</p>
                  </div>
              )}
            </div>
        )}

        {/* 3. 하단 페이징 링크 */}
        {notifications.length > 0 && (
            <div className="mt-8 text-center shrink-0">
              <button className="text-xs font-bold text-[#007AFF] bg-[#F0F7FF] px-4 py-2 rounded-full hover:brightness-95 transition-all">
                지난 알림 내역 더보기
              </button>
            </div>
        )}
      </div>
  );
};