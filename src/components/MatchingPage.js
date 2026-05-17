import React, {useCallback, useEffect, useState} from 'react';
import {
	List,
	MapPin,
	Navigation,
	Play,
	Plus,
	Settings,
	Star,
	User,
	X
} from 'lucide-react';
import axiosInstance from "../util/axiosInstance";
import {EventSourcePolyfill} from 'event-source-polyfill'
import {getToken} from "../util/auth";

const FilterSettings = ({settings, setSettings}) => {
	const mbtiPairs = [['I', 'E'], ['S', 'N'], ['T', 'F'], ['P', 'J']];
	const settingKeys = ['ie', 'sn', 'tf', 'pj'];
	
	return (
			<div className="space-y-4">
				<p className="font-bold text-slate-800 text-sm mb-2 tracking-tight">선호
					성향 필터</p>
				<div className="grid grid-cols-4 gap-2 mb-4">
					{mbtiPairs.map((pair, idx) => (
							<div key={idx}
									 className="flex flex-col border border-slate-100 rounded-xl overflow-hidden shadow-sm">
								{pair.map(val => (
										<button
												key={val}
												onClick={() => setSettings(
														prev => ({...prev, [settingKeys[idx]]: val}))}
												className={`py-2.5 text-xs font-black transition-all ${
														settings[settingKeys[idx]] === val
																? 'bg-teal-400 text-white'
																: 'bg-white text-slate-300'
												}`}
										>
											{val}
										</button>
								))}
							</div>
					))}
				</div>
				<div
						className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
					<span className="text-xs font-bold text-slate-600">흡연 여부</span>
					<button
							onClick={() => setSettings(
									prev => ({...prev, allowSmoking: !prev.allowSmoking}))}
							className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
									settings.allowSmoking
											? 'bg-yellow-300 border-yellow-400 text-slate-900 shadow-sm'
											: 'bg-white border-slate-200 text-slate-300'
							}`}
					>
						{settings.allowSmoking ? '흡연 허용' : '비흡연'}
					</button>
				</div>
			</div>
	);
};

const MatchingMapApp = () => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [isRegisterModalOpen, setRegisterModelOpen] = useState(false);
	const [isMatchingActive, setIsMatchingActive] = useState(true);
	const [step, setStep] = useState('map');
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [userSettings, setUserSettings] = useState(
			{ie: "I", sn: "N", tf: "F", pj: "P", allowSmoking: false});
	
	const [meetups] = useState([
		{
			id: 1,
			title: "도쿄역 저녁",
			location: "도코역",
			time: "19:00",
			distance: "300m",
			rating: "4.5"
		},
		{
			id: 2,
			title: "야경 보실 분",
			location: "시부야 스크램블 스퀘어",
			time: "12:30",
			distance: "1.2km",
			rating: "4.7"
		}
	]);
	
	useEffect(() => {
		fetchUserSetting();
	}, []);
	
	const handleStartMatching = useCallback(() => {
		setStep('loading');
		startGuestMatching();
		setTimeout(() => {
			setStep('map');
			alert("매칭 성공! 푸시 알림을 확인하세요.");
		}, 2000);
	}, []);
	
	const createMatchingData = async (postData) => {
		try {
			const response = await axiosInstance.post("/matching", postData)
			console.log(response)
		} catch (e) {
			console.log(e)
		}
	}
	
	const fetchUserSetting = async () => {
		try {
			const response = await axiosInstance.get("/user-settings")
			setUserSettings(response.data?.data);
			console.log("알림 설정 ", response.data.data)
		} catch (e) {
			console.log(e)
		}
	}
	const updateUserSetting = async () => {
		try {
			const response = await axiosInstance.put("/user-settings", userSettings)
			console.log(response)
		} catch (e) {
			console.log(e)
		}
	}
	
	const updateMatchingStatus = async () => {
		try {
			const response = await axiosInstance.patch(
					`/matching/${isMatchingActive ? "activation" : "deactivation"}`)
		} catch (e) {
			console.log(e)
		}
	}
	
	const startGuestMatching = async () => {
		try {
			const
					lat = 37.5519,
					lng = 126.9918;
			const eventSource = new EventSourcePolyfill(
					`/matching/mate/sub?lat=${lat}&lng=${lng}`,
					{
						headers: {
							'ngrok-skip-browser-warning': 'true',
							'Authorization': `Bearer ${getToken()}`
						}, withCredentials: false,
						heartbeatTimeout: 120000
					})
			ty
			eventSource.addEventListener('connect', (e) => {
				console.log("연결 성공")
			})
			eventSource.addEventListener('matching', (e) => {
				const data = JSON.parse(e.data)
				console.log("매칭 감지", data)
			})
			eventSource.addEventListener('matching-close', (e) => {
				console.log("매칭 완료로 인한 연결 종료");
				eventSource.close();
			})
			eventSource.onmessage = (event) => {
				console.log("데이터 받음", event)
			}
			eventSource.onerror = (e) => {
				console.error("SSE 에러:", e);
			};
			
			eventSource.onopen = () => {
				console.groupEnd();
			};
		} catch (e) {
			console.log(e)
		}
	}
	const startHostMatching = async () => {
		try {
			console.log("host matching")
			const response = await axiosInstance.get("/matching/host/sub")
			console.log("host", response)
		} catch (e) {
			console.log(e)
		}
	}
	
	return (
			<div
					className="flex flex-col h-full w-full bg-white left-0 right-0 overflow-hidden font-sans border-x border-slate-100 shadow-2xl">
				
				{/* 메인 맵 영역 (flex-1로 하단 탭 제외 높이 자동 계산) */}
				<div className="relative w-full h-full overflow-hidden">
					
					{/* 지도 배경 */}
					<div
							className={`relative transition-all duration-500 ${isSheetOpen
									? 'brightness-95 bg-slate-100' : 'bg-white'}`}>
						<div
								className="absolute top-0 left-0 right-0 bottom-0 opacity-[0.03]"/>
						<div
								className="absolute top-1/3 left-1/4 animate-bounce text-teal-400">
							<MapPin size={40} className="fill-teal-100"/>
						</div>
						<div
								className="absolute top-1/2 left-2/3 opacity-40 text-slate-300">
							<MapPin size={32}/>
						</div>
					</div>
					
					{/* 상단 헤더 */}
					<header
							className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center pointer-events-none">
						<div className="relative pointer-events-auto">
							<button onClick={() => setShowTooltip(!showTooltip)}
											className="bg-white shadow-lg px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm border border-slate-50 active:scale-95 transition-all">
								<Settings size={18} className="text-teal-500"/>
							</button>
							{showTooltip && (
									<div
											className="absolute top-16 left-0 w-64 bg-white border border-slate-100 rounded-[24px] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2">
										<h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-900">
											<User size={16} className="text-teal-400"/> 매칭 설정</h3>
										<FilterSettings settings={userSettings}
																		setSettings={setUserSettings}/>
										<button onClick={() => {
											setShowTooltip(false);
											updateUserSetting();
										}}
														className="w-full mt-4 bg-teal-500 text-white py-3 font-black rounded-xl active:bg-teal-600 transition-colors">저장하기
										</button>
									</div>
							)}
						</div>
						
						<div className="flex items-center gap-2 pointer-events-auto">
							<button onClick={handleStartMatching}
											className="bg-yellow-300 text-slate-900 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 font-black text-sm active:scale-95 transition-all hover:brightness-105">
								<Play size={16} fill="currentColor"/> 매칭 시작하기
							</button>
							<div
									className="bg-white shadow-lg px-3 py-2 rounded-2xl flex items-center gap-3 border border-slate-50">
                <span
										className="text-[10px] font-black text-teal-400">LIVE</span>
								<button onClick={() => {
									setIsMatchingActive(!isMatchingActive)
									updateMatchingStatus();
								}}
												className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isMatchingActive
														? 'bg-teal-400' : 'bg-slate-200'}`}>
									<div
											className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isMatchingActive
													? 'left-6' : 'left-1'}`}/>
								</button>
							</div>
						</div>
					</header>
					
					{/* 내 위치 버튼 */}
					<button
							className="absolute right-4 bottom-6 z-30 bg-white p-3.5 rounded-full shadow-2xl border border-slate-50 active:scale-90 transition-transform text-teal-500">
						<Navigation size={24}/>
					</button>
				</div>
				
				{/* 로딩 레이어 */}
				{step === 'loading' && (
						<div
								className="absolute top-0 left-0 right-0 bottom-0 z-[110] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
							<div
									className="w-14 h-14 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin mb-4"/>
							<p className="font-extrabold text-xl text-slate-900 tracking-tighter">유저
								정보 확인 중...</p>
						</div>
				)}
				
				{/* 등록 버튼 */}
				<div
						className="absolute left-1/2 -translate-x-1/2 bottom-[200px] z-[60]">
					<button
							onClick={() => setRegisterModelOpen(prevState => !prevState)}
							className="bg-slate-900 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-2xl active:scale-95 whitespace-nowrap border-4 border-white">
						<Plus size={20} strokeWidth={3}/> 글 등록하기
					</button>
				</div>
				
				{/* 바텀 시트 (목록) */}
				<div
						className={`absolute left-0 right-0 bottom-0 z-50 overflow-hidden bg-white shadow-[0_-15px_60px_rgba(0,0,0,0.08)] rounded-t-[40px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSheetOpen
								? 'h-[80%]' : 'h-28'}`}>
					<div
							className="w-full py-6 cursor-pointer flex flex-col items-center group"
							onClick={() => setIsSheetOpen(!isSheetOpen)}>
						<div
								className="w-12 h-1 bg-slate-100 rounded-full mb-2 group-hover:bg-slate-200"/>
						{!isSheetOpen && <p
								className="text-sm font-bold text-slate-400 tracking-tight">내 주변
							번개 {meetups.length}개</p>}
					</div>
					
					<div className="px-6 overflow-y-auto h-[calc(100%-112px)] pb-32">
						<div className="flex justify-between items-center mb-8 px-2">
							<h2 className="text-2xl font-black text-slate-900 tracking-tighter">실시간
								모임 리스트</h2>
							{isSheetOpen && <button onClick={() => setIsSheetOpen(false)}
																			className="p-2 bg-slate-50 rounded-full text-slate-400 active:scale-90">
								<X size={20}/></button>}
						</div>
						
						<div className="space-y-4">
							{meetups.map(m => (
									<div key={m.id}
											 className="p-6 rounded-[32px] border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-[0.99]">
										<div className="flex justify-between items-start mb-2">
											<h3 className="text-lg font-bold text-slate-900 leading-tight">{m.title}</h3>
											<div
													className="flex items-center gap-1 text-yellow-500 font-bold text-sm shrink-0">
												<Star size={14} className="fill-yellow-400"/> {m.rating}
											</div>
										</div>
										<div
												className="flex items-center gap-2 text-sm text-slate-400 mb-5 font-medium tracking-tight">
                      <span
													className="bg-slate-50 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 tracking-wide uppercase">{m.location}</span>
											<span>•</span> <span>{m.distance}</span> <span>•</span>
											<span
													className="text-teal-500 font-bold">{m.time} 모임</span>
										</div>
										<div className="flex gap-3">
											<button
													className="flex-1 bg-slate-50 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100">상세정보
											</button>
											<button onClick={handleStartMatching}
															className="flex-[2.5] bg-teal-500 py-3.5 rounded-2xl text-sm font-black text-white shadow-lg shadow-teal-100 active:brightness-95">매칭
												참여
											</button>
										</div>
									</div>
							))}
						</div>
					</div>
				</div>
				
				{/* 하단 탭바 (Shrink-0으로 크기 고정) */}
				<nav
						className="absolute bottom-0 w-full bg-white border-t border-slate-50 flex justify-around items-center z-[55] pb-4 shrink-0">
					<button onClick={() => setIsSheetOpen(false)}
									className={`flex flex-col items-center gap-1.5 transition-colors ${!isSheetOpen
											? 'text-teal-500' : 'text-slate-300'}`}>
						<MapPin size={22}/><span className="text-[10px] font-bold">지도</span>
					</button>
					<button onClick={() => setIsSheetOpen(true)}
									className={`flex flex-col items-center gap-1.5 transition-colors ${isSheetOpen
											? 'text-teal-500' : 'text-slate-300'}`}>
						<List size={22}/><span className="text-[10px] font-bold">목록</span>
					</button>
				</nav>
				{
						isRegisterModalOpen &&
						<RegisterModal isOpen={isRegisterModalOpen}
													 onClose={() => setRegisterModelOpen(false)}
													 onRegister={(postData) => {
														 createMatchingData(postData);
														 startHostMatching();
														 setRegisterModelOpen(false)
													 }}/>
				}
			</div>
	);
};

export default MatchingMapApp;

const RegisterModal = ({isOpen, onClose, onRegister}) => {
	const [formData, setFormData] = useState({
		lat: 37.5519,
		lng: 126.9918,
		title: "주말 한강 러닝 모임",
		description: "토요일 오전 7시에 여의도 한강공원에서 같이 가볍게 달리실 분 구합니다! 초보자 분들도 환영해요. 5km 코스로 진행될 예정입니다.",
		scheduledAt: "2026-05-23T07:00:00",
		recruitedAt: "2026-05-20T18:00:00"
	});
	
	if (!isOpen) {
		return null;
	}
	
	return (
			<div
					className="fixed top-0 left-0 right-0 bottom-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
				<div
						className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
					<div
							className="p-6 border-b border-slate-50 flex justify-between items-center">
						<h2 className="text-xl font-black text-slate-900 tracking-tighter">⚡
							새 번개 등록</h2>
						<button onClick={onClose}
										className="p-2 bg-slate-50 rounded-full text-slate-400"><X
								size={20}/></button>
					</div>
					
					<div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
						<input
								className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm outline-none"
								placeholder="제목"
								onChange={e => setFormData(
										{...formData, title: e.target.value})}
						/>
						<textarea
								className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm outline-none h-24 resize-none"
								placeholder="상세 설명"
								onChange={e => setFormData(
										{...formData, description: e.target.value})}
						/>
						<input
								className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm outline-none"
								placeholder="오픈채팅 주소"
								onChange={e => setFormData(
										{...formData, chatUrl: e.target.value})}
						/>
						{/* 성향 필터 설정 컴포넌트 재사용 */}
						<FilterSettings settings={formData} setSettings={setFormData}/>
					</div>
					
					<div className="p-6 bg-slate-50">
						<button
								onClick={() => onRegister(formData)}
								className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black active:scale-[0.98] transition-all"
						>
							번개 생성하기
						</button>
					</div>
				</div>
			</div>
	);
};