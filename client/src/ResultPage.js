import React from 'react';

// 추천 결과를 HTML 문자열로 변환하는 함수 (이메일용)
function getRecommendationHtml(recommendation) {
  // ...existing code...
  const cards = parseRecommendation(recommendation);
  if (!cards.length) return '<div>추천 결과를 가져올 수 없습니다.</div>';
  return `
    <div style="width:100%;text-align:center;margin-bottom:24px;">
      <h2 style="margin-bottom:12px;">추천 여행지 결과</h2>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
      ${cards.map(card => `
        <div style="width:420px;background:#fafdff;border-radius:16px;box-shadow:0 2px 12px rgba(25,118,210,0.06);border:1.5px solid #bcdffb;padding:28px 28px 22px 28px;margin-bottom:16px;text-align:left;font-size:1.13em;display:flex;flex-direction:column;gap:10px;">
          <div style="font-weight:bold;font-size:1.15em;margin-bottom:8px;color:#1976d2;">${card.place || ''}</div>
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
  const [selectedIdx, setSelectedIdx] = React.useState(null);
  const [showDetail, setShowDetail] = React.useState(false);
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

  // 우측 컨텐츠 스타일 객체를 useState 이후, return문 바로 위에서 동적으로 생성
  const detailBoxStyle = {
    position: 'fixed',
    top: '1.5vw',
    right: '1.5vw',
    width: 'calc(60vw - 3vw)',
    minWidth: 480,
    maxWidth: 1024,
    height: 'calc(100vh - 3vw)',
    background: '#fff',
    borderRadius: '24px',
    border: '2px solid #1976d2',
    boxShadow: '0 4px 32px rgba(25,118,210,0.13)',
    padding: '36px 32px',
    overflowY: 'auto',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 1s cubic-bezier(.77,0,.18,1), opacity 1s cubic-bezier(.77,0,.18,1)',
    opacity: showDetail ? 1 : 0,
    transform: showDetail ? 'translateY(0)' : 'translateY(60px)',
  };

  // 좌측이 이동한 뒤 0.3초 후에 우측 컨텐츠 보여주기
  React.useEffect(() => {
    if (selectedIdx !== null) {
      const timer = setTimeout(() => setShowDetail(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowDetail(false);
    }
  }, [selectedIdx]);
  return (
    <div style={{ width: '100%', minHeight: '100vh', overflow: 'visible' }}>
      {/* 전체 컨텐츠 래퍼: 서비스명+카드리스트 포함, 중앙→좌측 이동 */}
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
        width: '36.7vw',
        minWidth: 383,
        maxWidth: 646,
        marginTop: '1%',
        marginBottom: '1%',
        height: 'calc(100vh - 2%)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxSizing: 'border-box',
        background: 'transparent',
        zIndex: 10,
      }}>
        {/* 서비스 이름 */}
        <div style={{
          width: 420,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '2.2em',
          letterSpacing: '0.12em',
          color: '#1976d2',
          marginBottom: 32,
          fontFamily: 'Montserrat, Arial, sans-serif',
        }}>
          TRIPTO
        </div>
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
              <div style={{ fontWeight: 'bold', fontSize: '1.15em', marginBottom: 8, color: '#1976d2' }}>{card.place || `여행지 ${idx+1}`}</div>
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
      {/* 오른쪽: 상세 정보 영역 (화면에 고정된 카드) */}
      {showDetail && selectedIdx !== null && cards[selectedIdx] && (
        <div
          ref={detailRef}
          style={detailBoxStyle}
        >
          <h2 style={{ color: '#1976d2', marginBottom: 18, fontSize: '2.25em' }}>{cards[selectedIdx].place}</h2>
          <div style={{ fontSize: '1.08em', marginBottom: 12 }}>
            <b>항공료:</b> {cards[selectedIdx].flight || '-'}<br />
            <b>숙박비:</b> {cards[selectedIdx].hotel || '-'}<br />
            <b>추천이유:</b> {cards[selectedIdx].reason || '-'}
          </div>
          {/* 상세 정보 컨텐츠는 추후 추가 예정 */}
          <div style={{ marginTop: 32, color: '#888' }}>[여행지 상세 정보 영역 - 추후 컨텐츠 추가]</div>
          <button onClick={() => setSelectedIdx(null)} style={{ marginTop: 36, padding: '10px 28px', fontSize: '1em', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end' }}>닫기</button>
        </div>
      )}
    </div>
  );
}

export default ResultPage;
export { getRecommendationHtml };