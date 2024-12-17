import { useState, useCallback } from 'react'

export function useActionHandlers() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = useCallback(async (
    action: 'inference' | 'evaluate' | 'augment',
    data: any[],
    headers: string[],
    setData: React.Dispatch<React.SetStateAction<any[]>>,
    setHeaders: React.Dispatch<React.SetStateAction<string[]>>,
    setColumnWidths: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>,
    setColumnTypes: React.Dispatch<React.SetStateAction<{ [key: string]: { type: 'text' | 'dropdown', scoreRange?: number } }>>,
    systemPrompt?: string,
    userInput?: string,
    augmentationFactor?: number,
    augmentationPrompt?: string
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!data.length) {
        throw new Error('No data to process')
      }
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action, 
          data, 
          systemPrompt, 
          userInput,
          augmentationFactor: action === 'augment' ? augmentationFactor : undefined,
          augmentationPrompt: action === 'augment' ? augmentationPrompt : undefined,
        }),
      })
  
      let errorMessage = '';
      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        // If the response is not JSON, read it as text
        errorMessage = await response.text();
        throw new Error(`Non-JSON response: ${errorMessage}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${result.error || errorMessage}`);
      }

      if (!result || !result.result) {
        throw new Error('Invalid response from server')
      }
      setData(result.result)
  
      if (action === 'inference' && !headers.includes('assistant')) {
        setHeaders(prevHeaders => [...prevHeaders, 'assistant'])
        setColumnWidths(prev => ({ ...prev, assistant: 200 }))
        setColumnTypes(prev => ({ ...prev, assistant: { type: 'text' } }))
      }
      if (action === 'augment' && !headers.includes('is_augmented')) {
        setHeaders(prevHeaders => ['is_augmented', ...prevHeaders])
        setColumnWidths(prev => ({ is_augmented: 100, ...prev }))
        setColumnTypes(prev => ({ ...prev, is_augmented: { type: 'text' } }))
      }
    } catch (error) {
      console.error('Error in handleAction:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setData(prevData => prevData.map(row => ({ ...row, assistant: 'Error occurred during processing' })))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    handleAction
  }
}

