import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AugmentationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (augmentationFactor: number, augmentationPrompt: string) => void
}

export function AugmentationModal({ isOpen, onClose, onConfirm }: AugmentationModalProps) {
  const [augmentationFactor, setAugmentationFactor] = useState(2)
  const [augmentationPrompt, setAugmentationPrompt] = useState(`데이터 증강을 위해 사용자 입력과 유사한 텍스트를 생성하세요.

- 사용자 입력의 주제나 문맥을 파악하고 이를 유지하면서 새로운 텍스트를 생성합니다.
- 입력된 텍스트의 문체, 길이, 화자 목소리 등을 고려하여 일관성을 유지합니다.
- 표현의 다양성을 추가하여, 기존 데이터와 충분히 구별되도록 만듭니다.

# Steps

1. **Input Analysis**: 사용자 입력의 주제를 파악하고 핵심 요소를 추출합니다.
2. **Context Retention**: 입력된 문맥을 유지하며 유사한 내용을 구상합니다.
3. **Stylistic Consistency**: 입력과 유사한 문체와 톤을 유지합니다.
4. **Diversity**: 표현의 다양성을 통해 새로운 텍스트를 만듭니다.`)

  const handleConfirm = () => {
    onConfirm(augmentationFactor, augmentationPrompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>데이터 증강 설정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="augmentationFactor" className="text-right">
              증강 배수
            </Label>
            <Input
              id="augmentationFactor"
              type="number"
              value={augmentationFactor}
              onChange={(e) => setAugmentationFactor(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="augmentationPrompt" className="text-right">
              증강 프롬프트
            </Label>
            <Textarea
              id="augmentationPrompt"
              value={augmentationPrompt}
              onChange={(e) => setAugmentationPrompt(e.target.value)}
              className="col-span-3"
              rows={10}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

