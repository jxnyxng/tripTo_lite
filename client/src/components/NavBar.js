import React from 'react';

function NavBar({ currentPage, onBack, showBackButton = false }) {
  return (
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
      paddingLeft: '24px',
      paddingRight: '24px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* 뒤로가기 버튼 */}
      {showBackButton && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976d2',
            fontSize: '1.2em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
            marginRight: '16px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <span>←</span>
          <span>돌아가기</span>
        </button>
      )}
      
      {/* 서비스명 */}
      <div style={{
        fontSize: '1.8em',
        fontWeight: 'bold',
        color: '#1976d2'
      }}>
        TRIPTO
      </div>
    </div>
  );
}

export default NavBar;
