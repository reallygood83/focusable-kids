'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Shuffle, Zap, Trophy } from 'lucide-react';

interface Shape {
  id: string;
  shape: 'square' | 'circle' | 'triangle';
  color: 'red' | 'blue' | 'green' | 'yellow';
  emoji: string;
  x: number;
  y: number;
  speed: number;
  isActive: boolean;
  isDragging?: boolean;
  dragOffsetX?: number;
  dragOffsetY?: number;
}

interface SortingRule {
  type: 'color' | 'shape';
  displayText: string;
}

interface GameStats {
  score: number;
  level: number;
  totalShapes: number;
  correctSorts: number;
  incorrectSorts: number;
  accuracy: number;
  avgReactionTime: number;
  ruleChanges: number;
  adaptationSpeed: number;
}

const SHAPE_DATA = {
  square: { red: '🟥', blue: '🟦', green: '🟩', yellow: '🟨' },
  circle: { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' },
  triangle: { red: '🔺', blue: '🔷', green: '🔻', yellow: '⚠️' }
};

const COLORS = ['red', 'blue', 'green', 'yellow'] as const;
const SHAPES = ['square', 'circle', 'triangle'] as const;

export default function FickleSorterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [currentRule, setCurrentRule] = useState<SortingRule>({ type: 'color', displayText: '색깔별로 분류!' });
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    totalShapes: 0,
    correctSorts: 0,
    incorrectSorts: 0,
    accuracy: 0,
    avgReactionTime: 0,
    ruleChanges: 0,
    adaptationSpeed: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showInstructions, setShowInstructions] = useState(true);
  const [ruleChangeCountdown, setRuleChangeCountdown] = useState(30);
  const [feedback, setFeedback] = useState<string>('');
  const [isRuleChanging, setIsRuleChanging] = useState(false);
  
  // 드래그 상태 관리
  const [draggedShape, setDraggedShape] = useState<Shape | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [leftBasketHover, setLeftBasketHover] = useState(false);
  const [rightBasketHover, setRightBasketHover] = useState(false);

  const ruleStartTime = useRef<number>(0);
  const shapeStartTime = useRef<number>(0);
  const reactionTimes = useRef<number[]>([]);
  const adaptationTimes = useRef<number[]>([]);

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      ruleChangeInterval: 40, 
      shapeSpawnRate: 3000, 
      shapeSpeed: 1,
      maxShapes: 3
    },
    medium: { 
      ruleChangeInterval: 30, 
      shapeSpawnRate: 2500, 
      shapeSpeed: 1.5,
      maxShapes: 4
    },
    hard: { 
      ruleChangeInterval: 20, 
      shapeSpawnRate: 2000, 
      shapeSpeed: 2,
      maxShapes: 5
    }
  };

  // 도형 생성
  const createShape = useCallback((): Shape => {
    const canvas = canvasRef.current;
    if (!canvas) return null as any;

    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const emoji = SHAPE_DATA[shape][color];
    const settings = difficultySettings[difficulty];

    return {
      id: Math.random().toString(36).substr(2, 9),
      shape,
      color,
      emoji,
      x: Math.random() * (canvas.width - 100) + 50,
      y: -50,
      speed: settings.shapeSpeed * (0.8 + Math.random() * 0.4),
      isActive: true
    };
  }, [difficulty]);

  // 도형 업데이트
  const updateShapes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setShapes(prev => 
      prev.filter(shape => {
        // 드래그 중인 도형은 위치 업데이트 하지 않음
        if (!draggedShape || shape.id !== draggedShape.id) {
          shape.y += shape.speed;
        }
        
        // 화면 밖으로 나가면 제거 (놓친 것으로 처리)
        // 단, 드래그 중인 도형은 제외
        if (shape.y > canvas.height + 50 && (!draggedShape || shape.id !== draggedShape.id)) {
          setGameStats(prevStats => ({
            ...prevStats,
            totalShapes: prevStats.totalShapes + 1,
            incorrectSorts: prevStats.incorrectSorts + 1
          }));
          return false;
        }
        
        return true;
      })
    );
  }, [draggedShape]);

  // 규칙 변경
  const changeRule = useCallback(() => {
    const newRuleType = currentRule.type === 'color' ? 'shape' : 'color';
    const newRule: SortingRule = {
      type: newRuleType,
      displayText: newRuleType === 'color' ? '색깔별로 분류!' : '모양별로 분류!'
    };

    setIsRuleChanging(true);
    setCurrentRule(newRule);
    
    const settings = difficultySettings[difficulty];
    setRuleChangeCountdown(settings.ruleChangeInterval);
    
    setGameStats(prev => ({ ...prev, ruleChanges: prev.ruleChanges + 1 }));
    setFeedback(`새 규칙: ${newRule.displayText}`);
    
    ruleStartTime.current = Date.now();
    
    setTimeout(() => {
      setIsRuleChanging(false);
      setFeedback('');
    }, 2000);
  }, [currentRule.type, difficulty]);

  // 도형 클릭/분류 처리
  const handleShapeSort = useCallback((shapeId: string, sortType: 'color' | 'shape') => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    const reactionTime = Date.now() - shapeStartTime.current;
    reactionTimes.current.push(reactionTime);

    const isCorrect = sortType === currentRule.type;
    let points = 0;

    if (isCorrect) {
      points = 10 + (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 0);
      
      // 규칙 변경 후 빠른 적응 보너스
      const timeSinceRuleChange = Date.now() - ruleStartTime.current;
      if (timeSinceRuleChange < 5000) { // 5초 내 적응
        points += 5;
        adaptationTimes.current.push(timeSinceRuleChange);
      }
      
      setFeedback(`정확해요! +${points}점`);
    } else {
      points = -3;
      setFeedback(`아쉬워요! 현재 규칙: ${currentRule.displayText}`);
    }

    // 도형 제거
    setShapes(prev => prev.filter(s => s.id !== shapeId));

    // 통계 업데이트
    setGameStats(prev => {
      const newStats = {
        ...prev,
        score: prev.score + points,
        totalShapes: prev.totalShapes + 1,
        correctSorts: isCorrect ? prev.correctSorts + 1 : prev.correctSorts,
        incorrectSorts: !isCorrect ? prev.incorrectSorts + 1 : prev.incorrectSorts,
        level: Math.floor((prev.correctSorts + (isCorrect ? 1 : 0)) / 10) + 1
      };
      
      newStats.accuracy = newStats.totalShapes > 0 
        ? (newStats.correctSorts / newStats.totalShapes) * 100 
        : 0;
      
      newStats.avgReactionTime = reactionTimes.current.length > 0
        ? reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        : 0;
      
      newStats.adaptationSpeed = adaptationTimes.current.length > 0
        ? adaptationTimes.current.reduce((a, b) => a + b, 0) / adaptationTimes.current.length
        : 0;

      return newStats;
    });

    setTimeout(() => setFeedback(''), 1000);
  }, [shapes, currentRule.type, difficulty]);

  // 좌표 변환 헬퍼 함수
  const getCanvasCoordinates = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    return {
      x: (clientX - rect.left) * scaleX / (window.devicePixelRatio || 1),
      y: (clientY - rect.top) * scaleY / (window.devicePixelRatio || 1)
    };
  }, []);

  // 바구니 영역 체크 함수
  const getBasketArea = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const bottomAreaHeight = 120;
    const bottomY = canvas.height - bottomAreaHeight;
    
    if (y > bottomY && y < canvas.height - 10) {
      if (x > 10 && x < canvas.width / 2 - 15) {
        return 'left'; // 색깔 분류 바구니
      } else if (x > canvas.width / 2 + 5 && x < canvas.width - 15) {
        return 'right'; // 모양 분류 바구니
      }
    }
    return null;
  }, []);

  // 마우스 다운 (드래그 시작)
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;

    const { x, y } = getCanvasCoordinates(event);
    
    // 도형 찾기
    const clickedShape = shapes.find(shape => {
      const distance = Math.sqrt(
        Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
      );
      return distance <= 30 && !shape.isDragging;
    });

    if (clickedShape) {
      setDraggedShape({
        ...clickedShape,
        isDragging: true,
        dragOffsetX: x - clickedShape.x,
        dragOffsetY: y - clickedShape.y
      });
      setMousePos({ x, y });
    }
  }, [isPlaying, shapes, getCanvasCoordinates]);

  // 마우스 이동 (드래그 중)
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event);
    setMousePos({ x, y });

    if (draggedShape) {
      // 바구니 hover 체크
      const basketArea = getBasketArea(x, y);
      setLeftBasketHover(basketArea === 'left');
      setRightBasketHover(basketArea === 'right');
    }
  }, [draggedShape, getCanvasCoordinates, getBasketArea]);

  // 마우스 업 (드래그 끝)
  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedShape) return;

    const { x, y } = getCanvasCoordinates(event);
    const basketArea = getBasketArea(x, y);

    if (basketArea) {
      // 바구니에 드롭됨
      const sortType = basketArea === 'left' ? 'color' : 'shape';
      handleShapeSort(draggedShape.id, sortType);
    } else {
      // 바구니 밖에 드롭됨 - 도형을 원래 위치로 복원
      setShapes(prev => prev.map(shape => 
        shape.id === draggedShape.id 
          ? { ...shape, isDragging: false }
          : shape
      ));
    }

    setDraggedShape(null);
    setLeftBasketHover(false);
    setRightBasketHover(false);
  }, [draggedShape, getCanvasCoordinates, getBasketArea, handleShapeSort]);

  // 터치 이벤트 처리
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    handleMouseDown(event as any);
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    handleMouseMove(event as any);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    handleMouseUp(event as any);
  }, [handleMouseUp]);

  // roundRect polyfill for older browsers
  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  };

  // 캔버스 렌더링
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 배경 그리기
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f0f8ff');
    gradient.addColorStop(1, '#e6f3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 바구니 영역 그리기
    const bottomAreaHeight = 120;
    const bottomY = canvas.height - bottomAreaHeight;
    
    // 왼쪽 바구니 (색깔 분류)
    const leftBasketActive = currentRule.type === 'color' || leftBasketHover;
    ctx.fillStyle = leftBasketActive ? (leftBasketHover ? '#c8e6c9' : '#e8f5e8') : '#f5f5f5';
    ctx.strokeStyle = leftBasketActive ? (leftBasketHover ? '#2e7d32' : '#4caf50') : '#999999';
    ctx.lineWidth = leftBasketHover ? 4 : 3;
    
    // 바구니 모양 그리기
    const leftBasketX = 10;
    const leftBasketY = bottomY;
    const leftBasketWidth = canvas.width / 2 - 15;
    const leftBasketHeight = bottomAreaHeight - 10;
    
    // 바구니 테두리 - 곡선으로 바구니 느낌
    drawRoundRect(ctx, leftBasketX, leftBasketY, leftBasketWidth, leftBasketHeight, 15);
    ctx.fill();
    ctx.stroke();
    
    // 바구니 아이콘
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🧺 색깔별 분류', canvas.width / 4, bottomY + 25);
    
    // 색깔 예시
    const colorExamples = ['🟥', '🟦', '🟩', '🟡'];
    colorExamples.forEach((emoji, index) => {
      ctx.font = '24px serif';
      ctx.fillText(emoji, 40 + index * 40, bottomY + 60);
    });

    // 오른쪽 바구니 (모양 분류)
    const rightBasketActive = currentRule.type === 'shape' || rightBasketHover;
    ctx.fillStyle = rightBasketActive ? (rightBasketHover ? '#c8e6c9' : '#e8f5e8') : '#f5f5f5';
    ctx.strokeStyle = rightBasketActive ? (rightBasketHover ? '#2e7d32' : '#4caf50') : '#999999';
    ctx.lineWidth = rightBasketHover ? 4 : 3;
    
    const rightBasketX = canvas.width / 2 + 5;
    const rightBasketY = bottomY;
    const rightBasketWidth = canvas.width / 2 - 15;
    const rightBasketHeight = bottomAreaHeight - 10;
    
    drawRoundRect(ctx, rightBasketX, rightBasketY, rightBasketWidth, rightBasketHeight, 15);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🧺 모양별 분류', canvas.width * 3 / 4, bottomY + 25);
    
    // 모양 예시
    const shapeExamples = ['🟥', '🔴', '🔺'];
    shapeExamples.forEach((emoji, index) => {
      ctx.font = '24px serif';
      ctx.fillText(emoji, canvas.width / 2 + 40 + index * 40, bottomY + 60);
    });

    // 일반 도형들 그리기 (드래그 중이 아닌 것들)
    shapes.forEach(shape => {
      if (!draggedShape || shape.id !== draggedShape.id) {
        // 드래그 중이 아닌 도형 그리기
        ctx.font = '48px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 그림자 효과
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(shape.emoji, shape.x, shape.y);
        
        // 그림자 초기화
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // 드래그 중인 도형 그리기 (마우스 위치에)
    if (draggedShape) {
      const dragX = mousePos.x - (draggedShape.dragOffsetX || 0);
      const dragY = mousePos.y - (draggedShape.dragOffsetY || 0);
      
      ctx.font = '52px serif'; // 조금 더 크게
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 드래그 중일 때 더 진한 그림자
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // 반투명 효과
      ctx.globalAlpha = 0.8;
      ctx.fillText(draggedShape.emoji, dragX, dragY);
      ctx.globalAlpha = 1;
      
      // 그림자 초기화
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 드래그 가이드 선
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(draggedShape.x, draggedShape.y);
      ctx.lineTo(dragX, dragY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 현재 규칙 표시
    ctx.fillStyle = isRuleChanging ? '#ff6b6b' : '#4ecdc4';
    ctx.strokeStyle = isRuleChanging ? '#ff5252' : '#26a69a';
    ctx.lineWidth = 3;
    drawRoundRect(ctx, canvas.width / 2 - 150, 20, 300, 60, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentRule.displayText, canvas.width / 2, 55);
    
    // 규칙 변경 카운트다운
    ctx.fillStyle = ruleChangeCountdown <= 5 ? '#ff4444' : '#666666';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`다음 변경: ${ruleChangeCountdown}초`, canvas.width / 2, 100);

    // 드래그 안내 텍스트 (게임 시작 시)
    if (isPlaying && gameStats.totalShapes === 0 && !draggedShape) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('도형을 드래그해서 바구니에 넣어보세요!', canvas.width / 2, canvas.height / 2);
    }
  }, [shapes, currentRule, isRuleChanging, ruleChangeCountdown, draggedShape, mousePos, leftBasketHover, rightBasketHover, isPlaying, gameStats.totalShapes]);

  // 게임 초기화
  const initGame = useCallback(() => {
    setGameStats({
      score: 0,
      level: 1,
      totalShapes: 0,
      correctSorts: 0,
      incorrectSorts: 0,
      accuracy: 0,
      avgReactionTime: 0,
      ruleChanges: 0,
      adaptationSpeed: 0
    });
    setShapes([]);
    setCurrentRule({ type: 'color', displayText: '색깔별로 분류!' });
    setRuleChangeCountdown(30);
    setFeedback('');
    setIsRuleChanging(false);
    setTimeLeft(180);
    
    // 드래그 상태 초기화
    setDraggedShape(null);
    setLeftBasketHover(false);
    setRightBasketHover(false);
    setMousePos({ x: 0, y: 0 });
    
    reactionTimes.current = [];
    adaptationTimes.current = [];
    ruleStartTime.current = Date.now();
  }, []);

  // 게임 시작
  const startGame = () => {
    initGame();
    setIsPlaying(true);
    setShowInstructions(false);
    shapeStartTime.current = Date.now();
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
    
    // 도형 생성
    const spawnInterval = setInterval(() => {
      setShapes(currentShapes => {
        if (currentShapes.length < settings.maxShapes) {
          const newShape = createShape();
          if (newShape) {
            shapeStartTime.current = Date.now();
            return [...currentShapes, newShape];
          }
        }
        return currentShapes;
      });
    }, settings.shapeSpawnRate);

    // 게임 업데이트
    const gameLoop = setInterval(() => {
      updateShapes();
      render();
    }, 1000 / 30); // 30 FPS

    // 규칙 변경 타이머
    const ruleTimer = setInterval(() => {
      setRuleChangeCountdown(prev => {
        if (prev <= 1) {
          changeRule();
          return settings.ruleChangeInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(gameLoop);
      clearInterval(ruleTimer);
    };
  }, [isPlaying, difficulty, createShape, updateShapes, render, changeRule]);

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
        const aspectRatio = 800 / 500; // 원하는 가로:세로 비율
        
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
        <h1 className="text-3xl font-bold mb-2">🔄 변덕쟁이 분류기</h1>
        <p className="text-gray-600">바뀌는 규칙에 빠르게 적응하여 도형을 분류하세요!</p>
        <Badge className="mt-2" variant="outline">인지적 유연성 게임</Badge>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">분류 규칙</h4>
                <ul className="space-y-1 text-sm">
                  <li>🎨 "색깔별로 분류!" → 같은 색끼리 모으기</li>
                  <li>🔷 "모양별로 분류!" → 같은 모양끼리 모으기</li>
                  <li>⏰ 30초마다 규칙이 바뀝니다</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">조작 방법</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 떨어지는 도형을 드래그하세요</li>
                  <li>• 🧺 왼쪽 바구니: 색깔별 분류</li>
                  <li>• 🧺 오른쪽 바구니: 모양별 분류</li>
                  <li>• 현재 규칙에 맞는 바구니에 드롭!</li>
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
              <Shuffle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">규칙 변경</div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.ruleChanges}</div>
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border-2 border-gray-200 rounded-lg cursor-pointer touch-none"
            style={{ cursor: draggedShape ? 'grabbing' : 'grab' }}
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
            <option value="easy">쉬움 (40초)</option>
            <option value="medium">보통 (30초)</option>
            <option value="hard">어려움 (20초)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalShapes > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.correctSorts}</div>
                <div className="text-sm text-gray-600">정확한 분류</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.incorrectSorts}</div>
                <div className="text-sm text-gray-600">잘못된 분류</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(gameStats.avgReactionTime)}ms
                </div>
                <div className="text-sm text-gray-600">평균 반응시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(gameStats.adaptationSpeed)}ms
                </div>
                <div className="text-sm text-gray-600">평균 적응시간</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}