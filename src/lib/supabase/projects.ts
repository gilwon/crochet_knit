import type { PlacedSymbol } from '@/types/symbol'
import type { GridConfig } from '@/types/grid'
import { createClient } from './client'

const supabase = createClient()

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, updated_at, symbols, grid_config')
    .order('updated_at', { ascending: false })
  return { data, error }
}

export async function createProject(title: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title })
    .select()
    .single()
  return { data, error }
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function saveProject(
  id: string,
  symbols: PlacedSymbol[],
  gridConfig: GridConfig
) {
  const { error } = await supabase
    .from('projects')
    .update({ symbols, grid_config: gridConfig })
    .eq('id', id)
  return { error }
}

export async function updateProjectTitle(id: string, title: string) {
  const { error } = await supabase
    .from('projects')
    .update({ title })
    .eq('id', id)
  return { error }
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  return { error }
}

// 버전 히스토리
export async function createVersion(
  projectId: string,
  snapshot: { grid_config: GridConfig; symbols: PlacedSymbol[] },
  label?: string
) {
  const { error } = await supabase
    .from('project_versions')
    .insert({ project_id: projectId, snapshot, label: label || '' })
  return { error }
}

export async function getVersions(projectId: string) {
  const { data, error } = await supabase
    .from('project_versions')
    .select('id, label, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getVersion(versionId: string) {
  const { data, error } = await supabase
    .from('project_versions')
    .select('snapshot')
    .eq('id', versionId)
    .single()
  return { data, error }
}
