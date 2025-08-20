import React from 'react';

function NavBar() {
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
