import { ChatCompletionExecutor } from './chatCompletionExecutor'

export async function run_inference(data: any[], system_prompt: string, user_input: string): Promise<any[]> {
  if (!data || data.length === 0) {
    throw new Error("No data provided for inference")
  }

  try {
    const chat_completion_executor = new ChatCompletionExecutor()

    for (const row of data) {
      try {
        const system = system_prompt ? row[system_prompt] || "" : ""
        const text = user_input ? row[user_input] || "" : ""
        
        const request_data = {
          messages: [{
            role: "system",
            content: system
          }, {
            role: "user",
            content: text
          }],
          maxTokens: 400,
          temperature: 0.5,
          topK: 0,
          topP: 0.8,
          repeatPenalty: 5.0,
          stopBefore: [],
          includeAiFilters: true,
          seed: 0
        }

        const response = await chat_completion_executor.execute(request_data)
        
        let response_content = ""
        for await (const chunk of response) {
          const lines = chunk.toString().split('\n')
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const json_data = JSON.parse(line.slice(5))
                if ('message' in json_data) {
                  response_content += json_data.message.content
                }
              } catch (error) {
                console.error(`Error decoding JSON: ${line}`)
              }
            }
          }
        }
        
        row['assistant'] = response_content.trim()
      } catch (error) {
        console.error(`Error processing row: ${error}`)
        row['assistant'] = `Error occurred during inference: ${error}`
      }
    }

    return data
  } catch (error) {
    console.error(`Error in run_inference: ${error}`)
    throw error
  }
}

