# Claude Code 完整環境設定指南

一鍵安裝我的 Claude Code 開發環境：Plugins、Skills、MCP Servers。

## 快速安裝

```bash
# 執行自動安裝腳本
bash setup-plugins.sh
```

---

## 目錄

- [Plugins](#plugins)
- [個人 Skills](#個人-skills)
- [外部 Skills](#外部-skills)
- [MCP Servers](#mcp-servers)
- [自訂指令](#自訂指令)
- [手動安裝步驟](#手動安裝步驟)

---

## Plugins

在 Claude Code 互動介面中執行：

### 1. 新增 Marketplaces

```
/plugin marketplace add obra/superpowers-marketplace
/plugin marketplace add thedotmack/claude-mem
/plugin marketplace add anthropic/claude-plugins-official
```

### 2. 安裝 Plugins

```
/plugin install superpowers@superpowers-marketplace
/plugin install claude-mem@thedotmack
/plugin install context7@claude-plugins-official
```

### Plugin 清單

| Plugin | Marketplace | 用途 |
|--------|-------------|------|
| superpowers | superpowers-marketplace | 核心 skills：TDD、debugging、brainstorming、code-review |
| claude-mem | thedotmack | 跨對話記憶系統 |
| context7 | claude-plugins-official | 即時文件查詢（MCP） |

### settings.json

位置：`~/.claude/settings.json`

```json
{
  "enabledPlugins": {
    "claude-mem@thedotmack": true,
    "context7@claude-plugins-official": true,
    "superpowers@superpowers-marketplace": true
  }
}
```

---

## 個人 Skills

位置：`~/.claude/skills/`

| Skill | 用途 |
|-------|------|
| triage | 問題分流：模糊輸入時先確認意圖再行動 |

### 備份與還原

```bash
# 備份
tar -czvf claude-skills-backup.tar.gz ~/.claude/skills/

# 還原
tar -xzvf claude-skills-backup.tar.gz -C /
```

---

## 外部 Skills

### n8n-skills（7 個）

專為 n8n 工作流程開發設計的 skills。

**安裝：**

```bash
git clone https://github.com/czlonkowski/n8n-skills.git /tmp/n8n-skills
cp -r /tmp/n8n-skills/skills/* ~/.claude/skills/
rm -rf /tmp/n8n-skills
```

| Skill | 用途 |
|-------|------|
| n8n-expression-syntax | 表達式語法驗證與修正 |
| n8n-mcp-tools-expert | MCP 工具使用專家指南 |
| n8n-workflow-patterns | 5 種工作流程架構模式 |
| n8n-validation-expert | 驗證錯誤解讀與修復 |
| n8n-node-configuration | 節點設定指南 |
| n8n-code-javascript | Code 節點 JavaScript 模式 |
| n8n-code-python | Code 節點 Python 模式 |

---

## MCP Servers

### n8n-mcp

連接 n8n 實例，管理工作流程。

**設定檔：** `~/.mcp.json`

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

**純文件模式（不需 API）：**

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true"
      }
    }
  }
}
```

---

## 自訂指令

### /plugins-status

檢查所有 plugins 和 skills 安裝狀態。

**設定檔案：**

1. `~/.claude/commands/plugins-status.md`
2. `~/.claude/scripts/claude-skills-status.sh`

使用方式：在 Claude Code 中輸入 `/plugins-status`

---

## Superpowers 提供的 Skills（14 個）

| Skill | 觸發時機 |
|-------|----------|
| brainstorming | 創意/功能設計前 |
| writing-plans | 寫實作計畫 |
| executing-plans | 執行計畫 |
| test-driven-development | 實作功能前，TDD 流程 |
| systematic-debugging | 遇到 bug 時 |
| verification-before-completion | 宣稱完成前 |
| requesting-code-review | 完成功能後請求 review |
| receiving-code-review | 收到 review 回饋時 |
| writing-skills | 撰寫新 skill |
| dispatching-parallel-agents | 平行派發 agents |
| subagent-driven-development | 用 subagent 開發 |
| using-git-worktrees | Git worktree 隔離 |
| finishing-a-development-branch | 完成開發分支 |
| using-superpowers | 如何使用 skills |

## Claude-mem 提供的 Skills（2 個）

| Skill | 用途 |
|-------|------|
| mem-search | 搜尋跨對話記憶 |
| troubleshoot | 診斷 claude-mem 問題 |

---

## 手動安裝步驟

如果自動腳本無法使用，依序執行：

### 1. 建立目錄結構

```bash
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/commands
mkdir -p ~/.claude/scripts
```

### 2. 安裝個人 Skills

```bash
# 複製本 repo 中的 skills
cp -r ./skills/* ~/.claude/skills/
```

### 3. 安裝 n8n-skills

```bash
git clone https://github.com/czlonkowski/n8n-skills.git /tmp/n8n-skills
cp -r /tmp/n8n-skills/skills/* ~/.claude/skills/
rm -rf /tmp/n8n-skills
```

### 4. 設定 MCP

```bash
# 編輯 ~/.mcp.json，加入 n8n-mcp 設定
```

### 5. 部署自訂指令

```bash
cp ./claude-skills-status.sh ~/.claude/scripts/
chmod +x ~/.claude/scripts/claude-skills-status.sh
cp ./commands/plugins-status.md ~/.claude/commands/
```

### 6. 重新啟動 Claude Code

---

## 檔案結構

```
~/.claude/
├── settings.json          # Plugin 設定
├── skills/                 # 個人 + 外部 Skills
│   ├── triage/
│   ├── n8n-code-javascript/
│   ├── n8n-code-python/
│   ├── n8n-expression-syntax/
│   ├── n8n-mcp-tools-expert/
│   ├── n8n-node-configuration/
│   ├── n8n-validation-expert/
│   └── n8n-workflow-patterns/
├── commands/               # 自訂指令
│   └── plugins-status.md
└── scripts/                # 腳本
    └── claude-skills-status.sh

~/.mcp.json                 # MCP Server 設定
```

---

## 驗證安裝

```bash
# 執行狀態檢查腳本
~/.claude/scripts/claude-skills-status.sh

# 或在 Claude Code 中
/plugins-status
```
