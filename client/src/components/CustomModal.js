import React from 'react';

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.35)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalBoxStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(25,118,210,0.13)',
  padding: '32px 36px 28px 36px',
  minWidth: 340,
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function CustomModal({ open, title, children, onClose, actions }) {
  if (!open) return null;
  return (
    <div style={modalBackdropStyle}>
      <div style={modalBoxStyle}>
        {title && <div style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: 18 }}>{title}</div>}
        <div style={{ marginBottom: 22 }}>{children}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {actions}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
      </div>
    </div>
  );
}
