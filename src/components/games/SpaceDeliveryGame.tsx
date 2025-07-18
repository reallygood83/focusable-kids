'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Rocket, Star, Trophy } from 'lucide-react';

interface Planet {
  id: string;
  name: string;
  color: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  isVisible: boolean;
  orderNumber?: number;
}

interface GameRound {
  sequence: Planet[];
  playerSequence: string[];
  currentStep: number;
  isComplete: boolean;
  isCorrect: boolean;
  startTime: number;
  endTime?: number;
}

interface GameStats {
  score: number;
  level: number;
  totalRounds: number;
  correctRounds: number;
  incorrectRounds: number;
  accuracy: number;
  avgCompletionTime: number;
  maxSequenceLength: number;
  perfectRounds: number;
}

const PLANETS = [
  { id: 'mars', name: '화성', color: '#CD5C5C', emoji: '🔴' },
  { id: 'jupiter', name: '목성', color: '#DEB887', emoji: '🟠' },
  { id: 'earth', name: '지구', color: '#4169E1', emoji: '🔵' },
  { id: 'venus', name: '금성', color: '#FFD700', emoji: '🟡' },
  { id: 'saturn', name: '토성', color: '#F4A460', emoji: '🟤' },
  { id: 'neptune', name: '해왕성', color: '#4682B4', emoji: '💙' },
  { id: 'mercury', name: '수성', color: '#A0522D', emoji: '⚫' },
  { id: 'uranus', name: '천왕성', color: '#40E0D0', emoji: '💚' }
];

export default function SpaceDeliveryGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    totalRounds: 0,
    correctRounds: 0,
    incorrectRounds: 0,
    accuracy: 0,
    avgCompletionTime: 0,
    maxSequenceLength: 0,
    perfectRounds: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showInstructions, setShowInstructions] = useState(true);
  const [gamePhase, setGamePhase] = useState<'showing' | 'memorizing' | 'input' | 'feedback'>('showing');
  const [planetsOnCanvas, setPlanetsOnCanvas] = useState<Planet[]>([]);
  const [feedback, setFeedback] = useState<string>('');

  const completionTimes = useRef<number[]>([]);

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      startLength: 3, 
      maxLength: 5, 
      showTime: 2000, 
      memoryTime: 3000 
    },
    medium: { 
      startLength: 4, 
      maxLength: 6, 
      showTime: 1500, 
      memoryTime: 2500 
    },
    hard: { 
      startLength: 5, 
      maxLength: 7, 
      showTime: 1000, 
      memoryTime: 2000 
    }
  };

  // 행성 위치 생성
  const generatePlanetPositions = useCallback((count: number): Planet[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const planets: Planet[] = [];
    const margin = 80;
    const minDistance = 120;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      do {
        x = margin + Math.random() * (canvas.width - margin * 2);
        y = margin + Math.random() * (canvas.height - margin * 2);
        
        validPosition = planets.every(planet => {
          const distance = Math.sqrt(Math.pow(x - planet.x, 2) + Math.pow(y - planet.y, 2));
          return distance >= minDistance;
        });
        
        attempts++;
      } while (!validPosition && attempts < 50);

      const planetData = PLANETS[i % PLANETS.length];
      planets.push({
        ...planetData,
        x: x || margin + i * 100,
        y: y || margin + Math.floor(i / 5) * 100,
        size: 40,
        isVisible: true,
        orderNumber: i + 1
      });
    }

    return planets;
  }, []);

  // 새 라운드 시작
  const startNewRound = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const sequenceLength = Math.min(
      settings.startLength + Math.floor(gameStats.level / 2),
      settings.maxLength
    );

    const availablePlanets = generatePlanetPositions(Math.min(sequenceLength + 2, PLANETS.length));
    const sequence = [];
    
    // 시퀀스 생성 (중복 없이)
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < sequenceLength) {
      selectedIndices.add(Math.floor(Math.random() * availablePlanets.length));
    }
    
    Array.from(selectedIndices).forEach(index => {
      sequence.push(availablePlanets[index]);
    });

    const round: GameRound = {
      sequence,
      playerSequence: [],
      currentStep: 0,
      isComplete: false,
      isCorrect: false,
      startTime: Date.now()
    };

    setCurrentRound(round);
    setPlanetsOnCanvas(availablePlanets);
    setGamePhase('showing');
    setFeedback('');

    // 시퀀스 표시 단계
    setTimeout(() => {
      setGamePhase('memorizing');
      setTimeout(() => {
        setGamePhase('input');
      }, settings.memoryTime);
    }, settings.showTime);
  }, [difficulty, gameStats.level, generatePlanetPositions]);

  // 행성 클릭 처리
  const handlePlanetClick = useCallback((planetId: string) => {
    if (!currentRound || gamePhase !== 'input' || currentRound.isComplete) return;

    const newPlayerSequence = [...currentRound.playerSequence, planetId];
    const expectedPlanet = currentRound.sequence[currentRound.currentStep];
    
    const isCorrectStep = expectedPlanet.id === planetId;
    
    if (isCorrectStep) {
      // 올바른 행성 선택
      const newCurrentStep = currentRound.currentStep + 1;
      const isRoundComplete = newCurrentStep >= currentRound.sequence.length;
      
      const updatedRound: GameRound = {
        ...currentRound,
        playerSequence: newPlayerSequence,
        currentStep: newCurrentStep,
        isComplete: isRoundComplete,
        isCorrect: isRoundComplete,
        endTime: isRoundComplete ? Date.now() : undefined
      };
      
      setCurrentRound(updatedRound);
      
      if (isRoundComplete) {
        // 라운드 완료
        const completionTime = Date.now() - currentRound.startTime;
        completionTimes.current.push(completionTime);
        
        const points = currentRound.sequence.length * 10 + (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 0);
        
        setGameStats(prev => {
          const newStats = {
            ...prev,
            score: prev.score + points,
            totalRounds: prev.totalRounds + 1,
            correctRounds: prev.correctRounds + 1,
            level: Math.floor((prev.correctRounds + 1) / 3) + 1,
            maxSequenceLength: Math.max(prev.maxSequenceLength, currentRound.sequence.length),
            perfectRounds: prev.perfectRounds + 1
          };
          
          newStats.accuracy = (newStats.correctRounds / newStats.totalRounds) * 100;
          newStats.avgCompletionTime = completionTimes.current.reduce((a, b) => a + b, 0) / completionTimes.current.length;
          
          return newStats;
        });
        
        setFeedback(`훌륭해요! ${currentRound.sequence.length}개 순서를 완벽하게 기억했네요! +${points}점`);
        setGamePhase('feedback');
        
        // 다음 라운드 준비
        setTimeout(() => {
          startNewRound();
        }, 2500);
      } else {
        setFeedback(`좋아요! ${newCurrentStep}/${currentRound.sequence.length}`);
      }
    } else {
      // 틀린 행성 선택
      const updatedRound: GameRound = {
        ...currentRound,
        playerSequence: newPlayerSequence,
        isComplete: true,
        isCorrect: false,
        endTime: Date.now()
      };
      
      setCurrentRound(updatedRound);
      
      setGameStats(prev => {
        const newStats = {
          ...prev,
          totalRounds: prev.totalRounds + 1,
          incorrectRounds: prev.incorrectRounds + 1
        };
        
        newStats.accuracy = prev.totalRounds > 0 ? (prev.correctRounds / newStats.totalRounds) * 100 : 0;
        
        return newStats;
      });
      
      setFeedback(`아쉬워요! 정답은 ${expectedPlanet.name}이었어요. 다시 도전해보세요!`);
      setGamePhase('feedback');
      
      // 다음 라운드 준비
      setTimeout(() => {
        startNewRound();
      }, 3000);
    }
  }, [currentRound, gamePhase, difficulty, startNewRound]);

  // 캔버스 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 배경 그리기 (우주)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0B1426');
    gradient.addColorStop(0.5, '#1B2951');
    gradient.addColorStop(1, '#0B1426');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 그리기
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 73) % canvas.width;
      const y = (i * 41) % canvas.height;
      const size = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 행성 그리기
    planetsOnCanvas.forEach((planet, index) => {
      if (!planet.isVisible) return;

      // 행성 본체
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();

      // 이모지
      ctx.font = `${planet.size * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planet.emoji, planet.x, planet.y);

      // 시퀀스 표시 (showing 단계에서만)
      if (gamePhase === 'showing' && currentRound) {
        const sequenceIndex = currentRound.sequence.findIndex(p => p.id === planet.id);
        if (sequenceIndex !== -1) {
          // 순서 번호 표시
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(planet.x + planet.size * 0.7, planet.y - planet.size * 0.7, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(
            (sequenceIndex + 1).toString(), 
            planet.x + planet.size * 0.7, 
            planet.y - planet.size * 0.7
          );
          
          // 화살표 애니메이션
          const time = Date.now() / 1000;
          const arrowOffset = Math.sin(time * 3) * 10;
          ctx.fillStyle = '#FFD700';
          ctx.font = '20px Arial';
          ctx.fillText('→', planet.x - planet.size - 30 + arrowOffset, planet.y);
        }
      }

      // 입력 단계에서 선택된 행성 표시
      if (gamePhase === 'input' && currentRound) {
        const isCompleted = currentRound.playerSequence.includes(planet.id);
        const isNext = currentRound.sequence[currentRound.currentStep]?.id === planet.id;
        
        if (isCompleted) {
          // 이미 선택된 행성 - 녹색 테두리
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.size + 5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isNext) {
          // 다음에 선택해야 할 행성 - 반짝이는 효과
          const glow = Math.sin(Date.now() / 200) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(255, 215, 0, ${glow})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.size + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 행성 이름
      if (gamePhase !== 'memorizing') {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(planet.name, planet.x, planet.y + planet.size + 20);
        ctx.fillText(planet.name, planet.x, planet.y + planet.size + 20);
      }
    });

    // 우주선 그리기 (진행률에 따라 이동)
    if (currentRound && gamePhase === 'input') {
      const progress = currentRound.currentStep / currentRound.sequence.length;
      const rocketX = 50 + (canvas.width - 100) * progress;
      const rocketY = canvas.height - 50;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '30px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚀', rocketX, rocketY);
      
      // 진행률 표시
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${currentRound.currentStep}/${currentRound.sequence.length}`, rocketX, rocketY + 30);
    }
  }, [planetsOnCanvas, gamePhase, currentRound]);

  // 캔버스 클릭 처리
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gamePhase !== 'input') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 클릭된 행성 찾기
    const clickedPlanet = planetsOnCanvas.find(planet => {
      const distance = Math.sqrt(
        Math.pow(clickX - planet.x, 2) + Math.pow(clickY - planet.y, 2)
      );
      return distance <= planet.size;
    });

    if (clickedPlanet) {
      handlePlanetClick(clickedPlanet.id);
    }
  }, [gamePhase, planetsOnCanvas, handlePlanetClick]);

  // 게임 초기화
  const initGame = useCallback(() => {
    setGameStats({
      score: 0,
      level: 1,
      totalRounds: 0,
      correctRounds: 0,
      incorrectRounds: 0,
      accuracy: 0,
      avgCompletionTime: 0,
      maxSequenceLength: 0,
      perfectRounds: 0
    });
    setCurrentRound(null);
    setPlanetsOnCanvas([]);
    setGamePhase('showing');
    setFeedback('');
    setTimeLeft(180);
    completionTimes.current = [];
  }, []);

  // 게임 시작
  const startGame = () => {
    initGame();
    setIsPlaying(true);
    setShowInstructions(false);
    setTimeout(() => startNewRound(), 1000);
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

  // 렌더링 루프
  useEffect(() => {
    const renderLoop = setInterval(render, 1000 / 30); // 30 FPS
    return () => clearInterval(renderLoop);
  }, [render]);

  // 타이머
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
        const aspectRatio = 800 / 600; // 원하는 가로:세로 비율
        
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

  const getPhaseDescription = () => {
    switch (gamePhase) {
      case 'showing':
        return '배달 순서를 확인하세요!';
      case 'memorizing':
        return '순서를 기억하세요...';
      case 'input':
        return '기억한 순서대로 행성을 클릭하세요!';
      case 'feedback':
        return feedback;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🚀 우주 택배 배달</h1>
        <p className="text-gray-600">행성 순서를 기억하고 정확히 배달하세요!</p>
        <Badge className="mt-2" variant="outline">작업 기억 게임</Badge>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">👀</div>
                <h4 className="font-semibold mb-1">1. 순서 확인</h4>
                <p className="text-sm">화면에 표시되는 행성의 배달 순서를 주의 깊게 관찰하세요</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-semibold mb-1">2. 기억하기</h4>
                <p className="text-sm">행성들이 사라진 후 머릿속으로 순서를 되새겨보세요</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold mb-1">3. 배달하기</h4>
                <p className="text-sm">기억한 순서대로 행성을 클릭하여 택배를 배달하세요</p>
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
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">정확도</div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameStats.accuracy.toFixed(1)}%
                </div>
              </div>
              <Rocket className="w-8 h-8 text-purple-500" />
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
              <Star className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Indicator */}
      {isPlaying && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-700">
                {getPhaseDescription()}
              </div>
              {currentRound && (
                <div className="mt-2 text-sm text-gray-600">
                  레벨 {gameStats.level} • 순서 길이: {currentRound.sequence.length}개
                </div>
              )}
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
            className="border-2 border-gray-200 rounded-lg cursor-pointer"
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
            <option value="easy">쉬움 (3-5개)</option>
            <option value="medium">보통 (4-6개)</option>
            <option value="hard">어려움 (5-7개)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalRounds > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.correctRounds}</div>
                <div className="text-sm text-gray-600">성공한 라운드</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameStats.maxSequenceLength}</div>
                <div className="text-sm text-gray-600">최대 순서 길이</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.perfectRounds}</div>
                <div className="text-sm text-gray-600">완벽한 라운드</div>
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