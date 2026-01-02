# n8n API Skill

直接呼叫 n8n REST API，不依賴 MCP。

## 設定

### API Key 來源
> **重要**: API Key 應從 `~/.zshrc` 讀取，而非 config.env（容易過期）

```bash
# 正確方式 - 從 zshrc 讀取
source ~/.zshrc 2>/dev/null
echo "N8N_API_KEY: ${N8N_API_KEY:0:20}..."

# N8N_API_URL 可從 config.env 讀取
N8N_API_URL="https://n8n.pdzeng.com"
```

### 測試連線
```bash
curl -s "${N8N_API_URL}/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" | jq '.data[0].name'
```

---

## API 端點參考

### Base URL
```
https://n8n.pdzeng.com/api/v1
```

### 認證
```bash
-H "X-N8N-API-KEY: $N8N_API_KEY"
```

---

## Workflows API

### 列出所有 Workflows
```bash
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 取得單一 Workflow
```bash
curl -s -X GET "$N8N_API_URL/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 建立 Workflow
```bash
curl -s -X POST "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Workflow",
    "nodes": [...],
    "connections": {...}
  }' | jq
```

### 更新 Workflow
```bash
curl -s -X PUT "$N8N_API_URL/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "nodes": [...],
    "connections": {...},
    "settings": {...}
  }' | jq
```

> **重要**: PUT 請求只傳必要欄位：`name`, `nodes`, `connections`, `settings`
> 傳太多欄位（如 `createdAt`, `updatedAt`）會回傳 400 Bad Request

### 更新 Code Node 程式碼（推薦用 Python）

Shell 無法正確處理 JavaScript 中的換行和特殊字元，用 Python 更安全：

```python
import json, urllib.request, os

api_key = os.environ.get('N8N_API_KEY')
url = "https://n8n.pdzeng.com/api/v1/workflows/{workflow_id}"

# 1. 取得現有 workflow
req = urllib.request.Request(url, headers={"X-N8N-API-KEY": api_key})
with urllib.request.urlopen(req) as response:
    workflow = json.loads(response.read())

# 2. 修改指定 node 的程式碼
new_code = r'''
const input = $input.first().json;
// ... 你的新程式碼 ...
return [{ json: { result: "ok" } }];
'''

for node in workflow['nodes']:
    if node['name'] == '目標節點名稱':
        node['parameters']['jsCode'] = new_code
        break

# 3. 只傳必要欄位
update_payload = {
    "name": workflow["name"],
    "nodes": workflow["nodes"],
    "connections": workflow["connections"],
    "settings": workflow["settings"]
}

# 4. PUT 更新
data = json.dumps(update_payload).encode('utf-8')
req = urllib.request.Request(url, data=data, method='PUT', headers={
    "X-N8N-API-KEY": api_key,
    "Content-Type": "application/json"
})
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read())
    print(f"Updated: {result.get('name')}")
```

> **Tip**: 用 `r'''...'''` 定義 JavaScript 程式碼可避免 escape 問題

### 刪除 Workflow
```bash
curl -s -X DELETE "$N8N_API_URL/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 啟用 Workflow
```bash
curl -s -X POST "$N8N_API_URL/api/v1/workflows/{id}/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 停用 Workflow
```bash
curl -s -X POST "$N8N_API_URL/api/v1/workflows/{id}/deactivate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

---

## Executions API

### 列出執行紀錄
```bash
# 所有執行
curl -s -X GET "$N8N_API_URL/api/v1/executions" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq

# 指定 workflow
curl -s -X GET "$N8N_API_URL/api/v1/executions?workflowId={id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq

# 只看失敗
curl -s -X GET "$N8N_API_URL/api/v1/executions?status=error" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 取得執行詳情
```bash
curl -s -X GET "$N8N_API_URL/api/v1/executions/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 刪除執行紀錄
```bash
curl -s -X DELETE "$N8N_API_URL/api/v1/executions/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

---

## Webhook 測試

### 觸發 Webhook
```bash
curl -s -X POST "$N8N_API_URL/webhook/{path}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' | jq
```

### 觸發 Test Webhook (開發模式)
```bash
curl -s -X POST "$N8N_API_URL/webhook-test/{path}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' | jq
```

---

## Templates API (n8n.io)

### 搜尋模板
```bash
curl -s "https://api.n8n.io/api/templates/search?search=telegram" | jq
```

### 取得模板
```bash
curl -s "https://api.n8n.io/api/templates/{id}" | jq
```

### 依類別搜尋
```bash
curl -s "https://api.n8n.io/api/templates/search?category=Marketing" | jq
```

---

## 常用 jq 過濾

### Workflows 狀態摘要
```bash
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | "\(.active | if . then "✅" else "⏸️" end) \(.name)"'
```

### 最近執行（格式化）
```bash
curl -s -X GET "$N8N_API_URL/api/v1/executions?limit=10" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | "\(.status | if . == "success" then "✅" else "❌" end) \(.startedAt | split("T")[1] | split(".")[0]) \(.workflowId)"'
```

### 找 Workflow ID by Name
```bash
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | select(.name | test("apple"; "i")) | .id'
```

---

## 錯誤處理

### 常見錯誤碼
| 錯誤碼 | 說明 | 處理方式 |
|-------|------|---------|
| 401 | API Key 無效 | 檢查 N8N_API_KEY |
| 404 | 資源不存在 | 檢查 workflow/execution ID |
| 400 | 請求格式錯誤 | 檢查 JSON 格式 |
| 500 | 伺服器錯誤 | 檢查 n8n logs |

### 檢查 API 連線
```bash
curl -s -X GET "$N8N_API_URL/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -w "\nHTTP Status: %{http_code}\n"
```

---

## 使用方式

1. 先載入設定：
```bash
source ~/.claude/skills/n8n-api/config.env
```

2. 執行 API 呼叫：
```bash
# 列出 workflows
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data[] | {name, active}'
```

---

## 相關 Skills

- `n8n-quick` - 快速操作指令
- `n8n-nodes` - 節點資料庫
- `n8n-validation` - 驗證規則
