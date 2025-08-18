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

# Gemini API 호출
def analyze_with_gemini(survey_data):
    # 설문 데이터에서 값 추출
    style = survey_data.get('q2', '')
    budget_raw = survey_data.get('q4', '')
    nights = survey_data.get('q4_1', '')
    important = survey_data.get('q1', '')
    num_recommend = survey_data.get('q11', '1')
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

    # 프롬프트 생성 (예시)
    prompt = (
        f"당신은 여행 추천 전문가입니다. 사용자가 '{important}'를 가장 중요하게 생각하며, "
        f"여행 유형은 '{travel_type}'입니다. "
        f"여행 스타일은 '{style}', 예산은 '{budget}만원', 여행 기간은 '{nights}'입니다. "
        f"추천 시, 반드시 현지 물가와 입력된 예산(원화 기준)을 해당 국가의 환율로 환전했을 때 실제 현지에서 사용할 수 있는 금액을 고려하세요. "
        f"항공권 평균 금액, 숙박업소 평균 금액, 현지 물가, 환율을 모두 반영하여 예산 내에서 최적의 여행지를 추천해 주세요. "
        f"모든 가격(항공료, 숙박비, 현지 사용 가능 금액 등)은 반드시 만원 단위로 반환해 주세요. 예시: 항공료:40만원, 숙박비:20만원, 현지 사용 가능 금액:300만원 등. "
        f"사용자가 추천받고 싶은 여행지 개수는 '{num_recommend}개'입니다. 반드시 가장 적절한 여행지 중 사용자가 요청한 개수만큼만 추천해 주세요. 단, 5개를 초과해서 추천하지 마세요. "
        f"만약 조건에 맞는 여행지가 없다면 '조건에 맞는 여행지가 없습니다.'라고 안내해 주세요. "
        f"추천 결과는 반드시 아래와 같은 JSON 배열 형식으로만 반환해 주세요. 다른 설명이나 텍스트 없이 JSON만 출력하세요.\n"
        f"[\n  {{\n    'place': '여행지명',\n    'flight': '항공권 평균',\n    'hotel': '숙박업소 평균',\n    'reason': '추천 이유',\n    'local_price': '환율 적용 후 현지 사용 가능 금액'\n  }}, ...\n]"
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
        print("[Gemini API 응답 전체]:", data)  # 실제 응답 구조 확인용
        # Gemini 응답에서 추천 결과 추출 (예시)
        result = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '추천 결과를 가져올 수 없습니다.')
        print("[Gemini 추천 결과 텍스트]:", result)  # 실제 추천 텍스트 확인용
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
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    try:
        msg = MIMEText(result)
        msg['Subject'] = '여행지 추천 결과지'
        msg['From'] = smtp_user
        msg['To'] = email
        smtp = smtplib.SMTP(smtp_host, smtp_port)
        smtp.starttls()
        smtp.login(smtp_user, smtp_pass)
        smtp.sendmail(msg['From'], [msg['To']], msg.as_string())
        smtp.quit()
        print(f"이메일 발송: {email}, 내용: {result}")
        return jsonify({'success': True})
    except Exception as e:
        print(f"이메일 발송 오류: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/')
def home():
    return '여행지 추천 서비스 백엔드 동작 중!'

if __name__ == '__main__':
    app.run(debug=True)
