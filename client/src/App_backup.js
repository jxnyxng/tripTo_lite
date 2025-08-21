import React, { useState, useEffect } from 'react';
import surveyQuestions from './surveyQuestions';
import ResultPage from './ResultPage';


function App() {
  // 모든 useState 선언을 최상단에 위치
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('tripto_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [email, setEmail] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // useEffect는 useState 선언 이후에 위치
  useEffect(() => {
    if (recommendation) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [recommendation]);

  // 설문 답변 변경 핸들러
  // 단일/다중 선택 핸들러
  const handleChange = (id, value, optionType) => {
    let newAnswers;
    if (optionType === 'checkbox') {
      newAnswers = (() => {
        const prevArr = Array.isArray(answers[id]) ? answers[id] : [];
        if (prevArr.includes(value)) {
          // 선택 해제
          return { ...answers, [id]: prevArr.filter(v => v !== value) };
        } else {
          // 선택 추가
          return { ...answers, [id]: [...prevArr, value] };
        }
      })();
    } else {
      newAnswers = { ...answers, [id]: value };
    }
    setAnswers(newAnswers);
    // localStorage에 저장
    try {
      localStorage.setItem('tripto_answers', JSON.stringify(newAnswers));
    } catch {}
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

  // 설문 초기화 시 localStorage도 초기화
  const handleReset = () => {
    setRecommendation(null);
    setAnswers(prev => prev); // 이전 선택 유지
    setEmailSent(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      {!recommendation ? (
        <React.Fragment>
          {/* 서비스명 상단 표시 */}
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '2em', color: '#1976d2', letterSpacing: '0.02em', margin: 0 }}>TripTo</h1>
          </div>
          <form onSubmit={handleSurveySubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              border: '1.5px solid #bcdffb',
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
              padding: '32px 24px 24px 24px',
              marginBottom: 18,
              background: '#fafdff',
            }}>
            {/* 최상단 국내/해외 체크박스(q0) - 중복 선택 가능 */}
            {(() => {
              const q = surveyQuestions.find(q => q.id === 'q0');
              return (
                <div key={q.id} style={{ marginBottom: 36, textAlign: 'center', width: '100%' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '1.13em', display: 'inline-block', marginBottom: 10 }}>{q.question}</label><br />
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: 12 }}>
                    {q.options.map(opt => (
                      <label key={opt} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 48,
                        border: Array.isArray(answers[q.id]) && answers[q.id].includes(opt) ? '2px solid #1976d2' : '1px solid #ccc',
                        borderRadius: 8,
                        background: Array.isArray(answers[q.id]) && answers[q.id].includes(opt) ? '#e3f2fd' : '#fff',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      }}>
                        <input
                          type="checkbox"
                          checked={Array.isArray(answers[q.id]) ? answers[q.id].includes(opt) : false}
                          onChange={() => handleChange(q.id, opt, q.type)}
                          style={{ display: 'none' }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 다지선다(checkbox) 문항(q0 제외) 렌더링 */}
            {surveyQuestions.filter(q => q.type === 'checkbox' && q.id !== 'q0').map(q => (
              <div key={q.id} style={{ marginBottom: 36, textAlign: 'center', width: '100%' }}>
                <label style={{ fontWeight: 'bold', fontSize: '1.1em', display: 'inline-block', marginBottom: 8 }}>{q.question}</label><br />
                <div style={{ display: 'flex', gap: '16px', marginTop: 12, overflowX: 'auto', justifyContent: 'center', width: '100%' }}>
                  {q.options.map(opt => (
                    <label key={opt} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 120,
                      height: 48,
                      border: Array.isArray(answers[q.id]) && answers[q.id].includes(opt) ? '2px solid #1976d2' : '1px solid #ccc',
                      borderRadius: 8,
                      background: Array.isArray(answers[q.id]) && answers[q.id].includes(opt) ? '#e3f2fd' : '#fff',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '1em',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.id]) ? answers[q.id].includes(opt) : false}
                        onChange={() => handleChange(q.id, opt, q.type)}
                        style={{ display: 'none' }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* 다지선다와 입력폼 사이 구분선 */}
            <div style={{ width: '100%', borderTop: '1px solid #bcdffb', margin: '18px 0 24px 0' }} />

            {/* 총예산(q4)과 인원수(q4_1) 입력폼을 나란히 렌더링 */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'flex-start', marginBottom: 36, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ display: 'inline-block', marginBottom: 14, fontWeight: 'bold', fontSize: '1.08em' }}>여행 총예산을 입력하세요.</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="number"
                    value={answers['q4'] || ''}
                    onChange={e => handleChange('q4', e.target.value, 'number')}
                    style={{ width: 100, padding: '10px 8px', textAlign: 'center', borderRadius: 10, border: '1px solid #bbb', boxSizing: 'border-box' }}
                  />
                  <span style={{ marginLeft: 7 }}>만원</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ display: 'inline-block', marginBottom: 14, fontWeight: 'bold', fontSize: '1.08em' }}>여행 인원수를 입력하세요.</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="number"
                    value={answers['q4_1'] || ''}
                    onChange={e => handleChange('q4_1', e.target.value, 'number')}
                    style={{ width: 100, padding: '10px 8px', textAlign: 'center', borderRadius: 10, border: '1px solid #bbb', boxSizing: 'border-box' }}
                  />
                  <span style={{ marginLeft: 7 }}>명</span>
                </div>
              </div>
            </div>

            {/* 나머지 문항 렌더링 */}
            {surveyQuestions.filter(q => q.type !== 'checkbox' && q.id !== 'q4' && q.id !== 'q4_1').map(q => (
              <div key={q.id} style={{ marginBottom: 36, textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <label style={{ display: 'inline-block', marginBottom: 14, fontWeight: 'bold', fontSize: '1.08em' }}>{q.question}</label>
                {q.type === 'text' && (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value, q.type)}
                    style={{ width: '80%', padding: '10px 8px', textAlign: 'center', marginBottom: 2, borderRadius: 7, border: '1px solid #bbb' }}
                  />
                )}
                {q.type === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80%', marginBottom: 2 }}>
                    <input
                      type="number"
                      value={answers[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value, q.type)}
                      style={{ width: 120, padding: '10px 8px', textAlign: 'center', borderRadius: 7, border: '1px solid #bbb' }}
                      min={q.min || 1}
                      max={q.max || undefined}
                    />
                    <span style={{ marginLeft: 7 }}>{q.id === 'q4_1' ? '명' : (q.id === 'q11' ? '개' : '만원')}</span>
                  </div>
                )}
                {q.type === 'select' && (
                  <select
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value, q.type)}
                    style={{ width: '80%', padding: '10px 8px', textAlign: 'center', marginBottom: 2, borderRadius: 7, border: '1px solid #bbb' }}
                  >
                    <option value="">선택하세요</option>
                    {q.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              margin: '0 auto',
              display: 'block',
              background: loading ? '#90caf9' : '#1976d2',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.08em',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => { if (!loading) e.target.style.background = '#1565c0'; }}
            onMouseOut={e => { if (!loading) e.target.style.background = '#1976d2'; }}
          >
            {loading ? '분석 중...' : '설문 제출'}
          </button>
        </form>
      </React.Fragment>
      ) : (
        <ResultPage
          recommendation={recommendation}
          email={email}
          onEmailChange={handleEmailChange}
          onSendEmail={handleSendEmail}
          emailSent={emailSent}
          loading={loading}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;