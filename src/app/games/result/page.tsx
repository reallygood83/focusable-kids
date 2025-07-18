'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock,
  TrendingUp,
  RotateCcw,
  Home,
  Share,
  Download,
  Star,
  Award
} from 'lucide-react';
import { GameResult, GameConfig } from '@/data/game-config';

interface GameResultData extends GameResult {
  config: GameConfig;
  responses: any[];
  stimuli: any[];
}

export default function GameResultPage() {
  const [result, setResult] = useState<GameResultData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedResult = localStorage.getItem('game_result');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      router.push('/games');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const scoreGrade = getScoreGrade(result.score);

  const getPerformanceInsights = () => {
    const insights = [];
    
    if (result.accuracy >= 85) {
      insights.push('🎯 뛰어난 정확도! 집중력이 매우 좋습니다.');
    } else if (result.accuracy >= 70) {
      insights.push('👍 좋은 정확도입니다. 조금 더 신중하게 반응해보세요.');
    } else {
      insights.push('💡 정확도 향상이 필요합니다. 타겟을 더 자세히 관찰해보세요.');
    }
    
    if (result.averageReactionTime <= 600) {
      insights.push('⚡ 매우 빠른 반응속도! 순발력이 뛰어납니다.');
    } else if (result.averageReactionTime <= 1000) {
      insights.push('⏱️ 적절한 반응속도입니다.');
    } else {
      insights.push('🐌 반응속도 개선이 필요합니다. 더 빠르게 반응해보세요.');
    }
    
    if (result.falseAlarms <= 2) {
      insights.push('🛡️ 훌륭한 충동 억제 능력입니다!');
    } else if (result.falseAlarms <= 5) {
      insights.push('⚖️ 충동 억제 능력이 양호합니다.');
    } else {
      insights.push('🎯 차근차근 확인하고 반응하는 연습이 필요합니다.');
    }
    
    return insights;
  };

  const insights = getPerformanceInsights();

  const playAgain = () => {
    router.push(`/games/${result.gameId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">게임 결과</h1>
            <Badge variant="outline" className="mb-4">
              {result.config.name}
            </Badge>
            <p className="text-gray-600">
              게임 시간: {Math.floor(result.duration / 60)}분 {result.duration % 60}초
            </p>
          </div>

          <div className="grid gap-6">
            {/* Score Card */}
            <Card className={`${scoreGrade.bgColor} ${scoreGrade.borderColor} border-2`}>
              <CardHeader>
                <CardTitle className={`flex items-center justify-center gap-3 ${scoreGrade.color}`}>
                  <Trophy className="w-8 h-8" />
                  최종 점수: {result.score}점
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-4 ${scoreGrade.bgColor} ${scoreGrade.borderColor} border-4 ${scoreGrade.color}`}>
                  {scoreGrade.grade}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.hits}</div>
                    <div className="text-sm text-gray-600">정답</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.falseAlarms}</div>
                    <div className="text-sm text-gray-600">오답</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.accuracy}%</div>
                    <div className="text-sm text-gray-600">정확도</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.averageReactionTime}ms</div>
                    <div className="text-sm text-gray-600">평균 반응시간</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-green-600" />
                    정확성 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>타겟 적중률</span>
                        <span>{result.sensitivity}%</span>
                      </div>
                      <Progress value={result.sensitivity} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>전체 정확도</span>
                        <span>{result.accuracy}%</span>
                      </div>
                      <Progress value={result.accuracy} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-600">
                      타겟 {result.totalTargets}개 중 {result.hits}개 적중
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    반응속도 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.averageReactionTime}ms
                      </div>
                      <div className="text-sm text-gray-600">평균 반응시간</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        제한시간: {result.config.responseTimeLimit}ms
                      </div>
                      <Progress 
                        value={Math.min((result.config.responseTimeLimit - result.averageReactionTime) / result.config.responseTimeLimit * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-red-600" />
                    충동 억제 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {result.falseAlarms}
                      </div>
                      <div className="text-sm text-gray-600">잘못된 반응</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        논타겟 {result.totalNonTargets}개 중 {result.correctRejections}개 정확 무시
                      </div>
                      <Progress 
                        value={result.totalNonTargets > 0 ? (result.correctRejections / result.totalNonTargets) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  성과 분석 및 조언
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Award className="w-5 h-5" />
                  다음 단계 추천
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-700">추천 게임</h4>
                    <ul className="text-sm space-y-1 text-blue-600">
                      {result.score < 70 && (
                        <>
                          <li>• 같은 난이도로 다시 도전해보세요</li>
                          <li>• 기본 집중력 게임으로 연습하세요</li>
                        </>
                      )}
                      {result.score >= 70 && result.score < 85 && (
                        <>
                          <li>• 더 어려운 난이도에 도전해보세요</li>
                          <li>• 다른 유형의 게임을 시도해보세요</li>
                        </>
                      )}
                      {result.score >= 85 && (
                        <>
                          <li>• 고급 난이도 게임에 도전하세요</li>
                          <li>• 새로운 게임 유형을 탐험해보세요</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-700">훈련 팁</h4>
                    <ul className="text-sm space-y-1 text-purple-600">
                      <li>• 규칙적인 연습이 중요합니다</li>
                      <li>• 충분한 휴식을 취하세요</li>
                      <li>• 집중할 수 있는 환경을 만드세요</li>
                      <li>• 점진적으로 난이도를 높여가세요</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={playAgain} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                다시 도전하기
              </Button>
              
              <Button onClick={() => router.push('/games')} variant="outline" size="lg" className="gap-2">
                <Home className="w-5 h-5" />
                다른 게임 하기
              </Button>
              
              <Button variant="outline" size="lg" className="gap-2">
                <Share className="w-5 h-5" />
                결과 공유
              </Button>
              
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                결과 저장
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}