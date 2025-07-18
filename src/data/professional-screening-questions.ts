// K-ARS 기반 전문 ADHD 스크리닝 설문지 (DSM-5 기준)
// 출처: 첨부된 전략 보고서 "포커스 포워드" 표 1

export interface ProfessionalQuestion {
  id: number;
  category: 'attention' | 'hyperactivity-impulsivity' | 'functional-impairment';
  subcategory?: string;
  text: string;
  description?: string;
  dsmReference?: string;
}

export interface ResponseOption {
  value: number;
  label: string;
  description: string;
  color: string;
}

// 증상 빈도 평가 척도 (0-3점)
export const symptomResponseOptions: ResponseOption[] = [
  {
    value: 0,
    label: "전혀 없음",
    description: "지난 6개월간 이런 모습을 전혀 보이지 않았습니다",
    color: "text-green-600"
  },
  {
    value: 1,
    label: "가끔",
    description: "가끔씩 이런 모습을 보였습니다",
    color: "text-yellow-600"
  },
  {
    value: 2,
    label: "자주",
    description: "자주 이런 모습을 보였습니다",
    color: "text-orange-600"
  },
  {
    value: 3,
    label: "매우 자주",
    description: "거의 매일 이런 모습을 보였습니다",
    color: "text-red-600"
  }
];

// 기능 손상 평가 척도 (0-3점)
export const impairmentResponseOptions: ResponseOption[] = [
  {
    value: 0,
    label: "어려움 없음",
    description: "이 영역에서 특별한 어려움이 없습니다",
    color: "text-green-600"
  },
  {
    value: 1,
    label: "약간의 어려움",
    description: "가끔 약간의 어려움을 겪습니다",
    color: "text-yellow-600"
  },
  {
    value: 2,
    label: "상당한 어려움",
    description: "일상생활에 상당한 어려움을 겪습니다",
    color: "text-orange-600"
  },
  {
    value: 3,
    label: "심각한 어려움",
    description: "매우 심각한 어려움을 겪고 있습니다",
    color: "text-red-600"
  }
];

// DSM-5 기준 18개 핵심 증상 문항 (K-ARS 기반)
export const professionalQuestions: ProfessionalQuestion[] = [
  // 부주의 증상 (9개 문항)
  {
    id: 1,
    category: 'attention',
    subcategory: 'detail-attention',
    text: "세부적인 면에 대해 꼼꼼하게 주의를 기울이지 못하거나, 학업 등에서 부주의한 실수를 합니다.",
    description: "과제나 활동에서 세심한 주의를 기울이지 못해 실수를 자주 범합니다.",
    dsmReference: "DSM-5 부주의 증상 1번"
  },
  {
    id: 2,
    category: 'attention',
    subcategory: 'sustained-attention',
    text: "과제를 하거나 놀이를 할 때 지속적으로 주의를 집중하는 데 어려움이 있습니다.",
    description: "숙제나 놀이 활동 중에 계속 집중하기 어려워합니다.",
    dsmReference: "DSM-5 부주의 증상 2번"
  },
  {
    id: 3,
    category: 'attention',
    subcategory: 'listening',
    text: "다른 사람이 마주 보고 이야기할 때 경청하지 않는 것처럼 보일 때가 많습니다.",
    description: "직접 말을 걸어도 듣지 않는 것처럼 보입니다.",
    dsmReference: "DSM-5 부주의 증상 3번"
  },
  {
    id: 4,
    category: 'attention',
    subcategory: 'follow-through',
    text: "지시를 따르지 않고 학업, 심부름, 과제 등을 끝내지 못하는 경우가 많습니다.",
    description: "시작은 하지만 끝까지 마무리하지 못하는 경우가 많습니다.",
    dsmReference: "DSM-5 부주의 증상 4번"
  },
  {
    id: 5,
    category: 'attention',
    subcategory: 'organization',
    text: "과제나 활동을 체계적으로 조직하는 데 어려움을 겪습니다.",
    description: "순서대로 정리하거나 계획적으로 진행하는 것을 어려워합니다.",
    dsmReference: "DSM-5 부주의 증상 5번"
  },
  {
    id: 6,
    category: 'attention',
    subcategory: 'mental-effort',
    text: "지속적인 정신적 노력이 요구되는 과제(학교 공부나 숙제)를 피하거나 싫어합니다.",
    description: "집중해야 하는 과제를 회피하거나 극도로 싫어합니다.",
    dsmReference: "DSM-5 부주의 증상 6번"
  },
  {
    id: 7,
    category: 'attention',
    subcategory: 'losing-things',
    text: "과제나 활동에 필요한 물건들(예: 학용품, 책, 숙제)을 자주 잃어버립니다.",
    description: "중요한 물건들을 계속 잃어버리거나 어디 두었는지 모릅니다.",
    dsmReference: "DSM-5 부주의 증상 7번"
  },
  {
    id: 8,
    category: 'attention',
    subcategory: 'distractibility',
    text: "외부 자극에 의해 쉽게 산만해집니다.",
    description: "주변의 소음이나 움직임에 쉽게 주의가 분산됩니다.",
    dsmReference: "DSM-5 부주의 증상 8번"
  },
  {
    id: 9,
    category: 'attention',
    subcategory: 'forgetfulness',
    text: "일상적으로 하는 일을 자주 잊어버립니다.",
    description: "매일 해야 하는 일들을 깜빡깜빡 잊어버립니다.",
    dsmReference: "DSM-5 부주의 증상 9번"
  },

  // 과잉행동-충동성 증상 (9개 문항)
  {
    id: 10,
    category: 'hyperactivity-impulsivity',
    subcategory: 'fidgeting',
    text: "손발을 가만히 두지 못하거나 의자에 앉아서도 몸을 꼼지락거립니다.",
    description: "앉아 있을 때도 손발을 움직이거나 몸을 계속 움직입니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 1번"
  },
  {
    id: 11,
    category: 'hyperactivity-impulsivity',
    subcategory: 'leaving-seat',
    text: "가만히 앉아 있어야 하는 교실이나 다른 상황에서 자리를 자주 이탈합니다.",
    description: "수업 시간이나 앉아 있어야 할 때 자리에서 일어납니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 2번"
  },
  {
    id: 12,
    category: 'hyperactivity-impulsivity',
    subcategory: 'running-climbing',
    text: "부적절한 상황에서 지나치게 뛰어다니거나 기어오릅니다.",
    description: "상황에 맞지 않게 과도하게 뛰거나 기어오르려고 합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 3번"
  },
  {
    id: 13,
    category: 'hyperactivity-impulsivity',
    subcategory: 'quiet-activities',
    text: "여가 활동이나 놀이에 조용히 참여하기가 어렵습니다.",
    description: "조용한 놀이나 활동을 차분히 즐기지 못합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 4번"
  },
  {
    id: 14,
    category: 'hyperactivity-impulsivity',
    subcategory: 'driven-by-motor',
    text: "끊임없이 활동하거나 마치 '모터가 달린 것처럼' 행동합니다.",
    description: "잠시도 가만히 있지 못하고 계속 움직이거나 활동합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 5번"
  },
  {
    id: 15,
    category: 'hyperactivity-impulsivity',
    subcategory: 'excessive-talking',
    text: "지나치게 말을 많이 합니다.",
    description: "상황에 비해 과도하게 많은 말을 계속 합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 6번"
  },
  {
    id: 16,
    category: 'hyperactivity-impulsivity',
    subcategory: 'blurting-answers',
    text: "질문이 채 끝나기도 전에 성급하게 대답합니다.",
    description: "질문을 끝까지 듣지 않고 답을 말해버립니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 7번"
  },
  {
    id: 17,
    category: 'hyperactivity-impulsivity',
    subcategory: 'waiting-turn',
    text: "차례를 기다리는 데 어려움이 있습니다.",
    description: "자기 순서를 참고 기다리는 것을 매우 어려워합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 8번"
  },
  {
    id: 18,
    category: 'hyperactivity-impulsivity',
    subcategory: 'interrupting',
    text: "다른 사람의 활동을 방해하고 간섭합니다 (예: 대화나 게임에 끼어들기).",
    description: "다른 사람의 대화나 놀이에 불쑥 끼어들거나 방해합니다.",
    dsmReference: "DSM-5 과잉행동-충동성 증상 9번"
  }
];

// 기능 손상 척도 6개 문항 (K-ARS-5 기반)
export const functionalImpairmentQuestions: ProfessionalQuestion[] = [
  {
    id: 19,
    category: 'functional-impairment',
    subcategory: 'family-relationship',
    text: "위 행동들로 인해 부모 및 가족과의 관계에서 어려움을 겪습니까?",
    description: "ADHD 증상으로 인해 가족 관계에 문제가 생기는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 1번"
  },
  {
    id: 20,
    category: 'functional-impairment',
    subcategory: 'teacher-relationship',
    text: "위 행동들로 인해 교사와의 관계에서 어려움을 겪습니까?",
    description: "ADHD 증상으로 인해 선생님과의 관계에 문제가 생기는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 2번"
  },
  {
    id: 21,
    category: 'functional-impairment',
    subcategory: 'peer-relationship',
    text: "위 행동들로 인해 친구를 사귀거나 관계를 유지하는 데 어려움을 겪습니까?",
    description: "ADHD 증상으로 인해 또래 관계에 어려움이 있는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 3번"
  },
  {
    id: 22,
    category: 'functional-impairment',
    subcategory: 'task-performance',
    text: "위 행동들로 인해 숙제를 마치거나 과제를 수행하는 데 어려움을 겪습니까?",
    description: "ADHD 증상으로 인해 과제 수행에 어려움이 있는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 4번"
  },
  {
    id: 23,
    category: 'functional-impairment',
    subcategory: 'academic-performance',
    text: "위 행동들로 인해 학업 성취도나 학습 태도에 어려움을 겪습니까?",
    description: "ADHD 증상으로 인해 학업에 문제가 생기는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 5번"
  },
  {
    id: 24,
    category: 'functional-impairment',
    subcategory: 'self-control-esteem',
    text: "위 행동들로 인해 자신의 행동을 통제하거나 스스로에 대해 부정적으로 생각하는 경향이 있습니까?",
    description: "ADHD 증상으로 인해 자기 통제나 자존감에 문제가 있는지 평가합니다.",
    dsmReference: "K-ARS-5 기능 손상 척도 6번"
  }
];

// 모든 문항을 합친 전체 설문지
export const allProfessionalQuestions = [
  ...professionalQuestions,
  ...functionalImpairmentQuestions
];

// 점수 계산 및 위험도 평가 함수
export interface ScreeningResult {
  attentionScore: number;
  hyperactivityScore: number;
  functionalImpairmentScore: number;
  totalSymptomScore: number;
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  clinicalRecommendation: string;
  detailedAnalysis: {
    attentionPercentage: number;
    hyperactivityPercentage: number;
    impairmentPercentage: number;
    significantSymptoms: string[];
    severityAreas: string[];
  };
}

export function calculateProfessionalScore(responses: number[]): ScreeningResult {
  // 부주의 점수 (문항 1-9)
  const attentionScore = responses.slice(0, 9).reduce((sum, score) => sum + score, 0);
  
  // 과잉행동-충동성 점수 (문항 10-18)
  const hyperactivityScore = responses.slice(9, 18).reduce((sum, score) => sum + score, 0);
  
  // 기능 손상 점수 (문항 19-24)
  const functionalImpairmentScore = responses.slice(18, 24).reduce((sum, score) => sum + score, 0);
  
  // 증상 총점 (문항 1-18)
  const totalSymptomScore = attentionScore + hyperactivityScore;
  
  // 전체 총점 (모든 문항)
  const totalScore = totalSymptomScore + functionalImpairmentScore;

  // 백분율 계산
  const attentionPercentage = Math.round((attentionScore / 27) * 100); // 9문항 × 3점 = 27점
  const hyperactivityPercentage = Math.round((hyperactivityScore / 27) * 100); // 9문항 × 3점 = 27점
  const impairmentPercentage = Math.round((functionalImpairmentScore / 18) * 100); // 6문항 × 3점 = 18점

  // 유의미한 증상 영역 식별
  const significantSymptoms: string[] = [];
  if (attentionScore >= 14) significantSymptoms.push('부주의 증상');
  if (hyperactivityScore >= 14) significantSymptoms.push('과잉행동-충동성 증상');
  if (functionalImpairmentScore >= 9) significantSymptoms.push('기능적 손상');

  // 심각도별 영역 분석
  const severityAreas: string[] = [];
  if (attentionPercentage >= 70) severityAreas.push('주의집중력');
  if (hyperactivityPercentage >= 70) severityAreas.push('행동조절력');
  if (impairmentPercentage >= 50) severityAreas.push('일상기능');

  // 위험도 계산 (DSM-5 및 K-ARS 임상 기준 참고)
  let riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  let clinicalRecommendation: string;

  if (totalSymptomScore < 18 && functionalImpairmentScore < 6) {
    riskLevel = 'low';
    clinicalRecommendation = 'ADHD 위험도가 낮습니다. 정기적인 관찰과 예방적 집중력 훈련을 권장합니다.';
  } else if (totalSymptomScore < 30 && functionalImpairmentScore < 12) {
    riskLevel = 'moderate';
    clinicalRecommendation = '경미한 ADHD 증상이 관찰됩니다. 구조화된 환경과 집중력 훈련을 권장하며, 3개월 후 재평가가 필요합니다.';
  } else if (totalSymptomScore < 42 || functionalImpairmentScore < 15) {
    riskLevel = 'high';
    clinicalRecommendation = '상당한 ADHD 증상이 관찰됩니다. 소아정신과 전문의 상담을 권장하며, 전문적인 평가와 중재가 필요할 수 있습니다.';
  } else {
    riskLevel = 'very-high';
    clinicalRecommendation = '심각한 ADHD 증상과 기능 손상이 관찰됩니다. 즉시 소아정신과 전문의의 정확한 진단과 치료를 받으시기 바랍니다.';
  }

  return {
    attentionScore,
    hyperactivityScore,
    functionalImpairmentScore,
    totalSymptomScore,
    totalScore,
    riskLevel,
    clinicalRecommendation,
    detailedAnalysis: {
      attentionPercentage,
      hyperactivityPercentage,
      impairmentPercentage,
      significantSymptoms,
      severityAreas
    }
  };
}