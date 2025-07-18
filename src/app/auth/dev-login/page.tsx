'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DevLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const createDevUser = async () => {
    setLoading(true);
    try {
      // 개발용 고정 계정 생성
      const email = 'testuser@gmail.com';
      const password = 'password123!';
      
      // 먼저 로그인 시도
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginData.user) {
        toast({
          title: '개발용 계정 로그인 성공!',
          description: '이미 존재하는 개발 계정으로 로그인했습니다.',
        });
        router.push('/dashboard');
        return;
      }

      // 로그인 실패시 계정 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: '개발용 사용자',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 프로필 직접 생성
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: '개발용 사용자',
            role: 'parent'
          });

        if (profileError) {
          console.log('Profile creation error (might already exist):', profileError);
        }

        toast({
          title: '개발용 계정 생성 완료!',
          description: '개발 환경에서 사용할 수 있는 계정이 생성되었습니다.',
        });

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Dev account creation error:', error);
      toast({
        title: '계정 생성 오류',
        description: error.message || '개발용 계정 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">개발용 로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            개발 환경에서 빠른 테스트를 위한 계정입니다.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h3 className="font-semibold text-blue-900 mb-2">개발용 계정 정보:</h3>
            <p className="text-sm text-blue-800">이메일: testuser@gmail.com</p>
            <p className="text-sm text-blue-800">비밀번호: password123!</p>
            <p className="text-sm text-blue-800">이름: 개발용 사용자</p>
          </div>

          <Button
            onClick={createDevUser}
            className="w-full"
            disabled={loading}
            size="lg"
          >
            {loading ? '처리 중...' : '개발용 계정으로 시작하기'}
          </Button>

          <div className="text-xs text-gray-500">
            이 기능은 개발 환경에서만 사용하세요.
          </div>
        </div>
      </div>
    </div>
  );
}