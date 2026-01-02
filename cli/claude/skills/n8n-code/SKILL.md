---
name: n8n-code
description: Write code in n8n Code nodes (JavaScript or Python). Use when writing code in n8n, using $input/_input syntax, making HTTP requests, troubleshooting Code node errors, or choosing Code node modes/languages.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# n8n Code Node

Expert guidance for writing code in n8n Code nodes.

---

## Integrations

```
upstream:
  - skill: n8n-workflow-patterns
    receives: workflow 設計中需要自訂邏輯
  - skill: spec-interviewer
    receives: 需求規格

downstream:
  - skill: n8n-node-config
    produces: Code node 設定供驗證
```

---

## Out of Scope

- **Workflow 設計** - 用 n8n-workflow-patterns
- **Expression 語法** - 用 n8n-expression-syntax
- **Node 設定驗證** - 用 n8n-node-config

---

## Language Selection

| 選擇 | JavaScript | Python (Beta) |
|------|-----------|---------------|
| **推薦度** | 95% 用例 | 特定需求 |
| **HTTP 請求** | `$helpers.httpRequest()` | 需用 HTTP Request node |
| **日期處理** | DateTime (Luxon) | datetime 標準庫 |
| **外部庫** | 無限制 | **僅標準庫** |
| **語法** | `$input`, `$json` | `_input`, `_json` |

**結論**: 預設用 JavaScript，除非有特定 Python 需求。

---

## Quick Start

### JavaScript (推薦)
```javascript
const items = $input.all();
return items.map(item => ({
  json: { ...item.json, processed: true }
}));
```

### Python
```python
items = _input.all()
return [{"json": {**item["json"], "processed": True}} for item in items]
```

---

## 核心規則

1. **Mode**: 用 "Run Once for All Items" (95% 用例)
2. **存取**: `$input.all()` / `_input.all()` 取所有項目
3. **回傳**: 必須是 `[{json: {...}}]` 格式
4. **Webhook**: 資料在 `.body` 下 (`$json.body.field`)

---

## Mode 選擇

| Mode | 用途 | 資料存取 |
|------|------|---------|
| **All Items** (預設) | 聚合、過濾、批次處理 | `$input.all()` |
| **Each Item** | 每項獨立處理 | `$input.item` |

**決策**: 需看多項資料？→ All Items。完全獨立？→ Each Item。不確定？→ All Items。

---

## 資料存取

```javascript
// JS
$input.all()    // 所有項目
$input.first()  // 第一項
$input.item     // Each Item mode
$node["Name"]   // 指定 node

// Python
_input.all()
_input.first()
_input.item
_node["Name"]
```

---

## 常見錯誤

### 1. Webhook body 巢狀
```javascript
// ❌ $json.email
// ✅ $json.body.email
```

### 2. 回傳格式錯誤
```javascript
// ❌ return {json: {}}
// ✅ return [{json: {}}]
```

### 3. 忘記 return
```javascript
// ❌ const result = process();
// ✅ return [{json: result}];
```

### 4. Python 外部庫
```python
# ❌ import requests, pandas, numpy
# ✅ import json, datetime, re, base64, hashlib, statistics
```

---

## JavaScript 專屬功能

### HTTP 請求
```javascript
const response = await $helpers.httpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: { 'Authorization': 'Bearer token' }
});
return [{json: response}];
```

### DateTime (Luxon)
```javascript
const now = DateTime.now();
const tomorrow = now.plus({days: 1});
return [{json: {date: tomorrow.toFormat('yyyy-MM-dd')}}];
```

---

## Python 專屬功能

### 標準庫
```python
from statistics import mean, median
from datetime import datetime
import re, json, base64, hashlib

values = [item["json"]["value"] for item in _input.all()]
return [{"json": {"avg": mean(values), "med": median(values)}}]
```

---

## 常用模式

### 過濾 + 轉換
```javascript
return $input.all()
  .filter(item => item.json.active)
  .map(item => ({json: {id: item.json.id, name: item.json.name}}));
```

### 聚合
```javascript
const items = $input.all();
const total = items.reduce((sum, i) => sum + (i.json.amount || 0), 0);
return [{json: {total, count: items.length}}];
```

### 安全存取
```javascript
const value = item.json?.user?.email || 'default@example.com';
```

---

## Checklist

- [ ] 選對語言 (JS 優先)
- [ ] Mode 選擇正確
- [ ] 有 return 語句
- [ ] 回傳格式 `[{json: {...}}]`
- [ ] Webhook 用 `.body`
- [ ] 處理 null/undefined

---

## 詳細資源

原始詳細文件保留在：
- `n8n-code-javascript/` - JavaScript 完整範例
- `n8n-code-python/` - Python 完整範例

**何時使用 Code Node**:
- ✅ 複雜轉換、自訂邏輯、聚合計算
- ❌ 簡單映射 (用 Set)、基本過濾 (用 Filter)、條件分支 (用 IF/Switch)

---

## Verification

Code 完成標準：

- [ ] 語言選擇正確 (JS 優先)
- [ ] Mode 選擇正確
- [ ] 有 return 語句
- [ ] 回傳格式 `[{json: {...}}]`
- [ ] 處理 null/undefined
- [ ] 在 n8n 中測試通過

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 需要外部 Python 庫 | **停止** - 改用 JS 或 HTTP Request |
| 複雜錯誤處理 | 加入 try-catch，設定 continueOnFail |
| 效能問題 | 評估是否可用 Split In Batches |
| 資料格式不確定 | 加入 console.log 調試 |
