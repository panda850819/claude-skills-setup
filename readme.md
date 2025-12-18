# Claude Code Plugin 安裝指南

## 快速安裝（在 Claude Code 互動介面中執行）

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

### 3. 確認 settings.json
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

## 我的 Plugin 配置

| Plugin | Marketplace | 用途 |
|--------|-------------|------|
| superpowers | superpowers-marketplace | 核心 skills：TDD、debugging、brainstorming、code-review |
| claude-mem | thedotmack | 跨對話記憶系統 |
| context7 | claude-plugins-official | 即時文件查詢 |

---

## 我的個人 Skills

| Skill | 位置 | 用途 |
|-------|------|------|
| triage | `~/.claude/skills/triage/` | 問題分流：模糊輸入時先問問題確認意圖 |

### 備份個人 Skills
```bash
tar -czvf claude-skills-backup.tar.gz ~/.claude/skills/
```

### 還原個人 Skills
```bash
tar -xzvf claude-skills-backup.tar.gz -C /
```

---

## Superpowers 提供的 Skills（共 14 個）

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

## Claude-mem 提供的 Skills（共 2 個）

| Skill | 用途 |
|-------|------|
| mem-search | 搜尋跨對話記憶 |
| troubleshoot | 診斷 claude-mem 問題 |
