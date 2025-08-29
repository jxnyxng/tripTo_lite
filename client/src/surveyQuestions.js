
const surveyQuestions = [
  {
    id: 'q0',
    question: '여행 유형을 선택하세요.',
    type: 'checkbox',
    options: ['국내', '해외']
  },
  {
    id: 'q4',
    question: '여행 총예산을 입력하세요. (만원 단위)',
    type: 'number',
    min: 1
  },
  {
    id: 'q4_2',
    question: '예산 내에서 지출 수준을 선택하세요.',
    type: 'select',
    options: ['가성비 지출', '적당히 지출', '모두 지출']
  },
  {
    id: 'q1',
    question: '여행 목적을 선택하세요.',
    type: 'checkbox',
    options: ['휴식', '관광', '액티비티', '문화 체험', '자연 탐방']
  },
  {
    id: 'q4_1',
    question: '여행 인원수를 입력하세요.',
    type: 'number',
    min: 1
  },
  {
    id: 'q2',
    question: '여행 동반자를 선택하세요.',
    type: 'select',
    options: ['혼자', '가족', '친구', '연인', '기타']
  },
  {
    id: 'q5',
    question: '여행 기간(몇 박)을 선택하세요.',
    type: 'select',
    options: ['2박', '3박', '5박', '7박', '10박 이상']
  },
  {
    id: 'q6',
    question: '숙박 형태를 선택하세요.',
    type: 'checkbox',
    options: ['호텔', '리조트', '게스트하우스', '펜션', '캠핑']
  },
  {
    id: 'q7',
    question: '여행지에서 가장 중요하게 생각하는 요소를 선택하세요.',
    type: 'checkbox',
    options: ['음식', '경치', '액티비티', '쇼핑', '휴식']
  },
  {
    id: 'q8',
    question: '여행지에서 꼭 해보고 싶은 활동을 선택하세요.',
    type: 'checkbox',
    options: ['등산', '해양 스포츠', '문화유적 탐방', '미식 투어', '휴양']
  },
  {
    id: 'q9',
    question: '여행지에서 가장 걱정되는 요소를 선택하세요.',
    type: 'select',
    options: ['치안', '물가', '교통', '언어', '날씨']
  },
  {
    id: 'q10',
    question: '기타 여행 시 고려하는 점이 있다면 자유롭게 입력하세요.',
    type: 'text'
  },
  {
    id: 'q11',
    question: '추천받고 싶은 여행지 개수를 선택하세요.',
    type: 'select',
    options: ['1', '2', '3', '4', '5']
  },
  {
    id: 'q12',
    question: '대략적인 비용을 알아볼 숙박형태를 선택하세요.',
    type: 'select',
    options: ['호텔', '게스트하우스', '리조트', '펜션']
  }
];

export default surveyQuestions;
