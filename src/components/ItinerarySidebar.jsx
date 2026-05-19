/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, MapPin, Plane } from 'lucide-react';
import { MOCK_ITINERARY } from '../constants';

export const ItinerarySidebar = ({ selectedGraphIndices = [] }) => {
  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-brown-deep/5 shadow-sm overflow-hidden flex flex-col h-full">
      <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brown-light mb-6 md:mb-8 flex items-center gap-2">
        <Calendar size={14} className="text-mint" />
        Selected Plans
      </h3>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 min-h-[250px] md:min-h-[300px]">
        {selectedGraphIndices && selectedGraphIndices.length > 0 ? (
          MOCK_ITINERARY.map((day) => (
            <div key={day.day}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-brown-deep text-white flex items-center justify-center text-[10px] font-bold">
                  {day.day}
                </div>
                <span className="text-[10px] font-bold text-brown-light uppercase tracking-widest">{day.date}</span>
              </div>
              <div className="space-y-3">
                {day.items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-brown-deep/5 group hover:border-mint/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[8px] font-bold text-mint uppercase tracking-widest">{item.time}</span>
                      {item.price && <span className="text-[8px] font-bold text-brown-deep">{item.price}</span>}
                    </div>
                    <p className="text-sm font-bold text-brown-deep group-hover:text-mint transition-colors">{item.title}</p>
                    <p className="text-[10px] text-brown-light mt-1 flex items-center gap-1 font-medium">
                      <MapPin size={10} className="opacity-50" /> {item.location}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-4" />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
            <Plane size={32} className="mb-2" />
            <p className="text-[10px] font-bold">Select travel dates on the graph</p>
          </div>
        )}
      </div>
      <button 
        onClick={() => alert("Redirecting to full itinerary map view...")}
        className="w-full mt-6 py-2 text-[10px] font-bold text-mint hover:text-mint-dark underline transition-all"
      >
        View All Itineraries
      </button>
    </div>
  );
};
