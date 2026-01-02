---
name: spec-sync
description: 驗證 spec、code、test 三者同步一致。Use after completing a module, when saying "sync spec", "驗證同步", "check consistency", "模組完成", or need to verify documentation matches implementation.
allowed-tools: Read, Glob, Grep, Edit, Write, TodoWrite
---

# Spec Sync

驗證文檔、代碼、測試三者一致性。

---

## Integrations

```
upstream:
  - skill: frontend-design
    receives: 實作完成的 UI 代碼
  - skill: frontend-integration
    receives: 整合完成的代碼
  - skill: pine-developer
    receives: 實作完成的 Pine Script
  - skill: any implementation skill
    receives: 完成的代碼

downstream:
  - skill: spec-interviewer
    produces: 不一致報告 → 需要更新 spec
```

---

## Out of Scope

- **實作功能** - 只驗證，不實作
- **修改 spec** - 只報告不一致，由用戶決定修改方向
- **寫測試** - 只識別測試缺口，不寫測試

---

## 觸發時機

- 完成一個模組/功能後
- 重構代碼後
- 更新 spec 後
- PR review 前

---

## 驗證流程

```
1. 定位相關檔案
   ↓
2. 分析 Spec 描述的功能點
   ↓
3. 掃描 Code 實際實現
   ↓
4. 檢查 Test 覆蓋範圍
   ↓
5. 產出同步報告
   ↓
6. 建議更新項目
```

---

## 三向對照

| 來源 | 檢查項 | 工具 |
|------|--------|------|
| **Spec** | 功能描述、API 定義、行為規範 | Read |
| **Code** | 實際函數、類別、邏輯 | Grep, Glob |
| **Test** | 測試案例、覆蓋的情境 | Grep |

---

## 不一致類型

### Type A: Spec 有，Code 沒有
```
⚠️ 未實現功能
Spec: "支援批量刪除"
Code: 找不到 batch delete 實現
Action: 實現功能 或 更新 Spec 標記為 TODO
```

### Type B: Code 有，Spec 沒有
```
⚠️ 未文檔化功能
Code: handleRetry() 實現重試邏輯
Spec: 沒有提到重試機制
Action: 補充 Spec 或 確認是否需要此功能
```

### Type C: Code 有，Test 沒有
```
⚠️ 測試缺口
Code: validateInput() 有 5 種驗證
Test: 只測了 3 種情況
Action: 補充測試案例
```

### Type D: Spec/Code 不符
```
⚠️ 行為不一致
Spec: "錯誤時返回 null"
Code: throw new Error()
Action: 確認正確行為並統一
```

---

## 輸出報告格式

```markdown
# Spec Sync Report

**模組**: [module name]
**日期**: YYYY-MM-DD
**狀態**: ✅ 同步 | ⚠️ 有差異 | ❌ 嚴重不一致

## 檔案範圍

| 類型 | 檔案 |
|------|------|
| Spec | path/to/spec.md |
| Code | path/to/module.ts |
| Test | path/to/module.test.ts |

## 發現問題

### ⚠️ 未實現功能 (Type A)
- [ ] Spec L45: "支援 CSV 匯出" - 未找到實現

### ⚠️ 未文檔化 (Type B)
- [ ] Code L120: `retryWithBackoff()` - Spec 未提及

### ⚠️ 測試缺口 (Type C)
- [ ] `validateEmail()` 的 edge cases 未測試

### ⚠️ 行為不符 (Type D)
- [ ] Spec: 返回空陣列 vs Code: 返回 null

## 建議行動

1. [ ] 實現 CSV 匯出功能
2. [ ] 補充重試機制到 Spec
3. [ ] 新增 email 驗證測試
4. [ ] 統一空值處理邏輯
```

---

## 使用方式

### 基本用法
```
/spec-sync
（會詢問要檢查的模組）
```

### 指定檔案
```
幫我 sync spec
Spec: docs/api-spec.md
Code: src/api/
Test: tests/api/
```

### 快速檢查
```
驗證 user-auth 模組同步狀態
```

---

## 自動掃描策略

如果沒指定檔案，嘗試自動定位：

```javascript
// 常見對應關係
spec: ["docs/", "specs/", "*.spec.md", "README.md"]
code: ["src/", "lib/", "*.ts", "*.js", "*.py"]
test: ["tests/", "*.test.*", "*.spec.*", "__tests__/"]
```

---

## 與其他 Skills 配合

| Skill | 時機 |
|-------|------|
| `spec-interviewer` | 先用它完善 spec |
| `spec-sync` | 實現後驗證一致性 |
| `superpowers:verification-before-completion` | 最後確認 |

---

## Checklist

同步驗證完成條件：

- [ ] 所有 Spec 功能都有對應 Code
- [ ] 所有 Code 功能都有 Spec 描述
- [ ] 關鍵路徑都有 Test 覆蓋
- [ ] 行為描述與實現一致
- [ ] 報告已產出

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| Spec 與 Code 嚴重不符 | 標記為 ❌，請用戶決定以哪個為準 |
| 發現安全漏洞 | 立即報告，不繼續其他檢查 |
| 測試覆蓋率極低 | 建議補充測試再繼續 |
| 無法定位相關檔案 | 詢問用戶提供檔案路徑 |
