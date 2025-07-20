'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Target, Zap, Trophy, Volume2 } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Order {
  items: { food: FoodItem; quantity: number }[];
  text: string;
}

interface GameStats {
  score: number;
  completedOrders: number;
  failedOrders: number;
  totalOrders: number;
  accuracy: number;
  avgCompletionTime: number;
}

export default function MonsterLunchboxGame() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [lunchbox, setLunchbox] = useState<{ [key: string]: number }>({});
  const [conveyorItems, setConveyorItems] = useState<(FoodItem & { x: number; id: string })[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    completedOrders: 0,
    failedOrders: 0,
    totalOrders: 0,
    accuracy: 0,
    avgCompletionTime: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [orderStartTime, setOrderStartTime] = useState<number>(0);

  const conveyorRef = useRef<HTMLDivElement>(null);
  const completionTimes = useRef<number[]>([]);

  // 음식 아이템 데이터
  const foodItems: FoodItem[] = [
    { id: 'apple', name: '사과', icon: '🍎', color: '#FF6B6B' },
    { id: 'sandwich', name: '샌드위치', icon: '🥪', color: '#DEB887' },
    { id: 'banana', name: '바나나', icon: '🍌', color: '#FFE135' },
    { id: 'cookie', name: '쿠키', icon: '🍪', color: '#D2691E' },
    { id: 'milk', name: '우유', icon: '🥛', color: '#F5F5F5' },
    { id: 'pizza', name: '피자', icon: '🍕', color: '#FF8C00' },
    { id: 'burger', name: '햄버거', icon: '🍔', color: '#8B4513' },
    { id: 'donut', name: '도넛', icon: '🍩', color: '#FFB6C1' }
  ];

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      maxItems: 2, 
      maxQuantity: 2, 
      conveyorSpeed: 2, 
      orderTime: 15000,
      availableFoods: 4 
    },
    medium: { 
      maxItems: 3, 
      maxQuantity: 3, 
      conveyorSpeed: 3, 
      orderTime: 12000,
      availableFoods: 6 
    },
    hard: { 
      maxItems: 4, 
      maxQuantity: 4, 
      conveyorSpeed: 4, 
      orderTime: 10000,
      availableFoods: 8 
    }
  };

  // 주문 생성
  const generateOrder = useCallback((): Order => {
    const settings = difficultySettings[difficulty];
    const availableFoods = foodItems.slice(0, settings.availableFoods);
    const numItems = Math.floor(Math.random() * settings.maxItems) + 1;
    
    const orderItems: { food: FoodItem; quantity: number }[] = [];
    const usedFoods = new Set<string>();
    
    for (let i = 0; i < numItems; i++) {
      let food: FoodItem;
      do {
        food = availableFoods[Math.floor(Math.random() * availableFoods.length)];
      } while (usedFoods.has(food.id));
      
      usedFoods.add(food.id);
      const quantity = Math.floor(Math.random() * settings.maxQuantity) + 1;
      orderItems.push({ food, quantity });
    }
    
    // 주문 텍스트 생성
    const orderText = orderItems
      .map(item => `${item.food.name} ${item.quantity}개`)
      .join('랑 ') + ' 줘!';
    
    return {
      items: orderItems,
      text: orderText
    };
  }, [difficulty]);

  // 컨베이어 벨트 아이템 생성
  const generateConveyorItem = useCallback((): (FoodItem & { x: number; id: string }) => {
    const settings = difficultySettings[difficulty];
    const availableFoods = foodItems.slice(0, settings.availableFoods);
    const food = availableFoods[Math.floor(Math.random() * availableFoods.length)];
    
    return {
      ...food,
      x: -100, // 화면 왼쪽에서 시작
      id: `${food.id}-${Date.now()}-${Math.random()}`
    };
  }, [difficulty]);

  // 컨베이어 벨트 업데이트
  const updateConveyor = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const settings = difficultySettings[difficulty];
    
    setConveyorItems(prev => {
      // 기존 아이템들 이동
      const movedItems = prev
        .map(item => ({ ...item, x: item.x + settings.conveyorSpeed }))
        .filter(item => item.x < 800); // 화면을 벗어난 아이템 제거
      
      // 새 아이템 추가 (확률적으로)
      if (Math.random() < 0.02 && movedItems.length < 8) { // 2% 확률로 새 아이템 추가
        movedItems.push(generateConveyorItem());
      }
      
      return movedItems;
    });
  }, [gameState, difficulty, generateConveyorItem]);

  // 음식 아이템 클릭 (도시락에 추가)
  const handleFoodClick = useCallback((item: FoodItem & { x: number; id: string }) => {
    if (gameState !== 'playing' || !currentOrder) return;
    
    console.log('🍎 Food clicked:', item.name);
    
    // 원본 음식 ID 찾기 (컨베이어 아이템의 고유 ID에서 음식 타입 추출)
    const foodId = item.id.split('-')[0]; // 'apple-timestamp-random' -> 'apple'
    
    // 도시락에 추가
    setLunchbox(prev => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1
    }));
    
    // 컨베이어에서 제거
    setConveyorItems(prev => prev.filter(conveyorItem => conveyorItem.id !== item.id));
  }, [gameState, currentOrder]);

  // 주문 확인
  const checkOrder = useCallback(() => {
    if (!currentOrder) return;
    
    console.log('📋 Checking order...');
    console.log('Expected:', currentOrder.items);
    console.log('Lunchbox:', lunchbox);
    
    let isCorrect = true;
    
    // 주문한 아이템들이 정확한 수량으로 있는지 확인
    for (const orderItem of currentOrder.items) {
      const lunchboxQuantity = lunchbox[orderItem.food.id] || 0;
      if (lunchboxQuantity !== orderItem.quantity) {
        isCorrect = false;
        break;
      }
    }
    
    // 주문하지 않은 아이템이 있는지 확인
    const orderedFoodIds = new Set(currentOrder.items.map(item => item.food.id));
    for (const foodId in lunchbox) {
      if (lunchbox[foodId] > 0 && !orderedFoodIds.has(foodId)) {
        isCorrect = false;
        break;
      }
    }
    
    const completionTime = Date.now() - orderStartTime;
    completionTimes.current.push(completionTime);
    
    if (isCorrect) {
      console.log('✅ Order completed correctly!');
      
      const basePoints = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0) * 10;
      const timeBonus = Math.max(0, 5000 - completionTime) / 100; // 빠를수록 보너스
      const totalPoints = Math.round(basePoints + timeBonus);
      
      setGameStats(prev => {
        const newStats = {
          ...prev,
          score: prev.score + totalPoints,
          completedOrders: prev.completedOrders + 1,
          totalOrders: prev.totalOrders + 1
        };
        
        newStats.accuracy = newStats.totalOrders > 0 
          ? (newStats.completedOrders / newStats.totalOrders) * 100 
          : 0;
        
        newStats.avgCompletionTime = completionTimes.current.length > 0
          ? completionTimes.current.reduce((a, b) => a + b, 0) / completionTimes.current.length
          : 0;
        
        return newStats;
      });
    } else {
      console.log('❌ Order failed!');
      
      setGameStats(prev => {
        const newStats = {
          ...prev,
          failedOrders: prev.failedOrders + 1,
          totalOrders: prev.totalOrders + 1
        };
        
        newStats.accuracy = newStats.totalOrders > 0 
          ? (newStats.completedOrders / newStats.totalOrders) * 100 
          : 0;
        
        newStats.avgCompletionTime = completionTimes.current.length > 0
          ? completionTimes.current.reduce((a, b) => a + b, 0) / completionTimes.current.length
          : 0;
        
        return newStats;
      });
    }
    
    // 새 주문 생성
    setTimeout(() => {
      if (gameState === 'playing') {
        const newOrder = generateOrder();
        setCurrentOrder(newOrder);
        setLunchbox({});
        setOrderStartTime(Date.now());
        console.log('📝 New order:', newOrder.text);
      }
    }, 2000);
  }, [currentOrder, lunchbox, orderStartTime, gameState, generateOrder]);

  // 게임 시작
  const startGame = () => {
    console.log('🎮 Starting Monster Lunchbox game...');
    
    setGameState('playing');
    setTimeLeft(180);
    setGameStats({
      score: 0,
      completedOrders: 0,
      failedOrders: 0,
      totalOrders: 0,
      accuracy: 0,
      avgCompletionTime: 0
    });
    setLunchbox({});
    setConveyorItems([]);
    completionTimes.current = [];
    
    // 첫 번째 주문 생성
    const firstOrder = generateOrder();
    setCurrentOrder(firstOrder);
    setOrderStartTime(Date.now());
    console.log('📝 First order:', firstOrder.text);
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
    setCurrentOrder(null);
    setLunchbox({});
    setConveyorItems([]);
    setTimeLeft(180);
  };

  // 컨베이어 벨트 애니메이션
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(updateConveyor, 50); // 20 FPS
    return () => clearInterval(interval);
  }, [gameState, updateConveyor]);

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
        <h1 className="text-3xl font-bold mb-2">👹 까다로운 몬스터의 도시락</h1>
        <p className="text-gray-600">몬스터가 주문한 음식을 정확한 수량으로 도시락에 담아주세요!</p>
        <Badge className="mt-2" variant="outline">작업 기억 게임</Badge>
      </div>

      {/* Instructions */}
      {gameState === 'ready' && (
        <Card className="mb-6 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-purple-700">👹 몬스터 주문 듣기</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 몬스터가 "사과 2개랑 샌드위치 1개 줘!"라고 말합니다</li>
                  <li>• 주문을 잘 기억해두세요</li>
                  <li>• 정확한 음식과 수량을 기억하는 것이 중요해요</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700">🥪 도시락 만들기</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 컨베이어 벨트에서 음식이 지나갑니다</li>
                  <li>• 주문한 음식을 정확한 개수만큼 클릭하세요</li>
                  <li>• 주문하지 않은 음식은 클릭하지 마세요</li>
                  <li>• 완성되면 "주문 완료" 버튼을 누르세요</li>
                </ul>
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
                <div className="text-sm text-gray-600">완료한 주문</div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.completedOrders}
                </div>
              </div>
              <div className="text-2xl">📋</div>
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
              <div className="text-2xl">⏰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Order */}
      {currentOrder && gameState === 'playing' && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="text-2xl">👹</div>
              몬스터의 주문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 mb-4">
                "{currentOrder.text}"
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                    <span className="text-2xl">{item.food.icon}</span>
                    <span className="font-medium">{item.food.name}</span>
                    <Badge variant="outline">{item.quantity}개</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Conveyor Belt */}
            <div className="relative">
              <div className="text-lg font-semibold mb-2">🏭 컨베이어 벨트</div>
              <div 
                ref={conveyorRef}
                className="h-24 bg-gray-200 rounded-lg border-2 border-gray-300 relative overflow-hidden"
                style={{ background: 'repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 20px, #d1d5db 20px, #d1d5db 40px)' }}
              >
                {/* Conveyor Items */}
                {conveyorItems.map((item) => (
                  <div
                    key={item.id}
                    className="absolute top-2 cursor-pointer hover:scale-110 transition-transform"
                    style={{ left: item.x }}
                    onClick={() => handleFoodClick(item)}
                  >
                    <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center shadow-md">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                  </div>
                ))}
                
                {/* Conveyor Direction Arrow */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  →
                </div>
              </div>
            </div>

            {/* Lunchbox */}
            <div>
              <div className="text-lg font-semibold mb-2">🍱 도시락</div>
              <div className="min-h-32 bg-amber-50 rounded-lg border-2 border-amber-200 p-4">
                {Object.keys(lunchbox).length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    도시락이 비어있습니다. 컨베이어 벨트에서 음식을 클릭하세요!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(lunchbox).map(([foodId, quantity]) => {
                      const food = foodItems.find(f => f.id === foodId);
                      if (!food || quantity === 0) return null;
                      
                      return (
                        <div key={foodId} className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                          <span className="text-2xl">{food.icon}</span>
                          <span className="font-medium">{food.name}</span>
                          <Badge variant="secondary">{quantity}개</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Order Complete Button */}
              {currentOrder && gameState === 'playing' && (
                <div className="text-center mt-4">
                  <Button onClick={checkOrder} size="lg" className="gap-2">
                    <Trophy className="w-5 h-5" />
                    주문 완료!
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Game State Overlays */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">👹 몬스터 도시락 준비!</h2>
                <p className="mb-4">몬스터의 주문을 듣고 정확히 도시락을 만들어보세요</p>
                <Button onClick={startGame} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  게임 시작
                </Button>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">게임 일시정지</h2>
                <Button onClick={() => setGameState('playing')} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  계속하기
                </Button>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">도시락 완성! 🎉</h2>
                <div className="space-y-2 mb-6">
                  <p className="text-xl text-purple-600 font-bold">최종 점수: {gameStats.score}점</p>
                  <p>완료한 주문: {gameStats.completedOrders}개</p>
                  <p>정확도: {gameStats.accuracy.toFixed(1)}%</p>
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
            <option value="easy">쉬움 (2가지 음식)</option>
            <option value="medium">보통 (3가지 음식)</option>
            <option value="hard">어려움 (4가지 음식)</option>
          </select>
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
                <div className="text-sm text-gray-600">완료한 주문</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.failedOrders}</div>
                <div className="text-sm text-gray-600">실패한 주문</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(gameStats.avgCompletionTime / 1000)}초
                </div>
                <div className="text-sm text-gray-600">평균 완료 시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.totalOrders}</div>
                <div className="text-sm text-gray-600">총 주문 수</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}