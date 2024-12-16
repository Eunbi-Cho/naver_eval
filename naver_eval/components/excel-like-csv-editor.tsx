'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Papa from 'papaparse'

export default function ExcelLikeCSVEditor() {
  const [data, setData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])

  useEffect(() => {
    // Add 'Evaluation' header if it doesn't exist
    if (!headers.includes('Evaluation')) {
      setHeaders(prevHeaders => [...prevHeaders, 'Evaluation'])
      setData(prevData => prevData.map(row => [...row, '']))
    }
  }, [headers])

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
      <h1 className="text-2xl font-bold mb-4">엑셀 스타일 CSV 편집기</h1>
      <Input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {headers[cellIndex] === 'Evaluation' ? (
                              <Select
                                value={cell}
                                onValueChange={(value) => handleCellEdit(rowIndex, cellIndex, value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="평가 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((score) => (
                                    <SelectItem key={score} value={score.toString()}>
                                      {score}점
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={cell}
                                onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)}
                                className="border-0 p-0 focus:ring-0"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} className="mt-4">CSV 다운로드</Button>
        </>
      )}
    </div>
  )
}

