import React, { useState, useEffect } from 'react';
import surveyQuestions from './surveyQuestions';
import ResultPage from './ResultPage';
import MainPage from './MainPage';
import Survey from './components/Survey';
import useNavigation from './hooks/useNavigation';
import { sendEmail } from './utils/emailUtils';

function App() {
  // 네비게이션 훅 사용
  const { currentPage, setCurrentPage, navigateTo, setupBrowserNavigation } = useNavigation();
  
  // 전역 상태 관리
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
  const [savedRecommendation, setSavedRecommendation] = useState(null);

  // 초기화 - 항상 메인 페이지에서 시작
  useEffect(() => {
    setRecommendation(null);
    setSavedRecommendation(null);
    navigateTo('main', '/');
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 브라우저 네비게이션 설정
  useEffect(() => {
    setupBrowserNavigation(recommendation, savedRecommendation, setSavedRecommendation, setRecommendation);
  }, [recommendation, savedRecommendation]);

  // 설문 답변 변경 핸들러
  const handleAnswerChange = (newAnswers) => {
    setAnswers(newAnswers);
    // localStorage 저장
    try {
      localStorage.setItem('tripto_answers', JSON.stringify(newAnswers));
    } catch {}
  };

  // 설문 제출
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5005/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
      setSavedRecommendation(null);
      navigateTo('result', '/result');
    } catch (err) {
      alert('분석 요청 실패');
    }
    setLoading(false);
  };

  // 이메일 전송 (utils 사용)
  const handleSendEmail = async () => {
    if (!email) {
      alert('이메일을 입력하세요');
      return;
    }
    setLoading(true);
    try {
      const result = await sendEmail(recommendation, email);
      if (result.success) {
        setEmailSent(true);
        alert(result.message);
      } else {
        alert(`이메일 발송 실패: ${result.message}`);
      }
    } catch (err) {
      console.error('이메일 발송 오류:', err);
      alert('이메일 발송 실패: 서버 연결 오류');
    } finally {
      setLoading(false);
    }
  };

  // 이메일 입력 핸들러
  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailSent(false);
  };

  // 페이지 전환 함수들
  const handleStartSurvey = () => {
    setRecommendation(null);
    setSavedRecommendation(null);
    navigateTo('survey', '/survey');
  };

  const handleGoToMain = () => {
    const confirmLeave = window.confirm(
      '현재 추천 결과를 확인하지 못하게 됩니다.\n' +
      '정말로 메인 페이지로 돌아가시겠습니까?'
    );
    
    if (confirmLeave) {
      setRecommendation(null);
      setSavedRecommendation(null);
      navigateTo('main', '/');
    }
  };

  const handleReset = () => {
    const confirmReset = window.confirm(
      '현재 추천 결과와 설문 답변을 모두 초기화합니다.\n' +
      '정말로 처음부터 다시 시작하시겠습니까?'
    );
    
    if (confirmReset) {
      setRecommendation(null);
      setSavedRecommendation(null);
      setAnswers({});
      setEmailSent(false);
      try {
        localStorage.removeItem('tripto_answers');
      } catch {}
      navigateTo('main', '/');
    }
  };

  // 페이지 렌더링 - 정상 로직 복원
  console.log('현재 페이지:', currentPage); // 디버깅용
  
  switch (currentPage) {
    case 'survey':
      return (
        <Survey
          answers={answers}
          setAnswers={setAnswers}
          onSubmit={handleSurveySubmit}
          loading={loading}
          onBack={handleGoToMain}
        />
      );
    case 'result':
      return (
        <ResultPage
          recommendation={recommendation}
          email={email}
          onEmailChange={handleEmailChange}
          onSendEmail={handleSendEmail}
          emailSent={emailSent}
          loading={loading}
          onReset={handleReset}
          onGoToMain={handleGoToMain}
          surveyData={answers}
        />
      );
    default:
      return <MainPage onStartSurvey={handleStartSurvey} />;
  }
}

export default App;