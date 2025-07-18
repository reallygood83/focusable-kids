'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useAuth } from '@/contexts/auth-context';
import { 
  gameConfigs, 
  generateStimulus, 
  calculateGameScore,
  GameStimulus, 
  GameResponse, 
  GameResult 
} from '@/data/game-config';
import { useToast } from '@/hooks/use-toast';

type GameState = 'ready' | 'playing' | 'paused' | 'finished';

export default function GamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const gameId = params.gameId as string;
  const gameConfig = gameConfigs[gameId];
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [currentStimulus, setCurrentStimulus] = useState<GameStimulus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [responses, setResponses] = useState<GameResponse[]>([]);
  const [stimuli, setStimuli] = useState<GameStimulus[]>([]);
  const [gameStats, setGameStats] = useState({
    hits: 0,
    misses: 0,
    falseAlarms: 0,
    correctRejections: 0
  });

  const gameStartTime = useRef<number>(0);
  const stimulusTimeout = useRef<NodeJS.Timeout | null>(null);
  const gameTimer = useRef<NodeJS.Timeout | null>(null);
  const currentStimulusRef = useRef<GameStimulus | null>(null);
  const responseStartTime = useRef<number>(0);

  useEffect(() => {
    if (!gameConfig) {
      router.push('/games');
      return;
    }
    
    setTimeRemaining(gameConfig.duration);
  }, [gameConfig, router]);

  // 게임 상태가 playing으로 변경되면 자극 스케줄링 시작
  useEffect(() => {
    if (gameState === 'playing') {
      console.log('Game state changed to playing, starting stimulus scheduling...');
      
      const startStimulus = () => {
        const delay = 1000; // 1초 후 첫 자극 시작
        
        const timeout = setTimeout(() => {
          if (gameState !== 'playing') return;
          
          const isTarget = Math.random() < gameConfig.targetProbability;
          const stimulus = generateStimulus(gameConfig, isTarget);
          
          console.log('First stimulus:', stimulus.type, stimulus.shape, stimulus.color);
          
          setCurrentStimulus(stimulus);
          setStimuli(prev => [...prev, stimulus]);
          currentStimulusRef.current = stimulus;
          responseStartTime.current = Date.now();
          
          // 자극 표시 시간 후 자동으로 숨기기 및 다음 자극 스케줄링
          setTimeout(() => {
            if (currentStimulusRef.current?.id === stimulus.id) {
              // 반응하지 않은 경우 처리
              setResponses(prev => {
                const existingResponse = prev.find(r => r.stimulusId === stimulus.id);
                if (existingResponse) return prev;
                
                const response: GameResponse = {
                  stimulusId: stimulus.id,
                  responseTime: gameConfig.stimulusDuration,
                  isCorrect: stimulus.type === 'nontarget',
                  responseType: stimulus.type === 'target' ? 'miss' : 'correctRejection',
                  timestamp: Date.now()
                };
                
                setGameStats(prevStats => ({
                  ...prevStats,
                  [response.responseType === 'miss' ? 'misses' : 'correctRejections']: 
                    prevStats[response.responseType === 'miss' ? 'misses' : 'correctRejections'] + 1
                }));
                
                return [...prev, response];
              });
              
              setCurrentStimulus(null);
              currentStimulusRef.current = null;
            }
          }, gameConfig.stimulusDuration);
          
        }, delay);
        
        return timeout;
      };
      
      const timeout = startStimulus();
      return () => clearTimeout(timeout);
    }
  }, [gameState, gameConfig]);

  const startGame = useCallback(() => {
    console.log('Starting game...');
    setGameState('playing');
    setTimeRemaining(gameConfig.duration);
    setResponses([]);
    setStimuli([]);
    setGameStats({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 });
    setCurrentStimulus(null);
    
    gameStartTime.current = Date.now();
    
    // 게임 타이머 시작
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    gameTimer.current = timer;
  }, [gameConfig]);

  // 지속적인 자극 생성을 위한 useEffect
  useEffect(() => {
    if (gameState === 'playing') {
      const stimulusInterval = setInterval(() => {
        const isTarget = Math.random() < gameConfig.targetProbability;
        const stimulus = generateStimulus(gameConfig, isTarget);
        
        console.log('Generating stimulus:', stimulus.type, stimulus.shape, stimulus.color);
        
        setCurrentStimulus(stimulus);
        setStimuli(prev => [...prev, stimulus]);
        currentStimulusRef.current = stimulus;
        responseStartTime.current = Date.now();
        
        // 자극 표시 시간 후 자동으로 숨기기
        setTimeout(() => {
          if (currentStimulusRef.current?.id === stimulus.id) {
            // 반응하지 않은 경우 처리
            setResponses(prev => {
              const existingResponse = prev.find(r => r.stimulusId === stimulus.id);
              if (existingResponse) return prev;
              
              const response: GameResponse = {
                stimulusId: stimulus.id,
                responseTime: gameConfig.stimulusDuration,
                isCorrect: stimulus.type === 'nontarget',
                responseType: stimulus.type === 'target' ? 'miss' : 'correctRejection',
                timestamp: Date.now()
              };
              
              setGameStats(prevStats => ({
                ...prevStats,
                [response.responseType === 'miss' ? 'misses' : 'correctRejections']: 
                  prevStats[response.responseType === 'miss' ? 'misses' : 'correctRejections'] + 1
              }));
              
              return [...prev, response];
            });
            
            setCurrentStimulus(null);
            currentStimulusRef.current = null;
          }
        }, gameConfig.stimulusDuration);
        
      }, gameConfig.stimulusInterval);
      
      return () => clearInterval(stimulusInterval);
    }
  }, [gameState, gameConfig]);

  // 게임 종료 처리
  useEffect(() => {
    if (gameState === 'finished') {
      console.log('Game finished, processing results...');
      
      if (stimulusTimeout.current) {
        clearTimeout(stimulusTimeout.current);
      }
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
      }
      
      setCurrentStimulus(null);
      
      // 결과 계산 및 저장
      setTimeout(() => {
        const allResponses = [...responses];
        const totalStimuli = stimuli.length;
        const totalTargets = stimuli.filter(s => s.type === 'target').length;
        const totalNonTargets = stimuli.filter(s => s.type === 'nontarget').length;
        
        const totalReactionTimes = allResponses
          .filter(r => r.responseType === 'hit')
          .map(r => r.responseTime);
        
        const avgReactionTime = totalReactionTimes.length > 0 
          ? totalReactionTimes.reduce((a, b) => a + b, 0) / totalReactionTimes.length 
          : 0;
        
        const result = calculateGameScore({
          gameId,
          duration: gameConfig.duration,
          totalStimuli,
          totalTargets,
          totalNonTargets,
          ...gameStats,
          averageReactionTime: Math.round(avgReactionTime)
        });
        
        // 결과를 로컬스토리지에 저장 (추후 DB에 저장)
        localStorage.setItem('game_result', JSON.stringify({
          ...result,
          config: gameConfig,
          responses: allResponses,
          stimuli
        }));
        
        router.push('/games/result');
      }, 1000);
    }
  }, [gameState, responses, stimuli, gameStats, gameId, gameConfig, router]);

  const handleStimulusClick = useCallback(() => {
    if (!currentStimulusRef.current) return;
    
    const stimulus = currentStimulusRef.current;
    const responseTime = Date.now() - responseStartTime.current;
    
    if (responseTime > gameConfig.responseTimeLimit) return;
    
    const isCorrect = stimulus.type === 'target';
    const responseType = isCorrect ? 'hit' : 'falseAlarm';
    
    const response: GameResponse = {
      stimulusId: stimulus.id,
      responseTime,
      isCorrect,
      responseType,
      timestamp: Date.now()
    };
    
    setResponses(prev => [...prev, response]);
    setGameStats(prev => ({
      ...prev,
      [responseType === 'hit' ? 'hits' : 'falseAlarms']: 
        prev[responseType === 'hit' ? 'hits' : 'falseAlarms'] + 1
    }));
    
    // 자극 즉시 제거
    setCurrentStimulus(null);
    currentStimulusRef.current = null;
    
    // 피드백 표시
    if (isCorrect) {
      toast({
        title: '정답! 🎉',
        description: `반응시간: ${responseTime}ms`,
        duration: 1000
      });
    }
  }, [gameConfig.responseTimeLimit, toast]);


  const pauseGame = () => {
    setGameState('paused');
    if (stimulusTimeout.current) {
      clearTimeout(stimulusTimeout.current);
    }
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }
  };

  const resumeGame = () => {
    setGameState('playing');
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    gameTimer.current = timer;
  };

  const resetGame = () => {
    setGameState('ready');
    setCurrentStimulus(null);
    setTimeRemaining(gameConfig.duration);
    setResponses([]);
    setStimuli([]);
    setGameStats({ hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0 });
    
    if (stimulusTimeout.current) {
      clearTimeout(stimulusTimeout.current);
    }
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }
  };

  if (!gameConfig) {
    return <div>로딩 중...</div>;
  }

  const progress = ((gameConfig.duration - timeRemaining) / gameConfig.duration) * 100;
  const totalResponses = gameStats.hits + gameStats.misses + gameStats.falseAlarms + gameStats.correctRejections;
  const currentAccuracy = totalResponses > 0 ? 
    Math.round(((gameStats.hits + gameStats.correctRejections) / totalResponses) * 100) : 0;

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
                <div className="text-xl font-bold text-gray-900">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
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
                <div className="text-xl font-bold text-gray-900">{currentAccuracy}%</div>
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
              <div 
                className="min-h-[400px] flex items-center justify-center cursor-pointer relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                onClick={handleStimulusClick}
              >
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
                  <div className="relative">
                    <StimulusDisplay stimulus={currentStimulus} />
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                        클릭하세요!
                      </Badge>
                    </div>
                  </div>
                )}
                
                {gameState === 'playing' && !currentStimulus && (
                  <div className="text-center text-gray-500">
                    <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-2"></div>
                    <div className="text-sm">대기 중...</div>
                  </div>
                )}
                
                {gameState === 'paused' && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">게임 일시정지</h2>
                    <Button onClick={resumeGame} size="lg" className="gap-2">
                      <Play className="w-5 h-5" />
                      계속하기
                    </Button>
                  </div>
                )}
                
                {gameState === 'finished' && (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">게임 완료! 🎉</h2>
                    <p className="text-gray-600 mb-6">결과 페이지로 이동합니다...</p>
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
            
            {(gameState === 'ready' || gameState === 'paused') && (
              <Button onClick={resetGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                다시 시작
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 자극 표시 컴포넌트
function StimulusDisplay({ stimulus }: { stimulus: GameStimulus }) {
  const getShapeComponent = () => {
    const size = 80;
    const color = stimulus.color || 'blue';
    
    const colorMap = {
      red: '#ef4444',
      blue: '#3b82f6', 
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7'
    };
    
    const fillColor = colorMap[color as keyof typeof colorMap] || '#3b82f6';
    
    switch (stimulus.shape) {
      case 'circle':
        return (
          <div 
            className="rounded-full border-4 border-gray-300 shadow-xl" 
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
            className="border-4 border-gray-300 shadow-xl" 
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
            className="shadow-xl"
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
          <div className="text-6xl" style={{ color: fillColor }}>⭐</div>
        );
      default:
        return <div className="w-20 h-20 bg-blue-500 rounded" />;
    }
  };
  
  return (
    <div className="flex items-center justify-center animate-bounce">
      {getShapeComponent()}
    </div>
  );
}