'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, User, ArrowRight, ArrowLeft, GraduationCap, Heart, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function ProfessionalScreeningSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [respondentType, setRespondentType] = useState<'parent' | 'teacher' | ''>('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGrade, setChildGrade] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [observationPeriod, setObservationPeriod] = useState('');

  const startTest = () => {
    if (!respondentType) return;

    const testInfo = {
      respondentType,
      childName: childName.trim() || '익명',
      childAge: childAge.trim(),
      childGrade: childGrade.trim(),
      respondentName: respondentName.trim(),
      relationship: relationship.trim(),
      observationPeriod: observationPeriod.trim(),
      startedAt: new Date().toISOString(),
      isGuest: !user || user.email === 'guest@focusable.com'
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('professional_screening_info', JSON.stringify(testInfo));
    }

    router.push(`/screening/professional?respondent=${respondentType}`);
  };

  const canProceed = respondentType && childName.trim();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Brain className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">K-ARS 전문 ADHD 스크리닝</h1>
            <p className="text-gray-600 text-lg">
              DSM-5 진단 기준에 기반한 전문적인 ADHD 스크리닝 테스트입니다.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge variant="outline">DSM-5 기준</Badge>
              <Badge variant="outline">K-ARS 기반</Badge>
              <Badge variant="outline">24문항</Badge>
            </div>
          </div>

          {/* Respondent Type Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                응답자 유형 선택
              </CardTitle>
              <CardDescription>
                누가 이 스크리닝을 작성하시나요? 응답자에 따라 맞춤형 질문이 제공됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={respondentType} onValueChange={(value) => setRespondentType(value as 'parent' | 'teacher')}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => setRespondentType('parent')}>
                    <RadioGroupItem value="parent" id="parent" />
                    <label htmlFor="parent" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-pink-600" />
                        <div>
                          <div className="font-semibold">보호자 (부모님)</div>
                          <div className="text-sm text-gray-600">가정에서 관찰한 아이의 모습을 평가</div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => setRespondentType('teacher')}>
                    <RadioGroupItem value="teacher" id="teacher" />
                    <label htmlFor="teacher" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-semibold">교사 (선생님)</div>
                          <div className="text-sm text-gray-600">학교에서 관찰한 학생의 모습을 평가</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Child Information */}
          {respondentType && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {respondentType === 'parent' ? '아이 정보' : '학생 정보'}
                </CardTitle>
                <CardDescription>
                  정확한 평가를 위한 기본 정보를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childName">{respondentType === 'parent' ? '아이 이름' : '학생 이름'} *</Label>
                    <Input
                      id="childName"
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="예: 김민수"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="childAge">나이</Label>
                    <Input
                      id="childAge"
                      type="number"
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      placeholder="예: 8"
                      min="6"
                      max="13"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="childGrade">학년</Label>
                  <Input
                    id="childGrade"
                    type="text"
                    value={childGrade}
                    onChange={(e) => setChildGrade(e.target.value)}
                    placeholder="예: 초등학교 2학년"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Respondent Information */}
          {respondentType && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>응답자 정보</CardTitle>
                <CardDescription>
                  검사 결과 리포트에 포함될 정보입니다. (선택사항)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="respondentName">
                      {respondentType === 'parent' ? '보호자 성함' : '교사 성함'}
                    </Label>
                    <Input
                      id="respondentName"
                      type="text"
                      value={respondentName}
                      onChange={(e) => setRespondentName(e.target.value)}
                      placeholder={respondentType === 'parent' ? "예: 김○○ 어머니" : "예: 이○○ 선생님"}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="relationship">
                      {respondentType === 'parent' ? '관계' : '담당'}
                    </Label>
                    <Input
                      id="relationship"
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder={respondentType === 'parent' ? "예: 어머니, 아버지" : "예: 담임교사, 교과교사"}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observationPeriod">관찰 기간</Label>
                  <Input
                    id="observationPeriod"
                    type="text"
                    value={observationPeriod}
                    onChange={(e) => setObservationPeriod(e.target.value)}
                    placeholder="예: 2024년 3월부터 현재까지"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    최소 6개월 이상의 관찰 기간을 권장합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Information */}
          {respondentType && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">
                      K-ARS 전문 스크리닝 안내
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• <strong>소요시간:</strong> 약 10-15분</li>
                      <li>• <strong>문항수:</strong> 24개 문항 (증상 18개 + 기능손상 6개)</li>
                      <li>• <strong>평가 기준:</strong> DSM-5 진단 기준 및 K-ARS 척도 적용</li>
                      <li>• <strong>평가 기간:</strong> 최근 6개월간의 행동 관찰 기준</li>
                      <li>• <strong>결과:</strong> 상세한 분석 리포트 및 전문적 권장사항 제공</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>⚠️ 중요:</strong> 이 검사는 전문적인 진단을 대체할 수 없으며, 
                        스크리닝 목적으로만 사용됩니다. 높은 점수가 나올 경우 
                        반드시 소아정신과 전문의와 상담하시기 바랍니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.push('/screening')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              이전
            </Button>

            <Button
              onClick={startTest}
              disabled={!canProceed}
              className="gap-2"
              size="lg"
            >
              전문 스크리닝 시작하기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 입력하신 모든 정보는 안전하게 보호되며, 검사 결과 분석 목적으로만 사용됩니다.
              {!user || user.email === 'guest@focusable.com' 
                ? ' 게스트 모드에서는 브라우저에만 저장되며 서버로 전송되지 않습니다.' 
                : ' 회원님의 계정에만 저장됩니다.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}