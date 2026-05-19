/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Wallet, Apple, Smartphone } from 'lucide-react';

export const OrderView = ({ onSubmit, isProcessing }) => {
  // 결제 수단 선택 상태 관리 (기본값: 'card' -> 신용/체크카드)
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handleOrderSubmit = () => {
    // 시연용 페이지 특성상 신용/체크카드(토스)를 제외한 수단은 차단 처리
    if (selectedMethod !== 'card') {
      alert(`${selectedMethod} 결제는 현재 준비 중입니다. 신용/체크카드를 선택해 주세요.`);
      return;
    }

    // 부모 컴포넌트(PaymentPage)의 토스 창 결제 생성 함수 호출
    onSubmit({
      method: selectedMethod,
      amount: 45000, // 최종 결제 금액
      orderName: "도쿄 시부야 역 패스 외 1건" // 주문 상품명
    });
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* 폼 입력 영역 (좌측 2열 차지) */}
        <div className="lg:col-span-2 space-y-10">

          {/* 예약자 정보 섹션 */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-[#333333] border-b border-gray-100 pb-4">예약자 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#666666] ml-1">이름</label>
                <input
                    type="text"
                    defaultValue={user?.name || "홍길동"}
                    disabled={true}
                    className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#666666] ml-1">연락처</label>
                <input
                    type="text"
                    defaultValue="010-1234-5678"
                    className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-[#666666] ml-1">이메일</label>
                <input
                    type="email"
                    defaultValue={user?.email || "test@example.com"}
                    disabled={true}
                    className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-base font-bold text-gray-500 focus:outline-none cursor-not-allowed"
                />
              </div>

            </div>
          </section>

          {/* 결제 수단 선택 섹션 */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-[#333333] border-b border-gray-100 pb-4">결제 수단 선택</h3>
            <div className="grid grid-cols-2 gap-4">

              {/* 신용/체크카드 버튼 (토스 연동 대상) */}
              <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center gap-4 p-6 border-2 rounded-[24px] transition-all ${
                      selectedMethod === 'card' ? 'border-[#007AFF] bg-[#F0F7FF]' : 'border-[#E5E7EB] bg-white'
                  }`}
              >
                <CreditCard className={selectedMethod === 'card' ? 'text-[#007AFF]' : 'text-[#999999]'} />
                <div className="text-left">
                  <p className="text-base font-black text-[#333333]">신용/체크카드</p>
                  <p className={`text-xs font-bold ${selectedMethod === 'card' ? 'text-[#007AFF]' : 'text-[#999999]'}`}>토스페이먼츠</p>
                </div>
              </button>

              {/* 무통장 입금 버튼 */}
              <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  className={`flex items-center gap-4 p-6 border-2 rounded-[24px] transition-all ${
                      selectedMethod === 'wallet' ? 'border-[#007AFF] bg-[#F0F7FF]' : 'border-[#E5E7EB] bg-white opacity-40'
                  }`}
              >
                <Wallet className={selectedMethod === 'wallet' ? 'text-[#007AFF]' : 'text-[#999999]'} />
                <div className="text-left">
                  <p className="text-base font-black text-[#333333]">무통장 입금</p>
                </div>
              </button>

              {/* 애플 페이 버튼 */}
              <button
                  type="button"
                  onClick={() => setSelectedMethod('apple')}
                  className={`flex items-center justify-center gap-2 p-6 border-2 rounded-[24px] transition-all ${
                      selectedMethod === 'apple' ? 'border-[#007AFF] bg-[#F0F7FF]' : 'border-[#E5E7EB] bg-white opacity-40'
                  }`}
              >
                <Apple size={20} className="fill-black" />
                <span className="text-base font-black">Apple Pay</span>
              </button>

              {/* 카카오 페이 버튼 */}
              <button
                  type="button"
                  onClick={() => setSelectedMethod('kakao')}
                  className={`flex items-center justify-center gap-2 p-6 border-2 rounded-[24px] transition-all ${
                      selectedMethod === 'kakao' ? 'border-[#007AFF] bg-[#F0F7FF]' : 'border-[#E5E7EB] bg-white opacity-40'
                  }`}
              >
                <Smartphone size={20} className="text-[#F9BF00]" />
                <span className="text-base font-black">Kakao Pay</span>
              </button>

            </div>
          </section>
        </div>

        {/* 우측 금액 요약 및 액션 패널 (우측 1열 차지) */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm space-y-8">
              <h3 className="text-xl font-black text-[#333333]">결제 금액</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#666666]">
                  <span>주문 상품</span>
                  <span className="text-right font-medium">도쿄 시부야 역 패스 외 1건</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-[#666666]">
                  <span>상품 합계</span>
                  <span>₩89,000</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-red-500">
                  <span>할인 금액</span>
                  <span>-₩44,000</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-lg font-black text-[#333333]">최종 결제 금액</span>
                  <span className="text-2xl font-black text-[#007AFF]">₩45,000</span>
                </div>
              </div>

              {/* 약관 동의 체크박스 */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 w-5 h-5 rounded-lg border-[#E5E7EB] text-[#007AFF] focus:ring-[#007AFF]"
                  />
                  <span className="text-xs font-bold text-[#999999] group-hover:text-[#666666] leading-relaxed">
                   개인정보 수집 및 이용, 제3자 제공 동의에 모두 동의합니다. (필수)
                </span>
                </label>
              </div>

              {/* 결제 버튼 */}
              <button
                  type="button"
                  onClick={handleOrderSubmit}
                  disabled={isProcessing}
                  className="w-full bg-[#007AFF] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isProcessing ? "처리 중..." : "45,000원 결제하기"}
              </button>

            </div>
          </div>
        </div>

      </div>
  );
};