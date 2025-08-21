import React, { useState, useRef, useEffect } from 'react';

// 스크롤바 숨기기 스타일
const hideScrollbarStyle = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    overflow: hidden;
    height: 100vh;
    max-height: 100vh;
    margin: 0;
    padding: 0;
  }
  body {
    overflow: hidden;
    height: 100vh;
    max-height: 100vh;
    margin: 0;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  #root {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollba            </div>
            
            {/* 항공권 검색과 호텔 검색을 가로로 배치 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: 32 }}>
              {/* 항공권 검색 섹션 */}
              <div style={{ 
                flex: 1,
                border: '2px solid #e3f2fd',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>ne;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }
`;

// 스타일 태그 추가
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.innerHTML = hideScrollbarStyle;
  if (!document.head.querySelector('style[data-hide-scrollbar]')) {
    styleElement.setAttribute('data-hide-scrollbar', 'true');
    document.head.appendChild(styleElement);
  }
}

// 추천 결과를 HTML 문자열로 변환하는 함수 (이메일용)
function getRecommendationHtml(recommendation) {
  // ...existing code...
  const cards = parseRecommendation(recommendation);
  if (!cards.length) return '<div>추천 결과를 가져올 수 없습니다.</div>';
  return `
    <div style="width:100%;text-align:center;margin-bott              {/* 예상 비용 정보 - 좌측 30% */}
                   {/* 추천 이유 - 우측 70% */}
              <div style={{ 
                flex: '7',
                border: '2px solid #e8f5e8',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.1em', 
                  color: '#2e7d32', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>🌟 추천 이유</div>iv style={{ 
                flex: '3',
                border: '2px solid #e3f2fd',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.1em', 
                  color: '#6c757d', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>💰 예상 비용</div>      <h2 style="margin-bottom:12px;">추천 여행지 결과</h2>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
      ${cards.map(card => `
        <div style="width:420px;bac                          </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}fafdff;border-radius:16px;box-shadow:0 2px 12px rgba(25,118,210,0.06);border:1.5px solid #bcdffb;padding:28px 28px 22px 28px;margin-bottom:16px;text-align:left;font-size:1.13em;display:flex;flex-direction:column;gap:10px;">
          <div style="font-weight:bold;font-size:1.15em;margin-bottom:8px;color:#1976d2;">
            ${card.place || ''}
            ${card.airport_code ? `<span style="font-size:0.9em;color:#666;margin-left:8px;">(${card.airport_code})</span>` : ''}
          </div>
          ${card.flight ? `<div>항공료: <span style="font-weight:500;">${card.flight}</span></div>` : ''}
          ${card.hotel ? `<div>숙박비: <span style="font-weight:500;">${card.hotel}</span></div>` : ''}
          ${card.reason ? `<div style="margin-top:8px;color:#333;">추천이유: ${card.reason}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// Gemini 답변을 카드 정보 배열로 파싱하는 함수 (예시)
function parseRecommendation(raw) {
  if (!raw || typeof raw !== 'string') return [];
  if (raw.includes('조건에 맞는 여행지가 없습니다')) return [];
  // JSON 응답 파싱 시도
  try {
    // 백틱 포함 시 JSON만 추출
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : raw;
    const arr = JSON.parse(jsonStr);
    // place, flight, hotel, reason, local_price 등 포함
    if (Array.isArray(arr) && arr.length > 0 && arr[0].place) {
      return arr;
    }
  } catch (e) {
    // JSON 파싱 실패 시 기존 텍스트 파싱 fallback
  }

  // 기존 텍스트 파싱 (이전 Gemini 응답 호환)
  const blocks = raw.split(/\*\*\d+\. /).slice(1);
  const tempCards = blocks.map(block => {
    const placeMatch = block.match(/^([^\*\n]+)\*\*/);
    const place = placeMatch ? placeMatch[1].trim() : '';
    const flightMatch = block.match(/항공권 평균[:：]?\s*([^\n]+)/);
    const flight = flightMatch ? flightMatch[1].trim() : '';
    const hotelMatch = block.match(/숙박업소 평균[ (]*[\d박]*[):：]?\s*([^\n]+)/);
    const hotel = hotelMatch ? hotelMatch[1].trim() : '';
    const reasonMatch = block.match(/추천 이유[:：]?\s*([\s\S]*?)(?=\n|항공권 평균|숙박업소 평균|$)/);
    const reason = reasonMatch ? reasonMatch[1].replace(/\*\s+/g, '').replace(/\n+/g, ' ').trim() : '';
    return { place, flight, hotel, reason };
  });
  return tempCards.filter(card => card.place);
}

function ResultPage({ recommendation, email, onEmailChange, onSendEmail, emailSent, loading, onReset }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [origin, setOrigin] = useState('');
  const [hotelSite, setHotelSite] = useState('booking'); // 호텔 검색 사이트 선택 상태
  const detailRef = React.useRef();
  const cards = parseRecommendation(recommendation);

  // 우측 컨텐츠 애니메이션 자연스럽게 적용
  React.useEffect(() => {
    if (showDetail && detailRef.current) {
      detailRef.current.style.opacity = 0;
      detailRef.current.style.transform = 'translateY(60px)';
      requestAnimationFrame(() => {
        detailRef.current.style.opacity = 1;
        detailRef.current.style.transform = 'translateY(0)';
      });
    }
  }, [showDetail]);
  // 좌측 이동과 동시에 우측 컨텐츠 보여주기 (딜레이 없음)
  React.useEffect(() => {
    setShowDetail(selectedIdx !== null);
  }, [selectedIdx]);

  // 카드 스타일 객체
  const cardStyle = idx => ({
    width: 420,
    background: '#fafdff',
    borderRadius: 16,
    boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
    border: selectedIdx === idx ? '2.5px solid #1976d2' : '1.5px solid #bcdffb',
    borderLeft: selectedIdx === idx ? '8px solid #1976d2' : '1.5px solid #bcdffb',
    padding: '22px 22px 18px 22px',
    marginBottom: 14,
    textAlign: 'left',
    fontSize: '1.05em',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, transform 0.18s, border 0.18s',
    transform: 'translateY(0)',
  });

  // 상세 정보 박스 스타일
  const detailBoxStyle = {
    position: 'fixed',
    top: '76px', // 네비바 높이 + 여백
    right: '16px',
    width: 'calc(65vw - 32px)', // 좌우 여백을 고려한 너비 (5% 증가)
    height: 'calc(100vh - 92px)', // 네비바 높이를 고려한 높이
    background: '#fff',
    borderRadius: 12, // 약간의 둥근 모서리 복원
    boxShadow: '0 8px 32px rgba(25,118,210,0.13)',
    border: '2px solid #bcdffb', // 테두리 복원
    padding: '38px 38px 32px 38px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    overflow: 'hidden', // 전체 컨테이너 오버플로우 숨김
    // 스크롤바 숨기기
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE and Edge
  };

  // Skyscanner IATA 코드 변환 함수
  function getIataCode(str) {
    if (!str) return '';
    
    // 괄호 안의 IATA 코드 추출
    const match = str.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    
    // 한국 주요 공항 매핑
    const airportMap = {
      '인천': 'ICN',
      '인천공항': 'ICN',
      '김포': 'GMP', 
      '김포공항': 'GMP',
      '부산': 'PUS',
      '부산공항': 'PUS',
      '제주': 'CJU',
      '제주공항': 'CJU',
      '제주도': 'CJU',
      '대구': 'TAE',
      '대구공항': 'TAE',
      '광주': 'KWJ',
      '광주공항': 'KWJ',
      '울산': 'USN',
      '울산공항': 'USN',
      '청주': 'CJJ',
      '청주공항': 'CJJ',
      '양양': 'YNY',
      '양양공항': 'YNY',
      '여수': 'RSU',
      '여수공항': 'RSU',
      '포항': 'KPX',
      '포항공항': 'KPX'
    };
    
    // 해외 주요 도시 매핑 (Gemini가 추천할 수 있는 여행지들)
    const internationalMap = {
      '도쿄': 'NRT', '동경': 'NRT', 'tokyo': 'NRT',
      '오사카': 'KIX', 'osaka': 'KIX',
      '교토': 'KIX', 'kyoto': 'KIX', // 교토는 오사카 공항 이용
      '후쿠오카': 'FUK', 'fukuoka': 'FUK',
      '삿포로': 'CTS', 'sapporo': 'CTS',
      '방콕': 'BKK', 'bangkok': 'BKK',
      '치앙마이': 'CNX', 'chiang mai': 'CNX',
      '푸켓': 'HKT', 'phuket': 'HKT',
      '싱가포르': 'SIN', 'singapore': 'SIN',
      '쿠알라룸푸르': 'KUL', 'kuala lumpur': 'KUL',
      '호치민': 'SGN', 'ho chi minh': 'SGN',
      '다낭': 'DAD', 'da nang': 'DAD',
      '하노이': 'HAN', 'hanoi': 'HAN',
      '타이베이': 'TPE', 'taipei': 'TPE',
      '가오슝': 'KHH', 'kaohsiung': 'KHH',
      '홍콩': 'HKG', 'hong kong': 'HKG',
      '마카오': 'MFM', 'macau': 'MFM',
      '베이징': 'PEK', 'beijing': 'PEK',
      '상하이': 'PVG', 'shanghai': 'PVG',
      '시안': 'XIY', 'xian': 'XIY',
      '청두': 'CTU', 'chengdu': 'CTU',
      '괌': 'GUM', 'guam': 'GUM',
      '사이판': 'SPN', 'saipan': 'SPN',
      '세부': 'CEB', 'cebu': 'CEB',
      '보라카이': 'MPH', 'boracay': 'MPH', // 보라카이는 칼리보 공항
      '마닐라': 'MNL', 'manila': 'MNL',
      '발리': 'DPS', 'bali': 'DPS',
      '자카르타': 'CGK', 'jakarta': 'CGK'
    };
    
    // 입력된 문자열에서 공항/도시 이름 찾기
    const input = str.trim().toLowerCase();
    
    // 한국 공항 먼저 확인
    for (const [name, code] of Object.entries(airportMap)) {
      if (input.includes(name)) {
        return code;
      }
    }
    
    // 해외 도시 확인
    for (const [name, code] of Object.entries(internationalMap)) {
      if (input.includes(name)) {
        return code;
      }
    }
    
    // 이미 IATA 코드인 경우 (3글자 대문자)
    if (/^[A-Z]{3}$/.test(str.trim().toUpperCase())) {
      return str.trim().toUpperCase();
    }
    
    return '';
  }

  return (
    <>
      {/* 고정 네비게이션 바 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '24px',
        paddingRight: '24px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '1.8em',
          fontWeight: 'bold',
          color: '#1976d2'
        }}>
          TRIPTO
        </div>
      </div>
      
      {/* 메인 컨테이너 - 네비바 높이만큼 아래로 이동 */}
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 60px)', 
        maxHeight: 'calc(100vh - 60px)',
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'stretch',
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0
      }}>
      {/* 좌측: 서비스명+카드리스트 (중앙→좌측 이동) */}
      <div style={selectedIdx === null ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
      } : {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '35vw', // 좌측 크기 증가
        minWidth: 383,
        maxWidth: 646,
        marginTop: '1%',
        marginBottom: '1%',
        height: 'calc(100vh - 60px - 2%)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
        background: 'transparent',
        zIndex: 10,
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>추천 여행지 결과</h2>
        {cards.length > 0 ? (
          cards.map((card, idx) => (
            <div
              key={idx}
              ref={el => {
                if (selectedIdx === idx && el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              style={{
                width: 420,
                background: '#fafdff',
                borderRadius: 16,
                boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
                border: selectedIdx === idx ? '2.5px solid #1976d2' : '1.5px solid #bcdffb',
                borderLeft: selectedIdx === idx ? '8px solid #1976d2' : '1.5px solid #bcdffb',
                padding: '28px 28px 22px 28px',
                marginBottom: 16,
                textAlign: 'left',
                fontSize: '1.13em',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.18s, border 0.18s',
                transform: 'translateY(0)',
              }}
              onClick={() => setSelectedIdx(idx)}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-7px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(25,118,210,0.18)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)';
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '1.15em', marginBottom: 8, color: '#1976d2' }}>
                {card.place || `여행지 ${idx+1}`}
                {card.airport_code && <span style={{ fontSize: '0.9em', color: '#666', marginLeft: 8 }}>({card.airport_code})</span>}
              </div>
              {card.flight && <div>항공료: <span style={{ fontWeight: 500 }}>{card.flight}</span></div>}
              {card.hotel && <div>숙박비: <span style={{ fontWeight: 500 }}>{card.hotel}</span></div>}
              {card.reason && <div style={{ marginTop: 8, color: '#333' }}>추천이유: {card.reason}</div>}
            </div>
          ))
        ) : (
          <div style={{ fontSize: '1.1em', color: '#888', marginTop: 32 }}>추천 결과를 가져올 수 없습니다.</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: '2%' }}>
          <button onClick={onReset} style={{ padding: '12px 32px', fontSize: '1.1em', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            다시 추천받기
          </button>
        </div>
      </div>
      {/* 우측: 상세 정보 영역만 별도 박스에 추가 */}
      {showDetail && selectedIdx !== null && cards[selectedIdx] && (
        <div ref={detailRef} style={detailBoxStyle} className="hide-scrollbar">
          {/* 닫기 버튼 - 우측 상단 끝 */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <button 
              onClick={() => setSelectedIdx(null)} 
              onMouseEnter={(e) => {
                e.target.style.background = '#dc3545';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.color = '#000';
              }}
              style={{ 
                padding: '4px 8px', 
                fontSize: '1em', 
                borderRadius: 4, 
                background: '#fff', 
                color: '#000', 
                border: '1px solid #ddd', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                minWidth: '28px',
                height: '28px',
                transition: 'all 0.2s ease'
              }}
            >×</button>
          </div>
          
          {/* 제목 영역 */}
          <div style={{ 
            marginBottom: '24px',
            paddingBottom: '12px',
            borderBottom: '1px solid #ddd',
            textAlign: 'center',
            width: '100%'
          }}>
            <h2 style={{ 
              color: '#1976d2', 
              fontSize: '2.25em',
              margin: '0 auto',
              textAlign: 'center',
              display: 'block',
              width: '100%'
            }}>{cards[selectedIdx].place}</h2>
          </div>
          <div style={{ textAlign: 'center' }}>
            
            {/* 예상 비용 정보와 추천이유를 가로로 배치 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: 28, width: '100%' }}>
              {/* 예상 비용 정보 - 좌측 30% */}
              <div style={{ flex: '3' }}>
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.1em', 
                  color: '#6c757d', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>💰 예상 비용</div>
                <div style={{ 
                  fontSize: '1.08em', 
                  lineHeight: '1.8', 
                  padding: '16px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  border: '1px solid #e9ecef',
                  height: '200px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  textAlign: 'center', // 가로 중앙정렬
                  display: 'flex', // 세로 중앙정렬을 위한 flex
                  flexDirection: 'column',
                  justifyContent: 'center' // 세로 중앙정렬
                }}>
                  <div style={{ marginBottom: '8px' }}><b>항공료:</b> {cards[selectedIdx].flight || '-'}</div>
                  <div style={{ marginBottom: '8px' }}><b>숙박비:</b> {cards[selectedIdx].hotel || '-'}</div>
                </div>
              </div>
              
              {/* 추천이유 - 우측 70% */}
              <div style={{ flex: '7' }}>
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.1em', 
                  color: '#856404', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>✨ 추천이유</div>
                <div style={{ 
                  fontSize: '1.08em', 
                  lineHeight: '1.8', 
                  padding: '16px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '8px', 
                  border: '1px solid #ffeaa7',
                  height: '200px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  textAlign: 'center' // 중앙정렬 추가
                }}>
                  <div>{cards[selectedIdx].reason || '-'}</div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              marginBottom: 32,
              border: '2px solid #e3f2fd',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: '#fafafa',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {/* 항공권 검색 섹션 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  marginBottom: '12px', 
                  fontSize: '1.1em', 
                  color: '#1976d2', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>✈️ 항공권 검색</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '1.08em', marginRight: 8 }}>출발지</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="예: 인천, 김포, 부산, ICN, GMP, PUS 등"
                    style={{ width: 180, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #bcdffb', fontSize: '1em' }}
                  />
                  <button
                    onClick={() => {
                      const originCode = getIataCode(origin);
                      
                      // Gemini가 제공한 공항 코드 우선 사용, 없으면 기존 로직 사용
                      let destCode = '';
                      if (cards[selectedIdx].airport_code) {
                        destCode = cards[selectedIdx].airport_code;
                      } else {
                        // 기존 로직: 여행지 제목에서 도시명 추출
                        let destinationCity = cards[selectedIdx].place;
                        const cityMatch = destinationCity.match(/\(([^)]+)\)/);
                        if (cityMatch) {
                          destinationCity = cityMatch[1]; // 괄호 안의 도시명만 추출
                        }
                        
                        // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                        if (destinationCity.includes(',')) {
                          destinationCity = destinationCity.split(',')[0].trim();
                        }
                        
                        destCode = getIataCode(destinationCity);
                      }
                      
                      console.log('출발지 입력:', origin);
                      console.log('출발지 코드:', originCode);
                      console.log('여행지 전체:', cards[selectedIdx].place);
                      console.log('Gemini 공항 코드:', cards[selectedIdx].airport_code);
                      console.log('최종 도착지 코드:', destCode);
                      
                      if (!originCode) {
                        alert('출발지를 입력하세요. 예: 인천, 김포, 부산, ICN, GMP, PUS 등');
                        return;
                      }
                      
                      if (!destCode) {
                        alert(`도착지의 공항 코드를 찾을 수 없습니다. 직접 스카이스캐너에서 검색해주세요.`);
                        // 그래도 도시명으로 검색할 수 있도록 스카이스캐너 메인 페이지로 이동
                        window.open('https://www.skyscanner.co.kr/', '_blank');
                        return;
                      }
                      
                      const url = `https://www.skyscanner.co.kr/transport/flights/${originCode}/${destCode}/?adults=1`;
                      window.open(url, '_blank');
                    }}
                    style={{ padding: '8px 16px', fontSize: '0.95em', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >항공권 검색</button>
                </div>
              </div>
              </div>
              
              {/* 호텔 검색 섹션 */}
              <div style={{
                flex: 1,
                border: '2px solid #e8f5e8',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div>
                <div style={{ 
                  marginBottom: '12px', 
                  fontSize: '1.1em', 
                  color: '#003580', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>🏨 호텔 검색</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <select 
                    value={hotelSite}
                    onChange={(e) => setHotelSite(e.target.value)}
                    style={{ 
                      padding: '10px 12px', 
                      fontSize: '1.08em', 
                      borderRadius: 8, 
                      border: '2px solid #ddd', 
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    <option value="booking">부킹닷컴</option>
                    <option value="agoda">아고다</option>
                    <option value="expedia">익스피디아</option>
                    <option value="hotels">Hotels.com</option>
                  </select>
                  <button
                    onClick={() => {
                      // 여행지 제목에서 도시명 추출 (괄호 안의 내용)
                      let city = cards[selectedIdx].place;
                      const cityMatch = city.match(/\(([^)]+)\)/);
                      if (cityMatch) {
                        city = cityMatch[1]; // 괄호 안의 도시명만 추출
                      } else {
                        // 괄호가 없다면 IATA 코드 부분만 제거
                        city = city.replace(/\s*\([A-Z]{3}\)/, '').trim();
                      }
                      
                      // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                      if (city.includes(',')) {
                        city = city.split(',')[0].trim();
                      }
                      
                      console.log('호텔 검색 - 여행지 전체:', cards[selectedIdx].place);
                      console.log('호텔 검색 - 추출된 도시명:', city);
                      console.log('선택된 호텔 사이트:', hotelSite);
                      
                      // 선택된 사이트에 따라 URL 생성
                      let url = '';
                      switch(hotelSite) {
                        case 'booking':
                          url = `https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(city)}&lang=ko`;
                          break;
                        case 'agoda':
                          url = `https://www.agoda.com/ko-kr/search?dest=${encodeURIComponent(city)}&locale=ko-kr`;
                          break;
                        case 'expedia':
                          url = `https://www.expedia.co.kr/Hotel-Search?destination=${encodeURIComponent(city)}`;
                          break;
                        case 'hotels':
                          url = `https://kr.hotels.com/search.do?q-destination=${encodeURIComponent(city)}`;
                          break;
                        default:
                          url = `https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(city)}&lang=ko`;
                      }
                      
                      console.log('호텔 검색 URL:', url);
                      window.open(url, '_blank');
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.95em', 
                      borderRadius: 6, 
                      background: '#003580', 
                      color: '#fff', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {(() => {
                      // 버튼 텍스트용 도시명 추출
                      let city = cards[selectedIdx].place;
                      const cityMatch = city.match(/\(([^)]+)\)/);
                      if (cityMatch) {
                        city = cityMatch[1]; // 괄호 안의 도시명만 추출
                      } else {
                        // 괄호가 없다면 IATA 코드 부분만 제거
                        city = city.replace(/\s*\([A-Z]{3}\)/, '').trim();
                      }
                      
                      // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                      if (city.includes(',')) {
                        city = city.split(',')[0].trim();
                      }
                      
                      return (
                        <>
                          <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>{city}</span> 호텔 검색
                        </>
                      );
                    })()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default ResultPage;
export { getRecommendationHtml };