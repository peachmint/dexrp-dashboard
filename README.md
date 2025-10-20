# DexRP 대시보드

DexRP 추천 코드별 거래 통계를 확인할 수 있는 웹 대시보드입니다.

## 주요 기능

- 📊 **추천 코드별 통계**: 각 코드별 총 거래 금액과 구매자 수 확인
- 🔍 **실시간 검색**: 이름이나 금액으로 데이터 필터링
- ↕️ **정렬 기능**: 컬럼 클릭으로 오름차순/내림차순 정렬
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- ⚡ **빠른 성능**: 서버사이드 캐싱과 클라이언트 최적화

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **API**: Next.js API Routes
- **Deployment**: Vercel

## 시작하기

### 개발 환경 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 테스트 실행

```bash
npm test
```

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
dexrp-dashboard/
├── app/
│   ├── api/data/route.ts    # API 엔드포인트
│   └── page.tsx             # 메인 페이지
├── components/
│   ├── DataTable.tsx        # 데이터 테이블 컴포넌트
│   └── SearchBar.tsx        # 검색 컴포넌트
├── lib/
│   ├── api-client.ts        # API 클라이언트
│   ├── aggregator.ts        # 데이터 집계 로직
│   └── types.ts             # TypeScript 타입 정의
├── data/
│   └── codes.json           # 추천 코드 목록
└── __tests__/               # 테스트 파일
```

## API

### GET /api/data

모든 추천 코드의 거래 데이터를 집계하여 반환합니다.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "갱생코인",
      "totalAmount": 10394.15,
      "purchaserCount": 2
    }
  ],
  "totalCodes": 51,
  "totalTransactions": 1234
}
```

## 데이터 새로고침

이 대시보드는 성능을 위해 캐시된 데이터를 사용합니다. 최신 데이터를 가져오려면:

### 로컬 개발 환경

```bash
# 모든 코드의 최신 데이터 수집 (시간이 걸릴 수 있음)
npm run refresh-cache

# 개발 서버 재시작
npm run dev
```

### 캐시 동작 방식

- **빠른 로딩**: 캐시된 데이터로 즉시 표시
- **배치 처리**: 10개씩 묶어서 API 호출하여 서버 부하 방지
- **타임아웃 처리**: 느린 API는 자동으로 건너뜀
- **마지막 업데이트**: 데이터 수집 시간 표시

### 프로덕션 환경

프로덕션에서는 주기적으로 캐시를 업데이트하는 것을 권장합니다:

```bash
# 크론잡 또는 스케줄러로 실행
*/30 * * * * cd /path/to/project && npm run refresh-cache
```

## 배포

이 프로젝트는 Vercel에 자동 배포 설정이 되어 있습니다.

1. GitHub 저장소에 푸시
2. Vercel이 자동으로 빌드 및 배포
3. 배포 URL에서 확인

## TDD 개발 방식

이 프로젝트는 Test-Driven Development(TDD) 방식으로 개발되었습니다:

1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 및 정리

모든 핵심 로직에 대한 테스트가 포함되어 있습니다.
