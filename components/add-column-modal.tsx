import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (columnName: string, columnType: 'text' | 'dropdown', scoreRange?: number) => void
  existingColumns: string[]
}

export function AddColumnModal({ isOpen, onClose, onConfirm, existingColumns }: AddColumnModalProps) {
  const [columnName, setColumnName] = useState('')
  const [columnType, setColumnType] = useState<'text' | 'dropdown'>('text')
  const [scoreRange, setScoreRange] = useState<number>(5)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    if (existingColumns.includes(columnName)) {
      setError('이미 존재하는 열 이름입니다. 다른 이름을 선택해주세요.')
      return
    }
    onConfirm(columnName, columnType, columnType === 'dropdown' ? scoreRange : undefined)
    onClose()
    // Reset the form
    setColumnName('')
    setColumnType('text')
    setScoreRange(5)
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>열 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columnName" className="text-right">
              열 이름
            </Label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columnType" className="text-right">
              열 유형
            </Label>
            <Select value={columnType} onValueChange={(value: 'text' | 'dropdown') => setColumnType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="열 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">텍스트 필드</SelectItem>
                <SelectItem value="dropdown">드롭다운 메뉴</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {columnType === 'dropdown' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scoreRange" className="text-right">
                점수 범위
              </Label>
              <Select value={scoreRange.toString()} onValueChange={(value) => setScoreRange(Number(value))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="점수 범위 선택" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10].map((range) => (
                    <SelectItem key={range} value={range.toString()}>
                      1-{range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

