import React, { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChartTypeSelector } from './chart-type-selector'

interface VisualizationColumnSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedColumns: string[], chartType: 'bar' | 'radar') => void
  columns: string[]
  data: any[]
  columnTypes: {[key: string]: {type: 'text' | 'dropdown', scoreRange?: number}}
}

export function VisualizationColumnSelectModal({ isOpen, onClose, onConfirm, columns, data, columnTypes }: VisualizationColumnSelectModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [chartType, setChartType] = useState<'bar' | 'radar'>('radar')

  const numericColumns = useMemo(() => {
    return columns.filter(column => {
      return data.some(row => {
        const value = row[column];
        return (
          typeof value === 'number' ||
          (typeof value === 'string' && !isNaN(parseFloat(value))) ||
          columnTypes[column]?.type === 'dropdown'
        );
      });
    });
  }, [columns, data, columnTypes]);

  useEffect(() => {
    setSelectedColumns([]);
  }, [numericColumns]);

  const handleConfirm = () => {
    onConfirm(selectedColumns, chartType)
    onClose()
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>시각화할 열 선택</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {numericColumns.length === 0 ? (
            <div>시각화할 수 있는 숫자형 열이 없습니다.</div>
          ) : (
            numericColumns.map((column) => (
              <div key={column} className="flex items-center space-x-2">
                <Checkbox
                  id={column}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={() => handleColumnToggle(column)}
                />
                <Label htmlFor={column}>{column}</Label>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <Label>그래프 유형</Label>
          <ChartTypeSelector value={chartType} onChange={setChartType} />
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

