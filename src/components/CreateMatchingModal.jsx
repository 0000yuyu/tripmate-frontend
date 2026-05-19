/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, Clock, MessageSquare, Heart, Loader2 } from 'lucide-react';
import { matchingService } from '../services';

export const CreateMatchingModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lat: 37.5665,
    lng: 126.9780,
    scheduledAt: '',
    recruitedAt: '',
    chatUrl: '',
    ie: 'E',
    sn: 'S',
    tf: 'T',
    pj: 'P',
    preferenceGender: 'NONE',
    allowSmoking: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure ISO format for dates or format as required by API
      const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        recruitedAt: formData.recruitedAt ? new Date(formData.recruitedAt).toISOString() : null,
      };

      await matchingService.createMatching(payload);
      alert('매칭방이 생성되었습니다!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating matching:', error);
      alert('매칭방 생성 중 오류가 발생했습니다.');
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
            <h2 className="text-2xl font-black text-[#333333]">새 매칭방 개설</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} className="text-[#999999]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
            <section className="space-y-4">
              <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">기본 정보</label>
              <div className="space-y-4">
                <input 
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="매칭방 제목 (예: 한강 야경 산책)"
                  className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="모임 설명을 적어주세요."
                  rows={3}
                  className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-medium focus:outline-none transition-all resize-none"
                />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-4">
                <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">모임 일시</label>
                <input 
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none font-mono"
                />
              </section>
              <section className="space-y-4">
                <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">모집 마감</label>
                <input 
                  type="datetime-local"
                  name="recruitedAt"
                  value={formData.recruitedAt}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none font-mono"
                />
              </section>
            </div>

            <section className="space-y-4">
              <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">채팅 주소</label>
              <div className="relative">
                <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 text-[#999999]" size={18} />
                <input 
                  name="chatUrl"
                  value={formData.chatUrl}
                  onChange={handleChange}
                  placeholder="오픈카톡 링크 등"
                  className="w-full pl-14 pr-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none transition-all"
                />
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">매칭 조건 (선호 MBTI)</label>
              <div className="grid grid-cols-4 gap-4">
                {['ie', 'sn', 'tf', 'pj'].map((type) => (
                  <select 
                    key={type}
                    name={type}
                    value={formData[type]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm font-black focus:outline-none"
                  >
                    <option value={type === 'ie' ? 'I' : type === 'sn' ? 'S' : type === 'tf' ? 'T' : 'J'}>
                      {type === 'ie' ? 'I' : type === 'sn' ? 'S' : type === 'tf' ? 'T' : 'J'}
                    </option>
                    <option value={type === 'ie' ? 'E' : type === 'sn' ? 'N' : type === 'tf' ? 'F' : 'P'}>
                      {type === 'ie' ? 'E' : type === 'sn' ? 'N' : type === 'tf' ? 'F' : 'P'}
                    </option>
                  </select>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-8 px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  name="allowSmoking"
                  checked={formData.allowSmoking}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg border-[#E5E7EB] text-[#007AFF] focus:ring-[#007AFF]/20 cursor-pointer"
                />
                <span className="text-sm font-bold text-[#666666] group-hover:text-[#333333]">흡연 허용</span>
              </label>

              <div className="flex items-center gap-3">
                 <span className="text-sm font-bold text-[#666666]">성별 조건</span>
                 <select 
                  name="preferenceGender"
                  value={formData.preferenceGender}
                  onChange={handleChange}
                  className="px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none"
                 >
                   <option value="NONE">상관없음</option>
                   <option value="MALE">남성만</option>
                   <option value="FEMALE">여성만</option>
                   <option value="BOTH">혼성</option>
                 </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black shadow-xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : '매칭방 만들기'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
