import {useState} from "react";
import {AREAS, CATEGORIES, RESTAURANTS} from "../data";
import {RestaurantCard} from "./RestaurantCard";

/* ══════════════ HOME PAGE ══════════════ */
export function HomePage({onRestaurantClick}) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeArea, setActiveArea] = useState("강남구");

  const filtered = RESTAURANTS.filter(
      (r) => activeCategory === "전체" || r.category === activeCategory
  );

  return (
      <>
        {/* Hero Banner */}
        <div
            className="mt-4 rounded-3xl overflow-hidden relative h-44 bg-gradient-to-br from-blue-500 to-black">
          <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
              alt="banner"
          />
          <div className="relative p-6">
            <p className="text-blue-100 text-sm font-medium mb-1">오늘의
              플레이스</p>
            <h2 className="text-white font-black text-2xl leading-tight">
              지금 예약 가능한
              <br/>
              상품
            </h2>
            <button
                className="mt-3 bg-white text-blue-500 text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
              지금 예약하기 →
            </button>
          </div>
        </div>

        {/* Area Chips */}
        <div className="mt-5">
          <p className="text-sm font-bold text-gray-700 mb-3">📍 지역별 탐색</p>
          <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
            {AREAS.map((a) => (
                <button
                    key={a}
                    onClick={() => setActiveArea(a)}
                    className={`category-chip flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                        activeArea === a
                            ? "active"
                            : "border-gray-200 text-gray-600 bg-white"
                    }`}
                >
                  {a}
                </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div className="mt-5">
          <p className="text-sm font-bold text-gray-700 mb-3">🍽️ 카테고리</p>
          <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
            {CATEGORIES.map((c) => (
                <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`category-chip flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                        activeCategory === c
                            ? "active"
                            : "border-gray-200 text-gray-600 bg-white"
                    }`}
                >
                  {c}
                </button>
            ))}
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">
              {activeCategory === "전체" ? "인기 레스토랑" : activeCategory + " 레스토랑"}
              <span className="ml-2 text-sm text-gray-400 font-normal">
              {filtered.length}곳
            </span>
            </h3>
            <button className="text-xs text-red-500 font-semibold">전체보기</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((r) => (
                <RestaurantCard key={r.id} restaurant={r}
                                onClick={onRestaurantClick}/>
            ))}
          </div>
        </div>

        {/* Quick Reserve Banner */}
        <div
            className="mt-6 bg-gray-900 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">오늘 저녁, 어디 갈까?</p>
            <p className="text-white font-bold text-base">
              지금 바로 예약 가능한
              <br/>
              <span className="text-red-400">빈자리 찾기</span>
            </p>
          </div>
          <button
              className="bg-red-500 text-white text-sm font-bold px-4 py-3 rounded-2xl hover:bg-red-600 transition-colors">
            빈자리
            <br/>
            찾기
          </button>
        </div>
      </>
  );
}

/* ══════════════ RESTAURANTS PAGE ══════════════ */