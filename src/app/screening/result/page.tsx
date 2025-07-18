'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Download,
  Share,
  RotateCcw
} from 'lucide-react';

interface ScreeningResult {
  testType: 'lower' | 'upper';
  totalScore: number;
  attentionScore: number;
  hyperactivityScore: number;
  impulsivityScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  completedAt: string;
  responses: number[];
}

export default function ScreeningResultPage() {
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedResult = localStorage.getItem('screening_result');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      router.push('/screening');
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

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          title: '낮은 위험도',
          description: 'ADHD 증상이 거의 나타나지 않습니다.'
        };
      case 'moderate':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Info,
          title: '중간 위험도',
          description: '일부 ADHD 증상이 관찰됩니다. 주의 깊은 관찰이 필요합니다.'
        };
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          title: '높은 위험도',
          description: 'ADHD 증상이 다수 관찰됩니다. 전문의 상담을 권장합니다.'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Info,
          title: '알 수 없음',
          description: ''
        };
    }
  };

  const riskInfo = getRiskLevelInfo(result.riskLevel);
  const RiskIcon = riskInfo.icon;

  const maxScoreByCategory = result.testType === 'lower' ? {
    attention: 7 * 3, // 7개 질문 × 3점
    hyperactivity: 5 * 3, // 5개 질문 × 3점  
    impulsivity: 3 * 3 // 3개 질문 × 3점
  } : {
    attention: 9 * 3, // 9개 질문 × 3점
    hyperactivity: 6 * 3, // 6개 질문 × 3점
    impulsivity: 3 * 3 // 3개 질문 × 3점
  };

  const categoryPercentages = {
    attention: Math.round((result.attentionScore / maxScoreByCategory.attention) * 100),
    hyperactivity: Math.round((result.hyperactivityScore / maxScoreByCategory.hyperactivity) * 100),
    impulsivity: Math.round((result.impulsivityScore / maxScoreByCategory.impulsivity) * 100)
  };

  const recommendations = {
    low: [
      '현재 ADHD 증상이 거의 나타나지 않습니다.',
      '정기적인 관찰을 통해 변화를 체크해보세요.',
      '집중력 향상 게임으로 예방적 훈련을 해보세요.'
    ],
    moderate: [
      '일부 ADHD 증상이 관찰되어 주의가 필요합니다.',
      '구조화된 환경과 규칙적인 일과를 만들어보세요.',
      '집중력 향상 게임을 꾸준히 활용해보세요.',
      '3개월 후 재검사를 권장합니다.'
    ],
    high: [
      'ADHD 증상이 다수 관찰됩니다.',
      '소아정신과 전문의 상담을 받아보시기 바랍니다.',
      '학교 선생님과도 상황을 공유해보세요.',
      '전문적인 치료와 병행하여 집중력 게임을 활용하세요.'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">스크리닝 테스트 결과</h1>
            <Badge variant="outline">
              {result.testType === 'lower' ? '초등 저학년' : '초등 고학년'} 테스트
            </Badge>
            <p className="text-gray-600 mt-2">
              검사 완료: {new Date(result.completedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          <div className="grid gap-6">
            {/* Overall Result */}
            <Card className={`${riskInfo.bgColor} ${riskInfo.borderColor} border-2`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-3 ${riskInfo.color}`}>
                  <RiskIcon className="w-6 h-6" />
                  {riskInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{riskInfo.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">총점:</span>
                  <span className="text-2xl font-bold">{result.totalScore}</span>
                  <span className="text-sm text-gray-600">
                    / {result.responses.length * 3}점
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                    주의력
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span>{result.attentionScore}/{maxScoreByCategory.attention}</span>
                    </div>
                    <Progress value={categoryPercentages.attention} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {categoryPercentages.attention}% 수준
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                    과잉행동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span>{result.hyperactivityScore}/{maxScoreByCategory.hyperactivity}</span>
                    </div>
                    <Progress value={categoryPercentages.hyperactivity} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {categoryPercentages.hyperactivity}% 수준
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                    충동성
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span>{result.impulsivityScore}/{maxScoreByCategory.impulsivity}</span>
                    </div>
                    <Progress value={categoryPercentages.impulsivity} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {categoryPercentages.impulsivity}% 수준
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  맞춤 권장사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations[result.riskLevel].map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => router.push('/games')} className="gap-2">
                <Activity className="w-4 h-4" />
                집중력 게임 시작하기
              </Button>
              
              <Button variant="outline" onClick={() => router.push('/screening')} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                다시 검사하기
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                결과 저장하기
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Share className="w-4 h-4" />
                공유하기
              </Button>
            </div>

            {/* Disclaimer */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 text-center">
                  ⚠️ 이 검사 결과는 참고용이며 전문적인 진단을 대체할 수 없습니다. 
                  정확한 진단을 위해서는 반드시 전문의와 상담하시기 바랍니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}