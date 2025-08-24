import os
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# API 키 설정
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# SMTP 설정
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = os.getenv('SMTP_PORT')
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

# Flask 설정
DEBUG = True
HOST = '127.0.0.1'
PORT = 5005

def print_config_status():
    """설정 상태를 출력하는 함수"""
    print(f"GEMINI_API_KEY 로드됨: {'예' if GEMINI_API_KEY else '아니오'}")
    print(f"YOUTUBE_API_KEY 로드됨: {'예' if YOUTUBE_API_KEY else '아니오'}")
    print(f"SMTP_HOST 로드됨: {'예' if SMTP_HOST else '아니오'} - {SMTP_HOST}")
    print(f"SMTP_PORT 로드됨: {'예' if SMTP_PORT else '아니오'} - {SMTP_PORT}")
    print(f"SMTP_USER 로드됨: {'예' if SMTP_USER else '아니오'} - {SMTP_USER}")
    print(f"SMTP_PASSWORD 로드됨: {'예' if SMTP_PASSWORD else '아니오'}")
    if YOUTUBE_API_KEY:
        print(f"YOUTUBE_API_KEY: {YOUTUBE_API_KEY[:10]}...")  # 보안을 위해 일부만 표시
