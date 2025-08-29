import requests
import json
import re
from config.settings import GEMINI_API_KEY
from services.travel_cost_service import travel_cost_service


def analyze_with_gemini(survey_data):
    """
    Gemini AI를 사용하여 설문 데이터를 분석하고 여행지를 추천하는 함수
    
    Args:
        survey_data (dict): 설문 데이터
        
    Returns:
        str: JSON 형태의 추천 결과
    """
    try:
        # 설문 데이터에서 값 추출
        style = survey_data.get('q2', '')
        budget_raw = survey_data.get('q4', '')
        nights = survey_data.get('q5', '')  # q5가 여행 기간
        travelers_raw = survey_data.get('q4_1', '1')  # q4_1이 여행 인원수
        important = survey_data.get('q1', '')
        num_recommend = survey_data.get('q11', '1')
        other_considerations = survey_data.get('q10', '')  # 기타 고려할 점 추가
        accommodation_cost_type = survey_data.get('q12', '호텔')  # 비용 계산용 숙박형태
        spending_level = survey_data.get('q4_2', '적당히 지출')  # 지출 수준 (기본값: 적당히 지출)
        
        # 여행 인원수 처리
        try:
            travelers = int(travelers_raw)
        except (ValueError, TypeError):
            travelers = 1
        
        # 디버깅: 예산 관련 정보 로그 출력
        print(f"[예산 정보]: budget_raw={budget_raw}, spending_level={spending_level}, accommodation_type={accommodation_cost_type}, travelers={travelers}")
        
        # 국내/해외 선택 정보 추출 (다중 선택 가능)
        travel_type_raw = survey_data.get('q0', '')
        if isinstance(travel_type_raw, list):
            travel_type = ', '.join(travel_type_raw)
        else:
            travel_type = travel_type_raw

        # 예산을 만원 단위에서 원 단위로 변환
        try:
            budget = int(budget_raw)
        except (ValueError, TypeError):
            budget = budget_raw

        # 기타 고려사항이 있는 경우 최우선 조건으로 처리
        priority_condition = ""
        if other_considerations and other_considerations.strip():
            priority_condition = f"【최우선 조건】 사용자의 특별 요청사항: '{other_considerations}' - 이 조건을 반드시 100% 충족하는 여행지만 추천해주세요. 다른 모든 조건보다 이 요청사항을 우선시하여 추천해주세요. "

        # Travel Cost API 사용 가능 여부 확인
        use_accurate_costs = travel_cost_service.is_available()
        print(f"[Travel Cost API 상태]: {'사용 가능' if use_accurate_costs else '사용 불가 - 기본 로직 사용'}")

        # 프롬프트 생성
        prompt = _build_prompt(priority_condition, important, travel_type, style, budget, nights, num_recommend, travelers, use_accurate_costs)
        
        # Gemini API 호출
        result = _call_gemini_api(prompt)
        
        # 정확한 경비 정보가 사용 가능한 경우, 결과를 업데이트
        if use_accurate_costs and result:
            result = _enhance_with_accurate_costs(result, nights, accommodation_cost_type, budget_raw, spending_level, travelers)
        
        return result
                
    except Exception as e:
        return f"Gemini API 호출 오류: {str(e)}"


def _build_prompt(priority_condition, important, travel_type, style, budget, nights, num_recommend, travelers=1, use_accurate_costs=False):
    """Gemini AI용 프롬프트를 생성하는 내부 함수"""
    cost_instruction = ""
    if use_accurate_costs:
        cost_instruction = (
            f"💡 중요: 정확한 비용 데이터베이스가 연결되어 있습니다. "
            f"추천 후 실제 정확한 비용으로 자동 업데이트됩니다. "
            f"여행지 추천에 집중하되, 가능하면 다음 지역들을 우선 고려해주세요: "
            f"일본, 한국, 중국, 태국, 베트남, 싱가포르, 말레이시아, 프랑스, 이탈리아, 독일, 미국, 캐나다. "
        )
    else:
        cost_instruction = (
            f"💡 비용 계산 원칙: 모든 여행지는 최저가 기준으로 계산해 주세요. "
            f"항공료와 숙박비는 현실적인 최저가를 반영하되, 예산에 억지로 맞추려고 하지 마세요. "
        )
    
    return (
        f"당신은 여행 추천 전문가입니다. "
        f"{priority_condition}"
        f"사용자가 '{important}'를 가장 중요하게 생각하며, "
        f"여행 유형은 '{travel_type}'입니다. "
        f"여행 스타일은 '{style}', 예산은 '{budget}만원', 여행 기간은 '{nights}', 여행 인원은 '{travelers}명'입니다. "
        f"{cost_instruction}"
        f"📊 예산 참고: 사용자 예산 '{budget}만원'은 전체 {travelers}명의 총 예산입니다. 예산 초과 여부는 클라이언트에서 판단합니다. "
        f"✈️ 항공료: 해당 목적지까지의 현실적인 최저가 항공료 (왕복 기준, 1인당)"
        f"🏨 숙박비: 현실적인 최저가 숙박비 (1박 기준, 1인당) - 게스트하우스, 호스텔, 저가 호텔 등 포함"
        f"💰 현지 사용 금액: 현지 물가를 고려한 최소 필요 생활비 (교통비, 식비, 관광비 등 포함, 전체 {travelers}명 기준)"
        f"추천 시, 반드시 현지 물가와 입력된 예산(원화 기준)을 해당 국가의 환율로 환전했을 때 실제 현지에서 사용할 수 있는 금액을 고려하세요. "
        f"모든 가격(항공료, 숙박비, 현지 사용 가능 금액 등)은 반드시 만원 단위로 반환해 주세요. 예시: 항공료:40만원, 숙박비:20만원, 현지 사용 가능 금액:30만원 등. "
        f"사용자가 추천받고 싶은 여행지 개수는 '{num_recommend}개'입니다. 반드시 가장 적절한 여행지 중 사용자가 요청한 개수만큼만 추천해 주세요. 단, 5개를 초과해서 추천하지 마세요. "
        f"🎯 추천 기준: 사용자의 여행 선호도와 스타일에 가장 잘 맞는 여행지를 우선으로 추천하되, 현실적인 최저가 비용을 정확히 제공해 주세요. "
        f"중요: 각 여행지마다 가장 가까운 주요 공항의 IATA 코드(3글자)를 반드시 포함해 주세요. 예: 도쿄→NRT, 방콕→BKK, 싱가포르→SIN 등 "
        f"추천이유는 반드시 6줄 이상 상세하게 작성해 주세요. 해당 여행지의 특색, 사용자 선호도와의 연관성, 계절적 특징, 주요 관광지, 현지 문화, 음식 등을 포함하여 구체적이고 매력적으로 설명해 주세요. "
        f"추천 결과는 반드시 아래와 같은 JSON 배열 형식으로만 반환해 주세요. 다른 설명이나 텍스트 없이 JSON만 출력하세요. JSON 키와 값은 반드시 큰따옴표를 사용해 주세요.\n"
        f'[\n  {{\n    "place": "여행지명",\n    "flight": "항공권 최저가 (1인 왕복)",\n    "hotel": "숙박비 최저가 (1인 1박)",\n    "reason": "추천 이유 (6줄 이상 상세 작성)",\n    "local_price": "현지 최소 생활비 (전체 {travelers}명 {nights} 기준)",\n    "total_cost": "총 예상 비용 (전체 {travelers}명 {nights} 기준: 항공료×{travelers}+숙박비×{travelers}×{nights}+현지생활비)",\n    "airport_code": "IATA코드"\n  }}, ...\n]'
    )


def _call_gemini_api(prompt):
    """Gemini API를 호출하는 내부 함수"""
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    params = {"key": GEMINI_API_KEY}
    
    # 재시도 로직
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"[Gemini API 호출 시도 {attempt + 1}/{max_retries}]")
            response = requests.post(url, headers=headers, params=params, json=payload, timeout=30)
            response.raise_for_status()
            result_data = response.json()
            print("[Gemini API 응답 전체]:", result_data)
            
            # Gemini 응답에서 추천 결과 추출
            result = result_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '추천 결과를 가져올 수 없습니다.')
            print("[Gemini 추천 결과 텍스트]:", result)
            
            # JSON 응답 정리
            cleaned_result = _clean_json_response(result)
            print("[최종 정리된 결과]:", cleaned_result)
            return cleaned_result
            
        except requests.exceptions.Timeout:
            print(f"[타임아웃 오류] 시도 {attempt + 1}/{max_retries}")
            if attempt == max_retries - 1:
                return "Gemini API 타임아웃 오류: 서버 응답이 없습니다. 잠시 후 다시 시도해주세요."
            continue
        except Exception as e:
            print(f"[API 호출 오류] 시도 {attempt + 1}/{max_retries}: {str(e)}")
            if attempt == max_retries - 1:
                return f"Gemini API 호출 오류: {str(e)}"
            continue


def _clean_json_response(result):
    """Gemini 응답을 JSON 형태로 정리하는 내부 함수"""
    cleaned_result = result.strip()
    print(f"[정리 전 결과]: {cleaned_result}")
    
    # 백틱 제거
    if '```json' in cleaned_result:
        cleaned_result = cleaned_result.split('```json')[1].split('```')[0].strip()
    elif '```' in cleaned_result:
        parts = cleaned_result.split('```')
        if len(parts) >= 3:
            cleaned_result = parts[1].strip()
            
    print(f"[백틱 제거 후]: {cleaned_result}")
    
    # JSON 문법 정리
    cleaned_result = re.sub(r"'([^']*)':", r'"\1":', cleaned_result)  # 키 변경
    cleaned_result = re.sub(r": '([^']*)'(?=,|\s*}|\s*\])", r': "\1"', cleaned_result)  # 값 변경
    cleaned_result = re.sub(r'\n\s*', ' ', cleaned_result)  # 줄바꿈 제거
    cleaned_result = re.sub(r'\s+', ' ', cleaned_result)  # 중복 공백 제거
    
    # JSON 유효성 검증
    try:
        parsed_json = json.loads(cleaned_result)
        cleaned_result = json.dumps(parsed_json, ensure_ascii=False)
        print(f"[JSON 유효성 검증 성공]: {cleaned_result}")
    except json.JSONDecodeError as e:
        print(f"[JSON 유효성 검증 실패]: {e}")
        # 기본 응답 생성
        cleaned_result = json.dumps([{
            "place": "추천 결과 파싱 오류",
            "flight": "정보없음",
            "hotel": "정보없음", 
            "reason": "죄송합니다. 추천 결과를 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
            "local_price": "정보없음",
            "airport_code": "N/A"
        }], ensure_ascii=False)
    
    return cleaned_result


def _enhance_with_accurate_costs(gemini_result, nights, accommodation_type="호텔", total_budget=None, spending_level=None, travelers=1):
    """
    Gemini 결과를 정확한 MCP 서버의 경비 데이터로 강화하는 함수
    
    Args:
        gemini_result (str): Gemini AI 추천 결과 (JSON 문자열)
        nights (str): 여행 일수
        accommodation_type (str): 숙박 형태 (호텔, 게스트하우스, 리조트, 펜션)
        total_budget (str): 총 예산 (만원 단위)
        spending_level (str): 지출 수준 (가성비 지출, 적당히 지출, 모두 지출)
        travelers (int): 여행 인원수
        
    Returns:
        str: 정확한 경비 정보로 업데이트된 JSON 문자열
    """
    try:
        # Gemini 결과 파싱
        recommendations = json.loads(gemini_result)
        if not isinstance(recommendations, list):
            return gemini_result
        
        # 여행 일수 처리
        try:
            # "3박" -> 3, "1주일" -> 7 등의 변환
            import re
            if isinstance(nights, str):
                # 숫자 추출
                number_match = re.search(r'(\d+)', nights)
                if number_match:
                    days = int(number_match.group(1))
                    # "박" 단위인 경우 그대로, "일" 단위인 경우 그대로
                    if '박' in nights:
                        days = days  # 3박 = 3일
                    elif '주' in nights:
                        days = days * 7  # 1주일 = 7일
                else:
                    days = 7  # 기본값
            else:
                days = int(nights)
        except (ValueError, TypeError):
            days = 7  # 기본값
        
        print(f"[여행 일수 파싱]: '{nights}' -> {days}일")
        
        updated_recommendations = []
        
        for rec in recommendations:
            place = rec.get('place', '').lower()
            
            # MCP 서버에서 정확한 경비 정보 가져오기
            print(f"[정확한 경비 조회 시도]: {place}")
            
            # 여행지 이름을 MCP 서버 키와 매칭
            mcp_destination = _map_place_to_mcp_key(place)
            
            if mcp_destination:
                # 예산 정보가 있으면 예산 기반 계산, 없으면 mid-range 계산
                try:
                    budget_value = int(total_budget) if total_budget else None
                except (ValueError, TypeError):
                    budget_value = None
                
                # 실제 여행 인원수 사용
                actual_travelers = travelers
                
                if budget_value and spending_level:
                    # 예산 기반 계산
                    cost_data = travel_cost_service.get_travel_cost(
                        destination=mcp_destination,
                        days=days,
                        travelers=actual_travelers,
                        accommodation_type=accommodation_type,
                        total_budget=budget_value,
                        spending_level=spending_level
                    )
                else:
                    # 기존 레벨 기반 계산
                    cost_data = travel_cost_service.get_travel_cost(
                        destination=mcp_destination,
                        days=days,
                        budget_level="mid",
                        travelers=actual_travelers,
                        accommodation_type=accommodation_type
                    )
                
                if cost_data and 'content' in cost_data:
                    content = cost_data['content']
                    if isinstance(content, list) and len(content) > 0:
                        # MCP 서버 응답은 텍스트 형태이므로 파싱이 필요합니다
                        # 하지만 실제로는 structured data를 반환하도록 수정해야 합니다
                        
                        # 임시로 MCP 서버에서 직접 데이터를 가져오는 방식으로 수정
                        print(f"[MCP 응답 내용]: {content[0]}")
                        
                        # 실제 여행 경비 계산을 위해 직접 API 호출
                        import requests
                        try:
                            # API 호출 데이터 준비
                            api_payload = {
                                "destination": mcp_destination,
                                "days": days,
                                "travelers": actual_travelers,
                                "accommodation_type": accommodation_type
                            }
                            
                            print(f"[MCP API 호출 데이터]: destination={mcp_destination}, days={days}, travelers={actual_travelers}, budget={budget_value}")
                            
                            # 예산 기반 vs 레벨 기반 선택
                            if budget_value and spending_level:
                                api_payload["total_budget"] = budget_value
                                api_payload["spending_level"] = spending_level
                            else:
                                api_payload["budget_level"] = "mid"
                            
                            direct_response = requests.post(
                                f"http://localhost:3001/api/calculate-cost",
                                json=api_payload,
                                timeout=5
                            )
                            
                            if direct_response.status_code == 200:
                                # HTTP API는 MCP의 텍스트 응답을 반환하므로 파싱 필요
                                direct_data = direct_response.json()
                                if 'content' in direct_data and len(direct_data['content']) > 0:
                                    response_text = direct_data['content'][0].get('text', '')
                                    
                                    # 예산 부족 메시지 확인
                                    if '❌ 예산 부족' in response_text or '부족합니다' in response_text:
                                        print(f"[예산 부족으로 원본 비용 유지]: {place} - 원본 총비용: {rec.get('total_cost', 'N/A')}")
                                        # 원본 Gemini 값 유지 - continue 대신 추천 리스트에 추가
                                        # continue를 사용하지 않고 아래로 진행하여 updated_recommendations에 추가
                                    else:
                                        # 텍스트에서 숫자 추출
                                        import re
                                        
                                        # 총 여행 경비 추출 (1,915,000원 형태)
                                        total_match = re.search(r'총 여행 경비: ([\d,]+)원', response_text)
                                        total_cost = int(total_match.group(1).replace(',', '')) if total_match else 0
                                        
                                        # 항공료 추출
                                        flight_match = re.search(r'항공료 \(예상\): ([\d,]+)원', response_text)
                                        flight_cost = int(flight_match.group(1).replace(',', '')) if flight_match else 0
                                        
                                        # 숙박비 추출 (일일)
                                        hotel_match = re.search(r'숙박비: ([\d,]+)원', response_text)
                                        hotel_cost_daily = int(hotel_match.group(1).replace(',', '')) if hotel_match else 0
                                        
                                        # 정상적인 데이터가 추출된 경우만 업데이트
                                        if total_cost > 0:
                                            # 만원 단위로 변환
                                            rec['flight'] = f"{flight_cost // 10000}만원"
                                            rec['hotel'] = f"{hotel_cost_daily // 10000}만원"
                                            rec['local_price'] = f"{(total_cost - flight_cost) // 10000}만원"
                                            rec['total_cost'] = f"{total_cost // 10000}만원"
                                            
                                            print(f"[정확한 경비 업데이트 성공]: {place} -> 총비용: {total_cost}원")
                                        else:
                                            print(f"[비용 데이터 추출 실패, 원본 유지]: {place}")
                                else:
                                    print(f"[HTTP API 응답 파싱 실패]: {place}")
                            else:
                                print(f"[HTTP API 호출 실패]: {direct_response.status_code}")
                                
                        except requests.exceptions.RequestException as e:
                            print(f"[HTTP API 연결 실패]: {str(e)}")
                            # 기존 Gemini 값 유지
                            pass
                        
                    else:
                        print(f"[정확한 경비 데이터 없음]: {place}")
                else:
                    print(f"[정확한 경비 조회 실패]: {place}")
            else:
                print(f"[MCP 키 매칭 실패]: {place}")
            
            updated_recommendations.append(rec)
        
        return json.dumps(updated_recommendations, ensure_ascii=False)
        
    except Exception as e:
        print(f"[정확한 경비 업데이트 오류]: {str(e)}")
        return gemini_result


def _map_place_to_mcp_key(place_name):
    """
    Gemini가 추천한 여행지 이름을 MCP 서버의 키로 매핑하는 함수
    
    Args:
        place_name (str): Gemini가 추천한 여행지 이름
        
    Returns:
        str: MCP 서버 키 또는 None
    """
    place_lower = place_name.lower()
    
    # 매핑 테이블 - MCP 서버가 지원하는 12개 국가만 포함
    # 지원 국가: 일본, 태국, 베트남, 싱가포르, 말레이시아, 필리핀, 인도네시아, 프랑스, 이탈리아, 스페인, 미국, 캐나다
    place_mapping = {
        # 아시아 (7개국)
        'japan': '일본',
        '일본': '일본',
        '도쿄': '일본',
        'tokyo': '일본',
        '오사카': '일본',
        'osaka': '일본',
        '교토': '일본',
        'kyoto': '일본',
        '후쿠오카': '일본',
        'fukuoka': '일본',
        '나고야': '일본',
        'nagoya': '일본',
        
        'thailand': '태국',
        '태국': '태국',
        '방콕': '태국',
        'bangkok': '태국',
        '푸켓': '태국',
        'phuket': '태국',
        '치앙마이': '태국',
        'chiang mai': '태국',
        '파타야': '태국',
        'pattaya': '태국',
        
        'vietnam': '베트남',
        '베트남': '베트남',
        '호치민': '베트남',
        'ho chi minh': '베트남',
        '하노이': '베트남',
        'hanoi': '베트남',
        '다낭': '베트남',
        'da nang': '베트남',
        '호이안': '베트남',
        'hoi an': '베트남',
        
        'singapore': '싱가포르',
        '싱가포르': '싱가포르',
        
        'malaysia': '말레이시아',
        '말레이시아': '말레이시아',
        '쿠알라룸푸르': '말레이시아',
        'kuala lumpur': '말레이시아',
        '페낭': '말레이시아',
        'penang': '말레이시아',
        
        'philippines': '필리핀',
        '필리핀': '필리핀',
        '마닐라': '필리핀',
        'manila': '필리핀',
        '세부': '필리핀',
        'cebu': '필리핀',
        '보라카이': '필리핀',
        'boracay': '필리핀',
        
        'indonesia': '인도네시아',
        '인도네시아': '인도네시아',
        '자카르타': '인도네시아',
        'jakarta': '인도네시아',
        '발리': '인도네시아',
        'bali': '인도네시아',
        '요그야카르타': '인도네시아',
        'yogyakarta': '인도네시아',
        
        # 유럽 (3개국)
        'france': '프랑스',
        '프랑스': '프랑스',
        '파리': '프랑스',
        'paris': '프랑스',
        '니스': '프랑스',
        'nice': '프랑스',
        '리옹': '프랑스',
        'lyon': '프랑스',
        
        'italy': '이탈리아',
        '이탈리아': '이탈리아',
        '로마': '이탈리아',
        'rome': '이탈리아',
        '밀라노': '이탈리아',
        'milan': '이탈리아',
        '베니스': '이탈리아',
        'venice': '이탈리아',
        '피렌체': '이탈리아',
        'florence': '이탈리아',
        '나폴리': '이탈리아',
        'naples': '이탈리아',
        
        'spain': '스페인',
        '스페인': '스페인',
        '마드리드': '스페인',
        'madrid': '스페인',
        '바르셀로나': '스페인',
        'barcelona': '스페인',
        '세비야': '스페인',
        'seville': '스페인',
        
        # 아메리카 (2개국)
        'united states': '미국',
        'usa': '미국',
        'us': '미국',
        '미국': '미국',
        '뉴욕': '미국',
        'new york': '미국',
        '로스앤젤레스': '미국',
        'los angeles': '미국',
        '라스베가스': '미국',
        'las vegas': '미국',
        '샌프란시스코': '미국',
        'san francisco': '미국',
        '시애틀': '미국',
        'seattle': '미국',
        '마이애미': '미국',
        'miami': '미국',
        '시카고': '미국',
        'chicago': '미국',
        
        'canada': '캐나다',
        '캐나다': '캐나다',
        '토론토': '캐나다',
        'toronto': '캐나다',
        '밴쿠버': '캐나다',
        'vancouver': '캐나다',
        '몬트리올': '캐나다',
        'montreal': '캐나다',
        '오타와': '캐나다',
        'ottawa': '캐나다'
    }
    
    # 직접 매칭 시도
    for key, value in place_mapping.items():
        if key in place_lower:
            return value
    
    return None
