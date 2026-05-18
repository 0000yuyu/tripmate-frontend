import {useEffect, useState} from "react";
import axiosInstance from "@utils/axiosInstance";
import {Link} from "react-router-dom";
import {LuPlus} from "react-icons/lu";
import {DatePicker, Select, Space} from "antd";

const ExampleData = [{
	PlanId: "ff67a907-0621-4f75-8d23-3cb5faaf330c",
	title: "도쿄 3박 4일 투어",
	description: "도쿄 같이 여행하실 분 모집합니다.",
	startDate: "2026-05-17",
	endDate: "2026-06-17",
	recruitStatus: "OPEN"
}, {
	PlanId: "ff67a907-0621-4f75-8d23-3cb5faaf330c",
	title: "도쿄 3박 4일 투어",
	description: "도쿄 같이 여행하실 분 모집합니다.",
	startDate: "2026-05-01",
	endDate: "2026-05-18",
	recruitStatus: "CLOSE"
}]

export function PlanListPage() {
	const [planListData, setPlanListData] = useState(ExampleData); // 서버에서 받은 원본 데이터
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState(["OPEN"]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	
	const categories = [{
		"label": "모집 중",
		"value": "OPEN"
	}, {
		"label": "모집 완료",
		"value": "CLOSE"
	}]
	
	useEffect(() => {
		// fetchData();
	}, []);
	
	const {RangePicker} = DatePicker;
	
	async function fetchData() {
		try {
			const response = await axiosInstance.get("/plans");
			// 서버 데이터 구조에 맞춰 조정하세요 (content가 배열인 경우)
			setPlanListData(response.data.data.content || []);
		} catch (e) {
			console.error("데이터 로딩 실패", e);
		}
	}
	
	// 모든 필터 조건을 결합한 데이터 계산
	const filteredData = planListData.filter((item) => {
		// 1. 이름 검색 (item.name 또는 item.title 등 필드명 확인 필요)
		const matchesSearch = (item.title || "").toLowerCase().includes(
				searchTerm.toLowerCase());
		
		// 2. 타입 필터
		const matchesType = activeCategory.includes(item.recruitStatus);
		
		// 3. 날짜 범위 필터 (item.date가 '2024-01-01' 형태라고 가정)
		const itemStartDate = new Date(item.startDate || item.date);
		const itemEndDate = new Date(item.endDate);
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;
		
		let matchesDate = true;
		if (start && itemStartDate < start) {
			matchesDate = false;
		}
		if (end && itemEndDate > end) {
			matchesDate = false;
		}
		return matchesSearch && matchesType && matchesDate;
	});
	
	return (
			<div
					className="w-full h-full hide-scroll px-[35px] py-[10px] overflow-hidden gap-[10px] bg-white shadow-md rounded-[10px] flex flex-col">
				{/* 헤더 */}
				<div className="w-full py-[10px] flex justify-between items-center">
					<text className="text-[16px] font-semibold leading-[30px]">함께 떠나는 일정
					</text>
					<button
							className="px-[15px] py-[5px] border-dashed border bg-[#F5F5F5] border-[#BFBFBF] flex gap-[5px] justify-center items-center rounded-[20px]">
						<LuPlus className="h-[16px] w-[16px]"/>
						<text className="text-[12px]">새로운 일정 만들기</text>
					</button>
				</div>
				<div
						className="flex flex-col w-full hide-scroll items-start justify-center gap-[5px]">
					<div className="flex-grow w-full h-full">
						<input
								type="text"
								placeholder="일정을 검색하세요."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-3 py-1.5 h-full text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					
					<div
							className="flex  hide-scroll w-full items-start h-full justify-center gap-[5px]">
						
						{/* Type 선택 드롭다운 (간소화된 select) */}
						<Space vertical
									 className="h-full min-w-[200px] max-w-[200px]">
							<Select
									mode="multiple"
									allowClear
									style={{width: "100%"}}
									placeholder="모집 상태를 선택하세요"
									onChange={(value) => setActiveCategory(value)}
									value={activeCategory}
									options={categories}
									maxTagCount={2}
							/>
						</Space>
						<Space style={{width: '100%', height: '100%'}} vertical
									 className="h-full min-w-[200px] max-w-[200px]">
							<Select
									mode="multiple"
									allowClear
									style={{width: "100%"}}
									placeholder="참여 상태를 선택하세요"
									onChange={(value) => setActiveCategory(value)}
									value={activeCategory}
									options={categories}
							/>
						</Space>
						
						<Space vertical
									 className="flex flex-col p-[0px] w-full h-full flex-1"
									 onChange={(e) => console.log(e)}>
							<RangePicker
									className="flex h-full"
									onChange={(dates, dateStrings) => {
										setStartDate(dateStrings[0]);
										setEndDate(dateStrings[1]);
									}}
							/>
						</Space>
					</div>
				</div>
				
				
				{/* 결과 요약 및 초기화 */}
				{(searchTerm || activeCategory !== "All" || startDate || endDate) && (
						<div className="mt-4 text-sm text-gray-600">
							<strong>{filteredData.length}</strong> results found.
							<button
									onClick={() => {
										setSearchTerm("");
										setActiveCategory([]);
										setStartDate("");
										setEndDate("");
									}}
									className="ml-2 text-blue-500 hover:underline"
							>
								Clear filters
							</button>
						</div>
				)}
				
				{/* 리스트 출력 */}
				<div
						className="flex flex-col overflow-scroll hide-scroll gap-[10px] divide-y divide-[#BFBFBF]">
					{filteredData.length > 0 ? (
							filteredData.map((r) => (
									<div key={r.id} className="py-4">
										<PlanCard plan={r}/>
									</div>
							))
					) : (
							<div className="py-20 text-center text-gray-500">
								조건에 맞는 일정이 없습니다.
							</div>
					)}
				</div>
			</div>
	);
}

export function PlanCard({plan}) {
	return (
			<Link to={`/plans/${plan.PlanId}`}
						className="flex gap-[20px] border border-black p-[10px]">
				<div
						className="w-[160px] flex flex-col h-[80px]">
					<img
							className="h-full"
							src="https://images.unsplash.com/photo-1534695215921-52f8a19e7909?q=80&w=985&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
				</div>
				<div
						className="flex-1 flex-col gap-[10px] p-[10px] overflow-hidden border border-black cursor-pointer"
				>
					<div className="flex flex-row p-"></div>
					<div className="flex items-center gap-1.5 mb-0.5">
					</div>
					<h3 className="font-bold text-gray-900 text-sm">{plan.title}</h3>
					<p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
						{plan.description}
					</p>
					<div className="flex items-center justify-between mt-2">
						<div>
							<span>{plan.startDate}</span>
							<span>{plan.endDate}</span>
						</div>
						<span
								className={`text-xs font-bold ${
										plan.recruitStatus === "OPEN"
												? "text-green-500"
												: "text-orange-500"
								}`}
						>
            {plan.PlanId}
          </span>
					</div>
				</div>
			</Link>
	);
}
