'use client'

import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { SymbolDefinition } from '@/types/symbol'
import { sanitizeSvg, extractSvgPath } from '@/lib/symbols/sanitize'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Upload } from 'lucide-react'

interface CustomSymbolUploadDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (def: SymbolDefinition) => void
}

export default function CustomSymbolUploadDialog({
  open,
  onClose,
  onAdd,
}: CustomSymbolUploadDialogProps) {
  const [name, setName] = useState('')
  const [abbr, setAbbr] = useState('')
  const [svgPath, setSvgPath] = useState<string | null>(null)
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSvgPath(null)
    setPreviewSvg(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.svg')) {
      setError('SVG 파일만 업로드할 수 있습니다.')
      return
    }
    if (file.size > 500 * 1024) {
      setError('파일 크기는 500KB 이하여야 합니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result as string
      const clean = sanitizeSvg(raw)
      if (!clean) {
        setError('SVG 파일을 분석할 수 없습니다. 유효한 SVG인지 확인하세요.')
        return
      }
      const path = extractSvgPath(clean)
      if (!path) {
        setError('SVG에서 <path> 요소를 찾을 수 없습니다. 경로 데이터(d 속성)가 포함된 SVG를 사용하세요.')
        return
      }
      setSvgPath(path)
      setPreviewSvg(clean)
    }
    reader.readAsText(file)
  }

  const handleAdd = () => {
    if (!svgPath || !name.trim()) return
    const def: SymbolDefinition = {
      id: `custom_${uuidv4()}`,
      name: name.trim(),
      nameEn: name.trim(),
      abbreviation: abbr.trim() || name.trim(),
      category: 'crochet',
      svgPath,
      width: 1,
      height: 1,
    }
    onAdd(def)
    // Reset form
    setName('')
    setAbbr('')
    setSvgPath(null)
    setPreviewSvg(null)
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>커스텀 기호 업로드</DialogTitle>
          <DialogDescription>
            SVG 파일을 업로드하여 나만의 기호를 만들 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          {/* SVG upload */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">SVG 파일 (최대 500KB)</label>
            <div
              className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {previewSvg ? (
                <div
                  className="w-12 h-12 mx-auto"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">클릭하여 파일 선택</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".svg"
              className="sr-only"
              onChange={handleFile}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">기호 이름</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 팝콘뜨기"
              className="h-8 text-sm"
            />
          </div>

          {/* Abbreviation */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">약어 (선택사항)</label>
            <Input
              value={abbr}
              onChange={(e) => setAbbr(e.target.value)}
              placeholder="예: pop"
              className="h-8 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleAdd} disabled={!svgPath || !name.trim()}>
            기호 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
