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
          fontWeight: '800',
          color: '#1976d2',
          cursor: 'pointer',
          fontFamily: '"Poppins", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          letterSpacing: '-0.02em'
        }} onClick={() => scrollToSection(0)}>
          TRIPTO
        </div>
      </div>

      {/* 첫 번째 섹션 - 서비스 소개 */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(234, 234, 234, 0.65), rgba(250, 250, 250, 0.39)), url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"), linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        textAlign: 'center',
        padding: '0 20px',
        paddingTop: '30px', // 네비바 고려해서 살짝 위로 올림
        boxSizing: 'border-box',
        margin: 0
      }}>
        
        {/* 배경 오버레이 - 텍스트 가독성을 위한 반투명 레이어 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 1
        }}></div>
        
        {/* 메인 콘텐츠 - 완전히 중앙 배치 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
          margin: '-30px auto 0 auto', // 살짝 위로 올림
          position: 'relative',
          zIndex: 2
        }}>
          {/* 메인 타이틀 */}
          <h1 style={{
            fontSize: '3.5em',
            fontWeight: '800',
            color: '#1976d2',
            marginBottom: '20px',
            lineHeight: '1.2',
            margin: '0 0 20px 0',
            fontFamily: '"Poppins", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
            color: '#2c2c2cff',
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
          color: '#2c2c2cff',
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
            border: '2px solid #272727ff',
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffffffff 0%, #fff4e6 100%)',
        padding: '150px 20px 60px 20px', // 네비바 여유공간 확보
        boxSizing: 'border-box',
        position: 'relative',
        margin: 0
      }}>
        <div style={{
          maxWidth: '1000px',
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '60px',
            marginBottom: '60px',
            width: '100%',
            maxWidth: '1000px'
          }}>
            {/* 단계 1 */}
            <div style={{
              width: '240px',
              height: '240px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(25, 118, 210, 0.2)',
              border: '4px solid #1976d2',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(25, 118, 210, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(25, 118, 210, 0.2)';
            }}>
              {/* 단계 번호 */}
              <div style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                backgroundColor: '#1976d2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2em'
              }}>1</div>
              
              <div style={{
                fontSize: '3.5em',
                marginBottom: '12px'
              }}>📝</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#1976d2',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>설문 작성</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.4',
                fontSize: '0.95em',
                margin: '0',
                textAlign: 'center', 
                padding: '0 18px'
              }}>
                여행 취향과<br/>
                정보를 알려주세요
              </p>
            </div>

            {/* 단계 2 */}
            <div style={{
              width: '240px',
              height: '240px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(46, 125, 50, 0.2)',
              border: '4px solid #2e7d32',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(46, 125, 50, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(46, 125, 50, 0.2)';
            }}>
              {/* 단계 번호 */}
              <div style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                backgroundColor: '#2e7d32',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2em'
              }}>2</div>
              
              <div style={{
                fontSize: '3.5em',
                marginBottom: '12px'
              }}>🤖</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#2e7d32',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>AI 분석</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.4',
                fontSize: '0.95em',
                margin: '0',
                textAlign: 'center',
                padding: '0 18px'
              }}>
                맞춤형 여행지를<br/>
                AI가 추천해드려요
              </p>
            </div>

            {/* 단계 3 */} 
            <div style={{
              width: '240px',
              height: '240px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(255, 152, 0, 0.2)',
              border: '4px solid #ff9800',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 152, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 152, 0, 0.2)';
            }}>
              {/* 단계 번호 */}
              <div style={{
                position: 'absolute',
                top: '-18px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '36px',
                height: '36px',
                backgroundColor: '#ff9800',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2em'
              }}>3</div>
              
              <div style={{
                fontSize: '3.5em',
                marginBottom: '12px'
              }}>✈️</div>
              <h3 style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#ff9800',
                marginBottom: '10px',
                margin: '0 0 10px 0'
              }}>맞춤 여행</h3>
              <p style={{
                color: '#666',
                lineHeight: '1.4',
                fontSize: '0.95em',
                margin: '0',
                textAlign: 'center',
                padding: '0 18px'
              }}>
                추천받은 여행지의<br/>
                상세정보를 확인하세요
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
              padding: '15px 25px',
              fontSize: '1.3em',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
              margin: '50px 0 0 0', // 간격을 20px에서 60px로 증가
              fontFamily: '"Poppins", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
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
