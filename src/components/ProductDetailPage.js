/**
 * [2] 호스트 관리 컴포넌트
 */
import React, {useState} from 'react';
import DefaultProfile from '../image/default_profile.png'
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import {useProfile} from "../hook/userContext";
import {useCompanyProfile} from "../hook/companyContext";
import axiosInstance from "../util/axiosInstance";
import {saveCompany} from "../util/auth";

const products = [
  {
    "id": "8b25c875-a69e-4b88-8663-058e0457303b",
    "companyId": "9bb72160-90f5-4ed8-982d-aad831fed32b",
    "productName": "시부야 VR 테마파크 이용권",
    "description": "최신 VR 콘텐츠와 인터랙티브 게임을 체험할 수 있는 시부야 실내 테마파크 자유이용권입니다.",
    "address": {
      "country": "JP",
      "state": "Tokyo",
      "city": "Shibuya",
      "addressLine": "1-15-9 Jinnan, Shibuya-ku"
    },
    "price": 6100.00,
    "status": "ACTIVE"
  },
  {
    "id": "5e579ed0-bf9f-42e0-8afe-d7f1f6240f4b",
    "companyId": "b1bf10f5-f273-4b36-a87c-7dcbe13bbdea",
    "productName": "도톤보리 야시장 미식 투어",
    "description": "오사카 도톤보리 지역의 대표 길거리 음식과 현지 맛집을 탐방하는 야간 푸드 투어 상품입니다.",
    "address": {
      "country": "JP",
      "state": "Osaka",
      "city": "Osaka",
      "addressLine": "Dotonbori, Chuo Ward"
    },
    "price": 6900.00,
    "status": "ACTIVE"
  },
  {
    "id": "5ba325bc-192b-4ba0-b4e2-3b1922e3465e",
    "companyId": "f1781c14-846c-4ea8-bbf3-d58ef5f4fc99",
    "productName": "도쿄 스카이트리 야경 전망권",
    "description": "도쿄 스카이트리 전망대에서 도쿄 야경을 감상할 수 있는 입장권 상품입니다.",
    "address": {
      "country": "JP",
      "state": "Tokyo",
      "city": "Sumida",
      "addressLine": "1 Chome-1-2 Oshiage, Sumida City"
    },
    "price": 4200.00,
    "status": "ACTIVE"
  },
  {
    "id": "139ae896-654a-48af-8554-c8642e91ea5d",
    "companyId": "f1781c14-846c-4ea8-bbf3-d58ef5f4fc99",
    "productName": "도쿄 스카이트리 야경 전망권2",
    "description": "도쿄 스카이트리 전망대에서 도쿄 야경을 감상할 수 있는 입장권 상품입니다.",
    "address": {
      "country": "JP",
      "state": "Tokyo",
      "city": "Sumida",
      "addressLine": "1 Chome-1-2 Oshiage, Sumida City"
    },
    "price": 4200.00,
    "status": "ACTIVE"
  },
  {
    "id": "60f953c9-5122-4b2d-b9a1-a1ca15262b06",
    "companyId": "f1781c14-846c-4ea8-bbf3-d58ef5f4fc99",
    "productName": "도쿄 스카이트리 야경 전망권3",
    "description": "도쿄 스카이트리 전망대에서 도쿄 야경을 감상할 수 있는 입장권 상품입니다.",
    "address": {
      "country": "JP",
      "state": "Tokyo",
      "city": "Sumida",
      "addressLine": "1 Chome-1-2 Oshiage, Sumida City"
    },
    "price": 4200.00,
    "status": "ACTIVE"
  }
]

/**
 * [1] 레이아웃 컴포넌트: 사이드바 + 우측 Outlet
 */
const MyPageLayout = () => {
  const {user} = useProfile();
  const location = useLocation();

  // 현재 경로와 일치하는지 확인 (중첩 라우팅 경로 포함)
  const isActive = (path) => location.pathname.endsWith(path);

  return (
      <div
          className="w-full overflow-hidden max-w-6xl mx-auto mt-8 flex gap-3 mb-4">
        <aside className="w-80 flex flex-col gap-4">
          <section
              className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div
                className="bg-orange-100 rounded-full mb-3 flex items-center justify-center text-3xl">
              <img
                  className={"w-20 h-20 rounded-full object-cover border border-gray-200"}
                  src={DefaultProfile} alt={"프로필"}/>
            </div>
            <h2 className="text-lg font-bold">{user?.name || "사용자"}</h2>
            <div className="text-center text-xs text-gray-400 mt-2 space-y-1">
              <p>{user?.email}</p>
              <p>{user?.gender} | {user?.role}</p>
            </div>
            <button
                className="mt-5 w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">
              프로필 수정
            </button>
          </section>

          <nav
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
            <div
                className="p-4 border-b border-gray-50 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Management
            </div>

            <Link to="matching"
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition ${isActive(
                      'matching')
                      ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>🤝</span> 매칭방 관리
            </Link>

            <Link to="host"
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition ${isActive(
                      'host')
                      ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>🏠</span> 일정 관리
            </Link>

            <div
                className="p-4 border-b border-gray-50 font-bold text-gray-400 text-[10px] uppercase tracking-widest mt-2">Seller
            </div>
            <Link to="company"
                  className={`w-full flex items-center gap-3 px-6 py-4 text-sm transition ${isActive(
                      'company')
                      ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>🏠</span> 업체 관리
            </Link>
          </nav>
        </aside>

        {/* --- 오른쪽 메인 콘텐츠 영역 --- */}
        <main className="flex-1 min-w-0 h-full">
          <Outlet/>
        </main>
      </div>
  );
};

const HostManagement = () => {
  // hosting: 호스트 관리(내가 만든 방), applied: 내가 신청한 일정
  const [subTab, setSubTab] = useState('hosting');

  // 데이터 A: 호스트 관리용 (기존 상세 UI 유지)
  const [hostingTrips] = useState([
    {
      id: 1,
      title: "도쿄 5일 맛집 투어",
      date: "2026-05-20 ~ 2026-05-24",
      status: "모집 중",
      participants: "3/5명",
      waitlist: [
        {id: 101, name: "박여행", date: "2026-05-01"},
        {id: 102, name: "이트립", date: "2026-05-02"},
      ],
      approved: [
        {id: 103, name: "최메이트", date: "2026-05-03"}
      ]
    }
  ]);

  // 데이터 B: 내가 신청한 일정 (플랜별 그룹화 구조)
  const [appliedPlans] = useState([
    {
      planId: "uuid-1234-5678",
      planName: "도쿄 3박 4일 투어",
      planUnits: [
        {
          id: 201,
          title: "교토 전통 가옥 체험",
          host: "교토전문가",
          date: "2026-06-10 ~ 2026-06-12",
          status: "승인됨",
        },
        {
          id: 202,
          title: "시부야 야경 출사",
          host: "포토그래퍼",
          date: "2026-05-25 ~ 2026-05-25",
          status: "대기중",
        }
      ]
    },
    {
      planId: "uuid-9999-0000",
      planName: "오사카 식도락 여행",
      planUnits: [
        {
          id: 301,
          title: "도톤보리 타코야끼 투어",
          host: "먹보대장",
          date: "2026-07-01",
          status: "거절됨",
        }
      ]
    }
  ]);

  return (
      <section
          className="bg-white h-full rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-500">

        {/* --- 상단 서브 탭 메뉴 --- */}
        <div className="flex border-b mb-6 text-sm font-medium">
          <button
              onClick={() => setSubTab('applied')}
              className={`pb-4 px-6 transition ${subTab === 'applied'
                  ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                  : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}`}>
            내가 신청한 일정
          </button>
          <button
              onClick={() => setSubTab('hosting')}
              className={`pb-4 px-6 transition ${subTab === 'hosting'
                  ? 'text-orange-500 border-b-2 border-orange-500 font-bold'
                  : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}`}>
            호스트 관리
          </button>
        </div>

        {/* --- 1. 호스트 관리 화면 (상세 명단 UI) --- */}
        {subTab === 'hosting' && hostingTrips.map(trip => (
            <div key={trip.id}
                 className="border border-gray-100 rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex justify-between items-start mb-4 text-left">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{trip.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">📅 {trip.date} |
                    참여 {trip.participants}</p>
                </div>
                <span
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{trip.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* 대기 명단 영역 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider text-left">대기
                    인원 ({trip.waitlist.length})</p>
                  {trip.waitlist.map(person => (
                      <div key={person.id}
                           className="flex justify-between items-center bg-white p-3 rounded-md mb-2 shadow-sm border border-gray-100">
                        <span
                            className="text-sm font-medium text-gray-700">{person.name}</span>
                        <div className="flex gap-1">
                          <button
                              className="text-[10px] px-2 py-1 bg-green-500 text-white rounded font-bold hover:bg-green-600 transition">승인
                          </button>
                          <button
                              className="text-[10px] px-2 py-1 border border-gray-200 text-gray-400 rounded font-bold hover:bg-red-50 hover:text-red-500 transition">거절
                          </button>
                        </div>
                      </div>
                  ))}
                </div>

                {/* 확정 명단 영역 */}
                <div className="bg-white border border-gray-100 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider text-left">확정된
                    메이트 ({trip.approved.length})</p>
                  {trip.approved.map(person => (
                      <div key={person.id}
                           className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0 text-left">
                        <span
                            className="text-sm font-medium text-gray-700">{person.name}</span>
                        <span
                            className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">확정됨</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        ))}

        {/* --- 2. 내가 신청한 일정 화면 (그룹화 UI) --- */}
        {subTab === 'applied' && (
            <div className="space-y-8">
              {appliedPlans.map(plan => (
                  <div key={plan.planId}
                       className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left">
                    {/* 플랜 제목 단위 */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                          className="bg-orange-500 w-1 h-5 rounded-full"></span>
                      <h3 className="font-bold text-lg text-gray-900">{plan.planName}</h3>
                      <span
                          className="text-xs text-gray-400 ml-2 font-normal italic">총 {plan.planUnits.length}개의 일정</span>
                    </div>

                    {/* 플랜 내 세부 일정 리스트 */}
                    <div className="space-y-3">
                      {plan.planUnits.map(unit => (
                          <div key={unit.id}
                               className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-4 items-center">
                              <div className={`w-2 h-2 rounded-full ${
                                  unit.status === '승인됨' ? 'bg-blue-500' :
                                      unit.status === '대기중' ? 'bg-yellow-400'
                                          : 'bg-red-400'
                              }`}></div>
                              <div className="text-left">
                                <h4 className="font-bold text-gray-700 text-sm">{unit.title}</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">호스트: {unit.host} | {unit.date}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                      <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              unit.status === '승인됨' ? 'bg-blue-50 text-blue-600'
                                  :
                                  unit.status === '대기중'
                                      ? 'bg-yellow-50 text-yellow-600'
                                      : 'bg-red-50 text-red-600'
                          }`}>
                        {unit.status}
                      </span>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              ))}
            </div>
        )}
      </section>
  );
};

/**
 * [3] 매칭방 관리 컴포넌트
 */
const MatchingManagement = () => (
    <section
        className="bg-white rounded-2xl h-full shadow-sm border border-gray-100 p-20 text-center animate-in fade-in duration-500">
      <div className="text-5xl mb-4 text-orange-200">🤝</div>
      <h2 className="text-xl font-bold mb-2 text-gray-800">매칭방 관리</h2>
      <p className="text-gray-400 text-sm">참여 중인 매칭방이 없습니다.<br/>새로운 여행 메이트를
        찾아보세요!</p>
    </section>
);

/**
 * [1] 업체 관리 메인 컨테이너
 */
const CompanyManagement = () => {
  const {company} = useCompanyProfile(); // 회사 정보 가져오기 (커스텀 훅 가정)
  const [isCreating, setIsCreating] = useState(false); // 생성 폼 전환 상태

  return (
      <section
          className="bg-white rounded-2xl min-h-full shadow-sm border border-gray-100 p-8 animate-in fade-in duration-500">
        {company === null && !isCreating ? (
            /* 회사 정보가 없고 생성 중이 아닐 때 */
            <div
                className="flex flex-col items-center justify-center py-20 text-center">
              <div
                  className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6">🏢
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">등록된 업체 정보가
                없습니다</h2>
              <p className="text-gray-400 text-sm mb-8">TripMate와 함께 비즈니스를
                시작해보세요.</p>
              <button
                  onClick={() => setIsCreating(true)}
                  className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
              >
                업체 등록하기
              </button>
            </div>
        ) : isCreating ? (
            /* 업체 생성 폼 화면 */
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">새로운 업체 등록</h2>
                <button onClick={() => setIsCreating(false)}
                        className="text-gray-400 hover:text-gray-600 text-sm">취소
                </button>
              </div>
              <CompanyCreationCard onCancel={() => setIsCreating(false)}/>
            </div>
        ) : (
            /* 회사 정보가 존재할 때 */
            <div className="text-left">
              <div className="flex items-center gap-4 mb-8">
                <div
                    className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">🏢
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{company.name}</h2>
                  <p className="text-gray-500 text-sm">{company.email}</p>
                </div>
              </div>
              {/* 상세 정보 레이아웃... */}
            </div>
        )}
      </section>
  );
};

/**
 * [2] 업체 생성 카드 컴포넌트
 */
const CompanyCreationCard = ({onCancel}) => {
  // Input 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    businessNumber: '',
    email: '',
    phone: '',
    description: ''
  });

  const handleChange = (e) => {
    const {id, value} = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };

  const handleCreateCompany = async () => {
    console.log("업체 생성 데이터:", formData);
    try {
      const response = await axiosInstance.post("/companies", formData)
      if (response) {
        saveCompany(response.data.data.id)
      }
      console.log(response)
    } catch (e) {

    }
    alert("업체 등록 신청이 완료되었습니다.");
  };

  return (
      <div className="space-y-8 text-left">
        {/* 등록 섹션 */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 ml-1">업체명
                *</label>
              <input id="name" value={formData.name} onChange={handleChange}
                     className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                     placeholder="업체명을 입력하세요"/>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 ml-1">사업자 번호
                *</label>
              <input id="businessNumber" value={formData.businessNumber}
                     onChange={handleChange}
                     className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                     placeholder="000-00-00000"/>
            </div>
            <div className="flex flex-col gap-2">
              <label
                  className="text-sm font-bold text-gray-700 ml-1">이메일</label>
              <input id="email" type="email"
                     value={formData.email}
                     onChange={handleChange}
                     className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                     placeholder="example@email.com"/>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 ml-1">전화번호
                *</label>
              <input id="phone" value={formData.phone}
                     onChange={handleChange}
                     className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                     placeholder="02-000-0000"/>
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 ml-1">업체
                설명</label>
              <textarea id="description" rows="4" value={formData.description}
                        onChange={handleChange}
                        className="p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
                        placeholder="업체에 대한 상세 설명을 입력하세요"/>
            </div>
          </div>

          <button
              onClick={handleCreateCompany}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg"
          >
            업체 등록 완료
          </button>
        </div>
      </div>
  );
};

/**
 * [4] 라우팅 메인 컴포넌트
 */
const MyPage = () => {
  return (
      <Routes>
        <Route path="/" element={<MyPageLayout/>}>
          <Route index element={<Navigate to="host" replace/>}/>
          <Route path="host" element={<HostManagement/>}/>
          <Route path="matching" element={<MatchingManagement/>}/>
          <Route path="company" element={<CompanyManagement/>}/>
        </Route>
      </Routes>
  );
};

export default MyPage;