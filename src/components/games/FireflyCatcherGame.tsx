'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Target, Zap, Trophy } from 'lucide-react';

interface Insect {
  id: string;
  type: 'yellow-firefly' | 'red-firefly' | 'moth' | 'beetle';
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: { x: number; y: number };
  isVisible: boolean;
  createdAt: number;
}

interface GameStats {
  score: number;
  correctTaps: number;
  incorrectTaps: number;
  missed: number;
  accuracy: number;
  reactionTimes: number[];
  avgReactionTime: number;
}

export default function FireflyCatcherGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStartTime = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [insects, setInsects] = useState<Insect[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctTaps: 0,
    incorrectTaps: 0,
    missed: 0,
    accuracy: 0,
    reactionTimes: [],
    avgReactionTime: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showInstructions, setShowInstructions] = useState(true);

  // 난이도별 설정
  const difficultySettings = {
    easy: { spawnRate: 2000, maxInsects: 3, speed: 1 },
    medium: { spawnRate: 1500, maxInsects: 5, speed: 1.5 },
    hard: { spawnRate: 1000, maxInsects: 7, speed: 2 }
  };

  // 곤충 데이터
  const insectData = {
    'yellow-firefly': { color: '#FFD700', points: 10, emoji: '✨', size: 25 },
    'red-firefly': { color: '#FF4444', points: -5, emoji: '🔴', size: 25 },
    'moth': { color: '#8B4513', points: -3, emoji: '🦋', size: 30 },
    'beetle': { color: '#2F4F2F', points: -3, emoji: '🪲', size: 28 }
  };

  // 게임 초기화
  const initGame = useCallback(() => {
    setInsects([]);
    setGameStats({
      score: 0,
      correctTaps: 0,
      incorrectTaps: 0,
      missed: 0,
      accuracy: 0,
      reactionTimes: [],
      avgReactionTime: 0
    });
    setTimeLeft(180);
  }, []);

  // 곤충 생성
  const createInsect = useCallback((): Insect | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const types: Array<keyof typeof insectData> = ['yellow-firefly', 'red-firefly', 'moth', 'beetle'];
    const weights = [40, 25, 20, 15]; // 노란 반딧불이가 가장 많이 나타남
    
    let randomValue = Math.random() * 100;
    let selectedType: keyof typeof insectData = 'yellow-firefly';
    
    for (let i = 0; i < weights.length; i++) {
      if (randomValue < weights[i]) {
        selectedType = types[i];
        break;
      }
      randomValue -= weights[i];
    }

    const settings = difficultySettings[difficulty];
    const size = insectData[selectedType].size;
    
    const insect: Insect = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedType,
      x: Math.random() * (canvas.width - size * 2) + size,
      y: Math.random() * (canvas.height - size * 2) + size,
      size,
      speed: settings.speed * (0.5 + Math.random() * 0.5),
      direction: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      isVisible: true,
      createdAt: Date.now()
    };

    return insect;
  }, [difficulty]);

  // 곤충 이동 및 업데이트
  const updateInsects = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setInsects(prevInsects => {
      return prevInsects.filter(insect => {
        // 경계에서 튕기기
        if (insect.x <= insect.size || insect.x >= canvas.width - insect.size) {
          insect.direction.x *= -1;
        }
        if (insect.y <= insect.size || insect.y >= canvas.height - insect.size) {
          insect.direction.y *= -1;
        }

        // 위치 업데이트
        insect.x += insect.direction.x * insect.speed;
        insect.y += insect.direction.y * insect.speed;

        // 경계 보정
        insect.x = Math.max(insect.size, Math.min(canvas.width - insect.size, insect.x));
        insect.y = Math.max(insect.size, Math.min(canvas.height - insect.size, insect.y));

        // 5초 후 자동 제거 (놓친 것으로 처리)
        if (Date.now() - insect.createdAt > 5000) {
          if (insect.type === 'yellow-firefly') {
            setGameStats(prev => ({ ...prev, missed: prev.missed + 1 }));
          }
          return false;
        }

        return true;
      });
    });
  }, []);

  // 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 배경 그리기 (밤하늘)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 그리기
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 47) % canvas.width;
      const y = (i * 31) % canvas.height;
      const size = Math.random() * 1 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 곤충 그리기
    insects.forEach(insect => {
      const data = insectData[insect.type];
      
      // 반딧불이 효과 (빛나는 효과)
      if (insect.type.includes('firefly')) {
        const glowSize = insect.size * 2;
        const gradient = ctx.createRadialGradient(
          insect.x, insect.y, 0,
          insect.x, insect.y, glowSize
        );
        gradient.addColorStop(0, data.color + '80');
        gradient.addColorStop(0.3, data.color + '40');
        gradient.addColorStop(1, data.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(insect.x, insect.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 곤충 본체
      ctx.font = `${insect.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.emoji, insect.x, insect.y);

      // 히트박스 시각화 (개발용 - 실제로는 제거)
      if (process.env.NODE_ENV === 'development') {
        ctx.strokeStyle = data.color + '40';
        ctx.beginPath();
        ctx.arc(insect.x, insect.y, insect.size, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [insects]);

  // 마우스/터치 클릭 처리
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let hitInsect: Insect | null = null;
    let minDistance = Infinity;

    // 가장 가까운 곤충 찾기
    insects.forEach(insect => {
      const distance = Math.sqrt(
        Math.pow(clickX - insect.x, 2) + Math.pow(clickY - insect.y, 2)
      );
      
      if (distance <= insect.size && distance < minDistance) {
        hitInsect = insect;
        minDistance = distance;
      }
    });

    if (hitInsect) {
      const reactionTime = Date.now() - hitInsect.createdAt;
      const points = insectData[hitInsect.type].points;
      
      // 통계 업데이트
      setGameStats(prev => {
        const newReactionTimes = [...prev.reactionTimes, reactionTime];
        const newCorrectTaps = hitInsect.type === 'yellow-firefly' ? prev.correctTaps + 1 : prev.correctTaps;
        const newIncorrectTaps = hitInsect.type === 'yellow-firefly' ? prev.incorrectTaps : prev.incorrectTaps + 1;
        const totalAttempts = newCorrectTaps + newIncorrectTaps;
        const accuracy = totalAttempts > 0 ? (newCorrectTaps / totalAttempts) * 100 : 0;
        const avgReactionTime = newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length;

        return {
          ...prev,
          score: prev.score + points,
          reactionTimes: newReactionTimes,
          correctTaps: newCorrectTaps,
          incorrectTaps: newIncorrectTaps,
          accuracy,
          avgReactionTime
        };
      });

      // 곤충 제거
      setInsects(prev => prev.filter(i => i.id !== hitInsect!.id));
    }
  }, [isPlaying, insects]);


  // 게임 시작
  const startGame = () => {
    initGame();
    setIsPlaying(true);
    setShowInstructions(false);
  };

  // 게임 일시정지
  const pauseGame = () => {
    setIsPlaying(false);
  };

  // 게임 재시작
  const resetGame = () => {
    setIsPlaying(false);
    initGame();
    setShowInstructions(true);
  };

  // 게임 루프
  useEffect(() => {
    if (!isPlaying) return;

    const settings = difficultySettings[difficulty];
    
    // 곤충 생성 인터벌
    const spawnInterval = setInterval(() => {
      setInsects(currentInsects => {
        if (currentInsects.length < settings.maxInsects) {
          const newInsect = createInsect();
          if (newInsect) {
            return [...currentInsects, newInsect];
          }
        }
        return currentInsects;
      });
    }, settings.spawnRate);

    // 게임 업데이트 루프
    const gameLoop = setInterval(() => {
      updateInsects();
      render();
    }, 1000 / 30); // 30 FPS

    return () => {
      clearInterval(spawnInterval);
      clearInterval(gameLoop);
    };
  }, [isPlaying, difficulty, createInsect, updateInsects, render]);

  // 게임 타이머 (별도 useEffect)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // 캔버스 초기화 및 크기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 반응형 캔버스 크기 설정
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const aspectRatio = 800 / 500; // 원하는 가로:세로 비율
        
        canvas.width = Math.min(containerWidth - 32, 800); // 패딩 고려
        canvas.height = canvas.width / aspectRatio;
        
        // CSS 크기도 동일하게 설정
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        
        render();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [render]);

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
      {showInstructions && (
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
                <h4 className="font-semibold mb-2">목표</h4>
                <ul className="space-y-1 text-sm">
                  <li>✨ 노란 반딧불이만 빠르게 탭하기 (+10점)</li>
                  <li>🔴 빨간 반딧불이는 피하기 (-5점)</li>
                  <li>🦋 나방과 🪲 딱정벌레도 피하기 (-3점)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">주의사항</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 정확성과 속도가 모두 중요해요</li>
                  <li>• 곤충은 5초 후 사라져요</li>
                  <li>• 충동적으로 클릭하지 말고 잘 보고 선택하세요</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Controls */}
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
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border-2 border-gray-200 rounded-lg cursor-crosshair"
          />
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        <div className="flex gap-2">
          <Button
            onClick={startGame}
            disabled={isPlaying}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            시작
          </Button>
          
          <Button
            onClick={pauseGame}
            disabled={!isPlaying}
            variant="outline"
            className="gap-2"
          >
            <Pause className="w-4 h-4" />
            일시정지
          </Button>
          
          <Button
            onClick={resetGame}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            다시하기
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">난이도:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            disabled={isPlaying}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
        </div>
      </div>

      {/* Game Stats */}
      {(gameStats.correctTaps > 0 || gameStats.incorrectTaps > 0) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>게임 통계</CardTitle>
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
                  {gameStats.avgReactionTime ? Math.round(gameStats.avgReactionTime) : 0}ms
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