/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, ShoppingCart, Calendar } from 'lucide-react';

export const ProductPurchaseCard = ({ quantity, setQuantity, onOrder, onAddToCart }) => {
  return (
    <div className="p-8 bg-[#F9FAFB] rounded-[32px] border border-gray-100 space-y-6">
       <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-black text-[#333333]">₩45,000</span>
          <span className="text-lg font-bold text-[#999999] line-through">₩89,000</span>
          <span className="text-xl font-black text-[#FF4D4D] ml-auto">50%</span>
       </div>
       <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
             <span className="text-sm font-bold text-[#666666]">인원 선택</span>
             <div className="flex items-center gap-4 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-bold text-[#999999] hover:text-[#333333]">-</button>
                <span className="text-lg font-black text-[#333333] w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-bold text-[#999999] hover:text-[#333333]">+</button>
             </div>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-sm font-bold text-[#666666]">예약 날짜</span>
             <button onClick={() => alert("달력 팝업")} className="flex items-center gap-3 px-6 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-black text-[#333333] shadow-sm">
                <Calendar size={18} className="text-[#007AFF]" /> 2026.05.20 (수)
             </button>
          </div>
       </div>
       <button onClick={onOrder} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
          <CreditCard size={24} /> 지금 주문하기
       </button>
       <button onClick={onAddToCart} className="w-full bg-white border border-[#E5E7EB] text-[#333333] py-5 rounded-2xl text-xl font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm">
          <ShoppingCart size={24} /> 장바구니 담기
       </button>
    </div>
  );
};
