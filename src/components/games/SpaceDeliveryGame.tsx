'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Target, Zap, Trophy, Rocket } from 'lucide-react';

interface Planet {
  id: string;
  name: string;
  color: string;
  icon: string;
  x: number;
  y: number;
  size: number;
}

interface GameStats {
  score: number;
  correctSequences: number;
  incorrectSequences: number;
  totalSequences: number;
  accuracy: number;
  avgReactionTime: number;
  currentStreak: number;
  bestStreak: number;
}

export default function SpaceDeliveryGame() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [sequence, setSequence] = useState<Planet[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Planet[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    correctSequences: 0,
    incorrectSequences: 0,
    totalSequences: 0,
    accuracy: 0,
    avgReactionTime: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [sequenceLength, setSequenceLength] = useState(3);

  const sequenceStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);

  // 행성 데이터
  const planetData = [
    { id: 'mars', name: '화성', color: '#CD5C5C', icon: '🔴' },
    { id: 'jupiter', name: '목성', color: '#DEB887', icon: '🟠' },
    { id: 'earth', name: '지구', color: '#4169E1', icon: '🔵' },
    { id: 'venus', name: '금성', color: '#FFD700', icon: '🟡' },
    { id: 'saturn', name: '토성', color: '#F4A460', icon: '🟤' },
    { id: 'neptune', name: '해왕성', color: '#4682B4', icon: '🔷' }
  ];

  // 난이도별 설정
  const difficultySettings = {
    easy: { sequenceLength: 3, showTime: 1000, maxPlanets: 4 },
    medium: { sequenceLength: 4, showTime: 800, maxPlanets: 5 },
    hard: { sequenceLength: 5, showTime: 600, maxPlanets: 6 }
  };

  // 행성 위치 생성
  const generatePlanetPositions = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const usedPlanets = planetData.slice(0, settings.maxPlanets);
    
    const positions: Planet[] = usedPlanets.map((planet, index) => {
      const angle = (index / settings.maxPlanets) * 2 * Math.PI;
      const radius = 150;
      const centerX = 200;
      const centerY = 200;
      
      return {
        ...planet,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size: 60
      };
    });

    setPlanets(positions);
  }, [difficulty]);

  // 시퀀스 생성
  const generateSequence = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const newSequence: Planet[] = [];
    
    for (let i = 0; i < settings.sequenceLength; i++) {
      const randomPlanet = planets[Math.floor(Math.random() * planets.length)];
      newSequence.push(randomPlanet);
    }
    
    console.log('🚀 Generated sequence:', newSequence.map(p => p.name));
    setSequence(newSequence);
    return newSequence;
  }, [planets, difficulty]);

  // 시퀀스 표시
  const showSequence = useCallback(async (seq: Planet[]) => {
    console.log('👀 Showing sequence...');
    setShowingSequence(true);
    setCurrentSequenceIndex(0);
    
    const settings = difficultySettings[difficulty];
    
    for (let i = 0; i < seq.length; i++) {
      setCurrentSequenceIndex(i);
      console.log(`🌟 Highlighting planet ${i + 1}/${seq.length}: ${seq[i].name}`);
      
      await new Promise(resolve => setTimeout(resolve, settings.showTime));
      setCurrentSequenceIndex(-1);
      await new Promise(resolve => setTimeout(resolve, 200)); // 간격
    }
    
    setShowingSequence(false);
    setCurrentSequenceIndex(-1);
    setPlayerSequence([]);
    sequenceStartTime.current = Date.now();
    console.log('✅ Sequence shown, waiting for player input...');
  }, [difficulty]);

  // 행성 클릭 처리
  const handlePlanetClick = useCallback((planet: Planet) => {
    if (gameState !== 'playing' || showingSequence) {
      console.log('❌ Invalid click state');
      return;
    }

    console.log('🌍 Planet clicked:', planet.name);
    
    const newPlayerSequence = [...playerSequence, planet];
    setPlayerSequence(newPlayerSequence);
    
    const currentIndex = newPlayerSequence.length - 1;
    const expectedPlanet = sequence[currentIndex];
    
    console.log(`🎯 Expected: ${expectedPlanet?.name}, Got: ${planet.name}`);
    
    if (planet.id !== expectedPlanet?.id) {
      // 틀린 경우
      console.log('❌ Wrong planet!');
      
      const reactionTime = Date.now() - sequenceStartTime.current;
      reactionTimes.current.push(reactionTime);
      
      setGameStats(prev => {
        const newStats = {
          ...prev,
          incorrectSequences: prev.incorrectSequences + 1,
          totalSequences: prev.totalSequences + 1,
          currentStreak: 0
        };
        
        newStats.accuracy = newStats.totalSequences > 0 
          ? (newStats.correctSequences / newStats.totalSequences) * 100 
          : 0;
        
        newStats.avgReactionTime = reactionTimes.current.length > 0
          ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
          : 0;

        return newStats;
      });
      
      // 새로운 시퀀스 시작
      setTimeout(() => {
        if (gameState === 'playing') {
          const newSeq = generateSequence();
          showSequence(newSeq);
        }
      }, 1500);
      
      return;
    }
    
    // 올바른 행성을 클릭한 경우
    if (newPlayerSequence.length === sequence.length) {
      // 시퀀스 완성!
      console.log('🎉 Sequence completed!');
      
      const reactionTime = Date.now() - sequenceStartTime.current;
      reactionTimes.current.push(reactionTime);
      
      const points = sequence.length * 10 + (gameStats.currentStreak * 5);
      
      setGameStats(prev => {
        const newStreak = prev.currentStreak + 1;
        const newStats = {
          ...prev,
          score: prev.score + points,
          correctSequences: prev.correctSequences + 1,
          totalSequences: prev.totalSequences + 1,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak)
        };
        
        newStats.accuracy = newStats.totalSequences > 0 
          ? (newStats.correctSequences / newStats.totalSequences) * 100 
          : 0;
        
        newStats.avgReactionTime = reactionTimes.current.length > 0
          ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
          : 0;

        return newStats;
      });
      
      // 난이도 증가 (최대 5개까지)
      if (gameStats.currentStreak > 0 && gameStats.currentStreak % 3 === 0) {
        setSequenceLength(prev => Math.min(prev + 1, 6));
      }
      
      // 새로운 시퀀스 시작
      setTimeout(() => {
        if (gameState === 'playing') {
          const newSeq = generateSequence();
          showSequence(newSeq);
        }
      }, 1000);
    }
  }, [gameState, showingSequence, playerSequence, sequence, gameStats.currentStreak, generateSequence, showSequence]);

  // 게임 시작
  const startGame = () => {
    console.log('🚀 Starting Space Delivery game...');
    
    setGameState('playing');
    setTimeLeft(180);
    setGameStats({
      score: 0,
      correctSequences: 0,
      incorrectSequences: 0,
      totalSequences: 0,
      accuracy: 0,
      avgReactionTime: 0,
      currentStreak: 0,
      bestStreak: 0
    });
    setSequenceLength(difficultySettings[difficulty].sequenceLength);
    reactionTimes.current = [];
    
    generatePlanetPositions();
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
    setSequence([]);
    setPlayerSequence([]);
    setShowingSequence(false);
    setTimeLeft(180);
  };

  // 행성 위치 초기화
  useEffect(() => {
    generatePlanetPositions();
  }, [generatePlanetPositions]);

  // 게임 시작 시 첫 시퀀스 생성
  useEffect(() => {
    if (gameState === 'playing' && planets.length > 0 && sequence.length === 0) {
      setTimeout(() => {
        const newSeq = generateSequence();
        showSequence(newSeq);
      }, 1000);
    }
  }, [gameState, planets.length, sequence.length, generateSequence, showSequence]);

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
        <h1 className="text-3xl font-bold mb-2">🚀 우주 택배 배달</h1>
        <p className="text-gray-600">행성 순서를 기억하고 올바른 순서로 택배를 배달하세요!</p>
        <Badge className="mt-2" variant="outline">작업 기억 게임</Badge>
      </div>

      {/* Instructions */}
      {gameState === 'ready' && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">📝 순서 기억하기</h4>
                <ul className="space-y-1 text-sm">
                  <li>• {difficultySettings[difficulty].sequenceLength}개의 행성이 순서대로 빛납니다</li>
                  <li>• 각 행성이 {difficultySettings[difficulty].showTime}ms 동안 표시됩니다</li>
                  <li>• 순서를 잘 기억해두세요!</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-700">🎯 택배 배달하기</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 기억한 순서대로 행성을 클릭하세요</li>
                  <li>• 순서가 맞으면 다음 배달로 넘어갑니다</li>
                  <li>• 틀리면 처음부터 다시 시작됩니다</li>
                  <li>• 연속 성공하면 보너스 점수를 받아요!</li>
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
                <div className="text-sm text-gray-600">연속 성공</div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.currentStreak}
                </div>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
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

      {/* Game Area */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="relative">
            {/* Space Background */}
            <div className="w-full h-96 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-lg relative overflow-hidden">
              {/* Stars */}
              <div className="absolute inset-0">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              {/* Planets */}
              {planets.map((planet, index) => {
                const isHighlighted = showingSequence && currentSequenceIndex === sequence.findIndex(p => p.id === planet.id);
                const isInPlayerSequence = playerSequence.some(p => p.id === planet.id);
                
                return (
                  <div
                    key={planet.id}
                    className={`absolute cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                      isHighlighted ? 'scale-125 animate-pulse' : ''
                    } ${isInPlayerSequence ? 'opacity-50' : ''}`}
                    style={{
                      left: planet.x - planet.size / 2,
                      top: planet.y - planet.size / 2,
                      width: planet.size,
                      height: planet.size
                    }}
                    onClick={() => handlePlanetClick(planet)}
                  >
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center text-2xl border-4 ${
                        isHighlighted ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/30'
                      }`}
                      style={{ backgroundColor: planet.color }}
                    >
                      {planet.icon}
                    </div>
                    <div className="text-white text-xs text-center mt-1 font-medium">
                      {planet.name}
                    </div>
                  </div>
                );
              })}

              {/* Game State Overlays */}
              {gameState === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">🚀 우주 택배 준비!</h2>
                    <p className="mb-4">행성 순서를 기억하고 정확히 배달하세요</p>
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
                    <h2 className="text-3xl font-bold mb-4">배달 완료! 🎉</h2>
                    <div className="space-y-2 mb-6">
                      <p className="text-xl text-yellow-400 font-bold">최종 점수: {gameStats.score}점</p>
                      <p>정확도: {gameStats.accuracy.toFixed(1)}%</p>
                      <p>최고 연속 성공: {gameStats.bestStreak}회</p>
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

              {/* Sequence Display */}
              {showingSequence && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm">배달 순서 확인 중...</div>
                      <div className="text-lg font-bold">
                        {currentSequenceIndex + 1} / {sequence.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Player Progress */}
              {!showingSequence && gameState === 'playing' && sequence.length > 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm">배달 진행</div>
                      <div className="text-lg font-bold">
                        {playerSequence.length} / {sequence.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <option value="easy">쉬움 (3개 행성)</option>
            <option value="medium">보통 (4개 행성)</option>
            <option value="hard">어려움 (5개 행성)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalSequences > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.correctSequences}</div>
                <div className="text-sm text-gray-600">성공한 배달</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.incorrectSequences}</div>
                <div className="text-sm text-gray-600">실패한 배달</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.bestStreak}</div>
                <div className="text-sm text-gray-600">최고 연속 성공</div>
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