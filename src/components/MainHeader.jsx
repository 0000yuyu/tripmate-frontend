/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User as UserIcon, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MainHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: '/', label: '홈' },
    { id: '/schedules', label: '일정' },
    { id: '/products', label: '상품' },
    { id: '/matching', label: '매칭' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-20 py-3 sm:py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 lg:gap-16">
        <button 
          className="md:hidden p-2 text-[#333333]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#007AFF] sm:w-[40px] sm:h-[40px]">
            <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#F0F7FF"/>
            <path d="M26.5 14C23.4624 14 21 16.4624 21 19.5V26" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"/>
            <path d="M13.5 14C16.5376 14 19 16.4624 19 19.5V26" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="20" cy="12" r="3" fill="#007AFF"/>
            <path d="M11 20C11 20 14 23 20 23C26 23 29 20 29 20" stroke="#007AFF" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="font-display font-black text-xl sm:text-2xl text-[#007AFF]">tripmate</span>
        </div>
        
        <nav className="hidden md:flex gap-6 lg:gap-10">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNavClick(item.id)}
              className={`text-sm lg:text-base font-bold transition-all relative py-1 ${isActive(item.id) ? 'text-[#333333]' : 'text-[#999999] hover:text-[#333333]'}`}
            >
              {item.label}
              {isActive(item.id) && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#007AFF] rounded-full" />}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[#E5E7EB] md:hidden flex flex-col p-4 shadow-xl animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left py-4 px-4 rounded-xl font-black text-lg transition-all ${isActive(item.id) ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-[#666666]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Simulating logged in state - in real app, use auth state */}
        <div className="hidden sm:flex items-center gap-4 mr-2">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-[#666666] hover:text-[#333333] transition-colors"
          >
            로그인
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-[#007AFF] text-white rounded-full text-sm font-black shadow-lg shadow-[#007AFF]/10 hover:shadow-[#007AFF]/20 transition-all hover:scale-105 active:scale-95"
          >
            시작하기
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 border-l border-gray-100 pl-2 sm:pl-4">
          <button 
            onClick={() => navigate('/mypage')}
            className={`p-2 rounded-full transition-colors ${location.pathname === '/mypage' ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-[#333333] hover:bg-gray-100'}`}
          >
            <UserIcon size={20} className="sm:w-[24px] sm:h-[24px]" />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className={`p-2 rounded-full transition-colors relative ${location.pathname === '/notifications' ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-[#333333] hover:bg-gray-100'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[24px] sm:h-[24px]"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border-1.5 sm:border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
