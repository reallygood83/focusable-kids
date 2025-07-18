'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart,
  GraduationCap,
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  Download,
  Share,
  RotateCcw,
  FileText,
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import { ScreeningResult } from '@/data/professional-screening-questions';

interface ProfessionalResult extends ScreeningResult {
  childName?: string;
  childAge?: string;
  childGrade?: string;
  respondentName?: string;
  respondentType?: 'parent' | 'teacher';
  relationship?: string;
  observationPeriod?: string;
  completedAt?: string;
  isGuest?: boolean;
}

export default function ProfessionalResultPage() {
  const [result, setResult] = useState<ProfessionalResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedResult = localStorage.getItem('professional_screening_result');
      if (savedResult) {
        try {
          setResult(JSON.parse(savedResult));
        } catch (e) {
          console.error('결과 파싱 오류:', e);
          router.push('/screening');
        }
      } else {
        router.push('/screening');
      }
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>결과를 분석하고 있습니다...</p>
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
          description: 'ADHD 증상이 거의 관찰되지 않습니다.'
        };
      case 'moderate':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Info,
          title: '경미한 위험도',
          description: '일부 ADHD 증상이 관찰되어 주의 깊은 관찰이 필요합니다.'
        };
      case 'high':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          title: '상당한 위험도',
          description: '상당한 ADHD 증상이 관찰되어 전문가 상담을 권장합니다.'
        };
      case 'very-high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          title: '높은 위험도',
          description: '심각한 ADHD 증상과 기능 손상이 관찰됩니다.'
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

  const getPersonalizedRecommendations = () => {
    const childName = result.childName && result.childName !== '익명' ? result.childName : '아이';
    const respondentText = result.respondentType === 'teacher' ? '학생' : '아이';
    
    const baseRecommendations = [
      result.clinicalRecommendation,
    ];

    // 위험도별 추가 권장사항
    if (result.riskLevel === 'low') {
      baseRecommendations.push(
        `${childName}의 현재 상태를 유지하기 위해 규칙적인 생활 패턴을 권장합니다.`,
        '예방적 집중력 훈련 게임을 통해 인지 능력을 더욱 향상시킬 수 있습니다.',
        '6개월 후 재평가를 통해 변화를 추적해보세요.'
      );
    } else if (result.riskLevel === 'moderate') {
      baseRecommendations.push(
        `${result.respondentType === 'teacher' ? '가정과 학교' : '학교와 가정'}에서의 일관된 지원이 중요합니다.`,
        '구조화된 환경과 명확한 규칙을 제공해주세요.',
        '긍정적 강화를 통한 행동 수정을 시도해보세요.',
        '3개월 후 재평가를 권장합니다.'
      );
    } else {
      baseRecommendations.push(
        '소아정신과 전문의의 정확한 진단을 받으시기 바랍니다.',
        `${result.respondentType === 'teacher' ? '학부모' : '담임 선생님'}와 상황을 공유하여 일관된 지원 계획을 수립하세요.`,
        '전문적인 치료와 함께 집중력 훈련을 병행하시기 바랍니다.'
      );
    }

    // 기능 손상이 심한 경우 추가 권장사항
    if (result.functionalImpairmentScore >= 12) {
      baseRecommendations.push(
        '일상생활 기능 개선을 위한 구체적인 전략이 필요합니다.',
        '또래 관계 개선을 위한 사회성 훈련도 고려해보세요.'
      );
    }

    return baseRecommendations;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {result.childName && result.childName !== '익명'
                ? `${result.childName}의 K-ARS 전문 스크리닝 결과`
                : 'K-ARS 전문 스크리닝 결과'
              }
            </h1>
            <div className="flex justify-center items-center gap-4 mb-4">
              <Badge variant="outline">
                {result.respondentType === 'parent' ? '보호자용' : '교사용'} K-ARS
              </Badge>
              {result.childAge && (
                <Badge variant="outline">
                  {result.childAge}세
                </Badge>
              )}
              {result.childGrade && (
                <Badge variant="outline">
                  {result.childGrade}
                </Badge>
              )}
            </div>
            <div className="text-gray-600 space-y-1">
              {result.completedAt && (
                <p className="flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4" />
                  검사 완료: {new Date(result.completedAt).toLocaleDateString('ko-KR')}
                </p>
              )}
              {result.respondentName && (
                <p className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  검사자: {result.respondentName} {result.relationship && `(${result.relationship})`}
                </p>
              )}
              {result.observationPeriod && (
                <p className="text-sm">관찰 기간: {result.observationPeriod}</p>
              )}
            </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">증상 총점</div>
                    <div className="text-2xl font-bold">{result.totalSymptomScore}</div>
                    <div className="text-xs text-gray-500">/ 54점</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">기능 손상</div>
                    <div className="text-2xl font-bold">{result.functionalImpairmentScore}</div>
                    <div className="text-xs text-gray-500">/ 18점</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">전체 총점</div>
                    <div className="text-2xl font-bold">{result.totalScore}</div>
                    <div className="text-xs text-gray-500">/ 72점</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">위험도</div>
                    <div className={`text-xl font-bold ${riskInfo.color}`}>
                      {result.riskLevel === 'very-high' ? '매우높음' : 
                       result.riskLevel === 'high' ? '높음' :
                       result.riskLevel === 'moderate' ? '경미' : '낮음'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-blue-600" />
                    부주의 증상
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span className="font-medium">{result.attentionScore}/27</span>
                    </div>
                    <Progress value={result.detailedAnalysis.attentionPercentage} className="h-2" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {result.detailedAnalysis.attentionPercentage}%
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        주의집중, 과제 지속성, 조직화 능력
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                    과잉행동-충동성
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span className="font-medium">{result.hyperactivityScore}/27</span>
                    </div>
                    <Progress value={result.detailedAnalysis.hyperactivityPercentage} className="h-2" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-red-600">
                        {result.detailedAnalysis.hyperactivityPercentage}%
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        활동성, 충동 조절, 사회적 억제
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    기능 손상
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>점수</span>
                      <span className="font-medium">{result.functionalImpairmentScore}/18</span>
                    </div>
                    <Progress value={result.detailedAnalysis.impairmentPercentage} className="h-2" />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-600">
                        {result.detailedAnalysis.impairmentPercentage}%
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        일상기능, 관계, 학업 수행
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Significant Symptoms */}
            {result.detailedAnalysis.significantSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    주요 관찰 영역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">유의미한 증상 영역</h4>
                      <div className="space-y-2">
                        {result.detailedAnalysis.significantSymptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">특별한 주의가 필요한 영역</h4>
                      <div className="space-y-2">
                        {result.detailedAnalysis.severityAreas.map((area, index) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clinical Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  전문적 권장사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {getPersonalizedRecommendations().map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="flex-1">{rec}</span>
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
                다른 스크리닝 하기
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                결과 리포트 저장
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Share className="w-4 h-4" />
                전문가와 공유
              </Button>
            </div>

            {/* Disclaimer */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">중요한 안내사항</h3>
                  <div className="text-sm text-gray-600 space-y-1 max-w-3xl mx-auto">
                    <p>
                      이 K-ARS 스크리닝 결과는 DSM-5 진단 기준에 기반한 전문적인 평가이지만, 
                      의료진의 정확한 진단을 대체할 수 없습니다.
                    </p>
                    <p>
                      ADHD는 다양한 요인이 복합적으로 작용하는 신경발달장애로, 
                      정확한 진단과 적절한 치료를 위해서는 반드시 소아정신과 전문의와 상담하시기 바랍니다.
                    </p>
                    <p className="font-medium text-gray-700">
                      이 결과는 전문가 상담 시 유용한 참고 자료로 활용하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}