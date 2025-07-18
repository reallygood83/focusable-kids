'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Brain, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: '비밀번호 재설정 이메일 발송',
        description: '이메일을 확인하여 비밀번호를 재설정해주세요.',
      });
    } catch (error: any) {
      toast({
        title: '비밀번호 재설정 실패',
        description: error.message || '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="flex justify-center items-center gap-2 mb-4">
              <Brain className="w-10 h-10 text-blue-600" />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">이메일을 확인하세요</h2>
            <p className="mt-4 text-gray-600">
              비밀번호 재설정 링크를 <strong>{email}</strong>로 발송했습니다.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              이메일이 오지 않았다면 스팸함을 확인해보세요.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/auth/login">
                로그인 페이지로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h2>
          <p className="mt-2 text-sm text-gray-600">
            가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? '발송 중...' : '재설정 링크 발송'}
          </Button>

          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}