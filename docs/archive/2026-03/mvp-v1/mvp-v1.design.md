# MVP v1.0 Design Document

> **Summary**: 뜨개질/코바늘 도안 제작 웹 에디터 MVP 상세 설계
>
> **Project**: KnitCanvas (가칭)
> **Version**: 1.0.0
> **Date**: 2026-03-10
> **Status**: Draft
> **Planning Doc**: [mvp-v1.plan.md](../01-plan/features/mvp-v1.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **그리드 기반 캔버스 에디터** — React-Konva로 기호를 드래그&드롭하고 그리드에 자동 스냅되는 직관적 편집 경험
2. **실시간 서술형 변환** — 기호 배치와 동시에 우측 패널에 서술형 텍스트가 자동 생성
3. **원클릭 PDF 내보내기** — 차트 이미지 + 서술형 텍스트를 깔끔한 PDF로 즉시 다운로드
4. **클라우드 저장 + 버전 관리** — Supabase 기반 자동 저장과 스냅샷 복원

### 1.2 Design Principles

- **단일 상태 소스 (Single Source of Truth)**: Zustand Store가 캔버스의 모든 상태를 중앙 관리. 서술형 뷰는 파생 데이터.
- **그리드 우선 (Grid-First)**: 모든 기호는 그리드 셀 단위로만 배치 가능. 자유 배치 없음.
- **클라이언트 우선 렌더링**: PDF 생성, 서술형 변환 모두 클라이언트에서 처리 (서버 부하 없음, SSRF 차단).
- **점진적 로딩**: 기호 라이브러리와 에디터 컴포넌트는 dynamic import로 코드 스플리팅.

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│  Next.js App Router (Vercel)                             │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  /editor/[id]                                       │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ TopBar                                       │   │ │
│  │  │ [제목] [Undo] [Redo] [저장상태] [내보내기]   │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  │  ┌────────────┬───────────────────┬─────────────┐   │ │
│  │  │SymbolPanel │    Canvas         │ RightPanel   │   │ │
│  │  │            │    (React-Konva)  │              │   │ │
│  │  │ [검색]     │    ┌───┬───┬───┐  │ [속성편집]   │   │ │
│  │  │ [코바늘]   │    │ X │ X │ T │  │              │   │ │
│  │  │  - 짧은뜨기│    ├───┼───┼───┤  │ [서술형뷰어] │   │ │
│  │  │  - 긴뜨기  │    │ T │   │ X │  │ 1단: 짧은..  │   │ │
│  │  │  - 사슬뜨기│    ├───┼───┼───┤  │ 2단: 긴뜨..  │   │ │
│  │  │ [대바늘]   │    │   │ X │ T │  │              │   │ │
│  │  │  - 겉뜨기  │    └───┴───┴───┘  │              │   │ │
│  │  │  - 안뜨기  │   [눈금자/줌]     │              │   │ │
│  │  └────────────┴───────────────────┴─────────────┘   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────┐   ┌──────────────────────────┐   │
│  │ useEditorStore     │   │ useAuthStore              │   │
│  │ (Zustand)          │   │ (Zustand)                 │   │
│  └────────┬───────────┘   └──────────┬───────────────┘   │
│           │                          │                    │
└───────────┼──────────────────────────┼────────────────────┘
            │                          │
            ▼                          ▼
┌──────────────────────────────────────────────────────────┐
│  Supabase                                                │
│  ┌────────────┐  ┌─────────────────────────────────────┐ │
│  │ Auth       │  │ PostgreSQL                          │ │
│  │ Google     │  │ ┌───────────┐ ┌──────────────────┐  │ │
│  │ Email/PW   │  │ │ profiles  │ │ projects (JSONB) │  │ │
│  └────────────┘  │ └───────────┘ └──────────────────┘  │ │
│                  │ ┌──────────────────┐                 │ │
│                  │ │ project_versions │                 │ │
│                  │ └──────────────────┘                 │ │
│                  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[기호 배치]
SymbolPanel(drag) → Canvas(drop + snapToGrid) → Store.addSymbol()
    → Canvas 리렌더 + WrittenView 재계산 + History push

[자동 저장]
Store 변경 → debounce(3s) → Supabase upsert (RLS)

[PDF 내보내기]
TopBar 클릭 → html2canvas(Canvas) + WrittenView 텍스트 → jsPDF → download
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|:---|:---|:---|
| Canvas | useEditorStore, react-konva | 기호 렌더링 및 드래그&드롭 |
| SymbolPanel | lib/symbols/* | 기호 목록 데이터 제공 |
| WrittenView | useEditorStore, lib/written/converter | 서술형 텍스트 파생 |
| TopBar | useEditorStore, lib/export/pdf | Undo/Redo, 내보내기 |
| Dashboard | useAuthStore, lib/supabase/projects | 프로젝트 CRUD |

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
// types/symbol.ts
interface SymbolDefinition {
  id: string                           // "ch", "sc", "dc", "hdc", "tr"
  name: string                         // "사슬뜨기", "짧은뜨기", "긴뜨기"
  nameEn: string                       // "chain", "single crochet", "double crochet"
  abbreviation: string                 // "ch", "sc", "dc" (서술형 변환용)
  category: "crochet" | "knitting"
  svgPath: string                      // 기호 렌더링용 SVG path data
  width: number                        // 그리드 셀 차지 너비 (기본 1)
  height: number                       // 그리드 셀 차지 높이 (기본 1)
}

interface PlacedSymbol {
  id: string                           // uuid (인스턴스 고유 ID)
  symbolId: string                     // SymbolDefinition.id 참조
  row: number                          // 단수 (Y축, 0-based)
  col: number                          // 코수 (X축, 0-based)
  rotation: number                     // 회전각 (0 | 90 | 180 | 270)
}

// types/project.ts
interface Project {
  id: string                           // uuid
  user_id: string                      // Supabase Auth user ID
  title: string                        // 도안 제목
  grid_config: GridConfig
  symbols: PlacedSymbol[]              // JSONB 저장
  created_at: string                   // ISO 8601
  updated_at: string                   // ISO 8601
}

interface ProjectVersion {
  id: string                           // uuid
  project_id: string                   // Project.id 참조
  snapshot: {                          // 스냅샷 데이터
    grid_config: GridConfig
    symbols: PlacedSymbol[]
  }
  label: string                        // 사용자 지정 버전 이름 (선택)
  created_at: string
}

// types/grid.ts
interface GridConfig {
  rows: number                         // 총 단수 (기본 20)
  cols: number                         // 총 코수 (기본 20)
  cellSize: number                     // 셀 크기 px (기본 30)
  showRowNumbers: boolean              // 단수 눈금자 표시
  showColNumbers: boolean              // 코수 눈금자 표시
}
```

### 3.2 Entity Relationships

```
[User (Supabase Auth)]
   │
   └── 1 ──── N [Project]
                   │
                   └── 1 ──── N [ProjectVersion]
```

### 3.3 Database Schema

```sql
-- profiles: Supabase Auth 사용자 추가 정보
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- projects: 도안 프로젝트
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '새 도안',
  grid_config JSONB NOT NULL DEFAULT '{"rows":20,"cols":20,"cellSize":30,"showRowNumbers":true,"showColNumbers":true}',
  symbols JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- project_versions: 버전 히스토리 스냅샷
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  label TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 프로필만 조회/수정
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- projects: 본인 도안만 CRUD
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

-- project_versions: 본인 프로젝트의 버전만 접근
CREATE POLICY "Users can view own project versions"
  ON project_versions FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own project versions"
  ON project_versions FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 인덱스
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. API Specification

Supabase 클라이언트 SDK를 사용한 직접 DB 접근 (별도 API 서버 없음).

### 4.1 Supabase Client Operations

| Operation | Method | Description | Auth |
|:---|:---|:---|:---|
| 프로젝트 목록 조회 | `supabase.from('projects').select()` | 본인 프로젝트 목록 (RLS) | Required |
| 프로젝트 생성 | `supabase.from('projects').insert()` | 새 도안 생성 | Required |
| 프로젝트 저장 (자동) | `supabase.from('projects').update()` | symbols/gridConfig 업데이트 | Required |
| 프로젝트 삭제 | `supabase.from('projects').delete()` | 도안 삭제 (cascade: versions) | Required |
| 버전 스냅샷 생성 | `supabase.from('project_versions').insert()` | 현재 상태 스냅샷 저장 | Required |
| 버전 목록 조회 | `supabase.from('project_versions').select()` | 프로젝트별 버전 목록 | Required |
| 버전 복원 | `supabase.from('projects').update()` | 스냅샷 데이터로 복원 | Required |

### 4.2 Supabase Client 구현 상세

```typescript
// lib/supabase/projects.ts

// 프로젝트 목록 조회 (대시보드)
async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })
  return { data, error }
}

// 프로젝트 생성
async function createProject(title: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: (await supabase.auth.getUser()).data.user?.id, title })
    .select()
    .single()
  return { data, error }
}

// 프로젝트 자동 저장 (debounce 3초)
async function saveProject(id: string, symbols: PlacedSymbol[], gridConfig: GridConfig) {
  const { error } = await supabase
    .from('projects')
    .update({ symbols, grid_config: gridConfig })
    .eq('id', id)
  return { error }
}

// 프로젝트 상세 조회 (에디터 진입)
async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

// 버전 스냅샷 저장
async function createVersion(projectId: string, snapshot: object, label?: string) {
  const { error } = await supabase
    .from('project_versions')
    .insert({ project_id: projectId, snapshot, label: label || '' })
  return { error }
}

// 버전 목록 조회
async function getVersions(projectId: string) {
  const { data, error } = await supabase
    .from('project_versions')
    .select('id, label, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  return { data, error }
}
```

---

## 5. UI/UX Design

### 5.1 Screen Layout — 에디터

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar                                                        │
│ [← 대시보드]  [도안 제목 (editable)]  [●저장됨]  [↶][↷] [PDF]│
├──────────┬─────────────────────────────────┬─────────────────┤
│SymbolPanel│         Canvas (Konva)          │   RightPanel    │
│ w:240px  │        flex: 1                  │    w:280px      │
│          │                                  │                 │
│ [🔍검색]  │   ┌──┬──┬──┬──┬──┬──┬──┬──┐    │ ▼ 속성 편집     │
│          │   │  │  │  │  │  │  │  │  │    │  회전: [0°▼]    │
│ ▼ 코바늘  │   ├──┼──┼──┼──┼──┼──┼──┼──┤    │  삭제: [🗑]     │
│  ○ 사슬   │   │  │SC│SC│  │  │DC│  │  │    │                 │
│  X 짧은뜨기│   ├──┼──┼──┼──┼──┼──┼──┼──┤    │ ─────────────── │
│  T 긴뜨기  │   │  │  │  │SC│SC│  │  │  │    │ ▼ 서술형 뷰어   │
│  Y 한길긴  │   ├──┼──┼──┼──┼──┼──┼──┼──┤    │                 │
│  ⌒ 팝콘   │   │  │  │  │  │  │  │  │  │    │ 1단: 짧은뜨기 2,│
│          │   └──┴──┴──┴──┴──┴──┴──┴──┘    │  긴뜨기 1       │
│ ▼ 대바늘  │         [- 줌 75% +]           │ 2단: 짧은뜨기 2 │
│  | 겉뜨기  │                                │                 │
│  - 안뜨기  │                                │                 │
├──────────┴─────────────────────────────────┴─────────────────┤
│ StatusBar: 그리드 20x20 | 기호 12개 | 줌 100%                 │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Screen Layout — 대시보드

```
┌──────────────────────────────────────────────────────────────┐
│ Header: [KnitCanvas 로고]              [프로필▼] [로그아웃]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  내 도안                                    [+ 새 도안 만들기]│
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │              │ │              │ │              │         │
│  │   도안 1     │ │   도안 2     │ │   도안 3     │         │
│  │   썸네일     │ │   썸네일     │ │   썸네일     │         │
│  │              │ │              │ │              │         │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤         │
│  │ 귀여운 곰    │ │ 여름 숄     │ │ 그래니 스퀘어│         │
│  │ 3일 전 수정  │ │ 1주 전 수정  │ │ 2주 전 수정  │         │
│  │        [⋮]  │ │        [⋮]  │ │        [⋮]  │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 User Flow

```
[비로그인]                [로그인 후]
Landing → Login ──→ Dashboard ──→ [+ 새 도안] ──→ Editor
                        │                            │
                        ├── 기존 도안 클릭 ──────────┘
                        └── 도안 삭제 (⋮ 메뉴)

[에디터 내부]
기호 드래그 → 캔버스 드롭 → 그리드 스냅
                              │
                    ├─ 서술형 뷰어 자동 업데이트
                    ├─ Undo/Redo 가능
                    └─ 자동 저장 (3초 debounce)

기호 클릭 → 속성 편집 (우측 패널) → 회전/삭제

[내보내기] 버튼 → PDF 다운로드 모달 → 다운로드

[버전] 버튼 → 버전 목록 → 복원/새 버전 저장
```

### 5.4 Component List

| Component | Location | Responsibility |
|:---|:---|:---|
| `EditorLayout` | `components/editor/EditorLayout.tsx` | 에디터 3-패널 레이아웃 컨테이너 |
| `TopBar` | `components/editor/TopBar.tsx` | 제목 편집, Undo/Redo, 저장 상태, 내보내기 버튼 |
| `SymbolPanel` | `components/editor/SymbolPanel.tsx` | 기호 라이브러리 (검색, 카테고리별 목록) |
| `Canvas` | `components/editor/Canvas.tsx` | React-Konva 캔버스 (그리드, 기호 렌더링, 드래그&드롭) |
| `GridOverlay` | `components/editor/GridOverlay.tsx` | 그리드 라인, 눈금자 (단수/코수) |
| `SymbolRenderer` | `components/editor/SymbolRenderer.tsx` | 개별 기호 Konva 노드 (드래그, 선택, 회전) |
| `RightPanel` | `components/editor/RightPanel.tsx` | 속성 편집기 + 서술형 뷰어 컨테이너 |
| `PropertyEditor` | `components/editor/PropertyEditor.tsx` | 선택된 기호 속성 편집 (회전, 삭제) |
| `WrittenView` | `components/editor/WrittenView.tsx` | 서술형 텍스트 실시간 출력 |
| `ExportModal` | `components/editor/ExportModal.tsx` | PDF 내보내기 설정 및 다운로드 |
| `VersionPanel` | `components/editor/VersionPanel.tsx` | 버전 히스토리 목록 및 복원 |
| `DashboardPage` | `app/dashboard/page.tsx` | 프로젝트 목록, 생성, 삭제 |
| `ProjectCard` | `components/dashboard/ProjectCard.tsx` | 개별 프로젝트 카드 (썸네일, 제목, 날짜) |
| `LoginPage` | `app/(auth)/login/page.tsx` | 로그인 UI (Google + 이메일) |
| `SignupPage` | `app/(auth)/signup/page.tsx` | 회원가입 UI |

---

## 6. Core Logic Design

### 6.1 Zustand Editor Store

```typescript
// stores/useEditorStore.ts
interface EditorState {
  // State
  projectId: string | null
  title: string
  gridConfig: GridConfig
  symbols: PlacedSymbol[]
  selectedIds: string[]          // 선택된 기호 ID 목록
  past: PlacedSymbol[][]         // Undo 스택
  future: PlacedSymbol[][]       // Redo 스택
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error'
  zoom: number                   // 줌 레벨 (0.25 ~ 4.0, 기본 1.0)

  // Actions
  addSymbol: (symbol: Omit<PlacedSymbol, 'id'>) => void
  removeSymbols: (ids: string[]) => void
  moveSymbol: (id: string, row: number, col: number) => void
  rotateSymbol: (id: string) => void
  selectSymbols: (ids: string[]) => void
  copySelected: () => void
  pasteSymbols: () => void
  undo: () => void
  redo: () => void
  setTitle: (title: string) => void
  setGridConfig: (config: Partial<GridConfig>) => void
  setZoom: (zoom: number) => void
  loadProject: (project: Project) => void
  clear: () => void
}
```

### 6.2 Grid Snap Logic

```typescript
// lib/grid/snap.ts

/**
 * 캔버스 픽셀 좌표를 그리드 셀 좌표로 변환
 * @param pixelX 캔버스 X 픽셀 좌표
 * @param pixelY 캔버스 Y 픽셀 좌표
 * @param cellSize 셀 크기 (px)
 * @returns { row, col } 그리드 좌표
 */
function snapToGrid(pixelX: number, pixelY: number, cellSize: number): { row: number; col: number } {
  return {
    col: Math.round(pixelX / cellSize),
    row: Math.round(pixelY / cellSize),
  }
}

/**
 * 그리드 셀 좌표를 캔버스 픽셀 좌표로 변환
 */
function gridToPixel(row: number, col: number, cellSize: number): { x: number; y: number } {
  return {
    x: col * cellSize,
    y: row * cellSize,
  }
}
```

### 6.3 Written Pattern Converter

```typescript
// lib/written/converter.ts

interface WrittenRow {
  rowNumber: number
  instructions: string     // "짧은뜨기 5, 긴뜨기 3"
}

/**
 * 배치된 기호 배열을 서술형 도안 텍스트로 변환
 *
 * 알고리즘:
 * 1. symbols를 row별로 그룹화
 * 2. 각 row 내에서 col 오름차순 정렬
 * 3. 연속 동일 기호를 "기호명 N" 형태로 축약
 * 4. 쉼표로 연결
 */
function toWritten(symbols: PlacedSymbol[], gridConfig: GridConfig): WrittenRow[] {
  // 1. row별 그룹화
  const rowGroups = groupBy(symbols, 'row')

  // 2. 각 row 처리
  return Object.entries(rowGroups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([row, rowSymbols]) => {
      // col 오름차순 정렬
      const sorted = rowSymbols.sort((a, b) => a.col - b.col)

      // 3. 연속 동일 기호 축약 (Run-Length Encoding)
      const runs = runLengthEncode(sorted)

      // 4. 텍스트 조합
      const instructions = runs
        .map(({ symbolId, count }) => {
          const def = getSymbolDefinition(symbolId)
          return count > 1 ? `${def.name} ${count}` : def.name
        })
        .join(', ')

      return { rowNumber: Number(row) + 1, instructions }
    })
}
```

### 6.4 PDF Export

```typescript
// lib/export/pdf.ts

/**
 * 에디터 상태를 PDF로 내보내기
 *
 * 구성:
 * - 1페이지: 차트 이미지 (캔버스 캡처)
 * - 2페이지: 서술형 텍스트
 * - 헤더: 도안 제목, 생성일
 */
async function exportToPdf(
  canvasElement: HTMLDivElement,
  writtenRows: WrittenRow[],
  title: string
): Promise<void> {
  const canvas = await html2canvas(canvasElement, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()

  // 헤더
  pdf.setFontSize(18)
  pdf.text(title, pageWidth / 2, 15, { align: 'center' })

  // 1페이지: 차트 이미지
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight)

  // 2페이지: 서술형 텍스트
  pdf.addPage()
  pdf.setFontSize(14)
  pdf.text('서술형 도안', pageWidth / 2, 15, { align: 'center' })

  pdf.setFontSize(11)
  let y = 30
  for (const row of writtenRows) {
    const line = `${row.rowNumber}단: ${row.instructions}`
    pdf.text(line, 10, y)
    y += 7
    if (y > 280) { pdf.addPage(); y = 15 }
  }

  pdf.save(`${title}.pdf`)
}
```

### 6.5 Auto-Save Logic

```typescript
// hooks/useAutoSave.ts

/**
 * Zustand store 변경 감지 → 3초 debounce → Supabase 저장
 * 저장 상태를 store.saveStatus에 반영
 */
function useAutoSave() {
  const { projectId, symbols, gridConfig, saveStatus } = useEditorStore()
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)

  useEffect(() => {
    if (!projectId) return

    setSaveStatus('unsaved')

    const timer = setTimeout(async () => {
      setSaveStatus('saving')
      const { error } = await saveProject(projectId, symbols, gridConfig)
      setSaveStatus(error ? 'error' : 'saved')
    }, 3000)

    return () => clearTimeout(timer)
  }, [projectId, symbols, gridConfig])
}
```

---

## 7. Symbol Library Data

### 7.1 코바늘 기호 (MVP 기본 세트)

| ID | 이름 | 약어 | 기호 | Width | Height |
|:---|:---|:---|:---|:---|:---|
| `ch` | 사슬뜨기 | ch | ○ | 1 | 1 |
| `sc` | 짧은뜨기 | sc | X (또는 +) | 1 | 1 |
| `hdc` | 중장편뜨기 | hdc | T | 1 | 1 |
| `dc` | 긴뜨기 | dc | T (길게) | 1 | 2 |
| `tr` | 한길긴뜨기 | tr | Y | 1 | 2 |
| `sl_st` | 빼뜨기 | sl st | · | 1 | 1 |
| `inc` | 늘림코 (2코) | inc | V | 1 | 1 |
| `dec` | 줄임코 | dec | A | 1 | 1 |

### 7.2 대바늘 기호 (MVP 기본 세트)

| ID | 이름 | 약어 | 기호 | Width | Height |
|:---|:---|:---|:---|:---|:---|
| `k` | 겉뜨기 | k | \| | 1 | 1 |
| `p` | 안뜨기 | p | - | 1 | 1 |
| `yo` | 감아뜨기 | yo | O | 1 | 1 |
| `k2tog` | 오른코 모아뜨기 | k2tog | / | 1 | 1 |
| `ssk` | 왼코 모아뜨기 | ssk | \\ | 1 | 1 |

---

## 8. Error Handling

### 8.1 Error Scenarios

| Scenario | Cause | User Feedback | Recovery |
|:---|:---|:---|:---|
| 자동 저장 실패 | 네트워크 끊김 | TopBar에 "저장 실패" 배지 + 노란 점 | 3초 후 재시도 (최대 3회), 이후 로컬 임시 저장 |
| 프로젝트 로드 실패 | DB 오류 / 권한 없음 | "도안을 불러올 수 없습니다" 에러 메시지 | 대시보드로 리다이렉트 |
| PDF 생성 실패 | 캔버스 렌더링 에러 | "PDF 생성에 실패했습니다. 다시 시도해주세요" 토스트 | 사용자 재시도 |
| 인증 만료 | JWT 토큰 만료 | 자동 토큰 갱신 (Supabase 내장) | Refresh 실패 시 로그인 페이지로 |
| 그리드 범위 초과 배치 | 기호를 그리드 밖에 드롭 | 드롭 무시 (기호가 원래 위치로 돌아감) | 자동 처리 |
| 동일 셀 중복 배치 | 이미 기호가 있는 셀에 드롭 | 기존 기호를 교체 | 자동 처리 (Undo 가능) |

### 8.2 Offline Detection

```typescript
// hooks/useOnlineStatus.ts
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

---

## 9. Security Considerations

- [x] **RLS 정책**: 모든 테이블에 Row Level Security 적용 (user_id 기반)
- [x] **인증**: Supabase Auth (JWT Access 1h + Refresh 7d)
- [x] **HTTPS**: Vercel 기본 제공 TLS
- [x] **보안 헤더**: Next.js middleware로 CSP, X-Frame-Options, X-Content-Type-Options 설정
- [x] **입력 검증**: 도안 제목 XSS 방지 (DOMPurify 또는 React 기본 이스케이핑)
- [x] **Rate Limiting**: Supabase 기본 제공 + 필요 시 Edge Function으로 추가
- [x] **SSRF 차단**: PDF 생성을 클라이언트사이드에서만 처리
- [x] **에러 모니터링**: Sentry 연동

### Next.js 보안 헤더 설정

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" },
]
```

---

## 10. Test Plan

### 10.1 Test Scope

| Type | Target | Tool |
|:---|:---|:---|
| Unit Test | 서술형 변환 엔진 (converter.ts), 그리드 스냅 로직 | Vitest |
| Component Test | 에디터 컴포넌트 렌더링 | Vitest + Testing Library |
| E2E Test | 기호 배치→서술형 연동→PDF 다운로드 플로우 | Playwright |

### 10.2 Test Cases (Key)

- [ ] **기호 배치**: 기호 드래그&드롭 시 그리드 셀에 정확히 스냅
- [ ] **서술형 변환**: 기호 배열 → 올바른 텍스트 출력 ("1단: 짧은뜨기 5, 긴뜨기 3")
- [ ] **연속 기호 축약**: 동일 기호 반복 시 "짧은뜨기 5"로 축약
- [ ] **Undo/Redo**: 기호 추가 후 Undo → 기호 사라짐, Redo → 복원
- [ ] **PDF 출력**: 차트 이미지 + 서술형 텍스트가 포함된 PDF 생성
- [ ] **자동 저장**: 변경 후 3초 뒤 Supabase에 저장, 상태 표시 변경
- [ ] **RLS 격리**: 다른 사용자의 도안에 접근 불가
- [ ] **동일 셀 교체**: 이미 기호 있는 셀에 드롭 시 교체, Undo 가능
- [ ] **빈 캔버스**: 기호 없는 상태에서 서술형 뷰어 빈 상태 표시

---

## 11. Clean Architecture

### 11.1 Layer Structure

| Layer | Responsibility | Location |
|:---|:---|:---|
| **Presentation** | UI 컴포넌트, 페이지, 사용자 인터랙션 | `src/components/`, `src/app/` |
| **Application** | 상태 관리, 비즈니스 로직 오케스트레이션 | `src/stores/`, `src/hooks/` |
| **Domain** | 엔티티, 타입, 핵심 비즈니스 규칙 | `src/types/`, `src/lib/written/`, `src/lib/grid/` |
| **Infrastructure** | DB 접근, PDF 생성, 외부 서비스 | `src/lib/supabase/`, `src/lib/export/` |

### 11.2 This Feature's Layer Assignment

| Component | Layer | Location |
|:---|:---|:---|
| Canvas, SymbolPanel, TopBar, WrittenView | Presentation | `src/components/editor/` |
| useEditorStore, useAutoSave | Application | `src/stores/`, `src/hooks/` |
| PlacedSymbol, GridConfig, SymbolDefinition | Domain | `src/types/` |
| converter.ts, snap.ts | Domain | `src/lib/written/`, `src/lib/grid/` |
| supabase/projects.ts, export/pdf.ts | Infrastructure | `src/lib/supabase/`, `src/lib/export/` |

---

## 12. Coding Conventions

### 12.1 Naming Conventions

| Target | Rule | Example |
|:---|:---|:---|
| Components | PascalCase | `Canvas`, `SymbolPanel`, `WrittenView` |
| Hooks | camelCase, use 접두사 | `useEditorStore`, `useAutoSave` |
| Functions | camelCase | `snapToGrid`, `toWritten`, `exportToPdf` |
| Types/Interfaces | PascalCase | `PlacedSymbol`, `GridConfig` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_GRID_CONFIG`, `MAX_UNDO_STACK` |
| Files (component) | PascalCase.tsx | `Canvas.tsx`, `TopBar.tsx` |
| Files (utility) | camelCase.ts | `converter.ts`, `snap.ts` |

### 12.2 Environment Variables

| Variable | Purpose | Scope |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Client |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry 에러 트래킹 DSN | Client |

---

## 13. Implementation Order

### Phase 1: 프로젝트 초기화 + 캔버스 POC (Sprint 1)
1. [ ] Next.js + TypeScript + Tailwind CSS 프로젝트 생성
2. [ ] react-konva, zustand, @supabase/supabase-js 의존성 설치
3. [ ] `types/` 타입 정의 (symbol.ts, project.ts, grid.ts)
4. [ ] `lib/symbols/crochet.ts` 코바늘 기호 데이터 정의
5. [ ] `components/editor/Canvas.tsx` 그리드 렌더링
6. [ ] `components/editor/GridOverlay.tsx` 눈금자 구현
7. [ ] `lib/grid/snap.ts` 스냅 로직
8. [ ] 기호 드래그&드롭 + 스냅 동작 검증

### Phase 2: 에디터 핵심 (Sprint 2)
1. [ ] `stores/useEditorStore.ts` 전체 구현 (symbols, history, selection)
2. [ ] `components/editor/SymbolPanel.tsx` 기호 라이브러리
3. [ ] `components/editor/SymbolRenderer.tsx` 개별 기호 노드
4. [ ] `components/editor/TopBar.tsx` 상단 바
5. [ ] 기호 다중 선택, 복사, 붙여넣기, 삭제
6. [ ] Undo/Redo (Zustand temporal middleware)
7. [ ] 키보드 단축키 바인딩 (`useHotkeys`)
8. [ ] `components/editor/EditorLayout.tsx` 3-패널 레이아웃

### Phase 3: 서술형 변환 + PDF (Sprint 3)
1. [ ] `lib/written/converter.ts` 변환 엔진
2. [ ] `components/editor/WrittenView.tsx` 실시간 뷰어
3. [ ] `components/editor/RightPanel.tsx` 우측 패널 통합
4. [ ] `components/editor/PropertyEditor.tsx` 속성 편집
5. [ ] `lib/export/pdf.ts` PDF 생성 로직
6. [ ] `components/editor/ExportModal.tsx` 내보내기 모달

### Phase 4: 인증 + 데이터 저장 (Sprint 4)
1. [ ] Supabase 프로젝트 생성 및 DB 스키마 실행
2. [ ] `lib/supabase/client.ts` 클라이언트 초기화
3. [ ] `app/(auth)/login/page.tsx`, `signup/page.tsx` 인증 UI
4. [ ] `stores/useAuthStore.ts` 인증 상태 관리
5. [ ] `lib/supabase/projects.ts` CRUD 함수
6. [ ] `hooks/useAutoSave.ts` 자동 저장
7. [ ] `app/dashboard/page.tsx` 대시보드
8. [ ] `components/dashboard/ProjectCard.tsx` 프로젝트 카드
9. [ ] RLS 정책 적용 및 검증

### Phase 5: 버전 히스토리 + 안정화 (Sprint 5)
1. [ ] `components/editor/VersionPanel.tsx` 버전 관리 UI
2. [ ] 버전 스냅샷 저장/복원 로직
3. [ ] Sentry 연동
4. [ ] Next.js 보안 헤더 설정
5. [ ] 전체 QA (E2E 테스트 시나리오)

---

## Version History

| Version | Date | Changes |
|:---|:---|:---|
| 0.1 | 2026-03-10 | Initial draft |
