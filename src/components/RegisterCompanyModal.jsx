/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Globe, Phone, FileText, Loader2 } from 'lucide-react';
import { companyService } from '../services';

export const RegisterCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegistrationNumber: '',
    ceoName: '',
    address: '',
    phoneNumber: '',
    email: '',
    websiteUrl: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await companyService.registerCompany(formData);
      const companyId = response.data.data.companyId;
      localStorage.setItem('X_COMPANY_ID', companyId);
      alert('업체 등록 신청이 완료되었습니다!');
      onSuccess?.(companyId);
      onClose();
    } catch (error) {
      console.error('Error registering company:', error);
      alert('업체 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#333333]">판매 파트너 등록</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} className="text-[#999999]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">회사명</p>
                <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">사업자 등록번호</p>
                <input required name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">대표자명</p>
                <input required name="ceoName" value={formData.ceoName} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">연락처</p>
                <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#666666] ml-2">이메일</p>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#666666] ml-2">회사 주소</p>
              <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#666666] ml-2">웹사이트 (선택)</p>
              <input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#666666] ml-2">회사 소개</p>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-5 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-medium focus:outline-none resize-none" />
            </div>

            <button disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black shadow-xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : '등록 신청하기'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
