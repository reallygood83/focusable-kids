'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home,
  Timer,
  Target,
  Zap
} from 'lucide-react';
import { gameConfigs } from '@/data/game-config';
import { useToast } from '@/hooks/use-toast';

interface Stimulus {
  id: string;
  type: 'target' | 'nontarget';
  shape: 'circle' | 'square' | 'triangle' | 'star';
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  timestamp: number;
}

interface GameStats {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  totalStimuli: number;
  accuracy: number;
  avgReactionTime: number;
  score: number;
}

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const gameId = params.gameId as string;
  const gameConfig = gameConfigs[gameId];
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    hits: 0,
    misses: 0,
    falseAlarms: 0,
    correctRejections: 0,
    totalStimuli: 0,
    accuracy: 0,
    avgReactionTime: 0,
    score: 0
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!gameConfig) {
      router.push('/games');
      return;
    }
    
    setTimeRemaining(gameConfig.duration);
  }, [gameConfig, router]);

  // 자극 생성
  const generateStimulus = (): Stimulus => {
    const isTarget = Math.random() < gameConfig.targetProbability;
    const shapes: Array<'circle' | 'square' | 'triangle' | 'star'> = ['circle', 'square', 'triangle', 'star'];
    const colors: Array<'red' | 'blue' | 'green' | 'yellow' | 'purple'> = ['red', 'blue', 'green', 'yellow', 'purple'];
    
    let shape: 'circle' | 'square' | 'triangle' | 'star';
    let color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';

    if (gameConfig.id === 'attention-basic') {
      // 기본 게임: 파란색 원이 타겟
      if (isTarget) {
        shape = 'circle';
        color = 'blue';
      } else {
        shape = shapes[Math.floor(Math.random() * shapes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
        // 파란색 원이 아닌 것만
        while (shape === 'circle' && color === 'blue') {
          shape = shapes[Math.floor(Math.random() * shapes.length)];
          color = colors[Math.floor(Math.random() * colors.length)];
        }
      }
    } else if (gameConfig.id === 'attention-medium') {
      // 중급 게임: 별 모양이 타겟
      if (isTarget) {
        shape = 'star';
        color = colors[Math.floor(Math.random() * colors.length)];
      } else {
        const nonStarShapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];
        shape = nonStarShapes[Math.floor(Math.random() * nonStarShapes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
      }
    } else if (gameConfig.id === 'attention-hard') {
      // 고급 게임: 빨간색 삼각형이 타겟
      if (isTarget) {
        shape = 'triangle';
        color = 'red';
      } else {
        shape = shapes[Math.floor(Math.random() * shapes.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
        // 빨간색 삼각형이 아닌 것만
        while (shape === 'triangle' && color === 'red') {
          shape = shapes[Math.floor(Math.random() * shapes.length)];
          color = colors[Math.floor(Math.random() * colors.length)];
        }
      }
    } else {
      // 기본값
      shape = shapes[Math.floor(Math.random() * shapes.length)];
      color = colors[Math.floor(Math.random() * colors.length)];
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: isTarget ? 'target' : 'nontarget',
      shape,
      color,
      timestamp: Date.now()
    };
  };

  // 다음 자극 표시
  const showNextStimulus = () => {
    console.log('🎯 Showing next stimulus...');
    
    if (gameState !== 'playing') {
      console.log('❌ Game not playing, skipping stimulus');
      return;
    }

    const stimulus = generateStimulus();
    console.log('📝 Generated stimulus:', stimulus.type, stimulus.shape, stimulus.color);
    
    setCurrentStimulus(stimulus);
    setIsWaitingForResponse(true);
    stimulusStartTime.current = Date.now();

    // 자극 표시 시간 후 자동으로 숨기기
    responseTimerRef.current = setTimeout(() => {
      console.log('⏰ Stimulus timeout - no response');
      handleNoResponse(stimulus);
    }, gameConfig.stimulusDuration);

    // 다음 자극 스케줄링
    stimulusTimerRef.current = setTimeout(() => {
      if (gameState === 'playing') {
        showNextStimulus();
      }
    }, gameConfig.stimulusInterval);
  };

  // 응답 없음 처리
  const handleNoResponse = (stimulus: Stimulus) => {
    if (!isWaitingForResponse) return;

    console.log('📊 No response for:', stimulus.type);

    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalStimuli: prev.totalStimuli + 1,
        misses: stimulus.type === 'target' ? prev.misses + 1 : prev.misses,
        correctRejections: stimulus.type === 'nontarget' ? prev.correctRejections + 1 : prev.correctRejections
      };

      newStats.accuracy = newStats.totalStimuli > 0 
        ? ((newStats.hits + newStats.correctRejections) / newStats.totalStimuli) * 100 
        : 0;

      newStats.avgReactionTime = reactionTimes.current.length > 0
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        : 0;

      newStats.score = (newStats.hits * 10) + (newStats.correctRejections * 2) - (newStats.falseAlarms * 5) - (newStats.misses * 3);

      return newStats;
    });

    setCurrentStimulus(null);
    setIsWaitingForResponse(false);
  };

  // 자극 클릭 처리
  const handleStimulusClick = () => {
    console.log('👆 Stimulus clicked');
    
    if (!currentStimulus || !isWaitingForResponse || gameState !== 'playing') {
      console.log('❌ Invalid click state');
      return;
    }

    // 타이머 정리
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }

    const reactionTime = Date.now() - stimulusStartTime.current;
    
    // 반응 시간 제한 체크
    if (reactionTime > gameConfig.responseTimeLimit) {
      console.log('❌ Response too slow:', reactionTime, 'ms');
      return;
    }

    reactionTimes.current.push(reactionTime);

    const isCorrect = currentStimulus.type === 'target';
    console.log('📊 Response result:', isCorrect ? 'HIT' : 'FALSE ALARM');

    // 통계 업데이트
    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalStimuli: prev.totalStimuli + 1,
        hits: isCorrect ? prev.hits + 1 : prev.hits,
        falseAlarms: !isCorrect ? prev.falseAlarms + 1 : prev.falseAlarms
      };

      newStats.accuracy = newStats.totalStimuli > 0 
        ? ((newStats.hits + newStats.correctRejections) / newStats.totalStimuli) * 100 
        : 0;

      newStats.avgReactionTime = reactionTimes.current.length > 0
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        : 0;

      newStats.score = (newStats.hits * 10) + (newStats.correctRejections * 2) - (newStats.falseAlarms * 5) - (newStats.misses * 3);

      return newStats;
    });

    // 피드백 표시
    if (isCorrect) {
      toast({
        title: '정답! 🎉',
        description: `반응시간: ${reactionTime}ms`,
        duration: 1000
      });
    } else {
      toast({
        title: '오답 😅',
        description: '타겟이 아닙니다',
        duration: 1000,
        variant: 'destructive'
      });
    }

    setCurrentStimulus(null);
    setIsWaitingForResponse(false);
  };

  // 게임 시작
  const startGame = () => {
    console.log('🚀 Starting game:', gameConfig.name);
    
    setGameState('playing');
    setTimeRemaining(gameConfig.duration);
    setCurrentStimulus(null);
    setIsWaitingForResponse(false);
    setGameStats({
      hits: 0,
      misses: 0,
      falseAlarms: 0,
      correctRejections: 0,
      totalStimuli: 0,
      accuracy: 0,
      avgReactionTime: 0,
      score: 0
    });
    reactionTimes.current = [];

    // 게임 타이머 시작
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 첫 번째 자극 표시
    setTimeout(() => {
      showNextStimulus();
    }, 1000);
  };

  // 게임 일시정지
  const pauseGame = () => {
    console.log('⏸️ Pausing game...');
    setGameState('paused');
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (stimulusTimerRef.current) {
      clearTimeout(stimulusTimerRef.current);
      stimulusTimerRef.current = null;
    }
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
  };

  // 게임 재시작
  const resetGame = () => {
    console.log('🔄 Resetting game...');
    setGameState('ready');
    setCurrentStimulus(null);
    setTimeRemaining(gameConfig.duration);
    setIsWaitingForResponse(false);
    setGameStats({
      hits: 0,
      misses: 0,
      falseAlarms: 0,
      correctRejections: 0,
      totalStimuli: 0,
      accuracy: 0,
      avgReactionTime: 0,
      score: 0
    });
    reactionTimes.current = [];
    
    // 모든 타이머 정리
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (stimulusTimerRef.current) {
      clearTimeout(stimulusTimerRef.current);
      stimulusTimerRef.current = null;
    }
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
  };

  // 게임 종료 처리
  useEffect(() => {
    if (gameState === 'finished') {
      console.log('🏁 Game finished!');
      
      // 모든 타이머 정리
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
      if (stimulusTimerRef.current) {
        clearTimeout(stimulusTimerRef.current);
        stimulusTimerRef.current = null;
      }
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
        responseTimerRef.current = null;
      }

      setCurrentStimulus(null);
      setIsWaitingForResponse(false);
    }
  }, [gameState]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
    };
  }, []);

  if (!gameConfig) {
    return <div>로딩 중...</div>;
  }

  const progress = ((gameConfig.duration - timeRemaining) / gameConfig.duration) * 100;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{gameConfig.name}</h1>
              <p className="text-gray-600">{gameConfig.description}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/games')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              게임 목록
            </Button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <Timer className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xl font-bold text-gray-900">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600">남은 시간</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-xl font-bold text-gray-900">{gameStats.hits}</div>
                <div className="text-xs text-gray-600">정답</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <div className="text-xl font-bold text-gray-900">{gameStats.falseAlarms}</div>
                <div className="text-xs text-gray-600">오답</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{gameStats.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">정확도</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Game Area */}
          <Card className="bg-white border-gray-200 mb-6 shadow-lg">
            <CardContent className="p-8">
              <div className="min-h-[400px] flex items-center justify-center relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                {gameState === 'ready' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">게임 준비!</h2>
                    <p className="text-gray-600 mb-6">{gameConfig.description}</p>
                    <Button onClick={startGame} size="lg" className="gap-2">
                      <Play className="w-5 h-5" />
                      게임 시작
                    </Button>
                  </div>
                )}
                
                {gameState === 'playing' && currentStimulus && (
                  <div className="relative cursor-pointer" onClick={handleStimulusClick}>
                    <StimulusDisplay stimulus={currentStimulus} />
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                        {currentStimulus.type === 'target' ? '클릭하세요!' : '무시하세요!'}
                      </Badge>
                    </div>
                  </div>
                )}
                
                {gameState === 'playing' && !currentStimulus && (
                  <div className="text-center text-gray-500">
                    <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-2 animate-pulse"></div>
                    <div className="text-sm">다음 자극을 기다리는 중...</div>
                  </div>
                )}
                
                {gameState === 'paused' && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">게임 일시정지</h2>
                    <Button onClick={() => setGameState('playing')} size="lg" className="gap-2">
                      <Play className="w-5 h-5" />
                      계속하기
                    </Button>
                  </div>
                )}
                
                {gameState === 'finished' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">게임 완료! 🎉</h2>
                    <div className="space-y-2 mb-6">
                      <p className="text-xl text-blue-600 font-bold">최종 점수: {gameStats.score}점</p>
                      <p className="text-gray-600">정확도: {gameStats.accuracy.toFixed(1)}%</p>
                      <p className="text-gray-600">평균 반응시간: {Math.round(gameStats.avgReactionTime)}ms</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={resetGame} className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        다시 하기
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/games')} className="gap-2">
                        <Home className="w-4 h-4" />
                        게임 목록
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            {gameState === 'playing' && (
              <Button onClick={pauseGame} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" />
                일시정지
              </Button>
            )}
            
            <Button onClick={resetGame} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              다시 시작
            </Button>
          </div>

          {/* Detailed Stats */}
          {gameStats.totalStimuli > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">상세 통계</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{gameStats.hits}</div>
                    <div className="text-sm text-gray-600">정답 (Hit)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{gameStats.misses}</div>
                    <div className="text-sm text-gray-600">놓침 (Miss)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{gameStats.falseAlarms}</div>
                    <div className="text-sm text-gray-600">오답 (False Alarm)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{gameStats.correctRejections}</div>
                    <div className="text-sm text-gray-600">올바른 무시</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// 자극 표시 컴포넌트
function StimulusDisplay({ stimulus }: { stimulus: Stimulus }) {
  const getShapeComponent = () => {
    const size = 120; // 크기를 더 크게 해서 클릭하기 쉽게
    const color = stimulus.color;
    
    const colorMap = {
      red: '#ef4444',
      blue: '#3b82f6', 
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7'
    };
    
    const fillColor = colorMap[color] || '#3b82f6';
    
    switch (stimulus.shape) {
      case 'circle':
        return (
          <div 
            className="rounded-full border-4 border-gray-300 shadow-xl hover:scale-110 transition-transform duration-200 animate-pulse" 
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: fillColor 
            }} 
          />
        );
      case 'square':
        return (
          <div 
            className="border-4 border-gray-300 shadow-xl hover:scale-110 transition-transform duration-200 animate-pulse" 
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: fillColor 
            }} 
          />
        );
      case 'triangle':
        return (
          <div 
            className="shadow-xl hover:scale-110 transition-transform duration-200 animate-pulse"
            style={{ 
              width: 0, 
              height: 0,
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid ${fillColor}`,
              backgroundColor: 'transparent',
              filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
            }} 
          />
        );
      case 'star':
        return (
          <div 
            className="text-8xl hover:scale-110 transition-transform duration-200 animate-pulse" 
            style={{ color: fillColor }}
          >
            ⭐
          </div>
        );
      default:
        return <div className="w-20 h-20 bg-blue-500 rounded hover:scale-110 transition-transform duration-200" />;
    }
  };
  
  return (
    <div className="flex items-center justify-center">
      {getShapeComponent()}
    </div>
  );
}