import { useState, useCallback } from 'react'

export function useColumnManagement() {
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null)

  const handleDeleteColumn = useCallback((column: string) => {
    setColumnToDelete(column)
  }, [])

  const confirmDeleteColumn = useCallback((
    headers: string[],
    setHeaders: React.Dispatch<React.SetStateAction<string[]>>,
    setData: React.Dispatch<React.SetStateAction<any[]>>,
    setColumnWidths: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    setColumnTypes: React.Dispatch<React.SetStateAction<{ [key: string]: { type: 'text' | 'dropdown', scoreRange?: number } }>>
  ) => {
    if (columnToDelete) {
      setHeaders(prevHeaders => prevHeaders.filter(header => header !== columnToDelete))
      setData(prevData => prevData.map(row => {
        const newRow = { ...row }
        delete newRow[columnToDelete]
        return newRow
      }))
      setColumnWidths(prev => {
        const newWidths = { ...prev }
        delete newWidths[columnToDelete]
        return newWidths
      })
      setColumnTypes(prev => {
        const newTypes = { ...prev }
        delete newTypes[columnToDelete]
        return newTypes
      })
    }
    setColumnToDelete(null)
  }, [columnToDelete])

  const handleAddColumn = useCallback((
    columnName: string,
    columnType: 'text' | 'dropdown',
    scoreRange: number | undefined,
    setHeaders: React.Dispatch<React.SetStateAction<string[]>>,
    setColumnWidths: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    setColumnTypes: React.Dispatch<React.SetStateAction<{ [key: string]: { type: 'text' | 'dropdown', scoreRange?: number } }>>,
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setHeaders(prevHeaders => [...prevHeaders, columnName])
    setColumnWidths(prev => ({ ...prev, [columnName]: 200 }))
    setColumnTypes(prev => ({ ...prev, [columnName]: { type: columnType, scoreRange } }))
    setData(prevData => prevData.map(row => ({ ...row, [columnName]: '' })))
  }, [])

  return {
    columnToDelete,
    handleDeleteColumn,
    confirmDeleteColumn,
    handleAddColumn
  }
}

