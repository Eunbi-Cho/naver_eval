'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Papa from 'papaparse'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'
import { ResizeHandler } from './resize-handler'

type EvaluationCriteria = 'Accuracy' | 'Faithfulness' | 'Precision'
type EvaluationType = 'LLM' | 'Human'

interface RowData {
  [key: string]: string
  LLM_Accuracy: string
  LLM_Faithfulness: string
  LLM_Precision: string
  Human_Accuracy: string
  Human_Faithfulness: string
  Human_Precision: string
}

const generateRandomScore = () => Math.floor(Math.random() * 5) + 1;

const evaluationCriteria: EvaluationCriteria[] = ['Accuracy', 'Faithfulness', 'Precision']
const evaluationTypes: EvaluationType[] = ['LLM', 'Human']

export default function AdvancedCSVEditor() {
  const [data, setData] = useState<RowData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [showVisualization, setShowVisualization] = useState(false)
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({})
  const tableRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          if (Array.isArray(result.data) && result.data.length > 0) {
            const parsedHeaders = result.data[0] as string[]
            const newHeaders = [
              ...parsedHeaders,
              ...evaluationTypes.flatMap(type => 
                evaluationCriteria.map(criterion => `${type}_${criterion}`)
              )
            ]
            setHeaders(newHeaders)
            
            const parsedData = result.data.slice(1).map((row: string[]) => {
              const rowData: RowData = {
                LLM_Accuracy: '', LLM_Faithfulness: '', LLM_Precision: '',
                Human_Accuracy: '', Human_Faithfulness: '', Human_Precision: ''
              }
              newHeaders.forEach((header, index) => {
                if (index < parsedHeaders.length) {
                  rowData[header] = row[index] || ''
                }
              })
              return rowData
            })
            
            setData(parsedData)
            setColumnWidths(Object.fromEntries(newHeaders.map(header => [header, 200])))
          } else {
            console.error('Invalid CSV format')
            setHeaders([])
            setData([])
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error)
        },
      })
    }
  }, [])

  const handleCellEdit = useCallback((rowIndex: number, header: string, value: string) => {
    setData(prevData => {
      const newData = [...prevData]
      newData[rowIndex] = { ...newData[rowIndex], [header]: value }
      return newData
    })
  }, [])

  const handleDownload = useCallback(() => {
    const csv = Papa.unparse({
      fields: headers,
      data: data.map(row => headers.map(header => row[header] || ''))
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [headers, data])

  const calculateAverageScores = () => {
    return evaluationTypes.flatMap(type => 
      evaluationCriteria.map(criterion => ({
        subject: criterion,
        [type]: data.reduce((sum, row) => sum + (parseInt(row[`${type}_${criterion}`]) || 0), 0) / (data.length || 1),
      }))
    ).reduce((acc, curr) => {
      const existing = acc.find(item => item.subject === curr.subject)
      if (existing) {
        Object.assign(existing, curr)
      } else {
        acc.push(curr)
      }
      return acc
    }, [] as { subject: string; LLM?: number; Human?: number }[])
  }

  const handleColumnResize = useCallback((header: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [header]: width }))
  }, [])

  const handleInference = useCallback(() => {
    setData(prevData => prevData.map(row => ({
      ...row,
      ...Object.fromEntries(
        evaluationTypes.flatMap(type => 
          evaluationCriteria.map(criterion => [`${type}_${criterion}`, generateRandomScore().toString()])
        )
      )
    })))
  }, [])

  useEffect(() => {
    if (tableRef.current) {
      const tableWidth = headers.reduce((sum, header) => sum + (columnWidths[header] || 0), 0)
      tableRef.current.style.width = `${tableWidth}px`
    }
  }, [columnWidths, headers])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LLM 모델 평가하기</h1>
      <Input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
            <div className="inline-block min-w-full align-middle">
              <div ref={tableRef} className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 relative" style={{ width: `${columnWidths[header]}px`, minWidth: `${columnWidths[header]}px` }}>
                          <div className="absolute inset-y-0 right-0 flex items-center">
                            <ResizeHandler
                              onResize={(width) => handleColumnResize(header, width)}
                              initialWidth={columnWidths[header]}
                            />
                          </div>
                          <div className="pr-4">{header}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header, cellIndex) => (
                          <td key={cellIndex} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" style={{ width: `${columnWidths[header]}px`, minWidth: `${columnWidths[header]}px` }}>
                            {header.startsWith('LLM_') || header.startsWith('Human_') ? (
                              <Select
                                value={row[header]}
                                onValueChange={(value) => handleCellEdit(rowIndex, header, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={`${header} 선택`} />
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
                                value={row[header]}
                                onChange={(e) => handleCellEdit(rowIndex, header, e.target.value)}
                                className="border-0 p-0 focus:ring-0 w-full"
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
          <div className="flex space-x-4 mb-4">
            <Button onClick={handleDownload}>CSV 다운로드</Button>
            <Button onClick={handleInference}>인퍼런스 실행</Button>
            <Button onClick={() => setShowVisualization(!showVisualization)}>
              {showVisualization ? '시각화 숨기기' : '시각화 보기'}
            </Button>
          </div>
          {showVisualization && (
            <div className="mt-8 h-[400px]">
              <h2 className="text-xl font-bold mb-4">평가 비교</h2>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={calculateAverageScores()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="LLM" dataKey="LLM" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Human" dataKey="Human" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}

