import random
from typing import List, Dict, Any

def evaluate_llm(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    for row in data:
        # 임시로 랜덤한 점수를 생성합니다 (1-7 사이)
        llm_score = random.randint(1, 7)
        row['LLM_Eval'] = str(llm_score)
    return data

