# n8n 常用節點資料庫

## Trigger Nodes

### Webhook
```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "parameters": {
    "httpMethod": "POST",
    "path": "my-webhook",
    "responseMode": "onReceived",
    "responseData": "allEntries"
  }
}
```
**用途**: 接收外部 HTTP 請求

### Schedule Trigger
```json
{
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "parameters": {
    "rule": {
      "interval": [{"field": "hours", "hoursInterval": 1}]
    }
  }
}
```
**用途**: 定時執行

### Manual Trigger
```json
{
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "parameters": {}
}
```
**用途**: 手動觸發測試

---

## Core Nodes

### HTTP Request
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "authentication": "none",
    "options": {}
  }
}
```
**用途**: 呼叫外部 API

### Code (JavaScript)
```json
{
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "parameters": {
    "jsCode": "// 處理資料\nconst items = $input.all();\nreturn items.map(item => ({\n  json: { processed: item.json }\n}));"
  }
}
```
**用途**: 自訂 JavaScript 邏輯

### Set
```json
{
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {"name": "field1", "value": "={{ $json.data }}", "type": "string"}
      ]
    }
  }
}
```
**用途**: 設定/轉換欄位

### IF
```json
{
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "parameters": {
    "conditions": {
      "options": {"caseSensitive": true, "leftValue": "", "typeValidation": "strict"},
      "conditions": [
        {"leftValue": "={{ $json.status }}", "rightValue": "success", "operator": {"type": "string", "operation": "equals"}}
      ],
      "combinator": "and"
    }
  }
}
```
**用途**: 條件分支

### Switch
```json
{
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "parameters": {
    "mode": "rules",
    "rules": {
      "rules": [
        {"output": 0, "conditions": {"conditions": [{"leftValue": "={{ $json.type }}", "rightValue": "A", "operator": {"type": "string", "operation": "equals"}}]}}
      ]
    }
  }
}
```
**用途**: 多條件分支

### Merge
```json
{
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "parameters": {
    "mode": "combine",
    "combinationMode": "mergeByPosition"
  }
}
```
**用途**: 合併多個輸入

---

## Data Nodes

### Google Sheets
```json
{
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.5,
  "parameters": {
    "operation": "append",
    "documentId": {"__rl": true, "value": "SPREADSHEET_ID", "mode": "id"},
    "sheetName": {"__rl": true, "value": "Sheet1", "mode": "name"},
    "columns": {
      "mappingMode": "defineBelow",
      "value": {"Column1": "={{ $json.field1 }}"}
    }
  },
  "credentials": {"googleSheetsOAuth2Api": {"id": "CREDENTIAL_ID", "name": "Google Sheets"}}
}
```
**用途**: 讀寫 Google Sheets

### Postgres
```json
{
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 2.5,
  "parameters": {
    "operation": "select",
    "query": "SELECT * FROM users WHERE id = $1",
    "options": {}
  },
  "credentials": {"postgres": {"id": "CREDENTIAL_ID", "name": "Postgres"}}
}
```
**用途**: 資料庫操作

---

## Communication Nodes

### Telegram
```json
{
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2,
  "parameters": {
    "operation": "sendMessage",
    "chatId": "CHAT_ID",
    "text": "={{ $json.message }}",
    "additionalFields": {"parse_mode": "Markdown"}
  },
  "credentials": {"telegramApi": {"id": "CREDENTIAL_ID", "name": "Telegram"}}
}
```
**用途**: 發送 Telegram 訊息

### Slack
```json
{
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "parameters": {
    "operation": "post",
    "channel": "#general",
    "text": "={{ $json.message }}",
    "otherOptions": {}
  },
  "credentials": {"slackApi": {"id": "CREDENTIAL_ID", "name": "Slack"}}
}
```
**用途**: 發送 Slack 訊息

### Email (Gmail)
```json
{
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "parameters": {
    "operation": "send",
    "sendTo": "user@example.com",
    "subject": "Test Email",
    "message": "={{ $json.body }}",
    "options": {}
  },
  "credentials": {"gmailOAuth2": {"id": "CREDENTIAL_ID", "name": "Gmail"}}
}
```
**用途**: 發送 Email

---

## AI Nodes (n8n-nodes-langchain)

### AI Agent
```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 1.7,
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.query }}",
    "options": {"systemMessage": "You are a helpful assistant."}
  }
}
```
**用途**: AI 代理

### OpenAI Chat Model
```json
{
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "typeVersion": 1,
  "parameters": {
    "model": "gpt-4o-mini",
    "options": {"temperature": 0.7}
  },
  "credentials": {"openAiApi": {"id": "CREDENTIAL_ID", "name": "OpenAI"}}
}
```
**用途**: OpenAI 語言模型

---

## 節點位置計算

### 標準間距
- 水平間距: 200-250px
- 垂直間距: 150-200px

### 起始位置
```javascript
const startX = 250;
const startY = 300;
const nodeSpacing = 250;

// 第 N 個節點位置
const position = [startX + (n * nodeSpacing), startY];
```

---

## 連接格式

### 基本連接
```json
{
  "NodeA": {
    "main": [[{"node": "NodeB", "type": "main", "index": 0}]]
  }
}
```

### IF 節點連接
```json
{
  "IF": {
    "main": [
      [{"node": "TrueHandler", "type": "main", "index": 0}],
      [{"node": "FalseHandler", "type": "main", "index": 0}]
    ]
  }
}
```

### AI 連接
```json
{
  "OpenAI Chat Model": {
    "ai_languageModel": [[{"node": "AI Agent", "type": "ai_languageModel", "index": 0}]]
  }
}
```
