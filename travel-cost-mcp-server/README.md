# 🧳 Travel Cost Predictor MCP Server

여행 경비를 정확히 예측해주는 Model Context Protocol (MCP) 서버입니다.

## 📋 개요

이 MCP 서버는 다양한 여행지의 숙박비, 식비, 교통비, 관광비를 실시간으로 계산하여 정확한 여행 예산을 제공합니다. AI 모델과 통합하여 사용자에게 개인맞춤형 여행 경비 분석을 제공할 수 있습니다.

## ✨ 주요 기능

### 1. 🧮 여행 경비 계산 (`calculate_travel_cost`)
- **기능**: 여행지별 상세한 경비 계산
- **포함 항목**: 숙박비, 식비, 교통비, 관광비, 항공료
- **예산 수준**: 저예산, 중간예산, 고급 (3단계)
- **다중 여행자**: 여행자 수에 따른 비용 계산

**입력 파라미터:**
```json
{
  "destination": "일본",
  "days": 5,
  "budget_level": "mid",
  "travelers": 2
}
```

**출력 예시:**
```
🧳 일본 여행 경비 계산 결과

📅 여행 기간: 5일
👥 여행자 수: 2명
💰 예산 수준: 중간예산

📊 일일 비용 (1인 기준):
🏨 숙박비: 120,000원
🍽️ 식비: 60,000원
🚌 교통비: 15,000원
🎭 관광비: 50,000원

🎯 총 여행 경비: 2,850,000원
```

### 2. 🌍 여행지 정보 조회 (`get_destination_info`)
- **기능**: 여행지의 물가 정보와 여행 팁 제공
- **정보**: 통화, 예산별 가격 범위, 현지 팁

**입력 파라미터:**
```json
{
  "destination": "프랑스"
}
```

### 3. 📊 여행지 경비 비교 (`compare_destinations`)
- **기능**: 여러 여행지의 경비를 동시에 비교
- **정렬**: 가격순 자동 정렬 (🥇🥈🥉 메달 표시)
- **상세 정보**: 현지 비용과 항공료 분리 표시

**입력 파라미터:**
```json
{
  "destinations": ["일본", "태국", "베트남"],
  "days": 7,
  "budget_level": "budget"
}
```

**출력 예시:**
```
🔍 여행지 경비 비교 (7일, 저예산)

🥇 베트남: 629,000원
   (현지비용: 329,000원 + 항공료: 300,000원)

🥈 태국: 791,000원
   (현지비용: 441,000원 + 항공료: 350,000원)

🥉 일본: 1,005,000원
   (현지비용: 805,000원 + 항공료: 200,000원)
```

## 🌏 지원 여행지

### 아시아 (7개국)
- 🇯🇵 **일본**: 팁 문화 없음, 안전한 여행
- 🇹🇭 **태국**: 저렴한 물가, 예산 여행 최적
- 🇻🇳 **베트남**: 매우 저렴, 장기 여행 적합
- 🇸🇬 **싱가포르**: 높은 물가, 깨끗하고 안전
- 🇲🇾 **말레이시아**: 합리적 물가, 다양한 문화
- 🇵🇭 **필리핀**: 아름다운 해변, 저렴한 물가
- 🇮🇩 **인도네시아**: 발리 등 독특한 섬 문화

### 유럽 (3개국)
- 🇫🇷 **프랑스**: 높은 물가, 풍부한 문화와 예술
- 🇮🇹 **이탈리아**: 역사적 유적지, 맛있는 음식
- 🇪🇸 **스페인**: 상대적 저렴, 플라멩고와 축제

### 미주 (2개국)
- 🇺🇸 **미국**: 높은 물가, 다양한 경험과 자연
- 🇨🇦 **캐나다**: 아름다운 자연경관, 안전한 환경

## 💰 예산 수준별 특징

| 수준 | 영문 | 특징 | 숙박 | 식사 | 교통 |
|------|------|------|------|------|------|
| 💚 저예산 | budget | 백패커, 게스트하우스 | 도미토리, 모텔 | 로컬 음식, 길거리 음식 | 대중교통 |
| 💛 중간예산 | mid | 일반 관광객 | 3성급 호텔, 비즈니스 호텔 | 일반 레스토랑 | 택시, 렌터카 |
| 💜 고급 | luxury | 럭셔리 여행 | 5성급 호텔, 리조트 | 고급 레스토랑 | 프라이빗 카, 헬리콥터 |

## 🛠️ 설치 및 사용법

### 1. 의존성 설치
```bash
npm install
```

### 2. 빌드
```bash
npm run build
```

### 3. 서버 실행
```bash
npm start
```

### 4. 개발 모드
```bash
npm run dev
```

## 📡 MCP 통신 예시

### 도구 목록 조회
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
```

### 경비 계산 요청
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"calculate_travel_cost","arguments":{"destination":"일본","days":5,"budget_level":"mid","travelers":2}}}' | node dist/index.js
```

## 🏗️ 기술 스택

- **언어**: TypeScript
- **런타임**: Node.js
- **프로토콜**: Model Context Protocol (MCP)
- **SDK**: @modelcontextprotocol/sdk
- **통신**: Standard I/O (stdin/stdout)

## 📁 프로젝트 구조

```
travel-cost-mcp-server/
├── src/
│   └── index.ts          # 메인 서버 코드
├── dist/                 # 컴파일된 JavaScript
├── package.json          # 의존성 및 스크립트
├── tsconfig.json         # TypeScript 설정
├── mcp.json             # MCP 서버 설정
└── README.md            # 이 파일
```

## 🔧 커스터마이징

### 새로운 여행지 추가
`src/index.ts`의 `TRAVEL_COSTS` 객체에 새로운 국가 정보를 추가할 수 있습니다:

```typescript
'새로운국가': {
  accommodation: { budget: 50000, mid: 120000, luxury: 300000 },
  food: { budget: 30000, mid: 60000, luxury: 150000 },
  transport: { local: 15000, city: 25000, country: 100000 },
  activities: { budget: 20000, mid: 50000, luxury: 120000 },
  currency: 'KRW',
  exchangeRate: 1,
  tips: '새로운 국가의 여행 팁'
}
```

### 항공료 업데이트
`estimateFlightCost` 메서드에서 항공료를 실시간 API로 대체할 수 있습니다.

## 🌟 특징

- ✅ **정확한 비용 계산**: 실제 여행 경험을 바탕으로 한 현실적인 가격
- ✅ **다양한 예산 수준**: 모든 여행자의 예산에 맞는 옵션
- ✅ **상세한 분석**: 카테고리별 비용 분석으로 예산 계획 지원
- ✅ **비교 기능**: 여러 여행지를 한번에 비교하여 최적의 선택
- ✅ **현지 팁**: 각 여행지별 실용적인 여행 조언
- ✅ **TypeScript**: 타입 안정성과 개발 편의성
- ✅ **MCP 표준**: AI 모델과의 원활한 통합

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Made with ❤️ for travelers worldwide** 🌍✈️
