/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Calendar, MapPin, Clock, ArrowLeft, Loader2, ShoppingBag, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { planService, companyService } from '../services';

export const CreatePlanView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('KOREA');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    const fetchSharedProducts = async () => {
      if (!startDate) return;
      try {
        const response = await companyService.getAvailableProducts(startDate);
        setAvailableProducts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchSharedProducts();
  }, [startDate]);

  const [unitPlans, setUnitPlans] = useState([
    { 
      id: Math.random().toString(36).substr(2, 9),
      title: '첫 번째 활동', 
      description: '', 
      maxParticipants: 5,
      dayNumber: 1, 
      startTime: '09:00:00', 
      endTime: '12:00:00',
      productId: ''
    }
  ]);

  const handleAddUnit = () => {
    setUnitPlans([...unitPlans, {
      id: Math.random().toString(36).substr(2, 9),
      title: '새로운 활동',
      description: '',
      maxParticipants: 5,
      dayNumber: 1,
      startTime: '13:00:00',
      endTime: '15:00:00',
      productId: ''
    }]);
  };

  const handleUpdateUnit = (id, field, value) => {
    setUnitPlans(unitPlans.map(unit => unit.id === id ? { ...unit, [field]: value } : unit));
  };

  const handleRemoveUnit = (id) => {
    setUnitPlans(unitPlans.filter(unit => unit.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(unitPlans);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setUnitPlans(items);
  };

  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      alert('필수 정보를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create main plan
      const planResponse = await planService.createPlan({
        title,
        description,
        country,
        startDate,
        endDate
      });

      const planId = planResponse.data.data.planId;

      // 2. Add unit plans
      await Promise.all(unitPlans.map(unit => 
        planService.addUnitPlan(planId, {
          title: unit.title,
          description: unit.description,
          maxParticipants: parseInt(unit.maxParticipants),
          dayNumber: parseInt(unit.dayNumber),
          startTime: unit.startTime.length === 5 ? `${unit.startTime}:00` : unit.startTime,
          endTime: unit.endTime.length === 5 ? `${unit.endTime}:00` : unit.endTime,
          productId: unit.productId || null
        })
      ));

      alert('일정이 성공적으로 생성되었습니다!');
      navigate('/schedules');
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('일정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100 p-12 min-h-[800px]">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-[#999999]"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-[32px] font-black text-[#333333] tracking-tight">새로운 일정 만들기</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#007AFF] text-white px-10 py-4 rounded-[20px] font-black shadow-lg shadow-[#007AFF]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          일정 등록하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left column: Basic Info */}
        <div className="lg:col-span-1 space-y-10">
          <section className="space-y-4">
            <label className="text-xs font-black text-[#999999] uppercase tracking-widest px-1">기본 정보</label>
            <div className="space-y-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[32px] p-8">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">일정 제목 <span className="text-red-500">*</span></p>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 제주도 3박 4일 미식 투어"
                  className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">국가</p>
                <input 
                  type="text" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#666666] ml-2">시작일 <span className="text-red-500">*</span></p>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#666666] ml-2">종료일 <span className="text-red-500">*</span></p>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#666666] ml-2">상세 설명</p>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="여행의 목적이나 특징을 설명해주세요."
                  rows={6}
                  className="w-full px-5 py-4 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right column: Unit Plans */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-1">
             <label className="text-xs font-black text-[#999999] uppercase tracking-widest">세부 일정 (Unit Plans)</label>
             <button 
               onClick={handleAddUnit}
               className="flex items-center gap-1.5 text-xs font-black text-[#007AFF] hover:bg-[#F0F7FF] px-4 py-2 rounded-xl transition-all"
             >
               <Plus size={16} />
               활동 추가
             </button>
           </div>

           <div className="space-y-6">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="unitPlans">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                      {unitPlans.map((unit, index) => (
                        <Draggable key={unit.id} draggableId={unit.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white border ${snapshot.isDragging ? 'border-[#007AFF] shadow-2xl' : 'border-[#E5E7EB]'} rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all group relative`}
                            >
                              <div className="flex items-start gap-6">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="self-center p-2 text-[#E5E7EB] hover:text-[#999999] cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical size={20} />
                                </div>

                                <div className="w-12 h-12 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg shadow-[#007AFF]/20">
                                  {index + 1}
                                </div>
                                
                                <div className="flex-1 grid grid-cols-6 gap-6">
                                  <div className="col-span-6 md:col-span-4">
                                    <input 
                                      type="text" 
                                      placeholder="활동 또는 장소 명칭"
                                      value={unit.title}
                                      onChange={(e) => handleUpdateUnit(unit.id, 'title', e.target.value)}
                                      className="w-full px-0 py-1 text-[22px] font-black text-[#333333] border-b-2 border-transparent focus:border-[#007AFF] focus:outline-none transition-all placeholder:text-gray-200"
                                    />
                                  </div>
                                  
                                  <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                                    <p className="text-[11px] font-bold text-[#999999] whitespace-nowrap">최대 인원</p>
                                    <input 
                                      type="number" 
                                      value={unit.maxParticipants}
                                      onChange={(e) => handleUpdateUnit(unit.id, 'maxParticipants', e.target.value)}
                                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs font-black focus:outline-none"
                                    />
                                  </div>

                                  <div className="col-span-2 flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl group-focus-within:border-[#007AFF]/30">
                                    <Calendar size={16} className="text-[#999999]" />
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-[#999999] uppercase">Day</span>
                                      <input 
                                        type="number" 
                                        value={unit.dayNumber}
                                        onChange={(e) => handleUpdateUnit(unit.id, 'dayNumber', e.target.value)}
                                        className="bg-transparent text-sm font-black w-full focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-span-2 flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl group-focus-within:border-[#007AFF]/30">
                                    <Clock size={16} className="text-[#999999]" />
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-[#999999] uppercase">Start</span>
                                      <input 
                                        type="text" 
                                        placeholder="00:00:00"
                                        value={unit.startTime}
                                        onChange={(e) => handleUpdateUnit(unit.id, 'startTime', e.target.value)}
                                        className="bg-transparent text-sm font-black w-full focus:outline-none font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-span-2 flex items-center gap-3 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl group-focus-within:border-[#007AFF]/30">
                                    <Clock size={16} className="text-[#999999]" />
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-[#999999] uppercase">End</span>
                                      <input 
                                        type="text" 
                                        placeholder="00:00:00"
                                        value={unit.endTime}
                                        onChange={(e) => handleUpdateUnit(unit.id, 'endTime', e.target.value)}
                                        className="bg-transparent text-sm font-black w-full focus:outline-none font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-span-6">
                                    <textarea 
                                      placeholder="활동 상세 설명 (옵션)"
                                      value={unit.description}
                                      onChange={(e) => handleUpdateUnit(unit.id, 'description', e.target.value)}
                                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-[13px] font-medium focus:outline-none transition-all resize-none"
                                      rows={2}
                                    />
                                  </div>

                                  <div className="col-span-6">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-[#F0F7FF] border border-[#007AFF]/20 rounded-2xl">
                                      <ShoppingBag size={16} className="text-[#007AFF]" />
                                      <select
                                        value={unit.productId}
                                        onChange={(e) => handleUpdateUnit(unit.id, 'productId', e.target.value)}
                                        className="bg-transparent text-sm font-bold text-[#007AFF] w-full focus:outline-none cursor-pointer"
                                      >
                                        <option value="">연결할 상품 선택 (선택 사항)</option>
                                        {availableProducts.map(product => (
                                          <option key={product.productId} value={product.productId}>
                                            [{product.category}] {product.productName} - {product.price.toLocaleString()}원
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <button 
                                  onClick={() => handleRemoveUnit(unit.id)}
                                  className="p-2 text-[#E5E7EB] hover:text-red-500 transition-all self-center"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {unitPlans.length === 0 && (
                <div className="py-20 border-2 border-dashed border-[#E5E7EB] rounded-[40px] flex flex-col items-center justify-center gap-4 text-[#999999]">
                   <Calendar size={40} className="opacity-20" />
                   <p className="font-bold">아직 추가된 세부 일정이 없습니다.</p>
                   <button 
                     onClick={handleAddUnit}
                     className="bg-[#007AFF] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-[#007AFF]/10 hover:scale-105 transition-all"
                   >
                     첫 활동 추가하기
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
