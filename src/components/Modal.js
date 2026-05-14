import React from 'react';

export default function ForegroundModal({info, onClose}) {
  return (
      <div
          className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
        <div
            className="bg-white w-full max-w-[350px] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="bg-blue-600 p-4 text-white font-bold">실시간 알림</div>
          <div className="p-6">
            <h4 className="font-bold text-lg mb-2">{info.title}</h4>
            <p className="text-gray-600 text-sm">{info.body}</p>
          </div>
          <div className="flex border-t">
            <button onClick={onClose}
                    className="flex-1 py-3 text-gray-500 hover:bg-gray-50">닫기
            </button>
            <button onClick={() => {
              if (info.link) {
                window.location.href = info.link;
              }
              onClose();
            }}
                    className="flex-1 py-3 text-blue-600 font-bold hover:bg-blue-50">확인
            </button>
          </div>
        </div>
      </div>
  );
}