/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const DayStepper = ({ days, currentDay, onSelectDay }) => {
  return (
    <div className="relative px-4 mb-12 md:mb-20">
      <div className="absolute inset-x-0 top-[24px] md:top-[28px] -translate-y-1/2 h-[2px] bg-brown-deep/5 z-0 mx-8 md:mx-14" />
      <div className="flex items-center justify-between relative z-10 overflow-x-auto scrollbar-hide py-4 px-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`flex flex-col items-center group transition-all shrink-0 px-3 md:px-4 ${currentDay === day ? 'scale-105 md:scale-110' : 'opacity-40 hover:opacity-100'}`}
          >
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-display text-base md:text-xl border-2 md:border-4 transition-all ${currentDay === day ? 'bg-mint text-white border-white shadow-2xl shadow-mint/30' : 'bg-white text-brown-deep border-brown-deep/5 shadow-sm'}`}>
              {day}
            </div>
            <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-3 md:mt-4 transition-colors ${currentDay === day ? 'text-brown-deep' : 'text-brown-light'}`}>Day {day}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
