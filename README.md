# 🌍 TripTo Lite - AI 기반 여행지 추천 서비스

> 설문을 통해 개인 맞춤형 여행지를 추천받고, 실시간 유튜브 영상으로 미리 체험해보세요!

![React](https://img.shields.io/badge/React-18.0.0-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=flat-square&logo=flask)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google)

## ✨ 주요 기능

### 🎯 개인 맞춤형 설문 시스템
- **기본 질문**: 여행 스타일, 선호 활동, 예산 등 필수 정보
- **추가 질문**: 세부 선호사항을 위한 선택형/입력형 질문
- **실시간 검증**: 필수 질문 미완료 시 친화적인 안내 메시지

### 🤖 AI 기반 여행지 분석
- **Google Gemini AI** 활용한 정교한 분석
- 설문 답변을 바탕으로 한 개인화된 추천 로직
- 다양한 여행지 옵션과 상세한 추천 이유 제공

### 📺 실시간 영상 미리보기
- **YouTube Data API** 연동
- 추천된 여행지별 관련 영상 자동 검색
- 여행 전 미리 체험할 수 있는 시각적 정보 제공

### 📧 결과 이메일 전송
- 분석 결과를 이메일로 전송
- 언제든 다시 확인할 수 있는 개인 아카이브

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 16.0.0 이상
- Python 3.8 이상
- Google Gemini AI API Key
- YouTube Data API Key
- Gmail 계정 (SMTP 전송용)

### 설치 방법

1. **레포지토리 클론**
```bash
git clone https://github.com/your-username/tripTo_lite.git
cd tripTo_lite
```

2. **서버 설정**
```bash
cd server
pip install -r requirements.txt
cp .env.example .env
# .env 파일에 API 키들을 입력하세요
```

3. **클라이언트 설정**
```bash
cd ../client
npm install
```

4. **서버 실행**
```bash
cd ../server
python app.py
```

5. **클라이언트 실행** (새 터미널)
```bash
cd client
npm start
```

6. **브라우저에서 확인**
   - http://localhost:3000 접속

## ⚙️ 환경 변수 설정

`server/.env` 파일에 다음 정보를 입력하세요:

```env
# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# YouTube Data API Key  
YOUTUBE_API_KEY=your_youtube_api_key_here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

### API 키 발급 방법

#### 🔑 Google Gemini AI API
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. 새 API 키 생성
3. `.env` 파일의 `GEMINI_API_KEY`에 입력

#### 📺 YouTube Data API
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. YouTube Data API v3 활성화
4. API 키 생성
5. `.env` 파일의 `YOUTUBE_API_KEY`에 입력

#### 📧 Gmail SMTP 설정
1. Gmail 계정의 2단계 인증 활성화
2. 앱 비밀번호 생성
3. `.env` 파일에 Gmail 주소와 앱 비밀번호 입력

## 🏗️ 프로젝트 구조

```
tripTo_lite/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── Survey.js   # 설문 컴포넌트
│   │   │   └── ...
│   │   ├── hooks/          # 커스텀 훅
│   │   │   └── useNavigation.js
│   │   ├── utils/          # 유틸리티 함수
│   │   └── App.js          # 메인 앱 컴포넌트
│   └── package.json
├── server/                 # Flask 백엔드
│   ├── app.py             # Flask 서버
│   ├── requirements.txt   # Python 의존성
│   ├── .env.example      # 환경 변수 템플릿
│   └── .env              # 환경 변수 (git에서 제외)
└── README.md
```

## 🎨 주요 화면

### 📋 설문 페이지
- 파란색 그라데이션 배경의 현대적인 디자인
- 기본 질문과 추가 질문의 명확한 구분
- 실시간 입력 검증 및 사용자 친화적 안내

### ⏳ 로딩 화면
- 3단계 프로세스 시각화 (설문 분석 → 데이터 매칭 → 결과 생성)
- 부드러운 애니메이션과 진행 상황 표시
- 사용자 대기 시간의 지루함 최소화

### 🏆 결과 페이지
- 추천 여행지와 상세한 설명
- 각 여행지별 YouTube 영상 미리보기
- 결과 이메일 전송 기능

## 🛠️ 기술 스택

### Frontend
- **React 18**: 현대적인 컴포넌트 기반 UI
- **JavaScript ES6+**: 최신 JavaScript 문법
- **CSS-in-JS**: 동적 스타일링

### Backend  
- **Flask**: 경량화된 Python 웹 프레임워크
- **Google Gemini AI**: 고도화된 AI 분석
- **YouTube Data API**: 실시간 영상 검색
- **SMTP**: 이메일 전송 기능

## 🎯 사용법

1. **설문 시작**: 메인 페이지에서 설문 시작
2. **기본 질문 답변**: 여행 스타일, 예산 등 필수 정보 입력
3. **추가 질문 답변**: 세부 선호사항 선택 (선택사항)
4. **결과 대기**: AI 분석 과정을 시각적으로 확인
5. **결과 확인**: 맞춤형 여행지 추천과 영상 미리보기
6. **이메일 전송**: 결과를 이메일로 저장

## 🔒 보안 고려사항

- **환경 변수**: 모든 API 키는 `.env` 파일로 관리
- **Git 제외**: `.gitignore`로 민감한 정보 커밋 방지
- **CORS 설정**: 클라이언트-서버 간 안전한 통신
- **입력 검증**: 사용자 입력에 대한 서버 측 검증

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

