export function FailPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  return (
      <div className="w-full flex flex-col items-center p-6 bg-gray-50 min-h-screen overflow-auto justify-center">
        <div className="flex flex-col items-center bg-white rounded-3xl p-8 w-full max-w-[540px] shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <img
              src="https://static.toss.im/lotties/error-spot-apng.png"
              width="120"
              height="120"
              alt="Error"
          />
          <h2 className="mt-6 mb-2 text-[#191f28] font-black text-2xl">결제를 실패했어요</h2>
          <p className="text-sm font-medium text-gray-400 mb-8">은행 점검 상태이거나 결제 요청이 취소되었습니다.</p>

          <div className="w-full border-t border-b border-gray-100 py-6 flex flex-col gap-4 text-[16px]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#333d48]">에러 코드 (code)</span>
              <span className="font-mono text-sm font-bold text-rose-600 break-all max-w-[280px] text-right">{errorCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#333d48]">실패 사유 (message)</span>
              <span className="font-medium text-[#4e5968] break-all max-w-[280px] text-right text-sm">{errorMessage}</span>
            </div>
          </div>

          <div className="w-full mt-8 flex flex-col gap-3">
            <a href="/sandbox" className="w-full py-[12px] rounded-2xl bg-gray-900 text-white font-bold text-[16px] text-center hover:bg-black transition-colors shadow-sm">
              다시 주문 시도하기
            </a>
            <div className="flex gap-4 w-full">
              <a href="https://docs.tosspayments.com/reference/error-codes" target="_blank" rel="noopener noreferrer" className="flex-1 py-[12px] rounded-2xl bg-gray-100 text-[#4e5968] font-bold text-[14px] text-center hover:bg-gray-200 transition-colors">
                에러코드 가이드
              </a>
              <a href="https://techchat.tosspayments.com" target="_blank" rel="noopener noreferrer" className="flex-1 py-[12px] rounded-2xl bg-gray-100 text-[#4e5968] font-bold text-[14px] text-center hover:bg-gray-200 transition-colors">
                실시간 기술 문의
              </a>
            </div>
          </div>
        </div>
      </div>
  );
}