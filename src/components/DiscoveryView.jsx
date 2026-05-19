/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MateRecruitment } from './MateRecruitment';

export const DiscoveryView = ({ onSelectPost }) => {
  const handleViewGuide = () => {
    alert("Kyoto guide is coming soon! Stay tuned.");
  };

  const handleCategoryClick = (label) => {
    alert(`Filtering for ${label} related plans next to you!`);
  };

  const handleViewAllCategories = () => {
    alert("Showing all categories...");
  };

  return (
    <div className="space-y-10 md:space-y-16 pb-20">
      <section className="relative h-[240px] sm:h-[300px] md:h-[500px] rounded-[32px] md:rounded-[48px] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200" 
          alt="Featured Destination" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-deep/80 via-brown-deep/20 to-transparent" />
        <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 max-w-2xl px-2">
          <span className="px-3 md:px-4 py-0.5 md:py-1 bg-mint text-white rounded-full text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-2 md:mb-4 inline-block">Featured Destination</span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 md:mb-6 leading-tight tracking-tighter">Explore Kyoto</h1>
          <p className="text-white/80 text-[10px] sm:text-base md:text-lg font-medium leading-relaxed mb-4 md:mb-8 line-clamp-2 md:line-clamp-none">
            Discover tranquil temples and traditional tea houses in the heart of Japan.
          </p>
          <button 
            onClick={handleViewGuide}
            className="px-5 md:px-8 py-2 md:py-4 bg-white text-brown-deep rounded-xl md:rounded-2xl font-bold hover:bg-mint hover:text-white transition-all shadow-xl text-[10px] md:text-base active:scale-95"
          >
            View Kyoto Guide
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-brown-deep">Popular Categories</h3>
          <button 
            onClick={handleViewAllCategories}
            className="text-[10px] md:text-sm font-bold text-mint hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {[
            { label: 'Beach', icon: '🏖️' }, { label: 'City', icon: '🏙️' }, 
            { label: 'Mountains', icon: '🏔️' }, { label: 'Food', icon: '🍱' }, 
            { label: 'Camping', icon: '⛺' }, { label: 'Culture', icon: '⛩️' }
          ].map((cat, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(cat.label)}
              className="bg-white border border-brown-deep/5 p-4 md:p-6 rounded-2xl md:rounded-[32px] flex flex-col items-center gap-1.5 md:gap-3 shadow-sm hover:shadow-md transition-all h-full justify-center"
            >
              <span className="text-2xl md:text-3xl">{cat.icon}</span>
              <span className="text-[10px] md:text-sm font-bold text-brown-light group-hover:text-brown-deep transition-colors text-center leading-tight">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="mt-8 md:mt-12">
        <MateRecruitment onSelectPost={onSelectPost} />
      </div>
    </div>
  );
};
