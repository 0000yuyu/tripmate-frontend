/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Search, MousePointer2 } from 'lucide-react';

export const MateCommunicationList = ({ mates }) => {
  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[40px] border border-gray-100 p-6 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.04)] min-h-full flex flex-col">
       <div className="flex items-center justify-between mb-8 md:mb-12">
          <h3 className="text-xl md:text-[28px] font-black text-[#333333] tracking-tight">최근 소통한 메이트 <span className="text-[#007AFF]">({mates.length})</span></h3>
       </div>

       <div className="relative mb-8 md:mb-10">
          <input type="text" placeholder="메이트 이름을 검색해보세요" className="w-full pl-12 md:pl-14 pr-6 py-4 md:py-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl md:rounded-[24px] text-sm md:text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 transition-all" />
          <Search size={20} className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-[#999999]" />
       </div>

       <div className="flex-1 space-y-4 md:space-y-6">
          {mates.map((mate, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8 bg-white border border-gray-50 rounded-[32px] group hover:border-[#007AFF]/20 hover:shadow-xl transition-all">
               <div className="flex items-center gap-6 md:gap-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[22px] md:rounded-[28px] overflow-hidden bg-[#F2F4F7] border-4 border-white shadow-lg shrink-0">
                     <img src={mate.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-lg md:text-xl font-black text-[#333333] tracking-tight">{mate.name}</span>
                        <span className="px-2 py-0.5 md:py-1 bg-green-50 text-green-500 rounded-lg text-[9px] md:text-[10px] font-black flex items-center gap-1 md:gap-1.5"><div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full animate-pulse" />ONLINE</span>
                     </div>
                     <p className="text-sm md:text-[15px] font-bold text-[#666666]">{mate.desc}</p>
                  </div>
               </div>
               <button onClick={() => alert(`${mate.name}님에게 메시지 전송`)} className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#007AFF] text-white px-6 md:px-8 py-3.5 md:py-4.5 rounded-xl md:rounded-2xl font-black text-sm md:text-[15px] shadow-xl shadow-[#007AFF]/10 hover:scale-105 active:scale-95 transition-all">
                  <MousePointer2 size={20} />메시지 보내기
               </button>
            </motion.div>
          ))}
       </div>
    </div>
  );
};
