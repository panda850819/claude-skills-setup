---
name: skill-creator
description: 建立符合本地架構的新 skill。Use when creating new skills, "建立 skill", "create skill", "新增 skill", "寫一個 skill". Follows local conventions with Integrations, Verification, and Handoff sections.
allowed-tools: Read, Write, Edit, Bash, Glob, AskUserQuestion
---

# Skill Creator

建立符合本地架構的新 skill，包含 Integrations、Verification、Safety 等標準 sections。

---

## Integrations

```
upstream:
  - skill: spec-interviewer
    receives: 需求規格

downstream:
  - skill: skill-reviewer
    produces: 新建的 skill 供審查
```

---

## Out of Scope

- **Skill 內容撰寫** - 只建立結構，內容由用戶填寫
- **Skill 測試** - 用 skill-reviewer
- **Plugin 開發** - 這是本地 skill，不是 plugin

---

## 建立流程

```
1. 需求探索
   ↓ AskUserQuestion 確認用途
2. 選擇模板類型
   ↓ 根據用途選擇參考 skill
3. 建立目錄和檔案
   ↓ mkdir + 複製模板
4. 填入內容
   ↓ 根據需求客製化
5. 驗證結構
   ↓ 確認必要 sections
6. 測試觸發
   → 確認 description 正確觸發
```

---

## Step 1: 需求探索

詢問用戶：

```javascript
{
  question: "這個 skill 主要用途是什麼？",
  header: "用途",
  options: [
    { label: "開發/實作", description: "寫程式碼、建立功能" },
    { label: "分析/探索", description: "研究、調查、分析數據" },
    { label: "整合/串接", description: "連接 API、整合服務" },
    { label: "工具/自動化", description: "腳本、自動化任務" }
  ]
}
```

---

## Step 2: 選擇參考模板

| 用途 | 參考 Skill | 特點 |
|------|-----------|------|
| 開發/實作 | `pine-developer` | 技術規範、Code examples |
| 分析/探索 | `quant-analyst` | 驗證框架、Red flags |
| 整合/串接 | `frontend-integration` | API patterns、State handling |
| 工具/自動化 | `browser-automation` | 腳本說明、故障排除 |
| 需求探索 | `spec-interviewer` | 訪談流程、Domain questions |
| 創意設計 | `frontend-design` | 美學指南、設計原則 |

---

## Step 3: 建立結構

```bash
# 建立目錄
mkdir -p ~/.claude/skills/[skill-name]

# 如有腳本
mkdir -p ~/.claude/skills/[skill-name]/scripts

# 如有參考資料
mkdir -p ~/.claude/skills/[skill-name]/references
```

---

## Step 4: 必要 Sections

### 基礎（必要）

```markdown
---
name: skill-name
description: [描述]。Use when [triggers]. Triggers on "[觸發詞]".
allowed-tools: [工具列表]
---

# Skill Name

[一句話描述]

---

## Integrations

[上下游關係]

---

## Out of Scope

[不做的事]

---

## When to Use

[使用場景]
```

### 流程類

```markdown
## Workflow

[步驟流程]

## Implementation Checklist

[檢查項目]
```

### 驗證類

```markdown
## Verification

[驗證命令和標準]

## Safety and Escalation

[需要停止的情況]
```

### 整合類

```markdown
## Handoff Template

[交接給下游 skill 的格式]
```

---

## Step 5: Description 格式

### 標準格式

```yaml
description: [中文一句話]。Use when [English description]. Triggers on "[詞1]", "[詞2]", "[詞3]".
```

### 觸發詞選擇

| 類別 | 範例 |
|------|------|
| 中文動詞 | "建立", "分析", "生成", "整合" |
| 英文動詞 | "create", "analyze", "generate" |
| 名詞 | "PRD", "API", "Pine Script" |
| 情境 | "when debugging", "before deploy" |

---

## Step 6: 驗證清單

建立完成後檢查：

- [ ] **Frontmatter** - name, description, allowed-tools 完整
- [ ] **Description** - 包含中英文觸發詞
- [ ] **Integrations** - 定義上下游關係
- [ ] **Out of Scope** - 明確邊界
- [ ] **Workflow/Checklist** - 有實作指引
- [ ] **Verification** - 有完成標準
- [ ] **一致性** - 與現有 skills 風格一致

---

## 快速建立命令

```bash
# 一鍵建立（複製模板）
skill_name="[name]"
mkdir -p ~/.claude/skills/$skill_name
cp ~/.claude/skills/_shared/skill-template.md ~/.claude/skills/$skill_name/SKILL.md
echo "Created: ~/.claude/skills/$skill_name/SKILL.md"
```

---

## 範例：建立 "api-tester" skill

### 1. 需求
用途：測試 API endpoints

### 2. 選擇模板
參考：`browser-automation`（工具類）

### 3. 建立

```bash
mkdir -p ~/.claude/skills/api-tester
```

### 4. SKILL.md

```markdown
---
name: api-tester
description: 測試 API endpoints。Use when testing APIs, debugging HTTP requests. Triggers on "測試 API", "test endpoint", "HTTP request", "curl".
allowed-tools: Read, Write, Bash, WebFetch
---

# API Tester

測試和除錯 API endpoints。

---

## Integrations

```
upstream:
  - skill: spec-interviewer
    receives: API 規格

downstream:
  - skill: frontend-integration
    produces: 驗證過的 API 可供前端使用
```

---

## Out of Scope

- **API 設計** - 只測試，不設計
- **效能壓測** - 功能測試為主

---

## When to Use

- 驗證 API endpoint 是否正常
- 除錯 HTTP 請求問題
- 確認 response 格式

---

## Implementation Checklist

- [ ] 確認 endpoint URL
- [ ] 設定 headers 和 auth
- [ ] 發送請求
- [ ] 驗證 response
- [ ] 記錄結果

---

## Verification

測試成功標準：
- [ ] Status code 正確
- [ ] Response body 符合預期
- [ ] 無 timeout 或連接錯誤
```

---

## 與現有 Skill Creators 的關係

| Creator | 用途 | 本 Skill 的價值 |
|---------|------|----------------|
| `superpowers:writing-skills` | TDD 導向、通用 | 本地架構適配 |
| `plugin-dev:skill-development` | Plugin 結構 | 本地架構適配 |
| **`skill-creator`** | **本地架構** | **直接符合你的風格** |

---

## 參考資料

- `~/.claude/skills/_shared/skill-template.md` - 完整模板
- `~/.claude/skills/_shared/skill-integration.md` - 整合指南

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 用途不明確 | 用 AskUserQuestion 確認 |
| 與現有 skill 重疊 | 建議擴展現有 skill |
| 需要特殊權限 | 確認 allowed-tools 設定 |
| Description 觸發不準確 | 調整觸發詞 |
