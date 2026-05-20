import {useEffect, useState} from "react";
import {Navigate, Outlet, Route, Routes} from "react-router-dom";

import {onMessageListener, registerPushToken} from "@hooks/usePushManager";
import LoginPage from "@pages/LoginPage.jsx";
import {getAccessToken, isLoggedIn} from "@utils/auth.js";
import Header from "@components/Header.jsx";
import PlanListPage from "@pages/PlanListPage.jsx";
import PlanDetailPage from "@pages/PlanDetailPage.jsx";
import {ProductDetailView} from "@components/ProductDetailView.jsx";
import {ProductsView} from "@components/ProductsView.jsx";
import {NotificationsView} from "@components/NotificationsView.jsx";
import {MyPageView} from "@components/MyPageView.jsx";
import {MatchingView} from "@components/MatchingView.jsx";
import {ProductManagementView} from "@components/ProductManagementView.jsx";
import PaymentPage from "@pages/PaymentPage.jsx";
import HomeLandingPage from "@components/HomeView.jsx";
import MemberShipPage from "@pages/MemberShipPage.jsx";
import PlanCreatePage from "@pages/PlanPage.jsx";
import {message, notification} from "antd";
import CompanyManagementPage from "@pages/CompanyManagePage.jsx";

function RequireAuth() {
	return isLoggedIn() ? <Outlet/> : <Navigate to="/login" replace/>;
}

function AnonymousOnly() {
	return isLoggedIn() ? <Navigate to="/" replace/> : <Outlet/>;
}

export default function App() {

  useEffect(() => {

    const unsubscribe = onMessageListener((payload) => {
      console.log("🔥 포그라운드 알림 수신 성공:", payload);

      const title = payload.notification?.title || payload.data?.title || "새로운 알림";
      const body = payload.notification?.body || payload.data?.body || "메시지가 도착했습니다.";

      // 2. antd notification 실행
      notification.info({
        message: title,         // 굵은 글씨로 들어갈 제목
        description: body,     // 일반 글씨로 들어갈 본문 내용
        placement: 'topRight', // 알림이 뜰 위치 (topLeft, topRight, bottomLeft, bottomRight 가능)
        duration: 4.5,         // 몇 초 뒤에 자동으로 사라질지 설정 (0으로 하면 수동으로 닫을 때까지 안 사라짐)
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);


	return (
			<Routes>
				<Route path="/" element={<AppLayout/>}>
					
					<Route element={<RequireAuth/>}>
						<Route index element={<HomeLandingPage/>}/>
						<Route path="plans" element={<PlanListPage/>}/>
            <Route path="plans/create" element={<PlanCreatePage/>}/>
            <Route path="plans/:id" element={<PlanDetailPage/>}/>
            <Route path="products/:id" element={<ProductDetailView/>}/>
            <Route path="payment" element={<PaymentPage/>}/>
            <Route path="products" element={<ProductsView />} />
            <Route path="matching" element={<MatchingView />} />
            <Route path="profile/*" element={<MyPageView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="payment" element={<PaymentPage/>}/>
            <Route path="companies/:companyId" element={<CompanyManagementPage/>}/>
					</Route>

					<Route element={<AnonymousOnly/>}>
						<Route path="login" element={<LoginPage/>}/>
            <Route path="membership" element={<MemberShipPage/>}/>
					</Route>
				
				</Route>
			</Routes>
	);
}

function AppLayout() {
	const [activeTab, setActiveTab] = useState("홈");
	
	useEffect(() => {
		let unsubscribe;
		
		const setupFCMListener = async () => {
			const unsub = await onMessageListener((payload) => {
				console.log("포그라운드 메시지 수신:", payload);
			});
			unsubscribe = unsub;
		};
		
		if (isLoggedIn()) {
			setupFCMListener();
		}
		
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);
	
	return (
			<div
					className="flex w-full h-screen justify-center items-center hide-scroll">
				<div className="flex w-full relative h-full bg-white hide-scroll">
					<div
							className={"w-full h-full flex flex-col justify-center border-2 hide-scroll "}>
						<Header activeTab={activeTab} onTabChange={setActiveTab}/>
						<main
								className="w-full flex justify-center border h-full hide-scroll">
							<div
									className="lg:mx-2 h-full w-full hide-scroll">
								<Outlet/>
							</div>
						</main>
					</div>
				</div>
			</div>
	);
}