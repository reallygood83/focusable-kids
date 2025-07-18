export interface GameConfig {
  id: string;
  name: string;
  description: string;
  duration: number; // 초
  targetType: 'shape' | 'color' | 'letter' | 'number';
  difficulty: 'easy' | 'medium' | 'hard';
  stimulusInterval: number; // 자극 간 간격 (ms)
  stimulusDuration: number; // 자극 표시 시간 (ms)
  targetProbability: number; // 타겟 출현 확률 (0-1)
  responseTimeLimit: number; // 반응 시간 제한 (ms)
}

export interface GameStimulus {
  id: string;
  type: 'target' | 'nontarget';
  shape?: 'circle' | 'square' | 'triangle' | 'star';
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  letter?: string;
  number?: number;
  timestamp: number;
}

export interface GameResponse {
  stimulusId: string;
  responseTime: number; // ms
  isCorrect: boolean;
  responseType: 'hit' | 'miss' | 'falseAlarm' | 'correctRejection';
  timestamp: number;
}

export interface GameResult {
  gameId: string;
  duration: number;
  totalStimuli: number;
  totalTargets: number;
  totalNonTargets: number;
  hits: number; // 타겟에 올바른 반응
  misses: number; // 타겟에 반응 안함
  falseAlarms: number; // 논타겟에 잘못 반응
  correctRejections: number; // 논타겟에 올바르게 반응 안함
  averageReactionTime: number;
  accuracy: number; // (hits + correctRejections) / totalStimuli
  sensitivity: number; // hits / (hits + misses) - d'
  score: number;
}

// 게임 설정 프리셋
export const gameConfigs: { [key: string]: GameConfig } = {
  'attention-basic': {
    id: 'attention-basic',
    name: '기본 집중력 게임',
    description: '파란색 원이 나타날 때만 클릭하세요!',
    duration: 180, // 3분
    targetType: 'shape',
    difficulty: 'easy',
    stimulusInterval: 2000, // 2초
    stimulusDuration: 1000, // 1초
    targetProbability: 0.3, // 30%
    responseTimeLimit: 1500
  },
  'attention-medium': {
    id: 'attention-medium',
    name: '중급 집중력 게임',
    description: '별 모양이 나타날 때만 클릭하세요!',
    duration: 180,
    targetType: 'shape',
    difficulty: 'medium',
    stimulusInterval: 1500, // 1.5초
    stimulusDuration: 800,
    targetProbability: 0.25, // 25%
    responseTimeLimit: 1200
  },
  'attention-hard': {
    id: 'attention-hard',
    name: '고급 집중력 게임',
    description: '빨간색 삼각형이 나타날 때만 클릭하세요!',
    duration: 180,
    targetType: 'color',
    difficulty: 'hard',
    stimulusInterval: 1000, // 1초
    stimulusDuration: 600,
    targetProbability: 0.2, // 20%
    responseTimeLimit: 1000
  }
};

// 자극 생성 로직
export function generateStimulus(config: GameConfig, isTarget: boolean): GameStimulus {
  const stimulus: GameStimulus = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: isTarget ? 'target' : 'nontarget',
    timestamp: Date.now()
  };

  // 기본값 설정
  stimulus.shape = 'circle';
  stimulus.color = 'blue';

  try {
    switch (config.targetType) {
      case 'shape':
        if (config.id === 'attention-basic') {
          stimulus.shape = isTarget ? 'circle' : (['square', 'triangle', 'star'] as const)[Math.floor(Math.random() * 3)];
          stimulus.color = isTarget ? 'blue' : (['red', 'green', 'yellow'] as const)[Math.floor(Math.random() * 3)];
        } else if (config.id === 'attention-medium') {
          stimulus.shape = isTarget ? 'star' : (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)];
          stimulus.color = (['red', 'blue', 'green', 'yellow'] as const)[Math.floor(Math.random() * 4)];
        } else {
          // 기본 shape 게임
          stimulus.shape = isTarget ? 'circle' : (['square', 'triangle', 'star'] as const)[Math.floor(Math.random() * 3)];
          stimulus.color = (['red', 'blue', 'green', 'yellow'] as const)[Math.floor(Math.random() * 4)];
        }
        break;
      case 'color':
        stimulus.shape = (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)];
        if (config.id === 'attention-hard') {
          if (isTarget) {
            stimulus.color = 'red';
            stimulus.shape = 'triangle';
          } else {
            const nonTargetColors = ['blue', 'green', 'yellow'] as const;
            const nonTargetShapes = ['circle', 'square'] as const;
            stimulus.color = nonTargetColors[Math.floor(Math.random() * nonTargetColors.length)];
            stimulus.shape = Math.random() < 0.5 ? 
              'triangle' : nonTargetShapes[Math.floor(Math.random() * nonTargetShapes.length)];
          }
        } else {
          // 기본 color 게임
          stimulus.color = isTarget ? 'red' : (['blue', 'green', 'yellow'] as const)[Math.floor(Math.random() * 3)];
        }
        break;
      default:
        // 기본값 유지
        break;
    }
  } catch (error) {
    console.error('Error generating stimulus:', error);
    // 에러 시 기본값 사용
  }

  return stimulus;
}

// 점수 계산
export function calculateGameScore(result: Partial<GameResult>): GameResult {
  const { hits = 0, misses = 0, falseAlarms = 0, correctRejections = 0, totalStimuli = 0 } = result;
  
  const accuracy = totalStimuli > 0 ? ((hits + correctRejections) / totalStimuli) * 100 : 0;
  const sensitivity = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;
  
  // 점수 계산 (정확도 70% + 민감도 30% 가중평균)
  const score = Math.round((accuracy * 0.7) + (sensitivity * 0.3));
  
  return {
    gameId: result.gameId || '',
    duration: result.duration || 0,
    totalStimuli,
    totalTargets: hits + misses,
    totalNonTargets: falseAlarms + correctRejections,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    averageReactionTime: result.averageReactionTime || 0,
    accuracy: Math.round(accuracy),
    sensitivity: Math.round(sensitivity),
    score
  };
}