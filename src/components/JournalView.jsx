/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { message } from 'antd';
import { StoryDetailModal } from './StoryDetailModal.jsx';
import { CreateFeedModal } from './CreateFeedModal.jsx';
import axiosInstance from "@utils/axiosInstance.js";

export const JournalView = ({ selectedUnit }) => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);

  const fetchFeeds = async () => {
    if (!selectedUnit?.id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/feeds/${selectedUnit.id}`);
      setFeeds(response.data.data?.responses || response.data?.data || []);
      console.log(response.data.data.responses)
    } catch (error) {
      message.error("피드 기록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [selectedUnit?.id]);

  return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">공유된 인증 피드 ({feeds.length})</span>
          <button
              onClick={() => setIsNewStoryModalOpen(true)}
              className="bg-[#007AFF] text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
          >
            <Plus size={12} strokeWidth={3} /> 피드 추가
          </button>
        </div>

        {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#007AFF]" size={24} /></div>
        ) : feeds.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {feeds.map((feed) => (
                  <div
                      key={feed.id}
                      onClick={() => setSelectedFeed(feed)}
                      className="relative aspect-square bg-slate-50 border border-slate-100 rounded-lg overflow-hidden cursor-pointer group shadow-sm"
                  >
                    {feed.imageUrls?.[0] ? (
                        <img src={feed.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300"><ImageIcon size={16}/></div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-black">
                      <span className="flex items-center gap-1"><MessageCircle size={14} fill="currentColor" /> {feed.comments?.length || 0}</span>
                    </div>
                  </div>
              ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-white border border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs font-bold">
              <ImageIcon size={32} className="opacity-20 mb-2" />
              등록된 추억 피드가 비어있습니다. 첫 피드를 남겨보세요!
            </div>
        )}

        <AnimatePresence>
          {selectedFeed &&
              <StoryDetailModal story={selectedFeed}
                                onClose={() => setSelectedFeed(null)} />}
        </AnimatePresence>

        <CreateFeedModal
            isOpen={isNewStoryModalOpen}
            onClose={() => setIsNewStoryModalOpen(false)}
            planUnitId={selectedUnit?.id}
            onSuccess={() => {
              setIsNewStoryModalOpen(false);
              message.success("추억이 피드에 등록되었습니다.");
              fetchFeeds();
            }}
        />
      </motion.div>
  );
};