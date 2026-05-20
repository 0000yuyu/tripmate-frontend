/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  ChevronRight,
  Plus,
  Settings,
  Calendar,
  Clock,
  Download,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Info,
  MapPin,
  Mail,
  Phone,
  FileText, XCircle, Camera
} from 'lucide-react';
import { message, Spin, Form, DatePicker, InputNumber, Input, Select } from 'antd';
import axiosInstance from "../utils/axiosInstance";
import CustomModal from "@components/CustomModal.jsx";
import {getAccessToken} from "@utils/auth.js";
import axios from "axios";

const LOCATION_DATA = {
  KR: {
    label: "대한민국 (KR)",
    states: [
      { value: "Seoul", label: "서울특별시" },
      { value: "Gyeonggi", label: "경기도" },
      { value: "Busan", label: "부산광역시" },
      { value: "Daegu", label: "대구광역시" },
      { value: "Incheon", label: "인천광역시" }
    ],
    cities: {
      Seoul: [{ value: "Gangnam", label: "강남구" }, { value: "Mapo", label: "마포구" }, { value: "Jongno", label: "종로구" }],
      Gyeonggi: [{ value: "Suwon", label: "수원시" }, { value: "Seongnam", label: "성남시" }, { value: "Goyang", label: "고양시" }],
      Busan: [{ value: "Haeundae", label: "해운대구" }, { value: "Sajik", label: "동래구" }],
      Daegu: [{ value: "Jung-gu", label: "중구" }, { value: "Suseong", label: "수성구" }],
      Incheon: [{ value: "Yeonsu", label: "연수구" }, { value: "Bupyeong", label: "부평구" }]
    }
  },
  JP: {
    label: "일본 (JP)",
    states: [
      { value: "Tokyo", label: "도쿄도 (Tokyo)" },
      { value: "Osaka", label: "오사카부 (Osaka)" },
      { value: "Kyoto", label: "교토부 (Kyoto)" },
      { value: "Okinawa", label: "오키나와현 (Okinawa)" }
    ],
    cities: {
      Tokyo: [{ value: "Shibuya", label: "시부야구 (Shibuya)" }, { value: "Shinjuku", label: "신주쿠구 (Shinjuku)" }, { value: "Chiyoda", label: "치요다구 (Chiyoda)" }],
      Osaka: [{ value: "Osaka-City", label: "오사카시 (Osaka)" }, { value: "Sakai", label: "사카이시" }],
      Kyoto: [{ value: "Kyoto-City", label: "교토시 (Kyoto)" }, { value: "Uji", label: "우지시" }],
      Okinawa: [{ value: "Naha", label: "나하시 (Naha)" }, { value: "Okinawa-City", label: "오키나와시" }]
    }
  }
};

export default function CompanyManagementPage() {
  const { companyId } = useParams();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('SCHEDULE');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState('JP');
  const [selectedState, setSelectedState] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [rawProducts, setRawProducts] = useState([]);
  const [productSchedulesMap, setProductSchedulesMap] = useState({});
  const [companyInfo, setCompanyInfo] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const fetchData = async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const [companyRes, productRes] = await Promise.all([
        axiosInstance.get(`/companies/${companyId}`),
        axiosInstance.get('/products')
      ]);

      if (companyRes.data?.success && companyRes.data?.data) {
        setCompanyInfo(companyRes.data.data);
      }

      if (productRes.data?.success && productRes.data?.data?.content) {
        const myCompanyProducts = productRes.data.data.content.filter(
            (p) => p.companyId === companyId
        );
        setRawProducts(myCompanyProducts);

        const schedulePromises = myCompanyProducts.map(async (product) => {
          try {
            const scheduleRes = await axiosInstance.get(`/products/${product.id}/schedules`);
            return {
              productId: product.id,
              schedules: scheduleRes.data?.success ? scheduleRes.data.data.content : []
            };
          } catch (e) {
            return { productId: product.id, schedules: [] };
          }
        });

        const scheduleResults = await Promise.all(schedulePromises);
        const newMap = {};
        scheduleResults.forEach(res => {
          newMap[res.productId] = res.schedules;
        });
        setProductSchedulesMap(newMap);
        message.success('파트너 및 전수 재고 대장이 실시간 동기화되었습니다.');
      }
    } catch (error) {
      console.error(error);
      message.error('파트너 센터 정보를 가져오는 중 서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const flattenedTableData = useMemo(() => {
    const rows = [];
    rawProducts.forEach(product => {
      const schedules = productSchedulesMap[product.id] || [];
      schedules.forEach(schedule => {
        rows.push({
          id: schedule.scheduleId,
          productId: product.id,
          productName: product.productName,
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=200",
          date: schedule.date,
          price: product.price,
          status: schedule.stock === 0 ? 'SOLD_OUT' : (schedule.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED'),
          stock: schedule.stock,
          sales: Math.floor(Math.random() * 20)
        });
      });
    });
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [rawProducts, productSchedulesMap]);

  const filteredRows = useMemo(() => {
    let result = [...flattenedTableData];
    if (searchQuery.trim() !== '') {
      result = result.filter(row => row.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedProductFilter !== 'all') {
      result = result.filter(row => row.productId === selectedProductFilter);
    }
    if (selectedStatusFilter !== 'all') {
      result = result.filter(row => row.status === selectedStatusFilter);
    }
    if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
      const startString = selectedDateRange[0].format('YYYY-MM-DD');
      const endString = selectedDateRange[1].format('YYYY-MM-DD');
      result = result.filter(row => row.date >= startString && row.date <= endString);
    }
    return result;
  }, [flattenedTableData, searchQuery, selectedProductFilter, selectedStatusFilter, selectedDateRange]);

  const handleFormSubmit = async (values) => {
    setModalLoading(true);
    try {
      if (modalMode === 'SCHEDULE') {
        const { productId, dateRange, stock } = values;
        const payload = {
          productId,
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          stock
        };
        const response = await axiosInstance.post(
            `/products/${productId}/schedules/bulk`,
            payload,
            { headers: { 'X-Company-Id': companyId } }
        );
        if (response.data?.success) message.success('기한 내 스케줄 생성이 일괄 완료되었습니다.');
      } else {
        const formData = new FormData();

        formData.append('companyId', companyId);
        formData.append('productName', values.productName.trim());
        formData.append('description', values.description.trim());
        formData.append('price', String(values.price));
        formData.append('status', 'ACTIVE');

        formData.append('addressLine', values.address.addressLine.trim());
        formData.append('country', values.address.country);
        formData.append('state', values.address.state);
        formData.append('city', values.address.city);

        if (imageFile) {
          formData.append('image', imageFile);
        }

        const token = getAccessToken();

        await axios.post('/api/products', formData, {
          headers: {
            'X-Company-Id': companyId,
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          }
        });
      }

      setIsModalOpen(false);
      form.resetFields();
      setImageFile(null);
      setSelectedState(null);
      fetchData();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 && Array.isArray(error.response.data?.data)) {
        const fieldErrors = error.response.data.data.map(err => ({
          name: ['address', err.field],
          errors: [err.message]
        }));
        form.setFields(fieldErrors);
        message.error('입력 항목의 필수 조건 검증에 실패했습니다.');
      } else {
        message.error('요청 처리 도중 시스템 예기치 못한 오류가 발생했습니다.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
    if(mode === 'PRODUCT') {
      setSelectedCountry('JP');
      setSelectedState(null);
      setImageFile(null);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-auto space-y-8 pb-24 pt-10 px-6 font-sans antialiased text-[#37352F]"
      >
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
            <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-500" : ""} />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-3xs space-y-4 relative overflow-hidden">
          {companyInfo?.status === 'ACTIVE' && (
              <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
              ● 파트너 승인
            </span>
          )}

          <div className="space-y-1.5">
            <div className="text-4xl select-none cursor-default mb-1">🏢</div>
            <h2 className="text-2xl font-black tracking-tight text-[#37352F] flex items-center gap-2">
              {companyInfo?.name || "로딩 중..."}
              <span className="text-xs font-mono text-gray-400 font-normal">({companyInfo?.businessNumber})</span>
            </h2>
            <p className="text-xs font-medium text-gray-500 max-w-3xl leading-relaxed">
              {companyInfo?.description || "업체 소개 요약 정보가 존재하지 않습니다."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <span className="text-gray-400 w-16 select-none">담당 이메일</span>
              <span className="text-slate-700 font-mono">{companyInfo?.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <span className="text-gray-400 w-16 select-none">대표 연락처</span>
              <span className="text-slate-700 font-mono">{companyInfo?.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-gray-400 shrink-0" />
              <span className="text-gray-400 w-16 select-none">업체 id</span>
              <span className="text-slate-600 font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200/50 truncate">{companyInfo?.id}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => openModal('PRODUCT')} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3.5 py-1.5 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all text-xs shadow-2xs">
              <Plus size={13} strokeWidth={2.5} /> 새 상품 등록
            </button>
            <button onClick={() => openModal('SCHEDULE')} className="flex items-center gap-1.5 bg-[#007AFF] text-white px-3.5 py-1.5 rounded-xl font-semibold hover:bg-blue-600 active:scale-95 transition-all text-xs shadow-xs">
              <Calendar size={13} /> 기간 스케줄 추가
            </button>
          </div>
        </div>

        <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 select-none pb-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} />
              <span>데이터베이스 필터</span>
            </div>
            {(searchQuery || selectedProductFilter !== 'all' || selectedStatusFilter !== 'all' || selectedDateRange) && (
                <button onClick={() => { setSearchQuery(''); setSelectedProductFilter('all'); setSelectedStatusFilter('all'); setSelectedDateRange(null); }} className="text-gray-400 hover:text-blue-500 font-medium transition-colors text-[11px]">조건 초기화</button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1">
              <div className="relative flex items-center bg-gray-50 rounded-xl px-2.5 py-2 border border-gray-200/80">
                <Search size={13} className="text-gray-400 mr-2" />
                <input type="text" placeholder="상품명 실시간 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-xs text-[#37352F] outline-none placeholder-gray-400 w-full font-medium" />
              </div>
              <div className="flex flex-col">
                <select value={selectedProductFilter} onChange={(e) => setSelectedProductFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-600 outline-none cursor-pointer focus:border-gray-400">
                  <option value="all">모든 상품</option>
                  {rawProducts.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-600 outline-none cursor-pointer focus:border-gray-400">
                  <option value="all">⚡ 모든 판매 상태</option>
                  <option value="ACTIVE">판매 중</option>
                  <option value="SOLD_OUT">🔴 매진 완료</option>
                  <option value="DISABLED">중지됨</option>
                </select>
              </div>
            </div>
            <div className="w-full lg:w-[280px] shrink-0">
              <DatePicker.RangePicker value={selectedDateRange} onChange={(dates) => setSelectedDateRange(dates)} className="w-full py-2.5 rounded-xl text-xs font-medium bg-gray-50 border-gray-200/80 hover:border-gray-300" placeholder={['시작일 필터', '종료일 필터']} />
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs bg-white relative">
          <Spin spinning={isLoading}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#FBFBFA] border-b border-gray-200 select-none">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 w-[50px] text-center">#</th>
                  <th className="px-4 py-3 max-w-[340px]">상품 항목</th>
                  <th className="px-4 py-3 w-[180px]">해당 이용일자</th>
                  <th className="px-4 py-3 text-right w-[130px]">정가 (원화)</th>
                  <th className="px-4 py-3 text-center w-[120px]">현황 상태</th>
                  <th className="px-4 py-3 text-right w-[120px]">잔여 수량</th>
                  <th className="px-4 py-3 w-[150px]">실시간 판매 추이</th>
                  <th className="px-4 py-3 w-[60px]"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-xs text-[#37352F]">
                {filteredRows.length > 0 ? (
                    filteredRows.map((row, index) => (
                        <tr key={row.id} className="group hover:bg-[#FAFBFB] transition-colors">
                          <td className="px-5 py-3.5 text-center text-gray-400 font-mono">{index + 1}</td>
                          <td className="px-4 py-3.5 max-w-[340px]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                                <img src={row.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-800 truncate">{row.productName}</span>
                                <span className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {row.productId.substring(0,8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 font-bold text-gray-600">
                              <Calendar size={12} className="text-[#007AFF] opacity-80" /> {row.date}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">₩{row.price?.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-center">
                            {row.status === 'SOLD_OUT' ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-tight bg-red-50 text-red-600 border border-red-100 animate-pulse">🔴 매진 완료</span>
                            ) : row.status === 'ACTIVE' ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-tight bg-blue-50 text-blue-600 border border-blue-100">판매 중</span>
                            ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-tight bg-gray-100 text-gray-500 border border-gray-200">중지됨</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono">
                            <span className={`font-bold ${row.stock === 0 ? 'text-red-500 font-black' : 'text-gray-600'}`}>{row.stock}개</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${row.status === 'SOLD_OUT' ? 'bg-red-400' : 'bg-[#007AFF]'}`} style={{ width: `${Math.min(100, (row.sales / (row.stock + row.sales || 1)) * 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-gray-400">{row.sales}건</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => message.info('정산 타임스탬프 이력 추적')} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"><Clock size={12} /></button>
                              <button onClick={() => message.info('티켓 단위 개별 수정 바 가동')} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"><Settings size={12} /></button>
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan={8} className="py-24 text-center text-xs font-bold text-gray-400 bg-white">설정된 다중 필터 조건에 부합하는 재고 스케줄 데이터가 내역에 없습니다.</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </Spin>

          <div className="bg-[#FBFBFA] p-3.5 border-t border-gray-200 flex justify-between items-center text-[11px] font-bold text-gray-400 select-none">
            <button onClick={() => openModal('SCHEDULE')} className="hover:text-[#007AFF] flex items-center gap-1.5 transition-colors pl-1">
              <Plus size={12} strokeWidth={2.5} /> 새로운 타임라인 특정 기간 스케줄 일괄 추가 개설
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <Info size={12} /> <span>전체 필터링 결과: {filteredRows.length}행</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="bg-[#F9FAFB] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-[#007AFF]/20 border border-transparent">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#333333] tracking-tight">트립메이트 파트너 데이터 가이드</h3>
              <p className="text-xs font-medium text-[#666666]">
                필터 정렬 기준 변경 및 상단 검색을 통해 상품과 일자별 잔여 티켓을 복합적으로 제어할 수 있습니다.
              </p>
            </div>
            <button className="bg-white text-[#333333] p-3 rounded-xl border border-gray-200 shadow-xs group-hover:scale-105 transition-all self-end sm:self-auto">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <CustomModal
            isOpen={isModalOpen}
            onClose={() => {
              if(!modalLoading) {
                setIsModalOpen(false);
                form.resetFields();
                setSelectedState(null);
                setImageFile(null);
              }
            }}
            title={modalMode === 'SCHEDULE' ? "스케줄 타임라인 일괄 생성" : "새 상품 등록"}
            maxWidth={modalMode === 'SCHEDULE' ? "max-w-[460px]" : "max-w-[520px]"}
            buttons={
              <div className="flex gap-2 w-full">
                <button type="button" disabled={modalLoading} onClick={() => { setIsModalOpen(false); form.resetFields(); setSelectedState(null); setImageFile(null); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-[14px] text-xs font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">취소하기</button>
                <button type="button" disabled={modalLoading} onClick={() => form.submit()} className="flex-[2] py-3 bg-blue-600 text-white rounded-[14px] text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {modalLoading && <RefreshCw size={12} className="animate-spin" />}
                  {modalMode === 'SCHEDULE' ? '일괄 추가 실행' : '상품 등록'}
                </button>
              </div>
            }
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit} requiredMark={false} className="space-y-1.5">
            {modalMode === 'SCHEDULE' ? (
                <>
                  <Form.Item name="productId" label={<span className="text-xs font-black text-slate-700">대상 상품 지정</span>} rules={[{ required: true, message: '등록 타겟 상품을 지정하세요.' }]}>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#007AFF]">
                      <option value="">상품을 선택하세요</option>
                      {rawProducts.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                    </select>
                  </Form.Item>
                  <Form.Item name="dateRange" label={<span className="text-xs font-black text-slate-700">일괄 적용 기간 범위</span>} rules={[{ required: true, message: '시작 및 종료 일자를 설정하세요.' }]}>
                    <DatePicker.RangePicker className="w-full py-2.5 rounded-[12px] text-xs font-medium bg-gray-50 border-gray-200" placeholder={['시작일', '종료일']} />
                  </Form.Item>
                  <Form.Item name="stock" label={<span className="text-xs font-black text-slate-700">일자별 기본 배정 인원 (재고)</span>}
                             rules={[{ required: true, message: '기본 재고 수량을 기입하세요.' }]} initialValue={60}>
                    <InputNumber min={0} max={999} className="w-full py-1 rounded-[12px] bg-gray-50 text-xs font-bold border-gray-200" />
                  </Form.Item>
                </>
            ) : (
                <>
                  <Form.Item name="productName" label={<span className="text-xs font-black text-slate-700">상품 이름</span>} rules={[{ required: true, message: '상품 타이틀명을 기입하세요.' }]}>
                    <Input placeholder="예: 도쿄 해리포터 스튜디오 입장권" className="py-2.5 rounded-[12px] text-xs font-medium bg-gray-50" />
                  </Form.Item>

                  <Form.Item name="description" label={<span className="text-xs font-black text-slate-700">상품 상세 정보 설명</span>} rules={[{ required: true, message: '상품에 대한 핵심 명세를 기입하세요.' }]}>
                    <Input.TextArea placeholder="상품에 관련된 간략한 설명 기입..." rows={2} className="rounded-[12px] text-xs font-medium bg-gray-50" />
                  </Form.Item>
                  <Form.Item name="price" label={<span className="text-xs font-black text-slate-700">기준 판매 단가 (원화 기준)</span>} rules={[{ required: true, message: '판매 단가를 기입해 주세요.' }]} initialValue={5000}>
                    <InputNumber min={0} formatter={value => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\₩\s?|(,*)/g, '')} className="w-full py-1 rounded-[12px] bg-gray-50 text-xs font-bold border-gray-200" />
                  </Form.Item>

                  <div className="pt-2 border-t border-dashed border-gray-200 mt-3 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-black text-gray-400 mb-1">
                      <MapPin size={12} className="text-blue-500" />
                      <span>오프라인 장소 연동 위치 (필수 사항)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Form.Item name={["address", "country"]} label={<span className="text-[10px] font-bold text-gray-500">국가 선택</span>} rules={[{ required: true, message: '국가는 필수입니다.' }]} initialValue="JP">
                        <Select
                            onChange={(val) => {
                              setSelectedCountry(val);
                              setSelectedState(null);
                              form.setFieldsValue({ address: { state: undefined, city: undefined } });
                            }}
                            options={Object.keys(LOCATION_DATA).map(key => ({ value: key, label: LOCATION_DATA[key].label }))}
                            className="w-full text-xs h-[38px]"
                        />
                      </Form.Item>

                      <Form.Item name={["address", "state"]} label={<span className="text-[10px] font-bold text-gray-500">도 / 주 (State)</span>} rules={[{ required: true, message: '도/주는 필수입니다.' }]}>
                        <Select
                            placeholder="선택하세요"
                            onChange={(val) => {
                              setSelectedState(val);
                              form.setFieldsValue({ address: { city: undefined } });
                            }}
                            options={LOCATION_DATA[selectedCountry]?.states || []}
                            className="w-full text-xs h-[38px]"
                        />
                      </Form.Item>
                    </div>

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

                    <div className="grid grid-cols-1 gap-1">
                      <Form.Item name={["address", "city"]} label={<span className="text-[10px] font-bold text-gray-500">도시 (City)</span>} rules={[{ required: true, message: '도시는 필수입니다.' }]}>
                        <Select
                            placeholder="상위 지역을 먼저 선택하세요"
                            disabled={!selectedState}
                            options={selectedState ? (LOCATION_DATA[selectedCountry]?.cities[selectedState] || []) : []}
                            className="w-full text-xs h-[38px]"
                        />
                      </Form.Item>

                      <Form.Item name={["address", "addressLine"]} label={<span className="text-[10px] font-bold text-gray-500">상세 주소 (Address Line)</span>} rules={[{ required: true, message: '상세 주소는 필수입니다.' }]}>
                        <Input placeholder="예: 1-15-9 Jinnan, Shibuya-ku" className="py-2 rounded-[10px] text-xs bg-gray-50" />
                      </Form.Item>
                    </div>
                  </div>
                </>
            )}
          </Form>
        </CustomModal>
      </motion.div>
  );
}