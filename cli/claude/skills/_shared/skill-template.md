# Skill Template

建立新 skill 時使用此模板，確保與現有架構一致。

---

## 標準 SKILL.md 結構

```markdown
---
name: skill-name
description: [觸發條件描述]。Use when [English triggers]. Triggers on "[中文觸發詞]", "[English triggers]".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill Name

[一句話描述這個 skill 做什麼]

---

## Integrations

```
upstream:
  - skill: [上游 skill]
    receives: [接收什麼]

downstream:
  - skill: [下游 skill]
    produces: [產出什麼]
```

---

## Out of Scope

- **[不做的事 1]** - [原因]
- **[不做的事 2]** - [原因]

---

## When to Use

- [使用場景 1]
- [使用場景 2]
- [使用場景 3]

---

## Workflow / Core Process

```
1. [步驟 1]
   ↓
2. [步驟 2]
   ↓
3. [步驟 3]
```

---

## [Domain-Specific Section]

[根據 skill 類型添加特定內容]

---

## Implementation Checklist

- [ ] [檢查項 1]
- [ ] [檢查項 2]
- [ ] [檢查項 3]

---

## Verification

驗證命令：

```bash
[relevant commands]
```

完成標準：
- [ ] [標準 1]
- [ ] [標準 2]
- [ ] [標準 3]

---

## Safety and Escalation

- **[情況 1]** - [行動]
- **[情況 2]** - [行動]

---

## Handoff Template (Optional)

完成後交接給下游 skill：

```markdown
## Handoff to [downstream-skill]

**From**: [this-skill]
**Artifacts**:
- [產出物 1]

**Next actions**:
1. [下一步 1]
```
```

---

## Sections 說明

| Section | 必要性 | 說明 |
|---------|--------|------|
| Frontmatter | ✅ 必要 | name, description, allowed-tools |
| Integrations | ✅ 建議 | 上下游 skill 關係 |
| Out of Scope | ✅ 建議 | 明確邊界 |
| When to Use | ✅ 建議 | 觸發條件 |
| Workflow | 🔶 視需要 | 複雜流程時使用 |
| Checklist | ✅ 建議 | 實作步驟 |
| Verification | ✅ 建議 | 完成標準 |
| Safety | 🔶 視需要 | 需要人工介入時 |
| Handoff | 🔶 視需要 | 有下游 skill 時 |

---

## 快速建立新 Skill

```bash
# 1. 建立目錄
mkdir -p ~/.claude/skills/[skill-name]

# 2. 複製模板
cp ~/.claude/skills/_shared/skill-template.md ~/.claude/skills/[skill-name]/SKILL.md

# 3. 編輯內容
# 填入具體內容
```

---

## 現有 Skill 風格參考

| Skill | 特點 | 適合參考 |
|-------|------|---------|
| `frontend-design` | 創意導向 + 美學指南 | UI/設計類 |
| `frontend-integration` | 整合導向 + API patterns | 整合類 |
| `spec-interviewer` | 訪談流程 + Domain questions | 探索類 |
| `quant-analyst` | 5 階段驗證 + Red flags | 分析類 |
| `pine-developer` | 技術規範 + Code examples | 開發類 |
| `browser-automation` | 工具箱 + 腳本說明 | 工具類 |

---

## Description 寫法

### 格式

```yaml
description: [中文描述]。Use when [English triggers]. Triggers on "[觸發詞1]", "[觸發詞2]".
```

### 範例

```yaml
# ✅ Good
description: 透過 CDP 控制瀏覽器執行自動化任務。Use when needing to control browser, scrape websites, or automate browser tasks. Triggers on "瀏覽器自動化", "browser automation", "CDP".

# ❌ Bad
description: Browser automation skill.  # 太簡短，沒有觸發詞
```

---

## 與 superpowers:writing-skills 的差異

| 面向 | superpowers | 你的架構 |
|------|-------------|---------|
| 重點 | TDD、測試優先 | 整合、驗證流程 |
| Sections | Overview, When to Use, Core Pattern | + Integrations, Out of Scope, Verification |
| Handoff | 無 | 有標準 Handoff Template |
| 中文 | 純英文 | 中英混合 |
