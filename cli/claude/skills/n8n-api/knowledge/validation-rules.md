# n8n Workflow 驗證規則

## 基本結構驗證

### 必要欄位
```javascript
// Workflow 必須有
{
  "name": "string (必要)",
  "nodes": "array (必要)",
  "connections": "object (必要)"
}

// 每個 Node 必須有
{
  "id": "string (必要)",
  "name": "string (必要，唯一)",
  "type": "string (必要)",
  "typeVersion": "number (必要)",
  "position": "[x, y] array (必要)",
  "parameters": "object (必要，可以是空物件)"
}
```

---

## 常見錯誤

### 1. Expression 格式錯誤
**錯誤**: `$json.field`
**正確**: `={{ $json.field }}`

```javascript
// 檢查 expression
const isValidExpression = (value) => {
  if (typeof value !== 'string') return true;
  if (value.includes('$json') || value.includes('$node')) {
    return value.startsWith('={{') && value.endsWith('}}');
  }
  return true;
};
```

### 2. typeVersion 不匹配
**問題**: 使用過舊或不存在的版本
**解決**: 查詢節點支援的版本

常用節點最新版本：
| 節點 | 最新版本 |
|-----|---------|
| webhook | 2 |
| httpRequest | 4.2 |
| code | 2 |
| set | 3.4 |
| if | 2 |
| switch | 3 |
| googleSheets | 4.5 |
| telegram | 1.2 |
| slack | 2.2 |

### 3. 連接錯誤
**問題**: 連接到不存在的節點
**解決**: 確認所有連接的節點都存在

```javascript
// 驗證連接
const validateConnections = (nodes, connections) => {
  const nodeNames = nodes.map(n => n.name);
  const errors = [];

  for (const [source, targets] of Object.entries(connections)) {
    if (!nodeNames.includes(source)) {
      errors.push(`Source node "${source}" not found`);
    }
    for (const outputs of Object.values(targets)) {
      for (const output of outputs) {
        for (const connection of output) {
          if (!nodeNames.includes(connection.node)) {
            errors.push(`Target node "${connection.node}" not found`);
          }
        }
      }
    }
  }
  return errors;
};
```

### 4. IF 節點 conditions 格式
**問題**: 缺少 options 結構
**正確格式**:
```json
{
  "conditions": {
    "options": {
      "caseSensitive": true,
      "leftValue": "",
      "typeValidation": "strict"
    },
    "conditions": [
      {
        "leftValue": "={{ $json.status }}",
        "rightValue": "success",
        "operator": {
          "type": "string",
          "operation": "equals"
        }
      }
    ],
    "combinator": "and"
  }
}
```

### 5. Credential ID 問題
**問題**: credential ID 不存在或無效
**解決**: 部署時移除 credential ID，在 UI 重新設定

```javascript
// 移除 credential IDs
const cleanCredentials = (nodes) => {
  return nodes.map(node => {
    if (node.credentials) {
      node.credentials = Object.fromEntries(
        Object.entries(node.credentials).map(([key, value]) => {
          const { id, ...rest } = value;
          return [key, rest];
        })
      );
    }
    return node;
  });
};
```

---

## 自動修復規則

### Expression 修復
```javascript
const fixExpression = (value) => {
  if (typeof value !== 'string') return value;
  // 檢測未包裝的 expression
  if (value.includes('$json') && !value.startsWith('={{')) {
    return `={{ ${value} }}`;
  }
  return value;
};
```

### TypeVersion 升級
```javascript
const latestVersions = {
  'n8n-nodes-base.webhook': 2,
  'n8n-nodes-base.httpRequest': 4.2,
  'n8n-nodes-base.code': 2,
  'n8n-nodes-base.set': 3.4,
  'n8n-nodes-base.if': 2,
  'n8n-nodes-base.switch': 3,
  'n8n-nodes-base.googleSheets': 4.5
};

const upgradeTypeVersion = (node) => {
  const latest = latestVersions[node.type];
  if (latest && node.typeVersion < latest) {
    node.typeVersion = latest;
  }
  return node;
};
```

### 清理無效連接
```javascript
const cleanConnections = (nodes, connections) => {
  const nodeNames = new Set(nodes.map(n => n.name));
  const cleaned = {};

  for (const [source, targets] of Object.entries(connections)) {
    if (!nodeNames.has(source)) continue;

    cleaned[source] = {};
    for (const [type, outputs] of Object.entries(targets)) {
      cleaned[source][type] = outputs.map(output =>
        output.filter(conn => nodeNames.has(conn.node))
      );
    }
  }
  return cleaned;
};
```

---

## 驗證清單

### 部署前檢查
- [ ] 所有 expression 使用 `={{ }}` 格式
- [ ] 所有節點有唯一的 name
- [ ] 所有連接指向存在的節點
- [ ] typeVersion 是有效的版本
- [ ] 必要的 parameters 都有值
- [ ] credentials 設定正確

### 執行前檢查
- [ ] Webhook 有正確的 path
- [ ] HTTP Request 有有效的 URL
- [ ] 條件節點有完整的 conditions
- [ ] 迴圈不會無限執行

---

## 錯誤訊息對照

| 錯誤訊息 | 原因 | 修復方式 |
|---------|------|---------|
| `request/body must have required property 'name'` | 缺少 name | 加入 name 欄位 |
| `request/body must have required property 'nodes'` | 缺少 nodes | 加入 nodes 陣列 |
| `Expression is invalid` | Expression 格式錯誤 | 使用 `={{ }}` 包裝 |
| `Node type not found` | 節點類型不存在 | 檢查 type 名稱 |
| `Credential not found` | Credential ID 無效 | 在 UI 重新設定 |
