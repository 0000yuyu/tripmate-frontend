// 기기 아이디 가져오기 (없으면 생성)
import {getToken, onMessage} from "firebase/messaging";
import {messaging} from "../util/firebase";

export const onMessageListener = (callback) => {
  // 포그라운드 메시지 수신 시 실행될 콜백 등록
  return onMessage(messaging, (payload) => {
    console.log("포그라운드 메시지 도착:", payload);
    callback(payload); // 여기서 모달 상태를 변경하는 함수를 실행하게 됨
  });
};

const getDeviceId = () => {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    // 단순 UUID 생성 로직
    deviceId = crypto.randomUUID?.() || Math.random().toString(36).substring(2,
        15);
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};

// 기기 타입 판별
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return "ANDROID";
  }
  if (/iPad|iPhone|iPod/.test(ua)) {
    return "IOS";
  }
  return "WEB"; // 기본은 웹
};

// useFCM.js (또는 usePushManager.js)

export const requestForToken = async () => {
  try {
    // 1. 알림 권한 확인
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("알림 권한 거부됨");
      return null;
    }

    // 2. 서비스 워커 등록
    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js");

    // [중요] 3. 서비스 워커가 '활성화(active)' 될 때까지 대기
    // 이 코드가 없으면 'no active Service Worker' 에러가 발생하기 쉽습니다.
    await navigator.serviceWorker.ready;

    console.log("fcm 토큰", process.env.REACT_APP_FCM_VAPID_KEY);

    // 4. 활성화된 서비스 워커를 사용하여 토큰 발급
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: process.env.REACT_APP_FCM_VAPID_KEY
    });

    console.log(token);

    if (token) {
      return {
        tokenValue: token,
        deviceId: getDeviceId(), // 기존에 작성한 함수
        deviceType: getDeviceType() // 기존에 작성한 함수
      };
    }
  } catch (error) {
    // 만약 여전히 AbortError가 난다면, 등록 직후 활성화를 보장하기 위해 짧은 지연을 줄 수도 있습니다.
    console.error("FCM Token Error:", error);
    return null;
  }
};