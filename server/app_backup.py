import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import requests

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# 디버깅용 로그
print(f"GEMINI_API_KEY 로드됨: {'예' if GEMINI_API_KEY else '아니오'}")
print(f"YOUTUBE_API_KEY 로드됨: {'예' if YOUTUBE_API_KEY else '아니오'}")
if YOUTUBE_API_KEY:
    print(f"YOUTUBE_API_KEY: {YOUTUBE_API_KEY[:10]}...")  # 보안을 위해 일부만 표시

app = Flask(__name__)
CORS(app)

# YouTube API 검색 함수
def search_youtube_videos(destination, max_results=5):
    if not YOUTUBE_API_KEY:
        print("YouTube API 키가 설정되지 않았습니다.")
        return []
    
    try:
        # 검색 키워드 생성 (여행지 + 브이로그 관련 키워드)
        search_query = f"{destination} 여행 브이로그"
        
        # YouTube Data API v3 검색 엔드포인트
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': search_query,
            'type': 'video',
            'maxResults': max_results,
            'order': 'relevance',  # 관련성 순으로 정렬
            'key': YOUTUBE_API_KEY,
            'regionCode': 'KR',  # 한국 지역 설정
            'relevanceLanguage': 'ko'  # 한국어 우선
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        videos = []
        for item in data.get('items', []):
            video_info = {
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'description': item['snippet']['description'][:100] + '...' if len(item['snippet']['description']) > 100 else item['snippet']['description'],
                'channelTitle': item['snippet']['channelTitle'],
                'publishedAt': item['snippet']['publishedAt']
            }
            videos.append(video_info)
        
        print(f"YouTube 검색 결과: {len(videos)}개 영상 찾음")
        return videos
        
    except Exception as e:
        print(f"YouTube API 호출 오류: {str(e)}")
        return []

# YouTube 검색 API 엔드포인트
@app.route('/api/youtube/search', methods=['POST'])
def youtube_search():
    try:
        data = request.get_json()
        destination = data.get('destination', '')
        max_results = data.get('maxResults', 5)
        
        if not destination:
            return jsonify({'error': '여행지명이 필요합니다.'}), 400
        
        videos = search_youtube_videos(destination, max_results)
        return jsonify({'videos': videos})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Gemini API 호출
def analyze_with_gemini(survey_data):
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

    # 프롬프트 생성 (예시)
    prompt = (
        f"당신은 여행 추천 전문가입니다. "
        f"{priority_condition}"
        f"사용자가 '{important}'를 가장 중요하게 생각하며, "
        f"여행 유형은 '{travel_type}'입니다. "
        f"여행 스타일은 '{style}', 예산은 '{budget}만원', 여행 기간은 '{nights}'입니다. "
        f"추천 시, 반드시 현지 물가와 입력된 예산(원화 기준)을 해당 국가의 환율로 환전했을 때 실제 현지에서 사용할 수 있는 금액을 고려하세요. "
        f"항공권 평균 금액, 숙박업소 평균 금액, 현지 물가, 환율을 모두 반영하여 예산 내에서 최적의 여행지를 추천해 주세요. "
        f"모든 가격(항공료, 숙박비, 현지 사용 가능 금액 등)은 반드시 만원 단위로 반환해 주세요. 예시: 항공료:40만원, 숙박비:20만원, 현지 사용 가능 금액:300만원 등. "
        f"사용자가 추천받고 싶은 여행지 개수는 '{num_recommend}개'입니다. 반드시 가장 적절한 여행지 중 사용자가 요청한 개수만큼만 추천해 주세요. 단, 5개를 초과해서 추천하지 마세요. "
        f"만약 조건에 맞는 여행지가 없다면 '조건에 맞는 여행지가 없습니다.'라고 안내해 주세요. "
        f"중요: 각 여행지마다 가장 가까운 주요 공항의 IATA 코드(3글자)를 반드시 포함해 주세요. 예: 도쿄→NRT, 방콕→BKK, 싱가포르→SIN 등 "
        f"추천이유는 반드시 6줄 이상 상세하게 작성해 주세요. 해당 여행지의 특색, 사용자 선호도와의 연관성, 계절적 특징, 주요 관광지, 현지 문화, 음식 등을 포함하여 구체적이고 매력적으로 설명해 주세요. "
        f"추천 결과는 반드시 아래와 같은 JSON 배열 형식으로만 반환해 주세요. 다른 설명이나 텍스트 없이 JSON만 출력하세요. JSON 키와 값은 반드시 큰따옴표를 사용해 주세요.\n"
        f'[\n  {{\n    "place": "여행지명",\n    "flight": "항공권 평균",\n    "hotel": "숙박업소 평균",\n    "reason": "추천 이유 (6줄 이상 상세 작성)",\n    "local_price": "환율 적용 후 현지 사용 가능 금액",\n    "airport_code": "IATA코드"\n  }}, ...\n]'
    )
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    params = {"key": GEMINI_API_KEY}
    
    # 재시도 로직 추가
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"[Gemini API 호출 시도 {attempt + 1}/{max_retries}]")
            response = requests.post(url, headers=headers, params=params, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            print("[Gemini API 응답 전체]:", data)  # 실제 응답 구조 확인용
            # Gemini 응답에서 추천 결과 추출 (예시)
            result = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '추천 결과를 가져올 수 없습니다.')
            print("[Gemini 추천 결과 텍스트]:", result)  # 실제 추천 텍스트 확인용
            
            # JSON 응답 정리: 백틱과 json 키워드 제거
            cleaned_result = result.strip()
            print(f"[정리 전 결과]: {cleaned_result}")
            
            # 백틱 제거
            if '```json' in cleaned_result:
                cleaned_result = cleaned_result.split('```json')[1].split('```')[0].strip()
            elif '```' in cleaned_result:
                # json 키워드 없이 백틱만 있는 경우
                parts = cleaned_result.split('```')
                if len(parts) >= 3:
                    cleaned_result = parts[1].strip()
                    
            print(f"[백틱 제거 후]: {cleaned_result}")
            
            # 추가 정리: 불필요한 문자 제거
            lines = cleaned_result.split('\n')
            json_lines = []
            for line in lines:
                if line.strip() and not line.strip().startswith('#'):
                    json_lines.append(line)
            cleaned_result = '\n'.join(json_lines)
            
            print(f"[최종 정리 후]: {cleaned_result}")
            
            return cleaned_result
            
        except requests.exceptions.Timeout:
            print(f"[타임아웃 오류] 시도 {attempt + 1}/{max_retries}")
            if attempt == max_retries - 1:
                return f"Gemini API 타임아웃 오류: 서버 응답이 없습니다. 잠시 후 다시 시도해주세요."
            continue
        except Exception as e:
            print(f"[API 호출 오류] 시도 {attempt + 1}/{max_retries}: {str(e)}")
            if attempt == max_retries - 1:
                return f"Gemini API 호출 오류: {str(e)}"
            continue
                cleaned_result = parts[1].strip()
        
        # JSON 문법 정리
        import re
        # 작은따옴표를 큰따옴표로 변경 (JSON 표준)
        cleaned_result = re.sub(r"'([^']*)':", r'"\1":', cleaned_result)  # 키 변경
        cleaned_result = re.sub(r": '([^']*)'(?=,|\s*}|\s*\])", r': "\1"', cleaned_result)  # 값 변경
        
        # 줄바꿈과 불필요한 공백 정리
        cleaned_result = re.sub(r'\n\s*', ' ', cleaned_result)
        cleaned_result = re.sub(r'\s+', ' ', cleaned_result)
        
        # JSON 유효성 검증 및 다단계 파싱
        try:
            import json
            parsed_json = json.loads(cleaned_result)
            print(f"[JSON 유효성 검증 성공]: {cleaned_result}")
            # 유효한 JSON이면 다시 문자열로 변환하여 일관성 유지
            cleaned_result = json.dumps(parsed_json, ensure_ascii=False)
        except json.JSONDecodeError as e:
            print(f"[JSON 유효성 검증 실패]: {e}")
            print(f"[문제가 있는 JSON]: {cleaned_result}")
            
            # 추가 파싱 시도: 더 공격적인 정리
            try:
                # JSON 배열 패턴 추출
                array_match = re.search(r'\[.*\]', cleaned_result, re.DOTALL)
                if array_match:
                    potential_json = array_match.group(0)
                    
                    # 더 공격적인 따옴표 정리
                    potential_json = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', potential_json)
                    potential_json = re.sub(r':\s*([^"{\[\]},]+?)(?=[,}\]])', r': "\1"', potential_json)
                    
                    # 검증
                    parsed_json = json.loads(potential_json)
                    cleaned_result = json.dumps(parsed_json, ensure_ascii=False)
                    print(f"[추가 파싱 성공]: {cleaned_result}")
                else:
                    raise ValueError("JSON 배열 패턴을 찾을 수 없음")
                    
            except Exception as e2:
                print(f"[추가 파싱도 실패]: {e2}")
                # 최후의 수단: 기본 응답 생성
                cleaned_result = json.dumps([{
                    "place": "추천 결과 파싱 오류",
                    "flight": "정보없음",
                    "hotel": "정보없음", 
                    "reason": "죄송합니다. 추천 결과를 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
                    "local_price": "정보없음",
                    "airport_code": "N/A"
                }], ensure_ascii=False)
        
        print("[최종 정리된 결과]:", cleaned_result)
        
        return cleaned_result
    except Exception as e:
        return f"Gemini API 호출 오류: {str(e)}"

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    recommendation = analyze_with_gemini(data)
    return jsonify({'recommendation': recommendation})

@app.route('/api/send_email', methods=['POST'])
def send_email():
    data = request.get_json()
    email = data.get('email')
    result_html = data.get('result')
    if not email or not result_html:
        return jsonify({'success': False, 'error': '이메일과 결과가 필요합니다.'}), 400
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    try:
        msg = MIMEText(result_html, 'html')
        msg['Subject'] = '여행지 추천 결과지'
        msg['From'] = smtp_user
        msg['To'] = email
        smtp = smtplib.SMTP(smtp_host, smtp_port)
        smtp.starttls()
        smtp.login(smtp_user, smtp_pass)
        smtp.sendmail(msg['From'], [msg['To']], msg.as_string())
        smtp.quit()
        print(f"이메일 발송: {email}, 내용: {result_html}")
        return jsonify({'success': True})
    except Exception as e:
        print(f"이메일 발송 오류: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/')
def home():
    return '여행지 추천 서비스 백엔드 동작 중!'

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5004, debug=True)