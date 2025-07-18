# 인증 문제 해결 가이드

## 🚨 현재 상태
- Supabase에서 Email confirmation이 활성화되어 있어 회원가입 시 이메일 확인이 필요함
- 개발 환경에서 테스트하기 어려운 상황

## 🔧 해결 방법

### 방법 1: Supabase 설정 변경 (권장)
1. https://app.supabase.com 접속
2. 프로젝트 선택 (wmsmiegsoutlnwzmauqm)
3. Authentication → Settings
4. "Enable email confirmations" OFF로 변경
5. Save

### 방법 2: 실제 이메일로 테스트
개발용 로그인 페이지: http://localhost:3000/auth/dev-login
- 실제 Gmail 계정 사용
- 가입 후 이메일 확인 링크 클릭

### 방법 3: SQL로 직접 사용자 생성
Supabase SQL Editor에서 실행:
```sql
-- 1. auth.users에 직접 사용자 추가
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'test@dev.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- 2. 생성된 사용자 ID 확인 후 profiles에 추가
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, '테스트 사용자', 'parent'
FROM auth.users WHERE email = 'test@dev.com';
```

## 🎯 권장 해결 순서
1. Supabase 대시보드에서 Email confirmation 비활성화
2. 기존 회원가입 페이지에서 정상 테스트
3. 모든 기능 테스트 완료

## 📱 완성된 기능들
- ✅ 메인 페이지
- ✅ 스크리닝 테스트
- ✅ 게임 시스템  
- ✅ 대시보드
- ⚠️ 인증 시스템 (설정 수정 필요)