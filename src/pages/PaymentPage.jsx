import { useEffect, useRef, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useProfile } from "@hooks/userContext.jsx";
import axiosInstance from "@utils/axiosInstance.js";


const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useProfile();
  const hasAutoConfirmed = useRef(false); // StrictMode 중복 승인 시도 방지

  // URL 쿼리 스트링 파라미터 파싱
  const backOrderId = searchParams.get("backOrderId");
  const amount = searchParams.get("amount");
  const productName = searchParams.get("productName");

  const paymentKey = searchParams.get("paymentKey");
  const callbackOrderId = searchParams.get("orderId");
  const callbackAmount = searchParams.get("amount");
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

  const [tossPayments, setTossPayments] = useState(null);
  const [ready, setReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("토스 결제창으로 이동 중입니다...");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("SUCCESS");
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    async function initTossPayments() {
      try {
        const instance = await loadTossPayments(clientKey);
        setTossPayments(instance);
        setReady(true); // 인스턴스가 준비되면 결제 버튼 활성화
      } catch (error) {
        console.error("토스 SDK 로드 실패:", error);
      }
    }
    initTossPayments();
  }, [clientKey]);

  useEffect(() => {
    if (paymentKey && callbackOrderId && callbackAmount) {
      if (!hasAutoConfirmed.current) {
        hasAutoConfirmed.current = true;
        executeConfirmPayment(paymentKey, callbackOrderId, callbackAmount);
      }
    }

    if (errorCode || errorMessage) {
      setModalType("FAIL");
      setModalData({
        code: errorCode,
        message: errorMessage || "결제 프로세스가 취소되었습니다."
      });
      setIsModalOpen(true);
    }
  }, [paymentKey, callbackOrderId, callbackAmount, errorCode, errorMessage]);

  // Backend 최종 결제 승인 요청
  const executeConfirmPayment = async (pKey, oId, amt) => {
    setProcessingMessage("안전하게 최종 결제 승인을 마감하는 중입니다...");
    setIsProcessing(true);
    try {
      const response = await axiosInstance.post("/payments/confirm", {
        paymentKey: pKey,
        tossOrderId: oId,
        amount: Number(amt)
      });

      console.log(response);
      const responseBody = response.data?.data ?? response.data;

      setModalType("SUCCESS");
      setModalData(responseBody);
      setIsModalOpen(true);
    } catch (error) {
      console.error("최종 결제 승인 API 실패:", error);
      setModalType("FAIL");
      setModalData({
        code: "CONFIRM_SERVER_ERROR",
        message: "토스 인증은 완료되었으나 가맹점 최종 매입 승인 중 에러가 발생했습니다."
      });
      setIsModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!ready || !tossPayments || !backOrderId || !amount) {
      alert("결제 정보가 올바르지 않거나 모듈이 준비되지 않았습니다.");
      return;
    }
    setIsProcessing(true);
    console.log(amount);
    try {
      const paymentResponse = await axiosInstance.post("/payments",{
        orderId: backOrderId,amount
      })
      const paymentData = paymentResponse.data.data;
      const currentUrl = `${window.location.origin}${window.location.pathname}`;

      const tossPaymentsClient = await loadTossPayments(clientKey);
      const payment = tossPaymentsClient.payment({
        customerKey: paymentData.paymentId,
      });

      await payment.requestPayment({
        method: "CARD",
        amount: {
          value: Number(amount),
          currency: "KRW",
        },
        orderId: paymentData.tossOrderId,
        orderName: paymentData.orderName,
        successUrl: `${currentUrl}?orderId=${paymentData.tossOrderId}&amount=${Number(amount)}`,
        failUrl: currentUrl,
        customerName: user?.name,
        customerEmail: user?.email,
      });

    } catch (error) {
      console.error("토스 결제창 오픈 실패:", error);
      alert("결제창을 여는 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (modalType === "SUCCESS") {
      navigate("/");
    } else {
      navigate(`/payment?orderId=${backOrderId}&amount=${amount}&productName=${productName}`);
    }
  };

  return (
      <div className="w-full flex flex-col items-center p-6 bg-gray-50 min-h-screen relative justify-center">
        {isProcessing && (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-600">{processingMessage}</p>
            </div>
        )}

        {!paymentKey && !errorCode && (
            <div className="w-full max-w-[540px] bg-white rounded-3xl p-6 shadow-md space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-black text-gray-800 mb-4">주문 확인 / 결제</h2>
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">주문번호: {backOrderId}</p>
                  </div>
                  <p className="font-extrabold text-gray-800">
                    {amount ? Number(amount).toLocaleString() : 0}원
                  </p>
                </div>
              </div>

              {/*
                위젯용 빈 div 자리는 제거하거나 안내 문구로 대체 가능합니다.
                개별 연동은 하단 버튼 클릭 시 토스가 전체 결제 레이어를 알아서 띄워줍니다.
              */}
              <div className="py-4 text-center text-sm font-semibold text-gray-400 bg-gray-50 rounded-2xl">
                💳 결제하기 버튼을 누르시면 안전한 결제창으로 연결됩니다.
              </div>

              <div className="w-full px-4">
                <button
                    disabled={!ready || isProcessing}
                    onClick={handlePaymentSubmit}
                    className="w-full py-[14px] px-[22px] border-none rounded-2xl text-white font-bold text-[17px] cursor-pointer bg-[#3282f6] hover:bg-[#256fd6] transition-all shadow-md active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {amount ? Number(amount).toLocaleString() : 0}원 결제하기
                </button>
              </div>
            </div>
        )}

        {/* --- 결과 모달 생략 (기존 디자인과 동일) --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-[28px] p-8 max-w-md w-full space-y-6 shadow-2xl text-center">
                {modalType === "SUCCESS" ? (
                    <>
                      <img src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" width="100" height="100" className="mx-auto" alt="Success" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-800">결제를 완료했어요!</h3>
                        <p className="text-sm text-gray-400">안전하게 트립메이트 여정이 확정되었습니다.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl text-left text-xs space-y-2 text-gray-600 font-medium">
                        <div className="flex justify-between"><span className="text-gray-400 font-bold">결제 상품</span><span>{productName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 font-bold">최종 금액</span><span className="font-bold text-blue-600">{Number(callbackAmount).toLocaleString()}원</span></div>
                        <div className="flex justify-between"><span className="text-gray-400 font-bold">주문번호</span><span className="font-mono">{callbackOrderId}</span></div>
                      </div>
                    </>
                ) : (
                    <>
                      <img src="https://static.toss.im/lotties/error-spot-apng.png" width="100" height="100" className="mx-auto" alt="Error" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-rose-600">결제에 실패했어요</h3>
                        <p className="text-sm text-gray-400">요청이 취소되었거나 결제 승인 중 문제가 발생했습니다.</p>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-2xl text-left text-xs space-y-2 text-rose-800">
                        <div><span className="font-bold">에러 코드:</span> <span className="font-mono font-bold">{modalData?.code}</span></div>
                        <div><span className="font-bold">상세 사유:</span> {modalData?.message}</div>
                      </div>
                    </>
                )}
                <button
                    onClick={handleCloseModal}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-colors shadow-md ${
                        modalType === "SUCCESS" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-black"
                    }`}
                >
                  {modalType === "SUCCESS" ? "나의 예약 일정 확인하기" : "다시 결제 시도하기"}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}