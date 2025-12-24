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

### 安裝內容

- **個人 Skills**: triage, quant-analyst
- **外部 Skills**: n8n-skills (7 個)
- **自訂指令**: /plugins-status
- **MCP**: n8n-mcp 設定模板

### Plugin 安裝

安裝後需在 Claude Code 中手動執行：

```
/plugin marketplace add obra/superpowers-marketplace
/plugin marketplace add thedotmack/claude-mem
/plugin marketplace add anthropic/claude-plugins-official

/plugin install superpowers@superpowers-marketplace
/plugin install claude-mem@thedotmack
/plugin install context7@claude-plugins-official
/plugin install Notion@claude-plugins-official
```

### Plugin 提供的 Skills

| Plugin | Skills |
|--------|--------|
| superpowers | brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging, verification-before-completion, requesting-code-review, receiving-code-review, writing-skills, dispatching-parallel-agents, subagent-driven-development, using-git-worktrees, finishing-a-development-branch, using-superpowers (14) |
| claude-mem | mem-search, troubleshoot (2) |
| Notion | notion-search, notion-find, notion-create-page, notion-create-task, notion-database-query, notion-create-database-row (6) |
| context7 | MCP 工具: resolve-library-id, get-library-docs |

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
