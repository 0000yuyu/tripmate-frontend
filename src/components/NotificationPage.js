import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom"; // navigate 추가
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
  ADMIN_SEND: "공지"
};

const NotificationTab = {
  "일정": ["PLAN_CONFIRMED"],
  "매칭": ["MATCHING_CREATED", "MATCHING_MATCHED", "MATCHING_SUCCEED",
    "MATCHING_FAILED"],
  "결제": ["PAYMENT_SUCCEED", "PAYMENT_FAILED"], // 실패 케이스도 결제 탭에 포함
  "공지": ["ADMIN_SEND"]
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("일정"); // 기본값 설정

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/notifications/me");
      // 데이터가 중복으로 쌓이지 않게 기존 데이터를 덮어씌웁니다.
      setNotifications(response.data?.data?.histories?.content || []);
      console.log(response.data?.data?.histories?.content || []);
    } catch (e) {
      console.error("알림 데이터 로드 실패", e);
    }
  };

  const setNotificationRead = async (notification_id) => {
    try {
      const response = await axiosInstance.patch(
          `/notifications/${notification_id}/read`)
      console.log(response)
      fetchData();
    } catch (e) {

    }
  }

  // 현재 선택된 탭에 해당하는 알림들만 필터링
  const filteredNotifications = notifications.filter((noti) => {
    const allowedTypes = NotificationTab[activeTab];
    return allowedTypes.includes(noti.notificationType);
  });

  return (
      <div
          className="absolute w-full h-full top-0 left-0 right-0 bg-white z-50 flex flex-col gap-2">
        {/*  헤더: sticky 적용으로 스크롤 시 고정 */}
        <header
            className="sticky top-0 bg-white px-[16px] pt-[20px] py-[12px] flex items-center justify-center border-b border-gray-50">
          <IoIosArrowBack
              className="absolute left-[16px] cursor-pointer"
              size={24}
              onClick={() => navigate(-1)} // 뒤로 가기 적용
          />
          <div className="font-bold text-[18px]">알림</div>
        </header>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-100 w-full bg-white">
          {Object.keys(NotificationTab).map((t) => (
              <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                      activeTab === t
                          ? "text-blue-500 border-b-2 border-blue-500"
                          : "text-gray-400"
                  }`}
              >
                {t}
              </button>
          ))}
        </div>

        {/* 알림 리스트 영역: 스크롤 가능하게 설정 */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                  <div
                      key={notification.id}
                      className="flex items-center px-[16px] border-b cursor-pointer border-gray-50 hover:bg-gray-50 transition-colors"
                      onClick={() => setNotificationRead(notification.id)}

                  >
                    {/* 읽음 표시 점 */}
                    <div
                        className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${
                            !notification.isRead ? "bg-blue-500"
                                : "bg-transparent"
                        }`}
                    ></div>

                    <div className="flex flex-col gap-1 p-[16px] flex-1">
                      <div
                          className="flex justify-between items-center text-[12px] text-gray-500">
                  <span className="font-semibold text-blue-400">
                    {NotificationType[notification.type]}
                  </span>
                        <span>{/* 날짜 데이터가 있다면 여기에 포맷팅 */}</span>
                      </div>
                      <div className="text-[14px] font-bold text-gray-800">
                        {notification.title}
                      </div>
                      <div
                          className="text-[14px] text-gray-600 leading-relaxed">
                        {notification.content}
                      </div>
                    </div>
                  </div>
              ))
          ) : (
              <div
                  className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                <p>해당하는 알림이 없습니다.</p>
              </div>
          )}
        </div>
      </div>
  );
}