/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layout, Users, PenTool, Edit, UserCog, Calendar, MapPin } from 'lucide-react';

export const PostDetailSidebar = ({
  post,
  selectedMenuItem,
  setMenuItem,
  selectedItem,
  setSelectedItem,
  onBack
}) => {
  return (
      <div className="w-full shrink-0
      flex lg:flex-col gap-10 select-none animate-in fade-in duration-200 flex-row">

    {/* Hero Card - 상단 카드 이미지 및 일정 요약 */}
    <div className="bg-white w-full rounded-[10px] border border-[#E5E7EB] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-3.5">

      {/* 💡 [버그 수정 핵심]: aspect-square(정사각형)를 제거하고 h-[140px] 같은 고정 높이를 주어
              거대해지는 현상을 막고, object-cover로 이미지가 찌그러지지 않고 깔끔하게 채워지도록 조율 */}
      <div className="w-full h-[140px] bg-slate-50 rounded-[20px] overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
        {post?.image ? (
            <img
                src={post.image}
                className="w-full h-full object-cover"
                alt="Post Cover"
            />
        ) : (
            // 이미지가 없을 때 띄워줄 컴팩트한 디폴트 스켈레톤 박스 무드
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-gray-300">
              <Layout size={24} />
            </div>
        )}
      </div>

      <div className="px-0.5 space-y-2 flex-col flex text-left">
            <span className="px-2.5 py-0.5 bg-[#FFE9E9] text-[#FF4D4D] rounded-md text-[10px] font-bold self-start tracking-tight">
              모집 중
            </span>
        <h2 className="text-base font-bold text-[#222222] leading-snug tracking-tight mt-0.5">
          {post?.title || "도쿄 3박 4일 투어"}
        </h2>
        <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2">
          {post?.description || "도쿄 같이 여행 하실 분 모집합니다."}
        </p>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mt-1 border-t border-gray-50 pt-2.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-[10px] font-semibold text-gray-500 tracking-tight">
                {post?.startDate?.replace(/-/g,'.') || '2026.05.02'} ~ {post?.endDate?.replace(/-/g,'.') || '2026.05.13'}
              </span>
        </div>
      </div>
    </div>

    {/* Responsive Menu - 하단 링크 제어바 */}
    <div className="md:w-full bg-white rounded-[10px] border border-[#E5E7EB] p-3 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden">
      <div className="flex flex-col gap-1 w-full text-left">

        {/* 일반 메뉴 그룹 */}
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 px-3 mt-1">
              일반
            </span>
        <MenuButton
            icon={<Layout size={15} />}
            label="일정"
            active={selectedMenuItem === 'all' || selectedMenuItem === 'unit_detail'}
            onClick={() => setMenuItem('all')}
        />
        {selectedItem && (
            <MenuButton
                icon={<MapPin size={15} />}
                label="상세"
                active={selectedMenuItem === 'unit_detail'}
                onClick={() => setMenuItem('unit_detail')}
            />
        )}
        <MenuButton
            icon={<Users size={15} />}
            label="참여"
            active={selectedMenuItem === 'participation'}
            onClick={() => setMenuItem('participation')}
        />
        <MenuButton
            icon={<PenTool size={15} />}
            label="기록"
            active={selectedMenuItem === 'record'}
            onClick={() => setMenuItem('record')}
        />

        {/* 관리자 메뉴 그룹 */}
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 px-3 border-t border-gray-50 pt-3.5 mt-2">
              관리자 메뉴
            </span>
        <MenuButton
            icon={<Edit size={15} />}
            label="수정"
            active={selectedMenuItem === 'edit'}
            onClick={() => setMenuItem('edit')}
        />
        <MenuButton
            icon={<UserCog size={15} />}
            label="관리"
            active={selectedMenuItem === 'manage'}
            onClick={() => setMenuItem('manage')}
        />

      </div>
    </div>
  </div>
);
};

const MenuButton = ({ icon, label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
            active
                ? 'bg-[#F0F7FF] text-[#007AFF]'
                : 'text-gray-500 hover:bg-gray-50'
        }`}
    >
    <span className={`shrink-0 ${active ? 'text-[#007AFF]' : 'text-gray-400'}`}>
      {icon}
    </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
);