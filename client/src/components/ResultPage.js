import React, { useState, useRef, useEffect } from 'react';
import CustomModal from './CustomModal';

// 추천 결과를 HTML 문자열로 변환하는 함수 (이메일용)
function getRecommendationHtml(recommendation) {
  let cards = [];
  if (Array.isArray(recommendation)) {
    cards = recommendation;
  } else {
    cards = parseRecommendation(recommendation);
  }
  if (!cards.length) return '<div>추천 결과를 가져올 수 없습니다.</div>';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TRIPTO 여행지 추천</title>
      <style>
        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .summary-section { margin-bottom: 40px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; overflow: hidden; }
        .summary-table th { background-color: #fff3cd; color: #856404; padding: 12px; text-align: center; font-weight: bold; border-bottom: 2px solid #ffeaa7; }
        .summary-table td { padding: 10px; text-align: center; border-bottom: 1px solid #ffeaa7; }
        .travel-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .travel-table th { background-color: #e3f2fd; color: #1976d2; padding: 15px; text-align: left; font-weight: bold; border-bottom: 2px solid #1976d2; }
        .travel-table td { padding: 15px; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        .travel-table tr:nth-child(even) { background-color: #fafafa; }
        .place-name { font-weight: bold; color: #1976d2; font-size: 1.1em; }
        .airport-code { color: #666; font-size: 0.9em; margin-left: 5px; }
        .price-info { font-weight: 500; color: #2e7d32; }
        .reason-text { color: #333; line-height: 1.6; max-width: 400px; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; color: #666; }
        .cost-breakdown { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1976d2; }
        .cost-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .cost-total { font-weight: bold; font-size: 1.1em; color: #e91e63; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
        .info-section { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .quick-links { background: #f0f8ff; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .link-button { display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- 헤더 -->
        <div class="header">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌟 TRIPTO</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">맞춤형 여행지 추천 결과</p>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">${new Date().toLocaleDateString('ko-KR')} 추천</p>
        </div>
        
        <!-- 본문 -->
        <div class="content">
          <!-- 여행지 요약 -->
          <div class="summary-section">
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">📋 추천 여행지 요약</h2>
            
            <table class="summary-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>여행지</th>
                  <th>항공료 (1인)</th>
                  <th>숙박비 (1인)</th>
                  <th>총 예상비용</th>
                  <th>공항코드</th>
                </tr>
              </thead>
              <tbody>
                ${cards.map((card, index) => {
                  // 간단한 비용 계산 (기본값 사용)
                  const flightMatch = card.flight?.match(/(\d+(?:\.\d+)?)/);
                  const flightCost = flightMatch ? Math.round(parseFloat(flightMatch[1]) * 0.7) : 0;
                  const hotelMatch = card.hotel?.match(/(\d+(?:\.\d+)?)/);
                  const hotelCost = hotelMatch ? Math.round(parseFloat(hotelMatch[1]) * 0.6 * 3) : 0; // 3박 기준
                  const totalCost = flightCost + hotelCost;
                  
                  return `
                    <tr>
                      <td><strong>${index + 1}</strong></td>
                      <td class="place-name">${card.place || '-'}</td>
                      <td class="price-info">${flightCost ? flightCost + '만원' : '-'}</td>
                      <td class="price-info">${hotelCost ? hotelCost + '만원' : '-'}</td>
                      <td class="price-info"><strong>${totalCost ? totalCost + '만원' : '-'}</strong></td>
                      <td>${card.airport_code || '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- 각 여행지별 상세 정보 -->
          ${cards.map((card, index) => {
            const flightMatch = card.flight?.match(/(\d+(?:\.\d+)?)/);
            const flightCost = flightMatch ? Math.round(parseFloat(flightMatch[1]) * 0.7) : 0;
            const hotelMatch = card.hotel?.match(/(\d+(?:\.\d+)?)/);
            const hotelCostPerNight = hotelMatch ? Math.round(parseFloat(hotelMatch[1]) * 0.6) : 0;
            const hotelCost3Nights = hotelCostPerNight * 3;
            const totalCost = flightCost + hotelCost3Nights;
            
            return `
              <div style="margin-bottom: 40px; border: 2px solid #e3f2fd; border-radius: 12px; overflow: hidden;">
                <!-- 여행지 헤더 -->
                <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px;">${index + 1}. ${card.place}</h2>
                  ${card.airport_code ? `<p style="margin: 5px 0 0 0; opacity: 0.9;">✈️ 공항코드: ${card.airport_code}</p>` : ''}
                </div>
                
                <div style="padding: 25px;">
                  <!-- 비용 정보 -->
                  <div class="cost-breakdown">
                    <h3 style="margin: 0 0 15px 0; color: #1976d2;">💰 예상 비용</h3>
                    ${card.total_cost ? `
                      <div class="cost-item cost-total">
                        <span>총 예상 비용:</span>
                        <span style="font-weight: bold; color: #e91e63;">${card.total_cost}</span>
                      </div>
                      ${card.local_price ? `
                        <div class="cost-item">
                          <span>현지 사용 가능 금액:</span>
                          <span class="price-info">${card.local_price}</span>
                        </div>
                      ` : ''}
                    ` : `
                      <div class="cost-item">
                        <span>항공료 (1인, 왕복):</span>
                        <span class="price-info">${flightCost ? flightCost + '만원' : '정보없음'}</span>
                      </div>
                      <div class="cost-item">
                        <span>숙박비 (1인, 1박):</span>
                        <span class="price-info">${hotelCostPerNight ? hotelCostPerNight + '만원' : '정보없음'}</span>
                      </div>
                      <div class="cost-item">
                        <span>숙박비 (1인, 3박):</span>
                        <span class="price-info">${hotelCost3Nights ? hotelCost3Nights + '만원' : '정보없음'}</span>
                      </div>
                      <div class="cost-item cost-total">
                        <span>총 비용 (1인 기준):</span>
                        <span>${totalCost ? totalCost + '만원' : '정보없음'}</span>
                      </div>
                    `}
                  </div>

                  <!-- 추천 이유 -->
                  <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <h3 style="margin: 0 0 15px 0; color: #856404;">✨ 추천 이유</h3>
                    <div class="reason-text" style="max-width: none;">${card.reason || '추천 이유가 제공되지 않았습니다.'}</div>
                  </div>

                  <!-- 빠른 예약 링크 -->
                  <div class="quick-links">
                    <h3 style="margin: 0 0 15px 0; color: #333;">🔗 빠른 예약 링크</h3>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">아래 링크를 통해 바로 예약하실 수 있습니다:</p>
                    
                    <!-- 항공권 링크 -->
                    <div style="margin-bottom: 10px;">
                      <strong>항공권:</strong>
                      <a href="https://www.skyscanner.co.kr/" target="_blank" class="link-button" style="margin-left: 10px;">스카이스캐너에서 검색</a>
                    </div>
                    
                    <!-- 호텔 링크 -->
                    <div style="margin-bottom: 10px;">
                      <strong>호텔:</strong>
                      <a href="https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(card.place)}&lang=ko" target="_blank" class="link-button" style="margin-left: 10px;">부킹닷컴</a>
                      <a href="https://www.agoda.com/ko-kr/search?dest=${encodeURIComponent(card.place)}&locale=ko-kr" target="_blank" class="link-button">아고다</a>
                    </div>
                    
                    <!-- 여행 정보 링크 -->
                    <div>
                      <strong>여행 정보:</strong>
                      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(card.place + ' 여행 브이로그')}" target="_blank" class="link-button" style="margin-left: 10px;">YouTube 브이로그</a>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          <!-- 추가 정보 및 팁 -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #17a2b8;">💡 여행 준비 팁</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li>표시된 비용은 최저가 기준이며, 실제 비용은 예약 시기와 조건에 따라 달라질 수 있습니다.</li>
              <li>성수기나 연휴 기간에는 항공료와 숙박비가 평소보다 높을 수 있습니다.</li>
              <li>환율 변동에 따라 현지 사용 가능 금액이 달라질 수 있으니 여행 전 확인하세요.</li>
              <li>각국의 입국 요건(비자, 백신접종증명서 등)을 미리 확인하시기 바랍니다.</li>
              <li>여행자 보험 가입을 권장드립니다.</li>
            </ul>
          </div>

          <!-- 재추천 안내 -->
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">🔄 더 많은 추천이 필요하신가요?</h3>
            <p style="margin: 0 0 15px 0; color: #666;">TRIPTO 웹사이트에서 설문을 다시 작성하시면 새로운 여행지를 추천받으실 수 있습니다.</p>
            <a href="${window.location.origin}" target="_blank" style="display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">TRIPTO 다시 이용하기</a>
          </div>
        </div>
        
        <!-- 푸터 -->
        <div class="footer">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #1976d2;">
            💝 즐거운 여행 되세요! | TRIPTO와 함께하는 스마트한 여행 계획
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">
            이 추천은 AI 분석을 통해 생성되었습니다. | 문의사항이 있으시면 언제든지 연락주세요.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.7;">
            생성일시: ${new Date().toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Gemini 답변을 카드 정보 배열로 파싱하는 함수
function parseRecommendation(raw) {
  console.log('[파싱 시작] 원본 데이터:', raw);
  
  if (!raw || typeof raw !== 'string') {
    console.log('[파싱 실패] 데이터가 문자열이 아님');
    return [];
  }
  
  if (raw.includes('조건에 맞는 여행지가 없습니다')) {
    console.log('[파싱 실패] 조건에 맞는 여행지 없음');
    return [];
  }
  
  // JSON 응답 파싱 시도 (여러 방법으로 시도)
  let jsonStr = raw.trim();
  
  // 1. 백틱 제거
  const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
    console.log('[파싱] 백틱 제거 후:', jsonStr);
  } else if (jsonStr.includes('```')) {
    // json 키워드 없이 백틱만 있는 경우
    const parts = jsonStr.split('```');
    if (parts.length >= 3) {
      jsonStr = parts[1].trim();
    }
  }
  
  // 2. JSON 파싱 시도
  try {
    const arr = JSON.parse(jsonStr);
    console.log('[파싱 성공] JSON 파싱 결과:', arr);
    
    if (Array.isArray(arr) && arr.length > 0) {
      // 각 카드가 최소한의 정보를 가지고 있는지 확인
      const validCards = arr.filter(card => 
        card && typeof card === 'object' && 
        (card.place || card.title || card.name)
      );
      
      if (validCards.length > 0) {
        // place 필드 정규화
        const normalizedCards = validCards.map(card => ({
          place: card.place || card.title || card.name || '여행지명 없음',
          flight: card.flight || card.항공료 || '',
          hotel: card.hotel || card.숙박비 || card.accommodation || '',
          reason: card.reason || card.추천이유 || card.description || '',
          airport_code: card.airport_code || card.iata || '',
          local_price: card.local_price || card.현지사용금액 || '',
          total_cost: card.total_cost || card.총비용 || card.총예상비용 || ''
        }));
        
        console.log('[파싱 성공] 정규화된 카드:', normalizedCards);
        return normalizedCards;
      }
    }
  } catch (e) {
    console.log('[JSON 파싱 실패]', e.message);
    // JSON 파싱 실패 시 텍스트 파싱으로 fallback
  }

  // 3. 텍스트 파싱 fallback (기존 로직 개선)
  console.log('[Fallback] 텍스트 파싱 시도');
  
  // 여러 패턴으로 분할 시도
  let blocks = [];
  
  // 패턴 1: **1. 여행지명**
  if (raw.includes('**') && /\*\*\d+\./.test(raw)) {
    blocks = raw.split(/\*\*\d+\.\s*/).slice(1);
  }
  // 패턴 2: 1. 여행지명
  else if (/^\d+\.\s/.test(raw.trim())) {
    blocks = raw.split(/\n\d+\.\s*/).slice(1);
  }
  // 패턴 3: 줄바꿈으로 구분된 블록
  else {
    const lines = raw.split('\n').filter(line => line.trim());
    // 여행지명으로 추정되는 라인을 찾아서 블록 생성
    let currentBlock = '';
    for (const line of lines) {
      if (line.includes('여행지') || line.includes('추천') || /^[가-힣\s]+\s*\([A-Z]{3}\)/.test(line)) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = line;
      } else {
        currentBlock += '\n' + line;
      }
    }
    if (currentBlock) blocks.push(currentBlock);
  }
  
  console.log('[Fallback] 분할된 블록들:', blocks);
  
  if (blocks.length === 0) {
    console.log('[파싱 실패] 블록을 찾을 수 없음');
    return [];
  }
  
  const tempCards = blocks.map((block, index) => {
    const placeMatch = block.match(/^([^\*\n]+)\*\*/) || 
                     block.match(/^([^\n]+)/) ||
                     [`여행지 ${index + 1}`, `여행지 ${index + 1}`];
    
    const place = placeMatch[1].trim().replace(/\*\*/g, '');
    
    // 다양한 패턴으로 정보 추출
    const flightMatch = block.match(/항공[권료비]?\s*[평균:：]?\s*([^\n]+)/) ||
                       block.match(/비행기?\s*[요금료비]?\s*[평균:：]?\s*([^\n]+)/);
    const flight = flightMatch ? flightMatch[1].trim() : '';
    
    const hotelMatch = block.match(/숙박[업소비료]?\s*[평균요금]?[:\s]*([^\n]+)/) ||
                      block.match(/호텔\s*[요금료비]?\s*[평균:：]?\s*([^\n]+)/);
    const hotel = hotelMatch ? hotelMatch[1].trim() : '';
    
    const reasonMatch = block.match(/추천\s*이유[:\s]*([^]*?)(?=\n|항공|숙박|$)/) ||
                       block.match(/이유[:\s]*([^]*?)(?=\n|항공|숙박|$)/);
    const reason = reasonMatch ? reasonMatch[1].replace(/\*\s+/g, '').replace(/\n+/g, ' ').trim() : '';
    
    const localPriceMatch = block.match(/현지\s*사용\s*[가능금액]?\s*[:\s]*([^\n]+)/) ||
                           block.match(/현지\s*[금액비용]?\s*[:\s]*([^\n]+)/);
    const local_price = localPriceMatch ? localPriceMatch[1].trim() : '';
    
    const totalCostMatch = block.match(/총\s*[예상]?\s*비용\s*[:\s]*([^\n]+)/) ||
                          block.match(/총[계액]?\s*[:\s]*([^\n]+)/);
    const total_cost = totalCostMatch ? totalCostMatch[1].trim() : '';
    
    return { place, flight, hotel, reason, local_price, total_cost };
  });
  
  const validCards = tempCards.filter(card => card.place && card.place !== '');
  console.log('[Fallback 결과]', validCards);
  
  return validCards;
}

// Skyscanner IATA 코드 변환 함수
function getIataCode(str) {
  if (!str) return '';
  
  // 괄호 안의 IATA 코드 추출
  const match = str.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  
  // 한국 주요 공항 매핑
  const airportMap = {
    '인천': 'ICN',
    '인천공항': 'ICN',
    '김포': 'GMP', 
    '김포공항': 'GMP',
    '부산': 'PUS',
    '부산공항': 'PUS',
    '제주': 'CJU',
    '제주공항': 'CJU',
    '제주도': 'CJU',
    '대구': 'TAE',
    '대구공항': 'TAE',
    '광주': 'KWJ',
    '광주공항': 'KWJ',
    '울산': 'USN',
    '울산공항': 'USN',
    '청주': 'CJJ',
    '청주공항': 'CJJ',
    '양양': 'YNY',
    '양양공항': 'YNY',
    '여수': 'RSU',
    '여수공항': 'RSU',
    '포항': 'KPX',
    '포항공항': 'KPX'
  };

  // 지역별 주변 공항 매핑 (사용자가 살고 있는 지역 → 이용 가능한 주변 공항)
  const regionAirportMap = {
    // 수도권
    '서울': 'ICN', '경기': 'ICN', '수원': 'ICN', '성남': 'ICN', '안양': 'ICN', '부천': 'ICN',
    '고양': 'ICN', '용인': 'ICN', '시흥': 'ICN', '파주': 'ICN', '의정부': 'ICN', '남양주': 'ICN',
    '화성': 'ICN', '평택': 'ICN', '구리': 'ICN', '오산': 'ICN', '하남': 'ICN', '의왕': 'ICN',
    '과천': 'ICN', '광명': 'ICN', '김포시': 'GMP', '강서': 'GMP',
    
    // 강원도
    '춘천': 'YNY', '원주': 'YNY', '강릉': 'YNY', '동해': 'YNY', '태백': 'YNY', '속초': 'YNY',
    '삼척': 'YNY', '홍천': 'YNY', '횡성': 'YNY', '영월': 'YNY', '평창': 'YNY', '정선': 'YNY',
    '철원': 'YNY', '화천': 'YNY', '양구': 'YNY', '인제': 'YNY', '고성': 'YNY', '양양': 'YNY',
    
    // 충청북도
    '청주': 'CJJ', '충주': 'CJJ', '제천': 'CJJ', '보은': 'CJJ', '옥천': 'CJJ', '영동': 'CJJ',
    '진천': 'CJJ', '괴산': 'CJJ', '음성': 'CJJ', '단양': 'CJJ', '증평': 'CJJ',
    
    // 충청남도
    '천안': 'ICN', '공주': 'ICN', '보령': 'ICN', '아산': 'ICN', '서산': 'ICN', '논산': 'ICN',
    '계룡': 'ICN', '당진': 'ICN', '금산': 'ICN', '부여': 'ICN', '서천': 'ICN', '청양': 'ICN',
    '홍성': 'ICN', '예산': 'ICN', '태안': 'ICN', '대전': 'CJJ',
    
    // 경상북도
    '포항': 'KPX', '경주': 'KPX', '김천': 'TAE', '안동': 'TAE', '구미': 'TAE', '영주': 'TAE',
    '영천': 'TAE', '상주': 'TAE', '문경': 'TAE', '경산': 'TAE', '의성': 'TAE', '청송': 'TAE',
    '영양': 'TAE', '영덕': 'KPX', '청도': 'TAE', '고령': 'TAE', '성주': 'TAE', '칠곡': 'TAE',
    '예천': 'TAE', '봉화': 'TAE', '울진': 'KPX', '울릉': 'KPX',
    
    // 경상남도
    '창원': 'PUS', '진주': 'PUS', '통영': 'PUS', '사천': 'PUS', '김해': 'PUS', '밀양': 'PUS',
    '거제': 'PUS', '양산': 'PUS', '의령': 'PUS', '함안': 'PUS', '창녕': 'PUS', '고성': 'PUS',
    '남해': 'PUS', '하동': 'PUS', '산청': 'PUS', '함양': 'PUS', '거창': 'PUS', '합천': 'PUS',
    
    // 전라북도
    '전주': 'KWJ', '군산': 'KWJ', '익산': 'KWJ', '정읍': 'KWJ', '남원': 'KWJ', '김제': 'KWJ',
    '완주': 'KWJ', '진안': 'KWJ', '무주': 'KWJ', '장수': 'KWJ', '임실': 'KWJ', '순창': 'KWJ',
    '고창': 'KWJ', '부안': 'KWJ',
    
    // 전라남도
    '목포': 'KWJ', '여수': 'RSU', '순천': 'RSU', '나주': 'KWJ', '광양': 'RSU', '담양': 'KWJ',
    '곡성': 'KWJ', '구례': 'RSU', '고흥': 'RSU', '보성': 'RSU', '화순': 'KWJ', '장흥': 'KWJ',
    '강진': 'KWJ', '해남': 'KWJ', '영암': 'KWJ', '무안': 'KWJ', '함평': 'KWJ', '영광': 'KWJ',
    '장성': 'KWJ', '완도': 'RSU', '진도': 'KWJ', '신안': 'KWJ',
    
    // 기타
    '울산': 'USN', '울산시': 'USN'
  };
  
  // 해외 주요 도시 매핑
  const internationalMap = {
    '도쿄': 'NRT', '동경': 'NRT', 'tokyo': 'NRT',
    '오사카': 'KIX', 'osaka': 'KIX',
    '교토': 'KIX', 'kyoto': 'KIX',
    '후쿠오카': 'FUK', 'fukuoka': 'FUK',
    '삿포로': 'CTS', 'sapporo': 'CTS',
    '방콕': 'BKK', 'bangkok': 'BKK',
    '치앙마이': 'CNX', 'chiang mai': 'CNX',
    '푸켓': 'HKT', 'phuket': 'HKT',
    '싱가포르': 'SIN', 'singapore': 'SIN',
    '쿠알라룸푸르': 'KUL', 'kuala lumpur': 'KUL',
    '호치민': 'SGN', 'ho chi minh': 'SGN',
    '다낭': 'DAD', 'da nang': 'DAD',
    '하노이': 'HAN', 'hanoi': 'HAN',
    '타이베이': 'TPE', 'taipei': 'TPE',
    '가오슝': 'KHH', 'kaohsiung': 'KHH',
    '홍콩': 'HKG', 'hong kong': 'HKG',
    '마카오': 'MFM', 'macau': 'MFM',
    '베이징': 'PEK', 'beijing': 'PEK',
    '상하이': 'PVG', 'shanghai': 'PVG',
    '시안': 'XIY', 'xian': 'XIY',
    '청두': 'CTU', 'chengdu': 'CTU',
    '괌': 'GUM', 'guam': 'GUM',
    '사이판': 'SPN', 'saipan': 'SPN',
    '세부': 'CEB', 'cebu': 'CEB',
    '보라카이': 'MPH', 'boracay': 'MPH',
    '마닐라': 'MNL', 'manila': 'MNL',
    '발리': 'DPS', 'bali': 'DPS',
    '자카르타': 'CGK', 'jakarta': 'CGK'
  };
  
  // 입력된 문자열에서 공항/도시 이름 찾기
  const input = str.trim().toLowerCase();
  
  // 1. 직접 공항 이름 확인
  for (const [name, code] of Object.entries(airportMap)) {
    if (input.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  // 2. 지역명으로 주변 공항 찾기
  for (const [region, code] of Object.entries(regionAirportMap)) {
    if (input.includes(region.toLowerCase())) {
      return code;
    }
  }
  
  // 3. 해외 도시 확인
  for (const [name, code] of Object.entries(internationalMap)) {
    if (input.includes(name.toLowerCase())) {
      return code;
    }
  }
  
  // 4. 이미 IATA 코드인 경우 (3글자 대문자)
  if (/^[A-Z]{3}$/.test(str.trim().toUpperCase())) {
    return str.trim().toUpperCase();
  }
  
  return '';
}

function ResultPage({ recommendation, email, onEmailChange, onSendEmail, emailSent, loading, onReset, onGoToMain, surveyData }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showReRecommendModal, setShowReRecommendModal] = useState(false);
  const [rememberSurvey, setRememberSurvey] = useState(false);
  // 설문 캐시 저장
  const saveSurveyCache = () => {
    if (surveyData) {
      localStorage.setItem('tripto_survey_cache', JSON.stringify(surveyData));
    }
  };

  // 설문 캐시 불러오기
  const loadSurveyCache = () => {
    const cached = localStorage.getItem('tripto_survey_cache');
    return cached ? JSON.parse(cached) : null;
  };

  // 다시 추천받기 버튼 클릭 시 모달 오픈
  const handleReRecommendClick = () => {
    setShowReRecommendModal(true);
  };

  // 모달 내 확인 버튼 클릭 시
  const handleReRecommendConfirm = () => {
    if (rememberSurvey) {
      saveSurveyCache();
    } else {
      localStorage.removeItem('tripto_survey_cache');
    }
    setShowReRecommendModal(false);
    onReset();
  };

  // 모달 내 취소 버튼 클릭 시
  const handleReRecommendCancel = () => {
    setShowReRecommendModal(false);
  };
  const [showDetail, setShowDetail] = useState(false);
  const [origin, setOrigin] = useState('');
  const [hotelSite, setHotelSite] = useState('booking');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [customDomain, setCustomDomain] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(false);
  const detailRef = React.useRef();
  let cards = [];
  if (Array.isArray(recommendation)) {
    cards = recommendation;
  } else {
    cards = parseRecommendation(recommendation);
  }

  // 설문 데이터에서 필요한 정보 추출
  const nights = surveyData?.q5 || '3박'; // 여행 기간
  const totalPeople = parseInt(surveyData?.q4_1) || 1; // 총 인원수
  const userBudget = parseInt(surveyData?.q4) || 0; // 사용자 예산 (만원)
  
  // 예산 검증 함수
  const checkBudgetExceeded = (card) => {
    if (!userBudget) return false;
    
    // 서버 제공 총 비용이 있는 경우
    if (card.total_cost) {
      const totalCostMatch = card.total_cost.match(/(\d+(?:\.\d+)?)/);
      const totalCost = totalCostMatch ? parseFloat(totalCostMatch[1]) : 0;
      return totalCost > userBudget;
    }
    
    // 클라이언트 계산 비용 사용
    const costs = calculateCosts(card);
    return costs.totalCost > userBudget;
  };
  
  // 비용 계산 함수
  const calculateCosts = (card) => {
    // 박수 추출 (예: "3박" -> 3)
    const nightsNum = parseInt(nights.replace('박', '')) || 3;
    
    // 항공료에서 숫자 추출 후 최저가로 조정 (약 30% 할인)
    const flightMatch = card.flight?.match(/(\d+(?:\.\d+)?)/);
    const originalFlightCost = flightMatch ? parseFloat(flightMatch[1]) : 0;
    const flightCost = Math.round(originalFlightCost * 0.7); // 최저가로 30% 할인
    
    // 숙박비에서 숫자 추출 후 최저가로 조정 (약 40% 할인)
    const hotelMatch = card.hotel?.match(/(\d+(?:\.\d+)?)/);
    const originalHotelCostPerNight = hotelMatch ? parseFloat(hotelMatch[1]) : 0;
    const hotelCostPerNight = Math.round(originalHotelCostPerNight * 0.6); // 최저가로 40% 할인
    
    // 1인당 비용 계산
    const flightCostPerPerson = flightCost; // 항공료는 이미 1인당 기준
    const hotelCostPerPerson = hotelCostPerNight * nightsNum; // 총 숙박비
    const totalCostPerPerson = flightCostPerPerson + hotelCostPerPerson;
    
    // 총 비용 계산 (전체 인원)
    const totalFlightCost = flightCostPerPerson * totalPeople;
    const totalHotelCost = hotelCostPerPerson * totalPeople;
    const grandTotal = totalCostPerPerson * totalPeople;
    
    return {
      flightCostPerPerson,
      hotelCostPerPerson,
      totalCostPerPerson,
      totalFlightCost,
      totalHotelCost,
      totalCost: grandTotal,
      people: totalPeople,
      nightsNum,
      discountedFlightCost: flightCost,
      discountedHotelCostPerNight: hotelCostPerNight
    };
  };

  //동반자 정보로 잘 안나옴 영상이 없는 걸수도.....

  // YouTube 비디오 검색 함수
  const searchYouTubeVideos = async (destination) => {
    if (youtubeVideos[destination]) {
      return youtubeVideos[destination]; // 이미 검색한 결과가 있으면 재사용
    }

    setLoadingVideos(true);
    try {
      // 동반자 정보 추출
      const companion = surveyData?.companion || null;
      
      const response = await fetch('/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, companion, maxResults: 5 })
      });

      if (response.ok) {
        const data = await response.json();
        const videos = data.videos || [];
        
        // 결과를 상태에 저장
        setYoutubeVideos(prev => ({
          ...prev,
          [destination]: videos
        }));
        
        return videos;
      } else {
        console.error('YouTube API 호출 실패');
        return [];
      }
    } catch (error) {
      console.error('YouTube 검색 오류:', error);
      return [];
    } finally {
      setLoadingVideos(false);
    }
  };

  // 선택된 카드가 변경될 때 YouTube 비디오 검색
  React.useEffect(() => {
    if (selectedIdx !== null && cards[selectedIdx]) {
      let cityName = cards[selectedIdx].place;
      const cityMatch = cityName.match(/\(([^)]+)\)/);
      if (cityMatch) {
        cityName = cityMatch[1];
      } else {
        cityName = cityName.replace(/\s*\([A-Z]{3}\)/, '').trim();
      }
      if (cityName.includes(',')) {
        cityName = cityName.split(',')[0].trim();
      }
      
      searchYouTubeVideos(cityName);
    }
  }, [selectedIdx]);

  // 우측 컨텐츠 애니메이션 자연스럽게 적용
  React.useEffect(() => {
    if (showDetail && detailRef.current) {
      detailRef.current.style.opacity = 0;
      detailRef.current.style.transform = 'translateY(60px)';
      requestAnimationFrame(() => {
        detailRef.current.style.opacity = 1;
        detailRef.current.style.transform = 'translateY(0)';
      });
    }
  }, [showDetail]);
  
  // 좌측 이동과 동시에 우측 컨텐츠 보여주기 (딜레이 없음)
  React.useEffect(() => {
    setShowDetail(selectedIdx !== null);
  }, [selectedIdx]);

  const handleCardClick = (idx) => {
    setSelectedIdx(idx);
  };

  const handleClose = () => {
    setSelectedIdx(null);
  };

  const handleEmailSend = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    setIsEmailSending(true);
    try {
      const htmlContent = getRecommendationHtml(recommendation);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: '여행 추천 결과',
          html: htmlContent
        }),
      });
      alert('이메일이 성공적으로 전송되었습니다!');
    } catch (error) {
      console.error('이메일 전송 오류:', error);
      alert('이메일 전송에 실패했습니다.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleOriginChange = (value) => {
    setOrigin(value);
  };

  const handleHotelSiteChange = (value) => {
    setHotelSite(value);
  };

  return (
    <>
      {/* 고정 네비게이션 바 */}
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '1.8em',
          fontWeight: '800',
          color: '#1976d2',
          cursor: 'pointer',
          fontFamily: '"Poppins", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          letterSpacing: '-0.02em'
        }} onClick={onGoToMain || onReset}>
          TRIPTO
        </div>
        
        {/* 이메일 입력 영역 - 네비바 중앙에 배치 (아이디+도메인 분리, 직접입력 지원) */}
        {selectedIdx === null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <input
              type="text"
              value={emailId}
              onChange={e => setEmailId(e.target.value)}
              placeholder="아이디"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                width: '100px'
              }}
            />
            <span>@</span>
            {emailDomain === 'custom' && (
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="도메인 입력"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '120px'
                }}
              />
            )}
            <select
              value={emailDomain}
              onChange={e => setEmailDomain(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                width: '120px'
              }}
            >
              <option value="gmail.com">gmail.com</option>
              <option value="naver.com">naver.com</option>
              <option value="daum.net">daum.net</option>
              <option value="kakao.com">kakao.com</option>
              <option value="custom">직접 입력</option>
            </select>
            <button
              onClick={() => {
                const domain = emailDomain === 'custom' ? customDomain : emailDomain;
                onSendEmail(`${emailId}@${domain}`);
              }}
              disabled={loading || !emailId.trim() || (emailDomain === 'custom' && !customDomain.trim())}
              style={{
                padding: '8px 16px',
                backgroundColor: loading ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? '전송 중...' : '이메일로 결과 받기'}
            </button>
          </div>
        )}
        
        {/* 우측 빈 공간 (레이아웃 균형용) */}
        <div style={{ width: '120px' }}></div>
      </div>
      
      {/* 메인 컨테이너 */}
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 60px)', 
        maxHeight: 'calc(100vh - 60px)',
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'stretch',
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0
      }}>
        
        {/* 좌측 영역 - 카드 리스트 */}
        <div style={selectedIdx === null ? {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          minHeight: '100vh',
          paddingTop: '20px',
          paddingBottom: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
        } : {
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '29vw',
          minWidth: 280,
          maxWidth: 646,
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          background: '#ffffff',
          zIndex: 10,
          padding: '20px 16px',
        }}>
          
          {/* 여행지 클릭 안내 메시지 */}
          {cards.length > 0 && (
            <div style={{
              width: '423px',  // 카드와 동일한 너비
              maxWidth: '423px',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1.5px solid #1976d2',
              borderRadius: 12,
              padding: '16px',
              marginBottom: 16,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(25,118,210,0.1)',
              boxSizing: 'border-box'  // 카드와 동일한 박스 사이징
            }}>
              <div style={{ 
                fontSize: '1.1em', 
                fontWeight: 'bold', 
                color: '#1976d2',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <span>👆</span>
                <span>여행지 클릭 안내</span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.95em', 
                color: '#1565c0',
                lineHeight: 1.4
              }}>
                각 여행지를 클릭하시면 상세정보를 확인할 수 있습니다
              </p>
            </div>
          )}

          {cards.length > 0 ? (
            cards.map((card, idx) => (
              <div
                key={idx}
                ref={el => {
                  if (selectedIdx === idx && el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                style={{
                  width: '423px',  // 368px * 1.15 = 423px (15% 증가)
                  maxWidth: '423px',
                  background: '#fafdff',
                  borderRadius: 16,
                  boxShadow: selectedIdx === idx ? '0 4px 16px rgba(25,118,210,0.18)' : '0 2px 12px rgba(25,118,210,0.06)',
                  border: '2.5px solid',
                  borderColor: selectedIdx === idx ? '#1976d2' : '#bcdffb',
                  borderLeft: selectedIdx === idx ? '8px solid #1976d2' : '2.5px solid #bcdffb',
                  padding: '24px 24px 20px 24px',  // 16px에서 24px로 증가하여 여유 공간 확보
                  marginBottom: 16,
                  textAlign: 'left',
                  fontSize: '1.05em',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.18s, border-color 0.18s',
                  transform: 'translateY(0)',
                  boxSizing: 'border-box'
                }}
                onClick={() => setSelectedIdx(idx)}
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
                {card.flight && (() => {
                  const costs = calculateCosts(card);
                  return (
                    <div>
                      1인당 항공료: <span style={{ fontWeight: 500 }}>{costs.discountedFlightCost}만원</span> 
                      <span style={{ fontSize: '0.85em', color: '#666', marginLeft: 4 }}>(왕복)</span>
                    </div>
                  );
                })()}
                {card.hotel && (() => {
                  const costs = calculateCosts(card);
                  const nightsText = surveyData?.q5 || '3박';
                  return (
                    <div>
                      1인당 숙박비: <span style={{ fontWeight: 500 }}>{costs.hotelCostPerPerson}만원</span> 
                      <span style={{ fontSize: '0.85em', color: '#666', marginLeft: 4 }}>({nightsText})</span>
                    </div>
                  );
                })()}
                {(card.flight || card.hotel || card.total_cost) && (() => {
                  const isBudgetExceeded = checkBudgetExceeded(card);
                  
                  // 제미나이가 제공한 total_cost를 우선 사용
                  if (card.total_cost) {
                    return (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #eee', fontSize: '0.95em' }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: isBudgetExceeded ? '#ff5722' : '#e91e63',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          💰 총 예상 비용: {card.total_cost}
                          {isBudgetExceeded && userBudget > 0 && (
                            <span style={{ 
                              fontSize: '0.8em', 
                              backgroundColor: '#ff5722', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}>
                              예산 초과
                            </span>
                          )}
                        </div>
                        {userBudget > 0 && (
                          <div style={{ fontSize: '0.85em', color: '#666', marginTop: 2 }}>
                            설정 예산: {userBudget}만원
                          </div>
                        )}
                        {userBudget > 0 && (() => {
                          const totalCostMatch = card.total_cost.match(/(\d+(?:\.\d+)?)/);
                          const totalCost = totalCostMatch ? parseFloat(totalCostMatch[1]) : 0;
                          const remaining = userBudget - totalCost;
                          
                          if (remaining > 0) {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#2e7d32', marginTop: 4, fontWeight: '500' }}>
                                💰 예산 여유: {remaining}만원
                              </div>
                            );
                          } else if (remaining === 0) {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#ff9800', marginTop: 4, fontWeight: '500' }}>
                                ⚖️ 예산 딱 맞음
                              </div>
                            );
                          } else {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#f44336', marginTop: 4, fontWeight: '500' }}>
                                ⚠️ 예산 부족: {Math.abs(remaining)}만원
                              </div>
                            );
                          }
                        })()}
                      </div>
                    );
                  }
                  
                  // total_cost가 없는 경우에만 클라이언트 계산 사용 (fallback)
                  if (card.flight || card.hotel) {
                    const costs = calculateCosts(card);
                    return (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #eee', fontSize: '0.95em' }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: isBudgetExceeded ? '#ff5722' : '#e91e63',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          총 비용: {costs.totalCost}만원 ({costs.people}명 기준)
                          {isBudgetExceeded && userBudget > 0 && (
                            <span style={{ 
                              fontSize: '0.8em', 
                              backgroundColor: '#ff5722', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: '4px' 
                            }}>
                              예산 초과
                            </span>
                          )}
                        </div>
                        {userBudget > 0 && (
                          <div style={{ fontSize: '0.85em', color: '#666', marginTop: 2 }}>
                            설정 예산: {userBudget}만원
                          </div>
                        )}
                        {userBudget > 0 && (() => {
                          const remaining = userBudget - costs.totalCost;
                          
                          if (remaining > 0) {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#2e7d32', marginTop: 4, fontWeight: '500' }}>
                                💰 예산 여유: {remaining}만원
                              </div>
                            );
                          } else if (remaining === 0) {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#ff9800', marginTop: 4, fontWeight: '500' }}>
                                ⚖️ 예산 딱 맞음
                              </div>
                            );
                          } else {
                            return (
                              <div style={{ fontSize: '0.8em', color: '#f44336', marginTop: 4, fontWeight: '500' }}>
                                ⚠️ 예산 부족: {Math.abs(remaining)}만원
                              </div>
                            );
                          }
                        })()}
                      </div>
                    );
                  }
                  
                  return null;
                })()}
                {card.reason && (
                  <div style={{ marginTop: 8, color: '#333', fontSize: '0.95em' }}>
                    {card.reason.length > 80 ? `${card.reason.substring(0, 80)}...` : card.reason}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ 
              fontSize: '1.1em', 
              color: '#666', 
              marginTop: 32, 
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ marginBottom: '12px', fontSize: '1.2em' }}>🔄</div>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>추천 결과를 처리하는 중 문제가 발생했습니다</div>
              <div style={{ fontSize: '0.95em', color: '#888', marginBottom: '16px' }}>
                AI가 응답을 생성했지만 형식을 인식할 수 없습니다.<br/>
                다시 시도하면 정상적으로 작동할 가능성이 높습니다.
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.9em',
                  cursor: 'pointer'
                }}
              >
                다시 시도하기
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, marginBottom: '2%' }}>
            <button 
              onClick={handleReRecommendClick}
              style={{ 
                padding: '12px 32px', 
                fontSize: '1.1em', 
                borderRadius: 8, 
                background: '#1976d2', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginBottom: '30px'
              }}
            >
              다시 추천받기
            </button>
            <CustomModal
              open={showReRecommendModal}
              title="다시 추천받기"
              onClose={handleReRecommendCancel}
              actions={[
                <button key="confirm" onClick={handleReRecommendConfirm} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer' }}>확인</button>,
                <button key="cancel" onClick={handleReRecommendCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
              ]}
            >
              <div style={{ fontSize: '1.05em', marginBottom: 12 }}>
                기존에 사용자가 설문했던 내용을 기억할까요?<br/>
                <label style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                  <input type="checkbox" checked={rememberSurvey} onChange={e => setRememberSurvey(e.target.checked)} style={{ marginRight: 8 }} />
                  설문 내용 기억하기 (다음 설문에 바로 반영)
                </label>
              </div>
              {rememberSurvey && (
                <div style={{ fontSize: '0.95em', color: '#1976d2', marginTop: 8 }}>
                  설문 내용은 캐시에 저장되어 다음 설문 시작 시 자동으로 불러옵니다.<br/>
                  <span style={{ color: '#888', fontSize: '0.92em' }}>
                    (설문 시작 페이지에서 수정 가능합니다)
                  </span>
                </div>
              )}
            </CustomModal>
          </div>
        </div>

        {/* 우측: 상세 정보 영역 */}
        {showDetail && selectedIdx !== null && cards[selectedIdx] && (
          <div ref={detailRef} style={{
            position: 'fixed',
            top: '76px',
            right: '16px',
            width: 'calc(70vw - 32px)',
            height: 'calc(100vh - 92px)',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(25,118,210,0.13)',
            border: '2px solid #bcdffb',
            padding: '38px 38px 32px 38px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            {/* 닫기 버튼 */}
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <button 
                onClick={() => setSelectedIdx(null)} 
                onMouseEnter={(e) => {
                  e.target.style.background = '#dc3545';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#000';
                }}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '1em', 
                  borderRadius: 4, 
                  background: '#fff', 
                  color: '#000', 
                  border: '1px solid #ddd', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  minWidth: '28px',
                  height: '28px',
                  transition: 'all 0.2s ease'
                }}
              >×</button>
            </div>
            
            {/* 제목 영역 */}
            <div style={{ 
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #ddd',
              textAlign: 'center',
              width: '100%'
            }}>
              <h2 style={{ 
                color: '#1976d2', 
                fontSize: '2.25em',
                margin: '0 auto',
                textAlign: 'center',
                display: 'block',
                width: '100%'
              }}>{cards[selectedIdx].place}</h2>
            </div>
            
            <div style={{ textAlign: 'center', width: '100%' }}>
              {/* 예상 비용 정보와 추천이유를 가로로 배치 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: 28, width: '100%' }}>
                {/* 예상 비용 정보 - 좌측 30% */}
                <div style={{ flex: '3' }}>
                  <div style={{ 
                    marginBottom: '16px', 
                    fontSize: '1.1em', 
                    color: '#6c757d', 
                    fontWeight: 'bold', 
                    textAlign: 'center'
                  }}>💰 예상 비용</div>
                  <div style={{ 
                    fontSize: '1.08em', 
                    lineHeight: '1.8', 
                    padding: '16px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '8px', 
                    border: '1px solid #e9ecef',
                    height: '300px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'auto'
                  }}>
                    {(() => {
                      const selectedCard = cards[selectedIdx];
                      const costs = calculateCosts(selectedCard);
                      const nights = surveyData?.q5 || '3박';
                      const people = costs.people;
                      const isBudgetExceeded = checkBudgetExceeded(selectedCard);
                      
                      // 제미나이가 제공한 total_cost가 있으면 우선 사용
                      if (selectedCard.total_cost) {
                        const totalCostMatch = selectedCard.total_cost.match(/(\d+(?:\.\d+)?)/);
                        const totalCost = totalCostMatch ? parseFloat(totalCostMatch[1]) : 0;
                        const remaining = userBudget - totalCost;
                        
                        return (
                          <>
                            <div style={{ 
                              padding: '8px', 
                              backgroundColor: isBudgetExceeded ? '#ffebee' : '#fce4ec', 
                              borderRadius: '6px',
                              border: isBudgetExceeded ? '1px solid #ff5722' : 'none'
                            }}>
                              <div style={{ fontSize: '0.95em', color: '#555', marginBottom: '6px' }}>총 예상 비용</div>
                              <div style={{ 
                                fontSize: '1.1em', 
                                fontWeight: 'bold', 
                                color: isBudgetExceeded ? '#ff5722' : '#e91e63',  
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}>
                                {selectedCard.total_cost}
                                {isBudgetExceeded && userBudget > 0 && (
                                  <span style={{ 
                                    fontSize: '0.7em', 
                                    backgroundColor: '#ff5722', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px' 
                                  }}>
                                    예산 초과
                                  </span>
                                )}
                              </div>
                              {userBudget > 0 && (
                                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                                  설정 예산: {userBudget}만원
                                </div>
                              )}
                            </div>
                            {userBudget > 0 && (
                              <div style={{ 
                                marginTop: '12px', 
                                padding: '8px', 
                                backgroundColor: remaining > 0 ? '#e8f5e8' : remaining === 0 ? '#fff3e0' : '#ffebee', 
                                borderRadius: '6px',
                                textAlign: 'center'
                              }}>
                                {remaining > 0 ? (
                                  <div style={{ fontSize: '0.9em', color: '#2e7d32', fontWeight: '500' }}>
                                    💰 예산 여유: {remaining}만원
                                  </div>
                                ) : remaining === 0 ? (
                                  <div style={{ fontSize: '0.9em', color: '#ff9800', fontWeight: '500' }}>
                                    ⚖️ 예산 딱 맞음
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.9em', color: '#f44336', fontWeight: '500' }}>
                                    ⚠️ 예산 부족: {Math.abs(remaining)}만원
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      }
                      
                      // total_cost가 없으면 기존 계산 방식 사용
                      const remaining = userBudget - costs.totalCost;
                      return (
                        <>
                          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                            <div style={{ fontSize: '0.95em', color: '#555', marginBottom: '6px' }}>1인당 비용 (최저가)</div>
                            <div style={{ marginBottom: '4px' }}>
                              <b>항공료:</b> {costs.discountedFlightCost}만원 <span style={{ fontSize: '0.9em', color: '#666' }}>(왕복)</span>
                            </div>
                            <div>
                              <b>숙박비:</b> {costs.hotelCostPerPerson}만원 <span style={{ fontSize: '0.9em', color: '#666' }}>({nights})</span>
                            </div>
                          </div>
                          <div style={{ 
                            padding: '8px', 
                            backgroundColor: isBudgetExceeded ? '#ffebee' : '#fce4ec', 
                            borderRadius: '6px',
                            border: isBudgetExceeded ? '1px solid #ff5722' : 'none'
                          }}>
                            <div style={{ fontSize: '0.95em', color: '#555', marginBottom: '6px' }}>총 비용 (예상 최저가 기준)</div>
                            <div style={{ 
                              fontSize: '1.1em', 
                              fontWeight: 'bold', 
                              color: isBudgetExceeded ? '#ff5722' : '#e91e63',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}>
                              {costs.totalCost}만원 <span style={{ fontSize: '0.9em', color: '#666' }}>({people}명 기준)</span>
                              {isBudgetExceeded && userBudget > 0 && (
                                <span style={{ 
                                  fontSize: '0.7em', 
                                  backgroundColor: '#ff5722', 
                                  color: 'white', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px' 
                                }}>
                                  예산 초과
                                </span>
                              )}
                            </div>
                            {userBudget > 0 && (
                              <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                                설정 예산: {userBudget}만원
                              </div>
                            )}
                          </div>
                          {userBudget > 0 && (
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '8px', 
                              backgroundColor: remaining > 0 ? '#e8f5e8' : remaining === 0 ? '#fff3e0' : '#ffebee', 
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              {remaining > 0 ? (
                                <div style={{ fontSize: '0.9em', color: '#2e7d32', fontWeight: '500' }}>
                                  💰 예산 여유: {remaining}만원
                                </div>
                              ) : remaining === 0 ? (
                                <div style={{ fontSize: '0.9em', color: '#ff9800', fontWeight: '500' }}>
                                  ⚖️ 예산 딱 맞음
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.9em', color: '#f44336', fontWeight: '500' }}>
                                  ⚠️ 예산 부족: {Math.abs(remaining)}만원
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* 추천이유 - 우측 70% */}
                <div style={{ flex: '7' }}>
                  <div style={{ 
                    marginBottom: '16px', 
                    fontSize: '1.1em', 
                    color: '#856404', 
                    fontWeight: 'bold', 
                    textAlign: 'center'
                  }}>✨ 추천이유</div>
                  <div style={{ 
                    fontSize: '1.08em', 
                    lineHeight: '1.8', 
                    padding: '16px', 
                    backgroundColor: '#fff3cd', 
                    borderRadius: '8px', 
                    border: '1px solid #ffeaa7',
                    height: '300px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'auto'
                  }}>
                    <div>{cards[selectedIdx].reason || '-'}</div>
                  </div>
                </div>
              </div>
              
              {/* 비용 안내 메시지 */}
              <div style={{ 
                textAlign: 'center', 
                fontSize: '0.85em', 
                color: '#6c757d', 
                marginBottom: '20px',
                fontStyle: 'italic'
              }}>
                ※ 표시된 예상 비용은 최저가 기준이며, 실제 비용과 다를 수 있습니다.
              </div>
              
              {/* 항공권 및 호텔 검색 */}
              <div style={{ marginBottom: 12 }}>
                {/* 가로 배치 컨테이너 */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                  {/* 항공권 검색 섹션 */}
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #e3f2fd',
                    borderRadius: '10px',
                    backgroundColor: '#f8fcff',
                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      marginBottom: '16px', 
                      fontSize: '1.1em', 
                      color: '#1976d2', 
                      fontWeight: 'bold', 
                      textAlign: 'center'
                    }}>✈️ 항공권 검색</div>
                    
                    <div style={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      {/* 안내 텍스트 */}
                      <div style={{ 
                        fontSize: '0.85em', 
                        color: '#666', 
                        textAlign: 'left', 
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        backgroundColor: '#f8fcff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e3f2fd'
                      }}>
                        💡 거주 지역 입력시 가까운 공항으로 검색 (예: 서울→인천공항)
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '1.08em', marginRight: 8 }}>출발지</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                        placeholder="예: 서울, 인천공항"
                        style={{ width: 160, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #bcdffb', fontSize: '1em' }}
                      />
                      <button
                        onClick={() => {
                          const originCode = getIataCode(origin);
                          
                          // Gemini가 제공한 공항 코드 우선 사용, 없으면 기존 로직 사용
                          let destCode = '';
                          if (cards[selectedIdx].airport_code) {
                            destCode = cards[selectedIdx].airport_code;
                          } else {
                            // 기존 로직: 여행지 제목에서 도시명 추출
                            let destinationCity = cards[selectedIdx].place;
                            const cityMatch = destinationCity.match(/\(([^)]+)\)/);
                            if (cityMatch) {
                              destinationCity = cityMatch[1]; // 괄호 안의 도시명만 추출
                            }
                            
                            // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                            if (destinationCity.includes(',')) {
                              destinationCity = destinationCity.split(',')[0].trim();
                            }
                            
                            destCode = getIataCode(destinationCity);
                          }
                          
                          console.log('출발지 입력:', origin);
                          console.log('출발지 코드:', originCode);
                          console.log('여행지 전체:', cards[selectedIdx].place);
                          console.log('Gemini 공항 코드:', cards[selectedIdx].airport_code);
                          console.log('최종 도착지 코드:', destCode);
                          
                          if (!originCode) {
                            alert('출발지를 입력하세요. 예: 인천공항, 서울');
                            return;
                          }
                          
                          if (!destCode) {
                            alert(`도착지의 공항 코드를 찾을 수 없습니다. 직접 스카이스캐너에서 검색해주세요.`);
                            // 그래도 도시명으로 검색할 수 있도록 스카이스캐너 메인 페이지로 이동
                            window.open('https://www.skyscanner.co.kr/', '_blank');
                            return;
                          }
                          
                          const url = `https://www.skyscanner.co.kr/transport/flights/${originCode}/${destCode}/?adults=1`;
                          window.open(url, '_blank');
                        }}
                        style={{ padding: '8px 16px', fontSize: '0.95em', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                      >항공권 검색</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* 호텔 검색 섹션 */}
                  <div style={{ 
                    flex: 1,
                    padding: '16px',
                    border: '2px solid #e8f5e8',
                    borderRadius: '10px',
                    backgroundColor: '#f8fff8',
                    boxShadow: '0 1px 4px rgba(0, 53, 128, 0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      marginBottom: '16px', 
                      fontSize: '1.1em', 
                      color: '#003580', 
                      fontWeight: 'bold', 
                      textAlign: 'center'
                    }}>🏨 호텔 검색</div>
                    <div style={{ 
                      flex: 1,
                      display: 'flex', 
                      gap: '8px', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexWrap: 'wrap'
                    }}>
                      <select 
                        value={hotelSite}
                        onChange={(e) => setHotelSite(e.target.value)}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.95em', 
                          borderRadius: 6, 
                          border: '2px solid #ddd', 
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        <option value="booking">부킹닷컴</option>
                        <option value="agoda">아고다</option>
                        <option value="expedia">익스피디아</option>
                        <option value="hotels">Hotels.com</option>
                      </select>
                      <span style={{ 
                        fontSize: '0.95em', 
                        fontWeight: 'bold', 
                        color: '#333' 
                      }}>에서</span>
                      <button
                        onClick={() => {
                          // 여행지 제목에서 도시명 추출 (괄호 안의 내용)
                          let city = cards[selectedIdx].place;
                          const cityMatch = city.match(/\(([^)]+)\)/);
                          if (cityMatch) {
                            city = cityMatch[1]; // 괄호 안의 도시명만 추출
                          } else {
                            // 괄호가 없다면 IATA 코드 부분만 제거
                            city = city.replace(/\s*\([A-Z]{3}\)/, '').trim();
                          }
                          
                          // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                          if (city.includes(',')) {
                            city = city.split(',')[0].trim();
                          }
                          
                          console.log('호텔 검색 - 여행지 전체:', cards[selectedIdx].place);
                          console.log('호텔 검색 - 추출된 도시명:', city);
                          console.log('선택된 호텔 사이트:', hotelSite);
                          
                          // 선택된 사이트에 따라 URL 생성
                          let url = '';
                          switch(hotelSite) {
                            case 'booking':
                              url = `https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(city)}&lang=ko`;
                              break;
                            case 'agoda':
                              url = `https://www.agoda.com/ko-kr/search?dest=${encodeURIComponent(city)}&locale=ko-kr`;
                              break;
                            case 'expedia':
                              url = `https://www.expedia.co.kr/Hotel-Search?destination=${encodeURIComponent(city)}`;
                              break;
                            case 'hotels':
                              url = `https://kr.hotels.com/search.do?q-destination=${encodeURIComponent(city)}`;
                              break;
                            default:
                              url = `https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(city)}&lang=ko`;
                          }
                          
                          console.log('호텔 검색 URL:', url);
                          window.open(url, '_blank');
                        }}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.95em', 
                          borderRadius: 6, 
                          background: '#003580', 
                          color: '#fff', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {(() => {
                          // 버튼 텍스트용 도시명 추출
                          let city = cards[selectedIdx].place;
                          const cityMatch = city.match(/\(([^)]+)\)/);
                          if (cityMatch) {
                            city = cityMatch[1]; // 괄호 안의 도시명만 추출
                          } else {
                            // 괄호가 없다면 IATA 코드 부분만 제거
                            city = city.replace(/\s*\([A-Z]{3}\)/, '').trim();
                          }
                          
                          // 콤마로 구분된 여러 도시가 있는 경우 첫 번째 도시만 사용
                          if (city.includes(',')) {
                            city = city.split(',')[0].trim();
                          }

                          return (
                            <>
                             <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}>{city}</span> 호텔 검색
                            </>
                          );
                        })()}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 유튜브 브이로그 섹션 */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ 
                  marginBottom: '16px', 
                  fontSize: '1.1em', 
                  color: '#ff0000', 
                  fontWeight: 'bold', 
                  textAlign: 'center'
                }}>📹 {cards[selectedIdx].place} 여행 브이로그</div>
                
                <div style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '16px',
                  padding: '8px 0',
                  scrollBehavior: 'smooth'
                }}>
                  {(() => {
                    // 여행지명에서 도시명 추출
                    let cityName = cards[selectedIdx].place;
                    const cityMatch = cityName.match(/\(([^)]+)\)/);
                    if (cityMatch) {
                      cityName = cityMatch[1];
                    } else {
                      cityName = cityName.replace(/\s*\([A-Z]{3}\)/, '').trim();
                    }
                    if (cityName.includes(',')) {
                      cityName = cityName.split(',')[0].trim();
                    }

                    // 실제 YouTube API에서 가져온 비디오 데이터 사용
                    const videos = youtubeVideos[cityName] || [];
                    
                    // 로딩 중이거나 비디오가 없으면 샘플 데이터 표시
                    if (loadingVideos) {
                      return (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          minHeight: '200px',
                          width: '100%',
                          color: '#666'
                        }}>
                          🔍 브이로그를 검색하고 있습니다...
                        </div>
                      );
                    }
                    
                    if (videos.length === 0) {
                      // YouTube API 결과가 없으면 샘플 비디오 표시
                      const sampleVideos = [
                        { id: 'dQw4w9WgXcQ', title: `${cityName} 여행 브이로그` },
                        { id: 'kJQP7kiw5Fk', title: `${cityName} 맛집 투어` },
                        { id: 'L_jWHffIx5E', title: `${cityName} 힐링 여행` }
                      ];
                      
                      return sampleVideos.map((video, index) => (
                        <div 
                          key={`sample-${index}`}
                          style={{
                            minWidth: '280px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <img 
                              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                              alt={video.title}
                              style={{
                                width: '100%',
                                height: '157px',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '48px',
                              height: '48px',
                              backgroundColor: 'rgba(255, 0, 0, 0.8)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '20px'
                            }}>
                              ▶
                            </div>
                          </div>
                          <div style={{
                            padding: '12px',
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            color: '#333',
                            lineHeight: '1.3'
                          }}>
                            {video.title}
                          </div>
                        </div>
                      ));
                    }

                    return videos.map((video, index) => (
                      <div 
                        key={index}
                        style={{
                          minWidth: '280px',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                            alt={video.title}
                            style={{
                              width: '100%',
                              height: '157px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '48px',
                            height: '48px',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px'
                          }}>
                            ▶
                          </div>
                        </div>
                        <div style={{
                          padding: '12px',
                          fontSize: '0.9em',
                          fontWeight: 'bold',
                          color: '#333',
                          lineHeight: '1.3'
                        }}>
                          {video.title}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
                
                <div style={{
                  textAlign: 'center',
                  marginTop: '12px',
                  fontSize: '0.85em',
                  color: '#666'
                }}>
                  ← 좌우로 스크롤하여 더 많은 브이로그를 확인하세요 →
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ResultPage;
export { getRecommendationHtml };
