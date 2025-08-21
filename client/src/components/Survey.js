import React, { useState } from 'react';
import surveyQuestions from '../surveyQuestions';

function Survey({ answers, setAnswers, onSubmit, loading, onBack }) {
  const [validationMessage, setValidationMessage] = useState('');
  
  // 스크롤을 상단으로 이동하는 함수
  const scrollToTop = () => {
    // 여러 스크롤 방법을 순차적으로 시도
    const scrollMethods = [
      () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      },
      () => {
        const containers = document.querySelectorAll('[style*="overflow"], [style*="scroll"]');
        containers.forEach(container => {
          container.scrollTop = 0;
        });
      },
      () => {
        // 모든 div 요소 중 스크롤 가능한 것들 찾기
        const allDivs = document.querySelectorAll('div');
        allDivs.forEach(div => {
          if (div.scrollHeight > div.clientHeight) {
            div.scrollTop = 0;
          }
        });
      }
    ];
    
    scrollMethods.forEach((method, index) => {
      setTimeout(method, index * 50);
    });
  };
  
  // 기본 질문 필수 검증 함수
  const validateCheckboxQuestions = () => {
    const checkboxQuestions = surveyQuestions.filter(q => q.type === 'checkbox');
    const missingQuestions = [];
    
    for (const question of checkboxQuestions) {
      const answer = answers[question.id];
      if (!Array.isArray(answer) || answer.length === 0) {
        missingQuestions.push(question.question);
      }
    }
    
    return missingQuestions;
  };

  // 제출 핸들러 (검증 포함)
  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    
    const missingQuestions = validateCheckboxQuestions();
    
    if (missingQuestions.length > 0) {
      setValidationMessage(`다음 기본 질문(필수)에 답해주세요: ${missingQuestions.join(', ')}`);
      
      // 스크롤을 상단으로 이동
      setTimeout(scrollToTop, 100);
      
      return;
    }
    
    setValidationMessage('');
    onSubmit(e);
  };
  
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
    
    // 체크형 질문이 변경되면 검증 메시지 숨김
    if (optionType === 'checkbox' && validationMessage) {
      setValidationMessage('');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      {/* 로딩 오버레이 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white'
        }}>
          {/* 로딩 스피너 */}
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '24px'
          }}></div>
          
          {/* 로딩 메시지 */}
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <h3 style={{
              fontSize: '1.5em',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              여행지 분석 중...
            </h3>
            <p style={{
              fontSize: '1em',
              margin: '0 0 8px 0',
              opacity: 0.9
            }}>
              🌍 당신만의 완벽한 여행지를 찾고 있어요
            </p>
            <p style={{
              fontSize: '0.9em',
              margin: 0,
              opacity: 0.7
            }}>
              잠시만 기다려 주세요...
            </p>
          </div>
          
          {/* 진행 단계 표시 */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {['설문 분석', '데이터 매칭', '결과 생성'].map((step, index) => (
              <div key={step} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                fontSize: '0.85em',
                animation: `pulse 1.5s ease-in-out infinite ${index * 0.5}s`
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  animation: `pulse 1s ease-in-out infinite ${index * 0.3}s`
                }}></div>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
      overflow: 'auto',
      padding: 0
    }}>
      <div style={{
        maxWidth: 600, 
        margin: '0 auto', 
        padding: '24px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        {/* 서비스명 상단 표시 */}
        <div style={{ width: '100%', textAlign: 'center', marginBottom: 28, maxWidth: '560px', position: 'relative' }}>
          {/* 뒤로가기 버튼 */}
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
          >
            <span>←</span>
            <span>돌아가기</span>
          </button>

          <h1 style={{ 
            fontWeight: 'bold', 
            fontSize: '2em', 
            color: '#ffffff', 
            letterSpacing: '0.02em', 
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            TripTo
          </h1>
        </div>
      
      {/* 설문 설명 박스 */}
              {/* 설문 설명 박스 */}
        <div style={{
          width: '100%',
          maxWidth: '560px',
          border: '1.5px solid #e3f2fd',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
          padding: '24px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, #f8fdff 0%, #e8f4fd 100%)',
          textAlign: 'center',
        }}>
        <h2 style={{ 
          fontSize: '1.3em', 
          fontWeight: 'bold', 
          color: '#1976d2', 
          margin: '0 0 12px 0' 
        }}>
          🌍 맞춤형 여행지 추천 설문조사
        </h2>
        <p style={{ 
          fontSize: '1em', 
          color: '#555', 
          lineHeight: '1.6', 
          margin: '0 0 8px 0' 
        }}>
          여러분의 여행 취향과 선호도를 알려주세요!
        </p>
        <p style={{ 
          fontSize: '0.9em', 
          color: '#666', 
          lineHeight: '1.5', 
          margin: 0 
        }}>
          다지선다 질문과 직접 입력 질문을 통해 <strong>가장 적합한 여행지</strong>를 추천해드립니다.
        </p>
      </div>
      
      {/* 검증 메시지 */}
      {validationMessage && (
        <div style={{
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          border: '1.5px solid #f44336',
          borderRadius: 12,
          padding: '16px',
          marginBottom: 16,
          textAlign: 'center',
          animation: 'shake 0.5s ease-in-out'
        }}>
          <div style={{ 
            fontSize: '1.1em', 
            fontWeight: 'bold', 
            color: '#d32f2f',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span>⚠️</span>
            <span>기본 질문 미완료</span>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95em', 
            color: '#c62828',
            lineHeight: 1.4
          }}>
            {validationMessage}
          </p>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '0.85em', 
            color: '#ad1457',
            lineHeight: 1.3,
            fontStyle: 'italic'
          }}>
            💡 기본 질문들은 여행 추천을 위한 필수 정보입니다
          </p>
        </div>
      )}

      <form onSubmit={handleSubmitWithValidation} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: '560px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          border: '1.5px solid #bcdffb',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
          padding: '32px 24px 24px 24px',
          marginBottom: 18,
          background: '#fafdff',
        }}>
          
          {/* 다지선다 섹션 제목 */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: 24,
            padding: '12px 0',
            borderBottom: '2px solid #e3f2fd'
          }}>
            <h3 style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold', 
              color: '#1976d2', 
              margin: 0 
            }}>
              ☑️ 기본 질문
            </h3>
            <p style={{ 
              fontSize: '0.9em', 
              color: '#666', 
              margin: '4px 0 0 0' 
            }}>
              해당하는 항목을 모두 고르시오
            </p>
          </div>

          {/* 다지선다 질문들 (checkbox 타입) 먼저 렌더링 */}
          {surveyQuestions.filter(q => q.type === 'checkbox').map(q => (
            <div key={q.id} style={{ marginBottom: 32, width: '100%' }}>
              {/* 질문 제목 */}
              <label style={{ 
                fontWeight: 'bold', 
                fontSize: '1.1em', 
                display: 'block', 
                marginBottom: 8, 
                textAlign: 'center' 
              }}>
                {q.question}
              </label>

              {/* checkbox 타입 렌더링 */}
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

          {/* 입력형 질문 섹션 구분선 */}
          <div style={{
            width: '100%',
            maxWidth: '560px',
            marginTop: 48,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
            }}></div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <span style={{
                fontSize: '0.85em',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '500'
              }}>
                추가 정보
              </span>
            </div>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
            }}></div>
          </div>

          {/* 입력 섹션 제목 */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: 16,
            marginBottom: 24,
            padding: '12px 0',
            borderBottom: '2px solid #e3f2fd'
          }}>
            <h3 style={{ 
              fontSize: '1.2em', 
              fontWeight: 'bold', 
              color: '#1976d2', 
              margin: 0 
            }}>
              ✏️ 입력형 질문
            </h3>
            <p style={{ 
              fontSize: '0.9em', 
              color: '#666', 
              margin: '4px 0 0 0' 
            }}>
              직접 입력하거나 선택해주세요
            </p>
          </div>

          {/* 입력 질문들 (number, select, text) 아래에 렌더링 */}
          {surveyQuestions.filter(q => q.type === 'number' || q.type === 'select' || q.type === 'text').map(q => (
            <div key={q.id} style={{ marginBottom: 32, width: '100%' }}>
              {/* 질문 제목 */}
              <label style={{ 
                fontWeight: 'bold', 
                fontSize: '1.1em', 
                display: 'block', 
                marginBottom: 8, 
                textAlign: 'center' 
              }}>
                {q.question}
              </label>

              {/* select 타입 렌더링 */}
              {q.type === 'select' && (
                <select
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 48,
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    background: '#fff',
                    fontSize: '1em',
                    padding: '0 12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'block',
                    margin: '0 auto',
                    textAlign: 'center',
                  }}
                >
                  <option value="">선택하세요</option>
                  {q.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* number 타입 렌더링 */}
              {q.type === 'number' && (
                <input
                  type="number"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  min={q.min || 1}
                  placeholder="숫자를 입력하세요"
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 48,
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    background: '#fff',
                    fontSize: '1em',
                    padding: '0 12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'block',
                    margin: '0 auto',
                    textAlign: 'center',
                  }}
                />
              )}

              {/* text 타입 렌더링 */}
              {q.type === 'text' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="자유롭게 입력하세요..."
                  rows="4"
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    minWidth: 400,
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    background: '#fff',
                    fontSize: '1em',
                    padding: '12px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'block',
                    margin: '0 auto',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    textAlign: 'center',
                  }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              margin: '20px auto 0 auto',
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

        </div>
      </form>
      </div>
    </div>
    </>
  );
}

export default Survey;
