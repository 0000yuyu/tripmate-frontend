import {RestaurantRow} from "./RestaurantCard";
import {useEffect, useState} from "react";
import axiosInstance from "../util/axiosInstance";
import {Link} from "react-router-dom";

export function PlanListPage() {
  const [originalData, setOriginalData] = useState([]); // 서버에서 받은 원본 데이터
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = ["All", "OPEN", "CLOSED"];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axiosInstance.get("/plans");
      // 서버 데이터 구조에 맞춰 조정하세요 (content가 배열인 경우)
      setOriginalData(response.data.data.content || []);
    } catch (e) {
      console.error("데이터 로딩 실패", e);
    }
  }

  // 모든 필터 조건을 결합한 데이터 계산
  const filteredData = originalData.filter((item) => {
    // 1. 이름 검색 (item.name 또는 item.title 등 필드명 확인 필요)
    const matchesSearch = (item.title || "").toLowerCase().includes(
        searchTerm.toLowerCase());

    // 2. 타입 필터
    const matchesType = activeCategory === "All" || item.status
        === activeCategory;

    // 3. 날짜 범위 필터 (item.date가 '2024-01-01' 형태라고 가정)
    const itemStartDate = new Date(item.startDate || item.date);
    const itemEndDate = new Date(item.endDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    console.log(itemStartDate, startDate)

    let matchesDate = true;
    if (start && itemStartDate < start) {
      matchesDate = false;
    }
    if (end && itemEndDate > end) {
      matchesDate = false;
    }
    return matchesSearch && matchesType && matchesDate;
  });

  return (
      <div className="w-full overflow-hidden max-w-6xl mx-auto mt-8">
        <div
            className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-200">
          {/* 이름 검색 인풋 */}
          <div className="flex-grow min-w-[200px]">
            <input
                type="text"
                placeholder="일정을 검색하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className={"flex w-full justify-between gap-2"}>
            {/* Type 선택 드롭다운 (간소화된 select) */}
            <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="px-3 py-1.5 text-sm font-medium bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              {categories.map(
                  c => <option key={c} value={c}>Type: {c}</option>)}
            </select>

            {/* 날짜 필터 영역 */}
            <div className="flex items-center gap-1 flex-1">
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 text-xs flex-1 border h-full border-gray-300 rounded-md"
              />
              <span className="text-gray-400">~</span>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 text-xs flex-1 border h-full border-gray-300 rounded-md"
              />
            </div>

            <Link to={"/plan/create"}>
              <button
                  className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                New
              </button>
            </Link>
          </div>
        </div>


        {/* 결과 요약 및 초기화 */}
        {(searchTerm || activeCategory !== "All" || startDate || endDate) && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>{filteredData.length}</strong> results found.
              <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="ml-2 text-blue-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
        )}

        {/* 리스트 출력 */}
        <div className="mt-4 divide-y divide-gray-200">
          {filteredData.length > 0 ? (
              filteredData.map((r) => (
                  <div key={r.id} className="py-4">
                    <RestaurantRow plan={r}/>
                  </div>
              ))
          ) : (
              <div className="py-20 text-center text-gray-500">
                조건에 맞는 일정이 없습니다.
              </div>
          )}
        </div>
      </div>
  );
}