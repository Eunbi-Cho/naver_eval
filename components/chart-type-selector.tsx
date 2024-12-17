import React from 'react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ChartTypeSelectorProps {
  value: 'bar' | 'radar'
  onChange: (value: 'bar' | 'radar') => void
}

export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange as (value: string) => void}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="bar" id="bar" />
        <Label htmlFor="bar">막대 그래프</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="radar" id="radar" />
        <Label htmlFor="radar">방사형 그래프</Label>
      </div>
    </RadioGroup>
  )
}

