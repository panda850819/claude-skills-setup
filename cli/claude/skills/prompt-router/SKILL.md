---
name: prompt-router
description: 自動根據 model-recommendation 委派任務到適合的模型。當收到 <model-recommendation> 時自動觸發。
trigger: <model-recommendation>
---

# Prompt Router

根據 `<model-recommendation>` 自動將任務委派到適合的模型。

## 觸發條件

當 system-reminder 中包含 `<model-recommendation>` 時觸發。

## 處理邏輯

收到 recommendation 後，根據 `model` 欄位決定處理方式：

### model: opus

**直接在當前對話處理。** 不需要委派，因為當前對話已經是 Opus。

### model: sonnet

**委派給 Task agent：**

```
Task(
  prompt: [用戶原始問題],
  model: "sonnet",
  subagent_type: "general-purpose"
)
```

### model: haiku

**委派給 Task agent：**

根據任務類型選擇 subagent_type：

| 任務類型 | subagent_type |
|---------|---------------|
| 搜尋、查找、探索 codebase | fast-explorer |
| 其他簡單任務 | general-purpose |

```
Task(
  prompt: [用戶原始問題],
  model: "haiku",
  subagent_type: "fast-explorer" 或 "general-purpose"
)
```

## 重要規則

1. **保留原始問題** - 委派時使用用戶的原始 prompt，不要改寫或加工
2. **透明告知** - 委派前簡短說明「使用 [model] 處理這個任務」
3. **結果整合** - Agent 回傳結果後，直接呈現給用戶，不需要額外包裝
4. **confidence: low 時** - 可以在告知時提到「根據任務分析」

## 範例

**輸入：**
```
<model-recommendation>
model: haiku
confidence: high
prompt_preview: skills 有哪些
</model-recommendation>
```

**Claude 行為：**
> 使用 haiku 處理這個查詢任務。

然後執行：
```
Task(
  prompt: "skills 有哪些",
  model: "haiku",
  subagent_type: "fast-explorer"
)
```

## 不觸發的情況

- 用戶明確指定要用特定模型（如 `@opus` 或 `用 opus 回答`）
- 用戶正在進行多輪對話的中間（已經開始討論某個主題）
- 任務涉及敏感操作需要確認

## 關鍵字規則

詳見 `RULES.md`
