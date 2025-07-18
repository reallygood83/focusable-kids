'use client';

import { Button } from '@/components/ui/button';
import { Brain, Gamepad2, ChartBar, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          재미있는 게임으로 <br />
          <span className="text-blue-600">집중력을 키워요!</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          초등학생을 위한 ADHD 조기 선별 및 집중력 향상 게임 플랫폼.
          3분 게임으로 우리 아이의 주의력을 체크하고 훈련해보세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/auth/register">
              <Gamepad2 className="w-5 h-5" />
              무료로 시작하기
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/auth/login">
              로그인
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="w-12 h-12 text-blue-600" />}
            title="ADHD 스크리닝 테스트"
            description="저학년/고학년 맞춤형 18문항 자가진단으로 아이의 ADHD 증상을 조기에 발견하세요."
          />
          <FeatureCard
            icon={<Gamepad2 className="w-12 h-12 text-green-600" />}
            title="재미있는 미니게임"
            description="집중력, 충동 억제, 작업 기억력을 향상시키는 3분 내외의 다양한 게임들."
          />
          <FeatureCard
            icon={<ChartBar className="w-12 h-12 text-purple-600" />}
            title="실시간 진도 확인"
            description="아이의 게임 결과와 향상도를 그래프로 확인하고 또래 평균과 비교해보세요."
          />
        </div>
      </section>

      {/* Target Users Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">이런 분들께 추천해요</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <UserCard
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="학부모님"
              items={[
                "우리 아이가 산만하다고 느끼시는 분",
                "ADHD가 의심되지만 병원 가기 부담스러우신 분",
                "아이의 집중력 향상을 도와주고 싶으신 분"
              ]}
            />
            <UserCard
              icon={<Users className="w-8 h-8 text-green-600" />}
              title="선생님"
              items={[
                "학급 아동들의 주의력 수준을 파악하고 싶으신 분",
                "수업에 활용할 집중력 훈련 도구가 필요하신 분",
                "ADHD 의심 아동을 조기에 발견하고 싶으신 분"
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">지금 바로 시작해보세요!</h2>
        <p className="text-xl text-gray-600 mb-8">
          회원가입은 무료이며, 언제든지 해지할 수 있습니다.
        </p>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/auth/register">
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UserCard({ icon, title, items }: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}