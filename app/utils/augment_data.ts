import { OpenAI } from 'openai'

export async function augment_data(data: any[], augmentation_factor: number, augmentation_prompt: string): Promise<any[]> {
  if (!data || data.length === 0) {
    throw new Error("No data provided for augmentation")
  }

  // Initialize OpenAI client
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const augmented_data = []
  for (const row of data) {
    augmented_data.push(row)  // Keep the original row
    
    // Combine all text fields in the row
    const text = Object.values(row).filter(Boolean).join(" ")
    
    for (let i = 0; i < augmentation_factor - 1; i++) {  // Create new rows
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: augmentation_prompt },
            { role: "user", content: text }
          ]
        })
        
        // Extract the generated content
        const generated_text = completion.choices[0].message.content

        // Create a new row with the augmented data
        const new_row: any = { is_augmented: "Yes" }
        for (const [key, value] of Object.entries(row)) {
          if (value) {
            new_row[key] = generated_text
            break  // Only replace the first non-empty field
          } else {
            new_row[key] = value
          }
        }

        augmented_data.push(new_row)
      } catch (error) {
        console.error(`Error augmenting row: ${error}`)
      }
    }
  }

  // Add 'is_augmented' column to original data
  for (const row of data) {
    row["is_augmented"] = "No"
  }

  return augmented_data
}

