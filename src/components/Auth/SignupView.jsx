/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export const SignupView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignup = (e) => {
    e.preventDefault();
    // For demo, just navigate to login
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0F7FF] rounded-[24px] mb-6">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#007AFF]">
              <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#F0F7FF"/>
              <path d="M26.5 14C23.4624 14 21 16.4624 21 19.5V26" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"/>
              <path d="M13.5 14C16.5376 14 19 16.4624 19 19.5V26" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"/>
              <path d="M11 20C11 20 14 23 20 23C26 23 29 20 29 20" stroke="#007AFF" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#333333] tracking-tight">회원가입</h1>
          <p className="text-[#999999] font-bold mt-2">tripmate와 함께 특별한 여행을 시작하세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#999999] uppercase tracking-[0.2em] ml-1">NAME</label>
            <div className="relative">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 focus:border-[#007AFF] transition-all"
                required
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#999999] uppercase tracking-[0.2em] ml-1">EMAIL ADDRESS</label>
            <div className="relative">
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 focus:border-[#007AFF] transition-all"
                required
              />
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#999999] uppercase tracking-[0.2em] ml-1">PASSWORD</label>
            <div className="relative">
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#007AFF]/5 focus:border-[#007AFF] transition-all"
                required
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#007AFF]/10 hover:shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            가입하기
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-10 text-sm font-bold text-[#999999]">
          이미 계정이 있으신가요? 
          <Link to="/login" className="text-[#007AFF] ml-2 hover:underline">로그인</Link>
        </p>
      </motion.div>
    </div>
  );
};
