'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Shuffle, Zap, Trophy, RefreshCw } from 'lucide-react';

interface UnoCard {
  id: string;
  type: 'number' | 'special';
  color: 'red' | 'blue' | 'green' | 'yellow' | 'any';
  value: string | number;
  playable: boolean;
}

interface GameStats {
  score: number;
  level: number;
  totalCards: number;
  correctPlays: number;
  incorrectPlays: number;
  accuracy: number;
  avgDecisionTime: number;
  specialCardsPlayed: number;
  adaptationScore: number;
}

const CARD_COLORS = ['red', 'blue', 'green', 'yellow'] as const;
const SPECIAL_CARDS = [
  { value: 'reverse', emoji: '🔄', effect: 'Reverse direction' },
  { value: 'wild', emoji: '🌈', effect: 'Change color' },
  { value: 'skip', emoji: '⏭️', effect: 'Skip next player' },
  { value: 'draw2', emoji: '➕2️⃣', effect: 'Draw 2 cards' }
];

export default function UnpredictableUnoGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [centerCard, setCenterCard] = useState<UnoCard | null>(null);
  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    totalCards: 0,
    correctPlays: 0,
    incorrectPlays: 0,
    accuracy: 0,
    avgDecisionTime: 0,
    specialCardsPlayed: 0,
    adaptationScore: 0
  });
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentRule, setCurrentRule] = useState<string>('색깔 또는 숫자가 같은 카드를 내세요');
  const [feedback, setFeedback] = useState<string>('');
  const [isReversed, setIsReversed] = useState(false);
  const [wildColor, setWildColor] = useState<string | null>(null);

  const cardStartTime = useRef<number>(0);
  const decisionTimes = useRef<number[]>([]);

  // 난이도별 설정
  const difficultySettings = {
    easy: { 
      handSize: 5, 
      specialCardRatio: 0.3,
      ruleChangeFrequency: 15
    },
    medium: { 
      handSize: 6, 
      specialCardRatio: 0.4,
      ruleChangeFrequency: 12
    },
    hard: { 
      handSize: 7, 
      specialCardRatio: 0.5,
      ruleChangeFrequency: 10
    }
  };

  // 카드 생성
  const createCard = useCallback((): UnoCard => {
    const settings = difficultySettings[difficulty];
    const isSpecial = Math.random() < settings.specialCardRatio;
    
    if (isSpecial) {
      const special = SPECIAL_CARDS[Math.floor(Math.random() * SPECIAL_CARDS.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'special',
        color: special.value === 'wild' ? 'any' : CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
        value: special.value,
        playable: false
      };
    } else {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'number',
        color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
        value: Math.floor(Math.random() * 10),
        playable: false
      };
    }
  }, [difficulty]);

  // 카드 색상 이모지 반환
  const getColorEmoji = useCallback((color: string) => {
    switch (color) {
      case 'red': return '🔴';
      case 'blue': return '🔵';
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'any': return '🌈';
      default: return '⚫';
    }
  }, []);

  // 카드 플레이 가능 여부 확인
  const isCardPlayable = useCallback((card: UnoCard, center: UnoCard): boolean => {
    if (!center) return true;
    
    // Wild 카드는 항상 플레이 가능
    if (card.type === 'special' && card.value === 'wild') return true;
    
    // 중앙 카드가 Wild인 경우 wildColor와 비교
    const centerColor = wildColor || center.color;
    
    // 색상이 같거나 숫자/특수카드 값이 같으면 플레이 가능
    return card.color === centerColor || 
           (card.type === center.type && card.value === center.value);
  }, [wildColor]);

  // 플레이어 핸드 업데이트
  const updateHandPlayability = useCallback(() => {
    if (!centerCard) return;
    
    setPlayerHand(prev => 
      prev.map(card => ({
        ...card,
        playable: isCardPlayable(card, centerCard)
      }))
    );
  }, [centerCard, isCardPlayable]);

  // 카드 플레이 처리
  const playCard = useCallback((cardId: string) => {
    const card = playerHand.find(c => c.id === cardId);
    if (!card || !card.playable) {
      setFeedback('이 카드는 낼 수 없어요!');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }

    const decisionTime = Date.now() - cardStartTime.current;
    decisionTimes.current.push(decisionTime);

    let points = 10;
    let newRule = currentRule;
    
    // 특수 카드 효과 적용
    if (card.type === 'special') {
      switch (card.value) {
        case 'reverse':
          setIsReversed(prev => !prev);
          newRule = isReversed ? '순서가 다시 바뀌었어요!' : '순서가 바뀌었어요!';
          points += 5;
          break;
          
        case 'wild':
          const newColor = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
          setWildColor(newColor);
          newRule = `색깔이 ${getColorEmoji(newColor)}${newColor}로 바뀌었어요!`;
          points += 8;
          break;
          
        case 'skip':
          newRule = '다음 플레이어를 건너뛰었어요!';
          points += 3;
          break;
          
        case 'draw2':
          newRule = '다음 플레이어가 카드 2장을 가져가요!';
          points += 6;
          break;
      }
      
      setGameStats(prev => ({ 
        ...prev, 
        specialCardsPlayed: prev.specialCardsPlayed + 1 
      }));
    } else {
      // Wild 색상 효과 해제
      if (wildColor) {
        setWildColor(null);
        newRule = '색깔 또는 숫자가 같은 카드를 내세요';
      }
    }

    // 중앙 카드 교체
    setCenterCard(card);
    setCurrentRule(newRule);
    
    // 플레이어 핸드에서 제거하고 새 카드 추가
    setPlayerHand(prev => {
      const newHand = prev.filter(c => c.id !== cardId);
      const newCard = createCard();
      return [...newHand, newCard];
    });

    // 통계 업데이트
    setGameStats(prev => {
      const newStats = {
        ...prev,
        score: prev.score + points,
        totalCards: prev.totalCards + 1,
        correctPlays: prev.correctPlays + 1,
        level: Math.floor((prev.correctPlays + 1) / 10) + 1
      };
      
      newStats.accuracy = (newStats.correctPlays / newStats.totalCards) * 100;
      newStats.avgDecisionTime = decisionTimes.current.reduce((a, b) => a + b, 0) / decisionTimes.current.length;
      
      // 적응 점수 계산 (빠른 결정 + 특수 카드 활용)
      const fastDecision = decisionTime < 2000 ? 10 : 0;
      const specialBonus = card.type === 'special' ? 15 : 0;
      newStats.adaptationScore = prev.adaptationScore + fastDecision + specialBonus;
      
      return newStats;
    });

    setFeedback(`좋아요! ${card.type === 'special' ? '특수 카드' : '숫자 카드'} +${points}점`);
    setTimeout(() => setFeedback(''), 1500);
    
    cardStartTime.current = Date.now();
  }, [playerHand, currentRule, isReversed, wildColor, createCard, getColorEmoji]);

  // 카드 패스 (낼 수 있는 카드가 없을 때)
  const passCard = useCallback(() => {
    const playableCards = playerHand.filter(card => card.playable);
    
    if (playableCards.length > 0) {
      setFeedback('낼 수 있는 카드가 있어요!');
      setTimeout(() => setFeedback(''), 1500);
      return;
    }

    // 새 카드 받기
    const newCard = createCard();
    setPlayerHand(prev => [...prev, newCard]);
    
    setGameStats(prev => ({
      ...prev,
      totalCards: prev.totalCards + 1
    }));
    
    setFeedback('새 카드를 받았어요!');
    setTimeout(() => setFeedback(''), 1500);
    
    cardStartTime.current = Date.now();
  }, [playerHand, createCard]);

  // 게임 초기화
  const initGame = useCallback(() => {
    setGameStats({
      score: 0,
      level: 1,
      totalCards: 0,
      correctPlays: 0,
      incorrectPlays: 0,
      accuracy: 0,
      avgDecisionTime: 0,
      specialCardsPlayed: 0,
      adaptationScore: 0
    });
    
    // 초기 중앙 카드
    const initialCenter = createCard();
    setCenterCard(initialCenter);
    
    // 플레이어 핸드 생성
    const settings = difficultySettings[difficulty];
    const initialHand = Array.from({ length: settings.handSize }, () => createCard());
    setPlayerHand(initialHand);
    
    setCurrentRule('색깔 또는 숫자가 같은 카드를 내세요');
    setFeedback('');
    setIsReversed(false);
    setWildColor(null);
    setTimeLeft(180);
    decisionTimes.current = [];
    cardStartTime.current = Date.now();
  }, [difficulty, createCard]);

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

  // 플레이어 핸드 업데이트 (중앙 카드 변경 시)
  useEffect(() => {
    updateHandPlayability();
  }, [updateHandPlayability]);

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

  // 규칙 변경 타이머
  useEffect(() => {
    if (!isPlaying) return;

    const settings = difficultySettings[difficulty];
    const ruleTimer = setInterval(() => {
      // 가끔 규칙 리마인더
      if (Math.random() < 0.3) {
        const reminders = [
          '색깔이나 숫자를 맞춰보세요!',
          '특수 카드로 게임을 바꿔보세요!',
          '빠른 판단이 중요해요!',
          '와일드 카드는 언제든 낼 수 있어요!'
        ];
        setFeedback(reminders[Math.floor(Math.random() * reminders.length)]);
        setTimeout(() => setFeedback(''), 2000);
      }
    }, settings.ruleChangeFrequency * 1000);

    return () => clearInterval(ruleTimer);
  }, [isPlaying, difficulty]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">🃏 예측불허 우노</h1>
        <p className="text-gray-600">변화하는 규칙에 맞춰 빠르게 카드를 내세요!</p>
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
                <h4 className="font-semibold mb-2">기본 규칙</h4>
                <ul className="space-y-1 text-sm">
                  <li>🎯 중앙 카드와 색깔 또는 숫자가 같은 카드 내기</li>
                  <li>🌈 와일드 카드는 언제든 낼 수 있어요</li>
                  <li>⚡ 빠른 판단으로 높은 점수 획득</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">특수 카드</h4>
                <ul className="space-y-1 text-sm">
                  <li>🔄 리버스: 순서 바뀜</li>
                  <li>🌈 와일드: 색깔 변경</li>
                  <li>⏭️ 스킵: 다음 차례 건너뛰기</li>
                  <li>➕2️⃣ 드로우2: 카드 2장 가져가기</li>
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
                <div className="text-sm text-gray-600">적응 점수</div>
                <div className="text-2xl font-bold text-purple-600">{gameStats.adaptationScore}</div>
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

      {/* Current Rule */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-700 mb-2">
              현재 규칙: {currentRule}
            </div>
            {isReversed && (
              <Badge variant="secondary" className="mr-2">순서 뒤바뀜 🔄</Badge>
            )}
            {wildColor && (
              <Badge variant="secondary">
                현재 색깔: {getColorEmoji(wildColor)} {wildColor}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-center text-lg font-semibold text-green-700">
              {feedback}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Center Card */}
        <Card className="md:col-start-2">
          <CardHeader>
            <CardTitle className="text-center">중앙 카드</CardTitle>
          </CardHeader>
          <CardContent>
            {centerCard && (
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {centerCard.type === 'special' 
                    ? SPECIAL_CARDS.find(s => s.value === centerCard.value)?.emoji || '🃏'
                    : `${getColorEmoji(wildColor || centerCard.color)}${centerCard.value}`
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {centerCard.type === 'special' ? centerCard.value : `${centerCard.color} ${centerCard.value}`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Hand */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">내 카드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-2">
            {playerHand.map((card) => (
              <button
                key={card.id}
                onClick={() => playCard(card.id)}
                disabled={!isPlaying || !card.playable}
                className={`
                  p-3 border-2 rounded-lg text-center transition-all
                  ${card.playable 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer' 
                    : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
                  }
                  ${!isPlaying ? 'opacity-50' : ''}
                `}
              >
                <div className="text-3xl mb-1">
                  {card.type === 'special' 
                    ? SPECIAL_CARDS.find(s => s.value === card.value)?.emoji || '🃏'
                    : `${getColorEmoji(card.color)}${card.value}`
                  }
                </div>
                <div className="text-xs text-gray-600">
                  {card.type === 'special' ? card.value : `${card.color} ${card.value}`}
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Button
              onClick={passCard}
              disabled={!isPlaying}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              카드 받기 (패스)
            </Button>
          </div>
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
            <option value="easy">쉬움 (5장)</option>
            <option value="medium">보통 (6장)</option>
            <option value="hard">어려움 (7장)</option>
          </select>
        </div>
      </div>

      {/* Detailed Stats */}
      {gameStats.totalCards > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.correctPlays}</div>
                <div className="text-sm text-gray-600">성공한 플레이</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameStats.specialCardsPlayed}</div>
                <div className="text-sm text-gray-600">특수 카드 사용</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(gameStats.avgDecisionTime)}ms
                </div>
                <div className="text-sm text-gray-600">평균 결정시간</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{gameStats.level}</div>
                <div className="text-sm text-gray-600">현재 레벨</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}