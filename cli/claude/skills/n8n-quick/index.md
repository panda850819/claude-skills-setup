# n8n Quick Operations

n8n 快速操作 skill，使用直接 API 呼叫。

> **API Mode**: 使用直接 API 呼叫（不依賴 MCP）
> **API Key**: 從 `~/.zshrc` 讀取 `N8N_API_KEY`
> **Knowledge**: `~/.claude/skills/n8n-api/knowledge/`

## 觸發條件

- 用戶說：n8n, workflow, 工作流
- 想要快速操作、查詢、除錯 n8n workflows

## API 設定

```bash
# API Key 從 ~/.zshrc 讀取（不是 config.env，那個容易過期）
source ~/.zshrc 2>/dev/null
N8N_API_URL="https://n8n.pdzeng.com"
```

---

## 指令總覽

### 基本操作
| 指令 | 功能 | API 端點 |
|-----|------|---------|
| `n8n status` | 列出所有 workflows 狀態 | `GET /workflows` |
| `n8n activate <name>` | 啟用 workflow | `POST /workflows/{id}/activate` |
| `n8n deactivate <name>` | 停用 workflow | `POST /workflows/{id}/deactivate` |
| `n8n test <name>` | 測試 webhook | `POST /webhook/{path}` |
| `n8n health` | 檢查連線狀態 | `GET /workflows?limit=1` |
| `n8n update-code <id> <node>` | 更新 Code Node 程式碼 | `PUT /workflows/{id}` |

### 執行紀錄
| 指令 | 功能 | API 端點 |
|-----|------|---------|
| `n8n recent [name]` | 最近執行紀錄 | `GET /executions` |
| `n8n errors [name]` | 顯示失敗的執行 | `GET /executions?status=error` |
| `n8n debug <id>` | 執行錯誤詳情 | `GET /executions/{id}` |

### 搜尋與建立
| 指令 | 功能 | API 端點 |
|-----|------|---------|
| `n8n templates <query>` | 搜尋模板 | `https://api.n8n.io/api/templates/search` |

---

## 詳細用法

### 1. n8n status
列出所有 workflows，按狀態分組。

```bash
source ~/.zshrc 2>/dev/null && N8N_API_URL="https://n8n.pdzeng.com"
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | "\(.active | if . then "✅" else "⏸️" end) \(.name) (id: \(.id))"'
```

輸出格式：
```
📊 n8n Workflows 狀態

✅ Apple Health to Google Sheets (id: abc123)
⏸️ Weekly Publisher (id: def456)
```

### 2. n8n activate / deactivate <name>
啟用或停用 workflow。

```bash
# 先找到 workflow ID
WORKFLOW_ID=$(curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | select(.name | test("apple"; "i")) | .id')

# 啟用
curl -s -X POST "$N8N_API_URL/api/v1/workflows/$WORKFLOW_ID/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"

# 停用
curl -s -X POST "$N8N_API_URL/api/v1/workflows/$WORKFLOW_ID/deactivate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### 3. n8n test <name>
測試 webhook 觸發的 workflow。

```bash
curl -s -X POST "$N8N_API_URL/webhook/{path}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 4. n8n recent / errors
查看執行紀錄。

```bash
# 最近 10 筆執行
curl -s -X GET "$N8N_API_URL/api/v1/executions?limit=10" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | "\(.status | if . == "success" then "✅" else "❌" end) \(.id) \(.startedAt)"'

# 只看失敗的
curl -s -X GET "$N8N_API_URL/api/v1/executions?status=error&limit=10" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 5. n8n debug <execution_id>
查看執行失敗的詳細錯誤資訊。

```bash
curl -s -X GET "$N8N_API_URL/api/v1/executions/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```

### 6. n8n templates <query>
搜尋工作流模板（使用 n8n.io 公開 API）。

```bash
curl -s "https://api.n8n.io/api/templates/search?search=telegram" | \
  jq '.workflows[] | {id, name, description}'
```

### 7. n8n update-code <workflow_id> <node_name>
更新 Code Node 的 JavaScript 程式碼。

> **重要**: 必須用 Python 處理，Shell 無法正確 escape JavaScript 程式碼

```python
# 用法範例：移除過濾邏輯
import json, urllib.request, os

api_key = os.environ.get('N8N_API_KEY')
workflow_id = "ySvk6xSvi8sUDL7w"
node_name = "v3.1 格式處理"
url = f"https://n8n.pdzeng.com/api/v1/workflows/{workflow_id}"

# 取得 workflow
req = urllib.request.Request(url, headers={"X-N8N-API-KEY": api_key})
with urllib.request.urlopen(req) as response:
    workflow = json.loads(response.read())

# 新程式碼（用 r''' 避免 escape 問題）
new_code = r'''
const input = $input.first().json;
// 你的新邏輯...
return [{ json: { filtered: false, message: "ok" } }];
'''

# 更新指定 node
for node in workflow['nodes']:
    if node['name'] == node_name:
        node['parameters']['jsCode'] = new_code
        break

# 只傳必要欄位（重要！傳太多會 400 Bad Request）
update_payload = {
    "name": workflow["name"],
    "nodes": workflow["nodes"],
    "connections": workflow["connections"],
    "settings": workflow["settings"]
}

# PUT 更新
data = json.dumps(update_payload).encode('utf-8')
req = urllib.request.Request(url, data=data, method='PUT', headers={
    "X-N8N-API-KEY": api_key,
    "Content-Type": "application/json"
})
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read())
    print(f"✅ Updated: {result.get('name')}")
```

---

## 名稱模糊匹配

當用戶輸入 workflow 名稱時，用 jq 過濾：

```bash
# 不分大小寫搜尋
curl -s -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | \
  jq -r '.data[] | select(.name | test("apple"; "i")) | "\(.id) \(.name)"'
```

---

## 快速診斷流程

當 workflow 出問題時：

```bash
# 1. 找到失敗的執行
curl -s "$N8N_API_URL/api/v1/executions?status=error&limit=5" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data[] | {id, workflowId, stoppedAt}'

# 2. 看錯誤詳情
curl -s "$N8N_API_URL/api/v1/executions/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data.resultData'

# 3. 取得 workflow 設定
curl -s "$N8N_API_URL/api/v1/workflows/{id}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq

# 4. 重新測試
curl -s -X POST "$N8N_API_URL/webhook/{path}" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 已知限制

### n8n Public API 不支援的功能

| 功能 | 狀態 | 替代方案 |
|-----|------|---------|
| 節點搜尋 | ❌ | 參考 `n8n-api/knowledge/common-nodes.md` |
| 節點驗證 | ❌ | 參考 `n8n-api/knowledge/validation-rules.md` |
| Workflow 驗證 | ❌ | 在 n8n UI 測試 |
| 自動修復 | ❌ | 手動修正 |
| 版本管理 | ❌ | 需在 n8n UI 操作 |
| Credentials 管理 | ❌ | 需在 n8n UI 設定 |
| Code Node 更新 | ⚠️ | 用 Python（見 `n8n update-code`） |

---

## 常見問題

### API Key 401 Unauthorized
```bash
# 檢查 key 是否有效
echo "Key: ${N8N_API_KEY:0:20}..."
curl -s "https://n8n.pdzeng.com/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" | jq '.message // "OK"'
```
> 如果失效，更新 `~/.zshrc` 中的 `N8N_API_KEY`

### PUT 400 Bad Request
更新 workflow 時只傳必要欄位：
- ✅ `name`, `nodes`, `connections`, `settings`
- ❌ `createdAt`, `updatedAt`, `id`, `versionId`, `shared`, `tags`, etc.

### Shell 無法更新 Code Node
JavaScript 程式碼包含換行、引號、特殊字元，shell 無法正確 escape。
**解法**: 用 Python 處理 JSON（見 `n8n update-code`）

---

## 相關 Skills

- `n8n-api` - API 端點詳細文檔
- `n8n-workflow-patterns` - Workflow 設計模式
- `n8n-code` - Code Node 語法
- `n8n-expression-syntax` - Expression 語法
