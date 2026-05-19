/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  ShoppingBag,
  BookOpen,
  Users,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { companyService } from "@/services/index.js";
import {Link} from "react-router-dom";
import axiosInstance from "@utils/axiosInstance.js";

const HomeLandingPage = ({ onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await companyService.getProducts();
        const resContent = response.data?.data?.content || response.data?.data || [];

        const mappedProducts = resContent.map((p, idx) => ({
          id: p.id || `prod-${idx}`,
          title: p.productName || p.name || '도쿄 3박 4일 패키지',
          description: p.description || '연동 가능한 패키지 이용권 상품입니다.',
          price: p.price || (idx % 2 === 0 ? 45000 : 120000),
          country: idx % 2 === 0 ? '일본' : '한국',
          city: idx % 2 === 0 ? '도쿄' : '서울',
          status: idx % 4 === 0 ? '비활성화' : '활성화',
          dateRange: p.dateRange || '2026-05-02 ~ 2026-05-13',
          image: p.image || null,
          tag: idx % 2 === 0 ? "인기 티켓" : "가이드 투어",
          rating: (4.5 + (idx % 5) * 0.1).toFixed(1) + ` (${120 + idx * 30})`
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/plans");
        const resData = response.data?.data?.content || response.data?.data || [];
        setPlans(resData);
      } catch (e) {
        console.error("플랜 데이터 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchPlans();
  }, []);

  return (
      <div className="w-full min-h-screen bg-[#F9FAFB] pb-24 text-[#333333]">

        {/* 1. 상단 마스터 랜딩 히어로 배너 (뽀각짝 레이아웃 + Tripmate 브랜드 컬러) */}
        <section className="bg-gradient-to-b from-[#EBF4FF] to-[#F9FAFB] pt-20 pb-16 px-6 text-center border-b border-gray-100">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
          >
            {/* 브랜드 슬로건 탑 태그 */}
            <span className="inline-block bg-[#007AFF] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
            같이 가는 여행, 쉽게 연결하다
          </span>

            {/* 메인 카피 대제목 */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              혼자이되 외롭지 않은<br />
              <span className="text-[#007AFF]">가장 쉬운 동행 매칭</span> 방법
            </h1>

            {/* 서브 설명 카피 요약 */}
            <p className="text-sm md:text-base font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
              복잡한 일정 관리부터 참여 신청, 스토어 주문과 결제,<br />
              그리고 소중한 여행 기록까지 한 번에 관리할 수 있는 통합 플랫폼
            </p>

            {/* 메인 액션 단추 가이드 */}
            <div className="pt-4">
              <button
                  onClick={() => onNavigate?.('create')}
                  className="bg-[#007AFF] text-white font-black text-sm px-8 py-4 rounded-full shadow-lg shadow-[#007AFF]/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                내 플랜 공간 만들기
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>

          {/* 핵심 프로세스 플로우 인포그래픽 미니멀 구현 */}
          <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 px-4">
            {[
              { icon: <Compass className="text-[#007AFF]" />, label: "1. 일정 탐색", desc: "원하는 투어 검색" },
              { icon: <Users className="text-[#007AFF]" />, label: "2. 참여 신청", desc: "마음에 드는 동행 조율" },
              { icon: <ShoppingBag className="text-[#007AFF]" />, label: "3. 상품 구매", desc: "이용권 간편 결제" },
              { icon: <BookOpen className="text-[#007AFF]" />, label: "4. 여행 기록", desc: "추억 피드 박스 저장" },
            ].map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-[#F0F7FF] rounded-full flex items-center justify-center mb-2">
                    {step.icon}
                  </div>
                  <span className="text-xs font-black text-slate-800 block">{step.label}</span>
                  <span className="text-[10px] font-medium text-gray-400 mt-0.5 block">{step.desc}</span>
                </div>
            ))}
          </div>
        </section>

        {/* 메인 바디 컨텐츠 컨테이너 */}
        <div className="max-w-[1140px] mx-auto px-6 mt-16 space-y-16">

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">인기 상품</h2>
                <p className="text-xs text-gray-400 font-medium">동행 플랜 유닛에 바로 추가할 수 있는 스토어 이용권 가이드</p>
              </div>
              <Link to="/products" className="text-xs font-black text-[#007AFF] hover:underline inline-flex items-center gap-1">
                스토어 상품 더보기 <ArrowRight size={12} />
              </Link>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.slice(0, 4).map((prod) => (
                      <div
                          key={prod.id}
                          className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#007AFF]/40 hover:shadow-md transition-all group cursor-pointer"
                      >
                        {/* 좌측 스퀘어 썸네일 컴포넌트 구역 */}
                        <div className="w-[115px] h-[115px] bg-[#EAECEF] rounded-[12px] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                          {prod.image ? (
                              <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                          ) : (
                              <ShoppingBag size={24} className="opacity-40" />
                          )}
                        </div>

                        {/* 우측 인포메이션 텍스트 구역 */}
                        <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                          <div className="space-y-1">
                            {/* 상단 모집태그 스타일 뱃지 */}
                            <span className="inline-block bg-[#FFF0F0] text-[#FF4D4D] text-[10px] font-black px-2.5 py-0.5 rounded-md">
                        {prod.tag}
                      </span>
                            {/* 대제목 명세 */}
                            <h3 className="text-base font-black text-slate-800 tracking-tight truncate mt-1 group-hover:text-[#007AFF] transition-colors">
                              {prod.title}
                            </h3>
                            {/* 상세 서술 */}
                            <p className="text-xs font-medium text-gray-400 line-clamp-1 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>

                          {/* 하단 아이콘 정보 블록 정렬 */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                              <span className="flex items-center gap-1"><MapPin size={11} /> {prod.country} · {prod.city}</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{prod.price.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-bold">
                  불러온 스토어 상품이 존재하지 않습니다.
                </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">실시간 매칭 동행 일정</h2>
                <p className="text-xs text-gray-400 font-medium">실시간으로 모집 중인 트립메이트 오픈 투어 패키지</p>
              </div>
              <Link to={"/plans"} className="text-xs font-black text-[#007AFF] hover:underline inline-flex items-center gap-1">
                전체 일정 목록 보기 <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-[#007AFF]" size={32} />
                </div>
            ) : plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.slice(0, 4).map((plan) => (
                      <Link to={`/plans/${plan.PlanId}`}
                          key={plan.id}
                          className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 flex gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#007AFF]/40 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-[115px] h-[115px]">
                          {
                            plan.imageUrl ? <img className="h-full w-full object-cover" src={plan.imageUrl}/> :
                                <div className="w-full h-full bg-[#EAECEF] flex justify-center items-center rounded-[12px]  text-gray-400 shrink-0 overflow-hidden">
                                <Compass size={24} className="opacity-40" />
                            </div>

                          }
                        </div>


                        {/* 좌측 이미지 회색 스퀘어 플레이스홀더 영역 */}


                        {/* 우측 인포 명세 서술 영역 */}
                        <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                          <div className="space-y-1">
                            {/* 모집 중 뱃지 라벨 */}
                            <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                                plan.recruitStatus === 'OPEN' ? 'bg-[#FFF0F0] text-[#FF4D4D]' : 'bg-gray-100 text-gray-400'
                            }`}>
                        {plan.recruitStatus === 'OPEN' ? '모집 중' : '모집 마감'}
                      </span>
                            {/* 일정 플랜 타이틀 대제목 */}
                            <h3 className="text-base font-black text-slate-800 tracking-tight truncate mt-1 group-hover:text-[#007AFF] transition-colors">
                              {plan.title}
                            </h3>
                            {/* 설명 서술 요약 */}
                            <p className="text-xs font-medium text-gray-400 line-clamp-1 leading-relaxed">
                              {plan.description || '함께 떠나는 조율형 패키지 여행 코스입니다.'}
                            </p>
                          </div>

                          {/* 하단 캘린더 타임스탬프 정보바 조율 */}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#666666] mt-2 pt-2 border-t border-slate-50">
                            <Calendar size={12} className="text-[#999999]" />
                            <span>{plan.startDate} ~ {plan.endDate}</span>
                          </div>
                        </div>
                      </Link>
                  ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white border border-dashed border-[#E5E7EB] rounded-[24px] flex flex-col items-center justify-center text-[#999999]">
                  <Compass size={36} className="opacity-20 mb-2" />
                  <p className="text-xs font-bold">현재 개설된 투어 패키지 일정이 없습니다.</p>
                </div>
            )}
          </section>

        </div>
      </div>
  );
};

export default HomeLandingPage;