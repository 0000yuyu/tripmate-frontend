# 캐치테이블 클론 코딩

React + JavaScript + Tailwind CSS로 구현한 캐치테이블 클론입니다.

## 📁 프로젝트 구조

```
src/
├── App.jsx                      # 루트 컴포넌트
├── index.js                     # 엔트리 포인트
├── index.css                    # 전역 스타일 (Tailwind + 커스텀)
├── data.js                      # 레스토랑 더미 데이터
└── components/
    ├── Header.jsx               # 헤더 + 탭 네비게이션
    ├── HomePage.js                # 4개 페이지 (홈/맛집/예약내역/마이)
    ├── RestaurantCard.jsx       # 카드형 / 리스트형 레스토랑 컴포넌트
    ├── ReservationModal.jsx     # 예약 모달 + 완료 화면
    └── UI.jsx                   # 공통 UI (StarRating, Badge, HeartButton, SearchBar)
```

## ✨ 구현 기능

- **홈 탭**: 히어로 배너, 지역별/카테고리 필터, 레스토랑 그리드, 빈자리 찾기 배너
- **맛집 탭**: 검색바, 카테고리 필터, 리스트형 레스토랑 뷰
- **예약내역 탭**: 예약확정 / 이용완료 카드, 예약변경·취소 버튼
- **마이 탭**: 프로필, 예약/리뷰/찜 통계, 설정 메뉴
- **예약 모달**: 날짜 → 시간 → 인원 선택 → 예약 완료 애니메이션
- **찜 버튼**: 하트 토글
- **HOT / NEW 뱃지**

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm start
```

브라우저에서 http://localhost:3000 접속

## 🛠 기술 스택

- React 18
- JavaScript (JSX)
- Tailwind CSS 3
- Create React App
