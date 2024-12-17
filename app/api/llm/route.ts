import { NextResponse } from 'next/server'
import { run_inference } from '@/app/utils/run_inference'
import { evaluate_llm } from '@/app/utils/evaluate_llm'
import { augment_data } from '@/app/utils/augment_data'

export async function POST(request: Request) {
  try {
    const { action, data, systemPrompt, userInput, augmentationFactor, augmentationPrompt } = await request.json()
    
    if (!action || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'inference':
        result = await run_inference(data, systemPrompt, userInput)
        break
      case 'evaluate':
        result = await evaluate_llm(data)
        break
      case 'augment':
        if (!augmentationFactor || !augmentationPrompt) {
          return NextResponse.json({ error: 'Missing augmentation parameters' }, { status: 400 })
        }
        result = await augment_data(data, augmentationFactor, augmentationPrompt)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result) {
      throw new Error('Operation failed')
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

