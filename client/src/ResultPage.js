import React from 'react';

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
  const cards = blocks.map(block => {
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
  return cards.filter(card => card.place);
}

function ResultPage({ recommendation, email, onEmailChange, onSendEmail, emailSent, loading, onReset }) {
  const cards = parseRecommendation(recommendation);
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1.5px solid #bcdffb',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
        padding: '18px 24px',
        marginBottom: '18px',
        background: '#fafdff',
        gap: '12px',
        width: '100%',
        maxWidth: 420,
        margin: '0 auto 18px auto',
      }}>
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          style={{ marginRight: 0, padding: '10px 14px', borderRadius: 8, border: '1px solid #bcdffb', fontSize: '1em', outline: 'none', flex: 1, background: '#fff' }}
        />
        <button
          onClick={onSendEmail}
          disabled={loading || emailSent}
          style={{
            padding: '10px 24px',
            background: loading || emailSent ? '#90caf9' : '#1976d2',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.08em',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            cursor: loading || emailSent ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            minWidth: 110,
          }}
        >
          {emailSent ? '발송 완료' : '받아보기'}
        </button>
      </div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>추천 여행지 결과</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
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
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.15em', marginBottom: 8, color: '#1976d2' }}>{card.place || `여행지 ${idx+1}`}</div>
              {card.flight && <div>항공료: <span style={{ fontWeight: 500 }}>{card.flight}</span></div>}
              {card.hotel && <div>숙박비: <span style={{ fontWeight: 500 }}>{card.hotel}</span></div>}
              {card.reason && <div style={{ marginTop: 8, color: '#333' }}>추천이유: {card.reason}</div>}
              {/* 기타 정보도 추가 가능 */}
            </div>
          ))
        ) : (
          <div style={{ fontSize: '1.1em', color: '#888', marginTop: 32 }}>추천 결과를 가져올 수 없습니다.</div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button onClick={onReset} style={{ padding: '12px 32px', fontSize: '1.1em', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          다시 추천받기
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
