import {useState} from "react";
import {SearchBar} from "./UI";
import {useNavigate} from "react-router-dom";
import {IoIosNotificationsOutline} from "react-icons/io";

const TABS = ["홈", "일정", "상품", "매칭", "My"];
const tapMap = {
  "홈": "/",
  "일정": "/plans",
  "상품": "/products",
  "매칭": "/matching",
  "My": "/profile"
}

export default function Header({activeTab, onTabChange}) {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div
            className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-end gap-2">
            <span
                className="text-blue-600 font-black text-2xl tracking-tight">TripMate</span>
            <span
                className="text-gray-900 font-black text-[12px] ">함께라서 더 즐거운 여행</span>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-600 hover:text-blue-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            {/* 알림 */}
            <button className="text-gray-600 hover:text-blue-500"
                    onClick={() => navigate("/notifications")}>
              <IoIosNotificationsOutline size={25}/>
            </button>
          </div>
        </div>

        {/* Collapsible Search */}
        {showSearch && (
            <div className="px-4 pb-3 max-w-2xl mx-auto">
              <SearchBar/>
            </div>
        )}

        {/* Tab Bar */}
        <div className="flex border-t border-gray-100 max-w-2xl mx-auto">
          {TABS.map((t) => (
              <button
                  key={t}
                  onClick={() => {
                    onTabChange(t)
                    navigate(tapMap[t])
                  }}
                  className={`tab-btn flex-1 py-3 text-sm font-medium text-gray-500 transition-all ${
                      activeTab === t ? "active" : ""
                  }`}
              >
                {t}
              </button>
          ))}
        </div>
      </header>
  );
}
