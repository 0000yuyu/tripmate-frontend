import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../util/axiosInstance";
import {IoIosArrowBack} from "react-icons/io";

const NotificationType = {
  PLAN_CONFIRMED: "일정 확정",
  MATCHING_CREATED: "매칭",
  MATCHING_MATCHED: "매칭",
  MATCHING_SUCCEED: "매칭",
  MATCHING_FAILED: "매칭",
  PAYMENT_SUCCEED: "결제",
  PAYMENT_FAILED: "결제",
  ADMIN_SEND: "공지",
};

const NotificationTab = {
  일정: ["PLAN_CONFIRMED"],
  매칭: ["MATCHING_CREATED", "MATCHING_MATCHED", "MATCHING_SUCCEED",
    "MATCHING_FAILED"],
  결제: ["PAYMENT_SUCCEED", "PAYMENT_FAILED"],
  공지: ["ADMIN_SEND"],
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("일정");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/notifications/me");
      // 데이터 구조에 따라 histories.content 또는 data 등 확인 필요
      setNotifications(response.data?.data?.histories?.content || []);
    } catch (e) {
      console.error("알림 데이터 로드 실패", e);
    }
  };

  const setNotificationRead = async (notification_id) => {
    try {
      await axiosInstance.patch(`/notifications/${notification_id}/read`);
      fetchData(); // 읽음 처리 후 목록 갱신
    } catch (e) {
      console.error("읽음 처리 실패", e);
    }
  };

  // 필터링 로직: notificationType 키값을 기준으로 확인
  const filteredNotifications = notifications.filter((noti) => {
    const allowedTypes = NotificationTab[activeTab];
    return allowedTypes.includes(noti.notificationType);
  });

  return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex justify-center">
        <div
            className="flex flex-col w-full max-w-6xl h-full bg-white">

          {/* 3. 헤더: 상단 고정 */}
          <header
              className="relative flex items-center justify-center px-4 py-4 border-b border-gray-100 bg-white">
            <IoIosArrowBack
                className="absolute left-4 cursor-pointer text-gray-700"
                size={24}
                onClick={() => navigate(-1)}
            />
            <h1 className="font-bold text-[18px]">알림</h1>
          </header>

          {/* 4. 탭 메뉴 */}
          <div className="flex border-b border-gray-100 bg-white">
            {Object.keys(NotificationTab).map((t) => (
                <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-3 text-[15px] font-semibold transition-all ${
                        activeTab === t
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-400"
                    }`}
                >
                  {t}
                </button>
            ))}
          </div>

          {/* 5. 리스트 영역: flex-1과 overflow-y-auto로 스크롤 가능하게 설정 */}
          <div className="flex-1 overflow-y-auto pb-10">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex items-start px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors ${
                            notification.isRead ? "bg-white" : "bg-blue-50/30"
                        } hover:bg-gray-50`}
                        onClick={() => setNotificationRead(notification.id)}
                    >
                      {/* 읽음 표시 점 */}
                      <div
                          className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                              !notification.isRead ? "bg-blue-500"
                                  : "bg-transparent"
                          }`}
                      ></div>

                      <div className="flex flex-col gap-1 ml-4 flex-1">
                        <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-blue-400">
                      {NotificationType[notification.notificationType] || "알림"}
                    </span>
                          {/* 날짜 필드가 있다면 여기에 추가 (예: notification.createdAt) */}
                        </div>
                        <div className="text-[15px] font-bold text-gray-900">
                          {notification.title}
                        </div>
                        <div className="text-[14px] text-gray-600 leading-snug">
                          {notification.content}
                        </div>
                      </div>
                    </div>
                ))
            ) : (
                <div
                    className="flex flex-col items-center justify-center h-[60vh] text-gray-400 px-10 text-center">
                  <p className="text-lg mb-1">Empty</p>
                  <p className="text-sm">해당하는 알림이 없습니다.</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}