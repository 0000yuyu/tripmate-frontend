/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Edit3, UserCheck, Compass } from 'lucide-react';

export const PostDetailSidebar = ({
  post,
  selectedMenuItem,
  setMenuItem
}) => {
  if (!post) return null;

  return (
      <div className="w-full bg-white border border-[#E5E7EB] rounded-[16px] p-5 space-y-6">

        {/* 썸네일 요약 헤더 영역 */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          {/* 💡 overflow-hidden을 주고 내부 이미지를 object-cover로 꽉 채움 */}
          <div className="w-full h-[140px] bg-[#EAECEF] rounded-[8px] overflow-hidden flex items-center justify-center border border-slate-100">
            {post.imageUrl ? (
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
            ) : (
                // 이미지가 깨지거나 유실되었을 때의 방어막 대체 텍스트/디자인
                <span className="text-[11px] font-bold text-gray-400">No Custom Image</span>
            )}
          </div>

          <div className="space-y-1">
            <span className="inline-block bg-[#FFF0F0] text-[#FF4D4D] text-[10px] font-black px-2 py-0.5 rounded">
              {post.recruitStatus === 'OPEN' ? '모집 중' : '모집 마감'}
            </span>
            <h3 className="text-base font-black text-[#333333] tracking-tight truncate mt-1">
              {post.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
              {post.description || '개설된 투어 패키지 루트 정보가 서술되어 있지 않습니다.'}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold pt-2">
              <Calendar size={12} />
              <span>{post.startDate} ~ {post.endDate}</span>
            </div>
          </div>
        </div>

        {/* 핵심 내비게이션 라인 메뉴 */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1.5 mb-1">일반 메인 메뉴</p>

          <button
              onClick={() => setMenuItem('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  selectedMenuItem === 'all' || selectedMenuItem === 'unit_view'
                      ? 'bg-[#F0F7FF] text-[#007AFF]'
                      : 'text-[#666666] hover:bg-slate-50'
              }`}
          >
            <Compass size={16} />
            <span>전체 일정 모아보기</span>
          </button>

          <div className="h-[1px] bg-slate-100 my-2" />

          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1.5 mb-1">관리자 설정</p>

          <button
              onClick={() => setMenuItem('edit')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  selectedMenuItem === 'edit'
                      ? 'bg-[#F0F7FF] text-[#007AFF]'
                      : 'text-[#666666] hover:bg-slate-50'
              }`}
          >
            <Edit3 size={16} />
            <span>코스 정보 수정하기</span>
          </button>

          <button
              onClick={() => setMenuItem('manage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                  selectedMenuItem === 'manage'
                      ? 'bg-[#F0F7FF] text-[#007AFF]'
                      : 'text-[#666666] hover:bg-slate-50'
              }`}
          >
            <UserCheck size={16} />
            <span>신청 메이트 명단 관리</span>
          </button>
        </div>
      </div>
  );
};