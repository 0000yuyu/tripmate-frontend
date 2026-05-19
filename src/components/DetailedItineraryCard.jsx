/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Activity, 
  MessageSquare, 
  ArrowRight,
  Plus
} from 'lucide-react';

export const DetailedItineraryCard = ({ 
  item, 
  isSelected, 
  onToggleSelect, 
  onViewRecord 
}) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (e) => {
    e.stopPropagation();
    setIsJoined(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative mb-8 md:mb-12 last:mb-0"
    >
      <div className="absolute -left-[24px] md:-left-[32px] top-8 bottom-[-32px] md:bottom-[-48px] w-0.5 bg-brown-deep/5 last:hidden" />
      <div className={`absolute -left-[28px] md:-left-[36px] top-8 w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ring-2 md:ring-4 ring-cream transition-all duration-500 z-10 ${item.status === 'completed' || isJoined || isSelected ? 'bg-mint scale-125' : 'bg-brown-deep/20'}`} />
      
      <div className="absolute -left-[45px] md:-left-[54px] top-7 z-20">
        <button 
          onClick={() => item.status !== 'completed' && onToggleSelect(item.id)}
          className={`w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg border-2 flex items-center justify-center transition-all ${item.status === 'completed' ? 'hidden' : isSelected ? 'bg-mint border-mint text-white' : 'bg-white border-brown-deep/10 hover:border-mint'}`}
        >
          {isSelected && <Plus size={14} className="rotate-0" />}
        </button>
      </div>

      <div className={`group relative bg-white rounded-2xl md:rounded-[32px] border transition-all duration-500 overflow-hidden cursor-pointer ${item.status === 'completed' ? 'border-mint/20 shadow-lg shadow-mint/5' : isSelected || isJoined ? 'border-mint/40 shadow-xl shadow-mint/5 ring-1 ring-mint/10' : 'border-brown-deep/5 hover:border-mint/30 hover:shadow-2xl hover:shadow-brown-deep/5'}`}
           onClick={() => item.status !== 'completed' && onToggleSelect(item.id)}>
        <div className="p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 shrink-0 md:min-w-[100px]">
             <div className="space-y-0.5 md:space-y-1">
                <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] block ${item.status === 'completed' || isJoined ? 'text-mint' : 'text-brown-light'}`}>Schedule</span>
                <span className={`text-lg md:text-xl font-display font-bold block ${item.status === 'completed' || isJoined ? 'text-mint' : 'text-brown-deep'}`}>{item.time}</span>
             </div>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-700 shadow-sm ${item.status === 'completed' || isJoined ? 'bg-mint text-white rotate-6' : 'bg-cream text-brown-deep group-hover:bg-mint group-hover:text-white group-hover:-rotate-3'}`}>
              {item.type === 'flight' && <Plane size={24} />}
              {item.type === 'destination' && <MapPin size={24} />}
              {item.type === 'hotel' && <Calendar size={24} />}
              {item.type === 'activity' && <Activity size={24} />}
            </div>
          </div>

          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 md:gap-6">
              <div>
                <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-2">
                  <h4 className={`text-xl md:text-3xl font-display font-bold leading-tight tracking-tight transition-colors ${item.status === 'completed' || isJoined || isSelected ? 'text-mint' : 'text-brown-deep group-hover:text-mint'}`}>{item.title}</h4>
                  {item.status === 'completed' && <span className="px-2 py-0.5 bg-mint/10 text-mint text-[8px] md:text-[9px] font-bold uppercase rounded-md tracking-widest leading-none">Logged</span>}
                  {(isJoined || isSelected) && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-2 py-0.5 bg-brown-deep text-cream text-[8px] md:text-[9px] font-bold uppercase rounded-md tracking-widest flex items-center gap-1 leading-none">{isSelected ? 'Selected' : 'Participating'}</motion.span>}
                </div>
                <p className="text-brown-light flex items-center gap-1.5 md:gap-2 font-medium text-xs md:text-sm">
                  <MapPin size={14} className="opacity-40" /> {item.location}
                </p>
              </div>
              
              <div className="shrink-0 flex items-center">
                {item.status === 'completed' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewRecord?.(item.id); }}
                    className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-mint text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold hover:bg-mint-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-mint/20"
                  >
                    <MessageSquare size={14} /> View Record
                  </button>
                ) : isJoined ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-cream text-mint rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 border border-mint/20"
                  >
                    <Plane size={14} /> Course Secured
                  </motion.div>
                ) : (
                  <button 
                    onClick={handleJoin}
                    className="w-full md:w-auto relative px-6 md:px-8 py-3 md:py-4 bg-brown-deep text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold hover:bg-mint transition-all shadow-lg shadow-brown-deep/10 hover:shadow-mint/20 flex items-center justify-center gap-2 group/btn overflow-hidden"
                  >
                    <motion.div 
                      animate={{ opacity: [0.1, 0.3, 0.1], x: ['-100%', '200%'] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-white"
                    />
                    <span className="relative z-10 flex items-center gap-2">
                       Join Course <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-brown-deep/70 text-[11px] md:text-sm leading-relaxed max-w-2xl font-medium">
              {item.description || "Embark on an unforgettable experience."}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 border-t border-brown-deep/5">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-bold text-brown-light uppercase tracking-widest">Pricing</p>
                   <p className="text-xs md:text-sm font-bold text-brown-deep">{item.price || "Contact for Info"}</p>
                </div>
                <div className="w-px h-6 md:h-8 bg-brown-deep/10" />
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-bold text-brown-light uppercase tracking-widest">Availability</p>
                   <p className="text-xs md:text-sm font-bold text-mint">{item.currentMembers}/{item.maxMembers} Joined</p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-[8px] md:text-[10px] font-bold text-brown-light uppercase tracking-widest">Active Crew</span>
                <div className="flex -space-x-2 md:-space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-4 border-white bg-cream overflow-hidden shadow-sm relative group/avatar">
                      <img src={`https://picsum.photos/seed/p${i+20}/100/100`} alt="Activity member" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-mint/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-4 border-white bg-mint flex items-center justify-center text-white text-[8px] md:text-[10px] font-bold shadow-sm relative z-10 cursor-pointer hover:scale-110 transition-transform">
                    +4
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
