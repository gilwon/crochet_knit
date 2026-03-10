-- KnitCanvas Database Schema
-- Run this in Supabase SQL Editor

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

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

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
