'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Brain, User, GraduationCap, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { 
  allProfessionalQuestions,
  symptomResponseOptions,
  impairmentResponseOptions,
  calculateProfessionalScore
} from '@/data/professional-screening-questions';
import { useToast } from '@/hooks/use-toast';

function ProfessionalScreeningContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const respondentType = searchParams.get('respondent') as 'parent' | 'teacher' | null;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(allProfessionalQuestions.length).fill(-1));
  const [loading, setLoading] = useState(false);
  const [testInfo, setTestInfo] = useState<any>(null);

  React.useEffect(() => {
    if (!respondentType || (respondentType !== 'parent' && respondentType !== 'teacher')) {
      router.push('/screening/professional/setup');
      return;
    }

    if (typeof window !== 'undefined') {
      const savedInfo = localStorage.getItem('professional_screening_info');
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          if (info.respondentType === respondentType) {
            setTestInfo(info);
          } else {
            router.push('/screening/professional/setup');
          }
        } catch (e) {
          router.push('/screening/professional/setup');
        }
      } else {
        router.push('/screening/professional/setup');
      }
    }
  }, [respondentType, router]);

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestion < allProfessionalQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const result = calculateProfessionalScore(responses);
      
      const completeResult = {
        ...testInfo,
        ...result,
        responses,
        completedAt: new Date().toISOString(),
        testType: 'professional',
        respondentType,
        isGuest: !user || user.email === 'guest@focusable.com'
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('professional_screening_result', JSON.stringify(completeResult));
      }
      
      toast({
        title: '전문 스크리닝 완료!',
        description: '상세한 분석 결과를 확인하세요.',
      });
      
      router.push('/screening/professional/result');
      
    } catch (error: any) {
      toast({
        title: '저장 실패',
        description: error.message || '결과 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!testInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>전문 스크리닝을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / allProfessionalQuestions.length) * 100;
  const currentQuestionData = allProfessionalQuestions[currentQuestion];
  const currentResponse = responses[currentQuestion];
  const isAnswered = currentResponse !== -1;
  const isLastQuestion = currentQuestion === allProfessionalQuestions.length - 1;
  const allAnswered = responses.every(r => r !== -1);

  // 현재 문항이 기능 손상 척도인지 확인
  const isFunctionalImpairment = currentQuestionData.category === 'functional-impairment';
  const responseOptions = isFunctionalImpairment ? impairmentResponseOptions : symptomResponseOptions;

  // 섹션 정보
  const getSectionInfo = () => {
    if (currentQuestion < 9) {
      return { 
        title: '부주의 증상', 
        icon: Brain, 
        color: 'text-blue-600',
        description: '주의집중력과 관련된 증상들을 평가합니다'
      };
    } else if (currentQuestion < 18) {
      return { 
        title: '과잉행동-충동성 증상', 
        icon: Heart, 
        color: 'text-red-600',
        description: '과잉행동과 충동성 관련 증상들을 평가합니다'
      };
    } else {
      return { 
        title: '기능 손상 평가', 
        icon: GraduationCap, 
        color: 'text-purple-600',
        description: '일상생활에서의 어려움 정도를 평가합니다'
      };
    }
  };

  const sectionInfo = getSectionInfo();
  const SectionIcon = sectionInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-4">
              {respondentType === 'parent' ? '보호자용' : '교사용'} K-ARS 전문 스크리닝
            </Badge>
            <h1 className="text-2xl font-bold mb-2">
              {testInfo.childName && testInfo.childName !== '익명' 
                ? `${testInfo.childName}의 ADHD 전문 스크리닝`
                : 'ADHD 전문 스크리닝 테스트'
              }
            </h1>
            {testInfo.childAge && (
              <p className="text-sm text-gray-600 mb-4">
                {testInfo.childAge}세 • DSM-5 기준
              </p>
            )}
            
            {/* Section Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <SectionIcon className={`w-5 h-5 ${sectionInfo.color}`} />
              <span className={`font-medium ${sectionInfo.color}`}>{sectionInfo.title}</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>문항 {currentQuestion + 1} / {allProfessionalQuestions.length}</span>
              <Progress value={progress} className="w-32" />
              <span>{Math.round(progress)}% 완료</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestionData.text}
                  </CardTitle>
                  {currentQuestionData.description && (
                    <CardDescription className="mt-2 text-base">
                      {currentQuestionData.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="ml-4 text-xs">
                  {currentQuestionData.dsmReference}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* 섹션 설명 */}
              {isFunctionalImpairment && currentQuestion === 18 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-800 mb-2">기능 손상 평가 안내</h3>
                  <p className="text-purple-700 text-sm">
                    이제부터는 위에서 체크한 ADHD 증상들이 아이의 실제 생활에 얼마나 어려움을 주는지 평가합니다. 
                    증상이 있어도 일상생활에 큰 지장이 없다면 문제가 되지 않을 수 있습니다.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  {isFunctionalImpairment 
                    ? '위 ADHD 증상들로 인한 어려움 정도를 선택해주세요:'
                    : '지난 6개월간 이런 모습을 얼마나 자주 보였는지 선택해주세요:'
                  }
                </p>
                
                {responseOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(option.value)}
                    className={`
                      w-full p-4 text-left rounded-lg border-2 transition-all
                      ${currentResponse === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${option.color}`}>
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </div>
                      {currentResponse === option.value && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <div className="text-center text-sm text-gray-500">
              <div className="font-medium">{sectionInfo.description}</div>
              <div className="text-xs mt-1">
                {respondentType === 'parent' ? '보호자님의' : '선생님의'} 객관적 관찰을 바탕으로 답변해주세요
              </div>
            </div>

            {isLastQuestion ? (
              <Button
                onClick={submitTest}
                disabled={!allAnswered || loading}
                className="gap-2"
              >
                {loading ? '분석 중...' : '스크리닝 완료'}
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className="gap-2"
              >
                다음
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-center text-sm text-blue-700">
              <p className="font-medium">💡 전문 스크리닝 진행 안내</p>
              <p className="mt-1">
                이 검사는 K-ARS(한국판 ADHD 평가척도)와 DSM-5 진단 기준에 기반한 전문적인 스크리닝입니다. 
                정확한 결과를 위해 {respondentType === 'parent' ? '최근 6개월간 가정에서' : '학교에서'} 관찰한 모습을 바탕으로 답변해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalScreeningPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>전문 스크리닝을 준비하고 있습니다...</p>
        </div>
      </div>
    }>
      <ProfessionalScreeningContent />
    </Suspense>
  );
}