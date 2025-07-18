'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Users, Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function ScreeningPage() {
  const { user } = useAuth();
  const router = useRouter();

  const startTest = (testType: 'lower' | 'upper') => {
    // 게스트도 테스트 가능하도록 수정
    router.push(`/screening/${testType}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">ADHD 스크리닝 테스트</h1>
          <p className="text-lg text-gray-600 mb-6">
            우리 아이의 주의력과 행동 특성을 간단히 확인해보세요.
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              약 5-10분 소요
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              전문가 검증 문항
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Star className="w-4 h-4" />
              무료 이용
            </Badge>
          </div>
        </div>

        {/* Test Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                초등 저학년 (1~3학년)
              </CardTitle>
              <CardDescription>
                쉬운 표현과 간단한 문항으로 구성된 테스트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm">
                <li>• 15개 간소화된 질문</li>
                <li>• 보호자 도움 권장</li>
                <li>• 이해하기 쉬운 표현</li>
                <li>• 약 5분 소요</li>
              </ul>
              <Button 
                onClick={() => startTest('lower')} 
                className="w-full"
              >
                저학년 테스트 시작
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                초등 고학년 (4~6학년)
              </CardTitle>
              <CardDescription>
                정확한 진단을 위한 상세한 문항으로 구성
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4 text-sm">
                <li>• 18개 전문 질문</li>
                <li>• 자기주도 응답 가능</li>
                <li>• DSM-5 기준 적용</li>
                <li>• 약 8분 소요</li>
              </ul>
              <Button 
                onClick={() => startTest('upper')} 
                className="w-full"
              >
                고학년 테스트 시작
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ 중요한 안내사항
          </h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 이 테스트는 전문적인 진단을 대체할 수 없습니다.</li>
            <li>• 스크리닝 목적으로만 사용되며, 참고 자료로 활용해주세요.</li>
            <li>• 높은 점수가 나올 경우 전문의 상담을 권장합니다.</li>
            <li>• 정확한 결과를 위해 솔직하게 답변해주세요.</li>
          </ul>
        </div>

        {/* How it Works */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">테스트 진행 방법</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-medium mb-1">학년 선택</h4>
              <p className="text-sm text-gray-600">아이의 학년에 맞는 테스트를 선택하세요</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-medium mb-1">질문 응답</h4>
              <p className="text-sm text-gray-600">각 문항에 대해 해당하는 정도를 선택하세요</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-medium mb-1">결과 확인</h4>
              <p className="text-sm text-gray-600">즉시 결과와 맞춤 권고사항을 확인하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}