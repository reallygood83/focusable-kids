# Technical Requirements Document (TRD)

## 1. Executive Technical Summary
- **프로젝트 개요**  
  초등학생 대상 ADHD 조기 선별 및 인지 훈련 웹 기반 PWA 플랫폼. Next.js 기반 프론트엔드와 Supabase 백엔드를 활용해 최소한의 기술 스택으로 빠른 출시 및 안정적 운영을 목표로 함.
- **핵심 기술 스택**  
  Next.js, React 18, TypeScript, Service Worker, Supabase(PostgreSQL, Auth, Storage), Firebase Cloud Messaging, Sentry, Amplitude
- **주요 기술 목표**  
  • 화면 전환 2초 이내, 게임 FPS ≥ 30  
  • P95 API 응답 300ms 이하  
  • DAU 10만까지 무중단 확장  
- **중요 기술 가정**  
  • Supabase 서버리스 확장성으로 DAU 확장 수용 가능  
  • PWA 지원 브라우저(iOS/Android)에 Service Worker 호환  
  • AI 난이도 조절은 향후 Edge Functions로 분리 구현  

## 2. Tech Stack

| Category            | Technology / Library               | Reasoning                                            |
| ------------------- | ---------------------------------- | ---------------------------------------------------- |
| Frontend 프레임워크 | Next.js                            | SSR/SSG 지원, PWA 최적화, 빠른 초기 로딩             |
| UI 라이브러리       | React 18, TypeScript               | 컴포넌트 재사용성, 타입 안정성                       |
| PWA 지원            | Service Worker                     | 오프라인 캐시, 푸시 알림 구현 지원                  |
| 스타일링            | CSS Modules / Tailwind CSS (선택)  | 모듈화된 스타일, 생산성 증대                         |
| 백엔드              | Supabase (PostgreSQL, Auth, Storage) | 완전 관리형 데이터베이스·인증·스토리지              |
| API                 | Next.js API Routes + Supabase Client | 단일 코드베이스, 경량 API 구현                       |
| 실시간/푸시         | Firebase Cloud Messaging           | 푸시 알림 구현 표준, 크로스 플랫폼 지원             |
| 분석/모니터링       | Amplitude                          | 사용자 행동 분석, 성공 지표 추적                     |
| 오류 모니터링       | Sentry                             | 클라이언트·서버 에러 추적                            |
| CI/CD               | GitHub Actions                     | 코드 품질 검사, 배포 자동화                          |
| 호스팅              | Vercel (프론트엔드), Supabase      | 글로벌 CDN, 무중단 배포, 서버리스 스케일링           |

## 3. System Architecture Design

### Top-Level Building Blocks
- Frontend PWA  
  • Next.js 기반 UI/UX, Service Worker 캐시, 푸시 알림 리스너  
- Backend API  
  • Next.js API Routes + Supabase Client, 인증(JWT), 권한 체크  
- Database & Storage  
  • Supabase PostgreSQL: 사용자·게임 로그·결과 이력  
  • Supabase Storage: 게임 리소스·탈것 이미지  
- Edge Functions / ML 모듈  
  • 향후 난이도 적응·예측 모델을 위한 Supabase Edge Functions + Python  
- Third-Party Services  
  • Firebase Cloud Messaging, Sentry, Amplitude

### Top-Level Component Interaction Diagram
```mermaid
graph TD
    A[User(PWA)] -->|HTTP/WS| B[Next.js Frontend]
    B -->|REST| C[Next.js API Routes]
    C -->|SQL| D[Supabase PostgreSQL]
    C -->|Storage| E[Supabase Storage]
    C -->|Invoke| F[Supabase Edge Functions]
    F -->|ML| G[Python Model]
    B -->|Push| H[FCM]
    B -->|Log| I[Amplitude]
    B -->|Error| J[Sentry]
```
- 사용자가 PWA를 통해 UI 이벤트 발생  
- Frontend가 API Routes 호출 및 실시간 WebSocket/푸시 수신  
- API Routes는 Supabase DB/Storage 조작 및 Edge Functions 트리거  
- Edge Functions에서 Python ML 모델 연동  
- 사용자 행동은 Amplitude로, 에러는 Sentry로 로깅  

### Code Organization & Convention

**Domain-Driven Organization Strategy**  
- 도메인별 분리: screening, game, dashboard, account, reward, common  
- 레이어 분리: presentation, service, repository, infrastructure  
- 기능 단위 모듈: 각 게임 모듈별 플러그인 방식  
- 공유 컴포넌트: UI, 타입 정의, 유틸리티 모듈

**Universal File & Folder Structure**
```
/
├── public
│   └── assets             # 정적 리소스
├── src
│   ├── common             # 공통 유틸/타입/컴포넌트
│   ├── components         # UI 컴포넌트
│   ├── pages              # Next.js 페이지
│   ├── services           # 비즈니스 로직 서비스
│   ├── repositories       # DB/Storage 접근 계층
│   ├── domain
│   │   ├── screening      # 스크리닝 테스트
│   │   ├── game           # 미니게임 모듈
│   │   ├── dashboard      # 대시보드
│   │   ├── account        # 계정/프로필
│   │   └── reward         # 보상 시스템
│   ├── hooks              # React 커스텀 훅
│   ├── styles             # 글로벌 스타일/Tailwind 설정
│   └── pages
│       ├── api            # Next.js API Routes
│       └── _app.tsx
├── .github                # CI/CD 워크플로
└── next.config.js         # Next.js 설정
```

### Data Flow & Communication Patterns
- **Client-Server Communication**: RESTful API + WebSocket (게임 실시간 업데이트)  
- **Database Interaction**: Supabase JS Client + SQL query, 트랜잭션 관리  
- **External Service Integration**: FCM HTTPv1 API, Sentry SDK, Amplitude SDK  
- **Real-time Communication**: Service Worker Push, 게임 이벤트 WebSocket  
- **Data Synchronization**: IndexedDB 캐시 후 온라인 시 동기화

## 4. Performance & Optimization Strategy
- 코드 스플리팅 및 SSG/ISR 활용으로 초기 로딩 최적화  
- Service Worker 캐싱 전략으로 오프라인 경험 및 네트워크 비용 절감  
- DB 인덱스 최적화, 쿼리 캐싱 및 Supabase Connection Pool 관리  
- 이미지·리소스 WebP 변환 및 CDN 활용  

## 5. Implementation Roadmap & Milestones

### Phase 1: Foundation (MVP 구현, 0~3개월)
- Core Infrastructure: Next.js 프로젝트 및 Supabase 세팅  
- Essential Features: 스크리닝 테스트(저학년·고학년), 3종 미니게임  
- Basic Security: OAuth2·JWT 인증, 개인정보 암호화 저장  
- Development Setup: GitHub Actions CI/CD 파이프라인  
- Timeline: 12주

### Phase 2: Feature Enhancement (4~6개월)
- Advanced Features: 게임 5종 완성, AI 난이도 적응 로직  
- Performance Optimization: DB 인덱스·캐시 전략 개선  
- Enhanced Security: COPPA/KISA 준수 감사, 보안 점검  
- Monitoring Implementation: Sentry·Amplitude 대시보드 완비  
- Timeline: 12주

### Phase 3: Scaling & Optimization (7~12개월)
- Scalability Implementation: 서버리스 확장 정책, Auto-Scaling 설정  
- Advanced Integrations: 교사용 대시보드, ML 기반 맞춤 추천  
- Enterprise Features: FHIR API 연동, 글로벌 다국어 지원  
- Compliance & Auditing: 정기 보안 감사, IRB 협력 연구 결과 반영  
- Timeline: 24주

## 6. Risk Assessment & Mitigation Strategies

### Technical Risk Analysis
- 기술 위험: Supabase 확장 한계 → 사전 부하 테스트, 파티셔닝 설계  
- 성능 위험: P95 응답 지연 → 캐시·CDN, API Rate Limit 모니터링  
- 보안 위험: JWT 탈취·XSS → HTTPS, CSP, HttpOnly 쿠키 적용  
- 통합 위험: FCM·External API 장애 → 재시도 로직, Circuit Breaker 패턴  
- Mitigation Strategies: 자동화된 부하·보안 테스트, 장애 전파 알림 체계 구축  

### Project Delivery Risks
- 일정 위험: 기능 지연 → 스코프 우선순위 조정, 스프린트 단위 리뷰  
- 자원 위험: 전문인력 부족 → 외부 컨설팅, 크로스 트레이닝  
- 품질 위험: 테스트 커버리지 부족 → 자동화 테스트(유닛·E2E) 필수화  
- 배포 위험: 환경 불일치 → IaC(Terraform)로 인프라 관리, 스테이징 프로세스  
- Contingency Plans: 기능 분할 배포(Feature Flag), 외부 BaaS 대체 옵션 검토  

---  
**끝**