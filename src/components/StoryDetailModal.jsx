/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowRight, Plus, Lock, Globe } from 'lucide-react';

export const StoryDetailModal = ({ 
  story, 
  onClose, 
  onAddComment 
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    if (story.id.startsWith('local-')) {
      onAddComment(commentText);
    } else {
      alert("Note: This is a demo story. You can only add permanent comments to your local record posts.");
    }
    setCommentText("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-brown-deep/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.9 }}
        className="bg-cream w-full max-w-2xl rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-8 h-8 md:w-10 md:h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
        >
          <Plus className="rotate-45" size={20} />
        </button>

        <div className="relative aspect-[3/2] bg-brown-deep/10">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIdx}
              src={story.images[currentImageIdx]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          {story.images.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
              {story.images.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentImageIdx(i)}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${i === currentImageIdx ? 'bg-mint w-4 md:w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 flex-1 overflow-y-auto scrollbar-hide">
          <div className="mb-6 md:mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
              <span className="px-2 md:px-3 py-1 bg-mint/10 text-mint rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest uppercase leading-none">Day {story.day}</span>
              {story.isPrivate ? (
                <span className="flex items-center gap-1 px-2 md:px-3 py-1 bg-brown-deep/5 text-brown-light rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest uppercase leading-none"><Lock size={10} /> Private</span>
              ) : (
                <span className="flex items-center gap-1 px-2 md:px-3 py-1 bg-mint/5 text-mint rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest uppercase leading-none"><Globe size={10} /> Public</span>
              )}
              {story.itineraryItemId && (
                <span className="px-2 md:px-3 py-1 bg-brown-deep/80 text-white rounded-lg text-[8px] md:text-[10px] font-bold tracking-widest uppercase leading-none">Itinerary Focused</span>
              )}
            </div>
            
            <h2 className="font-display text-2xl md:text-4xl font-bold text-brown-deep leading-tight">{story.title || story.placeName}</h2>
            <div className="flex items-center gap-2 mt-1 md:mt-2">
              <MapPin size={14} className="text-mint" />
              <span className="text-[10px] md:text-sm font-bold text-brown-light italic underline decoration-mint/30 decoration-2 underline-offset-4">{story.placeName}</span>
            </div>

            {story.content && (
              <div className="mt-4 md:mt-6 text-sm md:text-base text-brown-deep/80 font-medium leading-relaxed bg-white/50 p-4 md:p-6 rounded-2xl md:rounded-[32px] border border-brown-deep/5">
                {story.content}
              </div>
            )}
            
            <div className="flex -space-x-2 mt-6 items-center">
              {story.people.map((person, i) => (
                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-cream flex items-center justify-center text-[10px] md:text-xs font-bold text-brown-deep shadow-sm">
                  {person[0]}
                </div>
              ))}
              <div className="pl-4">
                <span className="text-[10px] md:text-xs font-bold text-brown-light italic">Captured with {story.people.length} explorers</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-brown-deep/5">
            <h3 className="font-display text-xl md:text-2xl font-bold text-brown-deep">Comments & Reactions</h3>
            {(story.comments?.length || 0) > 0 ? (
              <div className="space-y-4">
                {story.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-3 md:gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-mint/5 flex items-center justify-center text-mint font-bold shrink-0 border border-mint/10">
                      {comment.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs md:text-sm font-bold text-brown-deep">{comment.user}</span>
                        <span className="text-[9px] md:text-[10px] text-brown-light font-bold opacity-60 uppercase">{comment.date}</span>
                      </div>
                      <p className="text-xs md:text-sm text-brown-light font-medium leading-relaxed bg-cream/40 p-3 md:p-4 rounded-xl md:rounded-2xl border border-brown-deep/5 italic">"{comment.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center opacity-30">
                <p className="text-xs md:text-sm font-bold italic">Silence awaits... add the first comment!</p>
              </div>
            )}
            <div className="pt-4 sticky bottom-0 bg-cream pb-2">
              <form onSubmit={handleCommentSubmit} className="relative">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white border border-brown-deep/5 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-mint transition-all font-medium pr-12 text-xs md:text-sm"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-mint w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-mint/20">
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
