import React, {useEffect, useState} from 'react';
import {ArrowLeft, BookOpen, ChevronRight, Plus, Star} from 'lucide-react';
import axios from "../util/axiosInstance";

const ProfilePage = () => {
  console.log("진입은 했냐")
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  const [follows, setFollows] = useState([]);
  const [dnaResult, setDnaResult] = useState({});

  // 스위치 상태 관리
  const [isLibraryUpdateOn, setIsLibraryUpdateOn] = useState(true);
  const [isRoutineMorningOn, setIsRoutineMorningOn] = useState(false);
  const [isRoutineNightOn, setIsRoutineNightOn] = useState(true);

  const primaryOrange = "#FF6A00";
  const bgColor = "#F2F4F6";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const response = await axios.get('/users/me');
      console.log(response.data);
      setUserInfo(response.data.data);

      // 데모를 위한 타임아웃
      setTimeout(() => setIsLoading(false), 1000);
    } catch (e) {
      console.error("Profile API Error:", e);
      setIsLoading(false);
    }
  };

  // 헬퍼 함수
  const getGender = (gender) => {
    if (gender === 'MALE') {
      return '남자';
    }
    if (gender === 'FEMALE') {
      return '여자';
    }
    return '-';
  };

  const getRole = (role) => {
    if (role === 'USER') {
      return '유저';
    }
    if (role === 'SELLER') {
      return '판매자'
    }
  }

  const getAge = (age) => {
    const ageMap = {
      'TEENAGERS': '10대',
      'TWENTIES': '20대',
      'THIRTIES': '30대',
      'FORTIES': '40대',
      'FIFTIES_PLUS': '50대 이상'
    };
    return ageMap[age] || '-';
  };

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center"
             style={{backgroundColor: bgColor}}>
          <div
              className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
        </div>
    );
  }

  const nickname = userInfo.name || '이름 없음';

  return (
      <div className="min-h-screen pb-10" style={{backgroundColor: bgColor}}>
        {/* AppBar */}
        <header
            className="flex items-center justify-between p-4 sticky top-0 bg-[#F2F4F6] z-10">
          <button onClick={() => window.history.back()}>
            <ArrowLeft size={20}/>
          </button>
          <h1 className="text-base font-bold">프로필</h1>
          <div className="w-5"></div>
        </header>

        {/* 1. 프로필 상단 */}
        <div className="flex flex-col items-center py-6">
          <div
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
            <BookOpen size={40} color={primaryOrange}/>
          </div>
          <h2 className="mt-3 text-lg font-bold text-gray-800">{nickname}</h2>
        </div>

        {/*/!* 2. 팔로우 목록 카드 *!/*/}
        {/*<Card>*/}
        {/*  <div className="flex items-center justify-between mb-4">*/}
        {/*    <div className="flex items-center gap-2">*/}
        {/*      <Users size={20} className="text-gray-500"/>*/}
        {/*      <span className="font-semibold text-[15px]">팔로우 목록</span>*/}
        {/*    </div>*/}
        {/*    <ChevronRight size={20} className="text-gray-400"/>*/}
        {/*  </div>*/}

        {/*  <div className="flex gap-3 overflow-x-auto pb-2 mb-4">*/}
        {/*    {follows.length === 0 ? (*/}
        {/*        <p className="text-xs text-gray-400">팔로우한 유명인이 없습니다.</p>*/}
        {/*    ) : (*/}
        {/*        follows.map((follow, i) => (*/}
        {/*            <img key={i} src={follow.image_url} alt="profile"*/}
        {/*                 className="w-12 h-12 rounded-full bg-gray-200 object-cover"/>*/}
        {/*        ))*/}
        {/*    )}*/}
        {/*  </div>*/}

        {/*  <div*/}
        {/*      className="flex items-center justify-between pt-2 border-t border-gray-50">*/}
        {/*    <span className="text-[15px]">서재 업데이트 알림</span>*/}
        {/*    <Toggle active={isLibraryUpdateOn}*/}
        {/*            onToggle={() => setIsLibraryUpdateOn(!isLibraryUpdateOn)}/>*/}
        {/*  </div>*/}
        {/*</Card>*/}

        {/* 3. 독서 DNA 카드 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-gray-500"/>
              <span className="font-semibold text-[15px]">독서 DNA</span>
            </div>
            <ChevronRight size={20} className="text-gray-400"/>
          </div>
          <p className="text-sm leading-relaxed">
            {nickname}님은 <span className="font-bold"
                               style={{color: primaryOrange}}>
            ' {dnaResult.result_hea_line || '현실과 사회를 더 잘 이해하기 위해'} '
          </span>
          </p>
        </Card>

        {/* 4. 독서 루틴 카드 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-[15px]">독서 루틴 알림</span>
            <Plus size={22} className="text-gray-600"/>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-lg font-medium">오전 8:00</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">매일</span>
              <Toggle active={isRoutineMorningOn}
                      onToggle={() => setIsRoutineMorningOn(
                          !isRoutineMorningOn)}/>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-lg font-medium">오후 10:00</span>
            <div className="flex items-center gap-3">
            <span className="text-xs">
              <span style={{color: primaryOrange}}
                    className="font-bold">일 월 화 수 </span>
              <span className="text-gray-400">목 금 토</span>
            </span>
              <Toggle active={isRoutineNightOn}
                      onToggle={() => setIsRoutineNightOn(!isRoutineNightOn)}/>
            </div>
          </div>
        </Card>

        {/* 5. 계정 관리 */}
        <Card>
          <h3 className="text-[13px] text-gray-400 font-bold mb-2">계정 관리</h3>
          <AccountRow title="닉네임" value={nickname}/>
          <AccountRow title="성별" value={getGender(userInfo.gender)}/>
          {/*<AccountRow title="연령" value={getAge(userInfo.age_group)}/>*/}
          {/*<AccountRow title="아이디" value={userInfo.email || 'yhj8081'}/>*/}
          <AccountRow title="이메일"
                      value={userInfo.email || 'yhj8081@naver.com'}/>

          <div
              className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <span className="text-[15px] font-medium">비밀번호 재설정</span>
            <ChevronRight size={20} className="text-gray-400"/>
          </div>
        </Card>
      </div>
  );
};

// --- 내부 컴포넌트들 ---

const Card = ({children}) => (
    <div className="mx-4 my-2 p-5 bg-white rounded-2xl shadow-sm">
      {children}
    </div>
);

const AccountRow = ({title, value}) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-medium">{title}</span>
      <div className="flex items-center gap-1">
        <span className="text-[15px] text-gray-500">{value}</span>
        <ChevronRight size={18} className="text-gray-300"/>
      </div>
    </div>
);

const Toggle = ({active, onToggle}) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${active
            ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active
              ? 'left-7' : 'left-1'}`}/>
    </button>
);

export default ProfilePage;