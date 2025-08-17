import React from 'react';

function ResultPage({ recommendation, email, onEmailChange, onSendEmail, emailSent, loading }) {
  return (
    <div>
      <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px', background: '#f9f9f9' }}>
        <input
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          style={{ marginRight: '8px', padding: '8px' }}
        />
        <button onClick={onSendEmail} disabled={loading || emailSent} style={{ padding: '8px 16px' }}>
          {emailSent ? '발송 완료' : '받아보기'}
        </button>
      </div>
      <h2>추천 여행지 결과</h2>
      <div style={{ whiteSpace: 'pre-line', fontSize: '1.1em', background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #eee' }}>
        {recommendation}
      </div>
    </div>
  );
}

export default ResultPage;
