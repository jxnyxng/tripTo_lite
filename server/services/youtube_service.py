import requests
from config.settings import YOUTUBE_API_KEY


def search_youtube_videos(destination, companion=None, max_results=5):
    """
    YouTube API를 사용하여 여행지 관련 비디오를 검색하는 함수
    
    Args:
        destination (str): 여행지 이름
        companion (str, optional): 동반자 정보
        max_results (int): 최대 결과 수
        
    Returns:
        list: 검색된 비디오 정보 리스트
    """
    print(f"[YouTube 함수 시작]: destination='{destination}', companion='{companion}', max_results={max_results}")
    
    if not YOUTUBE_API_KEY:
        print("YouTube API 키가 설정되지 않았습니다.")
        return []
    
    try:
        # 검색 키워드 생성
        search_queries = _generate_search_queries(destination, companion)
        
        # 모든 검색 키워드로 비디오 검색
        all_videos = []
        for search_query in search_queries:
            videos = _search_videos_by_query(search_query)
            all_videos.extend(videos)
            
            # 충분한 비디오를 찾았으면 중단
            if len(all_videos) >= max_results:
                break
        
        # 중복 제거 및 최대 개수 제한
        unique_videos = _remove_duplicates(all_videos)
        result_videos = unique_videos[:max_results]
        
        print(f"[YouTube 검색 완료] '{destination}' 관련 비디오 {len(result_videos)}개 반환")
        return result_videos
        
    except Exception as e:
        print(f"[YouTube API 오류]: {str(e)}")
        return []


def _generate_search_queries(destination, companion):
    """검색 키워드를 생성하는 내부 함수"""
    companion_suffix = ""
    if companion and companion != "기타":
        companion_suffix = f" {companion}"
    
    return [
        f"{destination}{companion_suffix} 여행 브이로그",
        f"{destination}{companion_suffix} 여행",
        f"{destination} travel vlog",
        f"{destination} 관광"
    ]


def _search_videos_by_query(search_query):
    """단일 검색 키워드로 비디오를 검색하는 내부 함수"""
    print(f"[YouTube 검색 키워드]: '{search_query}'")
    
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
        'publishedAfter': '2020-01-01T00:00:00Z'  # 2020년 이후 비디오만
    }
    
    print(f"[YouTube API 요청 URL]: {url}")
    
    try:
        response = requests.get(url, params=params, timeout=30)
        print(f"[YouTube API 응답 상태]: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            videos = []
            
            print(f"[YouTube API 응답]: 총 {len(data.get('items', []))}개 비디오 검색됨")
            
            for item in data.get('items', []):
                try:
                    video = _parse_video_item(item)
                    if video:
                        videos.append(video)
                except Exception as e:
                    print(f"[비디오 처리 오류]: {str(e)}")
                    continue
            
            return videos
        else:
            print(f"[YouTube API 오류]: HTTP {response.status_code}")
            return []
            
    except Exception as e:
        print(f"[YouTube API 요청 오류]: {str(e)}")
        return []


def _parse_video_item(item):
    """YouTube API 응답에서 비디오 정보를 파싱하는 내부 함수"""
    video_id = item['id']['videoId']
    snippet = item['snippet']
    
    return {
        'id': video_id,
        'title': snippet['title'],
        'description': snippet['description'][:100] + "..." if len(snippet['description']) > 100 else snippet['description'],
        'url': f"https://www.youtube.com/watch?v={video_id}",
        'thumbnail': snippet['thumbnails'].get('medium', {}).get('url', ''),
        'channel': snippet['channelTitle'],
        'publishedAt': snippet['publishedAt']
    }


def _remove_duplicates(videos):
    """비디오 리스트에서 중복을 제거하는 내부 함수"""
    seen_ids = set()
    unique_videos = []
    
    for video in videos:
        if video['id'] not in seen_ids:
            seen_ids.add(video['id'])
            unique_videos.append(video)
    
    return unique_videos
