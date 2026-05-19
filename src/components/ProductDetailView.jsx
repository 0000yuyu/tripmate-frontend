/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ShoppingBag,
  CreditCard,
  Calendar,
  Compass,
  AlertCircle,
  Loader2,
  MapPin,
  Tag,
  ChevronRight
} from 'lucide-react';
import { message, Button, DatePicker } from 'antd';
import axiosInstance from "@/utils/axiosInstance.js";

export const ProductDetailView = () => {
  const { id } = useParams(); // URL에서 가져온 고유 상품 ID (String 타입일 수 있음)
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // AntD DatePicker 연동용 단일 날짜 필터링 상태 (dayjs 객체 또는 null)
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        setProduct(response.data?.data || null);
      } catch (error) {
        console.error('Error fetching product details:', error);
        message.error('상품 상세 내역을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedPlans = async () => {
      try {
        const response = await axiosInstance.get(`/plans?productId=${id}`);
        setPlans(response.data?.data?.content || response.data?.data || []);
      } catch (error) {
        console.error('Error fetching related plans:', error);
      }
    };

    fetchProductDetails();
    fetchRelatedPlans();
  }, [id]);

  useEffect(() => {
    const fetchProductSchedules = async () => {
      setSchedulesLoading(true);
      try {
        const response = await axiosInstance.get(`/products/${id}/schedules`);

        // 날짜순 오름차순 정렬 가공하여 유저 사용성 극대화
        const rawContent = response.data?.data?.content || response.data?.data || [];
        const sortedContent = [...rawContent].sort((a, b) => new Date(a.date) - new Date(b.date));

        setSchedules(sortedContent);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchProductSchedules();
  }, [id]);

  const filteredSchedules = useMemo(() => {
    if (!filterDate) return schedules;
    const targetDateStr = filterDate.format('YYYY-MM-DD');
    return schedules.filter(item => item.date === targetDateStr);
  }, [schedules, filterDate]);

  const handleAddToCart = () => {
    if (!selectedScheduleId) {
      message.error('이용하실 예약 날짜를 선택해주세요!');
      return;
    }
    message.success('선택하신 이용권 수량이 장바구니에 담겼습니다.');
  };

  const handleOrder = () => {
    if (!selectedScheduleId) {
      message.error('이용하실 예약 날짜를 선택해주세요!');
      return;
    }
    message.success("주문 결제 아키텍처 페이지로 연결됩니다.");
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };


  if (loading) return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <Loader2 className="animate-spin text-[#007AFF]" size={28} />
        <span className="text-xs font-bold text-gray-400">티켓 명세 패키지를 연결하고 있습니다...</span>
      </div>
  );

  if (!product) return <div className="text-center py-40 text-xs font-bold text-gray-400">상품 정보를 찾을 수 없습니다.</div>;

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full min-h-screen bg-[#F9FAFB] pb-24 text-[#333333] text-left"
      >
        {/* 상품 상단 랜딩 히어로 섹션 */}
        <header className="bg-gradient-to-b from-[#EBF4FF] to-white pt-16 pb-12 px-6 border-b border-slate-100 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-block bg-[#007AFF] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
            TripMate Verification Ticket · {product.address?.country || '해외'}
          </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {product.productName}
            </h1>
            <p className="text-xs md:text-sm font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
              {product.description}
            </p>
            <div className="pt-2 flex justify-center items-center gap-1 text-xs font-bold text-[#007AFF]">
              <MapPin size={13} />
              <span>{product.address?.state} · {product.address?.city} ({product.address?.addressLine})</span>
            </div>
          </div>
        </header>

        {/* 메인 상세 보드 그리드 영역 */}
        <div className="max-w-[1040px] mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* 왼쪽: 단독 대표 이미지 */}
          <div className="md:col-span-5 w-full">
            <div className="w-full aspect-square bg-[#EAECEF] rounded-[20px] flex flex-col items-center justify-center text-gray-400 border border-slate-100 shadow-sm relative overflow-hidden">
              <Tag size={28} className="opacity-30" />
              <span className="text-[10px] font-black opacity-30 mt-1">Official Store Item</span>
            </div>
          </div>

          <div className="md:col-span-7 w-full space-y-6">

            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-0.5">
                  01. 이용권 예약 날짜 지정 및 필터링
                </label>

                <div className="flex items-center gap-1.5 shrink-0">
                  <DatePicker
                      placeholder="원하는 날짜 선택"
                      value={filterDate}
                      onChange={(date) => {
                        setFilterDate(date);
                        setSelectedScheduleId(null); // 필터 조건 변동 시 선택 유닛 리셋
                      }}
                      className="h-8 text-xs font-bold rounded-lg border-gray-200 focus:border-[#007AFF]"
                      allowClear
                  />
                  {filterDate && (
                      <Button
                          size="small"
                          type="text"
                          onClick={() => setFilterDate(null)}
                          className="text-[10px] text-gray-400 font-bold hover:text-red-500"
                      >
                        필터 해제
                      </Button>
                  )}
                </div>
              </div>

              {schedulesLoading ? (
                  <div className="flex items-center justify-center py-6 bg-white border border-slate-100 rounded-xl">
                    <Loader2 size={16} className="animate-spin text-gray-300" />
                  </div>
              ) : filteredSchedules.length === 0 ? (
                  <div className="flex items-center gap-1.5 p-4 bg-white border border-dashed border-slate-200 rounded-xl text-xs font-bold text-gray-400">
                    <AlertCircle size={13} />
                    {filterDate ? "선택하신 날짜에는 운영하는 스케줄이 없습니다." : "실시간 예약 가능한 일권 옵션이 존재하지 않습니다."}
                  </div>
              ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                    {filteredSchedules.map((item) => {
                      const isSoldOut = item.stock <= 0;
                      const isDisabled = item.status !== 'ACTIVE'; // 백엔드 ACTIVE 원본 필드 판정 보존
                      const isSelectable = !isSoldOut && !isDisabled;
                      const isCurrentSelected = selectedScheduleId === item.scheduleId;

                      const dateArr = item.date.split('-');
                      const monthDay = dateArr[1] ? `${Number(dateArr[1])}/${Number(dateArr[2])}` : item.date;

                      return (
                          <button
                              key={item.scheduleId}
                              type="button"
                              disabled={!isSelectable}
                              onClick={() => setSelectedScheduleId(isCurrentSelected ? null : item.scheduleId)}
                              className={`min-w-[85px] p-3 border-2 rounded-xl flex flex-col items-center gap-0.5 transition-all text-center select-none outline-none ${
                                  isCurrentSelected
                                      ? 'bg-[#333333] border-[#333333] text-white shadow-sm'
                                      : isSelectable
                                          ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 cursor-pointer'
                                          : 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'
                              }`}
                          >
                            <span className="text-[9px] font-black tracking-tight">{monthDay}</span>
                            <span className="text-xs font-black mt-0.5">
                        {isSoldOut ? '품절' : isDisabled ? '마감' : `${item.stock}매`}
                      </span>
                            {/* 상태에 따른 미니 서브 뱃지 텍스트 표현 */}
                            <span className={`text-[8px] font-bold ${isCurrentSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {isDisabled ? '정기휴무' : isSoldOut ? 'Sold Out' : '예약가능'}
                      </span>
                          </button>
                      );
                    })}
                  </div>
              )}
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 space-y-4 shadow-sm">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-0.5">02. 구매 인원 명세</label>

              <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-black text-slate-600">수량 선택</span>
                <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                  <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => prev - 1)}
                      className="w-6 h-6 text-xs font-bold rounded bg-slate-50 disabled:opacity-30"
                  >-</button>
                  <span className="text-xs font-black text-slate-800 w-4 text-center">{quantity}</span>
                  <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-6 h-6 text-xs font-bold rounded bg-slate-50"
                  >+</button>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs font-black text-slate-400">최종 청구 금액</span>
                <div>
                  <span className="text-2xl font-black text-[#333333]">{(product.price * quantity).toLocaleString()}</span>
                  <span className="text-xs font-bold text-[#333333] ml-0.5">원</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-[46px] border border-slate-200 text-slate-600 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 hover:border-[#007AFF] hover:text-[#007AFF]"
                >
                  <ShoppingBag size={14} /> 장바구니 담기
                </Button>
                <Button
                    type="primary"
                    onClick={handleOrder}
                    className="flex-[1.6] h-[46px] bg-[#007AFF] hover:bg-blue-600 border-none font-black text-xs rounded-xl flex items-center justify-center gap-1.5 text-white shadow-md shadow-blue-100"
                >
                  <CreditCard size={14} /> 즉시 결제하기
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 투어 일정 섹션 */}
        <div className="max-w-[1040px] mx-auto px-6 mt-16 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-lg font-black text-[#333333] tracking-tight">🗺️ 이 이용권이 연동된 패키지 투어 일정</h3>
              <p className="text-[11px] text-gray-400 font-semibold">메이트들과 조율하여 티켓을 함께 공유 구매하고 출발할 수 있는 코스 목록입니다.</p>
            </div>

            {plans.length > 2 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => scrollSlider('left')} className="p-1.5 border border-slate-200 bg-white rounded-lg text-gray-500 hover:bg-slate-50 transition-colors"><ChevronLeft size={14} /></button>
                  <button onClick={() => scrollSlider('right')} className="p-1.5 border border-slate-200 bg-white rounded-lg text-gray-500 hover:bg-slate-50 transition-colors"><ChevronRight size={14} /></button>
                </div>
            )}
          </div>

          {plans.length > 0 ? (
              <div
                  ref={sliderRef}
                  className="flex gap-5 overflow-x-auto pt-1 pb-4 scrollbar-hide snap-x"
              >
                {/*
                  수정 포인트: API가 이미 `?productId=${id}`로 필터링된 값을 내려주므로 컴포넌트 레벨 검증식 보완
                  String vs Number 타입 불일치 및 key 설계 에러를 방지하기 위해 안전하게 파싱 및 옵셔널 체이닝 적용
                */}
                {plans
                .filter((plan) => String(plan.product?.productId || plan.product?.id) === String(id))
                .map((plan) => (
                    <div
                        key={plan.id}
                        className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 flex gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#007AFF]/40 hover:shadow-md transition-all group cursor-pointer snap-start min-w-[320px] md:min-w-[360px] max-w-[360px] shrink-0"
                    >
                      <div className="w-[100px] h-[100px] bg-[#EAECEF] rounded-[10px] flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                        <Compass size={20} className="opacity-40" />
                      </div>

                      <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                        <div className="space-y-1">
                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded ${
                        plan.recruitStatus === 'OPEN' ? 'bg-[#FFF0F0] text-[#FF4D4D]' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {plan.recruitStatus === 'OPEN' ? '모집 중' : '모집 마감'}
                    </span>
                          <h4 className="text-sm font-black text-slate-800 tracking-tight truncate mt-0.5 group-hover:text-[#007AFF] transition-colors">
                            {plan.title}
                          </h4>
                          <p className="text-[11px] font-medium text-gray-400 line-clamp-1 leading-normal">
                            {plan.description || '함께 떠나는 패키지 여행 가이드 일정입니다.'}
                          </p>
                        </div>

                        <div className="text-[10px] font-bold text-[#666666] pt-1.5 border-t border-slate-50 flex items-center gap-1">
                          <Calendar size={11} className="text-gray-400" />
                          <span>{plan.startDate?.replace(/-/g, '.')} ~ {plan.endDate?.replace(/-/g, '.')}</span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          ) : (
              <div className="text-left py-10 bg-white border border-dashed border-slate-200 rounded-2xl px-6 text-gray-400 text-xs font-bold">
                현재 이 티켓 이용권을 코스 라인에 매핑해 개설한 패키지 여행 일정이 부재한 상태입니다.
              </div>
          )}
        </div>

        {/* 구매 전 필수 유의사항 고지 서랍 */}
        <footer className="max-w-[1040px] mx-auto px-6 mt-12 space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-0.5">구매 전 필수 유의사항 고지</label>
          <div className="bg-white border border-slate-100 rounded-[20px] p-5 text-xs text-slate-500 font-medium leading-relaxed shadow-sm">
            {product.description || '정식 티켓 발권 후 취소/환불 규정 및 상세 교환 안내 가이드가 비어있습니다.'}
          </div>
        </footer>
      </motion.div>
  );
};