importScripts(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 3. firebaseConfig 설정
const firebaseConfig = {
  apiKey: "AIzaSyCD6YCeoet4qThwUidUl7cjHtBRWWAiYWo",
  authDomain: "tripmate-43645.firebaseapp.com",
  projectId: "tripmate-43645",
  storageBucket: "tripmate-43645.firebasestorage.app",
  messagingSenderId: "693969607728",
  appId: "1:693969607728:web:8819526404ca6a27f2e1f5",
  measurementId: "G-BHV6F38MNG"
};

// 4. 초기화 (firebase 변수는 위 importScripts를 통해 생성됩니다)
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 5. 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.data?.title || payload.notification?.title
      || '알림';
  const notificationOptions = {
    body: payload.data?.body || payload.notification?.body || '메시지가 도착했습니다.',
    icon: '/logo192.png', // 경로가 정확한지 확인하세요
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});