'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Target, Zap, Trophy } from 'lucide-react';

interface Firefly {
  id: string;
  type: 'yellow' | 'red' | 'moth' | 'beetle';
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: { x: number; y: number };
  createdAt: number;
  isAlive: boolean;
}

interface GameStats {
  score: number;
  correctTaps: number;
  incorrectTaps: number;
  missed: number;
  accuracy: number;
  avgReactionTime: number;
}

export default function FireflyCatcherGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctTaps: 0,
    incorrectTaps: 0,
    missed: 0,
    accuracy: 0,
    avgReactionTime: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // 난이도별 설정
  const difficultySettings = {
    easy: { spawnRate: 2000, maxFireflies: 3, speed: 0.5 },
    medium: { spawnRate: 1500, maxFireflies: 5, speed: 1 },
    hard: { spawnRate: 1000, maxFireflies: 7, speed: 1.5 }
  };

  // 반딧불이 타입별 데이터
  const fireflyData = {
    yellow: { color: '#FFD700', points: 10, emoji: '✨', size: 30 },
    red: { color: '#FF4444', points: -5, emoji: '🔴', size: 30 },
    moth: { color: '#8B4513', points: -3, emoji: '🦋', size: 35 },
    beetle: { color: '#2F4F2F', points: -3, emoji: '🪲', size: 32 }
  };

  // 반딧불이 생성
  const createFirefly = useCallback((): Firefly | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const types: Array<keyof typeof fireflyData> = ['yellow', 'red', 'moth', 'beetle'];
    const weights = [50, 20, 15, 15]; // 노란 반딧불이가 가장 많이 나타남
    
    let randomValue = Math.random() * 100;
    let selectedType: keyof typeof fireflyData = 'yellow';
    
    for (let i = 0; i < weights.length; i++) {
      if (randomValue < weights[i]) {
        selectedType = types[i];
        break;
      }
      randomValue -= weights[i];
    }

    const settings = difficultySettings[difficulty];
    const data = fireflyData[selectedType];
    
    const firefly: Firefly = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType,
      x: Math.random() * (canvasWidth - data.size * 2) + data.size,
      y: Math.random() * (canvasHeight - data.size * 2) + data.size,
      size: data.size,
      speed: settings.speed * (0.5 + Math.random() * 0.5),
      direction: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      createdAt: Date.now(),
      isAlive: true
    };

    return firefly;
  }, [difficulty]);

  // 반딧불이 업데이트
  const updateFireflies = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    setFireflies(prevFireflies => {
      return prevFireflies.filter(firefly => {
        if (!firefly.isAlive) return false;

        // 경계에서 튕기기
        if (firefly.x <= firefly.size || firefly.x >= canvasWidth - firefly.size) {
          firefly.direction.x *= -1;
        }
        if (firefly.y <= firefly.size || firefly.y >= canvasHeight - firefly.size) {
          firefly.direction.y *= -1;
        }

        // 위치 업데이트
        firefly.x += firefly.direction.x * firefly.speed;
        firefly.y += firefly.direction.y * firefly.speed;

        // 경계 보정
        firefly.x = Math.max(firefly.size, Math.min(canvasWidth - firefly.size, firefly.x));
        firefly.y = Math.max(firefly.size, Math.min(canvasHeight - firefly.size, firefly.y));

        // 5초 후 자동 제거 (놓친 것으로 처리)
        if (Date.now() - firefly.createdAt > 5000) {
          if (firefly.type === 'yellow') {
            setGameStats(prev => ({ 
              ...prev, 
              missed: prev.missed + 1,
              accuracy: prev.correctTaps + prev.incorrectTaps > 0 
                ? (prev.correctTaps / (prev.correctTaps + prev.incorrectTaps)) * 100 
                : 0
            }));
          }
          return false;
        }

        return true;
      });
    });
  }, []);

  // 캔버스 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // 캔버스 크기 설정 - 픽셀 비율 고려
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // 컨텍스트 스케일링
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 배경 그리기 (밤하늘)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 별 그리기
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 47) % canvasWidth;
      const y = (i * 31) % canvasHeight;
      const size = Math.random() * 1 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 반딧불이 그리기
    fireflies.forEach(firefly => {
      const data = fireflyData[firefly.type];
      
      // 반딧불이 효과 (빛나는 효과)
      if (firefly.type === 'yellow' || firefly.type === 'red') {
        const glowSize = firefly.size * 1.5;
        const gradient = ctx.createRadialGradient(
          firefly.x, firefly.y, 0,
          firefly.x, firefly.y, glowSize
        );
        gradient.addColorStop(0, data.color + '80');
        gradient.addColorStop(0.5, data.color + '40');
        gradient.addColorStop(1, data.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 반딧불이 본체 (더 크게 그리기)
      ctx.font = `${firefly.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.emoji, firefly.x, firefly.y);
    });
  }, [fireflies]);

  // 클릭/터치 처리
  const handleCanvasInteraction = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    console.log('🎯 Canvas interaction detected');
    
    if (gameState !== 'playing') {
      console.log('❌ Game not playing');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // 클릭/터치 위치 계산
    let clientX: number;
    let clientY: number;
    
    if ('touches' in event) {
      if (event.touches.length === 0 && event.changedTouches.length > 0) {
        // touchend 이벤트의 경우
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else if (event.touches.length > 0) {
        // touchstart/touchmove 이벤트의 경우
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // 정확한 클릭 좌표 계산 (스케일링 고려)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (clientX - rect.left) * (scaleX / (window.devicePixelRatio || 1));
    const clickY = (clientY - rect.top) * (scaleY / (window.devicePixelRatio || 1));
    
    console.log('📍 Click position:', clickX, clickY);
    
    let hitFirefly: Firefly | null = null;
    let minDistance = Infinity;

    // 가장 가까운 반딧불이 찾기
    fireflies.forEach(firefly => {
      const distance = Math.sqrt(
        Math.pow(clickX - firefly.x, 2) + Math.pow(clickY - firefly.y, 2)
      );
      
      // 히트박스를 크게 설정 (터치하기 쉽게)
      const hitRadius = firefly.size * 1.5;
      
      console.log(`🐛 Firefly ${firefly.id} at (${firefly.x.toFixed(1)}, ${firefly.y.toFixed(1)}), distance: ${distance.toFixed(1)}, hitRadius: ${hitRadius}`);
      
      if (distance <= hitRadius && distance < minDistance) {
        hitFirefly = firefly;
        minDistance = distance;
      }
    });

    if (hitFirefly) {
      console.log('🎯 Hit firefly:', hitFirefly.type);
      
      const reactionTime = Date.now() - hitFirefly.createdAt;
      const points = fireflyData[hitFirefly.type].points;
      
      reactionTimes.current.push(reactionTime);
      
      // 통계 업데이트
      setGameStats(prev => {
        const newCorrectTaps = hitFirefly!.type === 'yellow' ? prev.correctTaps + 1 : prev.correctTaps;
        const newIncorrectTaps = hitFirefly!.type === 'yellow' ? prev.incorrectTaps : prev.incorrectTaps + 1;
        const totalAttempts = newCorrectTaps + newIncorrectTaps;
        const accuracy = totalAttempts > 0 ? (newCorrectTaps / totalAttempts) * 100 : 0;
        const avgReactionTime = reactionTimes.current.length > 0
          ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
          : 0;

        return {
          ...prev,
          score: prev.score + points,
          correctTaps: newCorrectTaps,
          incorrectTaps: newIncorrectTaps,
          accuracy,
          avgReactionTime
        };
      });

      // 반딧불이 제거
      setFireflies(prev => prev.filter(f => f.id !== hitFirefly!.id));
    } else {
      console.log('❌ No firefly hit');
    }
  }, [gameState, fireflies]);

  // 게임 루프
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const settings = difficultySettings[difficulty];

    // 반딧불이 생성
    if (now - lastSpawnTime.current > settings.spawnRate && fireflies.length < settings.maxFireflies) {
      const newFirefly = createFirefly();
      if (newFirefly) {
        console.log('🐛 New firefly created:', newFirefly.type);
        setFireflies(prev => [...prev, newFirefly]);
        lastSpawnTime.current = now;
      }
    }

    // 반딧불이 업데이트
    updateFireflies();
    
    // 렌더링
    render();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, difficulty, fireflies.length, createFirefly, updateFireflies, render]);

  // 게임 시작
  const startGame = () => {
    console.log('🚀 Starting Firefly Catcher game...');
    
    setGameState('playing');
    setTimeLeft(180);
    setFireflies([]);
    setGameStats({
      score: 0,
      correctTaps: 0,
      incorrectTaps: 0,
      missed: 0,
      accuracy: 0,
      avgReactionTime: 0
    });
    reactionTimes.current = [];
    lastSpawnTime.current = Date.now();
  };

  // 게임 일시정지
  const pauseGame = () => {
    console.log('⏸️ Pausing game...');
    setGameState('paused');
  };

  // 게임 재시작
  const resetGame = () => {
    console.log('🔄 Resetting game...');
    setGameState('ready');
    setFireflies([]);
    setTimeLeft(180);
    setGameStats({
      score: 0,
      correctTaps: 0,
      incorrectTaps: 0,
      missed: 0,
      accuracy: 0,
      avgReactionTime: 0
    });
    reactionTimes.current = [];
  };

  // 게임 루프 시작/정지
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // 게임 타이머
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🌟 반딧불이 잡기</h1>
        <p className="text-gray-600">노란 반딧불이만 탭하고, 다른 곤충은 피하세요!</p>
        <Badge className="mt-2" variant="outline">억제 조절 게임</Badge>
      </div>

      {/* Instructions */}
      {gameState === 'ready' && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">✅ 목표</h4>
                <ul className="space-y-1 text-sm">
                  <li>✨ <strong>노란 반딧불이</strong>만 빠르게 탭하기 <span className="text-green-600">(+10점)</span></li>
                  <li>🔴 빨간 반딧불이는 피하기 <span className="text-red-600">(-5점)</span></li>
                  <li>🦋 나방과 🪲 딱정벌레도 피하기 <span className="text-red-600">(-3점)</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">💡 팁</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 정확성과 속도가 모두 중요해요</li>
                  <li>• 곤충은 5초 후 사라져요</li>
                  <li>• 충동적으로 클릭하지 말고 잘 보고 선택하세요</li>
                  <li>• 터치 영역이 넓으니 근처를 터치해도 됩니다</li>
                </ul>
              </div>
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
              <Target className="w-8 h-8 text-green-500" />
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

      {/* Game Canvas */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasInteraction}
              onTouchStart={handleCanvasInteraction}
              onTouchEnd={handleCanvasInteraction}
              className="w-full h-96 border-2 border-gray-200 rounded-lg cursor-crosshair touch-none bg-gray-900"
              style={{ 
                touchAction: 'none',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            />
            
            {gameState === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-4">게임 준비!</h2>
                  <p className="mb-4">노란 반딧불이만 터치하세요</p>
                  <Button onClick={startGame} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    게임 시작
                  </Button>
                </div>
              </div>
            )}
            
            {gameState === 'paused' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-4">게임 일시정지</h2>
                  <Button onClick={() => setGameState('playing')} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    계속하기
                  </Button>
                </div>
              </div>
            )}
            
            {gameState === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">게임 완료! 🎉</h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-xl text-yellow-400 font-bold">최종 점수: {gameStats.score}점</p>
                    <p>정확도: {gameStats.accuracy.toFixed(1)}%</p>
                    <p>평균 반응시간: {Math.round(gameStats.avgReactionTime)}ms</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetGame} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      다시 하기
                    </Button>
                  </div>
                </div>
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
            <option value="easy">쉬움 (느림)</option>
            <option value="medium">보통 (중간)</option>
            <option value="hard">어려움 (빠름)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {(gameStats.correctTaps > 0 || gameStats.incorrectTaps > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.correctTaps}</div>
                <div className="text-sm text-gray-600">정확한 탭</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.incorrectTaps}</div>
                <div className="text-sm text-gray-600">잘못된 탭</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{gameStats.missed}</div>
                <div className="text-sm text-gray-600">놓친 반딧불이</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
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