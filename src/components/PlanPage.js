import React, {useState} from 'react';
import {
  ChevronLeft,
  Clock,
  Loader2,
  Plane,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import axiosInstance from "../util/axiosInstance";

// API 설정
const BASE_URL = 'http://ec2-43-201-242-253.ap-northeast-2.compute.amazonaws.com:8080';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9...'; // 실제 토큰 사용

const PlanCreatePage = () => {
  // --- 상태 관리 ---
  const [screen, setScreen] = useState('main'); // 'main' | 'unit'
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 메인 폼 데이터
  const [tripInfo, setTripInfo] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 345600000).toISOString().split('T')[0], // +4일
  });

  // 단위 일정 리스트
  const [units, setUnits] = useState([]);

  // 현재 편집 중인 단위 일정
  const [editingUnit, setEditingUnit] = useState(null);
  const [searchDate, setSearchDate] = useState(
      new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- API 호출 함수 (직접 호출 방식) ---

  // 상품 검색 (GET)
  const handleSearchProducts = async () => {
    setSearchLoading(true);
    try {
      const res = await axiosInstance.get(
          `/products/available?date=${searchDate}`);
      setProducts(res.data.data.content || []);
      console.log(res);
    } catch (e) {
      console.error("상품 검색 실패", e);
      alert("상품 정보를 불러오지 못했습니다.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 일정 게시 (POST)
  const handleSubmitPlan = async () => {
    if (!tripInfo.title || !tripInfo.description || units.length === 0) {
      alert("기본 정보와 단위 일정을 모두 입력해주세요.");
      return;
    }

    const sortedUnits = [...units].sort((a, b) => {
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      return a.startTime.localeCompare(b.startTime);
    });

    const payload = {
      ...tripInfo,
      planType: 'CUSTOM',
      planUnits: sortedUnits.map((u, idx) => ({
        day: u.day,
        orderIndex: idx + 1,
        title: u.title,
        description: u.description,
        startTime: u.startTime,
        endTime: u.endTime,
        price: u.price,
        maxCount: u.maxCount,
        productScheduleId: u.productScheduleId
      }))
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post(`/plans`, payload);
      alert("✈️ 일정이 성공적으로 게시되었습니다!");
      console.log(res.data);
    } catch (e) {
      console.error("게시 실패", e);
      alert("일정 게시 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 비즈니스 로직 ---

  const openUnitForm = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setSelectedProduct(unit._product || null);
    } else {
      setEditingUnit({
        day: units.length > 0 ? Math.max(...units.map(u => u.day)) + 1 : 1,
        title: '',
        description: '',
        startTime: '10:00',
        endTime: '12:00',
        price: 0,
        maxCount: 5,
        productScheduleId: null
      });
      setSelectedProduct(null);
    }
    setScreen('unit');
  };

  const saveUnit = () => {
    if (!editingUnit.title || !editingUnit.description) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    const newUnit = {
      ...editingUnit,
      id: editingUnit.id || Date.now(),
      _product: selectedProduct
    };

    if (units.find(u => u.id === newUnit.id)) {
      setUnits(units.map(u => u.id === newUnit.id ? newUnit : u));
    } else {
      setUnits([...units, newUnit]);
    }
    setScreen('main');
  };

  const deleteUnit = (id) => {
    if (window.confirm("이 일정을 삭제할까요?")) {
      setUnits(units.filter(u => u.id !== id));
    }
  };

  // --- UI 렌더링 ---

  if (screen === 'unit') {
    return (
        <div className="min-h-screen bg-[#f8f8f5] pb-10">
          {/* Header */}
          <div
              className="bg-white border-b px-6 h-14 flex items-center gap-4 sticky top-0 z-10">
            <button onClick={() => setScreen('main')}
                    className="text-gray-400 hover:text-black">
              <ChevronLeft size={24}/>
            </button>
            <h1 className="text-base font-bold">단위 일정 {editingUnit.id ? '수정'
                : '추가'}</h1>
          </div>

          <div className="max-w-2xl mx-auto p-6 space-y-6">
            {/* 상품 검색 카드 */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                <Search size={16} className="text-[#1D9E75]"/> 상품 검색
              </h2>
              <div className="flex gap-2">
                <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"
                />
                <button
                    onClick={handleSearchProducts}
                    className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  검색
                </button>
              </div>

              {/* 상품 리스트 */}
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {searchLoading ? (
                    <div
                        className="text-center py-4 text-gray-400 text-sm italic">불러오는
                      중...</div>
                ) : products.map(p => (
                    <div
                        key={p.productId}
                        onClick={() => {
                          setSelectedProduct(p);
                          setEditingUnit({
                            ...editingUnit,
                            title: p.productName,
                            price: p.price,
                            productScheduleId: p.scheduleId
                          });
                        }}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedProduct?.productId
                        === p.productId ? 'border-[#1D9E75] bg-[#f0fbf7]'
                            : 'hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div
                              className="text-sm font-bold">{p.productName}</div>
                          <div
                              className="text-[11px] text-gray-500">{p.state} · {p.city}</div>
                        </div>
                        <div
                            className="text-[#1D9E75] font-bold text-sm">¥{p.price.toLocaleString()}</div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* 상세 정보 카드 */}
            <div
                className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold mb-2">일정 상세 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                      className="text-[11px] font-bold text-gray-400 uppercase">일차
                    (Day)</label>
                  <input type="number" value={editingUnit.day}
                         onChange={(e) => setEditingUnit(
                             {...editingUnit, day: parseInt(e.target.value)})}
                         className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
                </div>
                <div className="space-y-1">
                  <label
                      className="text-[11px] font-bold text-gray-400 uppercase">최대
                    인원</label>
                  <input type="number" value={editingUnit.maxCount}
                         onChange={(e) => setEditingUnit({
                           ...editingUnit,
                           maxCount: parseInt(e.target.value)
                         })}
                         className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
                </div>
              </div>
              <div className="space-y-1">
                <label
                    className="text-[11px] font-bold text-gray-400 uppercase">일정
                  제목</label>
                <input type="text" value={editingUnit.title}
                       onChange={(e) => setEditingUnit(
                           {...editingUnit, title: e.target.value})}
                       className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
              </div>
              <div className="space-y-1">
                <label
                    className="text-[11px] font-bold text-gray-400 uppercase">설명</label>
                <textarea value={editingUnit.description}
                          onChange={(e) => setEditingUnit(
                              {...editingUnit, description: e.target.value})}
                          className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-[#1D9E75]"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                      className="text-[11px] font-bold text-gray-400 uppercase">시작
                    시간</label>
                  <input type="time" value={editingUnit.startTime}
                         onChange={(e) => setEditingUnit(
                             {...editingUnit, startTime: e.target.value})}
                         className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
                </div>
                <div className="space-y-1">
                  <label
                      className="text-[11px] font-bold text-gray-400 uppercase">종료
                    시간</label>
                  <input type="time" value={editingUnit.endTime}
                         onChange={(e) => setEditingUnit(
                             {...editingUnit, endTime: e.target.value})}
                         className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setScreen('main')}
                        className="px-6 py-2 rounded-xl text-sm font-bold border">취소
                </button>
                <button onClick={saveUnit}
                        className="px-6 py-2 rounded-xl text-sm font-bold bg-[#1D9E75] text-white">저장
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f8f8f5] pb-20">
        {/* Nav */}
        <nav
            className="bg-white border-b px-6 h-14 flex items-center justify-between sticky top-0 z-10">
          <div
              className="flex items-center gap-2 text-[#1D9E75] font-bold italic">
            <Plane size={20}/> Tripmate
          </div>
          <div className="text-sm font-bold">일정 생성</div>
        </nav>

        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <header>
            <h1 className="text-xl font-bold">새 여행 일정 만들기</h1>
            <p className="text-xs text-gray-400">기본 정보를 입력하고 세부 일정을 구성하세요.</p>
          </header>

          {/* 기본 정보 카드 */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold border-l-4 border-[#1D9E75] pl-2">기본
              정보</h2>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase">여행
                제목</label>
              <input
                  value={tripInfo.title}
                  onChange={(e) => setTripInfo(
                      {...tripInfo, title: e.target.value})}
                  placeholder="예: 도쿄 5일 맛집 투어"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"
              />
            </div>
            <div className="space-y-1">
              <label
                  className="text-[11px] font-bold text-gray-400 uppercase">설명</label>
              <textarea
                  value={tripInfo.description}
                  onChange={(e) => setTripInfo(
                      {...tripInfo, description: e.target.value})}
                  placeholder="여행에 대해 소개해주세요"
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-[#1D9E75]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                    className="text-[11px] font-bold text-gray-400 uppercase">시작일</label>
                <input type="date" value={tripInfo.startDate}
                       onChange={(e) => setTripInfo(
                           {...tripInfo, startDate: e.target.value})}
                       className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
              </div>
              <div className="space-y-1">
                <label
                    className="text-[11px] font-bold text-gray-400 uppercase">종료일</label>
                <input type="date" value={tripInfo.endDate}
                       onChange={(e) => setTripInfo(
                           {...tripInfo, endDate: e.target.value})}
                       className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1D9E75]"/>
              </div>
            </div>
          </div>

          {/* 단위 일정 리스트 카드 */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold border-l-4 border-[#1D9E75] pl-2">세부
                일정</h2>
              <button onClick={() => openUnitForm()}
                      className="flex items-center gap-1 text-[11px] font-bold bg-[#f0fbf7] text-[#1D9E75] px-2 py-1 rounded-lg">
                <Plus size={14}/> 추가
              </button>
            </div>

            <div className="space-y-3">
              {units.length === 0 ? (
                  <div
                      className="text-center py-10 border-2 border-dashed rounded-xl text-gray-300 text-sm">
                    단위 일정을 추가해주세요.
                  </div>
              ) : (
                  units.sort((a, b) => a.day - b.day).map((unit) => (
                      <div key={unit.id}
                           className="flex gap-3 p-3 bg-[#fdfdfb] border rounded-xl group relative">
                        <div
                            className="bg-[#e1f5ee] text-[#1D9E75] font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0">
                          {unit.day}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold">{unit.title}</div>
                          <div
                              className="flex gap-3 mt-1 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Clock
                                size={10}/> {unit.startTime} - {unit.endTime}</span>
                            <span className="flex items-center gap-1"><Users
                                size={10}/> {unit.maxCount}명</span>
                            {unit._product && <span className="text-[#1D9E75]">🎫 티켓 연동됨</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openUnitForm(unit)}
                                  className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400">
                            <Search size={14}/></button>
                          <button onClick={() => deleteUnit(unit.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-md text-red-300">
                            <Trash2 size={14}/></button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </div>

          <button
              onClick={handleSubmitPlan}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg shadow-[#1D9E75]/20 flex items-center justify-center gap-2 ${loading
                  ? 'bg-gray-400' : 'bg-[#1D9E75] hover:bg-[#167e5e]'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Plane
                size={18}/>}
            일정 게시하기
          </button>
        </div>
      </div>
  );
};

export default PlanCreatePage;