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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { gameConfigs } from '@/data/game-config';

export default function GamesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const startGame = (gameId: string) => {
    // 개발/테스트를 위해 로그인 없이도 게임 플레이 가능
    router.push(`/games/${gameId}`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">집중력 강화 게임</h1>
          <p className="text-lg text-gray-600 mb-6">
            재미있는 게임으로 주의력과 집중력을 향상시켜보세요!
          </p>
          <div className="flex justify-center gap-4 mb-6">
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
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.values(gameConfigs).map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDifficultyColor(game.difficulty)}>
                    {getDifficultyIcon(game.difficulty)}
                    <span className="ml-1 capitalize">{game.difficulty}</span>
                  </Badge>
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <CardTitle className="text-xl">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>게임 시간:</span>
                    <span className="font-medium">{Math.floor(game.duration / 60)}분</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>반응 시간:</span>
                    <span className="font-medium">{game.responseTimeLimit}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>타겟 비율:</span>
                    <span className="font-medium">{Math.round(game.targetProbability * 100)}%</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startGame(game.id)} 
                  className="w-full gap-2"
                >
                  <Play className="w-4 h-4" />
                  게임 시작
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Play */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                <h3 className="font-semibold mb-2">1. 타겟 찾기</h3>
                <p className="text-sm text-gray-600">
                  화면에 나타나는 도형들 중에서 지정된 타겟만 찾아보세요.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. 빠른 반응</h3>
                <p className="text-sm text-gray-600">
                  타겟이 나타나면 빠르게 클릭하고, 다른 도형은 무시하세요.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. 점수 획득</h3>
                <p className="text-sm text-gray-600">
                  정확하고 빠른 반응으로 높은 점수를 획득해보세요!
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">주의력 향상</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• 선택적 주의력 강화</li>
                  <li>• 지속적 집중력 개발</li>
                  <li>• 주의 분산 방지 능력 향상</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-800">인지 능력 개선</h4>
                <ul className="text-sm space-y-1 text-purple-700">
                  <li>• 반응 속도 향상</li>
                  <li>• 충동 억제 능력 강화</li>
                  <li>• 정보 처리 속도 개선</li>
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
                <h3 className="font-semibold mb-2">게임을 시작하려면 로그인이 필요해요!</h3>
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