import { useEffect, useRef, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import axiosInstance from "@utils/axiosInstance.js"; // 기존 프로젝트의 axios 인스턴스

// 토스페이먼츠 클라이언트 키 (테스트용)
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 아까 정의하셨던 주문 대상 상품 정보 상태
  const [selectedItem, setSelectedItem] = useState({
    id: 101,
    product: { productId: 501, scheduleId: 901, name: "트립메이트 도쿄 4일 자유여행" },
    price: 50000, // 결제 금액 스펙에 연동
  });

  const paymentMethodWidgetRef = useRef(null);

  // 1. 토스 결제위젯 객체 초기화
  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
      setWidgets(widgets);
    }
    fetchPaymentWidgets();
  }, [clientKey]);

  // 2. 금액 설정 및 결제위젯 / 약관 UI 렌더링
  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) return;

      // 위젯에 최종 결제 금액 반영
      await widgets.setAmount({
        currency: "KRW",
        value: selectedItem.price,
      });

      // 결제수단 및 약관 UI 영역 동시 렌더링
      const [paymentMethodWidget] = await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      paymentMethodWidgetRef.current = paymentMethodWidget;
      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets, selectedItem.price]);

  // 3. [최종 결제 및 주문하기] 처리 로직
  const handlePaymentSubmit = async () => {
    if (!ready || !widgets) return;

    setIsProcessing(true);
    try {
      // A. 우리 백엔드 서버에 실제 주문(Order) 데이터 생성 요청
      const orderData = {
        orderItems: [{
          planUnitId: selectedItem.id,
          productId: selectedItem.product.productId,
          quantity: 1,
          scheduleId: selectedItem.product.scheduleId
        }]
      };

      console.log("백엔드 주문 생성 요청 데이터: ", orderData);
      const orderResponse = await axiosInstance.post("/orders", orderData);
      const orderResult = orderResponse.data?.data ?? orderResponse.data;

      // 백엔드가 생성해 준 실제 주문 ID와 금액 검증
      const { orderId, amount } = orderResult;

      if (!orderId || !amount) {
        throw new Error("주문 생성 결과(orderId, amount)가 올바르지 않습니다.");
      }

      // B. 획득한 데이터로 토스 결제창 최종 실행
      await widgets.requestPayment({
        orderId: orderId, // 백엔드에서 발급한 실제 고유 주문번호 매핑
        orderName: selectedItem.product.name,
        customerName: "김토스",
        customerEmail: "customer123@gmail.com",
        // 인증 완료/실패 후 이동할 가맹점 라우트 경로 지정
        successUrl: window.location.origin + "/sandbox/success" + window.location.search,
        failUrl: window.location.origin + "/sandbox/fail" + window.location.search,
      });

    } catch (error) {
      console.error("주문 처리 또는 결제창 오픈 중 에러 발생:", error);
      alert("주문 요청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
      <div className="w-full flex flex-col items-center p-6 bg-gray-50 min-h-screen relative">
        {/* 화면 잠금 로딩 레이어 */}
        {isProcessing && (
            <div className="fixed inset-0 bg-white/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-600">안전하게 주문 데이터를 생성 중입니다...</p>
            </div>
        )}

        <div className="w-full max-w-[540px] bg-white rounded-3xl p-6 shadow-md space-y-6 mt-8">
          {/* 주문 상품 요약 폼 파트 */}
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-gray-800 mb-4">주문서 작성 / 결제</h2>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-gray-800">{selectedItem.product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">수량: 1개</p>
              </div>
              <p className="font-extrabold text-gray-800">{selectedItem.price.toLocaleString()}원</p>
            </div>
          </div>

          {/* 토스 결제위젯 플러그인 탑재 영역 */}
          <div className="space-y-2">
            <div id="payment-method" className="w-full" />
            <div id="agreement" className="w-full" />
          </div>

          {/* 최종 결제 진행 액션 버튼 */}
          <div className="w-full px-4">
            <button
                disabled={!ready || isProcessing}
                onClick={handlePaymentSubmit}
                className="w-full py-[14px] px-[22px] border-none rounded-2xl text-white font-bold text-[17px] cursor-pointer bg-[#3282f6] hover:bg-[#256fd6] transition-all shadow-md active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {selectedItem.price.toLocaleString()}원 주문 및 결제하기
            </button>
          </div>
        </div>
      </div>
  );
}