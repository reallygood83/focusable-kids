'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Utensils, ShoppingBag, Trophy, Volume2 } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface Order {
  items: { food: FoodItem; quantity: number }[];
  audioText: string;
}

interface ConveyorFood {
  id: string;
  food: FoodItem;
  x: number;
  y: number;
  speed: number;
}

interface GameStats {
  score: number;
  level: number;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  accuracy: number;
  avgCompletionTime: number;
  perfectOrders: number;
}

const FOODS: FoodItem[] = [
  { id: 'apple', name: '사과', emoji: '🍎', color: '#FF6B6B' },
  { id: 'sandwich', name: '샌드위치', emoji: '🥪', color: '#DEB887' },
  { id: 'banana', name: '바나나', emoji: '🍌', color: '#FFE135' },
  { id: 'cookie', name: '쿠키', emoji: '🍪', color: '#D2691E' },
  { id: 'milk', name: '우유', emoji: '🥛', color: '#F5F5F5' },
  { id: 'donut', name: '도넛', emoji: '🍩', color: '#FFB6C1' },
  { id: 'pizza', name: '피자', emoji: '🍕', color: '#FF8C00' },
  { id: 'hamburger', name: '햄버거', emoji: '🍔', color: '#8B4513' }
];

export default function MonsterLunchboxGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [lunchbox, setLunchbox] = useState<{ [key: string]: number }>({});
  const [conveyorFoods, setConveyorFoods] = useState<ConveyorFood[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    accuracy: 0,
    avgCompletionTime: 0,
    perfectOrders: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showInstructions, setShowInstructions] = useState(true);
  const [orderTimer, setOrderTimer] = useState(15); // 주문 완료 제한 시간
  const [feedback, setFeedback] = useState<string>('');

  const orderStartTime = useRef<number>(0);
  const completionTimes = useRef<number[]>([]);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      orderSize: 2, 
      orderTime: 20, 
      conveyorSpeed: 1, 
      foodSpawnRate: 2000 
    },
    medium: { 
      orderSize: 3, 
      orderTime: 18, 
      conveyorSpeed: 1.5, 
      foodSpawnRate: 1500 
    },
    hard: { 
      orderSize: 4, 
      orderTime: 15, 
      conveyorSpeed: 2, 
      foodSpawnRate: 1200 
    }
  };

  // 음성 합성 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  // 주문 생성
  const generateOrder = useCallback((): Order => {
    const settings = difficultySettings[difficulty];
    const orderSize = Math.min(settings.orderSize + Math.floor(gameStats.level / 3), FOODS.length);
    
    // 주문할 음식들 선택 (중복 없이)
    const selectedFoods = [...FOODS].sort(() => Math.random() - 0.5).slice(0, orderSize);
    
    const items = selectedFoods.map(food => ({
      food,
      quantity: Math.floor(Math.random() * 3) + 1 // 1-3개
    }));

    // 음성 텍스트 생성
    const itemTexts = items.map(item => `${item.food.name} ${item.quantity}개`);
    const audioText = itemTexts.join('랑 ') + ' 주세요!';

    return { items, audioText };
  }, [difficulty, gameStats.level]);

  // 주문 음성 재생
  const playOrderAudio = useCallback((orderText: string) => {
    if (!speechSynthesis.current) return;

    try {
      speechSynthesis.current.cancel(); // 이전 음성 취소
      
      const utterance = new SpeechSynthesisUtterance(orderText);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1.2; // 몬스터 목소리처럼 높게
      utterance.volume = 0.8;
      
      // 에러 처리
      utterance.onerror = (event) => {
        console.warn('음성 재생 중 오류 발생:', event);
      };
      
      speechSynthesis.current.speak(utterance);
    } catch (error) {
      console.warn('음성 합성을 지원하지 않는 브라우저입니다:', error);
    }
  }, []);

  // 컨베이어 벨트 음식 생성
  const spawnConveyorFood = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const food = FOODS[Math.floor(Math.random() * FOODS.length)];
    const settings = difficultySettings[difficulty];
    
    const newFood: ConveyorFood = {
      id: Math.random().toString(36).substr(2, 9),
      food,
      x: canvas.width,
      y: 200 + Math.random() * 100, // 컨베이어 벨트 영역
      speed: settings.conveyorSpeed
    };

    setConveyorFoods(prev => [...prev, newFood]);
  }, [difficulty]);

  // 컨베이어 벨트 업데이트
  const updateConveyor = useCallback(() => {
    setConveyorFoods(prev => 
      prev.filter(food => {
        food.x -= food.speed;
        return food.x > -50; // 화면 밖으로 나가면 제거
      })
    );
  }, []);

  // 음식을 도시락에 담기
  const addToLunchbox = useCallback((foodId: string) => {
    setLunchbox(prev => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1
    }));
  }, []);

  // 주문 확인
  const checkOrder = useCallback(() => {
    if (!currentOrder) return;

    let isCorrect = true;
    let totalRequired = 0;
    let totalProvided = 0;

    // 주문된 음식들 확인
    for (const orderItem of currentOrder.items) {
      const required = orderItem.quantity;
      const provided = lunchbox[orderItem.food.id] || 0;
      
      totalRequired += required;
      totalProvided += provided;
      
      if (provided !== required) {
        isCorrect = false;
      }
    }

    // 추가로 담긴 음식이 있는지 확인
    for (const foodId in lunchbox) {
      if (!currentOrder.items.find(item => item.food.id === foodId)) {
        if (lunchbox[foodId] > 0) {
          isCorrect = false;
        }
      }
    }

    const completionTime = Date.now() - orderStartTime.current;
    completionTimes.current.push(completionTime);

    if (isCorrect) {
      // 성공
      const points = currentOrder.items.length * 20 + (difficulty === 'hard' ? 20 : difficulty === 'medium' ? 10 : 0);
      
      setGameStats(prev => {
        const newStats = {
          ...prev,
          score: prev.score + points,
          totalOrders: prev.totalOrders + 1,
          completedOrders: prev.completedOrders + 1,
          level: Math.floor((prev.completedOrders + 1) / 3) + 1,
          perfectOrders: prev.perfectOrders + 1
        };
        
        newStats.accuracy = (newStats.completedOrders / newStats.totalOrders) * 100;
        newStats.avgCompletionTime = completionTimes.current.reduce((a, b) => a + b, 0) / completionTimes.current.length;
        
        return newStats;
      });
      
      setFeedback(`완벽해요! 몬스터가 기뻐해요! +${points}점`);
    } else {
      // 실패
      setGameStats(prev => {
        const newStats = {
          ...prev,
          totalOrders: prev.totalOrders + 1,
          failedOrders: prev.failedOrders + 1
        };
        
        newStats.accuracy = prev.totalOrders > 0 ? (prev.completedOrders / newStats.totalOrders) * 100 : 0;
        
        return newStats;
      });
      
      setFeedback('아쉬워요! 주문과 다르네요. 다시 도전해보세요!');
    }

    // 다음 주문 준비
    setTimeout(() => {
      startNewOrder();
    }, 2000);
  }, [currentOrder, lunchbox, difficulty]);

  // 새 주문 시작
  const startNewOrder = useCallback(() => {
    const order = generateOrder();
    setCurrentOrder(order);
    setLunchbox({});
    setFeedback('');
    
    const settings = difficultySettings[difficulty];
    setOrderTimer(settings.orderTime);
    orderStartTime.current = Date.now();
    
    // 몬스터 음성으로 주문 읽기
    setTimeout(() => {
      playOrderAudio(`몬스터: ${order.audioText}`);
    }, 500);
  }, [generateOrder, difficulty, playOrderAudio]);

  // 캔버스 클릭 처리
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 터치 이벤트인 경우 첫 번째 터치 포인트 사용
    let clientX: number;
    let clientY: number;
    
    if ('touches' in event) {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // 클릭 위치를 캔버스 좌표계로 변환
    const clickX = (clientX - rect.left) * (canvas.width / dpr) / rect.width;
    const clickY = (clientY - rect.top) * (canvas.height / dpr) / rect.height;

    // 컨베이어 벨트의 음식 클릭 확인
    const clickedFood = conveyorFoods.find(food => {
      const distance = Math.sqrt(
        Math.pow(clickX - food.x, 2) + Math.pow(clickY - food.y, 2)
      );
      return distance <= 40; // 클릭 가능 반경을 더 크게
    });

    if (clickedFood) {
      // 음식을 도시락에 담기
      addToLunchbox(clickedFood.food.id);
      
      // 컨베이어에서 제거
      setConveyorFoods(prev => prev.filter(f => f.id !== clickedFood.id));
    }
  }, [isPlaying, conveyorFoods, addToLunchbox]);

  // 캔버스 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 배경 그리기
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 컨베이어 벨트 그리기
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 180, canvas.width, 140);
    
    // 벨트 선 그리기
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 190);
      ctx.lineTo(i + 20, 190);
      ctx.moveTo(i, 310);
      ctx.lineTo(i + 20, 310);
      ctx.stroke();
    }

    // 컨베이어 음식 그리기
    conveyorFoods.forEach(food => {
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.food.emoji, food.x, food.y);
    });

    // 몬스터 그리기
    ctx.font = '60px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👹', 100, 100);
    
    // 몬스터 말풍선
    if (currentOrder) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.fillRect(150, 50, 300, 80);
      ctx.strokeRect(150, 50, 300, 80);
      
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      const orderText = currentOrder.items.map(item => 
        `${item.food.emoji} ${item.quantity}개`
      ).join(' ');
      ctx.fillText(orderText, 160, 90);
    }

    // 도시락 영역 그리기
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(canvas.width - 250, canvas.height - 120, 200, 100);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 250, canvas.height - 120, 200, 100);
    
    // 도시락 제목
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('도시락', canvas.width - 150, canvas.height - 130);

    // 도시락 내용물 표시
    let index = 0;
    for (const [foodId, quantity] of Object.entries(lunchbox)) {
      if (quantity > 0) {
        const food = FOODS.find(f => f.id === foodId);
        if (food) {
          const x = canvas.width - 230 + (index % 4) * 45;
          const y = canvas.height - 100 + Math.floor(index / 4) * 40;
          
          ctx.font = '24px serif';
          ctx.textAlign = 'center';
          ctx.fillText(food.emoji, x, y);
          
          // 수량 표시
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x + 12, y - 12, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(quantity.toString(), x + 12, y - 8);
          
          index++;
        }
      }
    }

    // 타이머 표시
    ctx.fillStyle = orderTimer <= 5 ? '#FF4444' : '#4CAF50';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`⏰ ${orderTimer}초`, canvas.width - 20, 30);
  }, [conveyorFoods, currentOrder, lunchbox, orderTimer]);

  // 게임 초기화
  const initGame = useCallback(() => {
    setGameStats({
      score: 0,
      level: 1,
      totalOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      accuracy: 0,
      avgCompletionTime: 0,
      perfectOrders: 0
    });
    setCurrentOrder(null);
    setLunchbox({});
    setConveyorFoods([]);
    setFeedback('');
    setOrderTimer(15);
    setTimeLeft(180);
    completionTimes.current = [];
  }, []);

  // 게임 시작
  const startGame = () => {
    initGame();
    setIsPlaying(true);
    setShowInstructions(false);
    setTimeout(() => startNewOrder(), 1000);
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

  // 주문 다시 듣기
  const replayOrder = () => {
    if (currentOrder) {
      playOrderAudio(`몬스터: ${currentOrder.audioText}`);
    }
  };

  // 게임 루프
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      updateConveyor();
      render();
    }, 1000 / 30); // 30 FPS

    const spawnInterval = setInterval(() => {
      spawnConveyorFood();
    }, difficultySettings[difficulty].foodSpawnRate);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawnInterval);
    };
  }, [isPlaying, difficulty, updateConveyor, render, spawnConveyorFood]);

  // 주문 타이머
  useEffect(() => {
    if (!isPlaying || !currentOrder) return;

    const timer = setInterval(() => {
      setOrderTimer(prev => {
        if (prev <= 1) {
          // 시간 초과
          setGameStats(prevStats => {
            const newStats = {
              ...prevStats,
              totalOrders: prevStats.totalOrders + 1,
              failedOrders: prevStats.failedOrders + 1
            };
            
            newStats.accuracy = prevStats.totalOrders > 0 ? (prevStats.completedOrders / newStats.totalOrders) * 100 : 0;
            
            return newStats;
          });
          
          setFeedback('시간 초과! 몬스터가 배고파해요 😢');
          setTimeout(() => startNewOrder(), 2000);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentOrder, startNewOrder]);

  // 게임 타이머
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
        const aspectRatio = 800 / 400; // 원하는 가로:세로 비율
        
        // CSS 크기 설정
        const cssWidth = Math.min(containerWidth, 800);
        const cssHeight = cssWidth / aspectRatio;
        
        // 캔버스 실제 크기 설정
        const dpr = window.devicePixelRatio || 1;
        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        
        canvas.style.width = cssWidth + 'px';
        canvas.style.height = cssHeight + 'px';
        
        // 컨텍스트 스케일 조정
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
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
        <h1 className="text-3xl font-bold mb-2">👹 까다로운 몬스터의 도시락</h1>
        <p className="text-gray-600">몬스터의 주문을 정확히 듣고 도시락을 만들어주세요!</p>
        <Badge className="mt-2" variant="outline">작업 기억 게임</Badge>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">👂</div>
                <h4 className="font-semibold mb-1">1. 주문 듣기</h4>
                <p className="text-sm">몬스터가 말하는 음식과 개수를 정확히 기억하세요</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🏃‍♂️</div>
                <h4 className="font-semibold mb-1">2. 음식 잡기</h4>
                <p className="text-sm">컨베이어 벨트에서 필요한 음식을 빠르게 잡으세요</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📦</div>
                <h4 className="font-semibold mb-1">3. 도시락 완성</h4>
                <p className="text-sm">주문한 음식과 개수를 정확히 맞춰서 완성하세요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <div className="text-sm text-gray-600">레벨</div>
                <div className="text-2xl font-bold text-green-600">{gameStats.level}</div>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">성공률</div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.accuracy.toFixed(1)}%
                </div>
              </div>
              <Utensils className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">남은 시간</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="text-red-500">⏰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback */}
      {feedback && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-center text-lg font-semibold text-blue-700">
              {feedback}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Canvas */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onTouchStart={handleCanvasClick}
            className="border-2 border-gray-200 rounded-lg cursor-pointer touch-none"
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
          
          {currentOrder && (
            <Button
              onClick={replayOrder}
              variant="outline"
              className="gap-2"
            >
              <Volume2 className="w-4 h-4" />
              주문 다시 듣기
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">난이도:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              disabled={isPlaying}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="easy">쉬움 (2개)</option>
              <option value="medium">보통 (3개)</option>
              <option value="hard">어려움 (4개)</option>
            </select>
          </div>
          
          {isPlaying && currentOrder && (
            <Button
              onClick={checkOrder}
              className="gap-2"
              variant="default"
            >
              <ShoppingBag className="w-4 h-4" />
              주문 완성!
            </Button>
          )}
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalOrders > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.completedOrders}</div>
                <div className="text-sm text-gray-600">완성한 주문</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.failedOrders}</div>
                <div className="text-sm text-gray-600">실패한 주문</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.perfectOrders}</div>
                <div className="text-sm text-gray-600">완벽한 주문</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {gameStats.avgCompletionTime ? Math.round(gameStats.avgCompletionTime / 1000) : 0}초
                </div>
                <div className="text-sm text-gray-600">평균 완료 시간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}