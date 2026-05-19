/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, XCircle, Send, Loader2 } from 'lucide-react';
import axiosInstance from "@/utils/axiosInstance.js";

export const CreateFeedModal = ({ isOpen, onClose, planUnitId, onSuccess,onFail }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('planUnitId', planUnitId);
      formData.append('visibilityType', visibility);
      images.forEach(img => formData.append('originImages', img));

      console.log(formData)

      await axiosInstance.post("/feeds",formData,{
        headers : {
          "Content_type" : 'multipart/form-data'
        }
      });
      onSuccess();
      onClose();
    } catch (error) {
      onFail(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#333333]">여행 기록하기</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} className="text-[#999999]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full text-2xl font-black text-[#333333] border-none focus:ring-0 placeholder:text-gray-200"
              />
              <textarea 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘의 여정은 어떠셨나요?"
                rows={5}
                className="w-full text-lg font-medium text-[#666666] border-none focus:ring-0 placeholder:text-gray-200 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden group">
                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-[#999999] hover:bg-gray-50 hover:border-[#007AFF] hover:text-[#007AFF] transition-all cursor-pointer">
                  <Camera size={24} />
                  <span className="text-[10px] font-black uppercase">Add Photo</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <select 
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="px-6 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full text-xs font-black text-[#666666] focus:outline-none"
              >
                <option value="PUBLIC">전공개</option>
                <option value="FRIENDS">친구공개</option>
                <option value="PRIVATE">나만보기</option>
              </select>

              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#007AFF] text-white px-10 py-4 rounded-full font-black shadow-lg shadow-[#007AFF]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                게시하기
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
