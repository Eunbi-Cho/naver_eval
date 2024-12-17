import os
from openai import OpenAI
from typing import List, Dict, Any

def augment_data(data: List[Dict[str, Any]], augmentation_factor: int, augmentation_prompt: str) -> List[Dict[str, Any]]:
    if not data:
        raise ValueError("No data provided for augmentation")

    # Initialize OpenAI client
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    augmented_data = []
    for row in data:
        augmented_data.append(row)  # Keep the original row
        
        # Combine all text fields in the row
        text = " ".join(str(value) for value in row.values() if value)
        
        for _ in range(augmentation_factor - 1):  # Create new rows
            try:
                completion = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": augmentation_prompt},
                        {"role": "user", "content": text}
                    ]
                )
                
                # Extract the generated content
                generated_text = completion.choices[0].message.content

                # Create a new row with the augmented data
                new_row = {"is_augmented": "Yes"}
                for key, value in row.items():
                    if value:
                        new_row[key] = generated_text
                        break  # Only replace the first non-empty field
                    else:
                        new_row[key] = value

                augmented_data.append(new_row)
            except Exception as e:
                print(f"Error augmenting row: {e}")

    # Add 'is_augmented' column to original data
    for row in data:
        row["is_augmented"] = "No"

    return augmented_data

