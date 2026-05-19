/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RegisterCompanyModal } from './RegisterCompanyModal';

export const MyPageSidebar = ({ userData }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyId, setCompanyId] = useState(localStorage.getItem('X_COMPANY_ID'));

  return (
    <div className="w-full lg:w-[340px] shrink-0 space-y-6">
      <div className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] space-y-8 md:space-y-10">
         
         {/* Profile Info - Top on mobile */}
         <div className="flex flex-row lg:flex-col lg:space-y-8 lg:pt-0 pt-2 items-center gap-6 lg:gap-10 border-b lg:border-none pb-8 lg:pb-0 border-gray-50">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-[#F2F4F7] rounded-[24px] sm:rounded-[32px] lg:rounded-[48px] border-[4px] lg:border-[6px] border-white shadow-xl overflow-hidden rotate-3 hover:rotate-0 transition-transform shrink-0">
               <img src={userData.avatar} alt="Avatar" className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mt-2 lg:mt-4" />
            </div>
            <div className="text-left lg:text-center flex-1">
               <h2 className="text-xl sm:text-2xl font-black text-[#333333] tracking-tight">{userData.name}</h2>
               <p className="text-xs sm:text-sm font-bold text-[#999999] truncate whitespace-nowrap overflow-hidden max-w-[200px]">{userData.email}</p>
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black text-[#999999] uppercase tracking-[0.2em] ml-1">MY MENU</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
               {['Schedules', 'Memories', 'Products'].map(tab => (
                 <button key={tab} onClick={() => navigate(`/${tab.toLowerCase()}`)} 
                   className="w-full text-left px-5 sm:px-4 lg:px-6 py-4 bg-[#F9FAFB] text-[#666666] border border-transparent rounded-2xl font-black text-sm lg:text-[15px] transition-all hover:bg-white hover:border-[#007AFF] hover:text-[#007AFF]">
                    {tab === 'Schedules' ? '참여 일정' : tab === 'Memories' ? '여행 일기' : '찜한 상품'}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-[#999999] uppercase tracking-[0.2em] ml-1">PARTNER MENU</label>
            <div className="space-y-2">
               {companyId ? (
                 <button onClick={() => navigate('/products/manage')}
                   className="w-full text-left px-6 py-4 bg-[#F9FAFB] text-[#007AFF] border border-transparent rounded-2xl font-black text-sm lg:text-[15px] transition-all hover:bg-white hover:border-[#007AFF] group shadow-sm bg-blue-50/50">
                    <div className="flex items-center justify-between"><span>업체 상품 관리</span><Briefcase size={16} className="text-[#007AFF]" /></div>
                 </button>
               ) : (
                 <button onClick={() => setIsModalOpen(true)}
                   className="w-full text-left px-6 py-4 bg-white text-[#333333] border border-[#E5E7EB] rounded-2xl font-black text-sm lg:text-[15px] transition-all hover:border-[#007AFF] hover:text-[#007AFF] group flex items-center justify-between">
                    <span>파트너 등록하기</span><Building2 size={16} />
                 </button>
               )}
            </div>
         </div>

         <RegisterCompanyModal 
           isOpen={isModalOpen} 
           onClose={() => setIsModalOpen(false)} 
           onSuccess={(id) => setCompanyId(id)} 
         />
      </div>
    </div>
  );
};
