import { useState } from "react";

export function SuccessPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // 백엔드 서버에 최종 결제 승인 요청 위임
  async function confirmPayment() {
    setIsLoading(true);
    try {
      const response = await fetch("/sandbox-dev/api/v1/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      if (response.ok) {
        setIsConfirmed(true);
      } else {
        alert("결제 최종 승인에 실패했습니다. 한도 초과 또는 일시적 에러일 수 있습니다.");
      }
    } catch (error) {
      console.error("승인 요청 중 예외 에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="w-full flex flex-col items-center p-6 bg-gray-50 min-h-screen overflow-auto justify-center">
        {isConfirmed ? (
            /* 최종 승인 및 영수증 완료 카드 */
            <div className="flex flex-col items-center bg-white rounded-3xl p-8 w-full max-w-[540px] shadow-lg animate-in fade-in zoom-in-95 duration-150">
              <img
                  src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
                  width="120"
                  height="120"
                  alt="Success"
              />
              <h2 className="mt-6 mb-2 text-[#191f28] font-black text-2xl">결제를 완료했어요</h2>
              <p className="text-sm font-medium text-gray-400 mb-8">안전하게 가맹점 주문이 등록되었습니다.</p>

              <div className="w-full border-t border-b border-gray-100 py-6 flex flex-col gap-4 text-[16px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#333d48]">결제 금액</span>
                  <span className="font-extrabold text-blue-600 text-lg">{Number(amount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#333d48]">주문번호</span>
                  <span className="font-medium text-[#4e5968] break-all max-w-[280px] text-right text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#333d48]">paymentKey</span>
                  <span className="font-mono text-gray-400 font-medium text-xs break-all max-w-[260px] text-right">{paymentKey}</span>
                </div>
              </div>

              <div className="w-full mt-8 flex gap-4">
                <a href="/sandbox" className="flex-1 py-[12px] rounded-2xl bg-gray-100 text-[#4e5968] font-bold text-[15px] text-center hover:bg-gray-200 transition-colors">
                  다시 쇼핑하기
                </a>
                <a href="https://docs.tosspayments.com/guides/v2/payment-widget/integration" target="_blank" rel="noopener noreferrer" className="flex-1 py-[12px] rounded-2xl bg-blue-50 text-blue-600 font-bold text-[15px] text-center hover:bg-blue-100 transition-colors">
                  영수증 확인하기
                </a>
              </div>
            </div>
        ) : (
            /* 토스 인증은 통과했으나 백엔드 최종 컨펌 버튼을 누르기 전 대기 상태 */
            <div className="bg-white rounded-3xl p-8 w-full max-w-[540px] h-[440px] flex flex-col justify-between items-center shadow-lg">
              <div className="flex flex-col items-center mt-6">
                <img
                    src="https://static.toss.im/lotties/loading-spot-apng.png"
                    width="120"
                    height="120"
                    alt="Loading"
                />
                <h2 className="mt-6 text-[#191f28] font-black text-2xl text-center">결제 인증에 성공했어요!</h2>
                <h4 className="mt-2 text-[#4e5968] text-[15px] font-medium text-center">아래 승인하기 버튼을 누르면 실제 출금이 처리됩니다.</h4>
              </div>
              <div className="w-full px-2">
                <button
                    disabled={isLoading}
                    onClick={confirmPayment}
                    className="w-full py-[14px] border-none rounded-2xl text-white font-black text-[17px] bg-[#3282f6] hover:bg-[#256fd6] transition-colors shadow-md disabled:opacity-50"
                >
                  {isLoading ? "최종 금액 확인 및 출금 중..." : "최종 결제 승인하기"}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}