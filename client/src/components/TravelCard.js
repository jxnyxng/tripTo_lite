import React from 'react';

function TravelCard({ card, idx, selectedIdx, onCardClick }) {
  const cardStyle = {
    width: '100%',
    maxWidth: '100%',
    background: '#fafdff',
    borderRadius: 16,
    boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
    border: '2.5px solid',
    borderColor: selectedIdx === idx ? '#1976d2' : '#bcdffb',
    borderLeft: selectedIdx === idx ? '8px solid #1976d2' : '2.5px solid #bcdffb',
    padding: '20px 20px 18px 20px',
    marginBottom: 16,
    textAlign: 'left',
    fontSize: '1.08em',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, transform 0.18s, border-color 0.18s',
    transform: 'translateY(0)',
    boxSizing: 'border-box'
  };

  return (
    <div
      key={idx}
      style={cardStyle}
      onClick={() => onCardClick(idx)}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-7px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(25,118,210,0.18)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)';
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '1.15em', marginBottom: 8, color: '#1976d2' }}>
        {card.place || `여행지 ${idx+1}`}
        {card.airport_code && <span style={{ fontSize: '0.9em', color: '#666', marginLeft: 8 }}>({card.airport_code})</span>}
      </div>
      {card.flight && <div>항공료: <span style={{ fontWeight: 500 }}>{card.flight}</span></div>}
      {card.hotel && <div>숙박비: <span style={{ fontWeight: 500 }}>{card.hotel}</span></div>}
      {card.reason && (
        <div style={{ marginTop: 8, color: '#333', fontSize: '0.95em' }}>
          {card.reason.length > 80 ? `${card.reason.substring(0, 80)}...` : card.reason}
        </div>
      )}
    </div>
  );
}

export default TravelCard;
