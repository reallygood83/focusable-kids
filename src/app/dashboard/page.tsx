'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Zap, 
  TrendingUp, 
  Calendar,
  Clock,
  Trophy,
  Play,
  BarChart3,
  Activity,
  Star,
  Award,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface DashboardData {
  user: {
    name: string;
    joinDate: string;
    lastActive: string;
  };
  screeningHistory: {
    lastTest: string | null;
    riskLevel: 'low' | 'moderate' | 'high' | null;
    totalTests: number;
  };
  gameStats: {
    totalGames: number;
    averageScore: number;
    bestScore: number;
    totalPlayTime: number; // minutes
    favoriteGame: string;
    lastPlayed: string | null;
  };
  recentActivity: Array<{
    type: 'screening' | 'game';
    name: string;
    score?: number;
    date: string;
    result?: string;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earned: boolean;
    progress: number;
    total: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // 실제로는 Supabase에서 데이터를 가져와야 하지만, 
    // 현재는 로컬스토리지와 목업 데이터를 사용
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = () => {
    // 로컬스토리지에서 데이터 로드
    const screeningResult = localStorage.getItem('screening_result');
    const gameResult = localStorage.getItem('game_result');
    
    // 목업 데이터 생성
    const mockData: DashboardData = {
      user: {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '사용자',
        joinDate: '2024-01-15',
        lastActive: new Date().toISOString()
      },
      screeningHistory: {
        lastTest: screeningResult ? JSON.parse(screeningResult).completedAt : null,
        riskLevel: screeningResult ? JSON.parse(screeningResult).riskLevel : null,
        totalTests: screeningResult ? 1 : 0
      },
      gameStats: {
        totalGames: gameResult ? 1 : 0,
        averageScore: gameResult ? JSON.parse(gameResult).score : 0,
        bestScore: gameResult ? JSON.parse(gameResult).score : 0,
        totalPlayTime: gameResult ? Math.floor(JSON.parse(gameResult).duration / 60) : 0,
        favoriteGame: gameResult ? JSON.parse(gameResult).config?.name || '집중력 게임' : '',
        lastPlayed: gameResult ? new Date().toISOString() : null
      },
      recentActivity: [
        ...(gameResult ? [{
          type: 'game' as const,
          name: JSON.parse(gameResult).config?.name || '집중력 게임',
          score: JSON.parse(gameResult).score,
          date: new Date().toISOString()
        }] : []),
        ...(screeningResult ? [{
          type: 'screening' as const,
          name: 'ADHD 스크리닝 테스트',
          result: JSON.parse(screeningResult).riskLevel,
          date: JSON.parse(screeningResult).completedAt
        }] : [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      achievements: [
        {
          id: 'first_screening',
          name: '첫 번째 테스트',
          description: '첫 스크리닝 테스트 완료',
          earned: !!screeningResult,
          progress: screeningResult ? 1 : 0,
          total: 1
        },
        {
          id: 'first_game',
          name: '첫 번째 게임',
          description: '첫 집중력 게임 완료',
          earned: !!gameResult,
          progress: gameResult ? 1 : 0,
          total: 1
        },
        {
          id: 'high_score',
          name: '고득점자',
          description: '게임에서 80점 이상 획득',
          earned: gameResult ? JSON.parse(gameResult).score >= 80 : false,
          progress: gameResult ? Math.min(JSON.parse(gameResult).score, 80) : 0,
          total: 80
        },
        {
          id: 'streak_3',
          name: '연속 플레이어',
          description: '3일 연속 게임 플레이',
          earned: false,
          progress: 1,
          total: 3
        }
      ]
    };

    setDashboardData(mockData);
    setLoading(false);
  };

  if (!user) {
    return <div>로그인이 필요합니다...</div>;
  }

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (level: string | null) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelText = (level: string | null) => {
    switch (level) {
      case 'low': return '낮은 위험도';
      case 'moderate': return '중간 위험도';
      case 'high': return '높은 위험도';
      default: return '미진행';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {dashboardData.user.name}님! 👋
          </h1>
          <p className="text-gray-600">
            마지막 활동: {new Date(dashboardData.user.lastActive).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{dashboardData.screeningHistory.totalTests}</div>
              <div className="text-sm text-gray-600">스크리닝 테스트</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{dashboardData.gameStats.totalGames}</div>
              <div className="text-sm text-gray-600">완료한 게임</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{dashboardData.gameStats.bestScore}</div>
              <div className="text-sm text-gray-600">최고 점수</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{dashboardData.gameStats.totalPlayTime}분</div>
              <div className="text-sm text-gray-600">총 플레이 시간</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Latest Screening Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  최근 스크리닝 결과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.screeningHistory.lastTest ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>위험도 평가</span>
                      <Badge className={getRiskLevelColor(dashboardData.screeningHistory.riskLevel)}>
                        {getRiskLevelText(dashboardData.screeningHistory.riskLevel)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>테스트 일시</span>
                      <span className="text-sm text-gray-600">
                        {new Date(dashboardData.screeningHistory.lastTest).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/screening')}
                      className="w-full gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      다시 테스트하기
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold mb-2">아직 스크리닝 테스트를 진행하지 않았어요</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      우리 아이의 주의력과 행동 특성을 확인해보세요
                    </p>
                    <Button onClick={() => router.push('/screening')} className="gap-2">
                      <Play className="w-4 h-4" />
                      테스트 시작하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  게임 성과
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.gameStats.totalGames > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">평균 점수</div>
                        <div className="text-2xl font-bold text-green-600">
                          {dashboardData.gameStats.averageScore}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">최고 점수</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {dashboardData.gameStats.bestScore}
                        </div>
                      </div>
                    </div>
                    
                    {dashboardData.gameStats.favoriteGame && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">선호 게임</div>
                        <Badge variant="outline">{dashboardData.gameStats.favoriteGame}</Badge>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => router.push('/games')} 
                      className="w-full gap-2"
                    >
                      <Play className="w-4 h-4" />
                      게임 계속하기
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold mb-2">아직 게임을 플레이하지 않았어요</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      재미있는 집중력 게임으로 훈련을 시작해보세요
                    </p>
                    <Button onClick={() => router.push('/games')} className="gap-2">
                      <Play className="w-4 h-4" />
                      첫 게임 시작하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {activity.type === 'game' ? (
                            <Target className="w-5 h-5 text-green-600" />
                          ) : (
                            <Brain className="w-5 h-5 text-blue-600" />
                          )}
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(activity.date).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.score && (
                            <div className="font-bold text-green-600">{activity.score}점</div>
                          )}
                          {activity.result && (
                            <Badge className={getRiskLevelColor(activity.result)}>
                              {getRiskLevelText(activity.result)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">아직 활동 기록이 없어요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 시작</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push('/screening')} 
                  className="w-full gap-2 justify-start"
                  variant="outline"
                >
                  <Brain className="w-4 h-4" />
                  스크리닝 테스트
                </Button>
                <Button 
                  onClick={() => router.push('/games')} 
                  className="w-full gap-2 justify-start"
                  variant="outline"
                >
                  <Target className="w-4 h-4" />
                  집중력 게임
                </Button>
                <Button 
                  onClick={() => router.push('/games/attention-basic')} 
                  className="w-full gap-2 justify-start"
                  variant="outline"
                >
                  <Zap className="w-4 h-4" />
                  기본 게임 바로 시작
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  성취 배지
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.achievements.map((achievement) => (
                    <div key={achievement.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {achievement.earned ? (
                            <Star className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                          )}
                          <div>
                            <div className={`font-medium ${achievement.earned ? 'text-yellow-700' : 'text-gray-600'}`}>
                              {achievement.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!achievement.earned && (
                        <Progress 
                          value={(achievement.progress / achievement.total) * 100} 
                          className="h-1" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-blue-800">💡 오늘의 팁</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-3">
                  집중력 향상을 위해서는 규칙적인 연습이 중요해요. 
                  하루에 10-15분씩 꾸준히 게임을 해보세요!
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  더 많은 팁 보기
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}