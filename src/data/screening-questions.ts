export interface ScreeningQuestion {
  id: number;
  text: string;
  category: 'attention' | 'hyperactivity' | 'impulsivity';
  gradeLevel: 'lower' | 'upper' | 'both';
  audioUrl?: string; // 저학년용 음성 파일
}

// ADHD 스크리닝 질문 (DSM-5 기반 수정)
export const screeningQuestions: ScreeningQuestion[] = [
  // 주의력 문제 (Attention)
  {
    id: 1,
    text: "세부적인 것에 주의를 기울이지 못하거나 학교 과제나 다른 활동에서 부주의한 실수를 자주 한다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 2, 
    text: "과제나 놀이 활동에서 지속적으로 주의를 집중하는 데 어려움이 있다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 3,
    text: "다른 사람이 직접 말을 할 때 듣지 않는 것처럼 보인다",
    category: "attention", 
    gradeLevel: "both"
  },
  {
    id: 4,
    text: "지시를 따르지 못하고 학교 과제나 집안일을 끝내지 못한다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 5,
    text: "과제와 활동을 체계적으로 정리하는 데 어려움이 있다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 6,
    text: "지속적인 정신적 노력이 필요한 과제를 피하거나 하기 싫어한다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 7,
    text: "과제나 활동에 필요한 물건들을 자주 잃어버린다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 8,
    text: "외부 자극에 쉽게 산만해진다",
    category: "attention",
    gradeLevel: "both"
  },
  {
    id: 9,
    text: "일상적인 활동을 잊어버리는 경우가 많다",
    category: "attention",
    gradeLevel: "both"
  },

  // 과잉행동 (Hyperactivity)
  {
    id: 10,
    text: "손발을 가만두지 못하거나 의자에서 몸을 비튼다",
    category: "hyperactivity",
    gradeLevel: "both"
  },
  {
    id: 11,
    text: "앉아 있어야 하는 상황에서 자주 자리를 떠난다",
    category: "hyperactivity",
    gradeLevel: "both"
  },
  {
    id: 12,
    text: "부적절한 상황에서 지나치게 뛰어다니거나 기어오른다",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 13,
    text: "조용히 여가 활동에 참여하거나 놀지 못한다",
    category: "hyperactivity",
    gradeLevel: "both"
  },
  {
    id: 14,
    text: "끊임없이 활동하거나 마치 모터가 달린 것처럼 행동한다",
    category: "hyperactivity",
    gradeLevel: "both"
  },
  {
    id: 15,
    text: "말을 지나치게 많이 한다",
    category: "hyperactivity",
    gradeLevel: "both"
  },

  // 충동성 (Impulsivity)
  {
    id: 16,
    text: "질문이 채 끝나기도 전에 성급하게 대답한다",
    category: "impulsivity",
    gradeLevel: "both"
  },
  {
    id: 17,
    text: "자신의 차례를 기다리는 데 어려움이 있다",
    category: "impulsivity", 
    gradeLevel: "both"
  },
  {
    id: 18,
    text: "다른 사람을 방해하고 간섭한다",
    category: "impulsivity",
    gradeLevel: "both"
  }
];

// 저학년용 간소화된 질문
export const simplifiedQuestions: ScreeningQuestion[] = [
  {
    id: 1,
    text: "숙제를 할 때 실수를 자주 해요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 2,
    text: "한 가지 일에 오래 집중하기 어려워요",
    category: "attention", 
    gradeLevel: "lower"
  },
  {
    id: 3,
    text: "다른 사람이 말할 때 잘 안 들어요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 4,
    text: "시킨 일을 끝까지 하지 못해요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 5,
    text: "물건을 자주 잃어버려요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 6,
    text: "다른 소리가 나면 금방 딴 곳을 봐요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 7,
    text: "해야 할 일을 자주 까먹어요",
    category: "attention",
    gradeLevel: "lower"
  },
  {
    id: 8,
    text: "의자에 가만히 앉아있기 어려워요",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 9,
    text: "앉아 있어야 할 때 자주 일어나요",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 10,
    text: "조용히 놀기가 어려워요",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 11,
    text: "항상 움직이고 있어요",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 12,
    text: "말을 너무 많이 해요",
    category: "hyperactivity",
    gradeLevel: "lower"
  },
  {
    id: 13,
    text: "질문을 다 듣기 전에 대답해요",
    category: "impulsivity",
    gradeLevel: "lower"
  },
  {
    id: 14,
    text: "차례를 기다리기 어려워요",
    category: "impulsivity",
    gradeLevel: "lower"
  },
  {
    id: 15,
    text: "다른 사람의 일에 끼어들어요",
    category: "impulsivity",
    gradeLevel: "lower"
  }
];

export const responseOptions = [
  { value: 0, label: '전혀 그렇지 않다', color: 'bg-green-100' },
  { value: 1, label: '가끔 그렇다', color: 'bg-yellow-100' },
  { value: 2, label: '자주 그렇다', color: 'bg-orange-100' },
  { value: 3, label: '매우 자주 그렇다', color: 'bg-red-100' }
];

export function calculateScreeningScore(responses: number[]) {
  const total = responses.reduce((sum, score) => sum + score, 0);
  const maxScore = responses.length * 3;
  const percentage = (total / maxScore) * 100;
  
  let riskLevel: 'low' | 'moderate' | 'high';
  if (percentage < 30) {
    riskLevel = 'low';
  } else if (percentage < 60) {
    riskLevel = 'moderate'; 
  } else {
    riskLevel = 'high';
  }

  return {
    total,
    maxScore,
    percentage: Math.round(percentage),
    riskLevel
  };
}