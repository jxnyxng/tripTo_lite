import React from 'react';

function DetailPanel({ selectedCard, showDetail, onClose, onEmailSend, isEmailSending, origin, onOriginChange, hotelSite, onHotelSiteChange }) {
  if (!showDetail || !selectedCard) return null;

  // 스카이스캐너 항공권 검색 URL 생성
  const getSkyscannerUrl = () => {
    // 간단하게 스카이스캐너 메인 페이지로 이동
    return 'https://www.skyscanner.co.kr/';
  };

  // 호텔 검색 URL 생성
  const getHotelUrl = () => {
    if (!selectedCard.place) return '#';
    
    const encodedPlace = encodeURIComponent(selectedCard.place);
    const today = new Date();
    const checkin = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const checkout = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
    
    const formatDateForHotel = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    switch(hotelSite) {
      case 'booking':
        return `https://www.booking.com/searchresults.ko.html?ss=${encodedPlace}&checkin_month=${checkin.getMonth()+1}&checkin_monthday=${checkin.getDate()}&checkin_year=${checkin.getFullYear()}&checkout_month=${checkout.getMonth()+1}&checkout_monthday=${checkout.getDate()}&checkout_year=${checkout.getFullYear()}&group_adults=2&no_rooms=1`;
      case 'agoda':
        return `https://www.agoda.com/ko-kr/search?city=${encodedPlace}&checkIn=${formatDateForHotel(checkin)}&checkOut=${formatDateForHotel(checkout)}&rooms=1&adults=2`;
      case 'expedia':
        return `https://www.expedia.co.kr/Hotel-Search?destination=${encodedPlace}&startDate=${formatDateForHotel(checkin)}&endDate=${formatDateForHotel(checkout)}&rooms=1&adults=2`;
      case 'hotels':
        return `https://ko.hotels.com/search.do?resolved-location=CITY:${encodedPlace}&f-checkin=${formatDateForHotel(checkin)}&f-checkout=${formatDateForHotel(checkout)}&f-rooms=1&f-adults=2`;
      default:
        return `https://www.booking.com/searchresults.ko.html?ss=${encodedPlace}`;
    }
  };

  const containerStyle = {
    position: 'fixed',
    top: 60,
    right: 0,
    width: '70vw',
    height: 'calc(100vh - 60px)',
    background: 'linear-gradient(135deg, #f8fbff 0%, #eef7ff 100%)',
    borderLeft: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    transform: showDetail ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1000,
    overflowY: 'auto'
  };

  const headerStyle = {
    padding: '24px 32px',
    borderBottom: '1px solid #e0e7ff',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '24px',
    right: '32px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#fff',
    transition: 'color 0.2s',
    padding: '8px',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const contentStyle = {
    flex: 1,
    padding: '32px',
    display: 'flex',
    gap: '24px'
  };

  const leftSectionStyle = {
    flex: '3',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  };

  const rightSectionStyle = {
    flex: '7',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.95)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(25,118,210,0.1)'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
    fontWeight: '500',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(25,118,210,0.3)'
  };

  const searchBoxStyle = {
    background: 'rgba(255,255,255,0.95)',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid rgba(25,118,210,0.1)',
    flex: '1'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #e1f5fe',
    borderRadius: '6px',
    fontSize: '0.9em',
    marginBottom: '10px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #e1f5fe',
    borderRadius: '6px',
    fontSize: '0.9em',
    marginBottom: '10px',
    background: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box'
  };

  const searchButtonStyle = {
    ...buttonStyle,
    width: '100%',
    fontSize: '0.85em',
    padding: '8px'
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '16px',
    marginTop: '16px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: '#1976d2', fontSize: '1.5em' }}>
          {selectedCard.place}
          {selectedCard.airport_code && (
            <span style={{ fontSize: '0.7em', color: '#666', marginLeft: 8 }}>
              ({selectedCard.airport_code})
            </span>
          )}
        </h2>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseOver={(e) => {
            e.target.style.color = '#f44336';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#fff';
          }}
        >
          ×
        </button>
      </div>

      <div style={contentStyle}>
        <div style={leftSectionStyle}>
          <div style={sectionStyle}>
            <h3 style={{ marginTop: 0, color: '#1976d2', fontSize: '1.1em' }}>예상 비용</h3>
            {selectedCard.flight && <p><strong>항공료:</strong> {selectedCard.flight}</p>}
            {selectedCard.hotel && <p><strong>숙박비:</strong> {selectedCard.hotel}</p>}
            {selectedCard.food && <p><strong>식비:</strong> {selectedCard.food}</p>}
            {selectedCard.activity && <p><strong>액티비티:</strong> {selectedCard.activity}</p>}
            {selectedCard.total && <p style={{ borderTop: '1px solid #eee', paddingTop: '12px', fontWeight: 'bold', color: '#1976d2' }}>
              <strong>총 예상 비용:</strong> {selectedCard.total}
            </p>}
            
            <button
              style={{
                ...buttonStyle,
                width: '100%',
                marginTop: '16px',
                opacity: isEmailSending ? 0.7 : 1,
                cursor: isEmailSending ? 'not-allowed' : 'pointer'
              }}
              onClick={onEmailSend}
              disabled={isEmailSending}
              onMouseOver={(e) => {
                if (!isEmailSending) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(25,118,210,0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isEmailSending) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(25,118,210,0.3)';
                }
              }}
            >
              {isEmailSending ? '전송 중...' : '이메일로 받기'}
            </button>
          </div>
        </div>

        <div style={rightSectionStyle}>
          <div style={sectionStyle}>
            <h3 style={{ marginTop: 0, color: '#1976d2', fontSize: '1.1em' }}>추천 이유</h3>
            <p style={{ lineHeight: '1.6', color: '#333' }}>{selectedCard.reason}</p>
          </div>

          <div style={searchContainerStyle}>
            <div style={searchBoxStyle}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2', fontSize: '0.95em' }}>항공권 검색</h4>
              <input
                style={inputStyle}
                type="text"
                placeholder="출발지 (예: ICN, GMP)"
                value={origin}
                onChange={(e) => onOriginChange(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                onBlur={(e) => e.target.style.borderColor = '#e1f5fe'}
              />
              <a
                href={getSkyscannerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  style={searchButtonStyle}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(25,118,210,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(25,118,210,0.3)';
                  }}
                >
                  스카이스캐너에서 검색
                </button>
              </a>
            </div>

            <div style={searchBoxStyle}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2', fontSize: '0.95em' }}>호텔 검색</h4>
              <select
                style={selectStyle}
                value={hotelSite}
                onChange={(e) => onHotelSiteChange(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                onBlur={(e) => e.target.style.borderColor = '#e1f5fe'}
              >
                <option value="booking">부킹닷컴</option>
                <option value="agoda">아고다</option>
                <option value="expedia">익스피디아</option>
                <option value="hotels">Hotels.com</option>
              </select>
              <a
                href={getHotelUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  style={searchButtonStyle}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(25,118,210,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(25,118,210,0.3)';
                  }}
                >
                  호텔 검색하기
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;
