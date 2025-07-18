// 문서 "포커스 포워드"의 3분 집중력 게임 카탈로그 기반
// 3가지 실행 기능별 새로운 게임 데이터

export interface EnhancedGame {
  id: string;
  title: string;
  description: string;
  category: 'inhibition' | 'working-memory' | 'cognitive-flexibility';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // seconds
  instructions: string[];
  cognitiveConnection: string;
  designPrinciples: string[];
  gameData: {
    stimuli?: any[];
    rules?: string[];
    targets?: any[];
    distractors?: any[];
  };
}

export const enhancedGames: EnhancedGame[] = [
  // 억제 조절 능력 강화 게임 (충동성 다스리기)
  {
    id: 'firefly-catcher',
    title: '반딧불이 잡기',
    description: '밤하늘의 노란 반딧불이만 탭하고, 빨간 반딧불이나 다른 곤충은 피하는 게임',
    category: 'inhibition',
    difficulty: 'easy',
    duration: 180,
    instructions: [
      '화면에 나타나는 곤충들을 주의 깊게 관찰하세요',
      '노란색으로 빛나는 반딧불이만 빠르게 탭하세요',
      '빨간 반딧불이나 다른 곤충은 절대 탭하지 마세요',
      '정확성과 속도가 모두 중요합니다!'
    ],
    cognitiveConnection: '반응 억제(response inhibition)를 직접적으로 훈련합니다. 사용자는 행동하기 전에 자극을 잠시 멈춰 평가해야 하므로, 충동성을 조절하는 연습이 됩니다.',
    designPrinciples: [
      '즉각적인 시각적 피드백',
      '명확한 목표 구분',
      '적응적 난이도 조절',
      '3분 내외 완료'
    ],
    gameData: {
      targets: [
        { type: 'yellow-firefly', color: '#FFD700', points: 10 },
      ],
      distractors: [
        { type: 'red-firefly', color: '#FF4444', penalty: -5 },
        { type: 'moth', color: '#8B4513', penalty: -3 },
        { type: 'beetle', color: '#2F4F2F', penalty: -3 }
      ]
    }
  },
  {
    id: 'simons-path',
    title: '사이먼의 길',
    description: '"사이먼 가라사대"라는 조건이 붙었을 때만 명령을 따라야 하는 규칙 기반 게임',
    category: 'inhibition',
    difficulty: 'medium',
    duration: 180,
    instructions: [
      '캐릭터가 갈림길에 서 있습니다',
      '"사이먼 가라사대: 왼쪽으로!" 라는 표지판이 나타나면 명령을 따르세요',
      '그냥 "오른쪽으로!" 라고만 나오면 움직이지 마세요',
      '규칙을 정확히 지키는 것이 핵심입니다'
    ],
    cognitiveConnection: '고전 게임 "Simon Says"에 기반하여, 규칙 기반의 억제력과 세부 사항에 대한 주의력을 강화합니다.',
    designPrinciples: [
      '명확한 규칙 제시',
      '시각적 단서 구분',
      '반응 억제 훈련',
      '집중력 향상'
    ],
    gameData: {
      rules: [
        'simon-says-left',
        'simon-says-right',
        'just-left',
        'just-right'
      ]
    }
  },

  // 작업 기억력 강화 게임 (머릿속 메모장 튼튼하게 하기)
  {
    id: 'space-delivery',
    title: '우주 택배 배달',
    description: '행성 순서를 기억하고 올바른 순서로 택배를 배달하는 게임',
    category: 'working-memory',
    difficulty: 'easy',
    duration: 180,
    instructions: [
      '3~5개의 행성이 잠시 순서대로 표시됩니다',
      '행성들이 사라진 후 빈 우주 공간을 확인하세요',
      '기억한 순서대로 정확히 탭하여 택배를 배달하세요',
      '순서가 틀리면 처음부터 다시 시작됩니다'
    ],
    cognitiveConnection: '고전적인 시공간 작업 기억 과제로, "같은 그림 찾기"나 "카드 외우기" 게임과 유사한 원리입니다.',
    designPrinciples: [
      '시각적 기억 훈련',
      '순서 기억 강화',
      '단계적 난이도 증가',
      '즉각적 피드백'
    ],
    gameData: {
      stimuli: [
        { id: 'mars', name: '화성', color: '#CD5C5C', icon: '🔴' },
        { id: 'jupiter', name: '목성', color: '#DEB887', icon: '🟠' },
        { id: 'earth', name: '지구', color: '#4169E1', icon: '🔵' },
        { id: 'venus', name: '금성', color: '#FFD700', icon: '🟡' },
        { id: 'saturn', name: '토성', color: '#F4A460', icon: '🟤' }
      ]
    }
  },
  {
    id: 'monster-lunchbox',
    title: '까다로운 몬스터의 도시락',
    description: '몬스터가 주문한 음식을 정확한 수량으로 도시락에 담아주는 게임',
    category: 'working-memory',
    difficulty: 'medium',
    duration: 180,
    instructions: [
      '몬스터가 "사과 2개랑 샌드위치 1개 줘!"라고 말합니다',
      '컨베이어 벨트에서 다양한 음식이 지나갑니다',
      '주문한 음식을 정확한 개수만큼 도시락으로 드래그하세요',
      '벨트가 끝나기 전에 주문을 완성해야 합니다'
    ],
    cognitiveConnection: '청각적 정보를 작업 기억에 유지하면서 시각-운동 과제를 수행해야 하므로, 보다 복합적이고 실생활과 유사한 상황의 작업 기억을 훈련합니다.',
    designPrinciples: [
      '청각-시각 통합',
      '멀티태스킹 능력',
      '시간 제한 압박',
      '실생활 연관성'
    ],
    gameData: {
      stimuli: [
        { id: 'apple', name: '사과', icon: '🍎', color: '#FF6B6B' },
        { id: 'sandwich', name: '샌드위치', icon: '🥪', color: '#DEB887' },
        { id: 'banana', name: '바나나', icon: '🍌', color: '#FFE135' },
        { id: 'cookie', name: '쿠키', icon: '🍪', color: '#D2691E' },
        { id: 'milk', name: '우유', icon: '🥛', color: '#F5F5F5' }
      ]
    }
  },

  // 인지적 유연성 강화 게임 (생각의 전환 연습하기)
  {
    id: 'fickle-sorter',
    title: '변덕쟁이 분류기',
    description: '규칙이 바뀌는 상황에서 도형을 올바르게 분류하는 게임',
    category: 'cognitive-flexibility',
    difficulty: 'medium',
    duration: 180,
    instructions: [
      '빨간 네모, 파란 동그라미 등 다양한 도형이 떨어집니다',
      '"색깔별로 분류!"라는 지시를 듣고 색깔별로 분류하세요',
      '30초 후 "모양별로 분류!"로 규칙이 바뀝니다',
      '새로운 규칙에 빠르게 적응하는 것이 핵심입니다'
    ],
    cognitiveConnection: '규칙 전환을 강제함으로써 인지적 유연성을 직접적으로 훈련합니다. 이는 ADHD 아동이 어려움을 겪는 핵심 실행 기능 중 하나입니다.',
    designPrinciples: [
      '규칙 전환 훈련',
      '인지적 억제',
      '유연한 사고',
      '적응력 향상'
    ],
    gameData: {
      stimuli: [
        { shape: 'square', color: 'red', icon: '🟥' },
        { shape: 'square', color: 'blue', icon: '🟦' },
        { shape: 'circle', color: 'red', icon: '🔴' },
        { shape: 'circle', color: 'blue', icon: '🔵' },
        { shape: 'triangle', color: 'red', icon: '🔺' },
        { shape: 'triangle', color: 'blue', icon: '🔷' }
      ],
      rules: ['color', 'shape']
    }
  },
  {
    id: 'unpredictable-uno',
    title: '예측불허 우노',
    description: '변화하는 규칙에 맞춰 카드를 내는 단순화된 우노 게임',
    category: 'cognitive-flexibility',
    difficulty: 'hard',
    duration: 180,
    instructions: [
      '중앙 카드와 색깔 또는 숫자가 일치하는 카드를 내세요',
      '때때로 "리버스"나 "와일드" 카드가 등장합니다',
      '특수 카드가 나오면 규칙이 일시적으로 바뀝니다',
      '변화하는 조건에 빠르게 적응하세요'
    ],
    cognitiveConnection: '변화하는 게임 조건에 맞춰 빠른 의사결정과 유연한 사고를 연습하게 합니다.',
    designPrinciples: [
      '동적 규칙 변화',
      '빠른 의사결정',
      '패턴 인식',
      '전략적 사고'
    ],
    gameData: {
      stimuli: [
        { type: 'number', color: 'red', value: '1' },
        { type: 'number', color: 'blue', value: '2' },
        { type: 'number', color: 'green', value: '3' },
        { type: 'number', color: 'yellow', value: '4' },
        { type: 'special', color: 'any', value: 'reverse' },
        { type: 'special', color: 'any', value: 'wild' }
      ]
    }
  }
];

// 게임 카테고리별 정보
export const gameCategories = {
  'inhibition': {
    name: '억제 조절',
    description: '충동성을 다스리고 반응을 조절하는 능력',
    icon: '🛑',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    benefits: [
      '충동적 행동 감소',
      '집중력 향상',
      '자기 통제력 강화',
      '사회적 상호작용 개선'
    ]
  },
  'working-memory': {
    name: '작업 기억',
    description: '정보를 머릿속에 유지하고 조작하는 능력',
    icon: '🧠',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    benefits: [
      '학습 능력 향상',
      '복잡한 과제 수행',
      '지시사항 이해력 증진',
      '문제 해결 능력 강화'
    ]
  },
  'cognitive-flexibility': {
    name: '인지적 유연성',
    description: '상황에 따라 생각과 행동을 유연하게 바꾸는 능력',
    icon: '🔄',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    benefits: [
      '적응력 향상',
      '창의적 사고',
      '문제 해결 전략 다양화',
      '스트레스 관리 능력'
    ]
  }
};

// 난이도별 설정
export const difficultySettings = {
  easy: {
    name: '쉬움',
    description: '기본 개념 익히기',
    stimuliCount: 3,
    speed: 'slow',
    timeLimit: 5000,
    color: 'text-green-600'
  },
  medium: {
    name: '보통',
    description: '실력 향상하기',
    stimuliCount: 4,
    speed: 'medium',
    timeLimit: 3000,
    color: 'text-yellow-600'
  },
  hard: {
    name: '어려움',
    description: '전문가 도전',
    stimuliCount: 5,
    speed: 'fast',
    timeLimit: 2000,
    color: 'text-red-600'
  }
};

// 게임 결과 분석 함수
export interface GameResult {
  gameId: string;
  category: string;
  score: number;
  accuracy: number;
  reactionTime: number;
  difficulty: string;
  completedAt: string;
}

export function analyzeGamePerformance(results: GameResult[]) {
  const categoryPerformance = {
    'inhibition': { total: 0, count: 0, average: 0 },
    'working-memory': { total: 0, count: 0, average: 0 },
    'cognitive-flexibility': { total: 0, count: 0, average: 0 }
  };

  results.forEach(result => {
    if (categoryPerformance[result.category as keyof typeof categoryPerformance]) {
      categoryPerformance[result.category as keyof typeof categoryPerformance].total += result.score;
      categoryPerformance[result.category as keyof typeof categoryPerformance].count += 1;
    }
  });

  // 평균 계산
  Object.keys(categoryPerformance).forEach(category => {
    const cat = categoryPerformance[category as keyof typeof categoryPerformance];
    cat.average = cat.count > 0 ? Math.round(cat.total / cat.count) : 0;
  });

  return categoryPerformance;
}