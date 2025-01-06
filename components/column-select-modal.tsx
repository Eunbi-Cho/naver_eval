import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ColumnSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (systemPrompt: string, userInput: string, modelName: string) => void
  columns: string[]
}

export function ColumnSelectModal({ isOpen, onClose, onConfirm, columns }: ColumnSelectModalProps) {
  const [systemPrompt, setSystemPrompt] = React.useState<string>('')
  const [userInput, setUserInput] = React.useState<string>('')
  const [modelName, setModelName] = React.useState<string>('HCX-DASH-001')

  const handleConfirm = () => {
    onConfirm(
      systemPrompt === "none" ? "" : systemPrompt,
      userInput === "none" ? "" : userInput,
      modelName
    )
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Columns for Inference</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="systemPrompt" className="text-right">
              System Prompt
            </Label>
            <Select value={systemPrompt} onValueChange={setSystemPrompt}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userInput" className="text-right">
              User Input
            </Label>
            <Select value={userInput} onValueChange={setUserInput}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelName" className="text-right">
              Model
            </Label>
            <Select value={modelName} onValueChange={setModelName}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HCX-DASH-001">HCX-DASH-001</SelectItem>
                <SelectItem value="HCX-003">HCX-003</SelectItem>
                {/* Add more models as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

