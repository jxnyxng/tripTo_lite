import React, { useState } from 'react';
import surveyQuestions from './surveyQuestions';
import ResultPage from './ResultPage';


function App() {
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // 설문 답변 변경 핸들러
  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // 설문 제출
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      alert('분석 요청 실패');
    }
    setLoading(false);
  };

  // 이메일 전송
  const handleSendEmail = async () => {
    if (!email) {
      alert('이메일을 입력하세요');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/send_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, result: recommendation })
      });
      setEmailSent(true);
      alert('이메일이 발송되었습니다!');
    } catch (err) {
      alert('이메일 발송 실패');
    }
    setLoading(false);
  };

  // 이메일 입력 핸들러
  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailSent(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>여행지 추천 설문</h1>
      {!recommendation ? (
        <form onSubmit={handleSurveySubmit}>
          {surveyQuestions.map(q => (
            <div key={q.id} style={{ marginBottom: 16 }}>
              <label>{q.question}</label><br />
              {q.type === 'text' && (
                <input
                  type="text"
                  value={answers[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                />
              )}
              {q.type === 'number' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    style={{ width: '100%', padding: 8 }}
                  />
                  <span style={{ marginLeft: 7 }}>만원</span>
                </div>
              )}
              {q.type === 'select' && (
                <select
                  value={answers[q.id] || ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="">선택하세요</option>
                  {q.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
            {loading ? '분석 중...' : '설문 제출'}
          </button>
        </form>
      ) : (
        <ResultPage
          recommendation={recommendation}
          email={email}
          onEmailChange={handleEmailChange}
          onSendEmail={handleSendEmail}
          emailSent={emailSent}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;
