import React, { useState, useRef, useEffect } from 'react';

// 추천 결과를 HTML 문자열로 변환하는 함수 (이메일용)
function getRecommendationHtml(recommendation) {
  const cards = parseRecommendation(recommendation);
  if (!cards.length) return '<div>추천 결과를 가져올 수 없습니다.</div>';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TRIPTO 여행지 추천</title>
      <style>
        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .travel-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .travel-table th { background-color: #e3f2fd; color: #1976d2; padding: 15px; text-align: left; font-weight: bold; border-bottom: 2px solid #1976d2; }
        .travel-table td { padding: 15px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        .travel-table tr:nth-child(even) { background-color: #fafafa; }
        .place-name { font-weight: bold; color: #1976d2; font-size: 1.1em; }
        .airport-code { color: #666; font-size: 0.9em; margin-left: 5px; }
        .price-info { font-weight: 500; color: #2e7d32; }
        .reason-text { color: #333; line-height: 1.6; max-width: 400px; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #666; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; overflow: hidden; }
        .summary-table th { background-color: #fff3cd; color: #856404; padding: 12px; text-align: center; font-weight: bold; }
        .summary-table td { padding: 10px; text-align: center; border-bottom: 1px solid #ffeaa7; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- 헤더 -->
        <div class="header">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌟 TRIPTO</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">맞춤형 여행지 추천 결과</p>
        </div>
        
        <!-- 본문 -->
        <div class="content">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">📋 추천 여행지 요약</h2>
          
          <!-- 요약 테이블 -->
          <table class="summary-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>여행지</th>
                <th>항공료</th>
                <th>숙박비</th>
                <th>공항코드</th>
              </tr>
            </thead>
            <tbody>
              ${cards.map((card, index) => `
                <tr>
                  <td><strong>${index + 1}</strong></td>
                  <td class="place-name">${card.place || '-'}</td>
                  <td class="price-info">${card.flight || '-'}</td>
                  <td class="price-info">${card.hotel || '-'}</td>
                  <td>${card.airport_code || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2 style="color: #333; margin: 30px 0 20px 0; text-align: center;">📝 상세 추천 이유</h2>
          
          <!-- 상세 정보 테이블 -->
          <table class="travel-table">
            <thead>
              <tr>
                <th style="width: 25%;">여행지</th>
                <th style="width: 20%;">비용 정보</th>
                <th style="width: 55%;">추천 이유</th>
              </tr>
            </thead>
            <tbody>
              ${cards.map((card, index) => `
                <tr>
                  <td>
                    <div class="place-name">${index + 1}. ${card.place || ''}</div>
                    ${card.airport_code ? `<div class="airport-code">✈️ ${card.airport_code}</div>` : ''}
                  </td>
                  <td>
                    ${card.flight ? `<div style="margin-bottom: 8px;"><strong>항공료:</strong><br><span class="price-info">${card.flight}</span></div>` : ''}
                    ${card.hotel ? `<div><strong>숙박비:</strong><br><span class="price-info">${card.hotel}</span></div>` : ''}
                  </td>
                  <td>
                    <div class="reason-text">${card.reason || '추천 이유가 제공되지 않았습니다.'}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- 푸터 -->
        <div class="footer">
          <p style="margin: 0; font-size: 14px;">
            💝 즐거운 여행 되세요! | TRIPTO와 함께하는 스마트한 여행 계획
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">
            이 추천은 AI 분석을 통해 생성되었습니다.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Gemini 답변을 카드 정보 배열로 파싱하는 함수
function parseRecommendation(raw) {
  if (!raw || typeof raw !== 'string') return [];
  if (raw.includes('조건에 맞는 여행지가 없습니다')) return [];
  
  // JSON 응답 파싱 시도
  try {
    // 백틱 포함 시 JSON만 추출
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : raw;
    const arr = JSON.parse(jsonStr);
    // place, flight, hotel, reason, airport_code 등 포함
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
  
  // 해외 주요 도시 매핑
  const internationalMap = {
    '도쿄': 'NRT', '동경': 'NRT', 'tokyo': 'NRT',
    '오사카': 'KIX', 'osaka': 'KIX',
    '교토': 'KIX', 'kyoto': 'KIX',
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
    '보라카이': 'MPH', 'boracay': 'MPH',
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

function ResultPage({ recommendation, email, onEmailChange, onSendEmail, emailSent, loading, onReset }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [origin, setOrigin] = useState('');
  const [hotelSite, setHotelSite] = useState('booking');
  const [isEmailSending, setIsEmailSending] = useState(false);
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

  const handleCardClick = (idx) => {
    setSelectedIdx(idx);
  };

  const handleClose = () => {
    setSelectedIdx(null);
  };

  const handleEmailSend = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    setIsEmailSending(true);
    try {
      const htmlContent = getRecommendationHtml(recommendation);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: '여행 추천 결과',
          html: htmlContent
        }),
      });
      alert('이메일이 성공적으로 전송되었습니다!');
    } catch (error) {
      console.error('이메일 전송 오류:', error);
      alert('이메일 전송에 실패했습니다.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleOriginChange = (value) => {
    setOrigin(value);
  };

  const handleHotelSiteChange = (value) => {
    setHotelSite(value);
  };

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
        
        {/* 이메일 입력 영역 - 카드 중앙정렬 상태에서만 표시 */}
        {selectedIdx === null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: 'auto'
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                width: '200px'
              }}
            />
            <button
              onClick={() => onSendEmail()}
              disabled={emailSent || loading || !email.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: emailSent || loading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: emailSent || loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {emailSent ? '전송완료' : loading ? '전송 중...' : '이메일로 받기'}
            </button>
          </div>
        )}
      </div>
      
      {/* 메인 컨테이너 */}
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
        
        {/* 좌측 영역 - 카드 리스트 */}
        <div style={selectedIdx === null ? {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          minHeight: '100vh',
          paddingTop: '20px',
          paddingBottom: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
        } : {
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '29vw',
          minWidth: 280,
          maxWidth: 646,
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          background: '#ffffff',
          zIndex: 10,
          padding: '20px 16px',
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: 24, 
            color: '#1976d2',
            fontSize: '1.5em',
            fontWeight: 'bold'
          }}>추천 여행지 결과</h2>
          
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
                  width: '320px',
                  maxWidth: '320px',
                  background: '#fafdff',
                  borderRadius: 16,
                  boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
                  border: '2.5px solid',
                  borderColor: selectedIdx === idx ? '#1976d2' : '#bcdffb',
                  borderLeft: selectedIdx === idx ? '8px solid #1976d2' : '2.5px solid #bcdffb',
                  padding: '16px 16px 14px 16px',
                  marginBottom: 16,
                  textAlign: 'left',
                  fontSize: '1.05em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.18s, border-color 0.18s',
                  transform: 'translateY(0)',
                  boxSizing: 'border-box'
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
                {card.reason && (
                  <div style={{ marginTop: 8, color: '#333', fontSize: '0.95em' }}>
                    {card.reason.length > 80 ? `${card.reason.substring(0, 80)}...` : card.reason}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '1.1em', color: '#888', marginTop: 32 }}>추천 결과를 가져올 수 없습니다.</div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: '2%' }}>
            <button onClick={onReset} style={{ 
              padding: '12px 32px', 
              fontSize: '1.1em', 
              borderRadius: 8, 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              marginBottom: '30px'
            }}>
              다시 추천받기
            </button>
          </div>
        </div>

        {/* 우측: 상세 정보 영역 */}
        {showDetail && selectedIdx !== null && cards[selectedIdx] && (
          <div ref={detailRef} style={{
            position: 'fixed',
            top: '76px',
            right: '16px',
            width: 'calc(70vw - 32px)',
            height: 'calc(100vh - 92px)',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(25,118,210,0.13)',
            border: '2px solid #bcdffb',
            padding: '38px 38px 32px 38px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* 닫기 버튼 */}
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
            
            <div style={{ textAlign: 'center', width: '100%' }}>
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
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
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
                    textAlign: 'center'
                  }}>
                    <div>{cards[selectedIdx].reason || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* 항공권 및 호텔 검색 */}
              <div style={{ 
                marginBottom: 32,
                border: '2px solid #e3f2fd',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {/* 가로 배치 컨테이너 */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                  {/* 항공권 검색 섹션 */}
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #e3f2fd',
                    borderRadius: '10px',
                    backgroundColor: '#f8fcff',
                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.1)'
                  }}>
                    <div style={{ 
                      marginBottom: '16px', 
                      fontSize: '1.1em', 
                      color: '#1976d2', 
                      fontWeight: 'bold', 
                      textAlign: 'center'
                    }}>✈️ 항공권 검색</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '1.08em', marginRight: 8 }}>출발지</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        placeholder="예: 인천, 김포, 부산"
                        style={{ width: 160, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #bcdffb', fontSize: '1em' }}
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
                  
                  {/* 호텔 검색 섹션 */}
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #e8f5e8',
                    borderRadius: '10px',
                    backgroundColor: '#f8fff8',
                    boxShadow: '0 1px 4px rgba(0, 53, 128, 0.1)'
                  }}>
                    <div style={{ 
                      marginBottom: '16px', 
                      fontSize: '1.1em', 
                      color: '#003580', 
                      fontWeight: 'bold', 
                      textAlign: 'center'
                    }}>🏨 호텔 검색</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
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
          </div>
        )}
      </div>
    </>
  );
}

export default ResultPage;
export { getRecommendationHtml };
