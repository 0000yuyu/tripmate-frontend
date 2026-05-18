import {useEffect, useState} from "react";
import {Navigate, Outlet, Route, Routes} from "react-router-dom";

import {onMessageListener} from "@hooks/usePushManager";
import LoginPage from "@pages/LoginPage.jsx";
import {isLoggedIn} from "@utils/auth.js";
import Header from "@components/Header.jsx";
import {PlanListPage} from "@pages/PlanListPage.jsx";

function HomePage() {
	return <div>hello</div>;
}

function RequireAuth() {
	return isLoggedIn() ? <Outlet/> : <Navigate to="/login" replace/>;
}

function AnonymousOnly() {
	return isLoggedIn() ? <Navigate to="/" replace/> : <Outlet/>;
}

export default function App() {
	return (
			<Routes>
				<Route path="/" element={<AppLayout/>}>
					
					{/* 공통 레이아웃 안에서 인증 여부에 따라 페이지 분리 */}
					<Route element={<RequireAuth/>}>
						<Route index element={<HomePage/>}/>
						<Route path="plans" element={<PlanListPage/>}/>
					</Route>
					
					<Route element={<AnonymousOnly/>}>
						<Route path="login" element={<LoginPage/>}/>
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
				<div className="flex w-full relative h-full bg-gray-100 hide-scroll">
					<div
							className={"w-full h-full flex flex-col justify-center border-2 hide-scroll "}>
						<Header activeTab={activeTab} onTabChange={setActiveTab}/>
						<main
								className="w-full flex border-black justify-center border h-full hide-scroll">
							<div
									className="lg:mx-[150px] border border-blue-500 w-full hide-scroll">
								<Outlet/>
							</div>
						</main>
					</div>
				</div>
			</div>
	);
}