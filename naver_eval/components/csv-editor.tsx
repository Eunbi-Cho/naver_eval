'use client'

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Papa from 'papaparse'

export default function CSVEditor() {
  const [data, setData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedData = result.data as string[][]
          setHeaders(parsedData[0])
          setData(parsedData.slice(1))
        },
      })
    }
  }, [])

  const handleCellEdit = useCallback((rowIndex: number, colIndex: number, value: string) => {
    setData(prevData => {
      const newData = [...prevData]
      newData[rowIndex][colIndex] = value
      return newData
    })
  }, [])

  const handleDownload = useCallback(() => {
    const csv = Papa.unparse([headers, ...data])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [headers, data])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LLM 모델 평가하기</h1>
      <Input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Input
                          value={cell}
                          onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button onClick={handleDownload} className="mt-4">CSV 다운로드</Button>
        </>
      )}
    </div>
  )
}

