import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axiosInstance from "../util/axiosInstance";
import {
  IoIosArrowDown,
  IoIosArrowRoundBack,
  IoIosArrowUp
} from "react-icons/io";
import {GoHome} from "react-icons/go";
import {useProfile} from "../hook/userContext";

export default function PlanDetailPage() {
  const {user} = useProfile();
  const {plan_id} = useParams();
  const [planData, setPlanData] = useState({});
  const [planUnits, setPlanUnits] = useState(new Map());
  const [feedData, setFeedData] = useState(new Map());
  const [activeTab, setActiveTab] = useState("일정");
  const [selectedDay, setSelectedDay] = useState(1);
  const [expandedUnit, setExpandedUnit] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [plan_id]);

  const fetchFeedData = async (planUnitsData) => {
    try {
      // 1. 모든 unit의 feed 정보를 병렬로 가져오기 위해 Promise.all 사용
      const feedPromises = planUnitsData.map(unit =>
          axiosInstance.get(`/feeds/${unit.id}`).catch(err => {
            console.error(`Feed ID ${unit.id} 로드 실패:`, err);
            return {data: {data: []}}; // 실패 시 빈 배열 반환 처리
          })
      );

      const responses = await Promise.all(feedPromises);

      // 2. unitId를 키로 하여 Feed 데이터를 Map에 저장
      const newFeedData = new Map();
      responses.forEach((response, index) => {
        const unitId = planUnitsData[index].id;
        const feeds = response.data.data || [];
        newFeedData.set(unitId, feeds);
      });

      console.log(newFeedData)

      setFeedData(newFeedData);
    } catch (e) {
      console.error("피드 데이터 로딩 실패:", e);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/plans/${plan_id}`);
      const data = response.data.data;
      setPlanData(data);

      const planUnitsData = data.planUnits || [];

      // 1. Feed 데이터 먼저(혹은 동시에) 가져오기
      await fetchFeedData(planUnitsData);

      // 2. 일자별로 Plan Units 그룹화
      const newPlanUnitsData = new Map();
      planUnitsData.forEach(unit => {
        const dayUnits = newPlanUnitsData.get(unit.day) || [];
        newPlanUnitsData.set(unit.day, [...dayUnits, unit]);
      });

      setPlanUnits(newPlanUnitsData);

      // 3. 초기 선택 일자 설정
      if (newPlanUnitsData.size > 0) {
        const sortedDays = [...newPlanUnitsData.keys()].sort((a, b) => a - b);
        setSelectedDay(sortedDays[0]);
      }
    } catch (e) {
      console.error("전체 데이터 로딩 실패:", e);
    }
  };

  const planJoin = async (unit_id) => {
    try {
      await axiosInstance.post(
          `/plans/${plan_id}/unit-plans/${unit_id}/participations`);
      fetchData(); // 성공 시 데이터 갱신
    } catch (e) {
      alert(e.response?.data?.message || "참여 신청에 실패했습니다.");
    }
  };

  return (
      <div
          className="absolute top-0 left-0 right-0 z-50 bg-[#F9FBFA] min-h-screen pb-20">
        {/* 상단 이미지 영역 */}
        <div className="relative h-[300px] w-full overflow-hidden">
          <img
              className="w-full h-full object-cover"
              src="https://www.datocms-assets.com/101439/1741966285-tokyo.avif?auto=format&fit=crop&h=800&w=1200"
              alt="배경 이미지"
          />
          <div className="absolute inset-0 bg-black/30"/>
          <div className="absolute top-6 left-6 flex gap-3">
            <button onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all">
              <IoIosArrowRoundBack size={24}/>
            </button>
            <button onClick={() => navigate("/")}
                    className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all">
              <GoHome size={24}/>
            </button>
          </div>

          {/* 플랜 기본 정보 카드 */}
          <div
              className="absolute bottom-[-30px] left-6 right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  planData.recruitStatus === 'OPEN'
                      ? 'bg-green-100 text-[#1D9E75]'
                      : 'bg-gray-200 text-gray-500'
              }`}>
                {planData.recruitStatus === 'OPEN' ? '모집 중' : '모집 마감'}
              </span>
                <span
                    className="px-3 py-1 bg-blue-50 text-blue-500 text-xs font-bold rounded-full">
                {planData.planCreationType}
              </span>
              </div>
              <span className="text-gray-400 text-xs font-medium">
              {planData.startDate} ~ {planData.endDate}
            </span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 mb-2 break-keep">{planData.title}</h1>
            <p className="text-gray-500 text-sm line-clamp-2">{planData.description}</p>
          </div>
        </div>

        <div className="mt-16 px-6 max-w-3xl mx-auto">
          {/* 메인 탭 */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[...planUnits.keys()].sort((a, b) => a - b).map(day => (
                <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-6 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${
                        selectedDay === day
                            ? "bg-blue-500 border-none text-white shadow-lg"
                            : "bg-white border-gray-100 text-gray-400"
                    }`}
                >
                  DAY {String(day).padStart(2, '0')}
                </button>
            ))}
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            {["일정", "기록"].map((t) => (
                <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                        activeTab === t ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-400"
                    }`}
                >
                  {t}
                </button>
            ))}
          </div>

          {activeTab === "일정" ? (
              <>
                {/* 타임라인 리스트 */}
                <div
                    className="mt-8 relative border-l-2 border-gray-150 ml-4 pl-8 space-y-10">
                  {planUnits.get(selectedDay)?.map((unit) => {
                    const isFull = unit.currentCount >= unit.maxCount;
                    const isParticipant = unit.participants.some(
                        p => p.userId === user?.id);
                    const myParticipation = unit.participants.find(
                        p => p.userId === user?.id);

                    return (
                        <div key={unit.id} className="relative">
                          <div
                              className="absolute left-[-41px] top-4 w-4 h-4 rounded-full bg-blue-400 border-4 border-white shadow-sm"/>

                          <div
                              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                            <div
                                className="flex justify-between items-start mb-3">
                              <div>
                                <span
                                    className="text-blue-600 font-bold text-sm">{unit.startTime.slice(
                                    0, 5)} - {unit.endTime.slice(0, 5)}</span>
                                <h3 className="text-lg font-black text-gray-800 mt-1">{unit.title}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-blue-500 font-bold text-lg">₩{unit.price?.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400">인당
                                  금액</p>
                              </div>
                            </div>

                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">{unit.description}</p>

                            <div
                                className="flex items-center justify-between pt-5 border-t border-gray-50">
                              {/* 참여자 아바타 섹션 */}
                              <div className="flex flex-col gap-2">
                                <div className="flex -space-x-2">
                                  {unit.participants.slice(0, 5).map((p, i) => (
                                      <div key={i}
                                           className={`w-8 h-8 rounded-full border-2 border-white overflow-hidden ${p.participationRole
                                           === 'HOST' ? 'ring-2 ring-yellow-400'
                                               : ''}`}>
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${p.userId}`}
                                            alt="avatar"/>
                                      </div>
                                  ))}
                                  {unit.participants.length > 5 && (
                                      <div
                                          className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        +{unit.participants.length - 5}
                                      </div>
                                  )}
                                </div>
                                <span
                                    className="text-[11px] font-bold text-gray-400">
                            현재 참여 <span className={isFull ? "text-red-500"
                                    : "text-blue-500"}>{unit.currentCount}</span> / {unit.maxCount}명
                          </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                    onClick={() => setExpandedUnit(
                                        expandedUnit === unit.id ? null
                                            : unit.id)}
                                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                  {expandedUnit === unit.id ? <IoIosArrowUp/> :
                                      <IoIosArrowDown/>}
                                </button>

                                {isParticipant ? (
                                    <div className="flex flex-col items-end">
                              <span
                                  className="px-4 py-2 bg-green-50 text-[#1D9E75] font-bold text-sm rounded-xl border border-green-100">
                                {myParticipation.participationRole === 'HOST'
                                    ? '👑 호스트' : '참여 중'}
                              </span>
                                      <span
                                          className="text-[10px] text-gray-400 mt-1">{myParticipation.participationStatus}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => planJoin(unit.id)}
                                        disabled={isFull
                                            || planData.recruitStatus
                                            !== 'OPEN'}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                            isFull || planData.recruitStatus
                                            !== 'OPEN'
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-[#1D9E75] text-white hover:bg-[#168a65]"
                                        }`}
                                    >
                                      {isFull ? "정원 초과" : "참여하기"}
                                    </button>
                                )}
                              </div>
                            </div>
                            {
                                expandedUnit === unit.id &&
                                <div
                                    className="mt-5 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-fadeIn">
                                  <div
                                      className="flex justify-between items-center">
                                    <span
                                        className="text-xs text-gray-400 font-medium">상품 코드</span>
                                    <code
                                        className="text-xs text-blue-500 font-mono bg-blue-50 px-2 py-1 rounded">{unit.productScheduleId}</code>
                                  </div>
                                  <div
                                      className="mt-3 flex w-full rounded-lg border-gray-200 bg-white border">
                                    <button
                                        className="flex-1 py-3  text-gray-700 text-xs border-r border-gray-200 font-bold hover:shadow-sm transition-all">
                                      상세보기
                                    </button>
                                    <button
                                        className="flex-1 py-3  text-gray-700 text-xs font-bold  hover:shadow-sm transition-all">
                                      주문하기
                                    </button>
                                  </div>
                                </div>
                            }

                          </div>
                        </div>
                    );
                  })}
                </div>
              </>
          ) : (
              <div
                  className="mt-8 relative border-l-2 border-gray-150 ml-4 pl-8 space-y-10">
                {planUnits.get(selectedDay)?.map((unit) => {
                  const isFull = unit.currentCount >= unit.maxCount;
                  const isParticipant = unit.participants.some(
                      p => p.userId === user?.id);
                  const myParticipation = unit.participants.find(
                      p => p.userId === user?.id);

                  return (
                      <div key={unit.id} className="relative">
                        <div
                            className="absolute left-[-41px] top-4 w-4 h-4 rounded-full bg-blue-400 border-4 border-white shadow-sm"/>

                        <div
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                          <div
                              className="flex justify-between items-start mb-3">
                            <div>
                                <span
                                    className="text-blue-600 font-bold text-sm">{unit.startTime.slice(
                                    0, 5)} - {unit.endTime.slice(0, 5)}</span>
                              <h3 className="text-lg font-black text-gray-800 mt-1">{unit.title}</h3>
                            </div>
                            <div className="text-right">
                              <p className="text-blue-500 font-bold text-lg">₩{unit.price?.toLocaleString()}</p>
                              <p className="text-[10px] text-gray-400">인당
                                금액</p>
                            </div>
                          </div>

                          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{unit.description}</p>

                          <div
                              className="flex items-center justify-between pt-5 border-t border-gray-50">
                            {/* 참여자 아바타 섹션 */}

                            <div className="flex gap-2">
                              <button
                                  onClick={() => setExpandedUnit(
                                      expandedUnit === unit.id ? null
                                          : unit.id)}
                                  className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                              >
                                {expandedUnit === unit.id ? <IoIosArrowUp/> :
                                    <IoIosArrowDown/>}
                              </button>

                              {isParticipant ? (
                                  <div className="flex flex-col items-end">
                              <span
                                  className="px-4 py-2 bg-green-50 text-[#1D9E75] font-bold text-sm rounded-xl border border-green-100">
                                {myParticipation.participationRole === 'HOST'
                                    ? '호스트' : '참여 중'}
                              </span>
                                    <span
                                        className="text-[10px] text-gray-400 mt-1">{myParticipation.participationStatus}</span>
                                  </div>
                              ) : (
                                  <button
                                      onClick={() => planJoin(unit.id)}
                                      disabled={isFull
                                          || planData.recruitStatus
                                          !== 'OPEN'}
                                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                          isFull || planData.recruitStatus
                                          !== 'OPEN'
                                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                              : "bg-[#1D9E75] text-white hover:bg-[#168a65]"
                                      }`}
                                  >
                                    {isFull ? "정원 초과" : "참여하기"}
                                  </button>
                              )}
                              {/* 이미지 슬라이드 바 */}
                              <div>
                                {/* 이미지 */}
                                <div>

                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
}