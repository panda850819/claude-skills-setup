---
name: triage
description: Use when user provides screenshot, vague description, or expresses confusion without clear intent. Triggers on "怪怪的", "壞了", "這是什麼", error screenshots, or any input lacking explicit request.
allowed-tools: Read, Glob, Grep, AskUserQuestion
---

# Triage - 問題分流

---

## Integrations

```
upstream:
  - (entry point - 接收模糊輸入)

downstream:
  - skill: spec-interviewer
    produces: 確認需要深入需求探索時
  - skill: systematic-debugging (superpowers)
    produces: 確認需要修復問題時
  - skill: brainstorming (superpowers)
    produces: 確認需要探索方案時
```

---

## Out of Scope

- **直接解決問題** - 只分流，不實作
- **假設用戶意圖** - 必須確認
- **技術細節解釋** - 確認需要後才展開

---

## Overview

**先問再動。** 使用者給模糊輸入時，必須先確認意圖和技術程度，再決定如何處理。

## When to Use

- 截圖 + 沒有明確說明
- 「怪怪的」「壞了」「這是什麼」「為什麼這樣」
- 錯誤訊息但沒說要怎麼處理
- 任何你不確定使用者想要什麼的情況

## The Rule

```
收到模糊輸入 → 問問題 → 確認後才行動
```

**違反這個規則 = 失敗。**

## 必問問題

**第一問：確認意圖**
> 「你想要我：(A) 解釋這是什麼意思 (B) 幫你解決這個問題 (C) 討論其他方案？」

**第二問：確認技術程度**（如果需要技術解釋）
> 「你對 [相關技術] 熟悉嗎？我可以調整解釋的深度。」

## Red Flags - 你正在跳過 Triage

| 你的想法 | 現實 |
|----------|------|
| 「錯誤很明確，我知道怎麼修」 | 使用者可能只想理解，不是修 |
| 「快速給答案比較有效率」 | 解決錯誤的問題 = 浪費時間 |
| 「問太多問題很煩」 | 問一個問題 vs 重做整個回答 |
| 「我看得懂，使用者應該也懂」 | 永遠不要假設技術程度 |

## 分類後的下一步

| 使用者意圖 | 你的行動 |
|-----------|----------|
| 想理解 | 用對方能懂的程度解釋 |
| 想修復 | 使用 systematic-debugging |
| 想要替代方案 | 使用 brainstorming |
| 環境/設定問題 | 協助檢查設定 |

## 正確流程範例

```
使用者：[錯誤截圖]

你：我看到這個錯誤了。想先確認一下：
- 你想了解這錯誤是什麼意思，還是要我幫你解決它？
- 還是你在考慮要不要換別的方案？

使用者：我想知道這是什麼意思

你：[用簡單語言解釋錯誤]
```

## 不要這樣做

```
使用者：[錯誤截圖]

你：這是 XXX 錯誤，解法是 YYY... [一大堆技術細節]
```

**這就是 baseline 測試中觀察到的失敗行為。**

---

## Verification

分流完成標準：

- [ ] 已確認用戶意圖（理解/修復/探索）
- [ ] 已確認技術程度（如需要）
- [ ] 已選擇正確的下游 skill
- [ ] 用戶同意進入下一步

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 用戶明顯焦慮 | 先安撫，再問問題 |
| 問題涉及安全 | 優先處理安全，不繼續分流 |
| 無法判斷領域 | 多問一個問題釐清 |
| 用戶不願回答 | 提供最保守的建議 |
