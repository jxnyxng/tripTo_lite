import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import requests
import re
import json

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
        
        # YouTube Data API v3 Search endpoint
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'q': search_query,
            'type': 'video',
            'maxResults': max_results,
            'key': YOUTUBE_API_KEY,
            'order': 'relevance',
            'videoDefinition': 'any',
            'videoDuration': 'any'
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        videos = []
        
        for item in data.get('items', []):
            video = {
                'title': item['snippet']['title'],
                'description': item['snippet']['description'][:100] + "..." if len(item['snippet']['description']) > 100 else item['snippet']['description'],
                'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'thumbnail': item['snippet']['thumbnails']['medium']['url'],
                'channel': item['snippet']['channelTitle']
            }
            videos.append(video)
        
        print(f"[YouTube 검색] '{destination}' 관련 비디오 {len(videos)}개 검색됨")
        return videos
        
    except Exception as e:
        print(f"[YouTube API 오류]: {str(e)}")
        return []

def analyze_with_gemini(data):
    try:
        q1_answer = data.get('q1')
        q2_answer = data.get('q2')
        q3_answer = data.get('q3')
        q4_answer = data.get('q4')
        q5_answer = data.get('q5')
        q6_answer = data.get('q6')
        num_recommend = data.get('num_recommend', '3')  # 기본값 3개

        prompt = (
            f"사용자의 여행 선호도에 맞는 여행지를 추천해 주세요. "
            f"선호 장소: {q1_answer}, 여행 스타일: {q2_answer}, 관심 활동: {q3_answer}, 예산: {q4_answer}, 숙박 기간: {q5_answer}, 항공편 선호: {q6_answer}. "
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
                result_data = response.json()
                print("[Gemini API 응답 전체]:", result_data)
                
                # Gemini 응답에서 추천 결과 추출
                result = result_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '추천 결과를 가져올 수 없습니다.')
                print("[Gemini 추천 결과 텍스트]:", result)
                
                # JSON 응답 정리: 백틱과 json 키워드 제거
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
                
    except Exception as e:
        return f"Gemini API 호출 오류: {str(e)}"

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    recommendation = analyze_with_gemini(data)
    return jsonify({'recommendation': recommendation})

@app.route('/api/youtube-search', methods=['POST'])
def youtube_search():
    try:
        data = request.get_json()
        destination = data.get('destination', '')
        
        if not destination:
            return jsonify({'error': '여행지가 제공되지 않았습니다.'}), 400
        
        videos = search_youtube_videos(destination)
        return jsonify({'videos': videos})
        
    except Exception as e:
        print(f"[YouTube 검색 오류]: {str(e)}")
        return jsonify({'error': f'YouTube 검색 중 오류가 발생했습니다: {str(e)}'}), 500

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
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        return jsonify({'success': False, 'error': 'SMTP 설정이 완료되지 않았습니다.'}), 500
    
    try:
        msg = MIMEText(result_html, 'html', 'utf-8')
        msg['Subject'] = 'TripTo - 여행 추천 결과'
        msg['From'] = smtp_user
        msg['To'] = email
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5004)
