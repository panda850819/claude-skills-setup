---
name: n8n-node-config
description: Node configuration and validation. Use when configuring nodes, understanding property dependencies, validating configurations, fixing validation errors, or understanding validation profiles.
allowed-tools: Read, Glob, Grep
---

# n8n Node Configuration & Validation

Expert guidance for node configuration and validation error handling.

---

## Integrations

```
upstream:
  - skill: n8n-workflow-patterns
    receives: workflow 設計中的 node 需求
  - skill: n8n-code
    receives: Code node 設定
  - skill: n8n-expression-syntax
    receives: expression 相關設定

downstream:
  - (終點 - node 設定完成)
```

---

## Out of Scope

- **Workflow 設計** - 用 n8n-workflow-patterns
- **Code 語法** - 用 n8n-code
- **Expression 語法** - 用 n8n-expression-syntax

---

## 核心流程

```
1. 查看 n8n 官方文檔或 knowledge base
   ↓
2. 設定必要欄位
   ↓
3. 在 n8n UI 測試
   ↓
4. 修正錯誤 → 重新測試
   ↓
5. 部署
```

---

## 資源

| 資源 | 用途 |
|------|------|
| `n8n-api/knowledge/common-nodes.md` | 常用節點設定 |
| `n8n-api/knowledge/validation-rules.md` | 驗證規則 |
| n8n 官方文檔 | 完整 node 說明 |
| n8n UI | 實際測試驗證 |

**原則**: 參考知識庫 → 在 UI 測試 → 迭代修正

---

## 驗證 Profile

| Profile | 用途 | 建議 |
|---------|------|------|
| `minimal` | 快速檢查 | 開發中 |
| `runtime` | 部署前驗證 | **推薦** |
| `ai-friendly` | 減少誤報 | AI 生成設定 |
| `strict` | 完整驗證 | 生產環境 |

---

## Operation-Aware 設定

**同一 node，不同 operation = 不同必要欄位**

```javascript
// Slack post message
{ resource: "message", operation: "post", channel: "#general", text: "Hi" }

// Slack update message (不同欄位！)
{ resource: "message", operation: "update", messageId: "123", text: "Updated" }
```

---

## Property Dependencies

欄位會根據其他欄位值顯示/隱藏：

```javascript
// HTTP Request: sendBody 控制 body 顯示
{ method: "POST", sendBody: true }  // → body 欄位出現
{ method: "GET" }                    // → body 欄位隱藏
```

**不確定時**: 用 `get_property_dependencies` 查詢

---

## 常見錯誤類型

| 類型 | 說明 | 修正 |
|------|------|------|
| `missing_required` | 必要欄位缺失 | 補上欄位 |
| `invalid_value` | 值不在允許選項 | 用有效值 |
| `type_mismatch` | 型別錯誤 | 轉換型別 |
| `invalid_expression` | 表達式語法錯 | 檢查 `{{}}` |
| `invalid_reference` | 參照的 node 不存在 | 確認名稱 |

---

## Auto-Sanitization

**系統自動修正 operator 結構**（儲存時執行）

| 情況 | 自動修正 |
|------|----------|
| Binary operator + singleValue | 移除 singleValue |
| Unary operator 無 singleValue | 加入 singleValue: true |
| IF/Switch 缺 metadata | 補齊 conditions.options |

**無法修正**: 斷線連線、分支數不符、損壞狀態

---

## 快速範例

### HTTP POST
```javascript
{
  method: "POST",
  url: "https://api.example.com",
  authentication: "none",
  sendBody: true,
  body: { contentType: "json", content: { name: "test" } }
}
```

### IF 條件
```javascript
{
  conditions: {
    string: [{
      value1: "={{$json.status}}",
      operation: "equals",
      value2: "active"
    }]
  }
}
```

---

## 驗證循環

```
validate → 看錯誤 → 修正 → validate
(平均 23s 思考 + 58s 修正) × 2-3 次
```

**這是正常的！** 不要期望一次通過。

---

## Checklist

- [ ] 用 `get_node_essentials` 開始
- [ ] Operation-aware（不同 op 不同欄位）
- [ ] 用 `runtime` profile 驗證
- [ ] 讀完整錯誤訊息
- [ ] 信任 auto-sanitization

---

## 詳細資源

原始詳細文件保留在：
- `n8n-node-configuration/` - 設定模式、dependencies 詳解
- `n8n-validation-expert/` - 錯誤類型、recovery 策略

---

## Verification

Node 設定完成標準：

- [ ] 參考 knowledge base 或官方文檔確認必要欄位
- [ ] 在 n8n UI 測試通過
- [ ] 無 missing_required 錯誤
- [ ] 無 invalid_value 錯誤

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 驗證一直失敗 | 參考 n8n 官方文檔 |
| 不確定欄位依賴 | 在 n8n UI 中實際操作查看 |
| 複雜設定需求 | 參考 n8n 官方文檔或社群 |
