import React from 'react';
import surveyQuestions from '../surveyQuestions';

function Survey({ answers, onAnswerChange, onSubmit, loading }) {
  
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
    onAnswerChange(newAnswers);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      {/* 서비스명 상단 표시 */}
      <div style={{ width: '100%', textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontWeight: 'bold', fontSize: '2em', color: '#1976d2', letterSpacing: '0.02em', margin: 0 }}>TripTo</h1>
      </div>
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

          {/* 단일 선택(radio) 문항 렌더링 */}
          {surveyQuestions.filter(q => q.type === 'radio').map(q => (
            <div key={q.id} style={{ marginBottom: 32, width: '100%' }}>
              <label style={{ fontWeight: 'bold', fontSize: '1.1em', display: 'block', marginBottom: 8 }}>{q.question}</label>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginTop: 8 }}>
                {q.options.map(opt => (
                  <label key={opt} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 100,
                    height: 44,
                    border: answers[q.id] === opt ? '2px solid #1976d2' : '1px solid #ccc',
                    borderRadius: 8,
                    background: answers[q.id] === opt ? '#e3f2fd' : '#fff',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.95em',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    padding: '0 8px',
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleChange(q.id, opt, q.type)}
                      style={{ display: 'none' }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
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
    </div>
  );
}

export default Survey;
