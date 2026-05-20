import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Settings, Calendar, RefreshCw, Check } from 'lucide-react';
import { companyService } from '../services';

const LOCATION_DATA = {
  KR: { name: '한국', cities: ['서울', '부산', '제주', '인천', '대구'] },
  JP: { name: '일본', cities: ['도쿄', '오사카', '후쿠오카', '교토', '삿포로'] }
};

const ProductCard = ({ product, onClick }) => {
  return (
      <div
          onClick={onClick}
          className={`bg-white border rounded-[28px] overflow-hidden p-4 shadow-[0_2px_16px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-3.5 relative ${
              product.status === '비활성화' ? 'opacity-60 bg-gray-50/50' : 'border-gray-200/80'
          }`}
      >
        <div className="w-full aspect-[4/3] bg-gray-100 rounded-[20px] overflow-hidden relative">
          {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
          )}
          {product.status === '비활성화' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-black tracking-wider rounded-[20px]">
                비활성화 상태
              </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 px-1 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-[#F0F7FF] text-[#007AFF] rounded-md text-[10px] font-black">
              {product.country} · {product.city}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                product.status === '활성화' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {product.status}
            </span>
          </div>

          <h3 className="text-[15px] font-bold text-[#222222] tracking-tight line-clamp-1 mt-1">
            {product.title}
          </h3>

          <p className="text-xs text-gray-500 font-bold">
            {product.price.toLocaleString()}원
          </p>

          <div className="flex items-center gap-1.5 text-gray-400 mt-2 border-t border-gray-50 pt-2.5">
            <Calendar size={13} />
            <span className="text-[11px] font-medium text-gray-500">{product.dateRange}</span>
          </div>
        </div>
      </div>
  );
};

export const ProductsView = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 필터 상태 관리 정의
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [productStatus, setProductStatus] = useState('전체');

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await companyService.getProducts();

        const mappedProducts = (response.data.data.content || []).map((p, idx) => ({
          id: p.id,
          title: p.productName || p.name || '도쿄 3박 4일 패키지',
          description: p.description,
          price: p.price,
          country: p.address.country,
          city: p.address.city,
          status: p.status !== "ACTIVE" ? '비활성화' : '활성화',
          dateRange: p.dateRange || '2026-05-02 ~ 2026-05-13',
          image: p.imageUrl || null
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCountryToggle = (code) => {
    setSelectedCountries(prev => {
      const isSelected = prev.includes(code);
      if (isSelected) {
        // 국가 해제 시 해당 국가에 속했던 도시들도 같이 선택 해제 처리
        const countryName = LOCATION_DATA[code].name;
        const targetCities = LOCATION_DATA[code].cities;
        setSelectedCities(cPrev => cPrev.filter(c => !targetCities.includes(c)));
        return prev.filter(item => item !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleCityToggle = (cityName) => {
    setSelectedCities(prev =>
        prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const availableCities = useMemo(() => {
    if (selectedCountries.length === 0) return [];
    return selectedCountries.reduce((acc, code) => {
      return [...acc, ...LOCATION_DATA[code].cities];
    }, []);
  }, [selectedCountries]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountries([]);
    setSelectedCities([]);
    setMinPrice('');
    setMaxPrice('');
    setProductStatus('전체');
    setActiveDropdown(null);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. 상품명 검색 필터
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. 국가 필터 (선택된 국가가 있을 때만 작동)
      const selectedCountryNames = selectedCountries.map(code => LOCATION_DATA[code].name);
      const matchesCountry = selectedCountryNames.length === 0 || selectedCountryNames.includes(product.country);

      // 3. 도시 필터 (선택된 도시가 있을 때만 작동)
      const matchesCity = selectedCities.length === 0 || selectedCities.includes(product.city);

      // 4. 가격 범위 필터
      const matchesMinPrice = minPrice === '' || product.price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || product.price <= Number(maxPrice);

      // 5. 상품 상태 필터
      const matchesStatus = productStatus === '전체' || product.status === productStatus;

      return matchesSearch && matchesCountry && matchesCity && matchesMinPrice && matchesMaxPrice && matchesStatus;
    });
  }, [products, searchQuery, selectedCountries, selectedCities, minPrice, maxPrice, productStatus]);

  return (
      <div className="bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-10 min-h-[800px] flex flex-col">

        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-[#222222] tracking-tight">상품</h2>
        </div>

        {/* 대형 고급 필터 바 패널 */}
        <div className="flex flex-col gap-4 mb-8 pb-4 border-b border-gray-100 relative z-30">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* 3가지 커스텀 드롭다운 트리거 목록 */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setActiveDropdown(prev => prev === 'location' ? null : 'location')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                        selectedCountries.length > 0 ? 'bg-[#F0F7FF] border-[#007AFF] text-[#007AFF]' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                >
                  <span>
                    {selectedCities.length > 0
                        ? `지역: ${selectedCities.slice(0, 2).join(', ')}${selectedCities.length > 2 ? ' 외' : ''}`
                        : selectedCountries.length > 0 ? `국가 선택됨 (${selectedCountries.length})` : '국가 / 도시 선택'}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {activeDropdown === 'location' && (
                    <div className="absolute left-0 mt-2 w-[340px] bg-white border border-gray-100 rounded-[24px] shadow-2xl p-4 flex gap-4 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* 좌측: 국가 선택 단축 리스트 */}
                      <div className="w-1/3 border-r border-gray-100 pr-2 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 block mb-1 px-1">국가 목록</span>
                        {Object.keys(LOCATION_DATA).map(code => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => handleCountryToggle(code)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${
                                    selectedCountries.includes(code) ? 'bg-[#F0F7FF] text-[#007AFF]' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <span>{LOCATION_DATA[code].name}</span>
                              {selectedCountries.includes(code) && <Check size={12} />}
                            </button>
                        ))}
                      </div>

                      {/* 우측: 연동된 도시 목록 레이어 */}
                      <div className="w-2/3 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 block mb-1 px-1">세부 도시 (중복 가능)</span>
                        {selectedCountries.length === 0 ? (
                            <span className="text-[11px] text-gray-400 p-2 block text-center mt-4">국가를 먼저 선택해주세요</span>
                        ) : (
                            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                              {availableCities.map(cityName => (
                                  <label key={cityName} className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={selectedCities.includes(cityName)}
                                        onChange={() => handleCityToggle(cityName)}
                                        className="accent-[#007AFF] rounded w-3.5 h-3.5"
                                    />
                                    <span>{cityName}</span>
                                  </label>
                              ))}
                            </div>
                        )}
                      </div>
                    </div>
                )}
              </div>

              {/* [드롭다운 2] 가격 범위 검색 범위 */}
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setActiveDropdown(prev => prev === 'price' ? null : 'price')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                        minPrice || maxPrice ? 'bg-[#F0F7FF] border-[#007AFF] text-[#007AFF]' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                >
                  <span>{(minPrice || maxPrice) ? '가격 설정됨' : '가격 범위'}</span>
                  <ChevronDown size={14} />
                </button>

                {activeDropdown === 'price' && (
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-40 flex flex-col gap-3">
                      <span className="text-[11px] font-black text-gray-400">금액 범위 설정 (원)</span>
                      <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="최소 금액"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-[#007AFF]"
                        />
                        <span className="text-gray-400 text-xs">~</span>
                        <input
                            type="number"
                            placeholder="최대 금액"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-[#007AFF]"
                        />
                      </div>
                    </div>
                )}
              </div>

              {/* [드롭다운 3] 상품 상태 제어 (활성화, 비활성화) */}
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setActiveDropdown(prev => prev === 'status' ? null : 'status')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all shadow-sm ${
                        productStatus !== '전체' ? 'bg-[#F0F7FF] border-[#007AFF] text-[#007AFF]' : 'bg-white border-gray-200 text-gray-600'
                    }`}
                >
                  <span>상태: {productStatus}</span>
                  <ChevronDown size={14} />
                </button>

                {activeDropdown === 'status' && (
                    <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-40">
                      {['전체', '활성화', '비활성화'].map(status => (
                          <button
                              key={status}
                              type="button"
                              onClick={() => { setProductStatus(status); setActiveDropdown(null); }}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold block ${
                                  productStatus === status ? 'text-[#007AFF] bg-[#F0F7FF]' : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            {status}
                          </button>
                      ))}
                    </div>
                )}
              </div>

              {/* 필터 전면 초기화 버튼 */}
              {(selectedCountries.length > 0 || minPrice || maxPrice || productStatus !== '전체' || searchQuery) && (
                  <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex items-center gap-1.5 text-xs text-red-500 font-bold hover:underline ml-2"
                  >
                    <RefreshCw size={12} />
                    <span>필터 전체 리셋</span>
                  </button>
              )}
            </div>

            {/* 우측 돋보기 실시간 상품명 검색창 */}
            <div className="w-full sm:max-w-[300px] relative">
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상품명으로 정확한 조회를 진행하세요"
                  className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 rounded-full text-xs font-semibold focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/5 transition-all shadow-sm"
              />
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 3. 메인 그리드 레이아웃 패널 */}
        {loading ? (
            <div className="flex-1 flex items-center justify-center py-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]" />
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-40 text-gray-400 text-sm font-medium">
              지정한 조건 범주에 들어맞는 등록 상품 목록이 존재하지 않습니다.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
              {filteredProducts.map((product) => (
                  <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => navigate(`/products/${product.id}`)}
                  />
              ))}
            </div>
        )}
      </div>
  );
};