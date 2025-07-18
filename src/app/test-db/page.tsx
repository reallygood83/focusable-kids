'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function TestDBPage() {
  const [dbStatus, setDbStatus] = useState<string>('확인 중...');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const testConnection = async () => {
    try {
      setDbStatus('연결 테스트 중...');
      setError(null);

      // 1. 기본 연결 테스트
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        throw new Error(`연결 실패: ${connectionError.message}`);
      }

      // 2. 테이블 존재 확인
      const tableChecks = [
        'profiles',
        'child_profiles', 
        'screening_results',
        'game_sessions',
        'game_metrics'
      ];

      const tableResults = [];
      for (const table of tableChecks) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            tableResults.push(`❌ ${table}: ${error.message}`);
          } else {
            tableResults.push(`✅ ${table}: 정상`);
          }
        } catch (err) {
          tableResults.push(`❌ ${table}: 테이블 없음`);
        }
      }

      setTables(tableResults);
      setDbStatus('✅ 데이터베이스 연결 성공!');

    } catch (err: any) {
      setError(err.message);
      setDbStatus('❌ 연결 실패');
    }
  };

  const testAuth = async () => {
    try {
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`인증 오류: ${error.message}`);
      }

      if (session) {
        setDbStatus(`✅ 로그인됨: ${session.user.email}`);
      } else {
        setDbStatus('⚠️ 로그인되지 않음');
      }
    } catch (err: any) {
      setError(`인증 테스트 실패: ${err.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Supabase 연결 테스트</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">데이터베이스 상태</h2>
          <p className="text-lg mb-4">{dbStatus}</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>오류:</strong> {error}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">테이블 상태:</h3>
            {tables.map((table, index) => (
              <div key={index} className="font-mono text-sm">
                {table}
              </div>
            ))}
          </div>

          <div className="mt-4 space-x-4">
            <Button onClick={testConnection}>
              연결 다시 테스트
            </Button>
            <Button onClick={testAuth} variant="outline">
              인증 상태 확인
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">다음 단계:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>모든 테이블이 ✅ 상태인지 확인</li>
            <li>/auth/register에서 회원가입 테스트</li>
            <li>/auth/login에서 로그인 테스트</li>
            <li>로그인 후 이 페이지에서 인증 상태 확인</li>
          </ol>
        </div>
      </div>
    </div>
  );
}