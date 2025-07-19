'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, MapPin, Zap, Trophy, ArrowLeft, ArrowRight } from 'lucide-react';

interface Command {
  id: string;
  text: string;
  direction: 'left' | 'right';
  isSimonSays: boolean;
  timeShown: number;
}

interface GameStats {
  score: number;
  totalCommands: number;
  correctResponses: number;
  incorrectResponses: number;
  accuracy: number;
  avgReactionTime: number;
  simonSaysFollowed: number;
  nonSimonIgnored: number;
  nonSimonFollowed: number;
}

export default function SimonsPathGame() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [currentCommand, setCurrentCommand] = useState<Command | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    totalCommands: 0,
    correctResponses: 0,
    incorrectResponses: 0,
    accuracy: 0,
    avgReactionTime: 0,
    simonSaysFollowed: 0,
    nonSimonIgnored: 0,
    nonSimonFollowed: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [characterPosition, setCharacterPosition] = useState<'center' | 'left' | 'right'>('center');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [commandProgress, setCommandProgress] = useState(0);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commandTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commandStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      commandInterval: 3000, 
      responseTime: 3000, 
      simonSaysRatio: 0.7 
    },
    medium: { 
      commandInterval: 2500, 
      responseTime: 2500, 
      simonSaysRatio: 0.6 
    },
    hard: { 
      commandInterval: 2000, 
      responseTime: 2000, 
      simonSaysRatio: 0.5 
    }
  };

  // 명령어 생성
  const generateCommand = (): Command => {
    const settings = difficultySettings[difficulty];
    const directions: Array<'left' | 'right'> = ['left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const isSimonSays = Math.random() < settings.simonSaysRatio;
    
    const directionText = direction === 'left' ? '왼쪽으로' : '오른쪽으로';
    const text = isSimonSays 
      ? `사이먼 가라사대: ${directionText}!`
      : `${directionText}!`;

    return {
      id: Math.random().toString(36).substr(2, 9),
      text,
      direction,
      isSimonSays,
      timeShown: Date.now()
    };
  };

  // 다음 명령어 표시
  const showNextCommand = () => {
    console.log('🎯 Showing next command...');
    
    if (gameState !== 'playing') {
      console.log('❌ Game not playing, skipping command');
      return;
    }

    const command = generateCommand();
    console.log('📝 Generated command:', command.text, 'isSimonSays:', command.isSimonSays);
    
    setCurrentCommand(command);
    setIsWaitingForResponse(true);
    setCommandProgress(0);
    commandStartTime.current = Date.now();

    // 프로그레스 바 애니메이션
    const settings = difficultySettings[difficulty];
    const progressInterval = 50; // 50ms마다 업데이트
    const totalSteps = settings.responseTime / progressInterval;
    let currentStep = 0;

    progressTimerRef.current = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setCommandProgress(progress);

      if (progress >= 100) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }
      }
    }, progressInterval);

    // 응답 시간 제한
    commandTimerRef.current = setTimeout(() => {
      console.log('⏰ Command timeout');
      handleTimeout();
    }, settings.responseTime);
  };

  // 응답 처리
  const handleResponse = (direction: 'left' | 'right') => {
    console.log('👆 Response:', direction);
    
    if (!currentCommand || !isWaitingForResponse || gameState !== 'playing') {
      console.log('❌ Invalid response state');
      return;
    }

    // 타이머 정리
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    const reactionTime = Date.now() - commandStartTime.current;
    reactionTimes.current.push(reactionTime);

    // 정답 여부 판단
    let isCorrect = false;
    let points = 0;

    if (currentCommand.isSimonSays) {
      // Simon Says 명령: 방향이 맞아야 함
      isCorrect = currentCommand.direction === direction;
      points = isCorrect ? 10 : -5;
      console.log('✅ Simon Says command:', isCorrect ? 'CORRECT' : 'WRONG');
    } else {
      // 일반 명령: 움직이면 안 됨 (잘못 움직임)
      isCorrect = false;
      points = -3;
      console.log('❌ Non-Simon command: WRONG (should not move)');
    }

    // 캐릭터 이동
    setCharacterPosition(direction);
    setTimeout(() => setCharacterPosition('center'), 1000);

    // 통계 업데이트
    setGameStats(prev => {
      const newStats = {
        ...prev,
        score: prev.score + points,
        totalCommands: prev.totalCommands + 1,
        correctResponses: isCorrect ? prev.correctResponses + 1 : prev.correctResponses,
        incorrectResponses: !isCorrect ? prev.incorrectResponses + 1 : prev.incorrectResponses,
        simonSaysFollowed: (currentCommand.isSimonSays && isCorrect) ? prev.simonSaysFollowed + 1 : prev.simonSaysFollowed,
        nonSimonFollowed: (!currentCommand.isSimonSays) ? prev.nonSimonFollowed + 1 : prev.nonSimonFollowed
      };
      
      newStats.accuracy = newStats.totalCommands > 0 
        ? (newStats.correctResponses / newStats.totalCommands) * 100 
        : 0;
      
      newStats.avgReactionTime = reactionTimes.current.length > 0
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        : 0;

      return newStats;
    });

    setIsWaitingForResponse(false);
    setCurrentCommand(null);
    setCommandProgress(0);
    
    // 다음 명령어 대기
    setTimeout(() => {
      if (gameState === 'playing') {
        showNextCommand();
      }
    }, 1500);
  };

  // 무응답 처리
  const handleTimeout = () => {
    console.log('⏰ Handling timeout');
    
    if (!currentCommand || gameState !== 'playing') {
      return;
    }

    // 타이머 정리
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    let isCorrect = false;
    let points = 0;

    if (currentCommand.isSimonSays) {
      // Simon Says 명령을 무시 - 틀림
      isCorrect = false;
      points = -5;
      console.log('❌ Simon Says ignored: WRONG');
    } else {
      // 일반 명령을 무시 - 정답
      isCorrect = true;
      points = 5;
      console.log('✅ Non-Simon ignored: CORRECT');
    }

    // 통계 업데이트
    setGameStats(prev => {
      const newStats = {
        ...prev,
        score: prev.score + points,
        totalCommands: prev.totalCommands + 1,
        correctResponses: isCorrect ? prev.correctResponses + 1 : prev.correctResponses,
        incorrectResponses: !isCorrect ? prev.incorrectResponses + 1 : prev.incorrectResponses,
        nonSimonIgnored: (!currentCommand.isSimonSays && isCorrect) ? prev.nonSimonIgnored + 1 : prev.nonSimonIgnored
      };
      
      newStats.accuracy = newStats.totalCommands > 0 
        ? (newStats.correctResponses / newStats.totalCommands) * 100 
        : 0;
      
      newStats.avgReactionTime = reactionTimes.current.length > 0
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        : 0;

      return newStats;
    });

    setIsWaitingForResponse(false);
    setCurrentCommand(null);
    setCommandProgress(0);
    
    // 다음 명령어 대기
    setTimeout(() => {
      if (gameState === 'playing') {
        showNextCommand();
      }
    }, 1000);
  };

  // 게임 시작
  const startGame = () => {
    console.log('🚀 Starting Simon\'s Path game...');
    
    // 게임 상태 초기화
    setGameState('playing');
    setTimeLeft(180);
    setCurrentCommand(null);
    setIsWaitingForResponse(false);
    setCharacterPosition('center');
    setCommandProgress(0);
    setGameStats({
      score: 0,
      totalCommands: 0,
      correctResponses: 0,
      incorrectResponses: 0,
      accuracy: 0,
      avgReactionTime: 0,
      simonSaysFollowed: 0,
      nonSimonIgnored: 0,
      nonSimonFollowed: 0
    });
    reactionTimes.current = [];

    // 게임 타이머 시작
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 첫 번째 명령어 표시
    setTimeout(() => {
      showNextCommand();
    }, 1000);
  };

  // 게임 일시정지
  const pauseGame = () => {
    console.log('⏸️ Pausing game...');
    setGameState('paused');
    
    // 모든 타이머 정리
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  // 게임 재시작
  const resetGame = () => {
    console.log('🔄 Resetting game...');
    setGameState('ready');
    
    // 모든 타이머 정리
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (commandTimerRef.current) {
      clearTimeout(commandTimerRef.current);
      commandTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    // 상태 초기화
    setTimeLeft(180);
    setCurrentCommand(null);
    setIsWaitingForResponse(false);
    setCharacterPosition('center');
    setCommandProgress(0);
    setGameStats({
      score: 0,
      totalCommands: 0,
      correctResponses: 0,
      incorrectResponses: 0,
      accuracy: 0,
      avgReactionTime: 0,
      simonSaysFollowed: 0,
      nonSimonIgnored: 0,
      nonSimonFollowed: 0
    });
    reactionTimes.current = [];
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isWaitingForResponse || gameState !== 'playing') return;
      
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        handleResponse('left');
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        handleResponse('right');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isWaitingForResponse, gameState, currentCommand]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🎯 사이먼의 길</h1>
        <p className="text-gray-600">"사이먼 가라사대"가 붙은 명령만 따라하세요!</p>
        <Badge className="mt-2" variant="outline">억제 조절 게임</Badge>
      </div>

      {/* Instructions */}
      {gameState === 'ready' && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">✅ 따라해야 할 명령</h4>
                <ul className="space-y-1 text-sm">
                  <li>• "사이먼 가라사대: 왼쪽으로!" → 왼쪽 버튼 클릭</li>
                  <li>• "사이먼 가라사대: 오른쪽으로!" → 오른쪽 버튼 클릭</li>
                  <li>• 정확히 따라하면 <strong>+10점</strong></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-700">❌ 무시해야 할 명령</h4>
                <ul className="space-y-1 text-sm">
                  <li>• "왼쪽으로!" (사이먼 가라사대 없음) → 아무것도 안하기</li>
                  <li>• "오른쪽으로!" (사이먼 가라사대 없음) → 아무것도 안하기</li>
                  <li>• 올바르게 무시하면 <strong>+5점</strong></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>💡 팁:</strong> 키보드로도 플레이할 수 있어요! 왼쪽 화살표(←) 또는 A키로 왼쪽, 오른쪽 화살표(→) 또는 D키로 오른쪽
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">점수</div>
                <div className="text-2xl font-bold text-blue-600">{gameStats.score}</div>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">정확도</div>
                <div className="text-2xl font-bold text-green-600">
                  {gameStats.accuracy.toFixed(1)}%
                </div>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">남은 시간</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Character and Path */}
            <div className="relative">
              <div className="flex justify-center items-center space-x-16">
                {/* Left Path */}
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>

                {/* Character */}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center transform transition-transform duration-500 ${
                  characterPosition === 'left' ? '-translate-x-16' : 
                  characterPosition === 'right' ? 'translate-x-16' : ''
                }`}>
                  <span className="text-3xl">🚶‍♂️</span>
                </div>

                {/* Right Path */}
                <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
              
              {/* Path Lines */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
                <div className="flex justify-between items-center px-8">
                  <div className="w-16 h-1 bg-gray-300 rounded"></div>
                  <div className="w-16 h-1 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Command Display */}
            <div className="h-32 flex items-center justify-center">
              {currentCommand ? (
                <div className={`text-center p-6 rounded-lg border-2 max-w-md ${
                  currentCommand.isSimonSays 
                    ? 'bg-green-50 border-green-300 text-green-800' 
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <div className="text-2xl font-bold mb-3">
                    {currentCommand.text}
                  </div>
                  {isWaitingForResponse && (
                    <div className="w-full">
                      <Progress 
                        value={commandProgress} 
                        className="w-full h-2"
                      />
                      <div className="text-xs mt-1 text-gray-600">
                        {currentCommand.isSimonSays ? '따라하세요!' : '무시하세요!'}
                      </div>
                    </div>
                  )}
                </div>
              ) : gameState === 'playing' ? (
                <div className="text-gray-500 text-lg">다음 명령을 기다리는 중...</div>
              ) : gameState === 'finished' ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">게임 완료! 🎉</div>
                  <div className="text-lg text-gray-600">최종 점수: {gameStats.score}점</div>
                  <div className="text-sm text-gray-500">정확도: {gameStats.accuracy.toFixed(1)}%</div>
                </div>
              ) : (
                <div className="text-gray-500 text-lg">게임을 시작하세요!</div>
              )}
            </div>

            {/* Action Buttons */}
            {isWaitingForResponse && gameState === 'playing' && (
              <div className="flex justify-center space-x-8">
                <Button
                  onClick={() => handleResponse('left')}
                  size="lg"
                  className="w-32 h-16 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="w-6 h-6" />
                  왼쪽
                </Button>
                
                <Button
                  onClick={() => handleResponse('right')}
                  size="lg"
                  className="w-32 h-16 text-lg gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  오른쪽
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <div className="flex gap-2">
          <Button
            onClick={startGame}
            disabled={gameState === 'playing'}
            className="gap-2"
            size="lg"
          >
            <Play className="w-4 h-4" />
            {gameState === 'ready' ? '시작' : '다시 시작'}
          </Button>
          
          <Button
            onClick={pauseGame}
            disabled={gameState !== 'playing'}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <Pause className="w-4 h-4" />
            일시정지
          </Button>
          
          <Button
            onClick={resetGame}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">난이도:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            disabled={gameState === 'playing'}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="easy">쉬움 (3초)</option>
            <option value="medium">보통 (2.5초)</option>
            <option value="hard">어려움 (2초)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalCommands > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.simonSaysFollowed}</div>
                <div className="text-sm text-gray-600">Simon Says 성공</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameStats.nonSimonIgnored}</div>
                <div className="text-sm text-gray-600">올바른 무시</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.nonSimonFollowed}</div>
                <div className="text-sm text-gray-600">잘못된 반응</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(gameStats.avgReactionTime)}ms
                </div>
                <div className="text-sm text-gray-600">평균 반응시간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}