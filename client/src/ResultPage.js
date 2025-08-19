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
  const cards = parseRecommendation(recommendation);
  const [selectedIdx, setSelectedIdx] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: 480 }}>
      {/* 왼쪽: 카드 리스트 (슬라이드 효과) */}
      <div style={{
        flex: selectedIdx !== null ? '0 0 440px' : '1 1 100%',
        transition: 'flex 0.5s cubic-bezier(.77,0,.18,1)',
        overflow: 'hidden',
        paddingRight: selectedIdx !== null ? 24 : 0,
        minWidth: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          marginTop: 12,
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>추천 여행지 결과</h2>
          {cards.length > 0 ? (
            cards.map((card, idx) => (
              <div key={idx} style={{
                width: 420,
                background: '#fafdff',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
                border: '1.5px solid #bcdffb',
                padding: '28px 28px 22px 28px',
                marginBottom: 16,
                textAlign: 'left',
                fontSize: '1.13em',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
              }}
                onClick={() => setSelectedIdx(idx)}
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button onClick={onReset} style={{ padding: '12px 32px', fontSize: '1.1em', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              다시 추천받기
            </button>
          </div>
        </div>
      </div>
      {/* 오른쪽: 상세 정보 영역 */}
      <div style={{
        flex: selectedIdx !== null ? '1 1 0%' : '0 0 0%',
        transition: 'flex 0.5s cubic-bezier(.77,0,.18,1)',
        background: '#fff',
        borderLeft: selectedIdx !== null ? '2px solid #bcdffb' : 'none',
        minWidth: selectedIdx !== null ? 320 : 0,
        maxWidth: 600,
        padding: selectedIdx !== null ? '36px 32px' : 0,
        overflow: 'auto',
        boxShadow: selectedIdx !== null ? '-2px 0 12px rgba(25,118,210,0.06)' : 'none',
        display: selectedIdx !== null ? 'block' : 'none',
      }}>
        {selectedIdx !== null && cards[selectedIdx] && (
          <div>
            <h2 style={{ color: '#1976d2', marginBottom: 18 }}>{cards[selectedIdx].place}</h2>
            <div style={{ fontSize: '1.08em', marginBottom: 12 }}>
              <b>항공료:</b> {cards[selectedIdx].flight || '-'}<br />
              <b>숙박비:</b> {cards[selectedIdx].hotel || '-'}<br />
              <b>추천이유:</b> {cards[selectedIdx].reason || '-'}
            </div>
            {/* 상세 정보 컨텐츠는 추후 추가 예정 */}
            <div style={{ marginTop: 32, color: '#888' }}>[여행지 상세 정보 영역 - 추후 컨텐츠 추가]</div>
            <button onClick={() => setSelectedIdx(null)} style={{ marginTop: 36, padding: '10px 28px', fontSize: '1em', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>닫기</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
export { getRecommendationHtml };