# Plan: MVP v1.0 - 뜨개 도안 에디터

## Executive Summary

| 항목 | 내용 |
|:---|:---|
| **Feature** | MVP v1.0 - 뜨개질/코바늘 도안 제작 에디터 |
| **Plan 작성일** | 2026-03-10 |
| **예상 기간** | 6~8주 |

| 관점 | 내용 |
|:---|:---|
| **Problem** | 전문 뜨개 디자이너들이 일러스트레이터/엑셀로 기호를 하나씩 배치하고, 서술형 도안을 별도로 타이핑하는 이중 작업에 극심한 시간을 소비 |
| **Solution** | 그리드 기반 드래그&드롭 캔버스 에디터 + 차트→서술형 실시간 자동 변환 + PDF 내보내기를 하나의 웹 툴로 통합 |
| **Function UX Effect** | 기호를 드래그하면 그리드에 스냅 배치되고, 우측 패널에서 서술형 텍스트가 즉시 연동되며, 완성된 도안을 PDF로 즉시 다운로드 |
| **Core Value** | 도안 제작 시간을 절반 이하로 단축하고, 차트-서술형 불일치 오류를 원천 제거 |

---

## 1. User Intent Discovery

### 1.1 Core Problem
기존 범용 툴(일러스트레이터, 엑셀)로 뜨개 도안을 제작할 때 발생하는 **비효율적인 반복 작업**과 **이중 작업(차트+서술형)** 문제를 해결하는 전용 에디터 구축.

### 1.2 Target Users
- 전문 니트 디자이너 / 유료 도안 판매자 (Ravelry, Etsy, 스마트스토어)
- 뜨개/코바늘 공방 운영자 및 클래스 강사
- 창작 도안을 문서화하려는 취미/아마추어 크리에이터

### 1.3 Success Criteria
| 기준 | 측정 방법 |
|:---|:---|
| 기호 배치 시 그리드 자동 스냅 | 기호 드래그 후 그리드 셀에 정확히 정렬됨 |
| 서술형 텍스트 실시간 연동 | 기호 배치/삭제 즉시 우측 패널 텍스트 업데이트 |
| PDF 내보내기 정상 동작 | 차트 이미지 + 서술형 텍스트가 PDF로 출력 |

---

## 2. Alternatives Explored

### Approach A: React-Konva + Zustand -- Selected
- **장점:** 드래그/스냅/히트테스트 내장, React 선언적 렌더링, Zustand로 Undo/Redo 간결 구현, 커뮤니티 풍부
- **단점:** 복잡한 객체 조작(회전, 그룹화) 직접 구현 필요, 대량 노드(500+) 시 성능 튜닝 필요
- **선택 사유:** 그리드 기반 심볼 배치 에디터에 가장 적합. PRD 권장 스택과 일치.

### Approach B: Fabric.js + React -- Rejected
- **장점:** 객체 선택/회전/스케일/그룹화 내장, SVG import/export 지원
- **단점:** React 통합 비자연스러움(wrapper 필요), 그리드 스냅 직접 구현 필요
- **불채택 사유:** 뜨개 도안은 자유형 드로잉보다 그리드 정렬이 핵심. Konva의 스냅 기능이 더 적합.

### Approach C: Excalidraw Fork -- Rejected
- **장점:** 캔버스/줌/단축키/내보내기 이미 구현됨, 빠른 프로토타입 가능
- **단점:** 그리드 스냅 + 뜨개 기호 시스템에 맞게 대폭 수정 필요, Fork 유지보수 부담
- **불채택 사유:** 커스터마이징 범위가 너무 넓어 직접 구현보다 오히려 비효율적.

---

## 3. YAGNI Review

### MVP 포함 (In Scope)
| 기능 | 사유 |
|:---|:---|
| 그리드 캔버스 + 드래그&드롭 + 스냅 | 핵심 에디터 경험 - 최우선 |
| 기본 기호 라이브러리 (코바늘+대바늘) | 에디터의 콘텐츠 - 기호 없이 에디터 무용 |
| 차트→서술형 자동 변환 | 최대 차별화 포인트, 경쟁사 미지원 |
| PDF 내보내기 | 도안 활용/판매를 위한 필수 출력 기능 |
| 회원가입/로그인 (Supabase Auth) | 데이터 저장의 전제 조건 |
| 버전 히스토리 | 도안 복원력 확보, 사용자 안심 |
| 클라우드 저장/불러오기 | 버전 히스토리의 전제 인프라 (암묵적 포함) |

### Out of Scope (Deferred)
| 기능 | 사유 |
|:---|:---|
| 랜딩 페이지 | 별도 마일스톤으로 분리 (Step 4) |
| 패턴 반복(Repeat) 박스 | Phase 2 프리미엄 기능 |
| 커스텀 기호 업로드 | Phase 2 + SVG 보안 설계 필요 |
| 사이즈 그레이딩 계산기 | Phase 2 프리미엄 기능 |
| 다국어 번역 | Phase 2 글로벌화 |
| 다이내믹 워터마킹 | Phase 2 보안 & 판매 |
| 실시간 협업 | 장기 로드맵 |
| 오프라인 모드 | 장기 로드맵 |

---

## 4. Architecture

### 4.1 Tech Stack
| 영역 | 기술 | 사유 |
|:---|:---|:---|
| 프레임워크 | Next.js (App Router) + TypeScript | SEO 최적화 + 타입 안정성 |
| 캔버스 엔진 | React-Konva (Konva.js) | 드래그/스냅/이벤트 처리 최적화 |
| 상태관리 | Zustand | 경량, Undo/Redo 미들웨어 간결 |
| 스타일링 | Tailwind CSS | 빠른 UI 개발 |
| 인증 & DB | Supabase (Auth + PostgreSQL) | BaaS, RLS, JSONB 지원 |
| PDF 생성 | jsPDF + html2canvas | 클라이언트사이드 렌더링 (SSRF 방지) |
| 모니터링 | Sentry | 에러 트래킹 |
| 배포 | Vercel | Next.js 네이티브 지원 |

### 4.2 전체 아키텍처

```
┌─────────────────────────────────────────────┐
│  Next.js App Router (Vercel)                │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  도안 에디터 페이지 (/editor/[id])    │  │
│  │                                       │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Left    │ │ Canvas   │ │ Right  │ │  │
│  │  │ Sidebar │ │ (Konva)  │ │ Panel  │ │  │
│  │  │ 기호    │ │ 그리드   │ │ 서술형 │ │  │
│  │  │ 라이브  │ │ 에디터   │ │ 뷰어   │ │  │
│  │  └─────────┘ └──────────┘ └────────┘ │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────┐                      │
│  │ Zustand Store     │  ← 캔버스 상태 중앙  │
│  │ - symbols[]       │  ← 배치된 기호 배열   │
│  │ - gridConfig      │  ← 그리드 설정       │
│  │ - history[]       │  ← Undo/Redo 스택    │
│  │ - writtenView     │  ← 서술형 파생 데이터 │
│  └───────────────────┘                      │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  Supabase                                   │
│  ┌─────────────┐  ┌────────────────────┐   │
│  │ Auth         │  │ PostgreSQL (RLS)   │   │
│  │ Google/Email │  │ projects (JSONB)   │   │
│  └─────────────┘  │ versions (snapshot) │   │
│                    └────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 4.3 모듈 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 로그인/회원가입
│   ├── dashboard/          # 대시보드 (프로젝트 목록)
│   └── editor/[id]/        # 도안 에디터
│
├── components/
│   ├── editor/             # 에디터 UI 컴포넌트
│   │   ├── Canvas.tsx      # React-Konva 캔버스 (드래그/스냅)
│   │   ├── TopBar.tsx      # 제목, Undo/Redo, 내보내기
│   │   ├── SymbolPanel.tsx # 좌측 기호 라이브러리
│   │   ├── WrittenView.tsx # 우측 서술형 뷰어
│   │   └── GridOverlay.tsx # 그리드 눈금자/오버레이
│   └── ui/                 # 공용 UI 컴포넌트
│
├── stores/
│   ├── useEditorStore.ts   # 캔버스 상태 (symbols, grid, history)
│   └── useAuthStore.ts     # 인증 상태
│
├── lib/
│   ├── symbols/            # 기호 정의 데이터
│   │   ├── crochet.ts      # 코바늘 기호 (짧은뜨기 등)
│   │   └── knitting.ts     # 대바늘 기호
│   ├── written/            # 차트→서술형 변환 엔진
│   │   └── converter.ts    # 기호 배열 → 텍스트 변환 로직
│   ├── export/             # PDF 내보내기
│   │   └── pdf.ts          # jsPDF + html2canvas
│   └── supabase/           # Supabase 클라이언트
│       ├── client.ts
│       └── projects.ts     # 도안 CRUD + 버전 관리
│
└── types/
    ├── symbol.ts           # 기호 타입 정의
    ├── project.ts          # 프로젝트/도안 타입
    └── grid.ts             # 그리드 설정 타입
```

### 4.4 핵심 타입 정의

```typescript
// types/symbol.ts
interface SymbolDefinition {
  id: string              // "sc", "dc", "ch" 등
  name: string            // "짧은뜨기", "긴뜨기", "사슬뜨기"
  abbreviation: string    // 약어 (서술형 변환용)
  category: "crochet" | "knitting"
  svgPath: string         // 기호 렌더링용 SVG path
  width: number           // 그리드 셀 차지 너비
  height: number          // 그리드 셀 차지 높이
}

// types/symbol.ts
interface PlacedSymbol {
  id: string              // 고유 인스턴스 ID (uuid)
  symbolId: string        // 기호 종류 참조 (SymbolDefinition.id)
  row: number             // 단수 (Y축)
  col: number             // 코수 (X축)
  rotation: number        // 회전각 (0, 90, 180, 270)
}

// types/project.ts
interface Project {
  id: string
  userId: string
  title: string
  gridConfig: GridConfig
  symbols: PlacedSymbol[]
  createdAt: string
  updatedAt: string
}

// types/grid.ts
interface GridConfig {
  rows: number            // 총 단수
  cols: number            // 총 코수
  cellSize: number        // 셀 크기 (px)
  showRowNumbers: boolean
  showColNumbers: boolean
}
```

---

## 5. Data Flow

### 5.1 기호 배치 흐름
```
SymbolPanel (드래그 시작)
    │
    ▼
Canvas (onDrop 이벤트)
    │  └─ 그리드 좌표 계산 (snapToGrid)
    ▼
useEditorStore.addSymbol({ row, col, symbolId })
    │
    ├─▼ Canvas 리렌더링 (새 기호 표시)
    ├─▼ WrittenView 업데이트 (서술형 재계산)
    └─▼ History 스택 push (Undo 가능)
```

### 5.2 서술형 변환 흐름
```
useEditorStore.symbols[] 변경 감지
    │
    ▼
converter.toWritten(symbols, gridConfig)
    │  └─ 단수(row)별 그룹화
    │  └─ 기호 약어 매핑 (sc=짧은뜨기)
    │  └─ 연속 반복 계산 ("짧은뜨기 5" 등)
    ▼
WrittenView 렌더링
    └─ "1단: 짧은뜨기 5, 긴뜨기 3"
    └─ "2단: 사슬뜨기 2, 짧은뜨기 8"
```

### 5.3 저장/복원 흐름
```
[자동 저장] debounce 3초 후 트리거
    │
    ▼
useEditorStore → serialize()
    │  └─ { symbols, gridConfig, title }
    ▼
Supabase projects table (JSONB)
    │  └─ upsert with user_id (RLS)
    ▼
[버전 히스토리] 수동 저장 시
    └─ versions table에 스냅샷 insert
```

### 5.4 PDF 내보내기 흐름
```
TopBar [내보내기] 버튼 클릭
    │
    ├─ html2canvas(캔버스 영역) → 이미지
    ├─ 서술형 텍스트 수집
    ▼
jsPDF로 페이지 구성
    │  └─ 1페이지: 차트 이미지
    │  └─ 2페이지: 서술형 텍스트
    ▼
브라우저 다운로드 (.pdf)
```

---

## 6. Implementation Milestones

### Sprint 1: 프로젝트 초기화 + 캔버스 POC (1~2주)
- [ ] Next.js + TypeScript + Tailwind CSS 프로젝트 셋업
- [ ] React-Konva 캔버스 기본 렌더링
- [ ] 그리드 오버레이 구현 (눈금자, 셀 표시)
- [ ] 5개 기초 코바늘 기호 SVG 제작 및 렌더링 테스트
- [ ] 기호 드래그&드롭 + 그리드 스냅 구현

### Sprint 2: 에디터 핵심 기능 (2주)
- [ ] Zustand 에디터 스토어 구현 (symbols, gridConfig, history)
- [ ] 좌측 기호 라이브러리 패널 (SymbolPanel)
- [ ] 기호 다중 선택, 복사, 붙여넣기, 삭제
- [ ] Undo/Redo 구현 (Zustand 미들웨어)
- [ ] 상단 바 (TopBar) - 제목, Undo/Redo 버튼
- [ ] 키보드 단축키 바인딩

### Sprint 3: 서술형 변환 + PDF (1~2주)
- [ ] 차트→서술형 변환 엔진 (converter.ts)
- [ ] 우측 서술형 뷰어 (WrittenView) 실시간 연동
- [ ] PDF 내보내기 기능 (jsPDF + html2canvas)
- [ ] 내보내기 모달 UI

### Sprint 4: 인증 + 데이터 저장 (1~2주)
- [ ] Supabase 프로젝트 셋업 (Auth + DB)
- [ ] 회원가입/로그인 UI (Google + 이메일)
- [ ] RLS 정책 설정 (사용자별 데이터 격리)
- [ ] 도안 CRUD (projects 테이블, JSONB)
- [ ] 자동 저장 (debounce 3초)
- [ ] 대시보드 (프로젝트 목록, 생성, 삭제)

### Sprint 5: 버전 히스토리 + 안정화 (1주)
- [ ] 버전 히스토리 테이블 및 스냅샷 저장
- [ ] 버전 목록 조회 및 복원 UI
- [ ] Sentry 에러 모니터링 연동
- [ ] 보안 헤더 설정 (CSP 등)
- [ ] 전체 QA 및 버그 수정

---

## 7. Security Considerations

| 영역 | 대응 |
|:---|:---|
| 인증 | Supabase Auth (JWT Access 1h + Refresh 7d) |
| 데이터 격리 | RLS 정책 - 사용자는 자신의 도안만 접근 |
| API 보호 | Rate Limiting (분당 60회) |
| 전송 암호화 | HTTPS (TLS 1.2+) |
| PDF 보안 | 클라이언트사이드 렌더링으로 SSRF 차단 |
| 에러 처리 | 네트워크 끊김 감지 + 로컬 임시 저장 + 재시도 큐 |
| 보안 헤더 | CSP, X-Frame-Options 등 Next.js 미들웨어 설정 |

---

## 8. Brainstorming Log

| Phase | 질문 | 결정 |
|:---|:---|:---|
| Phase 1-Q1 | 계획 범위 | MVP 전체 (단일 Plan) |
| Phase 1-Q2 | 핵심 가치 | 캔버스 에디터 최우선 |
| Phase 1-Q3 | 성공 기준 | 그리드 스냅 + 서술형 연동 + PDF 내보내기 |
| Phase 2 | 아키텍처 선택 | React-Konva + Zustand (Approach A) |
| Phase 3 | YAGNI 검토 | 랜딩페이지 제외, 클라우드 저장은 버전 히스토리 전제로 포함 |
| Phase 4-1 | 아키텍처 검증 | 3-패널 레이아웃 + Zustand 중앙 상태 승인 |
| Phase 4-2 | 모듈 구조 검증 | src/ 하위 app/components/stores/lib/types 구조 승인 |
| Phase 4-3 | 데이터 흐름 검증 | 기호 배치→서술형 변환→저장→PDF 4개 흐름 승인 |
