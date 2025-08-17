import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
import requests

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

app = Flask(__name__)
CORS(app)

# Gemini API 호출 함수
def analyze_with_gemini(survey_data):
    # 설문 데이터에서 값 추출
    style = survey_data.get('q2', '')
    budget_raw = survey_data.get('q3', '')
    nights = survey_data.get('q4', '')
    important = survey_data.get('q1', '')

    # 예산을 만원 단위에서 원 단위로 변환
    try:
        budget = int(budget_raw) * 10000
    except (ValueError, TypeError):
        budget = budget_raw

    # 프롬프트 생성 (예시)
    prompt = (
        f"당신은 여행 추천 전문가입니다. 사용자가 '{important}'를 가장 중요하게 생각하며, "
        f"여행 스타일은 '{style}', 예산은 '{budget}원', 여행 기간은 '{nights}'입니다. "
        f"추천 시, 해당 지역의 항공권 평균 금액과 주변 숙박업소 중 예산에 맞는 숙박업소들의 평균 금액을 고려하여, "
        f"예산 내에서 최적의 여행지를 추천해 주세요. 추천 결과에는 항공권 평균, 숙박업소 평균, 여행지 이름, 추천 이유를 포함해 주세요."
    )
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    params = {"key": GEMINI_API_KEY}
    try:
        response = requests.post(url, headers=headers, params=params, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Gemini 응답에서 추천 결과 추출 (예시)
        result = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '추천 결과를 가져올 수 없습니다.')
        return result
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
    result = data.get('result')
    if not email or not result:
        return jsonify({'success': False, 'error': '이메일과 결과가 필요합니다.'}), 400
    try:
        msg = MIMEText(result)
        msg['Subject'] = '여행지 추천 결과지'
        msg['From'] = 'no-reply@example.com'
        msg['To'] = email
        # 실제 SMTP 서버 정보로 변경 필요
        # smtp = smtplib.SMTP('smtp.example.com', 587)
        # smtp.starttls()
        # smtp.login('user', 'password')
        # smtp.sendmail(msg['From'], [msg['To']], msg.as_string())
        # smtp.quit()
        print(f"이메일 발송: {email}, 내용: {result}")
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/')
def home():
    return '여행지 추천 서비스 백엔드 동작 중!'

if __name__ == '__main__':
    app.run(debug=True)
