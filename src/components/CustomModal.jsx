import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  buttons, // 👈 외부에서 버튼 컴포넌트들을 직접 주입받는 매개변수
  maxWidth = 'max-w-[400px]' // 기본 너비 400px
}) {

  // 모달이 열려있을 때 뒷배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* 어두운 배경 (딤드 및 블러 처리) */}
        <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        />

        {/* 모달 윈도우 본체 (시안 감성의 라운딩 28px) */}
        <div className={`relative bg-white w-full ${maxWidth} rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-7 z-10 transform transition-all flex flex-col gap-4 border border-gray-100/50 animate-in fade-in zoom-in-95 duration-200`}>

          {/* 상단 헤더 영역 - X 버튼 정갈하게 배치 */}
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-base font-black text-[#222222] tracking-tight pl-1">
              {title || ""}
            </h3>
            <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-800 hover:bg-gray-50 p-1.5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-100"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* 중앙 본문 영역 (children 서브 폼 워크스페이스) */}
          <div className="text-xs md:text-sm text-gray-600 leading-relaxed overflow-y-auto max-h-[60vh] pr-0.5">
            {children}
          </div>

          {/* 하단 버튼 영역 - 주입받은 buttons를 그대로 와이드하게 렌더링 */}
          {buttons && (
              <div className="mt-3 w-full flex items-center justify-center shrink-0">
                {buttons}
              </div>
          )}

        </div>
      </div>
  );
}