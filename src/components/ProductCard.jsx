/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

export const ProductCard = ({ product, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="flex flex-col group cursor-pointer"
    >
      <div className="aspect-[3/4] rounded-[36px] overflow-hidden bg-[#F3F4F6] mb-8 border border-gray-50 shadow-sm relative group">
         <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
         <div className="absolute top-5 left-5">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black shadow-lg backdrop-blur-md ${
              product.status === 'BEST SELL' ? 'bg-[#007AFF] text-white' : 
              product.status === 'HOT DEAL' ? 'bg-[#FF4D4D] text-white' : 
              'bg-white/90 text-[#333333]'
            }`}>
              {product.status}
            </span>
         </div>
      </div>
      <div className="flex flex-col items-start gap-2.5 px-1">
        <h3 className="text-[22px] font-black text-[#333333] group-hover:text-[#007AFF] transition-colors leading-tight tracking-tight">
          {product.title}
        </h3>
        <p className="text-sm font-bold text-[#999999]">
          {product.date}
        </p>
        <div className="flex items-center justify-between w-full mt-2">
           <p className="text-xl font-black text-[#333333]">
             {product.price}
           </p>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               alert(`${product.title} 상품이 장바구니에 담겼습니다.`);
             }}
             className="p-2.5 bg-[#F9FAFB] rounded-xl text-[#999999] hover:text-[#007AFF] hover:bg-[#F0F7FF] transition-all"
           >
              <ShoppingCart size={18} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};
