'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Gamepad2, UserCircle } from 'lucide-react';

export default function GuestPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleGuestLogin = () => {
    // 게스트 사용자 설정
    const guestUser = {
      id: 'guest-' + Date.now(),
      email: 'guest@focusable.com',
      user_metadata: {
        fullName: '게스트 사용자',
        role: 'guest'
      }
    };

    // 로컬 스토리지에 게스트 정보 저장
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    
    // Auth context 업데이트
    setUser(guestUser as any);
    
    // 게임 페이지로 이동
    router.push('/games');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">환영합니다!</h1>
          <p className="mt-2 text-gray-600">
            로그인 없이도 게임을 즐길 수 있어요
          </p>
        </div>

        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-6 h-6" />
                게스트로 시작하기
              </CardTitle>
              <CardDescription className="text-gray-700">
                회원가입 없이 바로 게임을 시작할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGuestLogin}
                className="w-full gap-2"
                size="lg"
              >
                <Gamepad2 className="w-5 h-5" />
                게스트로 게임하기
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600">
            <p>게임 기록을 저장하려면</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                로그인
              </a>
              <span>|</span>
              <a href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                회원가입
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}