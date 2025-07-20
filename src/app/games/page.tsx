'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Clock, 
  Star, 
  Zap, 
  Brain,
  Trophy,
  Play,
  ArrowRight,
  Heart,
  GraduationCap,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { gameConfigs } from '@/data/game-config';
import { enhancedGames, gameCategories } from '@/data/enhanced-games';

export default function GamesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const startGame = (gameId: string, isEnhanced = false) => {
    console.log('🎮 Starting game:', gameId, 'Enhanced:', isEnhanced);
    
    if (isEnhanced) {
      router.push(`/games/enhanced/${gameId}`);
    } else {
      router.push(`/games/${gameId}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Target className="w-4 h-4" />;
      case 'medium': return <Star className="w-4 h-4" />;
      case 'hard': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  // 게임 카테고리별 아이콘 매핑
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inhibition': return '🛑';
      case 'working-memory': return '🧠';
      case 'cognitive-flexibility': return '🔄';
      default: return '🎮';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎮 집중력 강화 게임</h1>
          <p className="text-lg text-gray-600 mb-6">
            재미있는 게임으로 주의력과 집중력을 향상시켜보세요!
          </p>
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <Badge variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              3분 게임
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              과학적 검증
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Trophy className="w-4 h-4" />
              실시간 점수
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              총 {enhancedGames.length + Object.keys(gameConfigs).length}개 게임
            </Badge>
          </div>
        </div>

        {/* All Games Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🎯 모든 게임</h2>
            <p className="text-gray-600 mb-6">
              원하는 게임을 선택해서 바로 시작하세요!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Enhanced Games */}
            {enhancedGames.map((game) => (
              <Card key={game.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {getDifficultyIcon(game.difficulty)}
                      <span className="ml-1 capitalize">{game.difficulty}</span>
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(game.duration / 60)}분
                      </Badge>
                      <span className="text-2xl">{getCategoryIcon(game.category)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {game.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-4">
                    <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg">
                      <strong>🧠 인지 연결:</strong> {game.cognitiveConnection}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">카테고리:</div>
                      <Badge variant="secondary" className="text-xs">
                        {gameCategories[game.category].name}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">설계 원칙:</div>
                      <div className="flex flex-wrap gap-1">
                        {game.designPrinciples.slice(0, 2).map((principle, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {principle}
                          </Badge>
                        ))}
                        {game.designPrinciples.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{game.designPrinciples.length - 2}개 더
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startGame(game.id, true)} 
                    className="w-full gap-2 group-hover:bg-blue-600 transition-colors"
                    size="lg"
                  >
                    <Play className="w-4 h-4" />
                    게임 시작
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Classic Games */}
            {Object.values(gameConfigs).map((game) => (
              <Card key={game.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getDifficultyColor(game.difficulty)}>
                      {getDifficultyIcon(game.difficulty)}
                      <span className="ml-1 capitalize">{game.difficulty}</span>
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(game.duration / 60)}분
                      </Badge>
                      <span className="text-2xl">⚡</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-4">
                    <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg">
                      <strong>⚡ 클래식 게임:</strong> 빠른 반응과 주의력 훈련에 특화
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">반응 시간:</span>
                        <span className="font-medium">{game.responseTimeLimit}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">타겟 비율:</span>
                        <span className="font-medium">{Math.round(game.targetProbability * 100)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">게임 타입:</div>
                      <Badge variant="secondary" className="text-xs">
                        {game.targetType === 'shape' ? '도형 인식' : 
                         game.targetType === 'color' ? '색상 인식' : '기본 집중력'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startGame(game.id, false)} 
                    className="w-full gap-2 group-hover:bg-green-600 transition-colors"
                    size="lg"
                  >
                    <Play className="w-4 h-4" />
                    게임 시작
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Game Categories Info */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">🧠 게임 카테고리</h2>
            <p className="text-gray-600">각 카테고리별 게임의 특징과 효과를 알아보세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(gameCategories).map(([categoryKey, category]) => (
              <Card key={categoryKey} className={`${category.bgColor} border-0`}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <CardTitle className={`${category.color} text-xl`}>
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">주요 효과:</div>
                    {category.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {enhancedGames.filter(game => game.category === categoryKey).length}개 게임
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Play */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
              게임 방법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. 게임 선택</h3>
                <p className="text-sm text-gray-600">
                  위에서 원하는 게임을 선택하고 "게임 시작" 버튼을 클릭하세요.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. 게임 플레이</h3>
                <p className="text-sm text-gray-600">
                  각 게임의 규칙에 따라 빠르고 정확하게 반응하세요.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. 결과 확인</h3>
                <p className="text-sm text-gray-600">
                  게임 후 점수와 통계를 확인하고 실력을 향상시키세요!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-center">🧠 게임의 효과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  인지 능력 향상
                </h4>
                <ul className="text-sm space-y-2 text-blue-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    선택적 주의력 강화
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    지속적 집중력 개발
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    작업 기억력 향상
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    인지적 유연성 증진
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  실생활 도움
                </h4>
                <ul className="text-sm space-y-2 text-purple-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    학습 능력 향상
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    충동 억제 능력 강화
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    문제 해결 능력 개선
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    사회적 상호작용 개선
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        {!user && (
          <div className="text-center mt-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">🎮 게임을 시작하려면 로그인이 필요해요!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  게임 기록을 저장하고 진행상황을 확인하려면 계정이 필요합니다.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => router.push('/auth/login')}>
                    로그인
                  </Button>
                  <Button onClick={() => router.push('/auth/register')} className="gap-2">
                    무료 회원가입
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}