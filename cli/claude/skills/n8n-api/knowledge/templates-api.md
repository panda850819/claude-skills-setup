# n8n.io Templates API

直接呼叫 n8n.io 的公開 API 搜尋和取得模板。

## Base URL
```
https://api.n8n.io/api/templates
```

---

## 搜尋模板

### 關鍵字搜尋
```bash
curl -s "https://api.n8n.io/api/templates/search?search=telegram&rows=10" | jq
```

### 依類別搜尋
```bash
curl -s "https://api.n8n.io/api/templates/search?category=Marketing" | jq
```

### 依節點搜尋
```bash
curl -s "https://api.n8n.io/api/templates/search?node=n8n-nodes-base.telegram" | jq
```

### 分頁
```bash
curl -s "https://api.n8n.io/api/templates/search?search=ai&rows=20&page=2" | jq
```

---

## 取得模板詳情

### 取得完整模板
```bash
curl -s "https://api.n8n.io/api/templates/{id}" | jq
```

### 取得模板 workflow JSON
```bash
curl -s "https://api.n8n.io/api/templates/{id}" | jq '.workflow'
```

---

## 回應格式

### 搜尋結果
```json
{
  "workflows": [
    {
      "id": 1234,
      "name": "Telegram Bot",
      "description": "A simple Telegram bot",
      "totalViews": 5000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {"username": "author"},
      "nodes": [
        {"type": "n8n-nodes-base.webhook"},
        {"type": "n8n-nodes-base.telegram"}
      ]
    }
  ],
  "totalWorkflows": 100
}
```

### 模板詳情
```json
{
  "id": 1234,
  "name": "Telegram Bot",
  "description": "Full description...",
  "workflow": {
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  },
  "credentials": [
    {"type": "telegramApi", "name": "Telegram API"}
  ]
}
```

---

## 部署模板到 n8n

### 步驟
1. 取得模板 workflow JSON
2. 修改名稱（避免重複）
3. 移除 credential IDs（需要重新設定）
4. 呼叫 n8n API 建立 workflow

### 範例腳本
```bash
# 1. 取得模板
TEMPLATE_ID=1234
TEMPLATE=$(curl -s "https://api.n8n.io/api/templates/$TEMPLATE_ID")

# 2. 提取 workflow 並修改
WORKFLOW=$(echo $TEMPLATE | jq '{
  name: ("Deployed: " + .name),
  nodes: .workflow.nodes,
  connections: .workflow.connections,
  settings: .workflow.settings
}')

# 3. 移除 credential IDs
WORKFLOW=$(echo $WORKFLOW | jq '
  .nodes |= map(
    if .credentials then
      .credentials |= map_values(del(.id))
    else . end
  )
')

# 4. 部署到 n8n
source ~/.claude/skills/n8n-api/config.env
curl -s -X POST "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$WORKFLOW" | jq '{id, name, active}'
```

---

## 常用類別

| 類別 | 說明 |
|-----|------|
| Marketing | 行銷自動化 |
| Sales | 銷售流程 |
| DevOps | 開發運維 |
| IT Ops | IT 運維 |
| Engineering | 軟體工程 |
| Finance | 財務相關 |
| HR | 人資相關 |
| Support | 客戶支援 |
| Building Blocks | 基礎元件 |

---

## jq 過濾範例

### 列出搜尋結果（精簡）
```bash
curl -s "https://api.n8n.io/api/templates/search?search=telegram" | \
  jq -r '.workflows[] | "[\(.id)] \(.name) - \(.totalViews) views"'
```

### 取得模板的節點列表
```bash
curl -s "https://api.n8n.io/api/templates/1234" | \
  jq -r '.workflow.nodes[].type'
```

### 取得需要的 credentials
```bash
curl -s "https://api.n8n.io/api/templates/1234" | \
  jq -r '.credentials[].type'
```
