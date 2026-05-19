/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ChevronRight, Plus, Settings, Calendar, Clock } from 'lucide-react';
import { AddProductModal } from './AddProductModal';

export const ProductManagementView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('product');

  const productGroups = [
    {
      id: 'p1',
      name: '시부야 스카이 전망대 입장권',
      category: '액티비티',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=200',
      vouchers: [
        { date: '5월 21일 (목)', price: '₩45,000', sales: 48, status: '판매 중', stock: 120 },
        { date: '5월 22일 (금)', price: '₩45,000', sales: 32, status: '판매 중', stock: 150 },
        { date: '5월 23일 (토)', price: '₩45,000', sales: 15, status: '판매 중', stock: 100 },
      ]
    },
    {
      id: 'p2',
      name: '도쿄 메트로 24시간 패스',
      category: '교통권',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=200',
      vouchers: [
        { date: '5월 21일 (목)', price: '₩12,000', sales: 124, status: '판매 중', stock: 500 },
        { date: '5월 22일 (금)', price: '₩12,000', sales: 98, status: '판매 중', stock: 500 },
      ]
    },
    {
      id: 'p3',
      name: '기온 거리 킴모노 체험',
      category: '문화체험',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=200',
      vouchers: [
        { date: '5월 22일 (금)', price: '₩55,000', sales: 12, status: '매진 임박', stock: 5 },
      ]
    }
  ];

  // Group by date logic
  const dateGroups = useMemo(() => {
    const groups = {};
    productGroups.forEach(product => {
      product.vouchers.forEach(voucher => {
        if (!groups[voucher.date]) groups[voucher.date] = [];
        groups[voucher.date].push({
          ...voucher,
          productName: product.name,
          productImage: product.image,
          category: product.category
        });
      });
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])).map(([date, items]) => ({
      date,
      items
    }));
  }, [productGroups]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto space-y-12 pb-20 pt-8"
    >
      {/* Notion Style Page Header */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-sm text-[#999999] font-medium">
          <span className="hover:bg-gray-100 px-1.5 py-0.5 rounded cursor-pointer transition-colors">파트너 센터</span>
          <ChevronRight size={12} />
          <span className="text-[#333333] font-semibold">상품 관리</span>
        </div>
        
        <div className="flex items-end justify-between group">
          <div className="space-y-4">
            <div className="text-[72px] leading-none select-none hover:scale-110 transition-transform cursor-default inline-block">📦</div>
            <div className="space-y-1">
              <h2 className="text-[40px] font-bold text-[#333333] tracking-tight flex items-center gap-3">
                글로벌 트래블 (주) <span className="px-2 py-0.5 bg-[#F2F4F7] text-[#999999] text-[10px] font-black rounded uppercase mt-1">PRO</span>
              </h2>
              <p className="text-[#666666] font-medium">
                가이드 투어 및 입장권 <span className="text-[#333333] font-bold decoration-[#007AFF]/30 decoration-4 underline underline-offset-4">일자별 재고 관리</span> 시스템
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#007AFF] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0056B3] active:scale-95 transition-all text-sm shadow-sm"
          >
            <Plus size={16} strokeWidth={3} />
            새 상품 등록
          </button>
        </div>
      </div>

      {/* Database Section */}
      <div className="space-y-10">
         <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-6">
               <button 
                 onClick={() => setViewMode('product')}
                 className={`flex items-center gap-1.5 text-sm pb-2 -mb-2 px-1 transition-all ${
                   viewMode === 'product' ? 'font-bold text-[#333333] border-b-2 border-[#333333]' : 'font-medium text-[#999999] hover:text-[#666666]'
                 }`}
               >
                  <LayoutDashboard size={14} />
                  <span>상품별 보기</span>
               </button>
               <button 
                 onClick={() => setViewMode('date')}
                 className={`flex items-center gap-1.5 text-sm pb-2 -mb-2 px-1 transition-all ${
                   viewMode === 'date' ? 'font-bold text-[#333333] border-b-2 border-[#333333]' : 'font-medium text-[#999999] hover:text-[#666666]'
                 }`}
               >
                  <Calendar size={14} />
                  <span>일자별 보기</span>
               </button>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => alert("데이터 내보내기")} className="text-xs font-bold text-[#666666] hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-gray-200">
                  내보내기 (Export)
               </button>
               <div className="h-4 w-[1px] bg-gray-200" />
               <button onClick={() => alert("필터")} className="text-xs font-bold text-[#666666] hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-all">
                  필터
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-12">
            {viewMode === 'product' ? (
              productGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-4">
                   {/* Product Header Row */}
                   <div className="flex items-center gap-4 px-2 group cursor-pointer">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                         <img src={group.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2">
                            <h4 className="text-xl font-bold text-[#333333]">{group.name}</h4>
                            <span className="px-2 py-0.5 bg-gray-100 text-[#666666] text-[10px] font-bold rounded">{group.category}</span>
                         </div>
                         <p className="text-xs text-[#999999] font-medium">등록된 이용권 옵션 {group.vouchers.length}개</p>
                      </div>
                      <button className="p-2 text-[#999999] hover:text-[#333333] hover:bg-gray-100 rounded-lg transition-all">
                         <Settings size={18} />
                      </button>
                   </div>
  
                   {/* Child Table for Vouchers */}
                   <div className="ml-16 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-[#F9FAFB] border-b border-gray-200">
                            <tr className="text-[11px] font-black text-[#999999] uppercase tracking-wider">
                               <th className="px-4 py-2.5 font-black">이용 일자</th>
                               <th className="px-4 py-2.5 font-black text-right">가격</th>
                               <th className="px-4 py-2.5 font-black text-center">판매 상태</th>
                               <th className="px-4 py-2.5 font-black text-right">잔여 수량</th>
                               <th className="px-4 py-2.5 font-black">판매 추이</th>
                               <th className="px-4 py-2.5 w-16"></th>
                            </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-100">
                            {group.vouchers.map((v, i) => (
                              <tr key={i} className="group hover:bg-[#F9FAFB]/60 transition-colors">
                                 <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#333333]">
                                       <Calendar size={14} className="text-[#007AFF]" />
                                       {v.date}
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <span className="text-sm font-bold text-[#333333]">{v.price}</span>
                                 </td>
                                 <td className="px-4 py-3.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      v.status === '판매 중' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                      {v.status}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <span className={`text-sm font-bold ${v.stock < 10 ? 'text-red-500' : 'text-[#666666]'}`}>
                                       {v.stock}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                                          <div className="h-full bg-[#007AFF]/60 rounded-full" style={{ width: `${Math.min(100, (v.sales / v.stock) * 100)}%` }} />
                                       </div>
                                       <span className="text-[11px] font-bold text-[#999999]">{v.sales}</span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button className="p-1 text-[#999999] hover:text-[#333333] hover:bg-white rounded transition-all">
                                          <Clock size={14} />
                                       </button>
                                       <button className="p-1 text-[#999999] hover:text-[#333333] hover:bg-white rounded transition-all">
                                          <Settings size={14} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                            <tr>
                               <td colSpan={6} className="px-4 py-3">
                                  <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-[11px] font-bold text-[#999999] hover:text-[#007AFF] flex items-center gap-1.5 transition-colors"
                                  >
                                     <Plus size={12} />
                                     새 일자 이용권 추가
                                  </button>
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
              ))
            ) : (
              dateGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-4">
                   {/* Date Header Row */}
                   <div className="flex items-center gap-3 px-1 group cursor-pointer">
                      <ChevronRight size={18} className="text-[#333333] group-hover:bg-gray-100 rounded transition-colors" />
                      <h4 className="text-lg font-bold text-[#333333] flex items-center gap-2">
                         {group.date}
                         <span className="text-sm font-medium text-[#999999]">{group.items.length}</span>
                      </h4>
                   </div>
  
                   {/* Date Table Layout */}
                   <div className="ml-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-[#F9FAFB] border-b border-gray-200">
                            <tr className="text-[11px] font-black text-[#999999] uppercase tracking-wider">
                               <th className="px-4 py-2.5 font-black">상품</th>
                               <th className="px-4 py-2.5 font-black text-right">가격</th>
                               <th className="px-4 py-2.5 font-black text-center">판매 상태</th>
                               <th className="px-4 py-2.5 font-black text-right">잔여 수량</th>
                               <th className="px-4 py-2.5 font-black">판매 추이</th>
                               <th className="px-4 py-2.5 w-16"></th>
                            </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-100">
                            {group.items.map((item, i) => (
                              <tr key={i} className="group hover:bg-[#F9FAFB]/60 transition-colors">
                                 <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="flex flex-col">
                                          <span className="text-sm font-bold text-[#333333]">{item.productName}</span>
                                          <span className="text-[10px] text-[#999999] font-medium">{item.category}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <span className="text-sm font-bold text-[#333333]">{item.price}</span>
                                 </td>
                                 <td className="px-4 py-3.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      item.status === '판매 중' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                      {item.status}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <span className={`text-sm font-bold ${item.stock < 10 ? 'text-red-500' : 'text-[#666666]'}`}>
                                       {item.stock}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                       <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                                          <div className="h-full bg-[#007AFF]/60 rounded-full" style={{ width: `${Math.min(100, (item.sales / item.stock) * 100)}%` }} />
                                       </div>
                                       <span className="text-[11px] font-bold text-[#999999]">{item.sales}</span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button className="p-1 text-[#999999] hover:text-[#333333] hover:bg-white rounded transition-all">
                                          <Clock size={14} />
                                       </button>
                                       <button className="p-1 text-[#999999] hover:text-[#333333] hover:bg-white rounded transition-all">
                                          <Settings size={14} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              ))
            )}
         </div>
      </div>

      <div className="pt-12 border-t border-gray-100">
         <div className="bg-[#F9FAFB] rounded-2xl p-8 flex items-center justify-between group hover:border-[#007AFF]/20 border border-transparent transition-all">
            <div className="space-y-4">
               <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#333333] tracking-tight">트립메이트 파트너 도움말</h3>
                  <p className="text-sm font-medium text-[#666666]">효율적인 이용권 재고 관리와 정산을 위한 가이드를 확인하세요.</p>
               </div>
               <div className="flex gap-3">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#666666] cursor-pointer hover:bg-gray-50 transition-colors">재고 관리 팁</span>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#666666] cursor-pointer hover:bg-gray-50 transition-colors">정산 안내</span>
               </div>
            </div>
            <button className="bg-white text-[#333333] p-4 rounded-xl border border-gray-200 shadow-sm group-hover:scale-105 transition-all">
               <ChevronRight size={24} />
            </button>
         </div>
      </div>

      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
};
