---
name: spec-interviewer
description: 深度訪談撰寫 spec。Use when user provides a spec file, says "interview me", "spec interview", "幫我寫 spec", "訪談需求", "規格訪談", or wants to flesh out requirements through questioning. Asks non-obvious questions until complete.
allowed-tools: Read, Write, Edit, AskUserQuestion, TodoWrite
---

# Spec Interviewer

透過深度訪談完善需求規格。

---

## Integrations

```
upstream:
  - skill: triage
    receives: 初步問題描述，需要更清楚的需求

downstream:
  - skill: product-management
    produces: spec.md → 可轉化為 PRD
  - skill: frontend-design
    produces: spec.md → UI 需求和 user stories
  - skill: pine-developer
    produces: spec.md → Pine Script 功能需求
  - skill: spec-sync
    produces: spec.md → 作為驗證基準
```

---

## Out of Scope

- **實作功能** - 只做需求探索，不實作
- **技術選型決策** - 只記錄選項，不做最終決定
- **時程估計** - 不提供時間估計

---

### Handoff Protocol

訪談完成後，在 spec 末尾加入：

```markdown
---
## Next Steps

**Recommended skill**: [skill-name]
**Handoff artifacts**:
- `path/to/spec.md`: 完整需求規格

**Key decisions for implementation**:
1. [decision 1]
2. [decision 2]
```

---

## 流程

```
1. Read spec 檔案（可能是空的或有初步內容）
   ↓
2. 用 AskUserQuestion 持續深度提問
   ↓
3. 訪談完成後寫入 spec
```

---

## 訪談原則

### 不問顯而易見的問題

專注於**用戶沒想到**但**會影響實作**的面向：

| 類別 | 問題方向 | 範例 |
|------|---------|------|
| **邊界情況** | 極端輸入、並發、失敗情境 | "如果同時有 100 個請求進來？" |
| **未定義行為** | spec 沒說的部分 | "用戶中途離開，狀態怎麼處理？" |
| **錯誤處理** | 失敗時的 UX | "網路斷線時顯示什麼？能重試嗎？" |
| **狀態管理** | 空狀態、loading、error | "第一次使用時看到什麼？" |
| **Tradeoffs** | 技術選擇的理由 | "為什麼用 X 不用 Y？" |
| **效能考量** | 資料量、響應時間 | "預期多少筆資料？需要分頁嗎？" |
| **整合依賴** | 與其他系統的互動 | "這個需要跟哪些服務溝通？" |
| **安全性** | 權限、驗證、敏感資料 | "誰可以看到這個？需要驗證嗎？" |

### 訪談技巧

1. **一次問 1-2 個問題** - 不要轟炸用戶
2. **追問細節** - "你說的 X 具體是指...?"
3. **挑戰假設** - "如果 Y 不成立呢？"
4. **提供選項** - 用 AskUserQuestion 的 options 讓用戶選擇

---

## 持續條件

持續訪談直到：

- [ ] 所有核心功能都有明確定義
- [ ] 邊界情況都已討論
- [ ] 錯誤處理方式確定
- [ ] 技術決策都有理由
- [ ] 用戶說「夠了」、「完成」、「可以了」

---

## AskUserQuestion 使用範例

```javascript
// 技術選擇
{
  question: "資料儲存方式？",
  header: "Storage",
  options: [
    { label: "本地 SQLite", description: "簡單、離線可用" },
    { label: "遠端 API", description: "多裝置同步" },
    { label: "混合模式", description: "本地快取 + 遠端同步" }
  ]
}

// 功能範圍
{
  question: "需要支援哪些平台？",
  header: "Platform",
  multiSelect: true,
  options: [
    { label: "Web", description: "瀏覽器版本" },
    { label: "iOS", description: "iPhone/iPad" },
    { label: "Android", description: "手機/平板" },
    { label: "Desktop", description: "macOS/Windows" }
  ]
}
```

---

## Spec 輸出格式

訪談完成後，整理成結構化 spec：

```markdown
# [功能名稱] Spec

## Overview
[一句話描述]

## Goals
- [ ] 目標 1
- [ ] 目標 2

## Non-Goals
- 不做什麼

## User Stories
- As a [user], I want to [action] so that [benefit]

## Technical Design

### Data Model
[資料結構]

### API / Interface
[介面定義]

### Dependencies
[依賴項目]

## Edge Cases
| 情境 | 處理方式 |
|------|---------|
| ... | ... |

## Open Questions
- [ ] 待確認事項

## Decision Log
| 決策 | 原因 | 日期 |
|------|------|------|
| 選擇 X | 因為... | YYYY-MM-DD |
```

---

## 快速開始

用戶說「幫我寫 spec」或提供 spec 檔案時：

1. 讀取檔案（如有）
2. 開始訪談：「讓我先了解一些細節...」
3. 持續提問直到完整
4. 整理並寫入 spec
5. 建議下一步（handoff to downstream skill）

---

## Domain-Specific Questions

根據專案類型調整訪談重點：

### Frontend / UI 專案
| 類別 | 問題 |
|------|------|
| 視覺風格 | "希望什麼樣的視覺風格？有參考網站嗎？" |
| 響應式 | "需要支援哪些裝置？mobile-first?" |
| 互動 | "有特別的動畫或互動效果需求嗎？" |
| 狀態 | "loading、empty、error 狀態要怎麼呈現？" |

### Pine Script / 交易策略
| 類別 | 問題 |
|------|------|
| 時間週期 | "主要在什麼時間週期使用？需要 MTF 嗎？" |
| 進出場 | "進場和出場的具體條件是什麼？" |
| 風控 | "止損止盈怎麼設定？固定還是動態？" |
| 重繪 | "可以接受重繪嗎？需要確認訊號？" |

### API / 後端服務
| 類別 | 問題 |
|------|------|
| 資料流 | "資料從哪裡來？要存到哪裡？" |
| 驗證 | "需要什麼認證機制？" |
| 規模 | "預期的 QPS？需要 rate limiting?" |
| 錯誤 | "錯誤如何回報給呼叫方？" |

### n8n Workflow
| 類別 | 問題 |
|------|------|
| 觸發 | "什麼時候觸發？webhook/schedule/manual?" |
| 資料 | "處理什麼格式的資料？需要轉換嗎？" |
| 整合 | "需要連接哪些服務？有 API key 嗎？" |
| 錯誤 | "失敗時要通知誰？怎麼通知？" |

---

## Spec 輸出格式 (Enhanced)

訪談完成後，整理成結構化 spec（加入整合資訊）：

```markdown
# [功能名稱] Spec

> **Created**: YYYY-MM-DD
> **Status**: Draft | Review | Approved
> **Domain**: frontend | pine-script | api | n8n | other

## Overview
[一句話描述]

## Goals
- [ ] 目標 1
- [ ] 目標 2

## Non-Goals
- 不做什麼

## User Stories
- As a [user], I want to [action] so that [benefit]

## Technical Design

### Data Model
[資料結構]

### API / Interface
[介面定義]

### Dependencies
[依賴項目]

## Edge Cases
| 情境 | 處理方式 |
|------|---------|
| ... | ... |

## Open Questions
- [ ] 待確認事項

## Decision Log
| 決策 | 原因 | 日期 |
|------|------|------|
| 選擇 X | 因為... | YYYY-MM-DD |

---

## Next Steps

**Recommended skill**: [根據 domain 建議]
- frontend → `frontend-design`
- pine-script → `pine-developer`
- api → 直接實作
- n8n → `n8n-workflow-patterns`

**Handoff artifacts**:
- `[path]/spec.md`: 本文件

**Implementation priority**:
1. [最重要的功能]
2. [次要功能]
3. [可選功能]
```

---

## Verification

訪談完成的判斷標準：

- [ ] 所有核心功能都有明確定義
- [ ] 邊界情況都已討論
- [ ] 錯誤處理方式確定
- [ ] 技術決策都有理由
- [ ] 已識別下游 skill
- [ ] spec 已寫入檔案
- [ ] 用戶確認完成

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 用戶需求過於模糊 | 繼續追問，不要假設 |
| 技術可行性不確定 | 記錄為 Open Question |
| 需求超出能力範圍 | 建議分階段或簡化 |
| 用戶不願繼續訪談 | 整理已有資訊，標記未完成 |
