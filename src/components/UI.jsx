import {useState} from "react";

/* ─────────────── StarRating ─────────────── */
export function StarRating({startDate, endDate}) {
  return (
      <span className="flex items-center gap-1">
      <span className="text-sm font-semibold text-gray-800">{startDate}</span>
        ~
        <span className="text-sm font-semibold text-gray-800">{endDate}</span>
    </span>
  );
}

/* ─────────────── Badge ─────────────── */
export function Badge({type}) {
  if (!type) {
    return null;
  }
  return (
      <span
          className={`text-xs border border-blue-600 font-bold px-2 py-0.5 rounded-full ${
              type === "OPEN" ? "text-blue-600" : "badge-new"
          }`}
      >
      {type}
    </span>
  );
}

/* ─────────────── HeartButton ─────────────── */
export function HeartButton({liked, onToggle}) {
  const [isLiked, setIsLiked] = useState(liked);
  return (
      <button
          className="heart-btn absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
            onToggle && onToggle();
          }}
      >
        <svg
            className={`w-4 h-4 ${isLiked ? "text-red-500 fill-current"
                : "text-gray-400"}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth="2"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
  );
}

/* ─────────────── SearchBar ─────────────── */
export function SearchBar() {
  const [focused, setFocused] = useState(false);
  return (
      <div
          className={`flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border-2 transition-all ${
              focused ? "border-red-400" : "border-transparent"
          }`}
      >
        <svg
            className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
            type="text"
            placeholder="레스토랑, 지역, 요리 검색"
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
        <button
            className="ml-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
          검색
        </button>
      </div>
  );
}
