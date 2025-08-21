import React, { useState, useRef, useEffect } from 'react';
import NavBar from './components/NavBar';
import TravelCard from './components/TravelCard';
import DetailPanel from './components/DetailPanel';
import { sendEmail } from './utils/emailUtils';

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
    scrollbar-width: none;  /* Firefox */
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

// JSON 형태의 추천 결과를 파싱하는 함수
function parseRecommendation(recommendation) {
  try {
    if (typeof recommendation === 'string') {
      const cleanedRecommendation = recommendation.trim();
      
      if (cleanedRecommendation.startsWith('```json')) {
        const jsonMatch = cleanedRecommendation.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1].trim());
        }
      }
      
      if (cleanedRecommendation.startsWith('{') || cleanedRecommendation.startsWith('[')) {
        return JSON.parse(cleanedRecommendation);
      }
      
      return parseTextRecommendation(cleanedRecommendation);
    }
    
    if (Array.isArray(recommendation)) {
      return recommendation;
    }
    
    return [];
  } catch (error) {
    console.error('추천 결과 파싱 오류:', error);
    return parseTextRecommendation(recommendation);
  }
}

// 텍스트 형태의 추천 결과를 파싱하는 함수
function parseTextRecommendation(text) {
  const destinations = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentDestination = {};
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^\d+\./)) {
      if (Object.keys(currentDestination).length > 0) {
        destinations.push(currentDestination);
      }
      currentDestination = {
        place: trimmedLine.replace(/^\d+\.\s*/, '').replace(/[*#]/g, '').trim()
      };
    } else if (trimmedLine.includes('항공료') || trimmedLine.includes('항공비')) {
      const match = trimmedLine.match(/([0-9,]+원|[0-9,]+\$|USD?\s*[0-9,]+|\$[0-9,]+)/);
      if (match) {
        currentDestination.flight = match[0];
      }
    } else if (trimmedLine.includes('숙박') || trimmedLine.includes('호텔')) {
      const match = trimmedLine.match(/([0-9,]+원|[0-9,]+\$|USD?\s*[0-9,]+|\$[0-9,]+)/);
      if (match) {
        currentDestination.hotel = match[0];
      }
    } else if (trimmedLine.includes('식비') || trimmedLine.includes('음식')) {
      const match = trimmedLine.match(/([0-9,]+원|[0-9,]+\$|USD?\s*[0-9,]+|\$[0-9,]+)/);
      if (match) {
        currentDestination.food = match[0];
      }
    } else if (trimmedLine.includes('액티비티') || trimmedLine.includes('활동')) {
      const match = trimmedLine.match(/([0-9,]+원|[0-9,]+\$|USD?\s*[0-9,]+|\$[0-9,]+)/);
      if (match) {
        currentDestination.activity = match[0];
      }
    } else if (trimmedLine.includes('총') || trimmedLine.includes('전체') || trimmedLine.includes('총합')) {
      const match = trimmedLine.match(/([0-9,]+원|[0-9,]+\$|USD?\s*[0-9,]+|\$[0-9,]+)/);
      if (match) {
        currentDestination.total = match[0];
      }
    } else if (trimmedLine.includes('추천') && trimmedLine.includes('이유')) {
      currentDestination.reason = trimmedLine.replace(/.*추천\s*이유\s*:?\s*/i, '');
    } else if (trimmedLine.length > 20 && !trimmedLine.includes(':') && currentDestination.place && !currentDestination.reason) {
      currentDestination.reason = trimmedLine;
    }
  });
  
  if (Object.keys(currentDestination).length > 0) {
    destinations.push(currentDestination);
  }
  
  return destinations.length > 0 ? destinations : [
    { place: "파싱 오류", reason: "추천 결과를 파싱할 수 없습니다." }
  ];
}

// 공항 코드 매핑
const airportCodes = {
  '도쿄': 'NRT',
  '일본': 'NRT',
  '오사카': 'KIX',
  '교토': 'KIX',
  '파리': 'CDG',
  '프랑스': 'CDG',
  '런던': 'LHR',
  '영국': 'LHR',
  '뉴욕': 'JFK',
  '미국': 'JFK',
  '로스앤젤레스': 'LAX',
  'LA': 'LAX',
  '방콕': 'BKK',
  '태국': 'BKK',
  '싱가포르': 'SIN',
  '홍콩': 'HKG',
  '대만': 'TPE',
  '타이베이': 'TPE',
  '베트남': 'SGN',
  '호치민': 'SGN',
  '하노이': 'HAN',
  '필리핀': 'MNL',
  '마닐라': 'MNL',
  '세부': 'CEB',
  '말레이시아': 'KUL',
  '쿠알라룸푸르': 'KUL',
  '인도네시아': 'CGK',
  '자카르타': 'CGK',
  '발리': 'DPS',
  '중국': 'PEK',
  '베이징': 'PEK',
  '상하이': 'PVG',
  '시안': 'XIY',
  '청두': 'CTU',
  '호주': 'SYD',
  '시드니': 'SYD',
  '멜버른': 'MEL',
  '뉴질랜드': 'AKL',
  '오클랜드': 'AKL',
  '스페인': 'MAD',
  '마드리드': 'MAD',
  '바르셀로나': 'BCN',
  '이탈리아': 'FCO',
  '로마': 'FCO',
  '밀라노': 'MXP',
  '독일': 'FRA',
  '프랑크푸르트': 'FRA',
  '베를린': 'BER',
  '네덜란드': 'AMS',
  '암스테르담': 'AMS',
  '스위스': 'ZUR',
  '취리히': 'ZUR',
  '터키': 'IST',
  '이스탄불': 'IST',
  '그리스': 'ATH',
  '아테네': 'ATH',
  '체코': 'PRG',
  '프라하': 'PRG',
  '오스트리아': 'VIE',
  '비엔나': 'VIE',
  '헝가리': 'BUD',
  '부다페스트': 'BUD',
  '폴란드': 'WAW',
  '바르샤바': 'WAW',
  '러시아': 'SVO',
  '모스크바': 'SVO',
  '캐나다': 'YVR',
  '밴쿠버': 'YVR',
  '토론토': 'YYZ',
  '브라질': 'GRU',
  '상파울루': 'GRU',
  '리우데자네이루': 'GIG',
  '아르헨티나': 'EZE',
  '부에노스아이레스': 'EZE',
  '칠레': 'SCL',
  '산티아고': 'SCL',
  '페루': 'LIM',
  '리마': 'LIM',
  '멕시코': 'MEX',
  '멕시코시티': 'MEX',
  '이집트': 'CAI',
  '카이로': 'CAI',
  '남아프리카공화국': 'CPT',
  '케이프타운': 'CPT',
  '요하네스버그': 'JNB',
  '모로코': 'CMN',
  '카사블랑카': 'CMN',
  '인도': 'DEL',
  '뉴델리': 'DEL',
  '뭄바이': 'BOM',
  '네팔': 'KTM',
  '카트만두': 'KTM',
  '스리랑카': 'CMB',
  '콜롬보': 'CMB',
  '몰디브': 'MLE',
  '말레': 'MLE',
  '두바이': 'DXB',
  'UAE': 'DXB',
  '사우디아라비아': 'RUH',
  '리야드': 'RUH',
  '카타르': 'DOH',
  '도하': 'DOH',
  '이스라엘': 'TLV',
  '텔아비브': 'TLV',
  '요단': 'AMM',
  '암만': 'AMM'
};

function ResultPage({ recommendation, answers, currentQuestion, onGoBack }) {
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showDetail, setShowDetail] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [origin, setOrigin] = useState('ICN');
  const [hotelSite, setHotelSite] = useState('booking');
  const sidebarRef = useRef(null);

  const cards = parseRecommendation(recommendation);

  // 공항 코드 추가
  const cardsWithAirport = cards.map(card => ({
    ...card,
    airport_code: airportCodes[card.place] || airportCodes[card.place?.split(',')[0]?.trim()] || null
  }));

  const handleCardClick = (idx) => {
    setSelectedIdx(idx);
    setShowDetail(true);
  };

  const handleEmailSend = async () => {
    const email = prompt('이메일 주소를 입력해주세요:');
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsEmailSending(true);
    try {
      const result = await sendEmail(cardsWithAirport, email);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('이메일 전송 중 오류가 발생했습니다.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const containerStyle = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  };

  const mainContentStyle = {
    display: 'flex',
    flex: 1,
    height: 'calc(100vh - 60px)',
    overflow: 'hidden'
  };

  const leftSideStyle = {
    width: '35vw',
    height: '100%',
    padding: '24px 20px 24px 24px',
    background: 'linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const rightSideStyle = {
    width: '65vw',
    height: '100%',
    position: 'relative',
    background: '#fff'
  };

  const titleStyle = {
    fontSize: '1.4em',
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1976d2',
    textAlign: 'center',
    borderBottom: '2px solid #e3f2fd',
    paddingBottom: 12
  };

  const scrollableCardContainer = {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '8px'
  };

  const backButtonStyle = {
    background: 'linear-gradient(135deg, #757575 0%, #616161 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    marginTop: '20px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(117,117,117,0.3)'
  };

  const placeholderStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#999',
    fontSize: '1.2em'
  };

  return (
    <div style={containerStyle}>
      <NavBar />
      
      <div style={mainContentStyle}>
        <div style={leftSideStyle}>
          <div style={titleStyle}>🌟 맞춤 여행지 추천 결과</div>
          
          <div 
            ref={sidebarRef}
            style={scrollableCardContainer}
            className="hide-scrollbar"
          >
            {cardsWithAirport.map((card, idx) => (
              <TravelCard
                key={idx}
                card={card}
                idx={idx}
                selectedIdx={selectedIdx}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          
          <button
            style={backButtonStyle}
            onClick={onGoBack}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(117,117,117,0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(117,117,117,0.3)';
            }}
          >
            ← 설문으로 돌아가기
          </button>
        </div>

        <div style={rightSideStyle}>
          {!showDetail && (
            <div style={placeholderStyle}>
              <div style={{ fontSize: '3em', marginBottom: '16px' }}>✈️</div>
              <div>여행지를 선택하면 상세 정보를 확인할 수 있습니다</div>
            </div>
          )}
          
          <DetailPanel
            selectedCard={cardsWithAirport[selectedIdx]}
            showDetail={showDetail}
            onClose={() => setShowDetail(false)}
            onEmailSend={handleEmailSend}
            isEmailSending={isEmailSending}
            origin={origin}
            onOriginChange={setOrigin}
            hotelSite={hotelSite}
            onHotelSiteChange={setHotelSite}
          />
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
