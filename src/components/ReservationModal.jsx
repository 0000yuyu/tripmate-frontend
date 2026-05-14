import { useState } from "react";

const DATES = ["오늘", "내일", "5/12", "5/13", "5/14", "5/15"];
const TIMES = [
  "11:30","12:00","12:30","13:00",
  "18:00","18:30","19:00","19:30","20:00","20:30",
];

/* ─── Confirmed Screen ─── */
function ConfirmedScreen({ restaurant, date, time, guests, onClose }) {
  return (
    <div
      className="fixed inset-0 modal-overlay flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg p-8 text-center slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">예약 완료!</h2>
        <p className="text-gray-500 mb-4">예약이 성공적으로 완료되었습니다.</p>

        <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6">
          {[
            ["레스토랑", restaurant.name],
            ["날짜", date],
            ["시간", time],
            ["인원", `${guests}명`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold">{val}</span>
            </div>
          ))}
        </div>

        <button
          className="w-full py-3 bg-red-500 text-white rounded-2xl font-bold text-base"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}

/* ─── Main Modal ─── */
export default function ReservationModal({ restaurant, onClose }) {
  const [selectedDate, setSelectedDate] = useState("오늘");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed)
    return (
      <ConfirmedScreen
        restaurant={restaurant}
        date={selectedDate}
        time={selectedTime}
        guests={guests}
        onClose={onClose}
      />
    );

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{restaurant.name}</h2>
            <p className="text-sm text-gray-500">
              {restaurant.category} · {restaurant.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-96 overflow-y-auto hide-scroll">
          {/* Date */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">📅 날짜 선택</p>
            <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
              {DATES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`time-btn flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium ${
                    selectedDate === d ? "active" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">🕐 시간 선택</p>
            <div className="grid grid-cols-5 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`time-btn py-2 rounded-xl border text-xs font-medium ${
                    selectedTime === t ? "active" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Guests */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">👥 인원</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-light text-gray-600 hover:border-red-400"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-900 w-8 text-center">
                {guests}
              </span>
              <button
                onClick={() => setGuests(Math.min(10, guests + 1))}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-light text-gray-600 hover:border-red-400"
              >
                +
              </button>
              <span className="text-gray-500 text-sm">명</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-gray-100">
          <button
            disabled={!selectedTime}
            onClick={() => setConfirmed(true)}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selectedTime
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedTime
              ? `${selectedDate} ${selectedTime} · ${guests}명 예약하기`
              : "시간을 선택해주세요"}
          </button>
        </div>
      </div>
    </div>
  );
}
