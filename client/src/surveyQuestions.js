// 설문 질문 예시 (추후 고도화 가능)
const surveyQuestions = [
  {
    id: 'q1',
    question: '여행을 갈 때 가장 중요하게 생각하는 것은 무엇인가요?',
    type: 'text',
  },
  {
    id: 'q2',
    question: '선호하는 여행 스타일을 선택하세요.',
    type: 'select',
    options: ['휴양', '액티비티', '문화', '미식', '쇼핑']
  },
  {
    id: 'q3',
    question: '여행 예산을 입력하세요. (단위: 만원)',
    type: 'number',
    min: 1,
    max: 300
  },
  {
    id: 'q4',
    question: '여행 기간(몇 박)을 선택하세요.',
    type: 'select',
    options: ['3박', '5박', '7박']
  }
];

export default surveyQuestions;
