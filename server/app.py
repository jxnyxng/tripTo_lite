from flask import Flask, request, jsonify
from flask_cors import CORS

# Configuration and services imports
from config.settings import print_config_status
from services.gemini_service import analyze_with_gemini
from services.youtube_service import search_youtube_videos
from services.email_service import send_travel_email
from services.travel_cost_service import travel_cost_service

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


@app.route('/api/travel-cost', methods=['POST'])
def travel_cost():
    """여행 경비 계산 API 엔드포인트"""
    try:
        data = request.get_json()
        destination = data.get('destination')
        days = data.get('days', 7)
        budget_level = data.get('budget_level', 'mid')
        travelers = data.get('travelers', 1)
        
        # 입력값 검증
        if not destination:
            return jsonify({'error': '여행지가 제공되지 않았습니다.'}), 400
        
        if budget_level not in ['budget', 'mid', 'luxury']:
            return jsonify({'error': 'budget_level은 budget, mid, luxury 중 하나여야 합니다.'}), 400
        
        # Travel Cost API 호출
        result = travel_cost_service.get_travel_cost(destination, days, budget_level, travelers)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Travel Cost API 연결에 실패했습니다.'}), 503
        
    except Exception as e:
        print(f"[Travel Cost API 오류]: {str(e)}")
        return jsonify({'error': f'여행 경비 계산 중 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/destination-info/<destination>', methods=['GET'])
def destination_info(destination):
    """여행지 정보 조회 API 엔드포인트"""
    try:
        # Travel Cost API 호출
        result = travel_cost_service.get_destination_info(destination)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Travel Cost API 연결에 실패했습니다.'}), 503
        
    except Exception as e:
        print(f"[Destination Info API 오류]: {str(e)}")
        return jsonify({'error': f'여행지 정보 조회 중 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/compare-destinations', methods=['POST'])
def compare_destinations():
    """여행지 비교 API 엔드포인트"""
    try:
        data = request.get_json()
        destinations = data.get('destinations')
        days = data.get('days', 7)
        budget_level = data.get('budget_level', 'mid')
        
        # 입력값 검증
        if not destinations or not isinstance(destinations, list):
            return jsonify({'error': '비교할 여행지 목록이 제공되지 않았습니다.'}), 400
        
        if budget_level not in ['budget', 'mid', 'luxury']:
            return jsonify({'error': 'budget_level은 budget, mid, luxury 중 하나여야 합니다.'}), 400
        
        # Travel Cost API 호출
        result = travel_cost_service.compare_destinations(destinations, days, budget_level)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': 'Travel Cost API 연결에 실패했습니다.'}), 503
        
    except Exception as e:
        print(f"[Compare Destinations API 오류]: {str(e)}")
        return jsonify({'error': f'여행지 비교 중 오류가 발생했습니다: {str(e)}'}), 500


@app.route('/api/travel-cost-status', methods=['GET'])
def travel_cost_status():
    """Travel Cost API 서버 상태 확인 엔드포인트"""
    try:
        is_available = travel_cost_service.is_available()
        
        return jsonify({
            'available': is_available,
            'message': 'Travel Cost API 사용 가능' if is_available else 'Travel Cost API 사용 불가',
            'base_url': travel_cost_service.base_url
        })
        
    except Exception as e:
        print(f"[Travel Cost Status 오류]: {str(e)}")
        return jsonify({
            'available': False,
            'message': f'상태 확인 중 오류 발생: {str(e)}',
            'base_url': travel_cost_service.base_url
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5005)