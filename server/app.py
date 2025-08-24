from flask import Flask, request, jsonify
from flask_cors import CORS

# Configuration and services imports
from config.settings import print_config_status
from services.gemini_service import analyze_with_gemini
from services.youtube_service import search_youtube_videos
from services.email_service import send_travel_email

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 시작 시 설정 상태 출력
print_config_status()


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """여행지 분석 API 엔드포인트 (호환성 유지)"""
    try:
        # 요청 데이터 받기
        data = request.get_json()
        print(f"[분석 요청 수신]: {data}")
        
        # Gemini AI로 여행지 분석
        recommendation = analyze_with_gemini(data)
        
        if recommendation:
            print("[분석 성공]: Gemini AI 분석 완료")
            return jsonify({'recommendation': recommendation})
        else:
            print("[분석 실패]: Gemini AI 분석 실패")
            return jsonify({'error': '분석을 생성할 수 없습니다.'}), 500
        
    except Exception as e:
        print(f"[분석 오류]: {str(e)}")
        return jsonify({'error': f'서버 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """여행지 추천 API 엔드포인트"""
    try:
        # 요청 데이터 받기
        data = request.get_json()
        print(f"[추천 요청 수신]: {data}")
        
        # Gemini AI로 여행지 분석 및 추천
        recommendations = analyze_with_gemini(data)
        
        if recommendations:
            print("[추천 성공]: Gemini AI 분석 완료")
            return jsonify(recommendations)
        else:
            print("[추천 실패]: Gemini AI 분석 실패")
            return jsonify({'error': '추천을 생성할 수 없습니다.'}), 500
        
    except Exception as e:
        print(f"[추천 오류]: {str(e)}")
        return jsonify({'error': f'서버 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/youtube', methods=['GET'])
def youtube():
    """YouTube 비디오 검색 API 엔드포인트"""
    try:
        # 쿼리 파라미터 받기
        destination = request.args.get('destination', '').strip()
        companion = request.args.get('companion', None)
        
        # companion이 None이 아닐 때만 strip() 적용
        if companion:
            companion = companion.strip()
        
        # 입력값 검증
        if not destination:
            print("[YouTube 오류]: 여행지가 제공되지 않음")
            return jsonify({'error': '여행지가 제공되지 않았습니다.'}), 400
        
        # YouTube 비디오 검색
        print(f"[YouTube 검색 시작]: '{destination}', 동반자: '{companion}'")
        videos = search_youtube_videos(destination, companion)
        print(f"[YouTube 검색 완료]: {len(videos)}개 비디오 반환")
        
        return jsonify({'videos': videos})
        
    except Exception as e:
        print(f"[YouTube 검색 오류]: {str(e)}")
        return jsonify({'error': f'YouTube 검색 중 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/youtube-search', methods=['POST'])
def youtube_search():
    """YouTube 비디오 검색 API 엔드포인트 (POST 방식, 호환성 유지)"""
    try:
        # 요청 데이터 받기
        data = request.get_json()
        print(f"[YouTube 검색 요청 받음]: {data}")
        destination = data.get('destination', '').strip()
        companion = data.get('companion', None)
        
        # companion이 None이 아닐 때만 strip() 적용
        if companion:
            companion = companion.strip()
        
        # 입력값 검증
        if not destination:
            print("[YouTube 오류]: 여행지가 제공되지 않음")
            return jsonify({'error': '여행지가 제공되지 않았습니다.'}), 400
        
        # YouTube 비디오 검색
        print(f"[YouTube 검색 시작]: '{destination}', 동반자: '{companion}'")
        videos = search_youtube_videos(destination, companion)
        print(f"[YouTube 검색 완료]: {len(videos)}개 비디오 반환")
        
        return jsonify({'videos': videos})
        
    except Exception as e:
        print(f"[YouTube 검색 오류]: {str(e)}")
        return jsonify({'error': f'YouTube 검색 중 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/send-email', methods=['POST'])
def send_email():
    """이메일 전송 API 엔드포인트"""
    try:
        # 요청 데이터 받기
        data = request.get_json()
        to_email = data.get('to')
        subject = data.get('subject', 'TRIPTO 여행지 추천 결과')
        html_content = data.get('html')
        
        # 이메일 전송
        result = send_travel_email(to_email, subject, html_content)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400 if 'required' in result['error'] else 500
        
    except Exception as e:
        print(f"[이메일 전송 오류]: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'이메일 전송 중 오류가 발생했습니다: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5005)