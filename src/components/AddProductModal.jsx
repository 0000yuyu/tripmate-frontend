/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Plus, Calendar, Tag, CreditCard } from 'lucide-react';

export const AddProductModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-[800px] rounded-[40px] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
             <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#333333]">새 상품 등록</h3>
                <p className="text-sm font-bold text-[#999999]">트립메이트 파트너를 위한 상품 상세 설정을 입력해주세요.</p>
             </div>
             <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl text-[#999999] transition-colors">
                <X size={24} />
             </button>
          </div>

          <div className="p-10 overflow-y-auto max-h-[70vh] grid grid-cols-2 gap-10">
             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-sm font-black text-[#333333] flex items-center gap-2">
                      <Camera size={16} className="text-[#007AFF]" />
                      대표 이미지
                   </label>
                   <div className="aspect-video bg-[#F9FAFB] border-2 border-dashed border-[#E5E7EB] rounded-[32px] flex flex-col items-center justify-center gap-3 group hover:border-[#007AFF] hover:bg-[#F0F7FF] transition-all cursor-pointer">
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-[#999999] group-hover:text-[#007AFF]">
                         <Plus size={32} />
                      </div>
                      <p className="text-xs font-black text-[#999999] group-hover:text-[#007AFF]">이미지 업로드 (최대 5MB)</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-sm font-black text-[#333333] flex items-center gap-2">
                      <Tag size={16} className="text-[#007AFF]" />
                      기본 정보
                   </label>
                   <div className="space-y-4">
                      <input type="text" placeholder="상품명을 입력하세요" className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 transition-all" />
                      <div className="flex gap-4">
                         <div className="relative flex-1">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-[#333333]">₩</span>
                            <input type="number" placeholder="판매가" className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 transition-all" />
                         </div>
                         <div className="relative flex-1">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-[#FF4D4D]">%</span>
                            <input type="number" placeholder="할인율" className="w-full pl-12 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 transition-all" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-4">
                   <label className="text-sm font-black text-[#333333] flex items-center gap-2">
                      <Calendar size={16} className="text-[#007AFF]" />
                      스케줄 그룹 선택
                   </label>
                   <div className="grid grid-cols-1 gap-2">
                      {['시부야 올데이 투어', '교토 전통 문화 투어', '오사카 유니버설 일정'].map((s, i) => (
                        <button key={i} className={`w-full text-left px-6 py-4 border rounded-2xl text-sm font-bold transition-all ${
                           i === 0 ? 'bg-[#F0F7FF] border-[#007AFF] text-[#007AFF]' : 'bg-white border-[#E5E7EB] text-[#666666] hover:bg-gray-50'
                        }`}>
                           {s}
                        </button>
                      ))}
                      <button className="w-full text-center px-6 py-4 border border-dashed border-[#E5E7EB] rounded-2xl text-xs font-black text-[#999999] hover:bg-gray-50 transition-all">
                         + 새로운 스케줄 그룹 만들기
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-sm font-black text-[#333333] flex items-center gap-2">
                      <CreditCard size={16} className="text-[#007AFF]" />
                      판매 옵션
                   </label>
                   <div className="p-6 bg-gray-50 rounded-[28px] space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-black text-[#666666]">즉시 결제 활성화</span>
                         <div className="w-10 h-6 bg-[#007AFF] rounded-full relative p-1">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-black text-[#666666]">재고 수량 제한</span>
                         <input type="number" defaultValue={99} className="w-16 bg-white border border-[#E5E7EB] rounded-lg text-center text-xs font-bold py-1" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-8 bg-[#F9FAFB] flex gap-4">
             <button onClick={onClose} className="flex-1 py-5 bg-white border border-[#E5E7EB] rounded-2xl text-lg font-black text-[#666666] hover:bg-gray-50 transition-all">취소</button>
             <button onClick={onClose} className="flex-[2] py-5 bg-[#007AFF] text-white rounded-2xl text-lg font-black shadow-xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-95 transition-all">상품 등록 완료</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
