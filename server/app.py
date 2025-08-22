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

# SMTP 설정 로드 및 확인
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = os.getenv('SMTP_PORT')
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

# 디버깅용 로그
print(f"GEMINI_API_KEY 로드됨: {'예' if GEMINI_API_KEY else '아니오'}")
print(f"YOUTUBE_API_KEY 로드됨: {'예' if YOUTUBE_API_KEY else '아니오'}")
print(f"SMTP_HOST 로드됨: {'예' if SMTP_HOST else '아니오'} - {SMTP_HOST}")
print(f"SMTP_PORT 로드됨: {'예' if SMTP_PORT else '아니오'} - {SMTP_PORT}")
print(f"SMTP_USER 로드됨: {'예' if SMTP_USER else '아니오'} - {SMTP_USER}")
print(f"SMTP_PASSWORD 로드됨: {'예' if SMTP_PASSWORD else '아니오'}")
if YOUTUBE_API_KEY:
    print(f"YOUTUBE_API_KEY: {YOUTUBE_API_KEY[:10]}...")  # 보안을 위해 일부만 표시

app = Flask(__name__)
CORS(app)

# YouTube API 검색 함수
def search_youtube_videos(destination, companion=None, max_results=5):
    print(f"[YouTube 함수 시작]: destination='{destination}', companion='{companion}', max_results={max_results}")
    
    if not YOUTUBE_API_KEY:
        print("YouTube API 키가 설정되지 않았습니다.")
        return []
    
    try:
        # 동반자에 따른 검색 키워드 생성
        companion_suffix = ""
        if companion and companion != "기타":
            companion_suffix = f" {companion}"
        
        # 여러 검색 키워드로 시도
        search_queries = [
            f"{destination}{companion_suffix} 여행 브이로그",
            f"{destination}{companion_suffix} 여행",
            f"{destination} travel vlog",
            f"{destination} 관광"
        ]
        
        all_videos = []
        
        for search_query in search_queries:
            print(f"[YouTube 검색 키워드]: '{search_query}'")
            
            # YouTube Data API v3 Search endpoint
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': search_query,
                'type': 'video',
                'maxResults': 10,  # 각 검색어당 10개씩
                'key': YOUTUBE_API_KEY,
                'order': 'relevance',
                'videoDefinition': 'any',
                'videoDuration': 'medium',  # 중간 길이 비디오로 제한 (4분-20분)
                'videoEmbeddable': 'true',  # 임베딩 가능한 비디오만
                'videoSyndicated': 'true',  # 모든 플랫폼에서 재생 가능한 비디오만
                'publishedAfter': '2020-01-01T00:00:00Z'  # 2020년 이후 비디오만 (더 활성화된 채널)
            }
            
            print(f"[YouTube API 요청 URL]: {url}")
            
            response = requests.get(url, params=params, timeout=30)
            print(f"[YouTube API 응답 상태]: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"[YouTube API 응답]: 총 {len(data.get('items', []))}개 비디오 검색됨")
                
                for item in data.get('items', []):
                    try:
                        # 비디오 기본 정보 추출
                        video_id = item['id']['videoId']
                        snippet = item['snippet']
                        
                        # 중복 제거
                        if any(v['id'] == video_id for v in all_videos):
                            continue
                        
                        video = {
                            'id': video_id,
                            'title': snippet['title'],
                            'description': snippet['description'][:100] + "..." if len(snippet['description']) > 100 else snippet['description'],
                            'url': f"https://www.youtube.com/watch?v={video_id}",
                            'thumbnail': snippet['thumbnails'].get('medium', {}).get('url', ''),
                            'channel': snippet['channelTitle'],
                            'publishedAt': snippet['publishedAt']
                        }
                        all_videos.append(video)
                        
                    except Exception as e:
                        print(f"[비디오 처리 오류]: {str(e)}")
                        continue
            else:
                print(f"[YouTube API 오류]: HTTP {response.status_code}")
            
            # 충분한 비디오를 찾았으면 중단
            if len(all_videos) >= max_results:
                break
        
        # 최대 요청된 개수만큼만 반환
        videos = all_videos[:max_results]
        print(f"[YouTube 검색 완료] '{destination}' 관련 비디오 {len(videos)}개 반환")
        return videos
        
    except Exception as e:
        print(f"[YouTube API 오류]: {str(e)}")
        return []

def analyze_with_gemini(survey_data):
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
        print(f"[YouTube 검색 요청 받음]: {data}")
        destination = data.get('destination', '')
        companion = data.get('companion', None)
        
        if not destination:
            print("[YouTube 오류]: 여행지가 제공되지 않음")
            return jsonify({'error': '여행지가 제공되지 않았습니다.'}), 400
        
        print(f"[YouTube 검색 시작]: '{destination}', 동반자: '{companion}'")
        videos = search_youtube_videos(destination, companion)
        print(f"[YouTube 검색 완료]: {len(videos)}개 비디오 반환")
        return jsonify({'videos': videos})
        
    except Exception as e:
        print(f"[YouTube 검색 오류]: {str(e)}")
        return jsonify({'error': f'YouTube 검색 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        to_email = data.get('to')
        subject = data.get('subject', 'TRIPTO 여행지 추천 결과')
        html_content = data.get('html')
        
        print(f"[이메일 전송 요청] to: {to_email}, subject: {subject}")
        
        if not to_email or not html_content:
            return jsonify({'success': False, 'error': '이메일 주소와 내용이 필요합니다.'}), 400
        
        # 전역 SMTP 설정 사용
        smtp_host = SMTP_HOST
        smtp_port = int(SMTP_PORT) if SMTP_PORT else 587
        smtp_user = SMTP_USER
        smtp_password = SMTP_PASSWORD
        
        print(f"[SMTP 설정] host: {smtp_host}, port: {smtp_port}, user: {smtp_user}")
        print(f"[SMTP 설정] password 존재: {'예' if smtp_password else '아니오'}")
        
        if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
            print("[SMTP 오류] 설정이 완료되지 않았습니다.")
            return jsonify({'success': False, 'error': 'SMTP 설정이 완료되지 않았습니다.'}), 500
        
        # 이메일 메시지 생성
        msg = MIMEText(html_content, 'html', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to_email
        
        # 이메일 전송
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print("[이메일 전송 성공]")
        return jsonify({'success': True, 'message': '이메일이 성공적으로 전송되었습니다.'})
        
    except Exception as e:
        print(f"[이메일 전송 오류]: {str(e)}")
        return jsonify({'success': False, 'error': f'이메일 전송 중 오류가 발생했습니다: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5005)
