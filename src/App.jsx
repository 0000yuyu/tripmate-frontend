import React, {useEffect, useState} from "react";
import {Outlet, Route, Routes} from "react-router-dom";
import Header from "./components/Header";
import ReservationModal from "./components/ReservationModal";
import {HomePage} from "./components/HomePage";
import ProfilePage from "./components/Mypage";
import CompanyPage from "./components/CompanyPage";
import {useProfile} from "./hook/userContext";
import {isLoggedIn} from "./util/auth";
import LoginPage from "./components/LoginPage";
import {PlanListPage} from "./components/PlanListPage";
import PlanDetailPage from "./components/PlanDetailPage";
import PlanCreatePage from "./components/PlanPage";
import NotificationPage from "./components/NotificationPage";
import MatchingPage from "./components/MatchingPage";

// FCM 관련 임포트
import {onMessageListener} from "./hook/usePushManager";
import ForegroundModal from "./components/Modal";

export default function App() {
  const {user} = useProfile();

  if (isLoggedIn() && user.name !== "송유진") {
    return <div>접근 권한이 없습니다.</div>;
  }

  return (
      <Routes>
        <Route path="/" element={<AppLayout/>}>
          <Route index element={<HomePage/>}/>
          <Route path="login" element={<LoginPage/>}/>
          <Route path="plans" element={<PlanListPage/>}/>
          <Route path="plan/create" element={<PlanCreatePage/>}/>
          <Route path="notifications" element={<NotificationPage/>}/>
          <Route path="matching" element={<MatchingPage/>}/>
          <Route
              path="profile"
              element={() => {
                if (user?.role === "USER") {
                  return <ProfilePage/>;
                }
                if (user?.role === "SELLER") {
                  return <CompanyPage/>;
                }
                return null;
              }}
          />
          <Route path="plans/:plan_id" element={<PlanDetailPage/>}/>
        </Route>
      </Routes>
  );
}

function AppLayout() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState("홈");

  // --- FCM 포그라운드 알림 상태 ---
  const [showNotification, setShowNotification] = useState(false);
  const [notificationInfo, setNotificationInfo] = useState({
    title: "",
    body: "",
    link: "",
  });

  useEffect(() => {
    let unsubscribe;

    // 포그라운드 메시지 리스너 설정
    const setupFCMListener = async () => {
      const unsub = await onMessageListener((payload) => {
        console.log("포그라운드 메시지 수신:", payload);
        setNotificationInfo({
          title: payload.notification?.title || payload.data?.title || "알림",
          body: payload.notification?.body || payload.data?.body
              || "메시지가 도착했습니다.",
          link: payload.data?.link || payload.data?.youtubeLink || "",
        });
        setShowNotification(true);
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

  const isLogged = false;

  return (
      <div className="flex w-full h-screen justify-center items-center">
        <div
            className="flex md:w-[600px] w-full relative justify-center h-full bg-gray-100">
          {!isLoggedIn() ? (
              <LoginPage/>
          ) : (
              <div className={"w-full h-full flex flex-col"}>
                <Header activeTab={activeTab} onTabChange={setActiveTab}/>

                <main className="w-full h-full overflow-y-auto">
                  {/* HomePage 등 자식 컴포넌트에서 호출할 수 있도록 context나 props 전달 가능 */}
                  <Outlet context={{setSelectedRestaurant}}/>
                </main>

                {/* 기존 예약 모달 */}
                {selectedRestaurant && (
                    <ReservationModal
                        restaurant={selectedRestaurant}
                        onClose={() => setSelectedRestaurant(null)}
                    />
                )}

                {/* 신규 FCM 포그라운드 알림 모달 */}
                {showNotification && (
                    <ForegroundModal
                        info={notificationInfo}
                        onClose={() => setShowNotification(false)}
                    />
                )}
              </div>
          )}
        </div>
      </div>
  );
}

