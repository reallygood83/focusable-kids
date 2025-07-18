'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

function ScreeningSetupContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testType = searchParams.get('type') as 'lower' | 'upper';
  
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [parentName, setParentName] = useState('');

  const startTest = () => {
    // 테스트 정보를 localStorage에 저장
    const testInfo = {
      childName: childName.trim() || '익명',
      childAge: childAge.trim(),
      parentName: parentName.trim(),
      testType,
      startedAt: new Date().toISOString(),
      isGuest: !user || user.email === 'guest@focusable.com'
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('screening_info', JSON.stringify(testInfo));
    }

    router.push(`/screening/${testType}`);
  };

  if (!testType || (testType !== 'lower' && testType !== 'upper')) {
    router.push('/screening');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Brain className="w-12 h-12 text-blue-600" />
            </div>
            <Badge variant="outline" className="mb-4">
              {testType === 'lower' ? '초등 저학년 (1~3학년)' : '초등 고학년 (4~6학년)'} 테스트
            </Badge>
            <h1 className="text-3xl font-bold mb-4">테스트 시작 전 정보 입력</h1>
            <p className="text-gray-600">
              더 정확한 결과와 맞춤 권장사항을 위해 아래 정보를 입력해주세요.
            </p>
          </div>

          {/* Setup Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
              <CardDescription>
                모든 정보는 선택사항이며, 결과 분석에만 사용됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="childName">아이 이름 (또는 별명)</Label>
                <Input
                  id="childName"
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="예: 민수, 우리아이 등"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  결과 페이지에서 개인화된 메시지를 보여드립니다.
                </p>
              </div>

              <div>
                <Label htmlFor="childAge">아이 나이</Label>
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
                <p className="text-xs text-gray-500 mt-1">
                  연령대별 맞춤 권장사항을 제공합니다.
                </p>
              </div>

              <div>
                <Label htmlFor="parentName">보호자 성함 (선택)</Label>
                <Input
                  id="parentName"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="예: 김○○ 어머니"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  결과 리포트에 포함됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Test Info */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">
                {testType === 'lower' ? '저학년 테스트' : '고학년 테스트'} 안내
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• 소요시간: {testType === 'lower' ? '약 5분' : '약 8분'}</li>
                <li>• 문항수: {testType === 'lower' ? '15개' : '18개'} 질문</li>
                <li>• 최근 6개월 동안의 아이 모습을 기준으로 답변해주세요</li>
                <li>• {testType === 'lower' ? '보호자님과 함께' : '자기주도적으로'} 진행 가능</li>
              </ul>
            </CardContent>
          </Card>

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
              className="gap-2"
              size="lg"
            >
              테스트 시작하기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              🔒 입력하신 모든 정보는 안전하게 보호되며, 테스트 결과 분석 목적으로만 사용됩니다.
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

export default function ScreeningSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>페이지를 준비하고 있습니다...</p>
        </div>
      </div>
    }>
      <ScreeningSetupContent />
    </Suspense>
  );
}