export function evaluate_llm(data: any[]): any[] {
  for (const row of data) {
    // 임시로 랜덤한 점수를 생성합니다 (1-7 사이)
    const llm_score = Math.floor(Math.random() * 7) + 1
    row['LLM_Eval'] = llm_score.toString()
  }
  return data
}

