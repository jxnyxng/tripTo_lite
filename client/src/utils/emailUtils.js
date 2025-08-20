// 이메일 HTML 생성 함수
export const generateEmailHTML = (cards) => {
  return `
    <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8fbff;
          }
          .header { 
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 12px 12px 0 0;
            margin-bottom: 0;
          }
          .content { 
            background: white; 
            padding: 30px; 
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .card { 
            background: #fafdff; 
            border: 2px solid #e3f2fd; 
            border-left: 6px solid #1976d2; 
            border-radius: 12px; 
            padding: 24px; 
            margin: 20px 0; 
            box-shadow: 0 2px 12px rgba(25,118,210,0.1);
          }
          .place-name { 
            font-size: 1.4em; 
            font-weight: bold; 
            color: #1976d2; 
            margin-bottom: 16px;
            border-bottom: 2px solid #e3f2fd;
            padding-bottom: 8px;
          }
          .cost-section { 
            background: #f0f8ff; 
            padding: 16px; 
            border-radius: 8px; 
            margin: 16px 0;
            border: 1px solid #e1f5fe;
          }
          .cost-item { 
            margin: 8px 0; 
            display: flex; 
            justify-content: space-between;
            padding: 4px 0;
          }
          .cost-label { 
            font-weight: 500; 
            color: #555;
          }
          .cost-value { 
            font-weight: bold; 
            color: #1976d2;
          }
          .total-cost { 
            border-top: 2px solid #1976d2; 
            padding-top: 12px; 
            margin-top: 12px; 
            font-size: 1.1em;
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            padding: 12px;
            border-radius: 6px;
          }
          .reason { 
            background: #fff3e0; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #ff9800; 
            margin-top: 16px;
            font-style: italic;
            line-height: 1.7;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding: 20px; 
            background: #f5f5f5; 
            border-radius: 8px;
            color: #666;
          }
          .logo { 
            font-size: 2em; 
            font-weight: bold; 
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .subtitle { 
            opacity: 0.9; 
            font-size: 1.1em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌟 TRIPTO</div>
          <div class="subtitle">맞춤형 여행지 추천 결과</div>
        </div>
        <div class="content">
          <p style="font-size: 1.1em; color: #555; margin-bottom: 30px; text-align: center;">
            당신을 위한 특별한 여행지를 추천해드립니다! ✈️
          </p>
          
          ${cards.map((card, index) => `
            <div class="card">
              <div class="place-name">
                ${index + 1}. ${card.place || `여행지 ${index + 1}`}
                ${card.airport_code ? ` <span style="font-size: 0.8em; color: #666;">(${card.airport_code})</span>` : ''}
              </div>
              
              <div class="cost-section">
                <h4 style="margin: 0 0 12px 0; color: #1976d2;">💰 예상 비용</h4>
                ${card.flight ? `<div class="cost-item"><span class="cost-label">✈️ 항공료:</span><span class="cost-value">${card.flight}</span></div>` : ''}
                ${card.hotel ? `<div class="cost-item"><span class="cost-label">🏨 숙박비:</span><span class="cost-value">${card.hotel}</span></div>` : ''}
                ${card.food ? `<div class="cost-item"><span class="cost-label">🍽️ 식비:</span><span class="cost-value">${card.food}</span></div>` : ''}
                ${card.activity ? `<div class="cost-item"><span class="cost-label">🎯 액티비티:</span><span class="cost-value">${card.activity}</span></div>` : ''}
                ${card.total ? `<div class="cost-item total-cost"><span class="cost-label">💎 총 예상 비용:</span><span class="cost-value">${card.total}</span></div>` : ''}
              </div>
              
              ${card.reason ? `
                <div class="reason">
                  <strong style="color: #e65100;">🎯 추천 이유:</strong><br>
                  ${card.reason}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          <p style="margin: 0; font-size: 0.9em;">
            💝 즐거운 여행 되세요! | TRIPTO와 함께하는 스마트한 여행 계획
          </p>
          <p style="margin: 8px 0 0 0; font-size: 0.8em; opacity: 0.7;">
            이 추천은 AI 분석을 통해 생성되었습니다.
          </p>
        </div>
      </body>
    </html>
  `;
};

// 이메일 전송 함수
export const sendEmail = async (cards, userEmail) => {
  try {
    const emailHTML = generateEmailHTML(cards);
    
    const response = await fetch('http://localhost:5000/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        subject: '🌟 TRIPTO 맞춤형 여행지 추천 결과',
        html: emailHTML
      })
    });

    if (!response.ok) {
      throw new Error('이메일 전송에 실패했습니다.');
    }

    const result = await response.json();
    return { success: true, message: '이메일이 성공적으로 전송되었습니다!' };
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    return { success: false, message: '이메일 전송 중 오류가 발생했습니다.' };
  }
};
