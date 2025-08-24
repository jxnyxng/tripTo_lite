import requests
import json
import re
from config.settings import GEMINI_API_KEY


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
        nights = survey_data.get('q4_1', '')
        important = survey_data.get('q1', '')
        num_recommend = survey_data.get('q11', '1')
        other_considerations = survey_data.get('q10', '')  # 기타 고려할 점 추가
        
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

        # 프롬프트 생성
        prompt = _build_prompt(priority_condition, important, travel_type, style, budget, nights, num_recommend)
        
        # Gemini API 호출
        return _call_gemini_api(prompt)
                
    except Exception as e:
        return f"Gemini API 호출 오류: {str(e)}"


def _build_prompt(priority_condition, important, travel_type, style, budget, nights, num_recommend):
    """Gemini AI용 프롬프트를 생성하는 내부 함수"""
    return (
        f"당신은 여행 추천 전문가입니다. "
        f"{priority_condition}"
        f"사용자가 '{important}'를 가장 중요하게 생각하며, "
        f"여행 유형은 '{travel_type}'입니다. "
        f"여행 스타일은 '{style}', 예산은 '{budget}만원', 여행 기간은 '{nights}'입니다. "
        f"💡 비용 계산 원칙: 모든 여행지는 최저가 기준으로 계산해 주세요. 항공료와 숙박비는 현실적인 최저가를 반영하되, 예산에 억지로 맞추려고 하지 마세요. "
        f"📊 예산 참고: 사용자 예산 '{budget}만원'을 참고하되, 최저가로도 예산을 초과할 경우 정확한 최저가 비용을 제공해 주세요. 예산 초과 여부는 클라이언트에서 판단합니다. "
        f"✈️ 항공료: 해당 목적지까지의 현실적인 최저가 항공료 (왕복 기준, 1인당)"
        f"🏨 숙박비: 현실적인 최저가 숙박비 (1박 기준, 1인당) - 게스트하우스, 호스텔, 저가 호텔 등 포함"
        f"💰 현지 사용 금액: 현지 물가를 고려한 최소 필요 생활비 (교통비, 식비, 관광비 등 포함)"
        f"추천 시, 반드시 현지 물가와 입력된 예산(원화 기준)을 해당 국가의 환율로 환전했을 때 실제 현지에서 사용할 수 있는 금액을 고려하세요. "
        f"모든 가격(항공료, 숙박비, 현지 사용 가능 금액 등)은 반드시 만원 단위로 반환해 주세요. 예시: 항공료:40만원, 숙박비:20만원, 현지 사용 가능 금액:30만원 등. "
        f"사용자가 추천받고 싶은 여행지 개수는 '{num_recommend}개'입니다. 반드시 가장 적절한 여행지 중 사용자가 요청한 개수만큼만 추천해 주세요. 단, 5개를 초과해서 추천하지 마세요. "
        f"🎯 추천 기준: 사용자의 여행 선호도와 스타일에 가장 잘 맞는 여행지를 우선으로 추천하되, 현실적인 최저가 비용을 정확히 제공해 주세요. "
        f"중요: 각 여행지마다 가장 가까운 주요 공항의 IATA 코드(3글자)를 반드시 포함해 주세요. 예: 도쿄→NRT, 방콕→BKK, 싱가포르→SIN 등 "
        f"추천이유는 반드시 6줄 이상 상세하게 작성해 주세요. 해당 여행지의 특색, 사용자 선호도와의 연관성, 계절적 특징, 주요 관광지, 현지 문화, 음식 등을 포함하여 구체적이고 매력적으로 설명해 주세요. "
        f"추천 결과는 반드시 아래와 같은 JSON 배열 형식으로만 반환해 주세요. 다른 설명이나 텍스트 없이 JSON만 출력하세요. JSON 키와 값은 반드시 큰따옴표를 사용해 주세요.\n"
        f'[\n  {{\n    "place": "여행지명",\n    "flight": "항공권 최저가 (1인 왕복)",\n    "hotel": "숙박비 최저가 (1인 1박)",\n    "reason": "추천 이유 (6줄 이상 상세 작성)",\n    "local_price": "현지 최소 생활비 ({nights} 기준)",\n    "total_cost": "총 예상 비용 (항공료+숙박비+현지생활비)",\n    "airport_code": "IATA코드"\n  }}, ...\n]'
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
