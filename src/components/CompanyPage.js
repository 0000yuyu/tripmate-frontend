import React, {useState} from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Loader2,
  Package,
  Search
} from 'lucide-react';
import axiosInstance from "../util/axiosInstance";

const TripMateAdmin = () => {
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('company');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  // 결과 저장 및 로딩 제어 헬퍼
  const updateState = (id, isLoading, data = null, isError = false) => {
    setLoading(prev => ({...prev, [id]: isLoading}));
    if (!isLoading && data) {
      setResults(prev => ({...prev, [id]: {data, isError}}));
    }
  };

  // --- 1. 업체 관련 함수 ---
  const handleCreateCompany = async () => {
    const id = 'company-create';
    const body = {
      name: document.getElementById('c-name').value,
      businessNumber: document.getElementById('c-bizno').value,
      email: document.getElementById('c-email').value,
      phone: document.getElementById('c-phone').value,
      description: document.getElementById('c-desc').value,
    };

    updateState(id, true);
    try {
      const res = await axiosInstance.post('/companies', body);
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  const handleGetCompany = async () => {
    const id = 'company-get';
    const companyId = document.getElementById('c-id').value.trim();
    if (!companyId) {
      return alert('업체 ID를 입력하세요');
    }

    updateState(id, true);
    try {
      const res = await axiosInstance.get(`/companies/${companyId}`);
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  // --- 2. 상품 관련 함수 ---
  const handleCreateProduct = async () => {
    const id = 'product-create';
    const companyId = document.getElementById('p-companyId').value.trim();
    const body = {
      productName: document.getElementById('p-name').value,
      description: document.getElementById('p-desc').value,
      country: document.getElementById('p-country').value,
      state: document.getElementById('p-state').value,
      city: document.getElementById('p-city').value,
      addressLine: document.getElementById('p-address').value,
      price: parseFloat(document.getElementById('p-price').value),
    };

    updateState(id, true);
    try {
      const res = await axiosInstance.post('/products', body, {
        headers: {'X-Company-Id': companyId}
      });
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  const handleGetProduct = async () => {
    const id = 'product-get';
    const productId = document.getElementById('p-id').value.trim();

    updateState(id, true);
    try {
      const path = productId ? `/products/${productId}` : '/products';
      const res = await axiosInstance.get(path, {params: {size: 10}});
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  // --- 3. 스케줄 관련 함수 ---
  const handleCreateSchedule = async () => {
    const id = 'schedule-create';
    const productId = document.getElementById('s-productId').value.trim();
    const companyId = document.getElementById('s-companyId').value.trim();
    const body = {
      startDate: document.getElementById('s-startDate').value,
      endDate: document.getElementById('s-endDate').value,
      stock: parseInt(document.getElementById('s-stock').value),
    };

    updateState(id, true);
    try {
      const res = await axiosInstance.post(
          `/products/${productId}/schedules/bulk`, body, {
            headers: {'X-Company-Id': companyId}
          });
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  // --- 4. 예약 가능 조회 ---
  const handleGetAvailable = async () => {
    const id = 'available-get';
    const date = document.getElementById('av-date').value;
    if (!date) {
      return alert('날짜를 선택하세요');
    }

    updateState(id, true);
    try {
      const res = await axiosInstance.get('/products/available', {
        params: {date, size: 10}
      });
      updateState(id, false, res.data, false);
    } catch (e) {
      updateState(id, false, e.response?.data || e.message, true);
    }
  };

  return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
        {/* Header */}

        {/* Nav */}
        <nav className="bg-white border-b border-[#E2E8F0] px-8 flex gap-2">
          {[
            {id: 'company', label: '업체 관리', icon: <Building2 size={18}/>},
            {id: 'product', label: '상품 관리', icon: <Package size={18}/>},
            {id: 'schedule', label: '스케줄 관리', icon: <Calendar size={18}/>},
            {id: 'available', label: '예약 조회', icon: <Search size={18}/>},
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                      activeTab === tab.id
                          ? 'text-blue-600 border-blue-600 bg-blue-50/30'
                          : 'text-gray-500 border-transparent hover:text-gray-800'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
          ))}
        </nav>

        <main className="p-8 max-w-[900px] mx-auto space-y-8">
          {/* 업체 섹션 */}
          {activeTab === 'company' && (
              <>
                <Card title="신규 업체 생성">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="업체명 *" id="c-name"/>
                    <Field label="사업자 번호 *" id="c-bizno"
                           placeholder="000-00-00000"/>
                    <Field label="이메일" id="c-email" type="email"/>
                    <Field label="전화번호 *" id="c-phone"/>
                    <div className="col-span-2">
                      <Field label="업체 설명" id="c-desc" isTextArea/>
                    </div>
                  </div>
                  <Button onClick={handleCreateCompany} label="업체 등록"/>
                  <ResponseBox id="company-create" results={results}
                               loading={loading}/>
                </Card>

                <Card title="업체 단건 조회">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Field label="업체 ID (UUID)" id="c-id"/>
                    </div>
                    <Button onClick={handleGetCompany} label="조회"/>
                  </div>
                  <ResponseBox id="company-get" results={results}
                               loading={loading}/>
                </Card>
              </>
          )}

          {/* 상품 섹션 */}
          {activeTab === 'product' && (
              <>
                <Card title="상품 정보 등록">
                  <div className="space-y-4">
                    <Field label="X-Company-Id (UUID) *" id="p-companyId"/>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><Field label="상품명 *"
                                                         id="p-name"/></div>
                      <div className="space-y-1">
                        <label
                            className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">국가
                          *</label>
                        <select id="p-country"
                                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
                          <option value="KR">KR (South Korea)</option>
                          <option value="JP">JP (Japan)</option>
                        </select>
                      </div>
                      <Field label="가격 (KRW) *" id="p-price" type="number"/>
                      <Field label="도/주 *" id="p-state" placeholder="예: 서울특별시"/>
                      <Field label="도시 *" id="p-city" placeholder="예: 강남구"/>
                    </div>
                    <Field label="상세 주소 *" id="p-address"/>
                    <Field label="상품 상세 설명 *" id="p-desc" isTextArea/>
                    <Button onClick={handleCreateProduct} label="상품 저장"/>
                  </div>
                  <ResponseBox id="product-create" results={results}
                               loading={loading}/>
                </Card>

                <Card title="상품 리스트/조회">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Field label="상품 ID (공백 시 전체 조회)" id="p-id"/>
                    </div>
                    <Button onClick={handleGetProduct} label="조회"/>
                  </div>
                  <ResponseBox id="product-get" results={results}
                               loading={loading}/>
                </Card>
              </>
          )}

          {/* 스케줄 섹션 */}
          {activeTab === 'schedule' && (
              <Card title="일정 관리 (Bulk 생성)">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="X-Company-Id *" id="s-companyId"/>
                  <Field label="대상 상품 ID (UUID) *" id="s-productId"/>
                  <Field label="시작일" id="s-startDate" type="date"/>
                  <Field label="종료일" id="s-endDate" type="date"/>
                  <div className="col-span-2"><Field label="재고 수량 *"
                                                     id="s-stock" type="number"
                                                     defaultValue="10"/></div>
                </div>
                <Button onClick={handleCreateSchedule} label="스케줄 일괄 생성"/>
                <ResponseBox id="schedule-create" results={results}
                             loading={loading}/>
              </Card>
          )}

          {/* 예약 가능 조회 */}
          {activeTab === 'available' && (
              <Card title="날짜별 예약 가능 상품 필터링">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Field label="조회 기준 날짜 *" id="av-date" type="date"/>
                  </div>
                  <Button onClick={handleGetAvailable} label="필터 적용"/>
                </div>
                <ResponseBox id="available-get" results={results}
                             loading={loading}/>
              </Card>
          )}
        </main>
      </div>
  );
};

// --- 컴포넌트 라이브러리 ---

const Card = ({title, children}) => (
    <div
        className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
        <h2 className="text-[15px] font-bold text-[#334155]">{title}</h2>
      </div>
      {children}
    </div>
);

const Field = ({label, id, isTextArea, ...props}) => (
    <div className="space-y-1">
      <label
          className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter"
          htmlFor={id}>
        {label}
      </label>
      {isTextArea ? (
          <textarea id={id} {...props}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm min-h-[100px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"/>
      ) : (
          <input id={id} {...props}
                 className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"/>
      )}
    </div>
);

const Button = ({label, onClick}) => (
    <button
        onClick={onClick}
        className="bg-blue-600 text-white px-6 py-2.5 text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-200"
    >
      {label}
    </button>
);

const ResponseBox = ({id, results, loading}) => {
  if (loading[id]) {
    return (
        <div
            className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-sm text-blue-600 animate-pulse font-medium">
          <Loader2 size={16} className="animate-spin"/> 서버에 요청을 전송하고 있습니다...
        </div>
    );
  }

  const result = results[id];
  if (!result) {
    return null;
  }

  return (
      <div
          className={`mt-4 p-5 rounded-xl text-[12px] font-mono leading-relaxed overflow-auto max-h-[350px] border shadow-inner ${
              result.isError ? 'bg-red-50 border-red-100 text-red-700'
                  : 'bg-gray-900 border-gray-800 text-blue-400'
          }`}>
        <div className="flex items-center gap-2 mb-2 font-sans font-bold">
          {result.isError ? <AlertCircle size={14}/> : <div
              className="w-2 h-2 rounded-full bg-blue-500"></div>}
          {result.isError ? 'ERROR' : 'SUCCESS'} RESPONSE
        </div>
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      </div>
  );
};

export default TripMateAdmin;