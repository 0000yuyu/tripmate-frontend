import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Star,
  ChevronLeft,
  Clock,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { message, Button } from 'antd';
import { ProductImageGallery } from './ProductImageGallery';
import axiosInstance from "@/utils/axiosInstance.js";
import { useProfile } from '@/hooks/userContext';

export const ProductDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useProfile();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상품의 가용 날짜 스케줄 및 선택된 스케줄 상태 정의
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // 1. 상품 기본 상세 정보 데이터 패칭
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        const data = response.data.data;
        setProduct({
          ...data,
          title: data.productName || data.name,
          images: data.images || [
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200',
          ]
        });
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. 실제 백엔드 페이징 응답 객체 연동 매핑 (data.content 및 ACTIVE 판정 보존)
  useEffect(() => {
    const fetchProductSchedules = async () => {
      setSchedulesLoading(true);
      try {
        const response = await axiosInstance.get(`/products/${id}/schedules`);
        setSchedules(response.data.data?.content || []);
        console.log(response)
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchProductSchedules();
  }, [id]);

  // 장바구니 버튼 클릭 핸들러 (준비중 메세지 인클루드)
  const handleAddToCart = () => {
    if (!selectedScheduleId) {
      message.error('이용하실 예약 날짜(스케줄)를 먼저 선택해주세요!');
      return;
    }
    message.warning('장바구니 기능은 아직 준비 중인 서비스입니다!');
  };

  // 즉시 결제 버튼 클릭 핸들러
  const handleOrder = () => {
    if (!selectedScheduleId) {
      message.error('이용하실 예약 날짜(스케줄)를 먼저 선택해주세요!');
      return;
    }
    message.info('주문/결제 기능은 아직 준비 중인 서비스입니다!');
  };

  const handleLikeToggle = () => {
    if (!isLoggedIn) {
      message.error("좋아요 기능은 로그인 후 이용 가능합니다.");
      return;
    }
    setIsLiked(!isLiked);
    if (!isLiked) message.success("해당 상품을 찜 목록에 추가했습니다.");
  };

  if (loading) return (
      <div className="flex flex-col justify-center items-center h-screen gap-3">
        <Loader2 className="animate-spin text-[#007AFF]" size={32} />
        <span className="text-sm font-bold text-gray-400 tracking-tight">상품 정보를 불러오는 중...</span>
      </div>
  );

  if (!product) return <div className="text-center py-40 text-lg font-bold text-gray-500">Product not found</div>;

  return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20 max-w-[1200px] mx-auto px-4 md:px-8">

        {/* 상단 네비게이션 헤더 바 */}
        <div className="w-full flex gap-4 pt-4">
          <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl text-[#999999] hover:text-slate-800 transition-all shadow-sm">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#999999] tracking-wider uppercase">관광 / 전시</span>
            <span className="text-[#E5E7EB] text-xs">/</span>
            <span className="text-xs font-black text-[#007AFF] bg-[#F0F7FF] px-2.5 py-0.5 rounded-md">{product.country}</span>
          </div>
        </div>

        {/* 💡 [버그 원천 해결] 그리드 레이아웃 컬럼간 간격조정 및 아이템 정렬 배치 교정 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* 💡 왼쪽: 이미지 갤러리 독립 세션 배치 (그리드 12칸 중 5칸 할당하여 가로 꼬임 방지) */}
          <div className="lg:col-span-5 w-full sticky top-6 z-10">
            <ProductImageGallery images={product.images} selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
          </div>

          {/* 💡 오른쪽: 타이틀, 날짜 스케줄러, 결제 컨트롤러 카드 패널 (그리드 12칸 중 7칸 할당) */}
          <div className="lg:col-span-7 w-full space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100/50 rounded-full text-amber-600">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-black">4.9</span>
                  <span className="text-[11px] text-amber-500/80 font-bold">(2,341 리뷰)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleLikeToggle} className={`p-3 border rounded-2xl transition-all shadow-sm ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200/80 text-slate-400 hover:text-red-500 hover:border-red-100'}`}>
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => message.success("상품 주소가 복사되었습니다.")} className="p-3 bg-white border border-slate-200/80 rounded-2xl text-slate-400 hover:text-[#007AFF] hover:border-blue-100 transition-all shadow-sm">
                    <Share2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-[32px] font-black text-[#222222] leading-[1.2] tracking-tight">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="flex items-center gap-1 px-3 py-1 bg-[#F0F7FF] text-[#007AFF] rounded-lg text-[11px] font-black">
                  <MapPin size={12} strokeWidth={2.5} /> {product.country} · {product.city}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-bold text-slate-500">
                  <Clock size={12} /> 소요시간 상세참조
                </div>
              </div>
            </div>

            {/* 이용 가능 날짜(스케줄) 가로 스크롤 카드 매니저 패널 */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#007AFF]" />
                <h3 className="text-base font-black text-[#222222]">이용 일자 선택</h3>
              </div>

              {schedulesLoading ? (
                  <div className="flex justify-center items-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
              ) : schedules.length === 0 ? (
                  <div className="flex items-center gap-1.5 p-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-semibold">
                    <AlertCircle size={14} /> 현재 예약 가능한 이용권 일정이 없습니다.
                  </div>
              ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {schedules.map((item) => {
                      const isSoldOut = item.stock <= 0;
                      const isDisabled = item.status !== 'ACTIVE';
                      const isSelectable = !isSoldOut && !isDisabled;
                      const isCurrentSelected = selectedScheduleId === item.scheduleId;

                      const dateParts = item.date.split('-');
                      const month = dateParts[1];
                      const day = dateParts[2];

                      return (
                          <button
                              key={item.scheduleId}
                              type="button"
                              disabled={!isSelectable}
                              onClick={() => setSelectedScheduleId(isCurrentSelected ? null : item.scheduleId)}
                              className={`min-w-[90px] p-3.5 border rounded-2xl flex flex-col items-center gap-1 transition-all outline-none text-center ${
                                  isCurrentSelected
                                      ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-md shadow-blue-100'
                                      : isSelectable
                                          ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 cursor-pointer'
                                          : 'bg-slate-50 border-slate-100 text-slate-300 pointer-events-none'
                              }`}
                          >
                        <span className={`text-[10px] font-black ${isCurrentSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {month ? `${Number(month)}월 ${Number(day)}일` : item.date}
                        </span>
                            <span className="text-sm font-black tracking-tight">
                          {isSoldOut ? '품절' : isDisabled ? '마감' : `${item.stock}매`}
                        </span>
                            <span className={`text-[9px] font-bold ${isCurrentSelected ? 'text-blue-200' : 'text-slate-400/80'}`}>
                          {isSoldOut ? 'Sold Out' : isDisabled ? '정기 휴무' : '예약 가능'}
                        </span>
                          </button>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* 구매 금액 및 최종 결제 액션 카드 */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.02)] space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">총 상품 금액</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#222222] tracking-tight">{(product.price * quantity).toLocaleString()}</span>
                  <span className="text-base font-bold text-[#222222] ml-0.5">원</span>
                </div>
              </div>

              {/* 수량 조절 제어 패널 */}
              <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-600">인원 / 수량 선택</span>
                <div className="flex items-center gap-3 bg-white border border-slate-200/60 rounded-xl p-1 shadow-sm">
                  <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(prev => prev - 1)}
                      className="w-7 h-7 text-xs font-bold rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors text-slate-700 outline-none"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-800 w-4 text-center">{quantity}</span>
                  <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-7 h-7 text-xs font-bold rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 즉시 결제 / 장바구니 버튼 트리거 */}
              <div className="flex gap-3">
                <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-[52px] border-2 border-slate-200 hover:border-[#007AFF] hover:text-[#007AFF] text-slate-700 font-black text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingBag size={15} strokeWidth={2.5} />
                  장바구니 담기
                </Button>
                <Button
                    type="primary"
                    onClick={handleOrder}
                    className="flex-[1.5] h-[52px] bg-[#007AFF] hover:bg-blue-600 border-none font-black text-xs rounded-2xl shadow-md shadow-blue-100 flex items-center justify-center gap-2 text-white transition-all"
                >
                  <CreditCard size={15} strokeWidth={2.5} />
                  즉시 결제하기
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4.5 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> 트립메이트 안심 보증</div>
                <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-amber-500" /> 시안 회원 전용 즉시 특가</div>
              </div>
            </div>

          </div>
        </div>

        {/* 하단 단독 상세 설명 서랍 구역 */}
        <ProductDetailedDescription description={product.description} />
      </motion.div>
  );
};

const ProductDetailedDescription = ({ description }) => (
    <section className="pt-16 border-t border-slate-100 space-y-8">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-1 bg-slate-800 rounded-full" />
        <h3 className="text-xl font-black text-[#222222]">상세 안내 명세</h3>
      </div>
      <div className="bg-slate-50/60 border border-slate-100/70 rounded-[32px] p-8 md:p-12 text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-[#333333] tracking-tight">안내 및 유의사항</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
    </section>
);