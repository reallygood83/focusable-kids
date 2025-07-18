'use client';

import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>

          <div className="text-center mb-12">
            <Brain className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              집중력 강화 게임 소개
            </h1>
            <p className="text-xl text-gray-600">
              ADHD 아동을 위한 과학적인 인지 훈련 플랫폼
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">프로젝트 목표</h2>
              <ul className="space-y-3 text-gray-700">
                <li>• ADHD 아동의 조기 선별 및 진단 지원</li>
                <li>• 재미있는 게임을 통한 집중력 향상 훈련</li>
                <li>• 아동의 인지능력 발달 모니터링</li>
                <li>• 부모와 교사를 위한 객관적 데이터 제공</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4 text-green-600">주요 특징</h2>
              <ul className="space-y-3 text-gray-700">
                <li>• 과학적 근거 기반의 CPT 테스트</li>
                <li>• 연령별 맞춤형 난이도 조절</li>
                <li>• 실시간 성과 분석 및 피드백</li>
                <li>• 안전하고 아동 친화적인 인터페이스</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">개발진 소개</h2>
            <div className="text-center text-gray-700">
              <p className="mb-2">
                <strong>안양 박달초등학교 김문정 교사</strong>
              </p>
              <p className="mb-4">
                ADHD 아동 교육 전문가 | 교육 기술 혁신가
              </p>
              <p className="text-sm">
                본 프로젝트는 현장 교육 경험을 바탕으로 개발된 
                실용적이고 효과적인 교육 도구입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}