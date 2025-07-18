'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { 
  screeningQuestions, 
  simplifiedQuestions, 
  responseOptions, 
  calculateScreeningScore 
} from '@/data/screening-questions';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ScreeningTestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const supabase = createClient();
  
  const testType = params.type as 'lower' | 'upper';
  const questions = testType === 'lower' ? simplifiedQuestions : screeningQuestions;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(questions.length).fill(-1));
  const [loading, setLoading] = useState(false);
  const [testInfo, setTestInfo] = useState<any>(null);

  useEffect(() => {
    // 설정 정보 확인
    if (typeof window !== 'undefined') {
      const savedInfo = localStorage.getItem('screening_info');
      if (savedInfo) {
        try {
          const info = JSON.parse(savedInfo);
          if (info.testType === testType) {
            setTestInfo(info);
          } else {
            // 다른 테스트 타입이면 설정 페이지로 이동
            router.push(`/screening/setup?type=${testType}`);
          }
        } catch (e) {
          router.push(`/screening/setup?type=${testType}`);
        }
      } else {
        // 설정 정보가 없으면 설정 페이지로 이동
        router.push(`/screening/setup?type=${testType}`);
      }
    }
  }, [testType, router]);

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
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
      // 점수 계산
      const score = calculateScreeningScore(responses);
      
      // 카테고리별 점수 계산
      const attentionQuestions = questions.filter(q => q.category === 'attention');
      const hyperactivityQuestions = questions.filter(q => q.category === 'hyperactivity');
      const impulsivityQuestions = questions.filter(q => q.category === 'impulsivity');
      
      const attentionScore = attentionQuestions.reduce((sum, q, index) => {
        const questionIndex = questions.findIndex(qq => qq.id === q.id);
        return sum + responses[questionIndex];
      }, 0);
      
      const hyperactivityScore = hyperactivityQuestions.reduce((sum, q, index) => {
        const questionIndex = questions.findIndex(qq => qq.id === q.id);
        return sum + responses[questionIndex];
      }, 0);
      
      const impulsivityScore = impulsivityQuestions.reduce((sum, q, index) => {
        const questionIndex = questions.findIndex(qq => qq.id === q.id);
        return sum + responses[questionIndex];
      }, 0);

      // 결과를 로컬스토리지에 저장 (게스트도 가능)
      const result = {
        ...testInfo, // 설정에서 입력한 개인 정보 포함
        testType,
        totalScore: score.total,
        attentionScore,
        hyperactivityScore,
        impulsivityScore,
        riskLevel: score.riskLevel,
        completedAt: new Date().toISOString(),
        responses,
        isGuest: !user || user.email === 'guest@focusable.com'
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('screening_result', JSON.stringify(result));
      }
      
      // 로그인된 사용자의 경우 데이터베이스에도 저장 시도
      if (user && user.email !== 'guest@focusable.com') {
        try {
          // 데이터베이스 저장 로직 (선택사항)
          // await supabase.from('screening_results').insert(result);
        } catch (dbError) {
          // 데이터베이스 저장 실패해도 결과는 표시
          console.warn('데이터베이스 저장 실패:', dbError);
        }
      }
      
      toast({
        title: '테스트 완료!',
        description: '결과 페이지로 이동합니다.',
      });
      
      router.push('/screening/result');
      
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const currentResponse = responses[currentQuestion];
  const isAnswered = currentResponse !== -1;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = responses.every(r => r !== -1);

  // 설정 정보가 로드되지 않았으면 로딩 표시
  if (!testInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>테스트를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-4">
              {testType === 'lower' ? '초등 저학년' : '초등 고학년'} 테스트
            </Badge>
            <h1 className="text-2xl font-bold mb-2">
              {testInfo.childName && testInfo.childName !== '익명' 
                ? `${testInfo.childName}의 ADHD 스크리닝 테스트`
                : 'ADHD 스크리닝 테스트'
              }
            </h1>
            {testInfo.childAge && (
              <p className="text-sm text-gray-600 mb-4">
                {testInfo.childAge}세 • {testType === 'lower' ? '초등 저학년' : '초등 고학년'} 기준
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>질문 {currentQuestion + 1} / {questions.length}</span>
              <Progress value={progress} className="w-32" />
              <span>{Math.round(progress)}% 완료</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestionData.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                      ${option.color}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
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
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <div className="text-sm text-gray-500">
              {testType === 'lower' ? '보호자님과 함께 답해주세요' : '솔직하게 답변해주세요'}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={submitTest}
                disabled={!allAnswered || loading}
                className="gap-2"
              >
                {loading ? '저장 중...' : '테스트 완료'}
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

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>답변 방법:</strong> 최근 6개월 동안의 아이 모습을 생각하며 가장 적절한 답을 선택해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}