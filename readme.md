# ai-dev-setup

AI CLI 開發環境快速部署 - 電腦轉移時的最小化設置方案。

支援工具：**Claude Code**、**Gemini CLI**、**Codex CLI**

## 快速開始

```bash
# 完整安裝
make all

# 最小安裝 (core + Claude Code)
make minimal

# 顯示所有可用指令
make help
```

## 目錄結構

```
ai-dev-setup/
├── Makefile                # 主入口
├── README.md
│
├── cli/                    # AI CLI 工具設定
│   ├── claude/             # Claude Code
│   │   ├── skills/         # 個人 skills
│   │   ├── commands/       # 自訂指令
│   │   ├── scripts/        # 輔助腳本
│   │   ├── mcp.json.template
│   │   └── external-skills.txt
│   ├── gemini/             # Gemini CLI
│   │   └── SETUP.md
│   └── codex/              # Codex CLI
│       └── SETUP.md
│
├── core/                   # 核心開發設定
│   ├── git/
│   │   ├── .gitconfig.template
│   │   └── .gitignore_global
│   ├── shell/
│   │   ├── aliases.sh
│   │   └── exports.sh
│   └── tools.txt
│
└── scripts/                # 輔助腳本
    └── (預留)
```

## 主要指令

| 指令 | 說明 |
|------|------|
| `make all` | 完整安裝所有工具 |
| `make minimal` | 最小安裝 (core + Claude) |
| `make core` | 安裝核心設定 (git + shell + tools) |
| `make claude` | 安裝 Claude Code 設定 |
| `make gemini` | 安裝 Gemini CLI |
| `make codex` | 安裝 Codex CLI |
| `make status` | 檢查安裝狀態 |
| `make backup` | 備份現有設定 |
| `make help` | 顯示說明 |

---

## Claude Code

### Skills 總覽 (37 個)

#### 個人 Skills (20)

| Skill | 說明 |
|-------|------|
| triage | 問題分類、釐清不明確需求 |
| quant-analyst | 量化金融分析、演算法交易 |
| taiwan-health-coach | 台灣在地健康管理、營養追蹤 |
| weekly-digest | 週報整理生成 |
| publish-substack | 發佈到 Substack |
| notebooklm | Google NotebookLM 整合 |
| pdf | PDF 處理工具 |
| prefer-pnpm | 優先使用 pnpm |
| product-management | PRD 撰寫、需求分析 |
| prompt-router | 根據 model-recommendation 路由任務 |
| skill-creator | 建立新 skill |
| skill-discovery | 搜尋 skill marketplace |
| skill-reviewer | 審視 skill 覆蓋率 |
| spec-interviewer | 深度訪談撰寫 spec |
| spec-sync | 驗證 spec/code/test 同步 |
| file-organizer | 智能檔案整理 |
| content-creator | SEO 內容創作 |
| browser-automation | CDP 瀏覽器自動化 |
| image-generator | AI 圖片生成 |
| anthropic-learner | 巡邏 Anthropic 官方資源 |

#### n8n Skills (7)

| Skill | 說明 |
|-------|------|
| n8n-api | n8n API 整合 |
| n8n-code | n8n Code nodes 撰寫 |
| n8n-expression-syntax | n8n 表達式語法驗證 |
| n8n-learner | 巡邏 n8n 官方資源 |
| n8n-node-config | Node 配置驗證 |
| n8n-quick | n8n 快速操作 |
| n8n-workflow-patterns | Workflow 架構模式 |

#### Pine Script Skills (8)

| Skill | 說明 |
|-------|------|
| pine | Pine Script 主入口 |
| pine-developer | 撰寫 Pine Script v6 程式碼 |
| pine-debugger | 除錯與故障排除 |
| pine-backtester | 回測與效能指標 |
| pine-optimizer | 效能與 UX 優化 |
| pine-publisher | 發佈準備與文檔 |
| pine-visualizer | 交易概念分解 |
| pine-workflows | 專案流程模板 |

#### Frontend Skills (2)

| Skill | 說明 |
|-------|------|
| frontend-design | 創意前端設計 |
| frontend-integration | 整合現有 API |

### 自訂指令

| 指令 | 說明 |
|------|------|
| /plugins-status | 顯示 skills 安裝狀態 |
| /ai-review | 執行 Gemini + Codex 程式碼審查 |

### Hooks 設定

```json
{
  "Notification": "afplay 完成音效",
  "PreToolUse": "audit-tool.sh 審計 Bash/Edit/Write",
  "SessionStart": "skill-review-trigger.sh 觸發審視",
  "Stop": "afplay jobs-done 音效",
  "UserPromptSubmit": "prompt-router.sh 模型路由"
}
```

### Scripts

| 腳本 | 說明 |
|------|------|
| ai-review.sh | 多 AI 程式碼審查 |
| audit-tool.sh | 工具使用審計 |
| claude-skills-status.sh | Skills 狀態檢查 |
| mcp-profile.sh | MCP 設定切換 |
| patrol-learners.sh | 巡邏學習者 |
| prompt-router.sh | Prompt 路由 |
| skill-review-trigger.sh | Skill 審視觸發 |

### Plugin 安裝

安裝後需在 Claude Code 中手動執行：

```
/plugin marketplace add obra/superpowers-marketplace
/plugin marketplace add thedotmack/claude-mem
/plugin marketplace add anthropic/claude-plugins-official

/plugin install superpowers@superpowers-marketplace
/plugin install claude-mem@thedotmack
/plugin install context7@claude-plugins-official
```

> Notion plugin 可選安裝：`/plugin install Notion@claude-plugins-official`

### Plugin 提供的 Skills

| Plugin | Skills |
|--------|--------|
| superpowers | brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, receiving-code-review, writing-skills, dispatching-parallel-agents, subagent-driven-development, using-git-worktrees, finishing-a-development-branch, using-superpowers (14) |
| claude-mem | mem-search, troubleshoot (2) |
| context7 | MCP 工具: resolve-library-id, query-docs |

### MCP Server

- **n8n-mcp**: n8n 工作流程整合

---

## Gemini CLI

詳見 `cli/gemini/SETUP.md`

```bash
npm install -g @google/generative-ai-cli
export GEMINI_API_KEY="your-api-key"
```

---

## Codex CLI

共用 Claude Code 的 skills。詳見 `cli/codex/SETUP.md`

```bash
npm install -g @openai/codex
export OPENAI_API_KEY="your-api-key"
```

---

## Core 設定

### Git

- `.gitconfig.template`: aliases, 預設設定
- `.gitignore_global`: 全域忽略檔案

### Shell

安裝後，將以下行加入 `~/.zshrc` 或 `~/.bashrc`:

```bash
source ~/.config/ai-dev/aliases.sh
source ~/.config/ai-dev/exports.sh
```

### 常用 Aliases

```bash
# AI CLI
c='claude'
cc='claude --continue'
g='gemini'
cx='codex'

# Git
gs='git status -sb'
gd='git diff'
ga='git add'
gcm='git commit -m'
gp='git push'
gl='git pull'
```

### 建議工具

```bash
# macOS
brew install git ripgrep fzf fd jq node tree htop curl wget
```

---

## 自訂

### 新增個人 Skill

```bash
mkdir -p cli/claude/skills/my-skill
# 建立 SKILL.md
make claude-skills
```

### 新增外部 Skills

編輯 `cli/claude/external-skills.txt`，加入 Git URL：

```
https://github.com/user/repo.git
```

然後執行：

```bash
make claude-external-skills
```

---

## 備份

```bash
make backup
# 備份檔存在 backups/ 目錄
```

---

## License

MIT
