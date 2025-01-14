'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ResizeHandler } from './resize-handler'
import { ColumnSelectModal } from './column-select-modal'
import { AddColumnModal } from './add-column-modal'
import { VisualizationColumnSelectModal } from './visualization-column-select-modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { X, ArrowUpRight, Key } from 'lucide-react'
import { useCSVData } from '@/hooks/useCSVData'
import { useVisualization } from '@/hooks/useVisualization'
import { useColumnManagement } from '@/hooks/useColumnManagement'
import { useActionHandlers } from '@/hooks/useActionHandlers'
import { AugmentationModal } from './AugmentationModal'
import { ProgressBar } from './progress-bar'
import { LLMEvaluationModal } from './LLMEvaluationModal'
import { ExpandedCellView } from './expanded-cell-view'
import { APIKeys, APIKeySettingsModal } from './APIKeySettingsModal';

interface RowData {
  [key: string]: string | number | undefined;
  is_augmented?: string;
  LLM_Eval?: string;
  'LLM_Eval 근거'?: string;
}

interface ExpandedCellType {
 rowIndex: number;
 header: string;
 content: string;
}

interface EvaluationSettings {
 model: string;
 selectedColumns: string[];
 evaluationPrompt: string;
 scoreRange: number;
 scoreCriteria: { [key: number]: string };
}

export default function AdvancedCSVEditor() {
 const {
   data,
   setData,
   headers,
   setHeaders,
   columnWidths,
   setColumnWidths,
   columnTypes,
   setColumnTypes,
   handleFileUpload,
   handleCellEdit,
   handleDownload
 } = useCSVData()

 const {
   showVisualization,
   selectedVisualizationColumns,
   chartType,
   handleVisualizationColumnsSelect,
   calculateAverageScores
 } = useVisualization()

 const {
   columnToDelete,
   handleDeleteColumn,
   confirmDeleteColumn,
   handleAddColumn,
   setColumnToDelete
 } = useColumnManagement()

 const {
  isLoading,
  error,
  progress,
  handleAction,
  apiKeys,
  setApiKeys
} = useActionHandlers()


 const tableRef = useRef<HTMLDivElement>(null)

 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isAugmentModalOpen, setIsAugmentModalOpen] = useState(false)
 const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
 const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false)
 const [isLLMEvaluationModalOpen, setIsLLMEvaluationModalOpen] = useState(false)
 const [expandedCell, setExpandedCell] = useState<ExpandedCellType | null>(null)
 const [isAPIKeyModalOpen, setIsAPIKeyModalOpen] = useState(true)
 const [isAPIKeySet, setIsAPIKeySet] = useState(false)

 const handleInference = () => {
   setIsModalOpen(true)
 }

 const handleModalConfirm = (systemPrompt: string, userInput: string, modelName: string) => {
   handleAction('inference', data, headers, setData, setHeaders, setColumnWidths, setColumnTypes, systemPrompt, userInput, undefined, undefined, undefined, undefined, modelName)
 }

 const handleAugmentationModal = () => {
   setIsAugmentModalOpen(true)
 }

 const handleAugmentationConfirm = (augmentationFactor: number, augmentationPrompt: string, selectedColumn: string) => {
  setIsAugmentModalOpen(false)
  handleAction('augment', data, headers, setData, setHeaders, setColumnWidths, setColumnTypes, undefined, undefined, augmentationFactor, augmentationPrompt, selectedColumn)
}

 const handleColumnResize = (header: string, width: number) => {
   setColumnWidths(prev => ({ ...prev, [header]: width }))
 }

 const getRowClassName = (row: RowData) => {
  if (row.LLM_Eval === 'Error') {
    return 'bg-red-100';
  }
  return row.is_augmented === 'Yes' ? 'bg-blue-50' : '';
}

 useEffect(() => {
   if (tableRef.current) {
     const tableWidth = headers.reduce((sum, header) => sum + (columnWidths[header] || 0), 0)
     tableRef.current.style.width = `${tableWidth}px`
   }
 }, [columnWidths, headers])

 const handleLLMEvaluationConfirm = (evaluationSettings: EvaluationSettings) => {
   setIsLLMEvaluationModalOpen(false)
   handleAction('evaluate', data, headers, setData, setHeaders, setColumnWidths, setColumnTypes, undefined, undefined, undefined, undefined, undefined, evaluationSettings)
 }

 const handleCellClick = (rowIndex: number, header: string, content: string | undefined) => {
   if (content !== undefined) {
     setExpandedCell({ rowIndex, header, content })
   }
 }

 const handleCellSave = (rowIndex: number, header: string, newContent: string) => {
   setData(prevData => {
     const newData = [...prevData]
     newData[rowIndex] = { ...newData[rowIndex], [header]: newContent }
     return newData
   })
   setExpandedCell(null)
 }

  // API 키 설정 함수
  const handleAPIKeySave = (keys: APIKeys) => {
    setApiKeys(keys)
    setIsAPIKeySet(true)
    setIsAPIKeyModalOpen(false)
  }

  // 파일 업로드 핸들러
  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isAPIKeySet) {
      handleFileUpload(event)
    } else {
      setIsAPIKeyModalOpen(true)
    }
  }

 return (
   <div className="container mx-auto p-4">
     <Button
       variant="outline"
       size="sm"
       className="fixed top-4 right-4 bg-blue-500 text-white hover:bg-blue-600"
       onClick={() => setIsAPIKeyModalOpen(true)}
     >
       <Key className="h-4 w-4 mr-2" />
       API 키
     </Button>
     <h1 className="text-2xl font-bold mb-4">LLM 모델 평가하기</h1>
     <Input 
       type="file" 
       accept=".csv" 
       onChange={handleFileUploadWrapper} 
       className="mb-4" 
       disabled={!isAPIKeySet}
     />
     {!isAPIKeySet && (
       <p className="text-red-500 mb-4">API 키를 설정해야 파일을 업로드할 수 있습니다.</p>
     )}
     {error && (
       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
         <strong className="font-bold">Error: </strong>
         <span className="block sm:inline whitespace-pre-wrap">{error}</span>
       </div>
     )}
     {isLoading && (
       <div className="mb-4">
         <p className="text-center mb-2">Processing... {progress.current} / {progress.total} items</p>
         <ProgressBar current={progress.current} total={progress.total} />
       </div>
     )}
     {data.length > 0 && headers.length > 0 ? (
       <>
         <div className="flex space-x-4 mb-6">
           <Button onClick={handleAugmentationModal} className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
             데이터 증강
           </Button>
           <Button onClick={handleInference} className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
             {isLoading ? '처리 중...' : '인퍼런스 실행'}
           </Button>
           <Button 
             onClick={() => setIsLLMEvaluationModalOpen(true)} 
             className="bg-yellow-500 hover:bg-yellow-600"
             disabled={isLoading}
           >
             LLM 평가 수행
           </Button>
           <Button onClick={() => setIsVisualizationModalOpen(true)} className="bg-purple-500 hover:bg-purple-600">
             평가 그래프 보기
           </Button>
         </div>
         <div className="flex space-x-4 mb-6">
           <Button onClick={handleDownload} variant="outline">CSV 다운로드</Button>
           <Button onClick={() => setIsAddColumnModalOpen(true)} variant="outline">열 추가</Button>
         </div>
         <div className="overflow-x-auto border border-gray-200 rounded-lg">
           <div className="inline-block min-w-full align-middle">
             <div ref={tableRef} className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
               <table className="min-w-full divide-y divide-gray-300">
                 <thead className="bg-gray-50">
                   <tr>
                     {headers.map((header, index) => (
                       <th key={index} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 relative" style={{ width: `${columnWidths[header]}px`, minWidth: `${columnWidths[header]}px` }}>
                         <div className="flex items-center justify-between pr-4">
                           <span>{header}</span>
                           {header !== 'LLM_Eval' && header !== 'LLM_Eval 근거' && (
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDeleteColumn(header)}
                               className="h-6 w-6"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           )}
                         </div>
                         <div className="absolute inset-y-0 right-0 flex items-center">
                           <ResizeHandler
                             onResize={(width) => handleColumnResize(header, width)}
                             initialWidth={columnWidths[header]}
                           />
                         </div>
                       </th>
                     ))}
                     {headers.includes('is_augmented') && (
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                         증강 여부
                       </th>
                     )}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                   {data.map((row: RowData, rowIndex) => (
                     <tr key={rowIndex} className={getRowClassName(row)}>
                       {headers.map((header, cellIndex) => (
                         <td
                           key={cellIndex}
                           className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
                           style={{ width: `${columnWidths[header]}px`, minWidth: `${columnWidths[header]}px` }}
                         >
                           <div className="flex items-center justify-between">
                             <div className="truncate flex-grow">
                               {columnTypes[header]?.type === 'dropdown' ? (
                                 <Select
                                   value={row[header]?.toString() || ''}
                                   onValueChange={(value) => handleCellEdit(rowIndex, header, value)}
                                 >
                                   <SelectTrigger className="w-full">
                                     <SelectValue placeholder={`${header} 선택`} />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {Array.from({ length: columnTypes[header].scoreRange || 7 }, (_, i) => i + 1).map((score) => (
                                       <SelectItem key={score} value={score.toString()}>
                                         {score}점
                                       </SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               ) : (
                                 <Input
                                   value={row[header]?.toString() || ''}
                                   onChange={(e) => handleCellEdit(rowIndex, header, e.target.value)}
                                   className="border-0 p-0 focus:ring-0 w-full"
                                   readOnly={row.is_augmented === 'Yes'}
                                 />
                               )}
                             </div>
                             {columnTypes[header]?.type !== 'dropdown' && (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="ml-2"
                                 onClick={() => handleCellClick(rowIndex, header, row[header]?.toString() || '')}
                               >
                                 <ArrowUpRight className="h-4 w-4" />
                               </Button>
                             )}
                           </div>
                         </td>
                       ))}
                       {headers.includes('is_augmented') && (
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           {row.is_augmented}
                         </td>
                       )}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         </div>
         {showVisualization && selectedVisualizationColumns.length > 0 && (
           <div className="mt-8 h-[400px]">
             <h2 className="text-xl font-bold mb-4">선택된 열 시각화</h2>
             <ResponsiveContainer width="100%" height="100%">
               {chartType === 'radar' ? (
                 <RadarChart data={calculateAverageScores(data, selectedVisualizationColumns)}>
                   <PolarGrid />
                   <PolarAngleAxis dataKey="subject" />
                   <PolarRadiusAxis angle={30} domain={[0, 7]} />
                   <Radar name="평균 점수" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                   <Legend />
                 </RadarChart>
               ) : (
                 <BarChart data={calculateAverageScores(data, selectedVisualizationColumns)}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="subject" />
                   <YAxis domain={[0, 7]} />
                   <Tooltip />
                   <Legend />
                   <Bar dataKey="value" name="평균 점수" fill="#8884d8" />
                 </BarChart>
               )}
             </ResponsiveContainer>
           </div>
         )}
       </>
     ) : (
       <p>No data available. Please upload a CSV file.</p>
     )}
     <ColumnSelectModal
       isOpen={isModalOpen}
       onClose={() => setIsModalOpen(false)}
       onConfirm={handleModalConfirm}
       columns={headers}
     />
     <AugmentationModal
       isOpen={isAugmentModalOpen}
       onClose={() => setIsAugmentModalOpen(false)}
       onConfirm={handleAugmentationConfirm}
       headers={headers}
     />
     <AddColumnModal
       isOpen={isAddColumnModalOpen}
       onClose={() => setIsAddColumnModalOpen(false)}
       onConfirm={(columnName, columnType, scoreRange) => 
         handleAddColumn(columnName, columnType, scoreRange, setHeaders, setColumnWidths, setColumnTypes, setData)
       }
       existingColumns={headers}
     />
     <VisualizationColumnSelectModal
       isOpen={isVisualizationModalOpen}
       onClose={() => setIsVisualizationModalOpen(false)}
       onConfirm={handleVisualizationColumnsSelect}
       columns={headers}
       data={data}
       columnTypes={columnTypes}
     />
     <AlertDialog open={!!columnToDelete} onOpenChange={(open) => {
       if (!open) setColumnToDelete(null);
     }}>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>열 삭제 확인</AlertDialogTitle>
           <AlertDialogDescription>
             정말로 &apos;{columnToDelete}&apos; 열을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setColumnToDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDeleteColumn(headers, setHeaders, setData, setColumnWidths, setColumnTypes)}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LLMEvaluationModal
        isOpen={isLLMEvaluationModalOpen}
        onClose={() => setIsLLMEvaluationModalOpen(false)}
        onConfirm={handleLLMEvaluationConfirm}
        headers={headers}
      />
      {expandedCell && (
        <ExpandedCellView
          header={expandedCell.header}
          content={expandedCell.content}
          onClose={() => setExpandedCell(null)}
          onSave={(newContent) => handleCellSave(expandedCell.rowIndex, expandedCell.header, newContent)}
        />
      )}
      <APIKeySettingsModal
        isOpen={isAPIKeyModalOpen}
        onClose={() => isAPIKeySet && setIsAPIKeyModalOpen(false)}
        onSave={handleAPIKeySave}
        initialKeys={apiKeys}
      />
    </div>
  )
}

