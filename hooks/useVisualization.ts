import { useState, useCallback } from 'react'

export function useVisualization() {
  const [showVisualization, setShowVisualization] = useState(false)
  const [selectedVisualizationColumns, setSelectedVisualizationColumns] = useState<string[]>([])
  const [chartType, setChartType] = useState<'bar' | 'radar'>('radar')

  const handleVisualizationColumnsSelect = useCallback((columns: string[], selectedChartType: 'bar' | 'radar') => {
    setSelectedVisualizationColumns(columns)
    setChartType(selectedChartType)
    setShowVisualization(true)
  }, [])

  const calculateAverageScores = (data: any[], columns: string[]) => {
    return columns.map(column => ({
      subject: column,
      value: data.reduce((sum, row) => sum + (parseFloat(row[column]) || 0), 0) / (data.length || 1),
    }))
  }

  return {
    showVisualization,
    setShowVisualization,
    selectedVisualizationColumns,
    chartType,
    handleVisualizationColumnsSelect,
    calculateAverageScores
  }
}

