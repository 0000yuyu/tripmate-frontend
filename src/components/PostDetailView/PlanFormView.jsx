/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Plus,
  Trash2,
  Clock,
  GripVertical,
  Loader2,
  Ticket,
  Users,
  Camera,
  XCircle,
} from 'lucide-react';
import { message } from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axiosInstance from "@/utils/axiosInstance";

const SortableItineraryItem = ({
  item,
  itemIdx,
  dayIdx,
  handleUpdateItem,
  onRemove,
  onToggleProductSearch,
  activeSearchKey
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const isSearchOpen = activeSearchKey === `${dayIdx}-${itemIdx}`;

  return (
      <div
          ref={setNodeRef}
          style={style}
          className={`bg-white border ${isDragging ? 'border-[#007AFF] shadow-xl' : 'border-[#E5E7EB] shadow-sm'} rounded-[24px] p-6 flex flex-col gap-5 group transition-all`}
      >
        <div className="flex items-start gap-6">
          {/* 드래그 핸들 */}
          <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-[#E5E7EB] hover:text-[#999999] transition-colors shrink-0"
          >
            <GripVertical size={20} />
          </div>

          {/* 인덱스 배지 */}
          <div className="w-10 h-10 bg-[#007AFF] rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
            {itemIdx + 1}
          </div>

          {/* 메인 입력 필드 Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <input
                  type="text"
                  placeholder="장소 / 활동명 (상품 선택 시 자동 입력)"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(dayIdx, itemIdx, 'title', e.target.value)}
                  className="w-full px-0 py-1 text-lg font-black text-[#333333] border-b-2 border-transparent focus:border-[#007AFF] focus:outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="col-span-2">
              <input
                  type="text"
                  placeholder="코스 세부 내용 가이드 요약"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(dayIdx, itemIdx, 'description', e.target.value)}
                  className="w-full px-0 py-1 text-xs font-bold text-gray-400 border-b border-transparent focus:border-[#007AFF] focus:outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
              <Clock size={14} className="text-[#999999]" />
              <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) => handleUpdateItem(dayIdx, itemIdx, 'startTime', e.target.value)}
                  className="bg-transparent text-xs font-bold w-full focus:outline-none"
                  // 초(:ss) 제거 보정
              />
              <span className="text-gray-300 text-xs">~</span>
              <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) => handleUpdateItem(dayIdx, itemIdx, 'endTime', e.target.value)}
                  className="bg-transparent text-xs font-bold w-full focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
              <Users size={14} className="text-[#999999]" />
              <input
                  type="number"
                  min="1"
                  placeholder="최대 인원"
                  value={item.maxCount || ''}
                  onChange={(e) => handleUpdateItem(dayIdx, itemIdx, 'maxCount', parseInt(e.target.value) || 0)}
                  className="bg-transparent text-xs font-bold w-full focus:outline-none placeholder:text-gray-400"
              />
              <span className="text-[10px] text-gray-400 font-bold shrink-0">명</span>
            </div>
          </div>

          {/* 삭제 버튼 */}
          <button
              onClick={() => onRemove(dayIdx, itemIdx)}
              className="opacity-0 group-hover:opacity-100 p-2 text-[#999999] hover:text-red-500 transition-all shrink-0"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* --- 하단 상품 연동 구역 --- */}
        <div className="pl-16 border-t border-dashed border-slate-100 pt-4">
          {item._product ? (
              <div className="flex items-center justify-between p-3 bg-[#F0F7FF] rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg shrink-0 flex items-center justify-center text-white">
                    <Ticket size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#007AFF] truncate">{item._product.productName}</p>
                    <p className="text-[10px] font-bold text-blue-400">관련 스토어 상품 연동됨 · {item.price?.toLocaleString()}원</p>
                  </div>
                </div>
                <button
                    onClick={() => {
                      handleUpdateItem(dayIdx, itemIdx, '_product', null);
                      handleUpdateItem(dayIdx, itemIdx, 'productScheduleId', null);
                      handleUpdateItem(dayIdx, itemIdx, 'price', 0);
                    }}
                    className="p-1 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
          ) : (
              <button
                  onClick={() => onToggleProductSearch(dayIdx, itemIdx)}
                  className={`w-full py-2.5 border-2 border-dashed rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      isSearchOpen
                          ? 'border-[#007AFF] bg-[#F0F7FF] text-[#007AFF]'
                          : 'border-[#E5E7EB] text-[#999999] hover:bg-[#F9FAFB]'
                  }`}
              >
                {isSearchOpen ? '스토어 검색 닫기' : '+ 투어 연동 상품 추가하기'}
              </button>
          )}
        </div>
      </div>
  );
};


// --- 메인 폼 매니저 컴포넌트 ---
export const PlanFormView = ({ initialData, onSave, mode = 'create' }) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 📸 단일 이미지 상태 관리 (파일 객체 저장)
  const [imageFile, setImageFile] = useState(null);

  // 마스터 정보 상태 관리
  const [tripInfo, setTripInfo] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || new Date(Date.now() + 345600000).toISOString().split('T')[0],
  });

  // 백엔드 단층 데이터(planUnits)를 dnd-kit 규격 및 day 그룹으로 복원
  const [itinerary, setItinerary] = useState(() => {
    if (initialData?.planUnits && initialData.planUnits.length > 0) {
      const groupByDay = {};

      initialData.planUnits.forEach((unit) => {
        const d = unit.day || 1;
        if (!groupByDay[d]) {
          groupByDay[d] = [];
        }

        const formattedStartTime = unit.startTime?.length > 5 ? unit.startTime.substring(0, 5) : (unit.startTime || '10:00');
        const formattedEndTime = unit.endTime?.length > 5 ? unit.endTime.substring(0, 5) : (unit.endTime || '12:00');

        groupByDay[d].push({
          id: unit.id || Math.random().toString(36).substr(2, 9),
          planUnitId: unit.id,
          title: unit.title || '',
          description: unit.description || '',
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          maxCount: unit.maxCount || 5,
          price: unit.product?.price || 0,
          productScheduleId: unit.product?.scheduleId || null,
          _product: unit.product ? {
            productId: unit.product.productId,
            scheduleId: unit.product.scheduleId,
            productName: unit.product.productName,
            price: unit.product.price
          } : null
        });
      });

      return Object.keys(groupByDay)
      .sort((a, b) => Number(a) - Number(b))
      .map((dayNum) => ({
        day: Number(dayNum),
        items: groupByDay[dayNum].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)),
      }));
    }

    return [{ day: 1, items: [] }];
  });

  const [activeSearchKey, setActiveSearchKey] = useState(null);
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);

  const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
  };

  const handleSearchProducts = async () => {
    if (!searchDate) {
      message.error("조회할 날짜를 먼저 지정해주세요.");
      return;
    }
    setSearchLoading(true);
    try {
      const res = await axiosInstance.get(`/products/available?date=${searchDate}`);
      setProducts(res.data?.data?.content || []);
    } catch (e) {
      console.error("상품 검색 실패", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleToggleProductSearch = (dayIdx, itemIdx) => {
    const key = `${dayIdx}-${itemIdx}`;
    if (activeSearchKey === key) {
      setActiveSearchKey(null);
    } else {
      setActiveSearchKey(key);
      setProducts([]);
    }
  };

  const handleSelectProduct = (dayIdx, itemIdx, product) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items[itemIdx] = {
      ...newItinerary[dayIdx].items[itemIdx],
      title: product.productName,
      price: product.price,
      productScheduleId: product.scheduleId,
      _product: product
    };
    setItinerary(newItinerary);
    setActiveSearchKey(null);
    message.success("이용권 상품이 스케줄 라인에 연동되었습니다.");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const newItinerary = [...itinerary];
    let activeDayIdx = -1, activeItemIdx = -1;
    let overDayIdx = -1, overItemIdx = -1;

    for (let d = 0; d < newItinerary.length; d++) {
      const itemIdx = newItinerary[d].items.findIndex(item => item.id === activeId);
      if (itemIdx !== -1) { activeDayIdx = d; activeItemIdx = itemIdx; }

      const oIdx = newItinerary[d].items.findIndex(item => item.id === overId);
      if (oIdx !== -1) { overDayIdx = d; overItemIdx = oIdx; }
    }

    if (activeDayIdx !== -1 && overDayIdx !== -1) {
      if (activeDayIdx === overDayIdx) {
        newItinerary[activeDayIdx].items = arrayMove(
            newItinerary[activeDayIdx].items,
            activeItemIdx,
            overItemIdx
        );
      } else {
        const [movedItem] = newItinerary[activeDayIdx].items.splice(activeItemIdx, 1);
        newItinerary[overDayIdx].items.splice(overItemIdx, 0, movedItem);
        setActiveSearchKey(null);
      }
      setItinerary(newItinerary);
      message.success("타임라인 스케줄 순서가 조율되었습니다.");
    }
  };

  const handleAddDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([...itinerary, { day: nextDay, items: [] }]);
  };

  const handleAddItem = (dayIdx) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items.push({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      startTime: '10:00',
      endTime: '12:00',
      price: 0,
      maxCount: 5,
      productScheduleId: null,
      _product: null
    });
    setItinerary(newItinerary);
  };

  const handleRemoveItem = (dayIdx, itemIdx) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items.splice(itemIdx, 1);
    setItinerary(newItinerary);
    setActiveSearchKey(null);
  };

  const handleUpdateItem = (dayIdx, itemIdx, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].items[itemIdx] = {
      ...newItinerary[dayIdx].items[itemIdx],
      [field]: value
    };
    setItinerary(newItinerary);
  };

  const handleFinalSubmit = async () => {
    if (!tripInfo.title || !tripInfo.description) {
      message.error("여행의 기본 정보(제목, 설명)를 기입해주세요.");
      return;
    }

    const flattenedUnits = [];
    let orderCounter = 1;

    itinerary.forEach((dayData) => {
      dayData.items.forEach((item) => {
        flattenedUnits.push({
          id: item.planUnitId || null,
          day: dayData.day,
          orderIndex: orderCounter++,
          title: item.title,
          description: item.description,
          startTime: item.startTime?.length === 5 ? `${item.startTime}:00` : item.startTime,
          endTime: item.endTime?.length === 5 ? `${item.endTime}:00` : item.endTime,
          price: item.price,
          maxCount: item.maxCount,
          productScheduleId: item.productScheduleId
        });
      });
    });

    if (flattenedUnits.length === 0) {
      message.error("세부 단위 일정을 최소 1개 이상 추가해야 게시가 가능합니다.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('title', tripInfo.title.trim());
      formData.append('description', tripInfo.description.trim());
      formData.append('startDate', tripInfo.startDate);
      formData.append('endDate', tripInfo.endDate);
      formData.append('planType', 'CUSTOM');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      flattenedUnits.forEach((item, index) => {
        if (item.id) {
          formData.append(`planUnits[${index}].id`, String(item.id));
        }
        formData.append(`planUnits[${index}].day`, String(item.day));
        formData.append(`planUnits[${index}].orderIndex`, String(item.orderIndex));
        formData.append(`planUnits[${index}].title`, item.title.trim());
        formData.append(`planUnits[${index}].description`, item.description.trim());
        formData.append(`planUnits[${index}].startTime`, item.startTime);
        formData.append(`planUnits[${index}].endTime`, item.endTime);
        formData.append(`planUnits[${index}].price`, String(item.price));
        formData.append(`planUnits[${index}].maxCount`, String(item.maxCount));

        if (item.productScheduleId) {
          formData.append(`planUnits[${index}].productScheduleId`, String(item.productScheduleId));
        }
      });

      await onSave(formData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-12 max-w-[1280px] mx-auto px-4 md:px-8 py-6"
      >
        {/* 상단 액션바 구역 */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-[#333333]">
              {mode === 'edit' ? '일정 수정하기' : '일정 생성'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">다른 사용자와 함께 할 수 있는 나만의 플랜을 완성해보세요</p>
          </div>
          <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-[#007AFF] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-[#007AFF]/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-xs"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {mode === 'edit' ? '변경사항 저장하기' : '일정 생성하기'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 왼쪽 섹션: 마스터 기초 명세 패널 */}
          <div className="lg:col-span-1 space-y-8">
            <section className="space-y-4">
              <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">일정 정보</label>
              <div className="space-y-5 bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#666666] ml-1">여행 플랜 제목</p>
                  <input
                      type="text"
                      value={tripInfo.title}
                      onChange={(e) => setTripInfo({ ...tripInfo, title: e.target.value })}
                      placeholder="플랜 제목을 입력하세요"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                  />
                </div>

                {/* 📸 단일 이미지 업로드 UI 영역 */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#666666] ml-1">이미지</p>
                  <div className="flex flex-wrap gap-4">
                    {imageFile ? (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden group">
                          <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Preview" />
                          <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                    ) : (
                        <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-[#999999] hover:bg-gray-50 hover:border-[#007AFF] hover:text-[#007AFF] transition-all cursor-pointer">
                          <Camera size={24} />
                          <span className="text-[10px] font-black uppercase">Add Photo</span>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                          />
                        </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#666666] ml-1">플랜 상세 설명</p>
                  <textarea
                      value={tripInfo.description}
                      onChange={(e) => setTripInfo({ ...tripInfo, description: e.target.value })}
                      placeholder="플랜의 장점이나 규칙들을 상세 기입해 전달하세요."
                      rows={5}
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 resize-none leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-[#666666] ml-1">투어 시작 일자</p>
                    <input
                        type="date"
                        value={tripInfo.startDate}
                        onChange={(e) => setTripInfo({ ...tripInfo, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-[#666666] ml-1">투어 종료 일자</p>
                    <input
                        type="date"
                        value={tripInfo.endDate}
                        onChange={(e) => setTripInfo({ ...tripInfo, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 오른쪽 섹션: 타임라인 저니 박스 에디팅 존 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-black text-[#999999] uppercase tracking-widest">플랜 타임라인 설계</label>
              <button
                  onClick={handleAddDay}
                  className="text-xs font-black text-[#007AFF] hover:underline flex items-center gap-1"
              >
                <Plus size={14} strokeWidth={2.5}/> 일차(Day) 추가
              </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {itinerary.map((dayData, dayIdx) => (
                  <div key={dayData.day} className="space-y-4 bg-slate-50/50 p-4 rounded-[28px] border border-slate-100">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-md font-black text-[#333333]">{dayData.day}일차 여행</h3>
                      <button
                          onClick={() => handleAddItem(dayIdx)}
                          className="text-xs font-black text-[#007AFF] hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all"
                      >
                        + 세부 일정 단위 추가
                      </button>
                    </div>

                    <SortableContext items={dayData.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {dayData.items.length === 0 ? (
                            <div className="text-center py-8 bg-white border border-dashed border-[#E5E7EB] rounded-[24px] text-gray-400 text-xs font-medium">
                              배정된 세부 액티비티가 없습니다. 우측 상단의 추가 버튼을 눌러주세요.
                            </div>
                        ) : (
                            dayData.items.map((item, itemIdx) => {
                              const isSearchOpen = activeSearchKey === `${dayIdx}-${itemIdx}`;
                              return (
                                  <div key={item.id} className="space-y-3">
                                    <SortableItineraryItem
                                        item={item}
                                        itemIdx={itemIdx}
                                        dayIdx={dayIdx}
                                        handleUpdateItem={handleUpdateItem}
                                        onRemove={handleRemoveItem}
                                        onToggleProductSearch={handleToggleProductSearch}
                                        activeSearchKey={activeSearchKey}
                                    />

                                    {/* --- 조건부 인라인 토글형 상품 검색 드롭 서랍 구역 --- */}
                                    <AnimatePresence>
                                      {isSearchOpen && (
                                          <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: 'auto' }}
                                              exit={{ opacity: 0, height: 0 }}
                                              className="overflow-hidden bg-white border border-[#007AFF]/30 rounded-[24px] p-5 shadow-inner"
                                          >
                                            <div className="flex items-center gap-2 mb-4">
                                              <Ticket size={14} className="text-[#007AFF]" />
                                              <span className="text-xs font-black text-[#333333]">연동 가능한 실시간 스토어 티켓 검색</span>
                                            </div>
                                            <div className="flex gap-3">
                                              <input
                                                  type="date"
                                                  value={searchDate}
                                                  onChange={(e) => setSearchDate(e.target.value)}
                                                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[#007AFF]"
                                              />
                                              <button
                                                  onClick={handleSearchProducts}
                                                  className="bg-[#007AFF] text-white px-5 rounded-xl text-xs font-black hover:bg-blue-600 transition-colors"
                                              >
                                                조회
                                              </button>
                                            </div>

                                            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                                              {searchLoading ? (
                                                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300" size={20} /></div>
                                              ) : products.length === 0 ? (
                                                  <div className="text-center py-6 text-gray-400 text-[11px] font-bold bg-slate-50 rounded-xl border border-dashed border-slate-100">
                                                    조회 조건에 맞는 가이드 이용권 스케줄이 없습니다.
                                                  </div>
                                              ) : products.map(p => (
                                                  <div
                                                      key={p.productId}
                                                      onClick={() => handleSelectProduct(dayIdx, itemIdx, p)}
                                                      className="p-3 border border-slate-100 bg-white rounded-xl hover:border-[#007AFF] cursor-pointer transition-all flex justify-between items-center"
                                                  >
                                                    <div>
                                                      <div className="text-xs font-black text-slate-800">{p.productName}</div>
                                                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">{p.state} · {p.city}</div>
                                                    </div>
                                                    <div className="font-black text-xs text-[#333333]">{p.price.toLocaleString()}원</div>
                                                  </div>
                                              ))}
                                            </div>
                                          </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                              );
                            })
                        )}
                      </div>
                    </SortableContext>
                  </div>
              ))}
            </DndContext>
          </div>
        </div>
      </motion.div>
  );
};