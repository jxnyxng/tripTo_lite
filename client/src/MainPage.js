import React, { useState, useEffect } from 'react';

function MainPage({ onStartSurvey }) {
  const [showNavbar, setShowNavbar] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // 컴포넌트 마운트 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 스크롤 이벤트 처리
  useEffect(() => {
    let scrollTimeout;
    
    const handleScroll = (e) => {
      if (isScrolling) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentSectionIndex = Math.round(scrollY / windowHeight);
      
      // 첫 번째 섹션을 벗어나면 네비바 표시
      setShowNavbar(scrollY > windowHeight * 0.3);
      setCurrentSection(currentSectionIndex);
    };

    const handleWheel = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      setIsScrolling(true);

      const windowHeight = window.innerHeight;
      const currentScrollY = window.scrollY;
      const currentSectionIndex = Math.round(currentScrollY / windowHeight);
      
      let targetSection;
      
      if (e.deltaY > 0) {
        // 아래로 스크롤
        targetSection = Math.min(currentSectionIndex + 1, 1); // 최대 섹션 1
      } else {
        // 위로 스크롤
        targetSection = Math.max(currentSectionIndex - 1, 0); // 최소 섹션 0
      }

      // 부드럽게 해당 섹션으로 이동
      window.scrollTo({
        top: targetSection * windowHeight,
        behavior: 'smooth'
      });

      // 스크롤 완료 후 잠금 해제
      setTimeout(() => {
        setIsScrolling(false);
        setCurrentSection(targetSection);
        setShowNavbar(targetSection > 0);
      }, 800); // 스크롤 애니메이션 시간
    };

    // 터치 이벤트 처리 (모바일)
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      if (isScrolling) return;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isScrolling) {
        e.preventDefault();
        return;
      }
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;

      const touchDiff = touchStartY - touchEndY;
      const minSwipeDistance = 50;

      if (Math.abs(touchDiff) > minSwipeDistance) {
        setIsScrolling(true);
        
        const windowHeight = window.innerHeight;
        const currentScrollY = window.scrollY;
        const currentSectionIndex = Math.round(currentScrollY / windowHeight);
        
        let targetSection;
        
        if (touchDiff > 0) {
          // 위로 스와이프 (아래 섹션으로)
          targetSection = Math.min(currentSectionIndex + 1, 1);
        } else {
          // 아래로 스와이프 (위 섹션으로)
          targetSection = Math.max(currentSectionIndex - 1, 0);
        }

        window.scrollTo({
          top: targetSection * windowHeight,
          behavior: 'smooth'
        });

        setTimeout(() => {
          setIsScrolling(false);
          setCurrentSection(targetSection);
          setShowNavbar(targetSection > 0);
        }, 800);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScrolling]);

  // 섹션별 스크롤 이동
  const scrollToSection = (sectionIndex) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const windowHeight = window.innerHeight;
    
    window.scrollTo({
      top: sectionIndex * windowHeight,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setIsScrolling(false);
      setCurrentSection(sectionIndex);
      setShowNavbar(sectionIndex > 0);
    }, 800);
  };

  return (
    <div style={{
      scrollBehavior: 'smooth',
      overflowY: 'hidden', // 기본 스크롤 숨김
      margin: 0,
      padding: 0
    }}>
      {/* 네비게이션 바 - 스크롤 시에만 표시 */}
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
        justifyContent: 'space-between',
        paddingLeft: '24px',
        paddingRight: '24px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{
          fontSize: '1.8em',
          fontWeight: 'bold',
          color: '#1976d2',
          cursor: 'pointer'
        }} onClick={() => scrollToSection(0)}>
          TRIPTO
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            onClick={() => scrollToSection(1)}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 1 ? '#1976d2' : '#666',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: currentSection === 1 ? 'bold' : 'normal'
            }}
          >
            이용방법
          </button>
          <button
            onClick={onStartSurvey}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            시작하기
          </button>
        </div>
      </div>

      {/* 첫 번째 섹션 - 서비스 소개 */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)',
        textAlign: 'center',
        padding: '0 20px',
        position: 'relative',
        boxSizing: 'border-box',
        margin: 0
      }}>
        
        {/* 메인 콘텐츠 - 완전히 중앙 배치 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: '3.5em',
            fontWeight: 'bold',
            color: '#1976d2',
            marginBottom: '20px',
            lineHeight: '1.2',
            margin: '0 0 20px 0'
          }}>
            TRIPTO
          </h1>
          
          {/* 서브 타이틀 */}
          <h2 style={{
            fontSize: '1.5em',
            color: '#333',
            marginBottom: '30px',
            fontWeight: '500',
            margin: '0 0 30px 0'
          }}>
            AI가 추천하는 맞춤형 여행지
          </h2>
          
          {/* 설명 문구 */}
          <div style={{
            fontSize: '1.1em',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '40px'
          }}>
            <p style={{ marginBottom: '15px', margin: '0 0 15px 0' }}>
              ✈️ <strong>간단한 설문</strong>으로 나만의 여행 취향을 알려주세요
            </p>
            <p style={{ marginBottom: '15px', margin: '0 0 15px 0' }}>
              🎯 <strong>AI 분석</strong>을 통해 딱 맞는 여행지를 추천해드려요
            </p>
            <p style={{ marginBottom: '15px', margin: '0 0 40px 0' }}>
              📧 <strong>이메일 전송</strong>으로 언제든 다시 확인하세요
            </p>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={onStartSurvey}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '18px 40px',
              fontSize: '1.3em',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
              margin: '20px 0 0 0'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(25, 118, 210, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.3)';
            }}
          >
            🚀 여행지 추천받기
          </button>

          {/* 추가 정보 - 버튼 아래 */}
          <div style={{
            marginTop: '30px',
            fontSize: '0.9em',
            color: '#999'
          }}>
            <p style={{ margin: '0' }}>무료 서비스 · 약 2분 소요 · 개인정보 수집 없음</p>
          </div>
        </div>

        {/* 스크롤 안내 - 하단 고정 */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#999',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>아래로 스크롤하여 이용방법을 확인하세요</span>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #999',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'bounce 2s infinite'
          }}>
            ↓
          </div>
        </div>
      </div>

      {/* 두 번째 섹션 - 서비스 이용방법 */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff8f0 0%, #fff4e6 100%)',
        padding: '70px 20px 30px 20px',
        boxSizing: 'border-box',
        position: 'relative',
        margin: 0
      }}>
        <div style={{
          maxWidth: '800px',
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <h2 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            color: '#1976d2',
            margin: '0 0 40px 0'
          }}>
            이용방법
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '40px',
            width: '100%',
            maxWidth: '800px'
          }}>
            {/* 단계 1 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '25px 15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '2px solid #e3f2fd'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '15px'
              }}>📝</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#1976d2',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>1. 설문 작성</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.5',
                fontSize: '0.95em',
                margin: '0'
              }}>
                여행 취향, 예산, 기간 등<br/>
                간단한 질문에 답변해주세요
              </p>
            </div>

            {/* 단계 2 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '25px 15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '2px solid #e8f5e8'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '15px'
              }}>🤖</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#2e7d32',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>2. AI 분석</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.5',
                fontSize: '0.95em',
                margin: '0'
              }}>
                AI가 사용자의 답변을 분석하여<br/>
                맞춤형 여행지를 추천해드려요
              </p>
            </div>

            {/* 단계 3 */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '25px 15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '2px solid #fff3e0'
            }}>
              <div style={{
                fontSize: '2.5em',
                marginBottom: '15px'
              }}>✈️</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#f57c00',
                marginBottom: '12px',
                margin: '0 0 12px 0'
              }}>3. 여행 계획</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.5',
                fontSize: '0.95em',
                margin: '0'
              }}>
                추천받은 여행지 정보와<br/>
                항공권, 호텔 예약까지 한번에!
              </p>
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={onStartSurvey}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 36px',
              fontSize: '1.2em',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
              margin: '20px 0 0 0'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(25, 118, 210, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.3)';
            }}
          >
            지금 시작하기
          </button>
        </div>
      </div>

      {/* CSS 애니메이션 및 기본 스타일 리셋 */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}

export default MainPage;
