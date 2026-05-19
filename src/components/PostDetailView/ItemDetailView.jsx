import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MoreHorizontal, UserPlus, Loader2, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import { planService } from '../../services';

export const ItemDetailView = ({ item, onBack, onViewRecord, onViewProduct, onOrderProduct }) => {
  const [isParticipating, setIsParticipating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleParticipate = async () => {
    setLoading(true);
    try {
      if (!item?.planId && !item?.id) {
        alert('일정 정보가 부족합니다.');
        return;
      }
      await planService.applyToUnitPlan(item.planId, item.id);
      setIsParticipating(true);
      alert('참여 신청이 완료되었습니다! 방장의 승인을 기다려주세요.');
    } catch (error) {
      console.error(error);
      alert('참여 신청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-12 text-left">
        <div className="w-full bg-white border border-gray-200/80 rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-start gap-5 relative overflow-hidden group">

          <div className="w-10 h-10 rounded-full text-gray-400 border border-gray-300 flex items-center justify-center text-sm font-black shrink-0 shadow-md shadow-[#007AFF]/10">
            {item?.orderIndex || 1}
          </div>

          <div className="flex-1 space-y-3.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#007AFF] tracking-tight bg-blue-50 px-2.5 py-0.5 rounded-md">
                {item?.startTime ? item.startTime.slice(0, 5) : '10:00'} ~ {item?.endTime ? item.endTime.slice(0, 5) : '12:00'}
              </span>
              <button type="button" className="text-gray-400 hover:text-gray-700 transition-colors"><MoreHorizontal size={16} /></button>
            </div>

            <h4 className="text-lg font-bold text-[#222222] tracking-tight leading-snug">{item?.title}</h4>

            <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
              <span>{item?.location}</span>
            </p>

            <p className="text-xs text-gray-500 leading-relaxed pt-3 border-t border-gray-50 font-medium">
              {item?.description}
            </p>

            <div className="pt-2">
              <button
                  type="button"
                  disabled={isParticipating || loading}
                  onClick={handleParticipate}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                      isParticipating
                          ? 'bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#007AFF] text-white hover:bg-[#0062CC] shadow-sm active:scale-97'
                  }`}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={13} />}
                <span>{isParticipating ? '참여 신청 대기 중' : '이 활동 코스 참여하기'}</span>
              </button>
            </div>
          </div>
        </div>

        {item?.product && (
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-[#007AFF] w-1 h-3.5 rounded-full" />
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">상품</h3>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-[#007AFF]/20 transition-all gap-4 group">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-[#007AFF]" />
                    <h3 className="text-base font-bold text-[#222222] tracking-tight group-hover:text-[#007AFF] transition-colors">
                      {item.product.productName}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-gray-400">
                  <span className="flex items-center gap-1 text-gray-500 font-semibold">
                    <Calendar size={12} /> 예약 권장일: 일정 당일 사용 가능
                  </span>
                    <span>•</span>
                    <span className="text-[#FF4D4D] font-bold">
                    ₩{item.product.price ? item.product.price.toLocaleString() : '6,100'}
                  </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto border-t border-gray-50 pt-3 sm:pt-0 sm:border-none">
                  <button type="button" onClick={onViewProduct} className="px-4 h-9 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">상세 보기</button>
                  <button type="button" onClick={onOrderProduct} className="flex-1 sm:flex-none h-9 px-4 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"><CreditCard size={12} />주문하기</button>
                </div>
              </div>
            </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#007AFF] w-1 h-3.5 rounded-full" />
              <h3 className="text-sm font-bold text-[#222222] tracking-tight">코스 멤버 <span className="text-[#007AFF] ml-0.5">{item?.participants?.length || 0}</span></h3>
            </div>
            <button type="button" className="text-[11px] font-bold text-gray-400 flex items-center gap-0.5 hover:text-[#007AFF] transition-colors">전체보기 <ChevronRight size={12} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gray-200/80 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            {(item?.participants || []).map((member, i) => {
              const avatarUrl = member.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(member.name || i)}&backgroundColor=f3f4f6`;

              return (
                  <div key={member.id || i} className="flex items-center gap-4 bg-gray-50/40 border border-gray-100 p-3 rounded-xl hover:bg-gray-50 text-left">
                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-white border border-gray-100 shadow-sm">
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#222222] truncate">{member.name}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${member.participationStatus === 'APPROVED' ? 'bg-[#E6FFF2] text-[#00C853]' : 'bg-amber-50 text-amber-500'}`}>{member.participationStatus === 'APPROVED' ? '참여 확정' : '승인 대기'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                        <span>역할: {member.participationRole === 'HOST' ? '호스트' : '게스트'}</span>
                      </div>
                    </div>
                  </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#007AFF] w-1 h-3.5 rounded-full" />
              <h3 className="text-sm font-bold text-[#222222] tracking-tight">앨범</h3>
            </div>
            <button type="button" onClick={onViewRecord} className="text-[11px] font-bold text-gray-400 flex items-center gap-0.5 hover:text-[#007AFF] transition-colors">기록 보러가기 <ChevronRight size={12} /></button>
          </div>
        </section>
      </motion.div>
  );
};