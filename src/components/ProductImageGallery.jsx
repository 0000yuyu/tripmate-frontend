/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const ProductImageGallery = ({ images, selectedImage, setSelectedImage }) => {
  return (
    <div className="space-y-6">
      <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group cursor-zoom-in">
        <img src={images[selectedImage]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        <div className="absolute top-8 left-8 flex gap-3">
          <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-[#007AFF] shadow-sm">BEST SELL</span>
          <span className="bg-[#007AFF]/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-white shadow-sm">50% OFF</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedImage(i)}
            className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[#007AFF] shadow-md scale-95' : 'border-transparent hover:border-[#E5E7EB]'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
