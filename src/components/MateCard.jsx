/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

export const MateCard = ({ post, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={() => onSelect(post)}
      className="bg-white border border-brown-deep/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer"
    >
      <div className="h-40 relative overflow-hidden">
        <img 
          src={post.image} 
          alt={post.destination} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-[10px] font-extrabold text-mint">
            {post.members} / {post.maxMembers}
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <img src={post.authorImage} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-mint/10" referrerPolicy="no-referrer" />
          <span className="text-[10px] font-bold text-brown-light uppercase tracking-tight">{post.author}</span>
        </div>
        
        <h3 className="font-display text-lg font-bold text-brown-deep mb-2 line-clamp-2 group-hover:text-mint transition-colors leading-snug">
          {post.title}
        </h3>

        <p className="text-[10px] font-bold text-brown-light/60 uppercase tracking-widest mb-4 flex items-center gap-1">
          <MapPin size={10} className="text-mint/60" /> {post.destination}
        </p>
        
        <div className="mt-auto pt-4 border-t border-brown-deep/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-brown-light flex items-center gap-1">
            <Calendar size={12} className="text-mint/60" /> {post.date ? post.date.split(' - ')[0] : ''}
          </span>
          <button className="text-[10px] font-extrabold text-brown-deep hover:text-mint transition-colors flex items-center gap-1">
            Join <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
